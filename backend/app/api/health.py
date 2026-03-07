from flask import jsonify
from app import create_app, db

# Add health check to app
def add_health_check(app):
    @app.route("/api/health")
    def health():
        try:
            db.session.execute(db.text("SELECT 1"))
            db_status = "healthy"
        except Exception:
            db_status = "unhealthy"
        
        return jsonify({
            "status": "healthy" if db_status == "healthy" else "degraded",
            "database": db_status,
            "version": "1.0.0",
        }), 200 if db_status == "healthy" else 503
