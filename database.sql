CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  password TEXT,
  name TEXT,
  profile_picture TEXT
);

CREATE TABLE grades (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL FOREIGN KEY,
    course VARCHAR(255) NOT NULL,
    prelim INT(11),
    midterm INT(11),
    final INT(11),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

