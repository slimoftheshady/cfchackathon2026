from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent
GAME_DB = BASE_DIR / "game.db"

app = Flask(__name__, static_folder=None)
# Change this in production, preferably via an environment variable.
app.secret_key = "dev-change-this-secret-before-deploying"
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")

STARTER_PLANTS = [
    ("Daisy", "fa-leaf", "common"),
    ("Rose", "fa-seedling", "rare"),
    ("Monstera", "fa-cannabis", "epic"),
    ("Golden Lotus", "fa-clover", "legendary"),
]


def get_db():
    con = sqlite3.connect(GAME_DB)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


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
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, slot)
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
    plant_rows = db.execute(
        "SELECT name, icon, rarity FROM plants WHERE user_id = ? ORDER BY slot",
        (user_id,),
    ).fetchall()

    return {
        "points": state["points"],
        "score": state["score"],
        "latestPlant": (
            {"name": state["latest_name"], "rarity": state["latest_rarity"]}
            if state["latest_name"]
            else None
        ),
        "plants": [dict(row) for row in plant_rows],
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
                "INSERT INTO game_state(user_id, points, score, latest_name, latest_rarity) VALUES (?, 240, 0, ?, ?)",
                (user_id, STARTER_PLANTS[-1][0], STARTER_PLANTS[-1][2]),
            )
            for slot, (name, icon, rarity) in enumerate(STARTER_PLANTS):
                db.execute(
                    "INSERT INTO plants(user_id, slot, name, icon, rarity) VALUES (?, ?, ?, ?, ?)",
                    (user_id, slot, name, icon, rarity),
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
    plants = data.get("plants", [])
    latest = data.get("latestPlant")

    try:
        points = int(data.get("points", 0))
        score = int(data.get("score", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid game state."}), 400

    if points < 0 or score < 0 or not isinstance(plants, list) or len(plants) > 16:
        return jsonify({"error": "Invalid game state."}), 400

    cleaned_plants = []
    for plant in plants:
        if not isinstance(plant, dict):
            return jsonify({"error": "Invalid plant data."}), 400
        name = str(plant.get("name", ""))[:60]
        icon = str(plant.get("icon", ""))[:40]
        rarity = str(plant.get("rarity", ""))
        if not name or rarity not in {"common", "rare", "epic", "legendary"}:
            return jsonify({"error": "Invalid plant data."}), 400
        cleaned_plants.append((name, icon, rarity))

    latest_name = None
    latest_rarity = None
    if latest:
        latest_name = str(latest.get("name", ""))[:60] or None
        latest_rarity = str(latest.get("rarity", ""))
        if latest_rarity not in {"common", "rare", "epic", "legendary"}:
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
        db.execute("DELETE FROM plants WHERE user_id = ?", (uid,))
        for slot, (name, icon, rarity) in enumerate(cleaned_plants):
            db.execute(
                "INSERT INTO plants(user_id, slot, name, icon, rarity) VALUES (?, ?, ?, ?, ?)",
                (uid, slot, name, icon, rarity),
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

        users = []
        for row in rows:
            relation = relation_for(db, uid, row["id"])
            users.append({
                "id": row["id"],
                "username": row["username"],
                "relation": relation,
            })

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
            db.execute(
                "UPDATE friendships SET status = 'accepted' WHERE id = ?",
                (rel["request_id"],),
            )
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


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
