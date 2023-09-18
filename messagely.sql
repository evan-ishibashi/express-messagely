\echo 'Delete and recreate messagely db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely;
CREATE DATABASE messagely;
\connect messagely


CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);


CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

INSERT INTO users (username, password, first_name, last_name, phone, join_at)
  VALUES
  ( 'JF33', 'password', 'Jennifer', 'Finch', '8885648', current_timestamp),
  ( 'ThadG', 'password', 'Thadeus', 'Gathercoal', '9996788', current_timestamp),
  ( 'julie', 'password', 'Julia', 'Roberts', '9996788', current_timestamp),
  ( 'HAaron', 'password', 'Hank', 'Aaron', '9996788', current_timestamp),
  ( 'AirJordan', 'password', 'Michael', 'Jordan', '9996788', current_timestamp);

INSERT INTO messages (from_username, to_username, body, sent_at)
VALUES
    ('JF33', 'AirJordan', 'texttexttext', current_timestamp),
    ('HAaron', 'AirJordan', 'texttexttext', current_timestamp),
    ('AirJordan', 'julie', 'texttexttext', current_timestamp),
    ('julie', 'AirJordan', 'texttexttext', current_timestamp),
    ('julie', 'ThadG', 'texttexttext', current_timestamp),
    ('JF33', 'ThadG', 'texttexttext', current_timestamp),
    ('AirJordan', 'HAaron', 'texttexttext', current_timestamp),
    ('HAaron', 'julie', 'texttexttext', current_timestamp);


\echo 'Delete and recreate messagely_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely_test;
CREATE DATABASE messagely_test;
\connect messagely_test

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

