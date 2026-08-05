-- Add thread_id to chat_messages for multi-conversation support
DO $$ BEGIN
  ALTER TABLE chat_messages ADD COLUMN thread_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON chat_messages(project_id, thread_id, created_at);
