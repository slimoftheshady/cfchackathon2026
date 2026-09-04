from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent
GAME_DB = BASE_DIR / "game.db"

app = Flask(__name__, static_folder=None)
app.secret_key = "dev-change-this-secret-before-deploying"
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
VALID_RARITIES = {"common", "rare", "epic", "legendary", "decor"}
VALID_KINDS = {"plant", "decor"}
MAX_GARDEN_SLOTS = 16
MAX_COLLECTION_ITEMS = 40

STARTER_ITEMS = [
    {"key": "kangaroo-paw", "name": "Kangaroo Paw", "icon": "fa-leaf", "rarity": "common", "kind": "plant"},
    {"key": "featherflower", "name": "Featherflower", "icon": "fa-seedling", "rarity": "rare", "kind": "plant"},
    {"key": "pixie-mop", "name": "Pixie Mops", "icon": "fa-cannabis", "rarity": "epic", "kind": "plant"},
    {"key": "custard-orchid", "name": "Custard Orchid", "icon": "fa-clover", "rarity": "legendary", "kind": "plant"},
]


def get_db():
    con = sqlite3.connect(GAME_DB)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def slugify(name):
    value = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return value[:80] or "item"


def infer_kind(name):
    return "decor" if name.lower() in {"gnome", "bench", "lamp", "solar lamp", "fountain", "birdhouse", "compost"} else "plant"


def init_db():
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS game_state (
                user_id INTEGER PRIMARY KEY,
                points INTEGER NOT NULL DEFAULT 240,
                score INTEGER NOT NULL DEFAULT 0,
                latest_name TEXT,
                latest_rarity TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS plants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                slot INTEGER NOT NULL,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                rarity TEXT NOT NULL,
                kind TEXT NOT NULL DEFAULT 'plant',
                item_key TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, slot)
            );

            CREATE TABLE IF NOT EXISTS collection_items (
                user_id INTEGER NOT NULL,
                item_key TEXT NOT NULL,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                rarity TEXT NOT NULL,
                kind TEXT NOT NULL DEFAULT 'plant',
                acquired_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, item_key),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS friendships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                addressee_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending', 'accepted')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
                CHECK(requester_id <> addressee_id),
                UNIQUE(requester_id, addressee_id)
            );

            CREATE INDEX IF NOT EXISTS idx_friendships_requester
                ON friendships(requester_id, status);
            CREATE INDEX IF NOT EXISTS idx_friendships_addressee
                ON friendships(addressee_id, status);
            """
        )

        # Migration for databases created by the earlier version.
        plant_columns = {row[1] for row in db.execute("PRAGMA table_info(plants)")}
        if "kind" not in plant_columns:
            db.execute("ALTER TABLE plants ADD COLUMN kind TEXT NOT NULL DEFAULT 'plant'")
        if "item_key" not in plant_columns:
            db.execute("ALTER TABLE plants ADD COLUMN item_key TEXT")

        # Preserve every currently placed item as an unlocked collection item.
        old_items = db.execute(
            "SELECT DISTINCT user_id, name, icon, rarity FROM plants"
        ).fetchall()
        for row in old_items:
            kind = infer_kind(row["name"])
            key = slugify(row["name"])
            db.execute(
                """
                INSERT OR IGNORE INTO collection_items
                    (user_id, item_key, name, icon, rarity, kind)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (row["user_id"], key, row["name"], row["icon"], row["rarity"], kind),
            )
            db.execute(
                """
                UPDATE plants
                SET item_key = COALESCE(item_key, ?), kind = ?
                WHERE user_id = ? AND name = ?
                """,
                (key, kind, row["user_id"], row["name"]),
            )


def current_user_id():
    return session.get("user_id")


def login_required():
    uid = current_user_id()
    if not uid:
        return None, (jsonify({"error": "Not logged in"}), 401)
    return uid, None


