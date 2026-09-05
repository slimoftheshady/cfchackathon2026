from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path
import re
import os
import requests
from model.api_call import identify_plant_from_file, parse_results

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
    {"key": "pixie-mops", "name": "Pixie Mops", "icon": "fa-cannabis", "rarity": "epic", "kind": "plant"},
    {"key": "custard-orchid", "name": "Custard Orchid", "icon": "fa-clover", "rarity": "legendary", "kind": "plant"},
]

# Achievement definitions
ACHIEVEMENTS = {
    'first_plant': {
        'name': 'First Steps',
        'description': 'Grow your first plant',
        'icon': 'fa-seedling',
        'points': 10,
        'max_progress': 1
    },
    'plant_collector_10': {
        'name': 'Plant Collector',
        'description': 'Grow 10 plants',
        'icon': 'fa-leaf',
        'points': 25,
        'max_progress': 10
    },
    'plant_collector_50': {
        'name': 'Botanist',
        'description': 'Grow 50 plants',
        'icon': 'fa-tree',
        'points': 50,
        'max_progress': 50
    },
    'plant_collector_100': {
        'name': 'Master Botanist',
        'description': 'Grow 100 plants',
        'icon': 'fa-crown',
        'points': 100,
        'max_progress': 100
    },
    'rare_collector': {
        'name': 'Rare Finder',
        'description': 'Find your first rare plant',
        'icon': 'fa-gem',
        'points': 30,
        'max_progress': 1
    },
    'rare_collector_5': {
        'name': 'Rare Collector',
        'description': 'Find 5 rare plants',
        'icon': 'fa-gem',
        'points': 50,
        'max_progress': 5
    },
    'epic_collector': {
        'name': 'Epic Seeker',
        'description': 'Find your first epic plant',
        'icon': 'fa-star',
        'points': 50,
        'max_progress': 1
    },
    'epic_collector_3': {
        'name': 'Epic Collector',
        'description': 'Find 3 epic plants',
        'icon': 'fa-star',
        'points': 75,
        'max_progress': 3
    },
    'legendary_collector': {
        'name': 'Legendary Hunter',
        'description': 'Find your first legendary plant',
        'icon': 'fa-crown',
        'points': 100,
        'max_progress': 1
    },
    'legendary_collector_3': {
        'name': 'Legendary Master',
        'description': 'Find 3 legendary plants',
        'icon': 'fa-crown',
        'points': 200,
        'max_progress': 3
    },
    'score_500': {
        'name': '500 Score',
        'description': 'Reach 500 total score',
        'icon': 'fa-medal',
        'points': 50,
        'max_progress': 500
    },
    'score_1000': {
        'name': '1000 Score',
        'description': 'Reach 1000 total score',
        'icon': 'fa-medal',
        'points': 100,
        'max_progress': 1000
    },
    'score_5000': {
        'name': '5000 Score',
        'description': 'Reach 5000 total score',
        'icon': 'fa-trophy',
        'points': 200,
        'max_progress': 5000
    },
    'snap_10': {
        'name': 'Nature Photographer',
        'description': 'Take 10 biodiversity snaps',
        'icon': 'fa-camera',
        'points': 25,
        'max_progress': 10
    },
    'snap_50': {
        'name': 'Wildlife Photographer',
        'description': 'Take 50 biodiversity snaps',
        'icon': 'fa-camera',
        'points': 50,
        'max_progress': 50
    },
    'gacha_10': {
        'name': 'Seed Collector',
        'description': 'Open 10 seed packets',
        'icon': 'fa-gift',
        'points': 30,
        'max_progress': 10
    },
    'gacha_50': {
        'name': 'Seed Master',
        'description': 'Open 50 seed packets',
        'icon': 'fa-gift',
        'points': 60,
        'max_progress': 50
    },
    'garden_full': {
        'name': 'Full Garden',
        'description': 'Fill all 16 garden slots',
        'icon': 'fa-rainbow',
        'points': 50,
        'max_progress': 16
    },
    'complete_collection': {
        'name': 'Complete Collection',
        'description': 'Unlock all plants',
        'icon': 'fa-trophy',
        'points': 500,
        'max_progress': 16  # PLANT_POOL length
    }
}


def get_db():
    con = sqlite3.connect(GAME_DB)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def slugify(name):
    value = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return value[:80] or "item"


def infer_kind(name):
    return (
        "decor"
        if name.lower()
        in {"gnome", "bench", "lamp", "solar lamp", "fountain", "birdhouse", "compost"}
        else "plant"
    )


