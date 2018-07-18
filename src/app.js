'use strict';

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const logger = require('../src/services/winston/logger');

const importModels = require('./models/import');
const createRoute = require('./routes/route-factory');
const createAuthenticationRoute = require('./routes/authentication-route');

const createUserRepository = require('./repositories/users-repository');
const { permissions } = require('./helpers/util');
const createAuthorizationVerifier = require('./middlewares/authorization-verifier');

module.exports = function getApp(connection) {
  const app = express();

  importModels(connection);

  const { models } = connection;

  const adminsRepository = require('./repositories/admins-repository')(models); // eslint-disable-line global-require
  const teachersRepository = require('./repositories/teachers-repository')(models); // eslint-disable-line global-require
  const studentsRepository = require('./repositories/students-repository')(models); // eslint-disable-line global-require
  const coursesRepository = require('./repositories/courses-repository')(models); // eslint-disable-line global-require
  const groupsRepository = require('./repositories/groups-repository')(models); // eslint-disable-line global-require
  const specialtiesRepository = require('./repositories/specialties-repository')(models); // eslint-disable-line global-require

  const userRepository = createUserRepository(models);

  const authenticationRoute = createAuthenticationRoute(userRepository);

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(morgan('combined', { stream: logger.stream }));

  app.use('/api/v1/login', authenticationRoute);

  app.use(createAuthorizationVerifier(userRepository).validateUser);

  app.use('/api/v1/admins', createRoute(adminsRepository, permissions('crud|||')));
  app.use('/api/v1/teachers', createRoute(teachersRepository, permissions('crud|r|r|')));
  app.use('/api/v1/students', createRoute(studentsRepository, permissions('crud|r|r|')));
  app.use('/api/v1/courses', createRoute(coursesRepository, permissions('crud|r|r|')));
  app.use('/api/v1/groups', createRoute(groupsRepository, permissions('crud|r|r|')));
  app.use('/api/v1/specialties', createRoute(specialtiesRepository, permissions('crud|r|r|')));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // MOCK BEGIN

  const mockTeachersRepository = require('./mock/repositories/teachers-repository')(models); // eslint-disable-line global-require
  const mockCoursesRepository = require('./mock/repositories/courses-repository')(models); // eslint-disable-line global-require

  const mockTeachersRoute = require('./mock/routes/teachers-route')(mockTeachersRepository); // eslint-disable-line global-require
  const mockCoursesRoute = createRoute(mockCoursesRepository, permissions('crud|r|r|')); // eslint-disable-line global-require

  app.use('/api/mock/teachers', mockTeachersRoute);
  app.use('/api/mock/courses', mockCoursesRoute);

  // MOCK END

  // eslint-disable-next-line no-unused-vars
  app.use((err, request, response, next) => {
    const error = err;
    error.code = err.code || 400;
    return response.status(error.code).json(error.message);
  });

  return app;
};
