from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path
import re
import os
import math
import secrets
import json
from datetime import date, timedelta, timedelta, timedelta, timedelta, timedelta, timedelta, timedelta
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
VALID_ROLES = {"generic", "student", "teacher"}
VALID_QUEST_TYPES = {"manual", "score", "points", "collection", "placed", "snaps"}
TEACHER_INVITE_CODE = "teacher123"
MAX_GARDEN_SLOTS = 16
MAX_COLLECTION_ITEMS = 40
OBSERVATION_RADIUS_METRES = 30
MAX_SAME_PLANT_PER_LOCATION = 3

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250

# A sighting of the same species at least this far from every
# previous sighting counts as finding that species in a new area.
NEW_AREA_RADIUS_METRES = 250
GARDEN_UPGRADES = (
    {"level": 2, "cost": 150, "plots": 6},
    {"level": 3, "cost": 300, "plots": 10},
    {"level": 4, "cost": 500, "plots": 16},
)








DAILY_QUESTS = [
    {
        "key":
            "daily-snap-3",

        "title":
            "Field notes",

        "description":
            "Log 3 accepted biodiversity snaps today.",

        "event":
            "snap",

        "target":
            3,

        "reward":
            40,

        "xp_reward":
            20,
    },

    {
        "key":
            "daily-identify-1",

        "title":
            "One good observation",

        "description":
            "Identify and log any plant today.",

        "event":
            "snap",

        "target":
            1,

        "reward":
            20,

        "xp_reward":
            10,
    },

    {
        "key":
            "daily-gacha",

        "title":
            "Open a seed packet",

        "description":
            "Open one seed packet in the Seed store.",

        "event":
            "gacha",

        "target":
            1,

        "reward":
            25,

        "xp_reward":
            15,
    },
]


WEEKLY_QUESTS = [
    {
        "key":
            "weekly-snaps-10",

        "title":
            "Weekly field survey",

        "description":
            "Log 10 accepted biodiversity snaps this week.",

        "target_type":
            "snaps",

        "target":
            10,

        "reward":
            150,

        "xp_reward":
            100,
    },

    {
        "key":
            "weekly-unique-5",

        "title":
            "Biodiversity sampler",

        "description":
            "Discover 5 different species this week.",

        "target_type":
            "unique_species",

        "target":
            5,

        "reward":
            250,

        "xp_reward":
            150,
    },

    {
        "key":
            "weekly-dailies-3",

        "title":
            "Keep the field notes going",

        "description":
            "Claim rewards from 3 daily quests this week.",

        "target_type":
            "daily_claims",

        "target":
            3,

        "reward":
            200,

        "xp_reward":
            125,
    },
]


COMMUNITY_QUEST = {
    "key":
        "community-nedlands-10000",

    "title":
        "Nedlands biodiversity census",

    "description":
        (
            "Help researchers record 10,000 plant "
            "snaps in the Nedlands region."
        ),

    "target":
        10000,

    "reward":
        350,

    "xp_reward":
        150,

    "milestones":
        [
            {
                "target":
                    target,

                "reward":
                    (
                        75
                        if target < 5000
                        else 150
                        if target < 10000
                        else 350
                    ),

                "xp_reward":
                    (
                        25
                        if target < 5000
                        else 50
                        if target < 10000
                        else 150
                    ),
            }

            for target
            in range(
                1000,
                10001,
                1000,
            )
        ],
}


SPECIAL_QUEST_COIN_REWARD = 50
SPECIAL_QUEST_XP_REWARD = 30


# Wildlife is no longer bought directly.
# Building a habitat permanently unlocks its animal.
HABITATS = {
    "echidna": {
        "name":
            "Echidna Refuge",

        "animal_name":
            "Echidna",

        "animal_icon":
            "icons/echidna.svg",

        "description":
            (
                "Create sheltered ground habitat with "
                "leaf litter and low vegetation for "
                "an echidna to visit."
            ),

        "cost":
            500,

        "player_level":
            3,

        "garden_level":
            3,

        "unique_species":
            3,
    },

    "cockatoo": {
        "name":
            "Cockatoo Canopy",

        "animal_name":
            "Cockatoo",

        "animal_icon":
            "icons/cockatoo.svg",

        "description":
            (
                "Establish a protected canopy habitat "
                "with enough plant diversity to support "
                "visiting woodland birds."
            ),

        "cost":
            450,

        "player_level":
            3,

        "garden_level":
            3,

        "unique_species":
            5,
    },

    "emu": {
        "name":
            "Emu Grassland",

        "animal_name":
            "Emu",

        "animal_icon":
            "icons/emu.svg",

        "description":
            (
                "Open a larger grassland habitat with "
                "space for a roaming emu."
            ),

        "cost":
            650,

        "player_level":
            4,

        "garden_level":
            4,

        "unique_species":
            8,
    },

    "kangaroo": {
        "name":
            "Kangaroo Woodland",

        "animal_name":
            "Kangaroo",

        "animal_icon":
            "icons/kangaroo.svg",

        "description":
            (
                "Build a woodland corridor with enough "
                "plant diversity and open ground for "
                "a kangaroo."
            ),

        "cost":
            800,

        "player_level":
            4,

        "garden_level":
            4,

        "unique_species":
            10,
    },

    "wombat": {
        "name":
            "Wombat Burrow",

        "animal_name":
            "Wombat",

        "animal_icon":
            "icons/wombat.svg",

        "description":
            (
                "Create the game's most advanced ground "
                "habitat, with enough space and vegetation "
                "for a protected burrow."
            ),

        "cost":
            900,

        "player_level":
            5,

        "garden_level":
            5,

        "unique_species":
            12,
    },
}


# Must match the player-level thresholds used by mainscript.js.
PLAYER_LEVEL_XP_THRESHOLDS = [
    (1, 0),
    (2, 100),
    (3, 200),
    (4, 350),
    (5, 550),
    (6, 800),
    (7, 1100),
    (8, 1450),
    (9, 1850),
    (10, 2300),
]


# Wildlife is no longer bought directly.
# Building a habitat permanently unlocks its animal.
HABITATS = {
    "echidna": {
        "name":
            "Echidna Refuge",

        "animal_name":
            "Echidna",

        "animal_icon":
            "icons/echidna.svg",

        "description":
            (
                "Create sheltered ground habitat with "
                "leaf litter and low vegetation for "
                "an echidna to visit."
            ),

        "cost":
            500,

        "player_level":
            3,

        "garden_level":
            3,

        "unique_species":
            3,
    },

    "cockatoo": {
        "name":
            "Cockatoo Canopy",

        "animal_name":
            "Cockatoo",

        "animal_icon":
            "icons/cockatoo.svg",

        "description":
            (
                "Establish a protected canopy habitat "
                "with enough plant diversity to support "
                "visiting woodland birds."
            ),

        "cost":
            450,

        "player_level":
            3,

        "garden_level":
            3,

        "unique_species":
            5,
    },

    "emu": {
        "name":
            "Emu Grassland",

        "animal_name":
            "Emu",

        "animal_icon":
            "icons/emu.svg",

        "description":
            (
                "Open a larger grassland habitat with "
                "space for a roaming emu."
            ),

        "cost":
            650,

        "player_level":
            4,

        "garden_level":
            4,

        "unique_species":
            8,
    },

    "kangaroo": {
        "name":
            "Kangaroo Woodland",

        "animal_name":
            "Kangaroo",

        "animal_icon":
            "icons/kangaroo.svg",

        "description":
            (
                "Build a woodland corridor with enough "
                "plant diversity and open ground for "
                "a kangaroo."
            ),

        "cost":
            800,

        "player_level":
            4,

        "garden_level":
            4,

        "unique_species":
            10,
    },

    "wombat": {
        "name":
            "Wombat Burrow",

        "animal_name":
            "Wombat",

        "animal_icon":
            "icons/wombat.svg",

        "description":
            (
                "Create the game's most advanced ground "
                "habitat, with enough space and vegetation "
                "for a protected burrow."
            ),

        "cost":
            900,

        "player_level":
            5,

        "garden_level":
            5,

        "unique_species":
            12,
    },
}


