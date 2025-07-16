--DROP TABLE IF EXISTS likes, comments, images, mods, serviceupdates, posts, follows, cars, users CASCADE;

CREATE TABLE users (
  userID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  bio VARCHAR(500),
  email VARCHAR(100) UNIQUE NOT NULL,
  lastUsernameChange TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  url TEXT,
  filename text
);

CREATE TABLE cars (
  carID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userID UUID REFERENCES users(userID) ON DELETE CASCADE,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  url TEXT,
  filename text
);

CREATE TABLE serviceupdates (
  suID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carID UUID REFERENCES cars(carID) ON DELETE CASCADE,
  createdAt DATE DEFAULT CURRENT_DATE,
  description VARCHAR(300)
);

CREATE TABLE mods (
  modID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suID UUID REFERENCES serviceupdates(suID),
  carID UUID REFERENCES cars(carID) ON DELETE CASCADE,
  name VARCHAR(50),
  type VARCHAR(50),
  mileage INTEGER,
  description VARCHAR(300)
);

CREATE TABLE posts (
  postID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userID UUID REFERENCES users(userID) ON DELETE CASCADE,
  createdAt DATE DEFAULT CURRENT_DATE,
  caption VARCHAR(300)
);

CREATE TABLE images (
  imageID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carID UUID REFERENCES cars(carID),
  postID UUID REFERENCES posts(postID),
  url TEXT
);

CREATE TABLE comments (
  commentID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postID UUID REFERENCES posts(postID) ON DELETE CASCADE,
  userID UUID REFERENCES users(userID) ON DELETE CASCADE,
  text VARCHAR(200),
  createdAt DATE DEFAULT CURRENT_DATE
);

CREATE TABLE likes (
  userID UUID REFERENCES users(userID) ON DELETE CASCADE,
  postID UUID REFERENCES posts(postID) ON DELETE CASCADE,
  createdAt DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (userID, postID)
);

CREATE TABLE follows (
  followerID UUID REFERENCES users(userID) ON DELETE CASCADE,
  followeeID UUID REFERENCES users(userID) ON DELETE CASCADE,
  PRIMARY KEY (followerID, followeeID)
);