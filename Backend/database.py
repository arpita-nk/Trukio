from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./digitrail.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # type: ignore

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        print("Database connected successfully!")
        print("Result:", result.scalar())

except Exception as e:
    print("Database connection failed!")
    print(e)

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM gate_passes")
        )

        rows = result.fetchall()

        for row in rows:
            print(row)

except Exception as e:
    print("Error:", e)