def init_db():
    with get_db() as db:
        db.executescript("""
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
                snaps_taken INTEGER NOT NULL DEFAULT 0,
                gacha_pulls INTEGER NOT NULL DEFAULT 0,
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

            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                achievement_key TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, achievement_key)
            );

            CREATE INDEX IF NOT EXISTS idx_friendships_requester
                ON friendships(requester_id, status);
            CREATE INDEX IF NOT EXISTS idx_friendships_addressee
                ON friendships(addressee_id, status);
            CREATE INDEX IF NOT EXISTS idx_achievements_user
                ON achievements(user_id, completed);
        """)

        # Migration for databases created by the earlier version.
        plant_columns = {row[1] for row in db.execute("PRAGMA table_info(plants)")}
        if "kind" not in plant_columns:
            db.execute(
                "ALTER TABLE plants ADD COLUMN kind TEXT NOT NULL DEFAULT 'plant'"
            )
        if "item_key" not in plant_columns:
            db.execute("ALTER TABLE plants ADD COLUMN item_key TEXT")

        # Check if game_state needs new columns
        state_columns = {row[1] for row in db.execute("PRAGMA table_info(game_state)")}
        if "snaps_taken" not in state_columns:
            db.execute("ALTER TABLE game_state ADD COLUMN snaps_taken INTEGER NOT NULL DEFAULT 0")
        if "gacha_pulls" not in state_columns:
            db.execute("ALTER TABLE game_state ADD COLUMN gacha_pulls INTEGER NOT NULL DEFAULT 0")

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
        "SELECT points, score, snaps_taken, gacha_pulls, latest_name, latest_rarity FROM game_state WHERE user_id = ?",
        (user_id,),
    ).fetchone()

    if not state:
        db.execute("INSERT INTO game_state(user_id) VALUES (?)", (user_id,))
        state = db.execute(
            "SELECT points, score, snaps_taken, gacha_pulls, latest_name, latest_rarity FROM game_state WHERE user_id = ?",
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
        "snaps_taken": state["snaps_taken"],
        "gacha_pulls": state["gacha_pulls"],
        "latestPlant": (
            {"name": state["latest_name"], "rarity": state["latest_rarity"]}
            if state["latest_name"]
            else None
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


def check_and_update_achievements(db, user_id):
    """Check all achievements and update progress/completion status."""
    # Get current stats
    stats = db.execute(
        """
        SELECT 
            (SELECT COUNT(*) FROM plants WHERE user_id = ?) as plants_grown,
            (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'rare') as rares_found,
            (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'epic') as epics_found,
            (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'legendary') as legendaries_found,
            (SELECT COUNT(*) FROM collection_items WHERE user_id = ?) as total_collection,
            (SELECT COUNT(*) FROM plants WHERE user_id = ? AND slot IS NOT NULL) as placed_plants,
            (SELECT score FROM game_state WHERE user_id = ?) as total_score,
            (SELECT snaps_taken FROM game_state WHERE user_id = ?) as snaps_taken,
            (SELECT gacha_pulls FROM game_state WHERE user_id = ?) as gacha_pulls
        """,
        (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id)
    ).fetchone()

    unlocked_achievements = set()
    new_achievements = []

    # Check each achievement
    for key, defn in ACHIEVEMENTS.items():
        progress = 0
        completed = 0
        
        # Calculate progress based on achievement type
        if key == 'first_plant':
            progress = min(stats['plants_grown'], 1)
            completed = 1 if progress >= 1 else 0
        elif key == 'plant_collector_10':
            progress = min(stats['plants_grown'], 10)
            completed = 1 if progress >= 10 else 0
        elif key == 'plant_collector_50':
            progress = min(stats['plants_grown'], 50)
            completed = 1 if progress >= 50 else 0
        elif key == 'plant_collector_100':
            progress = min(stats['plants_grown'], 100)
            completed = 1 if progress >= 100 else 0
        elif key == 'rare_collector':
            progress = min(stats['rares_found'], 1)
            completed = 1 if progress >= 1 else 0
        elif key == 'rare_collector_5':
            progress = min(stats['rares_found'], 5)
            completed = 1 if progress >= 5 else 0
        elif key == 'epic_collector':
            progress = min(stats['epics_found'], 1)
            completed = 1 if progress >= 1 else 0
        elif key == 'epic_collector_3':
            progress = min(stats['epics_found'], 3)
            completed = 1 if progress >= 3 else 0
        elif key == 'legendary_collector':
            progress = min(stats['legendaries_found'], 1)
            completed = 1 if progress >= 1 else 0
        elif key == 'legendary_collector_3':
            progress = min(stats['legendaries_found'], 3)
            completed = 1 if progress >= 3 else 0
        elif key == 'score_500':
            progress = min(stats['total_score'], 500)
            completed = 1 if progress >= 500 else 0
        elif key == 'score_1000':
            progress = min(stats['total_score'], 1000)
            completed = 1 if progress >= 1000 else 0
        elif key == 'score_5000':
            progress = min(stats['total_score'], 5000)
            completed = 1 if progress >= 5000 else 0
        elif key == 'snap_10':
            progress = min(stats['snaps_taken'], 10)
            completed = 1 if progress >= 10 else 0
        elif key == 'snap_50':
            progress = min(stats['snaps_taken'], 50)
            completed = 1 if progress >= 50 else 0
        elif key == 'gacha_10':
            progress = min(stats['gacha_pulls'], 10)
            completed = 1 if progress >= 10 else 0
        elif key == 'gacha_50':
            progress = min(stats['gacha_pulls'], 50)
            completed = 1 if progress >= 50 else 0
        elif key == 'garden_full':
            progress = min(stats['placed_plants'], 16)
            completed = 1 if progress >= 16 else 0
        elif key == 'complete_collection':
            progress = min(stats['total_collection'], 16)
            completed = 1 if progress >= 16 else 0

        # Update or insert achievement
        existing = db.execute(
            "SELECT id, completed FROM achievements WHERE user_id = ? AND achievement_key = ?",
            (user_id, key)
        ).fetchone()

        if existing:
            if existing['completed'] == 0 and completed == 1:
                # Newly completed!
                new_achievements.append(key)
                db.execute(
                    """
                    UPDATE achievements 
                    SET progress = ?, completed = ?, unlocked_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND achievement_key = ?
                    """,
                    (progress, completed, user_id, key)
                )
                # Add score reward
                db.execute(
                    "UPDATE game_state SET score = score + ? WHERE user_id = ?",
                    (defn['points'], user_id)
                )
            else:
                db.execute(
                    """
                    UPDATE achievements 
                    SET progress = ?
                    WHERE user_id = ? AND achievement_key = ?
                    """,
                    (progress, user_id, key)
                )
        else:
            db.execute(
                """
                INSERT INTO achievements (user_id, achievement_key, progress, completed)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, key, progress, completed)
            )
            if completed:
                new_achievements.append(key)
                db.execute(
                    "UPDATE game_state SET score = score + ? WHERE user_id = ?",
                    (defn['points'], user_id)
                )

    return new_achievements


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/mainscript.js")
def script():
    return send_from_directory(BASE_DIR, "mainscript.js")


@app.get("/icons/<path:filename>")
def icons(filename):
    return send_from_directory(BASE_DIR / "icons", filename)

@app.get("/images/<path:filename>")
def serve_image(filename):
    return send_from_directory(BASE_DIR / "images", filename)

@app.post("/api/identify")
def identify():
    _, error = login_required()
    if error:
        return error

    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify({"error": "Please provide a photo."}), 400

    if image.mimetype not in {"image/jpeg", "image/png", "image/webp"}:
        return jsonify({"error": "Please upload a JPEG, PNG or WebP image."}), 400

    if not os.environ.get("PLANTNET_API_KEY"):
        return jsonify({"error": "Plant identification is not configured yet."}), 503

    image_path = None
    try:
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            image.save(temp_file)
            image_path = temp_file.name

        predictions = parse_results(identify_plant_from_file(image_path))
    except RuntimeError:
        return jsonify({"error": "Plant identification is not configured yet."}), 503
    except requests.HTTPError as exc:
        app.logger.warning(
            "PlantNet rejected identification request: status=%s body=%s",
            exc.response.status_code if exc.response is not None else "unknown",
            exc.response.text[:500] if exc.response is not None else "",
        )
        return (
            jsonify(
                {
                    "error": "PlantNet rejected the identification request. Please check the API key and try again."
                }
            ),
            502,
        )
    except (requests.RequestException, OSError, ValueError):
        return (
            jsonify(
                {"error": "PlantNet could not identify that photo. Please try again."}
            ),
            502,
        )
    finally:
        if image_path:
            Path(image_path).unlink(missing_ok=True)

    if not predictions:
        return jsonify({"error": "PlantNet did not find a plant in that photo."}), 422
    
    # Update snap count
    with get_db() as db:
        db.execute(
            "UPDATE game_state SET snaps_taken = snaps_taken + 1 WHERE user_id = ?",
            (current_user_id(),)
        )
        check_and_update_achievements(db, current_user_id())
    
    return jsonify({"identification": predictions[0], "predictions": predictions})


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if not USERNAME_RE.fullmatch(username):
        return (
            jsonify(
                {"error": "Username must be 3–20 letters, numbers or underscores."}
            ),
            400,
        )
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
                    (
                        user_id,
                        item["key"],
                        item["name"],
                        item["icon"],
                        item["rarity"],
                        item["kind"],
                    ),
                )
                db.execute(
                    """
                    INSERT INTO plants(user_id, slot, item_key, name, icon, rarity, kind)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        slot,
                        item["key"],
                        item["name"],
                        item["icon"],
                        item["rarity"],
                        item["kind"],
                    ),
                )
            
            # Initialize achievements
            for key in ACHIEVEMENTS.keys():
                db.execute(
                    """
                    INSERT OR IGNORE INTO achievements (user_id, achievement_key, progress, completed)
                    VALUES (?, ?, 0, 0)
                    """,
                    (user_id, key)
                )
            
            # Check initial achievements
            check_and_update_achievements(db, user_id)
            
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
        user = db.execute(
            "SELECT id, username FROM users WHERE id = ?", (uid,)
        ).fetchone()
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
                return (
                    jsonify(
                        {"error": "Only unlocked items can be placed in the garden."}
                    ),
                    400,
                )
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
                (
                    uid,
                    item["key"],
                    item["name"],
                    item["icon"],
                    item["rarity"],
                    item["kind"],
                ),
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
                (
                    uid,
                    slot,
                    item["key"],
                    item["name"],
                    item["icon"],
                    item["rarity"],
                    item["kind"],
                ),
            )
        
        # Check achievements after state update
        new_achievements = check_and_update_achievements(db, uid)

    return jsonify({"ok": True, "new_achievements": new_achievements})


