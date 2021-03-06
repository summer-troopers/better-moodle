'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const errors = require('@feathersjs/errors');
const hashPassword = require('../helpers/hash/hash-factory')();

module.exports = function createAuthenticationRoute(repository) {
  const router = express.Router();

  async function loginUser(request, response, next) {
    const result = await repository.getUser(request.body);
    if (!result) return next(new errors.NotFound('USER_NOT_FOUND'));
    const [role, user] = result;
    const token = jwt.sign({ userRole: role, user: user.id }, config.jwtconf.secret, config.jwtconf.time);
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      userRole: role,
    };
    return response.status(200).json({ token, userData });
  }

  async function comparePassword(request, response, next) {
    const user = await repository.getUser(request.body);
    try {
      const compareResult = await hashPassword.compare(request.body.password, user[1].password);
      if (!compareResult) return next(new errors.NotAuthenticated('PASSWORD_COMPARE_FAILED'));
    } catch (error) {
      return next(new errors.GeneralError('UNKNOWN_AUTHENTICATION_ERROR', { error }));
    }
    return next();
  }

  router.route('/')
    .post(comparePassword, loginUser);
  return router;
};
