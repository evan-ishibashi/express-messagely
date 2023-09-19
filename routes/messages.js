"use strict";

const Router = require("express").Router;
const { UnauthorizedError } = require("../expressError");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth.js");
const { ensureBodyExists } = require("../middleware/requestCheck.js");
const router = new Router();

router.use(ensureLoggedIn);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

//TODO: Use ensureLoggedIn explicitly in routes. Cut ensureCorrectUser
router.get("/:id", ensureCorrectUser, async function (req, res) {
  const id = req.params.id;
  const currentUser = res.locals.user;
  const message = await Message.get(id);
  if (message.to_user.username === currentUser.username ||
    message.from_user.username === currentUser.username) {
    return res.json({ message });
  }
  throw new UnauthorizedError('User not authorized to view message');
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureBodyExists, async function (req, res, next) {
  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;
  const newMessage = await Message.create({ from_username, to_username, body });

  return res.json({ newMessage });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async function (req, res, next) {
  const message = await Message.markRead(req.params.id);
  if (message.to_username === currentUser.username) {
    return res.json({ message: {id: message.id, read_at: message.read_at} });
  }
  throw new UnauthorizedError("user not authorized to mark message as read");
});
module.exports = router;