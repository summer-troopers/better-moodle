'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('lab_comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      labReportId: {
        type: Sequelize.INTEGER,
        field: 'lab_report_id',
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'lab_reports',
          key: 'id',
        },
      },
      teacherComment: {
        type: Sequelize.STRING,
        field: 'teacher_comment',
        allowNull: false,
      },
      mark: {
        type: Sequelize.INTEGER,
        field: 'mark',
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        allowNull: false,
      },
    });
  },
  // eslint-disable-next-line no-unused-vars
  down(queryInterface, Sequelize) { return queryInterface.dropTable('lab_comments'); },
};
