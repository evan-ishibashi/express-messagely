"use strict";

/** Middleware for ensuring body of request exists for certain routes. */


const { BadRequestError } = require("../expressError");

/** Middleware to ensure a request body exists.*/
function ensureBodyExists(req, res, next) {
  const body = req.body;
  if (!body) {
    throw new BadRequestError("Please provide the required information");
  }
  return next();
}

module.exports = { ensureBodyExists };