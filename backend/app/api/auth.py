from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from app import db, mail, limiter
from app.models.user import User
from app.models.session import TokenBlocklist
from app.models.models import ActivityLog
from app.utils.email import send_verification_email, send_password_reset_email
from app.utils.validators import validate_email, validate_password, validate_username
from datetime import datetime
import re

auth_bp = Blueprint("auth", __name__)


def log_activity(user_id, action, request_obj):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        ip_address=request_obj.remote_addr,
        user_agent=request_obj.user_agent.string[:300] if request_obj.user_agent.string else None,
    )
    db.session.add(log)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Validate
    if not validate_username(username):
        return jsonify({"error": "Username must be 3-30 characters, alphanumeric and underscores only"}), 400
    if not validate_email(email):
        return jsonify({"error": "Invalid email address"}), 400
    if not validate_password(password):
        return jsonify({"error": "Password must be at least 8 characters with uppercase, lowercase, and number"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        username=username,
        email=email,
        display_name=username,
    )
    user.set_password(password)
    token = user.generate_verification_token()

    db.session.add(user)
    db.session.commit()

    # Send verification email
    try:
        send_verification_email(user, token)
    except Exception as e:
        current_app.logger.error(f"Email send failed: {e}")

    log_activity(user.id, "register", request)
    db.session.commit()

    return jsonify({
        "message": "Registration successful. Please verify your email.",
        "user": user.to_dict(include_private=True),
    }), 201


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per hour")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    identifier = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "Account has been deactivated"}), 403

    user.last_seen = datetime.utcnow()
    log_activity(user.id, "login", request)
    db.session.commit()

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(include_private=True),
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    token = TokenBlocklist(jti=jti)
    db.session.add(token)
    user_id = get_jwt_identity()
    log_activity(user_id, "logout", request)
    db.session.commit()
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({"error": "User not found or inactive"}), 404
    access_token = create_access_token(identity=user_id, additional_claims={"role": user.role})
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"error": "Invalid or expired verification token"}), 400

    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    return jsonify({"message": "Email verified successfully"}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("5 per hour")
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    user = User.query.filter_by(email=email).first()
    if user:
        token = user.generate_reset_token()
        db.session.commit()
        try:
            send_password_reset_email(user, token)
        except Exception as e:
            current_app.logger.error(f"Reset email failed: {e}")

    # Always return success to prevent email enumeration
    return jsonify({"message": "If that email exists, a reset link has been sent"}), 200


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("10 per hour")
def reset_password():
    data = request.get_json()
    token = data.get("token", "")
    new_password = data.get("password", "")

    if not validate_password(new_password):
        return jsonify({"error": "Password does not meet requirements"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    if datetime.utcnow() > user.reset_token_expiry:
        return jsonify({"error": "Reset token has expired"}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    log_activity(user.id, "password_reset", request)
    db.session.commit()

    return jsonify({"message": "Password reset successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict(include_private=True)), 200
