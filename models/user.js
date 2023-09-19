"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const Message = require("./message");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    //check for taken username?
    try {
      await db.query(
                `SELECT username
                FROM users
                WHERE username = $1`,
                [username]
      )
    } catch (error) {

    }

    const hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const resp = await db.query(
      `INSERT INTO users (username,
                          password,
                          first_name,
                          last_name,
                          phone,
                          join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashed, first_name, last_name, phone]
    );
    return resp.rows[0];

  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const resp = await db.query(
      `SELECT password
       FROM users
       WHERE username = $1`,
      [username]
    );

    const storedPassword = resp.rows[0]?.password;

    if (!storedPassword) {
      throw new UnauthorizedError(`Invalid Credentials`);
    }
    else {

      const isValid = await bcrypt.compare(password, storedPassword);
      return isValid;


    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const resp = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
      [username]
    );
    const user = resp.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found for username ${username}`);
    }

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const resp = await db.query(
      `SELECT username, first_name, last_name
       FROM users`
    );

    return resp.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const resp = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = resp.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found for username ${username}`);
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              m.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              m.body,
              m.sent_at,
              m.read_at
          FROM messages AS m
          JOIN users AS t ON m.to_username = t.username
          WHERE m.from_username = $1`,
          [username]);

    let m = result.rows;

    if (!m) throw new NotFoundError(`User: ${username} has no sent messages.`);

    const sentMessages = m.map(row =>
    ({
      id: row.id,
      to_user: {
        username: row.to_username,
        first_name: row.to_first_name,
        last_name: row.to_last_name,
        phone: row.to_phone

      },
      body: row.body,
      sent_at:row.sent_at,
      read_at:row.read_at

    })
    );

    return sentMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.phone AS from_phone,
              m.to_username,
              m.body,
              m.sent_at,
              m.read_at
          FROM messages AS m
                JOIN users AS f ON m.from_username = f.username
          WHERE m.to_username = $1`,
      [username]);

    let m = result.rows;

    if (!m) throw new NotFoundError(
      `User: ${username} has no received messages.`);

    const recievedMessages = m.map(row =>
      ({
        id: row.id,
        from_user: {
          username: row.from_username,
          first_name: row.from_first_name,
          last_name: row.from_last_name,
          phone: row.from_phone

        },
        body: row.body,
        sent_at:row.sent_at,
        read_at:row.read_at
      })
    );

    return recievedMessages;
  }
}


module.exports = User;
