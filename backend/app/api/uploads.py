from flask import Blueprint

uploads_bp = Blueprint("uploads", __name__)
notifications_bp = Blueprint("notifications", __name__)
search_bp = Blueprint("search", __name__)

# These are implemented in content.py but imported here for the app factory
from app.api.content import uploads_bp, notifications_bp, search_bp
