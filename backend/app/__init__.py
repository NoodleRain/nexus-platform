import logging
import os
import sys

# Fix path so config module can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_socketio import SocketIO
from logging.handlers import RotatingFileHandler

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_name=None):
    app = Flask(__name__)

    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    from config.settings import config
    app.config.from_object(config[config_name])

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    socketio.init_app(app, cors_allowed_origins=app.config["CORS_ORIGINS"], async_mode="threading")

    from app.api.auth import auth_bp
    from app.api.users import users_bp
    from app.api.messages import messages_bp
    from app.api.admin import admin_bp
    from app.api.content import content_bp, uploads_bp, notifications_bp, search_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(content_bp, url_prefix="/api/content")
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(search_bp, url_prefix="/api/search")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "healthy", "version": "1.0.0"}

    if not app.debug:
        if not os.path.exists("logs"):
            os.mkdir("logs")
        file_handler = RotatingFileHandler("logs/nexus.log", maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info("Nexus Platform startup")

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        from app.models.session import TokenBlocklist
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    return app