def state_for_user(db, user_id):
    state = db.execute(
        "SELECT points, score, latest_name, latest_rarity FROM game_state WHERE user_id = ?",
        (user_id,),
    ).fetchone()

    if not state:
        db.execute("INSERT INTO game_state(user_id) VALUES (?)", (user_id,))
        state = db.execute(
            "SELECT points, score, latest_name, latest_rarity FROM game_state WHERE user_id = ?",
            (user_id,),
        ).fetchone()

    rows = db.execute(
        """
        SELECT slot, item_key, name, icon, rarity, kind
        FROM plants
        WHERE user_id = ?
        ORDER BY slot
        """,
        (user_id,),
    ).fetchall()

    garden_slots = [None] * MAX_GARDEN_SLOTS
    for row in rows:
        if 0 <= row["slot"] < MAX_GARDEN_SLOTS:
            garden_slots[row["slot"]] = {
                "key": row["item_key"] or slugify(row["name"]),
                "name": row["name"],
                "icon": row["icon"],
                "rarity": row["rarity"],
                "kind": row["kind"] or "plant",
            }

    collection = [
        {
            "key": row["item_key"],
            "name": row["name"],
            "icon": row["icon"],
            "rarity": row["rarity"],
            "kind": row["kind"],
        }
        for row in db.execute(
            """
            SELECT item_key, name, icon, rarity, kind
            FROM collection_items
            WHERE user_id = ?
            ORDER BY CASE rarity
                WHEN 'legendary' THEN 1
                WHEN 'epic' THEN 2
                WHEN 'rare' THEN 3
                WHEN 'common' THEN 4
                ELSE 5 END,
                name
            """,
            (user_id,),
        ).fetchall()
    ]

    return {
        "points": state["points"],
        "score": state["score"],
        "latestPlant": (
            {"name": state["latest_name"], "rarity": state["latest_rarity"]}
            if state["latest_name"] else None
        ),
        "gardenSlots": garden_slots,
        "collection": collection,
    }


def relation_for(db, me, other):
    row = db.execute(
        """
        SELECT id, requester_id, addressee_id, status
        FROM friendships
        WHERE (requester_id = ? AND addressee_id = ?)
           OR (requester_id = ? AND addressee_id = ?)
        LIMIT 1
        """,
        (me, other, other, me),
    ).fetchone()

    if not row:
        return {"status": "none"}
    if row["status"] == "accepted":
        return {"status": "friends"}
    if row["requester_id"] == me:
        return {"status": "outgoing", "request_id": row["id"]}
    return {"status": "incoming", "request_id": row["id"]}


