"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFoundError } = require("../expressError");
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
      //TODO: What if nothing is returned from the database? return false.
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
    //TODO: Throw error if no user found.
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

    const messageResults = await db.query(
      `SELECT id
      FROM messages
      WHERE from_username = $1`,
      [username]
    );

    const messageIds = messageResults.rows.map(message => message.id);

    const messagePromises = messageIds.map(id => Message.get(id));

    const pulledMessages = await Promise.all(messagePromises);

    const trimmedMessages = pulledMessages.map(function(message) {

      const trimmedMessage = {id: message.id,
                      to_user: message.to_user,
                      body: message.body,
                      sent_at: message.sent_at,
                      read_at: message.read_at};
      return trimmedMessage;
    });

    return trimmedMessages;
  }


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messageResults = await db.query(
      `SELECT id
      FROM messages
      WHERE to_username = $1`,
      [username]
    );

    const messageIds = messageResults.rows.map(message => message.id);

    const messagePromises = messageIds.map(id => Message.get(id));

    const pulledMessages = await Promise.all(messagePromises);

    const trimmedMessages = pulledMessages.map(function(message) {

      const trimmedMessage = {id: message.id,
                      from_user: message.from_user,
                      body: message.body,
                      sent_at: message.sent_at,
                      read_at: message.read_at};
      return trimmedMessage;
    });

    return trimmedMessages;
  }
}


module.exports = User;
