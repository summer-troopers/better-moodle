'use strict';

const errors = require('@feathersjs/errors');
const { Op } = require('sequelize');
const { buildIncludes } = require('../helpers/util');

module.exports = function createStudentsRepository(connection) {
  const {
    Student,
    Group,
    Specialty,
    Course,
    Teacher,
    LabReport,
    LabTask,
  } = connection.models;

  async function list(queryParams) {
    const {
      limit,
      offset,
      contains,
    } = queryParams;

    const filter = {
      limit,
      offset,
      where: {
        firstName: {
          [Op.like]: [`%${contains}%`],
        },
      },
      attributes: {
        exclude: ['password'],
      },
    };

    let response = null;

    const incomingParamKeys = Object.keys(queryParams);
    const incomingParamValues = Object.values(queryParams);

    response = handleId(incomingParamValues[0], response, Student, filter, getModels(incomingParamKeys[0]));

    if (response) {
      return response;
    }
    return Student.findAndCountAll(filter);
  }

  async function view(studentId) {
    return Student.findOne({
      where: { id: studentId },
      attributes: {
        exclude: ['password'],
      },
    });
  }

  async function add(data) {
    const group = await Group.findById(data.groupId);
    if (!group) throw new errors.NotFound('GROUP_NOT_FOUND');

    return Student.create(data);
  }

  async function exists(studentId) {
    const result = await Student.findById(studentId);
    if (result) return true;
    return false;
  }

  async function update(studentId, data) {
    const group = await Group.findById(data.groupId);
    if (!group) throw new errors.NotFound('GROUP_NOT_FOUND');

    return Student.update(data, {
      where: { id: studentId },
    });
  }

  function remove(studentId) {
    return Student.destroy({
      where: { id: studentId },
    });
  }

  return {
    list,
    view,
    add,
    update,
    remove,
    exists,
  };

  function getModels(key) {
    const keys = ['groupId', 'specialtyId', 'courseId', 'teacherId', 'taskId', 'laboratoryId'];
    const models = [Group, Specialty, Course, Teacher, LabTask, LabReport];
    const i = keys.findIndex(itKey => key === itKey);
    return models.slice(0, i + 1);
  }
};

function handleId(queryParamId, response, Student, filter, models) {
  if (queryParamId) {
    const query = {
      ...filter,
      raw: true,
      subQuery: false,
      ...buildIncludes(queryParamId, models),
    };
    response = Student.findAndCountAll(query);
  }
  return response;
}
