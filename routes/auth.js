"use strict";

const { application } = require("express");
const jwt = require("jsonwebtoken");
const { BadReqestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function(req, res, next){
  if (req.body === undefined) {
    throw new BadReqestError("Please provide login credentials.");
  }

  const { username, password } = req.body;

  const passwordResults = await db.query(
    `SELECT password
     FROM users
     WHERE username = $1`,
     [username]
  );
  const userPassword = passwordResults.rows[0];

  if (userPassword) {
    if (await bcrypt.compare(password, userPassword.password) === true) {
      const token = jwt.sign({ username }, SECRET_KEY);
      return res.json( { token });
    }
    throw new UnauthorizedError();
  }


})

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */


module.exports = router;