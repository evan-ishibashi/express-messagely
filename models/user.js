"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFoundError } = require("../expressError");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    //check for taken username?

    const hashed = bcrypt.hash(password, BCRYPT_WORK_FACTOR)
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

    const storedPassword = resp.rows[0].password;
    const isValid = await bcrypt.compare(password, storedPassword);
    return isValid;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const resp = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`,
      [username]
    );
    //Do we return anything?
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
              m.to_user,
              t.username AS to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              m.body,
              m.sent_at,
              m.read_at
         FROM messages AS m
                JOIN users AS t ON m.to_username = t.username
         WHERE m.from_username = $1`,
    [id]);

let m = result.rows[0];

if (!m) throw new NotFoundError(`No such message: ${id}`);

return {
  id: m.id,
  from_user: {
    username: m.from_username,
    first_name: m.from_first_name,
    last_name: m.from_last_name,
    phone: m.from_phone,
  },
  to_user: {
    username: m.to_username,
    first_name: m.to_first_name,
    last_name: m.to_last_name,
    phone: m.to_phone,
  },
  body: m.body,
  sent_at: m.sent_at,
  read_at: m.read_at,
};

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
