from app.db.session import SessionLocal
from app.db.models import Admin
from app.core.security import get_password_hash
import sys

def create_admin(username, password):
    db = SessionLocal()
    try:
        if db.query(Admin).filter(Admin.username == username).first():
            print(f"Admin {username} already exists")
            return
        
        hashed_pw = get_password_hash(password)
        admin = Admin(username=username, hashed_password=hashed_pw)
        db.add(admin)
        db.commit()
        print(f"Admin {username} created successfully")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <username> <password>")
        sys.exit(1)
    
    create_admin(sys.argv[1], sys.argv[2])
