
CREATE TABLE IF NOT EXISTS t_p42269837_telegram_alternative.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    avatar_color VARCHAR(16) DEFAULT '#4F86C6',
    avatar_initials VARCHAR(4),
    status VARCHAR(16) DEFAULT 'offline',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p42269837_telegram_alternative.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p42269837_telegram_alternative.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p42269837_telegram_alternative.chats (
    id SERIAL PRIMARY KEY,
    type VARCHAR(16) DEFAULT 'direct',
    name VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p42269837_telegram_alternative.chat_members (
    chat_id INTEGER NOT NULL REFERENCES t_p42269837_telegram_alternative.chats(id),
    user_id INTEGER NOT NULL REFERENCES t_p42269837_telegram_alternative.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p42269837_telegram_alternative.messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES t_p42269837_telegram_alternative.chats(id),
    sender_id INTEGER NOT NULL REFERENCES t_p42269837_telegram_alternative.users(id),
    text TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p42269837_telegram_alternative.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p42269837_telegram_alternative.sessions(token);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON t_p42269837_telegram_alternative.chat_members(user_id);
