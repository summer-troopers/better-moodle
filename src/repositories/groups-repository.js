'use strict';

const { Op } = require('sequelize');
const errors = require('@feathersjs/errors');

module.exports = function createGroupsRepository(sequelize) {
  const {
    Group,
    Specialty,
    Course,
    Teacher,
    Student,
    LabReport,
    LabTask,
  } = sequelize.models;

  function list(queryParams) {
    const {
      limit,
      offset,
      contains,
      courseId,
      specialtyId,
      teacherId,
      studentId,
      laboratoryId,
      taskId,
    } = queryParams;

    const filter = {
      limit,
      offset,
      where: {
        name: {
          [Op.like]: [`%${contains}%`],
        },
      },
    };

    if (specialtyId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Specialty,
          required: true,
          where: {
            id: specialtyId,
          },
        }],
      });
    }

    if (courseId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Specialty,
          required: true,
          include: [{
            model: Course,
            required: true,
            where: {
              id: courseId,
            },
          }],
        }],
      });
    }

    if (teacherId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Specialty,
          required: true,
          include: [{
            model: Course,
            required: true,
            include: [{
              model: Teacher,
              required: true,
              where: {
                id: teacherId,
              },
            }],
          }],
        }],
      });
    }

    if (studentId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Student,
          required: true,
          where: {
            id: studentId,
          },
        }],
      });
    }

    if (laboratoryId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Student,
          required: true,
          include: [{
            model: LabReport,
            required: true,
            where: {
              id: laboratoryId,
            },
          }],
        }],
      });
    }

    if (taskId) {
      return Group.findAndCountAll({
        ...filter,
        raw: true,
        subQuery: false,
        include: [{
          model: Student,
          required: true,
          include: [{
            model: LabReport,
            required: true,
            include: [{
              model: LabTask,
              required: true,
              where: {
                id: taskId,
              },
            }],
          }],
        }],
      });
    }

    return Group.findAndCountAll(filter);
  }

  async function view(id) {
    return Group.findById(id);
  }

  async function add(form) {
    return Group.create(form);
  }

  async function exists(id) {
    const result = await Group.findById(id);
    if (result) return true;
    return false;
  }

  async function update(id, form) {
    return Group.update(form, {
      where: { id },
    });
  }

  function remove(id) {
    return Group.destroy({
      where: { id },
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
};
