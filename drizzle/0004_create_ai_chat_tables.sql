CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL DEFAULT 'New Chat',
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  sender varchar(10) NOT NULL,
  content text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_chat_conversations_user_id_idx ON ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_chat_messages_conversation_id_idx ON ai_chat_messages(conversation_id);
