import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    print("Connecting to postgres...")
    try:
        # Connect to default 'postgres' database to create new db
        conn = psycopg2.connect(
            dbname='postgres', 
            user='postgres', 
            password='postgres', 
            host='127.0.0.1', 
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("Creating database tools24now...")
        cur.execute('CREATE DATABASE tools24now')
        print("Database tools24now created successfully!")
        
    except psycopg2.errors.DuplicateDatabase:
        print("Database tools24now already exists.")
    except Exception as e:
        print(f"Failed to create database: {e}")
        # We don't exit with 1 because it might be auth error which user can fix or we ignore if db exists
        # But for valid verification we want to know.
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_db()
