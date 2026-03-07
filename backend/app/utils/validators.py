import re


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email)) and len(email) <= 120


def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


def validate_username(username):
    if len(username) < 3 or len(username) > 30:
        return False
    return bool(re.match(r"^[a-zA-Z0-9_]+$", username))


def sanitize_html(text):
    """Basic HTML sanitizer - strip all tags"""
    clean = re.sub(r"<[^>]+>", "", text)
    return clean


def validate_url(url):
    pattern = r"^https?://[^\s<>\"{}|\\^`\[\]]{1,500}$"
    return bool(re.match(pattern, url))