# Must match the player-level thresholds used by mainscript.js.
PLAYER_LEVEL_XP_THRESHOLDS = [
    (1, 0),
    (2, 100),
    (3, 200),
    (4, 350),
    (5, 550),
    (6, 800),
    (7, 1100),
    (8, 1450),
    (9, 1850),
    (10, 2300),
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
                role TEXT NOT NULL DEFAULT 'generic'
                    CHECK(role IN ('generic', 'student', 'teacher')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS game_state (
                user_id INTEGER PRIMARY KEY,
                points INTEGER NOT NULL DEFAULT 240,
                score INTEGER NOT NULL DEFAULT 0,
                snaps_completed INTEGER NOT NULL DEFAULT 0,
                snaps_taken INTEGER NOT NULL DEFAULT 0,
                gacha_pulls INTEGER NOT NULL DEFAULT 0,
                garden_level INTEGER NOT NULL DEFAULT 1,
                unlocked_plots INTEGER NOT NULL DEFAULT 4,
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
                Latitude NUMERIC,
	            Longitude NUMERIC,
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

            CREATE TABLE IF NOT EXISTS plant_observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                taxon_key TEXT NOT NULL,
                common_name TEXT,
                scientific_name TEXT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                accuracy_m REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_observations_user_created
                ON plant_observations(user_id, created_at);
            CREATE INDEX IF NOT EXISTS idx_observations_user_taxon
                ON plant_observations(user_id, taxon_key);

            CREATE TABLE IF NOT EXISTS biodiversity_daily_species (
                user_id INTEGER NOT NULL,
                streak_date TEXT NOT NULL,
                taxon_key TEXT NOT NULL,
                first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, streak_date, taxon_key),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_biodiversity_daily_user_date
                ON biodiversity_daily_species(user_id, streak_date);

            CREATE TABLE IF NOT EXISTS user_habitats (
                user_id INTEGER NOT NULL,
                habitat_key TEXT NOT NULL,
                built_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                PRIMARY KEY (
                    user_id,
                    habitat_key
                ),

                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_user_habitats_user
                ON user_habitats(user_id, built_at);

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

            CREATE TABLE IF NOT EXISTS classrooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                teacher_id INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS classroom_members (
                classroom_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (classroom_id, student_id),
                FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                classroom_id INTEGER NOT NULL,
                created_by INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                target_type TEXT NOT NULL DEFAULT 'manual'
                    CHECK(target_type IN ('manual', 'score', 'points', 'collection', 'placed', 'snaps')),
                target_value INTEGER NOT NULL DEFAULT 1,
                due_at TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS quest_progress (
                quest_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'assigned'
                    CHECK(status IN ('assigned', 'completed')),
                completed_at TEXT,
                PRIMARY KEY (quest_id, student_id),
                FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_classrooms_teacher
                ON classrooms(teacher_id);
            CREATE INDEX IF NOT EXISTS idx_classroom_members_student
                ON classroom_members(student_id);
            CREATE INDEX IF NOT EXISTS idx_quests_classroom
                ON quests(classroom_id, is_active);

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

            CREATE TABLE IF NOT EXISTS daily_quest_progress (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                quest_date TEXT NOT NULL,
                progress INTEGER NOT NULL DEFAULT 0,
                completed INTEGER NOT NULL DEFAULT 0,
                reward_claimed INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (user_id, quest_key, quest_date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS weekly_quest_claims (
                user_id INTEGER NOT NULL,
                quest_key TEXT NOT NULL,
                week_key TEXT NOT NULL,
                claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (
                    user_id,
                    quest_key,
                    week_key
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_contributions (
                quest_key TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                contribution INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (
                    quest_key,
                    user_id
                ),
                FOREIGN KEY (user_id)
                    REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS community_quest_state (
                quest_key TEXT PRIMARY KEY,
                progress INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS community_milestone_claims (
                quest_key TEXT NOT NULL,
                milestone_target INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                PRIMARY KEY (quest_key, milestone_target, user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS special_quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                plant_name TEXT NOT NULL,
                target_snaps INTEGER NOT NULL,
                tasks_json TEXT NOT NULL DEFAULT '[]',
                created_by INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS special_quest_progress (
                quest_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                progress INTEGER NOT NULL DEFAULT 0,
                completed INTEGER NOT NULL DEFAULT 0,
                reward_claimed INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (quest_id, user_id),
                FOREIGN KEY (quest_id) REFERENCES special_quests(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        db.execute(
            """
            INSERT OR IGNORE INTO community_quest_state(
                quest_key,
                progress
            )
            VALUES (?, 0)
            """,
            (COMMUNITY_QUEST["key"],),
        )

        # Backfill community contribution counts for
        # existing players. The existing community quest
        # already counted accepted observations, so these
        # observations are the best available source for
        # contributor attribution.
        db.execute(
            """
            INSERT OR IGNORE INTO community_contributions(
                quest_key,
                user_id,
                contribution
            )
            SELECT
                ?,
                user_id,
                COUNT(*)
            FROM plant_observations
            GROUP BY user_id
            """,
            (
                COMMUNITY_QUEST["key"],
            ),
        )

        # Existing users may already have purchased animals
        # under the old Wildlife shop. Treat those animals as
        # habitats already completed so no progress is lost.
        db.execute(
            """
            INSERT OR IGNORE INTO user_habitats(
                user_id,
                habitat_key
            )
            SELECT
                user_id,
                item_key
            FROM collection_items
            WHERE item_key IN (
                'echidna',
                'cockatoo',
                'emu',
                'kangaroo',
                'wombat'
            )
            """
        )

        # Existing users may already have purchased animals
        # under the old Wildlife shop. Treat those animals as
        # habitats already completed so no progress is lost.
        db.execute(
            """
            INSERT OR IGNORE INTO user_habitats(
                user_id,
                habitat_key
            )
            SELECT
                user_id,
                item_key
            FROM collection_items
            WHERE item_key IN (
                'echidna',
                'cockatoo',
                'emu',
                'kangaroo',
                'wombat'
            )
            """
        )

        special_columns = {
            row[1] for row in db.execute("PRAGMA table_info(special_quests)")
        }
        if "tasks_json" not in special_columns:
            db.execute(
                "ALTER TABLE special_quests ADD COLUMN tasks_json TEXT NOT NULL DEFAULT '[]'"
            )

        # Migration for databases created by earlier versions.
        user_columns = {row[1] for row in db.execute("PRAGMA table_info(users)")}
        if "role" not in user_columns:
            db.execute(
                "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'generic'"
            )

        game_state_columns = {
            row[1] for row in db.execute("PRAGMA table_info(game_state)")
        }
        if "snaps_completed" not in game_state_columns:
            db.execute(
                "ALTER TABLE game_state ADD COLUMN snaps_completed INTEGER NOT NULL DEFAULT 0"
            )

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
            db.execute(
                "ALTER TABLE game_state ADD COLUMN snaps_taken INTEGER NOT NULL DEFAULT 0"
            )
        if "gacha_pulls" not in state_columns:
            db.execute(
                "ALTER TABLE game_state ADD COLUMN gacha_pulls INTEGER NOT NULL DEFAULT 0"
            )
        if "garden_level" not in state_columns:
            db.execute(
                "ALTER TABLE game_state ADD COLUMN garden_level INTEGER NOT NULL DEFAULT 1"
            )
        if "unlocked_plots" not in state_columns:
            db.execute(
                "ALTER TABLE game_state ADD COLUMN unlocked_plots INTEGER NOT NULL DEFAULT 4"
            )

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


def role_required(*allowed_roles):
    uid, error = login_required()
    if error:
        return None, error

    with get_db() as db:
        user = db.execute(
            "SELECT id, username, role FROM users WHERE id = ?",
            (uid,),
        ).fetchone()

    if not user:
        session.clear()
        return None, (jsonify({"error": "Account not found"}), 401)

    if user["role"] not in allowed_roles:
        return None, (jsonify({"error": "You do not have permission to do that."}), 403)

    return dict(user), None


def teacher_owns_classroom(db, teacher_id, classroom_id):
    return (
        db.execute(
            "SELECT id FROM classrooms WHERE id = ? AND teacher_id = ?",
            (classroom_id, teacher_id),
        ).fetchone()
        is not None
    )


def student_in_classroom(db, student_id, classroom_id):
    return (
        db.execute(
            """
        SELECT 1
        FROM classroom_members
        WHERE classroom_id = ? AND student_id = ?
        """,
            (classroom_id, student_id),
        ).fetchone()
        is not None
    )


def quest_progress_for(db, quest, student_id):
    target = max(1, int(quest["target_value"] or 1))
    target_type = quest["target_type"]

    state = db.execute(
        """
        SELECT points, score, snaps_completed
        FROM game_state
        WHERE user_id = ?
        """,
        (student_id,),
    ).fetchone()

    if target_type == "manual":
        progress = db.execute(
            """
            SELECT status, completed_at
            FROM quest_progress
            WHERE quest_id = ? AND student_id = ?
            """,
            (quest["id"], student_id),
        ).fetchone()
        completed = bool(progress and progress["status"] == "completed")
        current = target if completed else 0
        completed_at = progress["completed_at"] if progress else None
    elif target_type == "score":
        current = int(state["score"] if state else 0)
        completed = current >= target
        completed_at = None
    elif target_type == "points":
        current = int(state["points"] if state else 0)
        completed = current >= target
        completed_at = None
    elif target_type == "snaps":
        current = int(state["snaps_completed"] if state else 0)
        completed = current >= target
        completed_at = None
    elif target_type == "collection":
        current = db.execute(
            "SELECT COUNT(*) FROM collection_items WHERE user_id = ?",
            (student_id,),
        ).fetchone()[0]
        completed = current >= target
        completed_at = None
    elif target_type == "placed":
        current = db.execute(
            "SELECT COUNT(*) FROM plants WHERE user_id = ?",
            (student_id,),
        ).fetchone()[0]
        completed = current >= target
        completed_at = None
    else:
        current = 0
        completed = False
        completed_at = None

    return {
        "current": current,
        "target": target,
        "completed": completed,
        "completed_at": completed_at,
        "percent": min(100, int((current / target) * 100)) if target else 0,
    }


def state_for_user(db, user_id):
    state = db.execute(
        """
        SELECT points, score, snaps_completed, snaps_taken, gacha_pulls,
               garden_level, unlocked_plots, latest_name, latest_rarity
        FROM game_state
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()

    if not state:
        db.execute("INSERT INTO game_state(user_id) VALUES (?)", (user_id,))
        state = db.execute(
            """
            SELECT points, score, snaps_completed, snaps_taken, gacha_pulls,
                   garden_level, unlocked_plots, latest_name, latest_rarity
            FROM game_state
            WHERE user_id = ?
            """,
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

    ensure_habitat_animals(
        db,
        user_id,
    )

    ensure_habitat_animals(
        db,
        user_id,
    )

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

    garden_level = int(state["garden_level"] or 1)
    unlocked_plots = min(
        MAX_GARDEN_SLOTS,
        max(4, int(state["unlocked_plots"] or 4)),
    )
    next_upgrade = next(
        (
            upgrade
            for upgrade in GARDEN_UPGRADES
            if upgrade["level"] > garden_level
        ),
        None,
    )

    return {
        "points": state["points"],
        "score": state["score"],
        "snapsCompleted": state["snaps_completed"],
        "snaps_taken": state["snaps_taken"],
        "gacha_pulls": state["gacha_pulls"],
        "latestPlant": (
            {"name": state["latest_name"], "rarity": state["latest_rarity"]}
            if state["latest_name"]
            else None
        ),
        "gardenSlots": garden_slots,
        "collection": collection,
        "garden": {
            "level": garden_level,
            "unlockedPlots": unlocked_plots,
            "maxPlots": MAX_GARDEN_SLOTS,
            "nextLevel": next_upgrade["level"] if next_upgrade else None,
            "nextCost": next_upgrade["cost"] if next_upgrade else None,
            "nextPlots": next_upgrade["plots"] if next_upgrade else None,
        },
        "biodiversity": biodiversity_snapshot(db, user_id),
        "habitats": habitat_snapshot(db, user_id),
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


def quest_date():
    return date.today().isoformat()


def biodiversity_multiplier(
    unique_count,
):
    """Multiplier earned by today's number of different species."""

    unique_count = max(
        0,
        int(
            unique_count
            or 0
        ),
    )

    if (
        unique_count
        >= 10
    ):
        return 2.0

    if (
        unique_count
        >= 5
    ):
        return 1.5

    if (
        unique_count
        >= 3
    ):
        return 1.25

    return 1.0


def biodiversity_next_target(
    unique_count,
):

    unique_count = max(
        0,
        int(
            unique_count
            or 0
        ),
    )

    if (
        unique_count
        < 3
    ):
        return (
            3,
            1.25,
        )

    if (
        unique_count
        < 5
    ):
        return (
            5,
            1.5,
        )

    if (
        unique_count
        < 10
    ):
        return (
            10,
            2.0,
        )

    return (
        None,
        None,
    )


def biodiversity_snapshot(
    db,
    user_id,
):

    today = quest_date()

    today_unique = db.execute(
        """
        SELECT COUNT(*)
        FROM biodiversity_daily_species
        WHERE
            user_id = ?
            AND streak_date = ?
        """,
        (
            user_id,
            today,
        ),
    ).fetchone()[0]

    total_unique = db.execute(
        """
        SELECT COUNT(
            DISTINCT taxon_key
        )
        FROM plant_observations
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchone()[0]

    (
        next_target,
        next_multiplier,
    ) = biodiversity_next_target(
        today_unique
    )

    return {
        "todayUnique":
            int(
                today_unique
                or 0
            ),

        "totalUnique":
            int(
                total_unique
                or 0
            ),

        "multiplier":
            biodiversity_multiplier(
                today_unique
            ),

        "nextTarget":
            next_target,

        "nextMultiplier":
            next_multiplier,

        "newAreaRadiusMetres":
            NEW_AREA_RADIUS_METRES,
    }




def player_level_from_xp(
    xp,
):
    xp = max(
        0,
        int(
            xp
            or 0
        ),
    )

    level = 1

    for (
        candidate_level,
        required_xp,
    ) in PLAYER_LEVEL_XP_THRESHOLDS:

        if (
            xp
            >= required_xp
        ):
            level = (
                candidate_level
            )

        else:
            break

    return level


def ensure_habitat_animals(
    db,
    user_id,
):
    """
    Any completed habitat permanently owns its animal.

    This also protects habitat animals from disappearing if
    an older browser state does not include them when saving.
    """

    built_rows = db.execute(
        """
        SELECT habitat_key
        FROM user_habitats
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchall()

    for row in built_rows:

        habitat_key = (
            row[
                "habitat_key"
            ]
        )

        config = (
            HABITATS.get(
                habitat_key
            )
        )

        if not config:
            continue

        db.execute(
            """
            INSERT OR IGNORE INTO collection_items(
                user_id,
                item_key,
                name,
                icon,
                rarity,
                kind
            )
            VALUES (?, ?, ?, ?, 'decor', 'decor')
            """,
            (
                user_id,
                habitat_key,
                config[
                    "animal_name"
                ],
                config[
                    "animal_icon"
                ],
            ),
        )


def habitat_snapshot(
    db,
    user_id,
):
    state = db.execute(
        """
        SELECT
            points,
            score,
            garden_level
        FROM game_state
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchone()

    coins = int(
        state[
            "points"
        ]
        if state
        else 0
    )

    xp = int(
        state[
            "score"
        ]
        if state
        else 0
    )

    garden_level = int(
        state[
            "garden_level"
        ]
        if state
        else 1
    )

    player_level = (
        player_level_from_xp(
            xp
        )
    )

    unique_species = db.execute(
        """
        SELECT COUNT(
            DISTINCT taxon_key
        )
        FROM plant_observations
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchone()[0]

    unique_species = int(
        unique_species
        or 0
    )

    built_keys = {
        row[
            "habitat_key"
        ]

        for row
        in db.execute(
            """
            SELECT habitat_key
            FROM user_habitats
            WHERE user_id = ?
            """,
            (
                user_id,
            ),
        ).fetchall()
    }

    items = []

    for (
        key,
        config,
    ) in HABITATS.items():

        built = (
            key
            in built_keys
        )

        player_level_met = (
            player_level
            >= config[
                "player_level"
            ]
        )

        garden_level_met = (
            garden_level
            >= config[
                "garden_level"
            ]
        )

        unique_species_met = (
            unique_species
            >= config[
                "unique_species"
            ]
        )

        coins_met = (
            coins
            >= config[
                "cost"
            ]
        )

        animal_owned = db.execute(
            """
            SELECT 1
            FROM collection_items
            WHERE
                user_id = ?
                AND item_key = ?
            """,
            (
                user_id,
                key,
            ),
        ).fetchone() is not None

        items.append(
            {
                "key":
                    key,

                "name":
                    config[
                        "name"
                    ],

                "animalName":
                    config[
                        "animal_name"
                    ],

                "animalIcon":
                    config[
                        "animal_icon"
                    ],

                "description":
                    config[
                        "description"
                    ],

                "cost":
                    config[
                        "cost"
                    ],

                "requiredPlayerLevel":
                    config[
                        "player_level"
                    ],

                "currentPlayerLevel":
                    player_level,

                "playerLevelMet":
                    player_level_met,

                "requiredGardenLevel":
                    config[
                        "garden_level"
                    ],

                "currentGardenLevel":
                    garden_level,

                "gardenLevelMet":
                    garden_level_met,

                "requiredUniqueSpecies":
                    config[
                        "unique_species"
                    ],

                "currentUniqueSpecies":
                    unique_species,

                "uniqueSpeciesMet":
                    unique_species_met,

                "coinsMet":
                    coins_met,

                "built":
                    built,

                "animalOwned":
                    animal_owned,

                "canBuild":
                    (
                        not built
                        and player_level_met
                        and garden_level_met
                        and unique_species_met
                        and coins_met
                    ),
            }
        )

    return {
        "builtCount":
            len(
                built_keys
            ),

        "total":
            len(
                HABITATS
            ),

        "uniqueSpecies":
            unique_species,

        "playerLevel":
            player_level,

        "gardenLevel":
            garden_level,

        "items":
            items,
    }



def player_level_from_xp(
    xp,
):
    xp = max(
        0,
        int(
            xp
            or 0
        ),
    )

    level = 1

    for (
        candidate_level,
        required_xp,
    ) in PLAYER_LEVEL_XP_THRESHOLDS:

        if (
            xp
            >= required_xp
        ):
            level = (
                candidate_level
            )

        else:
            break

    return level


def ensure_habitat_animals(
    db,
    user_id,
):
    """
    Any completed habitat permanently owns its animal.

    This also protects habitat animals from disappearing if
    an older browser state does not include them when saving.
    """

    built_rows = db.execute(
        """
        SELECT habitat_key
        FROM user_habitats
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchall()

    for row in built_rows:

        habitat_key = (
            row[
                "habitat_key"
            ]
        )

        config = (
            HABITATS.get(
                habitat_key
            )
        )

        if not config:
            continue

        db.execute(
            """
            INSERT OR IGNORE INTO collection_items(
                user_id,
                item_key,
                name,
                icon,
                rarity,
                kind
            )
            VALUES (?, ?, ?, ?, 'decor', 'decor')
            """,
            (
                user_id,
                habitat_key,
                config[
                    "animal_name"
                ],
                config[
                    "animal_icon"
                ],
            ),
        )


def habitat_snapshot(
    db,
    user_id,
):
    state = db.execute(
        """
        SELECT
            points,
            score,
            garden_level
        FROM game_state
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchone()

    coins = int(
        state[
            "points"
        ]
        if state
        else 0
    )

    xp = int(
        state[
            "score"
        ]
        if state
        else 0
    )

    garden_level = int(
        state[
            "garden_level"
        ]
        if state
        else 1
    )

    player_level = (
        player_level_from_xp(
            xp
        )
    )

    unique_species = db.execute(
        """
        SELECT COUNT(
            DISTINCT taxon_key
        )
        FROM plant_observations
        WHERE user_id = ?
        """,
        (
            user_id,
        ),
    ).fetchone()[0]

    unique_species = int(
        unique_species
        or 0
    )

    built_keys = {
        row[
            "habitat_key"
        ]

        for row
        in db.execute(
            """
            SELECT habitat_key
            FROM user_habitats
            WHERE user_id = ?
            """,
            (
                user_id,
            ),
        ).fetchall()
    }

    items = []

    for (
        key,
        config,
    ) in HABITATS.items():

        built = (
            key
            in built_keys
        )

        player_level_met = (
            player_level
            >= config[
                "player_level"
            ]
        )

        garden_level_met = (
            garden_level
            >= config[
                "garden_level"
            ]
        )

        unique_species_met = (
            unique_species
            >= config[
                "unique_species"
            ]
        )

        coins_met = (
            coins
            >= config[
                "cost"
            ]
        )

        animal_owned = db.execute(
            """
            SELECT 1
            FROM collection_items
            WHERE
                user_id = ?
                AND item_key = ?
            """,
            (
                user_id,
                key,
            ),
        ).fetchone() is not None

        items.append(
            {
                "key":
                    key,

                "name":
                    config[
                        "name"
                    ],

                "animalName":
                    config[
                        "animal_name"
                    ],

                "animalIcon":
                    config[
                        "animal_icon"
                    ],

                "description":
                    config[
                        "description"
                    ],

                "cost":
                    config[
                        "cost"
                    ],

                "requiredPlayerLevel":
                    config[
                        "player_level"
                    ],

                "currentPlayerLevel":
                    player_level,

                "playerLevelMet":
                    player_level_met,

                "requiredGardenLevel":
                    config[
                        "garden_level"
                    ],

                "currentGardenLevel":
                    garden_level,

                "gardenLevelMet":
                    garden_level_met,

                "requiredUniqueSpecies":
                    config[
                        "unique_species"
                    ],

                "currentUniqueSpecies":
                    unique_species,

                "uniqueSpeciesMet":
                    unique_species_met,

                "coinsMet":
                    coins_met,

                "built":
                    built,

                "animalOwned":
                    animal_owned,

                "canBuild":
                    (
                        not built
                        and player_level_met
                        and garden_level_met
                        and unique_species_met
                        and coins_met
                    ),
            }
        )

    return {
        "builtCount":
            len(
                built_keys
            ),

        "total":
            len(
                HABITATS
            ),

        "uniqueSpecies":
            unique_species,

        "playerLevel":
            player_level,

        "gardenLevel":
            garden_level,

        "items":
            items,
    }


def week_bounds():
    today = date.today()

    start = (
        today
        - timedelta(
            days=
                today.weekday()
        )
    )

    end = (
        start
        + timedelta(
            days=7
        )
    )

    return (
        start.isoformat(),
        end.isoformat(),
    )


def week_key():
    start, _ = (
        week_bounds()
    )

    return start


def weekly_quest_status(
    db,
    user_id,
    quest,
):
    (
        start_date,
        end_date,
    ) = week_bounds()

    target_type = (
        quest[
            "target_type"
        ]
    )

    target = int(
        quest[
            "target"
        ]
    )

    if (
        target_type
        == "snaps"
    ):
        progress = db.execute(
            """
            SELECT COUNT(*)
            FROM plant_observations
            WHERE
                user_id = ?
                AND DATE(created_at) >= ?
                AND DATE(created_at) < ?
            """,
            (
                user_id,
                start_date,
                end_date,
            ),
        ).fetchone()[0]

    elif (
        target_type
        == "unique_species"
    ):
        progress = db.execute(
            """
            SELECT COUNT(
                DISTINCT taxon_key
            )
            FROM plant_observations
            WHERE
                user_id = ?
                AND DATE(created_at) >= ?
                AND DATE(created_at) < ?
            """,
            (
                user_id,
                start_date,
                end_date,
            ),
        ).fetchone()[0]

    elif (
        target_type
        == "daily_claims"
    ):
        progress = db.execute(
            """
            SELECT COUNT(*)
            FROM daily_quest_progress
            WHERE
                user_id = ?
                AND reward_claimed = 1
                AND quest_date >= ?
                AND quest_date < ?
            """,
            (
                user_id,
                start_date,
                end_date,
            ),
        ).fetchone()[0]

    else:
        progress = 0

    progress = min(
        target,
        int(
            progress
            or 0
        ),
    )

    claimed = db.execute(
        """
        SELECT 1
        FROM weekly_quest_claims
        WHERE
            user_id = ?
            AND quest_key = ?
            AND week_key = ?
        """,
        (
            user_id,
            quest["key"],
            week_key(),
        ),
    ).fetchone()

    return {
        "progress":
            progress,

        "completed":
            progress
            >= target,

        "claimed":
            claimed
            is not None,
    }


def quest_progress_row(db, user_id, quest_key):
    today = quest_date()
    db.execute(
        """
        INSERT OR IGNORE INTO daily_quest_progress
            (user_id, quest_key, quest_date, progress)
        VALUES (?, ?, ?, 0)
        """,
        (user_id, quest_key, today),
    )
    return db.execute(
        """
        SELECT progress, completed, reward_claimed
        FROM daily_quest_progress
        WHERE user_id = ? AND quest_key = ? AND quest_date = ?
        """,
        (user_id, quest_key, today),
    ).fetchone()



def apply_quest_event(
    db,
    user_id,
    event_type,
    reward_multiplier=1,
):
    coin_rewards = 0
    xp_rewards = 0
    completed = []

    today = (
        quest_date()
    )

    # -----------------------------------------
    # Daily quest progress
    # -----------------------------------------

    for quest in DAILY_QUESTS:

        if (
            quest["event"]
            != event_type
        ):
            continue

        current = (
            quest_progress_row(
                db,
                user_id,
                quest["key"],
            )
        )

        if (
            current[
                "completed"
            ]
        ):
            continue

        progress = min(
            quest[
                "target"
            ],
            current[
                "progress"
            ] + 1,
        )

        is_complete = (
            progress
            >= quest[
                "target"
            ]
        )

        db.execute(
            """
            UPDATE daily_quest_progress
            SET
                progress = ?,
                completed = ?,
                reward_claimed = ?
            WHERE
                user_id = ?
                AND quest_key = ?
                AND quest_date = ?
            """,
            (
                progress,

                int(
                    is_complete
                ),

                int(
                    current[
                        "reward_claimed"
                    ]
                ),

                user_id,
                quest["key"],
                today,
            ),
        )

    if (
        event_type
        == "snap"
    ):

        # -----------------------------------------
        # Community progress
        # -----------------------------------------

        community = db.execute(
            """
            SELECT progress
            FROM community_quest_state
            WHERE quest_key = ?
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
            ),
        ).fetchone()

        old_total = int(
            community[
                "progress"
            ]
            if community
            else 0
        )

        new_total = min(
            COMMUNITY_QUEST[
                "target"
            ],
            old_total + 1,
        )

        db.execute(
            """
            UPDATE community_quest_state
            SET progress = ?
            WHERE quest_key = ?
            """,
            (
                new_total,
                COMMUNITY_QUEST[
                    "key"
                ],
            ),
        )

        # Each accepted snap now records who
        # contributed to the community goal.

        db.execute(
            """
            INSERT INTO community_contributions(
                quest_key,
                user_id,
                contribution
            )
            VALUES (?, ?, 1)
            ON CONFLICT(
                quest_key,
                user_id
            )
            DO UPDATE SET
                contribution =
                    contribution + 1
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
                user_id,
            ),
        )

        # Community milestone rewards are not paid
        # automatically here anymore.
        #
        # Every contributor can claim each reached
        # milestone once from the Quests screen.

        # -----------------------------------------
        # Special quests
        # -----------------------------------------

        special_rows = db.execute(
            """
            SELECT
                sq.id,
                sq.plant_name,
                sq.target_snaps,
                sqp.progress,
                sqp.completed,
                sqp.reward_claimed
            FROM special_quest_progress sqp
            JOIN special_quests sq
                ON sq.id = sqp.quest_id
            WHERE sqp.user_id = ?
            """,
            (
                user_id,
            ),
        ).fetchall()

        for special in special_rows:

            if (
                special[
                    "completed"
                ]
            ):
                continue

            progress = min(
                special[
                    "target_snaps"
                ],
                special[
                    "progress"
                ] + 1,
            )

            is_complete = (
                progress
                >= special[
                    "target_snaps"
                ]
            )

            should_reward = (
                is_complete
                and not special[
                    "reward_claimed"
                ]
            )

            db.execute(
                """
                UPDATE special_quest_progress
                SET
                    progress = ?,
                    completed = ?,
                    reward_claimed = ?
                WHERE
                    quest_id = ?
                    AND user_id = ?
                """,
                (
                    progress,

                    int(
                        is_complete
                    ),

                    int(
                        special[
                            "reward_claimed"
                        ]
                        or should_reward
                    ),

                    special["id"],
                    user_id,
                ),
            )

            if (
                should_reward
            ):
                coin_rewards += (
                    SPECIAL_QUEST_COIN_REWARD
                )

                xp_rewards += (
                    SPECIAL_QUEST_XP_REWARD
                )

                completed.append(
                    f'{special["plant_name"]} '
                    f'special quest'
                )

    if (
        coin_rewards
        or xp_rewards
    ):
        db.execute(
            """
            UPDATE game_state
            SET
                points =
                    points + ?,

                score =
                    score + ?

            WHERE user_id = ?
            """,
            (
                int(
                    coin_rewards
                    * reward_multiplier
                ),

                int(
                    xp_rewards
                    * reward_multiplier
                ),

                user_id,
            ),
        )

    return {
        "reward":
            int(
                coin_rewards
                * reward_multiplier
            ),

        "xp_reward":
            int(
                xp_rewards
                * reward_multiplier
            ),

        "completed":
            completed,
    }


def quest_snapshot(
    db,
    user_id,
):
    today = (
        quest_date()
    )

    # -----------------------------------------
    # Daily
    # -----------------------------------------

    daily = []

    for quest in DAILY_QUESTS:

        row = (
            quest_progress_row(
                db,
                user_id,
                quest["key"],
            )
        )

        daily.append(
            {
                **quest,

                "progress":
                    row[
                        "progress"
                    ],

                "completed":
                    bool(
                        row[
                            "completed"
                        ]
                    ),

                "claimed":
                    bool(
                        row[
                            "reward_claimed"
                        ]
                    ),
            }
        )

    # -----------------------------------------
    # Weekly
    # -----------------------------------------

    weekly = []

    for quest in WEEKLY_QUESTS:

        status = (
            weekly_quest_status(
                db,
                user_id,
                quest,
            )
        )

        weekly.append(
            {
                **quest,
                **status,
            }
        )

    # -----------------------------------------
    # Community
    # -----------------------------------------

    community_row = db.execute(
        """
        SELECT progress
        FROM community_quest_state
        WHERE quest_key = ?
        """,
        (
            COMMUNITY_QUEST[
                "key"
            ],
        ),
    ).fetchone()

    community_progress = int(
        community_row[
            "progress"
        ]
        if community_row
        else 0
    )

    contribution_row = (
        db.execute(
            """
            SELECT contribution
            FROM community_contributions
            WHERE
                quest_key = ?
                AND user_id = ?
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
                user_id,
            ),
        ).fetchone()
    )

    contribution = int(
        contribution_row[
            "contribution"
        ]
        if contribution_row
        else 0
    )

    claimed_targets = {
        int(
            row[
                "milestone_target"
            ]
        )

        for row
        in db.execute(
            """
            SELECT milestone_target
            FROM community_milestone_claims
            WHERE
                quest_key = ?
                AND user_id = ?
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
                user_id,
            ),
        ).fetchall()
    }

    community_milestones = []

    for milestone in (
        COMMUNITY_QUEST[
            "milestones"
        ]
    ):
        target = int(
            milestone[
                "target"
            ]
        )

        reached = (
            community_progress
            >= target
        )

        claimed = (
            target
            in claimed_targets
        )

        community_milestones.append(
            {
                **milestone,

                "reached":
                    reached,

                "claimed":
                    claimed,

                "claimable":
                    (
                        reached
                        and contribution > 0
                        and not claimed
                    ),
            }
        )

    # -----------------------------------------
    # Special quests
    # -----------------------------------------

    special = []

    for row in db.execute(
        """
        SELECT
            sq.id,
            sq.code,
            sq.plant_name,
            sq.target_snaps,
            sq.tasks_json,
            sqp.progress,
            sqp.completed,
            sqp.reward_claimed
        FROM special_quest_progress sqp
        JOIN special_quests sq
            ON sq.id = sqp.quest_id
        WHERE sqp.user_id = ?
        ORDER BY sq.created_at DESC
        """,
        (
            user_id,
        ),
    ).fetchall():

        try:
            tasks = json.loads(
                row[
                    "tasks_json"
                ]
                or "[]"
            )

        except (
            TypeError,
            ValueError,
        ):
            tasks = []

        special.append(
            {
                "id":
                    row[
                        "id"
                    ],

                "code":
                    row[
                        "code"
                    ],

                "plant":
                    row[
                        "plant_name"
                    ],

                "target":
                    row[
                        "target_snaps"
                    ],

                "tasks":
                    tasks
                    or [
                        {
                            "plant":
                                row[
                                    "plant_name"
                                ],

                            "required_snaps":
                                row[
                                    "target_snaps"
                                ],
                        }
                    ],

                "progress":
                    row[
                        "progress"
                    ],

                "completed":
                    bool(
                        row[
                            "completed"
                        ]
                    ),

                "claimed":
                    bool(
                        row[
                            "reward_claimed"
                        ]
                    ),

                "reward":
                    SPECIAL_QUEST_COIN_REWARD,

                "xp_reward":
                    SPECIAL_QUEST_XP_REWARD,
            }
        )

    return {
        "date":
            today,

        "weekStart":
            week_key(),

        "daily":
            daily,

        "weekly":
            weekly,

        "community":
            {
                **COMMUNITY_QUEST,

                "progress":
                    community_progress,

                "contribution":
                    contribution,

                "milestones":
                    community_milestones,
            },

        "special":
            special,
    }

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
        (
            user_id,
            user_id,
            user_id,
            user_id,
            user_id,
            user_id,
            user_id,
            user_id,
            user_id,
        ),
    ).fetchone()

    unlocked_achievements = set()
    new_achievements = []

    # Check each achievement
    for key, defn in ACHIEVEMENTS.items():
        progress = 0
        completed = 0

        # Calculate progress based on achievement type
        if key == "first_plant":
            progress = min(stats["plants_grown"], 1)
            completed = 1 if progress >= 1 else 0
        elif key == "plant_collector_10":
            progress = min(stats["plants_grown"], 10)
            completed = 1 if progress >= 10 else 0
        elif key == "plant_collector_50":
            progress = min(stats["plants_grown"], 50)
            completed = 1 if progress >= 50 else 0
        elif key == "plant_collector_100":
            progress = min(stats["plants_grown"], 100)
            completed = 1 if progress >= 100 else 0
        elif key == "rare_collector":
            progress = min(stats["rares_found"], 1)
            completed = 1 if progress >= 1 else 0
        elif key == "rare_collector_5":
            progress = min(stats["rares_found"], 5)
            completed = 1 if progress >= 5 else 0
        elif key == "epic_collector":
            progress = min(stats["epics_found"], 1)
            completed = 1 if progress >= 1 else 0
        elif key == "epic_collector_3":
            progress = min(stats["epics_found"], 3)
            completed = 1 if progress >= 3 else 0
        elif key == "legendary_collector":
            progress = min(stats["legendaries_found"], 1)
            completed = 1 if progress >= 1 else 0
        elif key == "legendary_collector_3":
            progress = min(stats["legendaries_found"], 3)
            completed = 1 if progress >= 3 else 0
        elif key == "score_500":
            progress = min(stats["total_score"], 500)
            completed = 1 if progress >= 500 else 0
        elif key == "score_1000":
            progress = min(stats["total_score"], 1000)
            completed = 1 if progress >= 1000 else 0
        elif key == "score_5000":
            progress = min(stats["total_score"], 5000)
            completed = 1 if progress >= 5000 else 0
        elif key == "snap_10":
            progress = min(stats["snaps_taken"], 10)
            completed = 1 if progress >= 10 else 0
        elif key == "snap_50":
            progress = min(stats["snaps_taken"], 50)
            completed = 1 if progress >= 50 else 0
        elif key == "gacha_10":
            progress = min(stats["gacha_pulls"], 10)
            completed = 1 if progress >= 10 else 0
        elif key == "gacha_50":
            progress = min(stats["gacha_pulls"], 50)
            completed = 1 if progress >= 50 else 0
        elif key == "garden_full":
            progress = min(stats["placed_plants"], 16)
            completed = 1 if progress >= 16 else 0
        elif key == "complete_collection":
            progress = min(stats["total_collection"], 16)
            completed = 1 if progress >= 16 else 0

        # Update or insert achievement
        existing = db.execute(
            "SELECT id, completed FROM achievements WHERE user_id = ? AND achievement_key = ?",
            (user_id, key),
        ).fetchone()

        if existing:
            if existing["completed"] == 0 and completed == 1:
                # Newly completed!
                new_achievements.append(key)
                db.execute(
                    """
                    UPDATE achievements 
                    SET progress = ?, completed = ?, unlocked_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND achievement_key = ?
                    """,
                    (progress, completed, user_id, key),
                )
                # Add score reward
                db.execute(
                    "UPDATE game_state SET score = score + ? WHERE user_id = ?",
                    (defn["points"], user_id),
                )
            else:
                db.execute(
                    """
                    UPDATE achievements 
                    SET progress = ?
                    WHERE user_id = ? AND achievement_key = ?
                    """,
                    (progress, user_id, key),
                )
        else:
            db.execute(
                """
                INSERT INTO achievements (user_id, achievement_key, progress, completed)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, key, progress, completed),
            )
            if completed:
                new_achievements.append(key)
                db.execute(
                    "UPDATE game_state SET score = score + ? WHERE user_id = ?",
                    (defn["points"], user_id),
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
    uid, error = login_required()
    if error:
        return error

    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify({"error": "Please provide a photo."}), 400

    if image.mimetype not in {"image/jpeg", "image/png", "image/webp"}:
        return jsonify({"error": "Please upload a JPEG, PNG or WebP image."}), 400

    try:
        latitude, longitude, accuracy = parse_observation_location()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

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

    identification = predictions[0]
    common_name = str(identification.get("common_name") or "").strip()[:160] or None
    scientific_name = str(identification.get("scientific_name") or "").strip()[:180] or None
    taxon_key = observation_taxon_key(common_name, scientific_name)
    if not taxon_key:
        return jsonify({"error": "PlantNet could not determine the plant species."}), 422

    with get_db() as db:
        previous_rows = db.execute(
            """
            SELECT
                latitude,
                longitude
            FROM plant_observations
            WHERE
                user_id = ?
                AND taxon_key = ?
            """,
            (
                uid,
                taxon_key,
            ),
        ).fetchall()

        distances = [
            haversine_metres(
                latitude,
                longitude,
                float(
                    row[
                        "latitude"
                    ]
                ),
                float(
                    row[
                        "longitude"
                    ]
                ),
            )

            for row
            in previous_rows
        ]

        nearby_count = sum(
            1

            for distance
            in distances

            if (
                distance
                <= OBSERVATION_RADIUS_METRES
            )
        )

        if (
            nearby_count
            >= MAX_SAME_PLANT_PER_LOCATION
        ):
            display_name = (
                common_name
                or scientific_name
                or "this plant"
            )

            return jsonify(
                {
                    "error":
                        (
                            f"You have already logged "
                            f"{MAX_SAME_PLANT_PER_LOCATION} "
                            f"{display_name} sightings within "
                            f"{OBSERVATION_RADIUS_METRES} m "
                            f"of this location. "
                            f"Move to a different location "
                            f"or photograph another species."
                        ),

                    "code":
                        "location_species_limit",

                    "limit":
                        MAX_SAME_PLANT_PER_LOCATION,

                    "radius_metres":
                        OBSERVATION_RADIUS_METRES,
                }
            ), 409

        first_species = (
            len(
                previous_rows
            )
            == 0
        )

        nearest_distance = (
            min(
                distances
            )

            if distances

            else None
        )

        new_area = (
            not first_species

            and nearest_distance
            is not None

            and nearest_distance
            >= NEW_AREA_RADIUS_METRES
        )

        today = quest_date()

        already_in_today_streak = db.execute(
            """
            SELECT 1
            FROM biodiversity_daily_species
            WHERE
                user_id = ?
                AND streak_date = ?
                AND taxon_key = ?
            """,
            (
                uid,
                today,
                taxon_key,
            ),
        ).fetchone()

        new_daily_species = (
            already_in_today_streak
            is None
        )

        current_daily_unique = db.execute(
            """
            SELECT COUNT(*)
            FROM biodiversity_daily_species
            WHERE
                user_id = ?
                AND streak_date = ?
            """,
            (
                uid,
                today,
            ),
        ).fetchone()[0]

        projected_daily_unique = (
            int(
                current_daily_unique
                or 0
            )
            + (
                1
                if new_daily_species
                else 0
            )
        )

        # -----------------------------------------
        # Base biodiversity reward
        # -----------------------------------------

        if first_species:
            reward_type = (
                "first_species"
            )

            reward_label = (
                "New species discovered"
            )

            base_coins = 30
            base_xp = 30

        elif new_area:
            reward_type = (
                "new_area"
            )

            reward_label = (
                "Species found in a new area"
            )

            base_coins = 20
            base_xp = 20

        else:
            reward_type = (
                "repeat"
            )

            reward_label = (
                "Repeat sighting"
            )

            base_coins = 5
            base_xp = 5

        # -----------------------------------------
        # Biodiversity streak
        #
        # Only a different species can receive the
        # streak multiplier. A repeat sighting still
        # earns its normal reward but cannot farm ×2.
        # -----------------------------------------

        reward_multiplier = (
            biodiversity_multiplier(
                projected_daily_unique
            )

            if new_daily_species

            else 1.0
        )

        coin_reward = int(
            math.floor(
                base_coins
                * reward_multiplier
                + 0.5
            )
        )

        xp_reward = int(
            math.floor(
                base_xp
                * reward_multiplier
                + 0.5
            )
        )

        # -----------------------------------------
        # Save observation
        # -----------------------------------------

        observation_id = db.execute(
            """
            INSERT INTO plant_observations(
                user_id,
                taxon_key,
                common_name,
                scientific_name,
                latitude,
                longitude,
                accuracy_m
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                uid,
                taxon_key,
                common_name,
                scientific_name,
                latitude,
                longitude,
                accuracy,
            ),
        ).lastrowid

        # Add the species to today's unique-species
        # streak if it has not already appeared today.

        if new_daily_species:
            db.execute(
                """
                INSERT OR IGNORE INTO biodiversity_daily_species(
                    user_id,
                    streak_date,
                    taxon_key
                )
                VALUES (?, ?, ?)
                """,
                (
                    uid,
                    today,
                    taxon_key,
                ),
            )

        db.execute(
            """
            INSERT OR IGNORE INTO game_state(
                user_id
            )
            VALUES (?)
            """,
            (
                uid,
            ),
        )

        # Coins and XP are now awarded by Flask.

        db.execute(
            """
            UPDATE game_state
            SET
                snaps_completed =
                    snaps_completed + 1,

                snaps_taken =
                    snaps_taken + 1,

                points =
                    points + ?,

                score =
                    score + ?

            WHERE user_id = ?
            """,
            (
                coin_reward,
                xp_reward,
                uid,
            ),
        )

        # Achievement XP is calculated after the
        # biodiversity XP has been added.

        new_achievements = (
            check_and_update_achievements(
                db,
                uid,
            )
        )

        # Daily / community / special quest rewards
        # remain separate coin rewards.

        quest_update = apply_quest_event(
            db,
            uid,
            "snap",
        )

        balance = db.execute(
            """
            SELECT
                points,
                score
            FROM game_state
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()

        biodiversity = (
            biodiversity_snapshot(
                db,
                uid,
            )
        )

        observation = db.execute(
            """
            SELECT
                id,

                COALESCE(
                    common_name,
                    scientific_name,
                    'Plant'
                ) AS name,

                common_name,
                scientific_name,
                latitude,
                longitude,
                accuracy_m,
                created_at

            FROM plant_observations
            WHERE id = ?
            """,
            (
                observation_id,
            ),
        ).fetchone()
    return jsonify({
        "identification": identification,
        "predictions": predictions,
        "questUpdate": quest_update,
        "reward": {
            "type": reward_type,
            "label": reward_label,
            "coins": coin_reward,
            "xp": xp_reward,
            "baseCoins": base_coins,
            "baseXp": base_xp,
            "multiplier": reward_multiplier,
            "newDailySpecies": new_daily_species,
            "firstSpecies": first_species,
            "newArea": new_area,
            "nearestPreviousMetres": (
                round(nearest_distance, 1)
                if nearest_distance is not None
                else None
            ),
        },
        "balance": {
            "coins": int(balance["points"] or 0),
            "xp": int(balance["score"] or 0),
        },
        "biodiversity": biodiversity,
        "newAchievements": new_achievements,
        "observation": dict(observation),
        "remaining_at_location": max(
            0,
            MAX_SAME_PLANT_PER_LOCATION - nearby_count - 1,
        ),
        "locationLimit": {
            "maxSamePlant": MAX_SAME_PLANT_PER_LOCATION,
            "radiusMetres": OBSERVATION_RADIUS_METRES,
            "newAreaRadiusMetres": NEW_AREA_RADIUS_METRES,
        },
    })


@app.get("/api/quests")
def list_quests():
    uid, error = login_required()
    if error:
        return error
    with get_db() as db:
        return jsonify({"quests": quest_snapshot(db, uid)})


@app.post("/api/quests/event")
def quest_event():
    uid, error = login_required()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    event_type = str(data.get("event", "")).strip().lower()
    if event_type != "gacha":
        return jsonify({"error": "Unsupported quest event."}), 400
    with get_db() as db:
        update = apply_quest_event(db, uid, event_type)
    return jsonify({"questUpdate": update})




@app.post("/api/quests/daily/<quest_key>/claim")
def claim_daily_quest(
    quest_key,
):
    uid, error = (
        login_required()
    )

    if error:
        return error

    quest = next(
        (
            item
            for item
            in DAILY_QUESTS
            if item[
                "key"
            ] == quest_key
        ),
        None,
    )

    if not quest:
        return jsonify(
            {
                "error":
                    "Daily quest not found."
            }
        ), 404

    with get_db() as db:

        row = (
            quest_progress_row(
                db,
                uid,
                quest_key,
            )
        )

        if not row[
            "completed"
        ]:
            return jsonify(
                {
                    "error":
                        (
                            "Complete the quest "
                            "before claiming its reward."
                        )
                }
            ), 400

        if row[
            "reward_claimed"
        ]:
            return jsonify(
                {
                    "error":
                        (
                            "That quest reward "
                            "has already been claimed."
                        )
                }
            ), 409

        db.execute(
            """
            UPDATE daily_quest_progress
            SET reward_claimed = 1
            WHERE
                user_id = ?
                AND quest_key = ?
                AND quest_date = ?
            """,
            (
                uid,
                quest_key,
                quest_date(),
            ),
        )

        db.execute(
            """
            UPDATE game_state
            SET
                points =
                    points + ?,

                score =
                    score + ?

            WHERE user_id = ?
            """,
            (
                quest[
                    "reward"
                ],

                quest[
                    "xp_reward"
                ],

                uid,
            ),
        )

        balance = db.execute(
            """
            SELECT
                points,
                score
            FROM game_state
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()

    return jsonify(
        {
            "reward":
                quest[
                    "reward"
                ],

            "xp_reward":
                quest[
                    "xp_reward"
                ],

            "title":
                quest[
                    "title"
                ],

            "balance":
                {
                    "coins":
                        int(
                            balance[
                                "points"
                            ]
                            or 0
                        ),

                    "xp":
                        int(
                            balance[
                                "score"
                            ]
                            or 0
                        ),
                },
        }
    )


@app.post("/api/quests/weekly/<quest_key>/claim")
def claim_weekly_quest(
    quest_key,
):
    uid, error = (
        login_required()
    )

    if error:
        return error

    quest = next(
        (
            item
            for item
            in WEEKLY_QUESTS
            if item[
                "key"
            ] == quest_key
        ),
        None,
    )

    if not quest:
        return jsonify(
            {
                "error":
                    "Weekly quest not found."
            }
        ), 404

    with get_db() as db:

        status = (
            weekly_quest_status(
                db,
                uid,
                quest,
            )
        )

        if not status[
            "completed"
        ]:
            return jsonify(
                {
                    "error":
                        (
                            "Complete the weekly quest "
                            "before claiming its reward."
                        )
                }
            ), 400

        if status[
            "claimed"
        ]:
            return jsonify(
                {
                    "error":
                        (
                            "That weekly reward "
                            "has already been claimed."
                        )
                }
            ), 409

        db.execute(
            """
            INSERT INTO weekly_quest_claims(
                user_id,
                quest_key,
                week_key
            )
            VALUES (?, ?, ?)
            """,
            (
                uid,
                quest[
                    "key"
                ],
                week_key(),
            ),
        )

        db.execute(
            """
            UPDATE game_state
            SET
                points =
                    points + ?,

                score =
                    score + ?

            WHERE user_id = ?
            """,
            (
                quest[
                    "reward"
                ],

                quest[
                    "xp_reward"
                ],

                uid,
            ),
        )

        balance = db.execute(
            """
            SELECT
                points,
                score
            FROM game_state
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()

    return jsonify(
        {
            "reward":
                quest[
                    "reward"
                ],

            "xp_reward":
                quest[
                    "xp_reward"
                ],

            "title":
                quest[
                    "title"
                ],

            "balance":
                {
                    "coins":
                        int(
                            balance[
                                "points"
                            ]
                            or 0
                        ),

                    "xp":
                        int(
                            balance[
                                "score"
                            ]
                            or 0
                        ),
                },
        }
    )


@app.post("/api/quests/community/<int:milestone_target>/claim")
def claim_community_milestone(
    milestone_target,
):
    uid, error = (
        login_required()
    )

    if error:
        return error

    milestone = next(
        (
            item
            for item
            in COMMUNITY_QUEST[
                "milestones"
            ]
            if int(
                item[
                    "target"
                ]
            )
            == milestone_target
        ),
        None,
    )

    if not milestone:
        return jsonify(
            {
                "error":
                    (
                        "Community milestone "
                        "not found."
                    )
            }
        ), 404

    with get_db() as db:

        progress_row = (
            db.execute(
                """
                SELECT progress
                FROM community_quest_state
                WHERE quest_key = ?
                """,
                (
                    COMMUNITY_QUEST[
                        "key"
                    ],
                ),
            ).fetchone()
        )

        progress = int(
            progress_row[
                "progress"
            ]
            if progress_row
            else 0
        )

        if (
            progress
            < milestone_target
        ):
            return jsonify(
                {
                    "error":
                        (
                            "That community milestone "
                            "has not been reached yet."
                        )
                }
            ), 400

        contribution_row = (
            db.execute(
                """
                SELECT contribution
                FROM community_contributions
                WHERE
                    quest_key = ?
                    AND user_id = ?
                """,
                (
                    COMMUNITY_QUEST[
                        "key"
                    ],
                    uid,
                ),
            ).fetchone()
        )

        contribution = int(
            contribution_row[
                "contribution"
            ]
            if contribution_row
            else 0
        )

        if (
            contribution
            <= 0
        ):
            return jsonify(
                {
                    "error":
                        (
                            "Make at least one biodiversity "
                            "contribution before claiming "
                            "community rewards."
                        )
                }
            ), 403

        claimed = db.execute(
            """
            SELECT 1
            FROM community_milestone_claims
            WHERE
                quest_key = ?
                AND milestone_target = ?
                AND user_id = ?
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
                milestone_target,
                uid,
            ),
        ).fetchone()

        if claimed:
            return jsonify(
                {
                    "error":
                        (
                            "You have already claimed "
                            "this community milestone."
                        )
                }
            ), 409

        db.execute(
            """
            INSERT INTO community_milestone_claims(
                quest_key,
                milestone_target,
                user_id
            )
            VALUES (?, ?, ?)
            """,
            (
                COMMUNITY_QUEST[
                    "key"
                ],
                milestone_target,
                uid,
            ),
        )

        db.execute(
            """
            UPDATE game_state
            SET
                points =
                    points + ?,

                score =
                    score + ?

            WHERE user_id = ?
            """,
            (
                milestone[
                    "reward"
                ],

                milestone[
                    "xp_reward"
                ],

                uid,
            ),
        )

        balance = db.execute(
            """
            SELECT
                points,
                score
            FROM game_state
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()

    return jsonify(
        {
            "target":
                milestone_target,

            "reward":
                milestone[
                    "reward"
                ],

            "xp_reward":
                milestone[
                    "xp_reward"
                ],

            "balance":
                {
                    "coins":
                        int(
                            balance[
                                "points"
                            ]
                            or 0
                        ),

                    "xp":
                        int(
                            balance[
                                "score"
                            ]
                            or 0
                        ),
                },
        }
    )

@app.post("/api/quests/special/create")
def create_special_quest():
    uid, error = login_required()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    raw_tasks = data.get("tasks")
    if not isinstance(raw_tasks, list):
        raw_tasks = [
            {
                "plant": data.get("plant", ""),
                "required_snaps": data.get("required_snaps", 1),
            }
        ]

    tasks = []
    for raw_task in raw_tasks[:10]:
        plant = str(raw_task.get("plant", "")).strip()[:80]
        try:
            required_snaps = int(raw_task.get("required_snaps", 0))
        except (TypeError, ValueError):
            return jsonify({"error": "Each task needs a numeric snap count."}), 400
        if not plant or not 1 <= required_snaps <= 1000:
            return (
                jsonify(
                    {"error": "Each task needs a plant and between 1 and 1,000 snaps."}
                ),
                400,
            )
        tasks.append({"plant": plant, "required_snaps": required_snaps})

    if not tasks:
        return jsonify({"error": "Add at least one task."}), 400
    target = sum(task["required_snaps"] for task in tasks)
    if target > 1000:
        return (
            jsonify(
                {"error": "Special quests can require at most 1,000 snaps in total."}
            ),
            400,
        )

    with get_db() as db:
        code = None
        while not code:
            candidate = secrets.token_hex(4).upper()
            if not db.execute(
                "SELECT 1 FROM special_quests WHERE code = ?", (candidate,)
            ).fetchone():
                code = candidate
        cur = db.execute(
            """
            INSERT INTO special_quests(code, plant_name, target_snaps, tasks_json, created_by)
            VALUES (?, ?, ?, ?, ?)
            """,
            (code, tasks[0]["plant"], target, json.dumps(tasks), uid),
        )
    return (
        jsonify({"id": cur.lastrowid, "code": code, "tasks": tasks, "target": target}),
        201,
    )


@app.post("/api/quests/special/redeem")
def redeem_special_quest():
    uid, error = login_required()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip().upper()
    if not re.fullmatch(r"[A-Z0-9]{8}", code):
        return jsonify({"error": "Enter the 8-character quest code."}), 400
    with get_db() as db:
        quest = db.execute(
            "SELECT id, code, plant_name, target_snaps FROM special_quests WHERE code = ?",
            (code,),
        ).fetchone()
        if not quest:
            return jsonify({"error": "That special quest code was not found."}), 404
        db.execute(
            "INSERT OR IGNORE INTO special_quest_progress(quest_id, user_id) VALUES (?, ?)",
            (quest["id"], uid),
        )
    return jsonify(
        {
            "ok": True,
            "quest": {
                "code": quest["code"],
                "plant": quest["plant_name"],
                "target": quest["target_snaps"],
            },
        }
    )


@app.delete("/api/quests/special/<int:quest_id>")
def delete_special_quest(quest_id):
    uid, error = login_required()
    if error:
        return error
    with get_db() as db:
        cur = db.execute(
            "DELETE FROM special_quest_progress WHERE quest_id = ? AND user_id = ?",
            (quest_id, uid),
        )
    if cur.rowcount == 0:
        return jsonify({"error": "Special quest not found in your list."}), 404
    return jsonify({"ok": True})


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    role = str(data.get("role", "generic")).strip().lower()
    teacher_code = str(data.get("teacher_code", ""))

    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid account type."}), 400

    if role == "teacher":
        if not TEACHER_INVITE_CODE:
            return jsonify({"error": "Teacher registration is not configured."}), 503
        if teacher_code != TEACHER_INVITE_CODE:
            return jsonify({"error": "Invalid teacher invite code."}), 403

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
                "INSERT INTO users(username, password_hash, role) VALUES (?, ?, ?)",
                (username, generate_password_hash(password), role),
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
                    INSERT INTO plants
                        (user_id, slot, item_key, name, icon, rarity, kind)
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
                    (user_id, key),
                )

            # Check initial achievements
            check_and_update_achievements(db, user_id)

    except sqlite3.IntegrityError:
        return jsonify({"error": "That username is already taken."}), 409

    session.clear()
    session["user_id"] = user_id
    return jsonify({"ok": True, "username": username, "role": role}), 201


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
            "SELECT id, username, role FROM users WHERE id = ?", (uid,)
        ).fetchone()
        if not user:
            session.clear()
            return jsonify({"error": "Account not found"}), 401
        state = state_for_user(db, uid)

    return jsonify({"user": dict(user), "state": state})


@app.get("/api/observations")
@app.get("/api/map-plants")
def map_plants():
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        rows = db.execute(
            """
                        SELECT id, COALESCE(common_name, scientific_name, 'Plant') AS name,
                                     common_name, scientific_name, latitude, longitude, accuracy_m, created_at
                        FROM plant_observations
                        WHERE user_id = ?
                        ORDER BY created_at DESC, id DESC
            """,
            (uid,),
        ).fetchall()

    return jsonify({
        "plants": [dict(row) for row in rows],
        "limit": {
            "max_same_plant": MAX_SAME_PLANT_PER_LOCATION,
            "radius_metres": OBSERVATION_RADIUS_METRES,
        },
    })



@app.post("/api/habitats/<habitat_key>/build")
def build_habitat(
    habitat_key,
):
    uid, error = (
        login_required()
    )

    if error:
        return error

    habitat_key = str(
        habitat_key
        or ""
    ).strip().lower()

    config = (
        HABITATS.get(
            habitat_key
        )
    )

    if not config:
        return jsonify(
            {
                "error":
                    "That wildlife habitat does not exist."
            }
        ), 404

    with get_db() as db:

        db.execute(
            """
            INSERT OR IGNORE INTO game_state(
                user_id
            )
            VALUES (?)
            """,
            (
                uid,
            ),
        )

        already_built = db.execute(
            """
            SELECT 1
            FROM user_habitats
            WHERE
                user_id = ?
                AND habitat_key = ?
            """,
            (
                uid,
                habitat_key,
            ),
        ).fetchone()

        if already_built:
            return jsonify(
                {
                    "error":
                        (
                            "You have already built "
                            f"{config['name']}."
                        )
                }
            ), 409

        state = db.execute(
            """
            SELECT
                points,
                score,
                garden_level
            FROM game_state
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()

        coins = int(
            state[
                "points"
            ]
            or 0
        )

        xp = int(
            state[
                "score"
            ]
            or 0
        )

        garden_level = int(
            state[
                "garden_level"
            ]
            or 1
        )

        player_level = (
            player_level_from_xp(
                xp
            )
        )

        unique_species = db.execute(
            """
            SELECT COUNT(
                DISTINCT taxon_key
            )
            FROM plant_observations
            WHERE user_id = ?
            """,
            (
                uid,
            ),
        ).fetchone()[0]

        unique_species = int(
            unique_species
            or 0
        )

        missing = []

        if (
            player_level
            < config[
                "player_level"
            ]
        ):
            missing.append(
                (
                    "Player Level "
                    f"{config['player_level']}"
                )
            )

        if (
            garden_level
            < config[
                "garden_level"
            ]
        ):
            missing.append(
                (
                    "Garden Level "
                    f"{config['garden_level']}"
                )
            )

        if (
            unique_species
            < config[
                "unique_species"
            ]
        ):
            missing.append(
                (
                    f"{config['unique_species']} "
                    "different species discovered"
                )
            )

        if missing:
            return jsonify(
                {
                    "error":
                        (
                            "Complete the habitat "
                            "requirements first: "
                            + ", ".join(
                                missing
                            )
                            + "."
                        ),

                    "habitats":
                        habitat_snapshot(
                            db,
                            uid,
                        ),
                }
            ), 409

        cost = int(
            config[
                "cost"
            ]
        )

        if (
            coins
            < cost
        ):
            return jsonify(
                {
                    "error":
                        (
                            f"You need {cost} coins "
                            f"to build {config['name']}."
                        ),

                    "required":
                        cost,

                    "coins":
                        coins,

                    "habitats":
                        habitat_snapshot(
                            db,
                            uid,
                        ),
                }
            ), 409

        db.execute(
            """
            UPDATE game_state
            SET points =
                points - ?
            WHERE user_id = ?
            """,
            (
                cost,
                uid,
            ),
        )

        db.execute(
            """
            INSERT INTO user_habitats(
                user_id,
                habitat_key
            )
            VALUES (?, ?)
            """,
            (
                uid,
                habitat_key,
            ),
        )

        db.execute(
            """
            INSERT OR IGNORE INTO collection_items(
                user_id,
                item_key,
                name,
                icon,
                rarity,
                kind
            )
            VALUES (?, ?, ?, ?, 'decor', 'decor')
            """,
            (
                uid,
                habitat_key,
                config[
                    "animal_name"
                ],
                config[
                    "animal_icon"
                ],
            ),
        )

        state = (
            state_for_user(
                db,
                uid,
            )
        )

    return jsonify(
        {
            "ok":
                True,

            "message":
                (
                    f"{config['name']} built. "
                    f"{config['animal_name']} unlocked!"
                ),

            "animal":
                {
                    "key":
                        habitat_key,

                    "name":
                        config[
                            "animal_name"
                        ],

                    "icon":
                        config[
                            "animal_icon"
                        ],
                },

            "state":
                state,

            "habitats":
                state[
                    "habitats"
                ],
        }
    )


@app.post("/api/garden/upgrade")
def upgrade_garden():
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        state = db.execute(
            "SELECT points, garden_level FROM game_state WHERE user_id = ?",
            (uid,),
        ).fetchone()
        if not state:
            db.execute("INSERT INTO game_state(user_id) VALUES (?)", (uid,))
            state = db.execute(
                "SELECT points, garden_level FROM game_state WHERE user_id = ?",
                (uid,),
            ).fetchone()

        current_level = int(state["garden_level"] or 1)
        upgrade = next(
            (
                item
                for item in GARDEN_UPGRADES
                if item["level"] == current_level + 1
            ),
            None,
        )
        if not upgrade:
            return jsonify({"error": "Your garden is already fully expanded."}), 409

        points = int(state["points"] or 0)
        if points < upgrade["cost"]:
            return jsonify({
                "error": f"You need {upgrade['cost']} coins for the next garden upgrade.",
                "required": upgrade["cost"],
                "points": points,
            }), 400

        db.execute(
            """
            UPDATE game_state
            SET points = points - ?,
                garden_level = ?,
                unlocked_plots = ?
            WHERE user_id = ?
            """,
            (upgrade["cost"], upgrade["level"], upgrade["plots"], uid),
        )
        saved_state = state_for_user(db, uid)

    return jsonify({
        "ok": True,
        "points": saved_state["points"],
        "garden": saved_state["garden"],
        "state": saved_state,
    })


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
                score = MAX(game_state.score, excluded.score),
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
                INSERT INTO plants
                    (user_id, slot, item_key, name, icon, rarity, kind)
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

    # Return the authoritative saved state too.
    # Achievement checks can add XP on the server, so
    # the browser should refresh its local copy.
    with get_db() as db:
        saved_state = state_for_user(
            db,
            uid,
        )

    return jsonify(
        {
            "ok":
                True,

            "new_achievements":
                new_achievements,

            "state":
                saved_state,
        }
    )


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
            (uid,),
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
            (uid, uid, uid, uid, uid, uid, uid, uid, uid),
        ).fetchone()

        # Parse achievement progress
        progress_map = {row["achievement_key"]: dict(row) for row in user_achievements}

        # Calculate achievement status
        achievements = []
        for key, defn in ACHIEVEMENTS.items():
            prog = progress_map.get(key, {"progress": 0, "completed": 0})

            # Calculate current progress based on stats
            current_progress = prog["progress"]

            achievements.append(
                {
                    "key": key,
                    "name": defn["name"],
                    "description": defn["description"],
                    "icon": defn["icon"],
                    "points": defn["points"],
                    "progress": current_progress,
                    "max_progress": defn["max_progress"],
                    "completed": bool(prog["completed"]),
                    "unlocked_at": (
                        prog.get("unlocked_at") if prog["completed"] else None
                    ),
                }
            )

    return jsonify({"achievements": achievements})


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


# =========================================================
# CLASSROOMS / ROLE-BASED ACCESS CONTROL
# =========================================================


@app.get("/api/classrooms")
def list_classrooms():
    user, error = role_required("student", "teacher")
    if error:
        return error

    with get_db() as db:
        if user["role"] == "teacher":
            rows = db.execute(
                """
                SELECT
                    c.id,
                    c.name,
                    c.created_at,
                    COUNT(cm.student_id) AS student_count
                FROM classrooms c
                LEFT JOIN classroom_members cm ON cm.classroom_id = c.id
                WHERE c.teacher_id = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC, c.name
                """,
                (user["id"],),
            ).fetchall()
        else:
            rows = db.execute(
                """
                SELECT
                    c.id,
                    c.name,
                    c.created_at,
                    u.username AS teacher_username,
                    (
                        SELECT COUNT(*)
                        FROM classroom_members cm2
                        WHERE cm2.classroom_id = c.id
                    ) AS student_count
                FROM classroom_members cm
                JOIN classrooms c ON c.id = cm.classroom_id
                JOIN users u ON u.id = c.teacher_id
                WHERE cm.student_id = ?
                ORDER BY c.name
                """,
                (user["id"],),
            ).fetchall()

    return jsonify({"classrooms": [dict(row) for row in rows]})


@app.post("/api/classrooms")
def create_classroom():
    user, error = role_required("teacher")
    if error:
        return error

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()[:80]
    if len(name) < 2:
        return jsonify({"error": "Classroom name must be at least 2 characters."}), 400

    with get_db() as db:
        cur = db.execute(
            "INSERT INTO classrooms(name, teacher_id) VALUES (?, ?)",
            (name, user["id"]),
        )
        classroom_id = cur.lastrowid

    return jsonify({"ok": True, "classroom_id": classroom_id}), 201


@app.get("/api/classrooms/<int:classroom_id>")
def classroom_detail(classroom_id):
    uid, error = login_required()
    if error:
        return error

    with get_db() as db:
        user = db.execute(
            "SELECT id, username, role FROM users WHERE id = ?",
            (uid,),
        ).fetchone()
        if not user:
            session.clear()
            return jsonify({"error": "Account not found"}), 401

        classroom = db.execute(
            """
            SELECT c.id, c.name, c.teacher_id, c.created_at,
                   u.username AS teacher_username
            FROM classrooms c
            JOIN users u ON u.id = c.teacher_id
            WHERE c.id = ?
            """,
            (classroom_id,),
        ).fetchone()
        if not classroom:
            return jsonify({"error": "Classroom not found."}), 404

        is_teacher = user["role"] == "teacher" and classroom["teacher_id"] == uid
        is_student = user["role"] == "student" and student_in_classroom(
            db, uid, classroom_id
        )
        if not (is_teacher or is_student):
            return jsonify({"error": "You do not have access to this classroom."}), 403

        roster = db.execute(
            """
            SELECT
                u.id,
                u.username,
                COALESCE(gs.score, 0) AS score,
                COALESCE(gs.points, 0) AS points,
                COALESCE(gs.snaps_completed, 0) AS snaps_completed,
                (SELECT COUNT(*) FROM collection_items ci WHERE ci.user_id = u.id) AS collection_count,
                (SELECT COUNT(*) FROM plants p WHERE p.user_id = u.id) AS placed_count
            FROM classroom_members cm
            JOIN users u ON u.id = cm.student_id
            LEFT JOIN game_state gs ON gs.user_id = u.id
            WHERE cm.classroom_id = ?
            ORDER BY score DESC, u.username COLLATE NOCASE
            """,
            (classroom_id,),
        ).fetchall()

        quest_rows = db.execute(
            """
            SELECT id, classroom_id, created_by, title, description,
                   target_type, target_value, due_at, is_active, created_at
            FROM quests
            WHERE classroom_id = ? AND is_active = 1
            ORDER BY created_at DESC
            """,
            (classroom_id,),
        ).fetchall()

        quests = []
        for quest_row in quest_rows:
            quest = dict(quest_row)
            if is_teacher:
                completed_count = 0
                for student in roster:
                    if quest_progress_for(db, quest_row, student["id"])["completed"]:
                        completed_count += 1
                quest["completed_count"] = completed_count
                quest["student_count"] = len(roster)
            else:
                quest["progress"] = quest_progress_for(db, quest_row, uid)
            quests.append(quest)

    return jsonify(
        {
            "classroom": dict(classroom),
            "viewer_role": user["role"],
            "roster": [dict(row) for row in roster] if is_teacher else [],
            "leaderboard": [dict(row) for row in roster],
            "quests": quests,
        }
    )


@app.get("/api/classrooms/<int:classroom_id>/students/search")
def search_classroom_students(classroom_id):
    teacher, error = role_required("teacher")
    if error:
        return error

    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"students": []})

    with get_db() as db:
        if not teacher_owns_classroom(db, teacher["id"], classroom_id):
            return jsonify({"error": "Classroom not found."}), 404

        rows = db.execute(
            """
            SELECT id, username
            FROM users
            WHERE role = 'student'
              AND username LIKE ? COLLATE NOCASE
              AND id NOT IN (
                    SELECT student_id
                    FROM classroom_members
                    WHERE classroom_id = ?
              )
            ORDER BY username
            LIMIT 12
            """,
            (f"%{q}%", classroom_id),
        ).fetchall()

    return jsonify({"students": [dict(row) for row in rows]})


@app.post("/api/classrooms/<int:classroom_id>/students")
def add_classroom_student(classroom_id):
    teacher, error = role_required("teacher")
    if error:
        return error

    data = request.get_json(silent=True) or {}
    try:
        student_id = int(data.get("student_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid student."}), 400

    with get_db() as db:
        if not teacher_owns_classroom(db, teacher["id"], classroom_id):
            return jsonify({"error": "Classroom not found."}), 404

        student = db.execute(
            "SELECT id, username, role FROM users WHERE id = ?",
            (student_id,),
        ).fetchone()
        if not student:
            return jsonify({"error": "Student not found."}), 404
        if student["role"] != "student":
            return (
                jsonify(
                    {"error": "Only student accounts can be added to a classroom."}
                ),
                400,
            )

        try:
            db.execute(
                """
                INSERT INTO classroom_members(classroom_id, student_id)
                VALUES (?, ?)
                """,
                (classroom_id, student_id),
            )
        except sqlite3.IntegrityError:
            return jsonify({"error": "That student is already in the classroom."}), 409

    return jsonify({"ok": True, "student": dict(student)}), 201


@app.delete("/api/classrooms/<int:classroom_id>/students/<int:student_id>")
def remove_classroom_student(classroom_id, student_id):
    teacher, error = role_required("teacher")
    if error:
        return error

    with get_db() as db:
        if not teacher_owns_classroom(db, teacher["id"], classroom_id):
            return jsonify({"error": "Classroom not found."}), 404

        cur = db.execute(
            """
            DELETE FROM classroom_members
            WHERE classroom_id = ? AND student_id = ?
            """,
            (classroom_id, student_id),
        )
        db.execute(
            """
            DELETE FROM quest_progress
            WHERE student_id = ?
              AND quest_id IN (
                    SELECT id FROM quests WHERE classroom_id = ?
              )
            """,
            (student_id, classroom_id),
        )

    if cur.rowcount == 0:
        return jsonify({"error": "Student is not in this classroom."}), 404
    return jsonify({"ok": True})


@app.post("/api/classrooms/<int:classroom_id>/quests")
def create_classroom_quest(classroom_id):
    teacher, error = role_required("teacher")
    if error:
        return error

    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()[:80]
    description = str(data.get("description", "")).strip()[:400]
    target_type = str(data.get("target_type", "manual")).strip().lower()
    due_at = str(data.get("due_at", "")).strip()[:32] or None

    try:
        target_value = int(data.get("target_value", 1))
    except (TypeError, ValueError):
        return jsonify({"error": "Target must be a number."}), 400

    if not title:
        return jsonify({"error": "Quest title is required."}), 400
    if target_type not in VALID_QUEST_TYPES:
        return jsonify({"error": "Invalid quest target."}), 400
    if target_type == "manual":
        target_value = 1
    elif not 1 <= target_value <= 1_000_000:
        return jsonify({"error": "Quest target must be between 1 and 1,000,000."}), 400

    with get_db() as db:
        if not teacher_owns_classroom(db, teacher["id"], classroom_id):
            return jsonify({"error": "Classroom not found."}), 404

        cur = db.execute(
            """
            INSERT INTO quests(
                classroom_id, created_by, title, description,
                target_type, target_value, due_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                classroom_id,
                teacher["id"],
                title,
                description,
                target_type,
                target_value,
                due_at,
            ),
        )
        quest_id = cur.lastrowid

    return jsonify({"ok": True, "quest_id": quest_id}), 201


@app.delete("/api/classrooms/<int:classroom_id>/quests/<int:quest_id>")
def delete_classroom_quest(classroom_id, quest_id):
    teacher, error = role_required("teacher")
    if error:
        return error

    with get_db() as db:
        if not teacher_owns_classroom(db, teacher["id"], classroom_id):
            return jsonify({"error": "Classroom not found."}), 404

        cur = db.execute(
            """
            DELETE FROM quests
            WHERE id = ? AND classroom_id = ?
            """,
            (quest_id, classroom_id),
        )

    if cur.rowcount == 0:
        return jsonify({"error": "Quest not found."}), 404
    return jsonify({"ok": True})


@app.post("/api/classrooms/<int:classroom_id>/quests/<int:quest_id>/complete")
def complete_manual_quest(classroom_id, quest_id):
    student, error = role_required("student")
    if error:
        return error

    with get_db() as db:
        if not student_in_classroom(db, student["id"], classroom_id):
            return jsonify({"error": "You are not in this classroom."}), 403

        quest = db.execute(
            """
            SELECT id, target_type
            FROM quests
            WHERE id = ? AND classroom_id = ? AND is_active = 1
            """,
            (quest_id, classroom_id),
        ).fetchone()
        if not quest:
            return jsonify({"error": "Quest not found."}), 404
        if quest["target_type"] != "manual":
            return jsonify({"error": "This quest completes automatically."}), 400

        db.execute(
            """
            INSERT INTO quest_progress(quest_id, student_id, status, completed_at)
            VALUES (?, ?, 'completed', CURRENT_TIMESTAMP)
            ON CONFLICT(quest_id, student_id) DO UPDATE SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP
            """,
            (quest_id, student["id"]),
        )

    return jsonify({"ok": True})


init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