@app.get("/api/achievements")
def get_achievements():
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        # Check and update achievements first
        check_and_update_achievements(db, uid)
        
        # Get user's achievement progress
        user_achievements = db.execute(
            """
            SELECT achievement_key, progress, completed, unlocked_at
            FROM achievements
            WHERE user_id = ?
            """,
            (uid,)
        ).fetchall()
        
        # Get user stats
        stats = db.execute(
            """
            SELECT 
                (SELECT COUNT(*) FROM plants WHERE user_id = ?) as plants_grown,
                (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'rare') as rares_found,
                (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'epic') as epics_found,
                (SELECT COUNT(*) FROM collection_items WHERE user_id = ? AND rarity = 'legendary') as legendaries_found,
                (SELECT COUNT(*) FROM collection_items WHERE user_id = ?) as total_collection,
                (SELECT COUNT(*) FROM plants WHERE user_id = ? AND slot IS NOT NULL) as placed_plants,
                (SELECT score FROM game_state WHERE user_id = ?) as total_score,
                (SELECT snaps_taken FROM game_state WHERE user_id = ?) as snaps_taken,
                (SELECT gacha_pulls FROM game_state WHERE user_id = ?) as gacha_pulls
            """,
            (uid, uid, uid, uid, uid, uid, uid, uid, uid)
        ).fetchone()
        
        # Parse achievement progress
        progress_map = {row['achievement_key']: dict(row) for row in user_achievements}
        
        # Calculate achievement status
        achievements = []
        for key, defn in ACHIEVEMENTS.items():
            prog = progress_map.get(key, {'progress': 0, 'completed': 0})
            
            # Calculate current progress based on stats
            current_progress = prog['progress']
            
            achievements.append({
                'key': key,
                'name': defn['name'],
                'description': defn['description'],
                'icon': defn['icon'],
                'points': defn['points'],
                'progress': current_progress,
                'max_progress': defn['max_progress'],
                'completed': bool(prog['completed']),
                'unlocked_at': prog.get('unlocked_at') if prog['completed'] else None
            })
    
    return jsonify({'achievements': achievements})


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
            {
                "id": row["id"],
                "username": row["username"],
                "relation": relation_for(db, uid, row["id"]),
            }
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

    return jsonify(
        {
            "friends": [dict(row) for row in accepted],
            "incoming": [dict(row) for row in incoming],
            "outgoing": [dict(row) for row in outgoing],
        }
    )


@app.get("/api/friends/<int:friend_id>/profile")
def friend_profile(friend_id):
    uid, error = login_required()

    if error:
        return error

    with get_db() as db:
        relation = relation_for(db, uid, friend_id)

        if relation.get("status") != "friends":
            return jsonify({"error": "You can only visit accepted friends."}), 403

        friend = db.execute(
            """
            SELECT id, username
            FROM users
            WHERE id = ?
            """,
            (friend_id,),
        ).fetchone()

        if not friend:
            return jsonify({"error": "Friend not found."}), 404

        state = state_for_user(db, friend_id)

    return jsonify(
        {
            "user": dict(friend),
            "profile": {
                "score": state["score"],
                "latestPlant": state["latestPlant"],
                "placedCount": sum(
                    1 for item in state["gardenSlots"] if item is not None
                ),
                "collectionCount": len(state["collection"]),
                "gardenSlots": state["gardenSlots"],
            },
        }
    )


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