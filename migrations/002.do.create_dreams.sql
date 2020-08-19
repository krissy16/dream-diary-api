CREATE TABLE dreams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date_created date DEFAULT now(),
  content TEXT NOT NULL,
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  user_id INTEGER
    REFERENCES users(id) ON DELETE CASCADE NOT NULL
);