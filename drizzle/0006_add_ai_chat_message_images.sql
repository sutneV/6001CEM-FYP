-- Add images column to AI chat messages to persist attachments
ALTER TABLE ai_chat_messages
ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Optional index if querying by images (not needed now)
-- CREATE INDEX IF NOT EXISTS ai_chat_messages_images_gin_idx ON ai_chat_messages USING GIN (images);
