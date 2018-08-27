'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('course_instances-specialties', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      courseInstanceId: {
        type: Sequelize.INTEGER,
        field: 'course_instance_id',
        primaryKey: true,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'course_instances',
          key: 'id',
        },
      },
      specialtyId: {
        type: Sequelize.INTEGER,
        field: 'specialty_id',
        primaryKey: true,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'specialties',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('course_instances-specialties');
  },
};
