from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import secrets


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120))
    avatar_url = db.Column(db.String(500))
    bio = db.Column(db.Text)
    role = db.Column(db.String(20), default="user")  # user, moderator, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expiry = db.Column(db.DateTime)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = db.relationship("Post", backref="author", lazy="dynamic", cascade="all, delete-orphan")
    sent_messages = db.relationship("Message", foreign_keys="Message.sender_id", backref="sender", lazy="dynamic")
    received_messages = db.relationship("Message", foreign_keys="Message.recipient_id", backref="recipient", lazy="dynamic")
    notifications = db.relationship("Notification", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    uploads = db.relationship("Upload", backref="uploader", lazy="dynamic", cascade="all, delete-orphan")
    activity_logs = db.relationship("ActivityLog", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_verification_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token

    def generate_reset_token(self):
        from datetime import timedelta
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expiry = datetime.utcnow() + timedelta(hours=2)
        return self.reset_token

    def is_admin(self):
        return self.role in ("admin",)

    def is_moderator(self):
        return self.role in ("admin", "moderator")

    def to_dict(self, include_private=False):
        data = {
            "id": self.id,
            "username": self.username,
            "display_name": self.display_name or self.username,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "role": self.role,
            "is_verified": self.is_verified,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "created_at": self.created_at.isoformat(),
        }
        if include_private:
            data["email"] = self.email
            data["is_active"] = self.is_active
        return data

    def __repr__(self):
        return f"<User {self.username}>"
