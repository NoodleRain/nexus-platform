from flask import current_app, render_template_string
from flask_mail import Message
from app import mail


VERIFY_TEMPLATE = """
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
  <div style="background:#fff;padding:40px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
    <h1 style="color:#6366f1;margin-top:0">Verify Your Email</h1>
    <p>Hi {{ username }},</p>
    <p>Welcome to Nexus! Please verify your email address to get started.</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{{ url }}" style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
        Verify Email Address
      </a>
    </div>
    <p style="color:#666;font-size:14px">If you didn't create an account, you can ignore this email.</p>
    <p style="color:#999;font-size:12px">Link expires in 24 hours. If the button doesn't work, copy: {{ url }}</p>
  </div>
</body>
</html>
"""

RESET_TEMPLATE = """
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
  <div style="background:#fff;padding:40px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
    <h1 style="color:#6366f1;margin-top:0">Reset Your Password</h1>
    <p>Hi {{ username }},</p>
    <p>We received a request to reset your password. Click the button below to proceed.</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{{ url }}" style="background:#ef4444;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
        Reset Password
      </a>
    </div>
    <p style="color:#666;font-size:14px">This link expires in 2 hours. If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
"""


def send_verification_email(user, token):
    app_url = current_app.config["APP_URL"]
    url = f"{app_url}/verify-email?token={token}"

    html = render_template_string(VERIFY_TEMPLATE, username=user.username, url=url)

    msg = Message(
        subject="Verify your Nexus account",
        recipients=[user.email],
        html=html,
    )
    mail.send(msg)


def send_password_reset_email(user, token):
    app_url = current_app.config["APP_URL"]
    url = f"{app_url}/reset-password?token={token}"

    html = render_template_string(RESET_TEMPLATE, username=user.username, url=url)

    msg = Message(
        subject="Reset your Nexus password",
        recipients=[user.email],
        html=html,
    )
    mail.send(msg)


def send_notification_email(user, subject, body):
    msg = Message(
        subject=subject,
        recipients=[user.email],
        body=body,
    )
    mail.send(msg)
