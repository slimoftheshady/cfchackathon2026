"""Seed repeatable teacher, student, and classroom data for local testing."""

from werkzeug.security import generate_password_hash

from app import STARTER_ITEMS, get_db, init_db

TEACHER_USERNAME = "demo_teacher"
TEACHER_PASSWORD = "teacher123"
STUDENT_USERNAME = "demo_student"
STUDENT_PASSWORD = "student123"
ADDITIONAL_STUDENTS = [
    ("demo_student_2", "student123"),
    ("demo_student_3", "student123"),
]
CLASSROOM_NAME = "Wildflower Explorers"


def get_or_create_user(db, username, password, role):
    user = db.execute(
        "SELECT id FROM users WHERE username = ? COLLATE NOCASE",
        (username,),
    ).fetchone()

    if user:
        user_id = user["id"]
        db.execute(
            """
            UPDATE users
            SET password_hash = ?, role = ?
            WHERE id = ?
            """,
            (generate_password_hash(password), role, user_id),
        )
        return user_id

    cursor = db.execute(
        """
        INSERT INTO users(username, password_hash, role)
        VALUES (?, ?, ?)
        """,
        (username, generate_password_hash(password), role),
    )
    user_id = cursor.lastrowid

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

    return user_id


def seed_demo_data():
    init_db()

    with get_db() as db:
        teacher_id = get_or_create_user(
            db,
            TEACHER_USERNAME,
            TEACHER_PASSWORD,
            "teacher",
        )
        student_ids = [
            get_or_create_user(
                db,
                STUDENT_USERNAME,
                STUDENT_PASSWORD,
                "student",
            )
        ]

        for username, password in ADDITIONAL_STUDENTS:
            student_ids.append(
                get_or_create_user(
                    db,
                    username,
                    password,
                    "student",
                )
            )

        classroom = db.execute(
            """
            SELECT id
            FROM classrooms
            WHERE name = ? AND teacher_id = ?
            """,
            (CLASSROOM_NAME, teacher_id),
        ).fetchone()

        if classroom:
            classroom_id = classroom["id"]
        else:
            classroom_id = db.execute(
                """
                INSERT INTO classrooms(name, teacher_id)
                VALUES (?, ?)
                """,
                (CLASSROOM_NAME, teacher_id),
            ).lastrowid

        for student_id in student_ids:
            db.execute(
                """
                INSERT OR IGNORE INTO classroom_members(classroom_id, student_id)
                VALUES (?, ?)
                """,
                (classroom_id, student_id),
            )

    print("Demo data is ready.")
    print(f"Teacher: {TEACHER_USERNAME} / {TEACHER_PASSWORD}")
    print(f"Student: {STUDENT_USERNAME} / {STUDENT_PASSWORD}")
    print("Additional students: demo_student_2, demo_student_3")
    print(f"Classroom: {CLASSROOM_NAME}")


if __name__ == "__main__":
    seed_demo_data()
