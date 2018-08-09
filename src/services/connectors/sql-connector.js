'use strict';

const Sequelize = require('sequelize');

module.exports = function getSQLConnector(uri) {
  return {
    connect, // eslint-disable-line no-use-before-define
  };

  async function connect() {
    const sequelize = new Sequelize(uri, {
      dialect: 'mysql',
      logging: true,
      define: {
        charset: 'utf8mb4',
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    return sequelize;
  }
};
