from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from app import db
from app.models.user import User
from app.models.models import Post, Comment, ActivityLog, SiteSettings, ContactMessage, Upload
from datetime import datetime, timedelta
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


def moderator_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") not in ("admin", "moderator"):
            return jsonify({"error": "Moderator access required"}), 403
        return f(*args, **kwargs)
    return decorated


@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    total_users = User.query.count()
    new_users_week = User.query.filter(User.created_at >= week_ago).count()
    total_posts = Post.query.count()
    active_posts = Post.query.filter_by(status="published").count()

    # Daily signups last 7 days
    daily_signups = []
    for i in range(7):
        day = now - timedelta(days=6 - i)
        day_start = day.replace(hour=0, minute=0, second=0)
        day_end = day.replace(hour=23, minute=59, second=59)
        count = User.query.filter(User.created_at.between(day_start, day_end)).count()
        daily_signups.append({"date": day.strftime("%Y-%m-%d"), "count": count})

    return jsonify({
        "stats": {
            "total_users": total_users,
            "new_users_week": new_users_week,
            "total_posts": total_posts,
            "active_posts": active_posts,
        },
        "daily_signups": daily_signups,
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    q = request.args.get("q", "")
    role = request.args.get("role", "")

    query = User.query
    if q:
        query = query.filter(
            (User.username.ilike(f"%{q}%")) |
            (User.email.ilike(f"%{q}%")) |
            (User.display_name.ilike(f"%{q}%"))
        )
    if role:
        query = query.filter_by(role=role)

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "users": [u.to_dict(include_private=True) for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "page": page,
    }), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "role" in data and data["role"] in ("user", "moderator", "admin"):
        user.role = data["role"]
    if "is_active" in data:
        user.is_active = bool(data["is_active"])
    if "is_verified" in data:
        user.is_verified = bool(data["is_verified"])

    db.session.commit()
    return jsonify(user.to_dict(include_private=True)), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route("/posts", methods=["GET"])
@moderator_required
def list_posts():
    page = request.args.get("page", 1, type=int)
    status = request.args.get("status", "")

    query = Post.query
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )

    return jsonify({
        "posts": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/posts/<int:post_id>", methods=["PUT"])
@moderator_required
def update_post_status(post_id):
    post = Post.query.get_or_404(post_id)
    data = request.get_json()
    if "status" in data and data["status"] in ("draft", "published", "archived"):
        post.status = data["status"]
        if data["status"] == "published" and not post.published_at:
            post.published_at = datetime.utcnow()
    db.session.commit()
    return jsonify(post.to_dict()), 200


@admin_bp.route("/logs", methods=["GET"])
@admin_required
def get_logs():
    page = request.args.get("page", 1, type=int)
    logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).paginate(
        page=page, per_page=50, error_out=False
    )
    return jsonify({
        "logs": [log.to_dict() for log in logs.items],
        "total": logs.total,
        "pages": logs.pages,
    }), 200


@admin_bp.route("/contact-messages", methods=["GET"])
@moderator_required
def get_contact_messages():
    page = request.args.get("page", 1, type=int)
    msgs = ContactMessage.query.order_by(ContactMessage.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        "messages": [m.to_dict() for m in msgs.items],
        "total": msgs.total,
        "unread": ContactMessage.query.filter_by(is_read=False).count(),
    }), 200


@admin_bp.route("/contact-messages/<int:msg_id>/read", methods=["PUT"])
@moderator_required
def mark_message_read(msg_id):
    msg = ContactMessage.query.get_or_404(msg_id)
    msg.is_read = True
    db.session.commit()
    return jsonify(msg.to_dict()), 200


@admin_bp.route("/settings", methods=["GET"])
@admin_required
def get_settings():
    settings = SiteSettings.query.all()
    return jsonify({s.key: s.value for s in settings}), 200


@admin_bp.route("/settings", methods=["PUT"])
@admin_required
def update_settings():
    data = request.get_json()
    for key, value in data.items():
        setting = SiteSettings.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
        else:
            setting = SiteSettings(key=key, value=str(value))
            db.session.add(setting)
    db.session.commit()
    return jsonify({"message": "Settings updated"}), 200


@admin_bp.route("/comments", methods=["GET"])
@moderator_required
def list_comments():
    page = request.args.get("page", 1, type=int)
    comments = Comment.query.order_by(Comment.created_at.desc()).paginate(
        page=page, per_page=50, error_out=False
    )
    return jsonify({
        "comments": [c.to_dict() for c in comments.items],
        "total": comments.total,
    }), 200


@admin_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@moderator_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200
