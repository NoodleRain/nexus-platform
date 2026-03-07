from app import create_app, socketio, db
from app.models.user import User
from app.models.models import Post, Comment, Message, Notification, Upload, ActivityLog, SiteSettings, ContactMessage
from app.models.session import TokenBlocklist

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "User": User,
        "Post": Post,
        "Message": Message,
    }


@app.cli.command("init-db")
def init_db():
    """Initialize database tables."""
    with app.app_context():
        db.create_all()
        print("Database tables created.")


@app.cli.command("create-admin")
def create_admin():
    """Create default admin user."""
    import os
    with app.app_context():
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@nexus.app")
        admin_password = os.environ.get("ADMIN_PASSWORD", "Admin1234!")
        admin_username = os.environ.get("ADMIN_USERNAME", "admin")

        existing = User.query.filter_by(email=admin_email).first()
        if existing:
            print("Admin already exists.")
            return

        user = User(
            username=admin_username,
            email=admin_email,
            display_name="Admin",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        user.set_password(admin_password)
        db.session.add(user)
        db.session.commit()
        print(f"Admin created: {admin_email}")


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
