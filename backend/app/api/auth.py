from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import datetime, timezone
import re

from app import db
from app.models.user import User
from app.models.session import TokenBlocklist

auth_bp = Blueprint("auth", __name__)


def validate_password(password):
    """Returns error string or None if valid."""
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return "Password must contain at least one number"
    return None


def validate_username(username):
    """Returns error string or None if valid."""
    if not username or len(username) < 3:
        return "Username must be at least 3 characters"
    if len(username) > 30:
        return "Username must be 30 characters or less"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return "Username can only contain letters, numbers, and underscores"
    return None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # ── Validate inputs ──────────────────────────────────────────────
    if not username:
        return jsonify({"error": "Username is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    username_error = validate_username(username)
    if username_error:
        return jsonify({"error": username_error}), 400

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return jsonify({"error": "Please enter a valid email address"}), 400

    password_error = validate_password(password)
    if password_error:
        return jsonify({"error": password_error}), 400

    # ── Check duplicates ─────────────────────────────────────────────
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    # ── Create user ──────────────────────────────────────────────────
    try:
        user = User(
            username=username,
            email=email,
            display_name=username,
            role="user",
            is_active=True,
            is_verified=False,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Register DB error: {e}")
        return jsonify({"error": "Could not create account. Please try again."}), 500

    # ── Try to send welcome email (non-blocking) ─────────────────────
    try:
        from app.utils.email import send_verification_email
        send_verification_email(user)
    except Exception as e:
        # Email failure must NOT block registration
        current_app.logger.warning(f"Welcome email failed (non-fatal): {e}")

    # ── Return success immediately ───────────────────────────────────
    return jsonify({
        "message": "Account created successfully! You can now sign in.",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Incorrect email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Your account has been disabled. Please contact support."}), 403

    # Update last seen
    try:
        user.last_seen = datetime.now(timezone.utc)
        db.session.commit()
    except Exception:
        db.session.rollback()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name or user.username,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        now = datetime.now(timezone.utc)
        db.session.add(TokenBlocklist(jti=jti, created_at=now))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Logout error: {e}")
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name or user.username,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
    }), 200


@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):
    try:
        from app.utils.email import verify_token
        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired verification link"}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.is_verified = True
        db.session.commit()
        return jsonify({"message": "Email verified successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Verification failed"}), 400


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    # Always return success to prevent email enumeration
    try:
        user = User.query.filter_by(email=email).first()
        if user:
            from app.utils.email import send_password_reset_email
            send_password_reset_email(user)
    except Exception as e:
        current_app.logger.warning(f"Password reset email failed: {e}")
    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200


@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    try:
        from app.utils.email import verify_token
        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired reset link"}), 400
        data = request.get_json(silent=True) or {}
        password = data.get("password") or ""
        error = validate_password(password)
        if error:
            return jsonify({"error": error}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.set_password(password)
        db.session.commit()
        return jsonify({"message": "Password reset successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Reset failed"}), 400

