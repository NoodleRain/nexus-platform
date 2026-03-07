-- Nexus Platform Database Schema
-- Compatible with PostgreSQL 14+ and SQLite 3.35+

-- Enable UUID extension (PostgreSQL only)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(80)  UNIQUE NOT NULL,
    email           VARCHAR(120) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(120),
    avatar_url      VARCHAR(500),
    bio             TEXT,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'moderator', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(100) UNIQUE,
    reset_token     VARCHAR(100) UNIQUE,
    reset_token_expiry TIMESTAMP,
    last_seen       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

-- ─── SESSIONS / TOKEN BLOCKLIST ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_blocklist (
    id         SERIAL PRIMARY KEY,
    jti        VARCHAR(36) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_jti ON token_blocklist(jti);

-- ─── POSTS ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(300) NOT NULL,
    slug         VARCHAR(350) UNIQUE,
    content      TEXT NOT NULL,
    excerpt      VARCHAR(500),
    cover_image  VARCHAR(500),
    status       VARCHAR(20) NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'published', 'archived')),
    is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
    view_count   INTEGER NOT NULL DEFAULT 0,
    author_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category     VARCHAR(100),
    tags         TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug      ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);

-- ─── COMMENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          SERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id   INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- ─── MESSAGES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id                   SERIAL PRIMARY KEY,
    sender_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content              TEXT NOT NULL,
    is_read              BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted_sender    BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted_recipient BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(200),
    message    TEXT,
    link       VARCHAR(500),
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_is_read ON notifications(is_read);

-- ─── UPLOADS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
    id            SERIAL PRIMARY KEY,
    filename      VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path     VARCHAR(500),
    file_size     INTEGER,
    mime_type     VARCHAR(100),
    uploader_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── ACTIVITY LOGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id   INTEGER,
    details       TEXT,
    ip_address    VARCHAR(50),
    user_agent    VARCHAR(300),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action  ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

-- ─── SITE SETTINGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
    id         SERIAL PRIMARY KEY,
    key        VARCHAR(100) UNIQUE NOT NULL,
    value      TEXT,
    type       VARCHAR(20) DEFAULT 'string',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO site_settings (key, value, type) VALUES
    ('site_name',           'Nexus Platform',  'string'),
    ('site_description',    'A modern platform for content and community', 'string'),
    ('allow_registration',  'true',            'boolean'),
    ('require_email_verify','true',            'boolean'),
    ('max_upload_size',     '16',              'integer'),
    ('maintenance_mode',    'false',           'boolean')
ON CONFLICT (key) DO NOTHING;

-- ─── CONTACT MESSAGES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(120) NOT NULL,
    subject    VARCHAR(200),
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    is_replied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
