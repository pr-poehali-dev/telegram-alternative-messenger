"""
WorChat Messages API — получение и отправка сообщений.
GET  /?chat_id=X  — сообщения чата
POST / {action: send}  — отправить сообщение
POST / {action: read}  — отметить прочитанными
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p42269837_telegram_alternative")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute(f"""
        SELECT u.id, u.username, u.display_name, u.avatar_color, u.avatar_initials, u.status
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {"id": row[0], "username": row[1], "display_name": row[2],
            "avatar_color": row[3], "avatar_initials": row[4], "status": row[5]}

def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}

def err(code, msg):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Session-Token", "")

    if not token:
        return err(401, "Не авторизован")

    conn = get_conn()
    try:
        user = get_user_by_token(conn, token)
        if not user:
            return err(401, "Сессия истекла")

        if method == "GET":
            params = event.get("queryStringParameters") or {}
            chat_id = params.get("chat_id")
            if not chat_id:
                return err(400, "chat_id обязателен")

            cur = conn.cursor()
            cur.execute(f"""
                SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s
            """, (chat_id, user["id"]))
            if not cur.fetchone():
                cur.close()
                return err(403, "Нет доступа к чату")

            cur.execute(f"""
                SELECT m.id, m.sender_id, m.text, m.status,
                       to_char(m.created_at AT TIME ZONE 'Europe/Moscow', 'HH24:MI') as time_fmt
                FROM {SCHEMA}.messages m
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
                LIMIT 200
            """, (chat_id,))
            rows = cur.fetchall()

            cur.execute(f"""
                UPDATE {SCHEMA}.messages SET status = 'read'
                WHERE chat_id = %s AND sender_id != %s AND status = 'sent'
            """, (chat_id, user["id"]))
            conn.commit()
            cur.close()

            msgs = [
                {"id": r[0], "sender_id": r[1], "text": r[2],
                 "status": r[3], "time": r[4], "out": r[1] == user["id"]}
                for r in rows
            ]
            return ok({"messages": msgs, "me_id": user["id"]})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            action = body.get("action", "send")

            if action == "send":
                chat_id = body.get("chat_id")
                text = (body.get("text") or "").strip()
                if not chat_id or not text:
                    return err(400, "chat_id и text обязательны")

                cur = conn.cursor()
                cur.execute(f"""
                    SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s
                """, (chat_id, user["id"]))
                if not cur.fetchone():
                    cur.close()
                    return err(403, "Нет доступа к чату")

                cur.execute(f"""
                    INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text, status)
                    VALUES (%s, %s, %s, 'sent')
                    RETURNING id, to_char(created_at AT TIME ZONE 'Europe/Moscow', 'HH24:MI')
                """, (chat_id, user["id"], text))
                row = cur.fetchone()
                conn.commit()
                cur.close()

                return ok({
                    "message": {"id": row[0], "sender_id": user["id"], "text": text,
                                "status": "sent", "time": row[1], "out": True}
                })

            if action == "read":
                chat_id = body.get("chat_id")
                if chat_id:
                    cur = conn.cursor()
                    cur.execute(f"""
                        UPDATE {SCHEMA}.messages SET status = 'read'
                        WHERE chat_id = %s AND sender_id != %s AND status = 'sent'
                    """, (chat_id, user["id"]))
                    conn.commit()
                    cur.close()
                return ok({"ok": True})

        return err(404, "Not found")

    finally:
        conn.close()
