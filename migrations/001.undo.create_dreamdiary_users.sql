ALTER TABLE dreamdiary_dreams
  DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS dreamdiary_users CASCADE;
