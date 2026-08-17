from database import engine, Base
from sqlalchemy import inspect
from models import GatePass, StatusEvent

Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

# Check table structure
inspector = inspect(engine)

tables = inspector.get_table_names()

for table in tables:
    print(f"\nTable: {table}")

    columns = inspector.get_columns(table)

    for column in columns:
        print(
            f"  {column['name']} "
            f"({column['type']})"
        )