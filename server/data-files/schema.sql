DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tweets CASCADE;
DROP TABLE IF EXISTS retweets CASCADE;
DROP TABLE IF EXISTS likes CASCADE;

CREATE TABLE users(
  id SERIAL PRIMARY KEY NOT NULL, 
  name VARCHAR(255) NOT NULL, 
  avatar VARCHAR(255) DEFAULT 'https://i.imgur.com/73hZDYK.png',
  handle VARCHAR(255) NOT NULL
);

CREATE TABLE tweets(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  text VARCHAR(255),
  created_at TIMESTAMPTZ,
  retweeter_id INTEGER REFERENCES users(id),
  original_id INTEGER REFERENCES tweets(id)
);

CREATE TABLE retweets(
  id SERIAL PRIMARY KEY NOT NULL, 
  tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
  retweeter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  unique(retweeter_id, tweet_id)
);

CREATE TABLE likes(
  id SERIAL PRIMARY KEY NOT NULL, 
  tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  unique (tweet_id, user_id)
);