CREATE TABLE dreamdiary_dreams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date_created date DEFAULT now(),
  content TEXT NOT NULL,
  notes TEXT,
  user_id INTEGER
    REFERENCES dreamdiary_users(id) ON DELETE CASCADE NOT NULL
);