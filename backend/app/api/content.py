from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.models import Post, Comment, Upload, Notification
from app.models.user import User
from datetime import datetime
import os
import uuid
import re

content_bp = Blueprint("content", __name__)
uploads_bp = Blueprint("uploads", __name__)
notifications_bp = Blueprint("notifications", __name__)
search_bp = Blueprint("search", __name__)


# ─── CONTENT ────────────────────────────────────────────────────────────────────

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


@content_bp.route("/posts", methods=["GET"])
def list_posts():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 12, type=int), 50)
    category = request.args.get("category", "")
    featured = request.args.get("featured", "")

    query = Post.query.filter_by(status="published")
    if category:
        query = query.filter_by(category=category)
    if featured:
        query = query.filter_by(is_featured=True)

    pagination = query.order_by(Post.published_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "posts": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "page": page,
    }), 200


@content_bp.route("/posts/<slug>", methods=["GET"])
def get_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    post.view_count += 1
    db.session.commit()
    return jsonify(post.to_dict()), 200


@content_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    slug = slugify(title)
    # Ensure unique slug
    existing = Post.query.filter_by(slug=slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    post = Post(
        title=title,
        slug=slug,
        content=data.get("content", ""),
        excerpt=data.get("excerpt", "")[:500],
        cover_image=data.get("cover_image", ""),
        category=data.get("category", ""),
        tags=data.get("tags", ""),
        status=data.get("status", "draft"),
        author_id=user_id,
    )
    if post.status == "published":
        post.published_at = datetime.utcnow()

    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@content_bp.route("/posts/<int:post_id>", methods=["PUT"])
@jwt_required()
def update_post(post_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    post = Post.query.get_or_404(post_id)

    if post.author_id != user_id and claims.get("role") not in ("admin", "moderator"):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    for field in ("title", "content", "excerpt", "cover_image", "category", "tags", "status"):
        if field in data:
            setattr(post, field, data[field])

    if post.status == "published" and not post.published_at:
        post.published_at = datetime.utcnow()

    db.session.commit()
    return jsonify(post.to_dict()), 200


@content_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    post = Post.query.get_or_404(post_id)

    if post.author_id != user_id and claims.get("role") not in ("admin", "moderator"):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"}), 200


@content_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    comments = Comment.query.filter_by(
        post_id=post_id, parent_id=None, is_approved=True
    ).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


@content_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content", "").strip()
    if not content or len(content) > 2000:
        return jsonify({"error": "Invalid comment length"}), 400

    post = Post.query.get_or_404(post_id)
    comment = Comment(
        content=content,
        post_id=post_id,
        user_id=user_id,
        parent_id=data.get("parent_id"),
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201


# ─── UPLOADS ────────────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@uploads_bp.route("/", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    upload = Upload(
        filename=filename,
        original_name=file.filename[:255],
        file_path=filepath,
        file_size=os.path.getsize(filepath),
        mime_type=file.content_type,
        uploader_id=user_id,
    )
    db.session.add(upload)
    db.session.commit()
    return jsonify(upload.to_dict()), 201


@uploads_bp.route("/<filename>", methods=["GET"])
def serve_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


# ─── NOTIFICATIONS ───────────────────────────────────────────────────────────────

@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).limit(50).all()
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread": unread,
    }), 200


@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200


@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify(notif.to_dict()), 200


# ─── SEARCH ─────────────────────────────────────────────────────────────────────

@search_bp.route("/", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q or len(q) < 2:
        return jsonify({"results": []}), 200

    posts = Post.query.filter(
        Post.status == "published",
        (Post.title.ilike(f"%{q}%")) | (Post.content.ilike(f"%{q}%"))
    ).limit(10).all()

    users = User.query.filter(
        User.is_active == True,
        (User.username.ilike(f"%{q}%")) | (User.display_name.ilike(f"%{q}%"))
    ).limit(5).all()

    return jsonify({
        "posts": [p.to_dict() for p in posts],
        "users": [u.to_dict() for u in users],
        "query": q,
    }), 200
