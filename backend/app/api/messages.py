from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, socketio
from app.models.models import Message, Notification
from app.models.user import User
from flask_socketio import emit, join_room, leave_room
from datetime import datetime

messages_bp = Blueprint("messages", __name__)


@messages_bp.route("/", methods=["GET"])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()

    # Get unique conversation partners
    sent = db.session.query(Message.recipient_id).filter_by(
        sender_id=user_id, is_deleted_sender=False
    )
    received = db.session.query(Message.sender_id).filter_by(
        recipient_id=user_id, is_deleted_recipient=False
    )

    partner_ids = set()
    for r in sent.all():
        partner_ids.add(r[0])
    for r in received.all():
        partner_ids.add(r[0])

    conversations = []
    for partner_id in partner_ids:
        partner = User.query.get(partner_id)
        if not partner:
            continue

        last_msg = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == partner_id)) |
            ((Message.sender_id == partner_id) & (Message.recipient_id == user_id))
        ).order_by(Message.created_at.desc()).first()

        unread = Message.query.filter_by(
            sender_id=partner_id, recipient_id=user_id, is_read=False
        ).count()

        conversations.append({
            "partner": partner.to_dict(),
            "last_message": last_msg.to_dict() if last_msg else None,
            "unread_count": unread,
        })

    conversations.sort(
        key=lambda c: c["last_message"]["created_at"] if c["last_message"] else "",
        reverse=True
    )
    return jsonify(conversations), 200


@messages_bp.route("/<int:partner_id>", methods=["GET"])
@jwt_required()
def get_messages(partner_id):
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)

    messages = Message.query.filter(
        ((Message.sender_id == user_id) & (Message.recipient_id == partner_id) & (~Message.is_deleted_sender)) |
        ((Message.sender_id == partner_id) & (Message.recipient_id == user_id) & (~Message.is_deleted_recipient))
    ).order_by(Message.created_at.desc()).paginate(page=page, per_page=50, error_out=False)

    # Mark as read
    Message.query.filter_by(
        sender_id=partner_id, recipient_id=user_id, is_read=False
    ).update({"is_read": True})
    db.session.commit()

    return jsonify({
        "messages": [m.to_dict() for m in reversed(messages.items)],
        "has_more": messages.has_next,
    }), 200


@messages_bp.route("/<int:partner_id>", methods=["POST"])
@jwt_required()
def send_message(partner_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Message cannot be empty"}), 400
    if len(content) > 5000:
        return jsonify({"error": "Message too long"}), 400

    partner = User.query.get_or_404(partner_id)

    msg = Message(sender_id=user_id, recipient_id=partner_id, content=content)
    db.session.add(msg)

    # Create notification
    notif = Notification(
        user_id=partner_id,
        type="message",
        title="New message",
        message=f"You have a new message",
        link=f"/messages/{user_id}",
    )
    db.session.add(notif)
    db.session.commit()

    # Emit via socketio
    socketio.emit("new_message", msg.to_dict(), room=f"user_{partner_id}")
    socketio.emit("notification", notif.to_dict(), room=f"user_{partner_id}")

    return jsonify(msg.to_dict()), 201


@messages_bp.route("/contact", methods=["POST"])
def contact_form():
    from app.models.models import ContactMessage
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not all([name, email, message]):
        return jsonify({"error": "Name, email, and message are required"}), 400

    contact = ContactMessage(name=name, email=email, subject=subject, message=message)
    db.session.add(contact)
    db.session.commit()
    return jsonify({"message": "Message sent successfully"}), 201


# Socket.IO events
@socketio.on("connect")
def handle_connect():
    pass


@socketio.on("join")
def handle_join(data):
    user_id = data.get("user_id")
    if user_id:
        join_room(f"user_{user_id}")


@socketio.on("leave")
def handle_leave(data):
    user_id = data.get("user_id")
    if user_id:
        leave_room(f"user_{user_id}")


@socketio.on("typing")
def handle_typing(data):
    emit("user_typing", data, room=f"user_{data.get('to')}")
