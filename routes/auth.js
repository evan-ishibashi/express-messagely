"use strict";

const { application } = require("express");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const { ensureBodyExists } = require("../middleware/requestCheck.js")

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", ensureBodyExists, async function (req, res, next) {


  const { username, password } = req.body;

  const user = await User.authenticate(username, password);

  if (user) {
    await User.updateLoginTimestamp(username);
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

router.post("/register", ensureBodyExists, async function (req, res, next) {

  const { username,
    password,
    first_name,
    last_name,
    phone } = req.body;

  await User.register({
    username,
    password,
    first_name,
    last_name,
    phone
  });

  await User.updateLoginTimestamp(username);
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
});



module.exports = router;