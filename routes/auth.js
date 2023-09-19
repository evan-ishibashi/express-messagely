"use strict";

const { application } = require("express");
const jwt = require("jsonwebtoken");
const { BadReqestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadReqestError("Please provide login credentials.");
  }
  //Middleware?

  const { username, password } = req.body;

  const user = User.authenticate(username, password);

  if (user) {
    User.updateLoginTimestamp(username);
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError();
}
);

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", function (req, res, next) {
  if (req.body === undefined) {
    throw new BadReqestError("Please provide login credentials.");
  }
  //Middleware?

  const { username,
    password,
    first_name,
    last_name,
    phone } = req.body;

  User.register({
    username,
    password,
    first_name,
    last_name,
    phone
  });

  User.updateLoginTimestamp(username);
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
});



module.exports = router;