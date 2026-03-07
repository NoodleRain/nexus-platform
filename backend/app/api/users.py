from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.models.models import ActivityLog
from app.utils.validators import validate_password

users_bp = Blueprint("users", __name__)


def require_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict(include_private=True)), 200


@users_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "display_name" in data:
        user.display_name = data["display_name"][:120]
    if "bio" in data:
        user.bio = data["bio"][:500]
    if "avatar_url" in data:
        user.avatar_url = data["avatar_url"][:500]

    db.session.commit()
    return jsonify(user.to_dict(include_private=True)), 200


@users_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if not user.check_password(data.get("current_password", "")):
        return jsonify({"error": "Current password is incorrect"}), 400

    new_password = data.get("new_password", "")
    if not validate_password(new_password):
        return jsonify({"error": "New password does not meet requirements"}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    q = request.args.get("q", "")

    query = User.query.filter_by(is_active=True)
    if q:
        query = query.filter(
            (User.username.ilike(f"%{q}%")) | (User.display_name.ilike(f"%{q}%"))
        )

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "page": page,
    }), 200


@users_bp.route("/activity", methods=["GET"])
@jwt_required()
def get_activity():
    user_id = get_jwt_identity()
    logs = ActivityLog.query.filter_by(user_id=user_id).order_by(
        ActivityLog.created_at.desc()
    ).limit(50).all()
    return jsonify([log.to_dict() for log in logs]), 200