def clean_item(item):
    if not isinstance(item, dict):
        raise ValueError("Invalid item data.")

    name = str(item.get("name", "")).strip()[:60]
    icon = str(item.get("icon", "")).strip()[:40]
    rarity = str(item.get("rarity", "")).strip()
    kind = str(item.get("kind", "plant")).strip()
    key = str(item.get("key", "")).strip()[:80] or slugify(name)

    if not name or not icon or rarity not in VALID_RARITIES or kind not in VALID_KINDS:
        raise ValueError("Invalid item data.")

    return {"key": key, "name": name, "icon": icon, "rarity": rarity, "kind": kind}


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/mainscript.js")
def script():
    return send_from_directory(BASE_DIR, "mainscript.js")


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if not USERNAME_RE.fullmatch(username):
        return jsonify({"error": "Username must be 3–20 letters, numbers or underscores."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    try:
        with get_db() as db:
            cur = db.execute(
                "INSERT INTO users(username, password_hash) VALUES (?, ?)",
                (username, generate_password_hash(password)),
            )
            user_id = cur.lastrowid
            db.execute(
                """
                INSERT INTO game_state(user_id, points, score, latest_name, latest_rarity)
                VALUES (?, 240, 0, ?, ?)
                """,
                (user_id, STARTER_ITEMS[-1]["name"], STARTER_ITEMS[-1]["rarity"]),
            )

            for slot, item in enumerate(STARTER_ITEMS):
                db.execute(
                    """
                    INSERT INTO collection_items
                        (user_id, item_key, name, icon, rarity, kind)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (user_id, item["key"], item["name"], item["icon"], item["rarity"], item["kind"]),
                )
                db.execute(
                    """
                    INSERT INTO plants(user_id, slot, item_key, name, icon, rarity, kind)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (user_id, slot, item["key"], item["name"], item["icon"], item["rarity"], item["kind"]),
                )
    except sqlite3.IntegrityError:
        return jsonify({"error": "That username is already taken."}), 409

    session.clear()
    session["user_id"] = user_id
    return jsonify({"ok": True, "username": username}), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    with get_db() as db:
        user = db.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE",
            (username,),
        ).fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password."}), 401

    session.clear()
    session["user_id"] = user["id"]
    return jsonify({"ok": True, "username": user["username"]})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/me")
def me():
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        user = db.execute("SELECT id, username FROM users WHERE id = ?", (uid,)).fetchone()
        if not user:
            session.clear()
            return jsonify({"error": "Account not found"}), 401
        state = state_for_user(db, uid)

    return jsonify({"user": dict(user), "state": state})


@app.post("/api/state")
def save_state():
    uid, error = login_required()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    latest = data.get("latestPlant")
    garden_slots = data.get("gardenSlots", [])
    collection = data.get("collection", [])

    try:
        points = int(data.get("points", 0))
        score = int(data.get("score", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid game state."}), 400

    if points < 0 or score < 0:
        return jsonify({"error": "Invalid game state."}), 400
    if not isinstance(garden_slots, list) or len(garden_slots) != MAX_GARDEN_SLOTS:
        return jsonify({"error": "Garden must contain exactly 16 slots."}), 400
    if not isinstance(collection, list) or len(collection) > MAX_COLLECTION_ITEMS:
        return jsonify({"error": "Invalid collection."}), 400

    try:
        cleaned_collection = []
        seen_keys = set()
        for item in collection:
            cleaned = clean_item(item)
            if cleaned["key"] not in seen_keys:
                cleaned_collection.append(cleaned)
                seen_keys.add(cleaned["key"])

        cleaned_slots = []
        for item in garden_slots:
            if item is None:
                cleaned_slots.append(None)
                continue
            cleaned = clean_item(item)
            if cleaned["key"] not in seen_keys:
                return jsonify({"error": "Only unlocked items can be placed in the garden."}), 400
            cleaned_slots.append(cleaned)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    latest_name = None
    latest_rarity = None
    if latest:
        latest_name = str(latest.get("name", "")).strip()[:60] or None
        latest_rarity = str(latest.get("rarity", "")).strip()
        if latest_rarity not in VALID_RARITIES:
            latest_name = latest_rarity = None

    with get_db() as db:
        db.execute(
            """
            INSERT INTO game_state(user_id, points, score, latest_name, latest_rarity)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                points = excluded.points,
                score = excluded.score,
                latest_name = excluded.latest_name,
                latest_rarity = excluded.latest_rarity
            """,
            (uid, points, score, latest_name, latest_rarity),
        )

        db.execute("DELETE FROM collection_items WHERE user_id = ?", (uid,))
        for item in cleaned_collection:
            db.execute(
                """
                INSERT INTO collection_items
                    (user_id, item_key, name, icon, rarity, kind)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (uid, item["key"], item["name"], item["icon"], item["rarity"], item["kind"]),
            )

        db.execute("DELETE FROM plants WHERE user_id = ?", (uid,))
        for slot, item in enumerate(cleaned_slots):
            if item is None:
                continue
            db.execute(
                """
                INSERT INTO plants(user_id, slot, item_key, name, icon, rarity, kind)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (uid, slot, item["key"], item["name"], item["icon"], item["rarity"], item["kind"]),
            )

    return jsonify({"ok": True})


@app.get("/api/users/search")
def search_users():
    uid, error = login_required()
    if error:
        return error

    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"users": []})

    with get_db() as db:
        rows = db.execute(
            """
            SELECT id, username
            FROM users
            WHERE id <> ? AND username LIKE ? COLLATE NOCASE
            ORDER BY username
            LIMIT 10
            """,
            (uid, f"%{q}%"),
        ).fetchall()

        users = [
            {"id": row["id"], "username": row["username"], "relation": relation_for(db, uid, row["id"])}
            for row in rows
        ]

    return jsonify({"users": users})


@app.post("/api/friends/request")
def send_friend_request():
    uid, error = login_required()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    try:
        other_id = int(data.get("user_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user."}), 400

    if other_id == uid:
        return jsonify({"error": "You cannot add yourself."}), 400

    with get_db() as db:
        other = db.execute("SELECT id FROM users WHERE id = ?", (other_id,)).fetchone()
        if not other:
            return jsonify({"error": "User not found."}), 404

        rel = relation_for(db, uid, other_id)
        if rel["status"] == "friends":
            return jsonify({"error": "You are already friends."}), 409
        if rel["status"] == "outgoing":
            return jsonify({"error": "Friend request already sent."}), 409
        if rel["status"] == "incoming":
            db.execute("UPDATE friendships SET status = 'accepted' WHERE id = ?", (rel["request_id"],))
            return jsonify({"ok": True, "accepted": True})

        db.execute(
            "INSERT INTO friendships(requester_id, addressee_id, status) VALUES (?, ?, 'pending')",
            (uid, other_id),
        )

    return jsonify({"ok": True}), 201


@app.get("/api/friends")
def list_friends():
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        accepted = db.execute(
            """
            SELECT
                u.id,
                u.username,
                gs.score,
                gs.points,
                gs.latest_name,
                gs.latest_rarity,
                (SELECT COUNT(*) FROM plants p WHERE p.user_id = u.id) AS plant_count
            FROM friendships f
            JOIN users u
              ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
            LEFT JOIN game_state gs ON gs.user_id = u.id
            WHERE f.status = 'accepted'
              AND (f.requester_id = ? OR f.addressee_id = ?)
            ORDER BY u.username
            """,
            (uid, uid, uid),
        ).fetchall()

        incoming = db.execute(
            """
            SELECT f.id AS request_id, u.id AS user_id, u.username
            FROM friendships f
            JOIN users u ON u.id = f.requester_id
            WHERE f.addressee_id = ? AND f.status = 'pending'
            ORDER BY f.created_at
            """,
            (uid,),
        ).fetchall()

        outgoing = db.execute(
            """
            SELECT f.id AS request_id, u.id AS user_id, u.username
            FROM friendships f
            JOIN users u ON u.id = f.addressee_id
            WHERE f.requester_id = ? AND f.status = 'pending'
            ORDER BY f.created_at
            """,
            (uid,),
        ).fetchall()

    return jsonify({
        "friends": [dict(row) for row in accepted],
        "incoming": [dict(row) for row in incoming],
        "outgoing": [dict(row) for row in outgoing],
    })

@app.get("/api/friends/<int:friend_id>/profile")
def friend_profile(friend_id):
    uid, error = login_required()

    if error:
        return error

    with get_db() as db:

        # Only accepted friends are allowed to view each other's gardens.
        relation = relation_for(
            db,
            uid,
            friend_id
        )

        if relation.get("status") != "friends":
            return jsonify({
                "error": "You can only visit accepted friends."
            }), 403

        friend = db.execute(
            """
            SELECT id, username
            FROM users
            WHERE id = ?
            """,
            (friend_id,)
        ).fetchone()

        if not friend:
            return jsonify({
                "error": "Friend not found."
            }), 404

        state = state_for_user(
            db,
            friend_id
        )

    return jsonify({
        "user": dict(friend),

        "profile": {
            "score":
                state["score"],

            "latestPlant":
                state["latestPlant"],

            "placedCount":
                sum(
                    1
                    for item
                    in state["gardenSlots"]
                    if item is not None
                ),

            "collectionCount":
                len(
                    state["collection"]
                ),

            "gardenSlots":
                state["gardenSlots"]
        }
    })

@app.post("/api/friends/accept")
def accept_friend():
    uid, error = login_required()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    try:
        request_id = int(data.get("request_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid request."}), 400

    with get_db() as db:
        cur = db.execute(
            """
            UPDATE friendships
            SET status = 'accepted'
            WHERE id = ? AND addressee_id = ? AND status = 'pending'
            """,
            (request_id, uid),
        )

    if cur.rowcount == 0:
        return jsonify({"error": "Friend request not found."}), 404
    return jsonify({"ok": True})


@app.post("/api/friends/reject")
def reject_friend():
    uid, error = login_required()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    try:
        request_id = int(data.get("request_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid request."}), 400

    with get_db() as db:
        cur = db.execute(
            """
            DELETE FROM friendships
            WHERE id = ? AND addressee_id = ? AND status = 'pending'
            """,
            (request_id, uid),
        )

    if cur.rowcount == 0:
        return jsonify({"error": "Friend request not found."}), 404
    return jsonify({"ok": True})


@app.delete("/api/friends/<int:friend_id>")
def remove_friend(friend_id):
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        cur = db.execute(
            """
            DELETE FROM friendships
            WHERE status = 'accepted'
              AND ((requester_id = ? AND addressee_id = ?)
                OR (requester_id = ? AND addressee_id = ?))
            """,
            (uid, friend_id, friend_id, uid),
        )

    if cur.rowcount == 0:
        return jsonify({"error": "Friend not found."}), 404
    return jsonify({"ok": True})


init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
