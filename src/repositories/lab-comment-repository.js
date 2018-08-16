'use strict';

const errors = require('@feathersjs/errors');
const { Op } = require('sequelize');
const { buildIncludes } = require('../helpers/util');

module.exports = function createCommentRepository(connection) {
  const {
    LabComment,
    LabReport,
  } = connection.models;

  async function list(queryParams) {
    const {
      limit,
      offset,
    } = queryParams;

    const filter = {
      limit,
      offset,
    };

    let response = null;

    const incomingParamKeys = Object.keys(queryParams);
    const incomingParamValues = Object.values(queryParams);

    response = handleId(incomingParamValues[0], response, LabComment, filter, getModels(incomingParamKeys[0]));

    if (response) {
      return response;
    }
    return LabComment.findAndCountAll(filter);
  }

  async function view(id) {
    return LabComment.findById(id);
  }

  async function add(form) {
    const labReport = await LabReport.findById(form.labReportId);
    if (!labReport) throw new errors.NotFound('LAB_REPORT_NOT_FOUND');

    return LabComment.create(form);
  }

  async function exists(id) {
    const result = await LabComment.findById(id);
    if (result) return true;
    return false;
  }

  async function update(id, form) {
    const labReport = await LabReport.findById(form.labReportId);
    if (!labReport) throw new errors.NotFound('LAB_REPORT_NOT_FOUND');

    return LabComment.update(form, {
      where: { id },
    });
  }

  function remove(id) {
    return LabComment.destroy({
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

  function getModels(key) {
    const keys = ['laboratoryId'];
    const models = [LabReport];
    const i = keys.findIndex(itKey => key === itKey);
    return models.slice(0, i + 1);
  }
};

function handleId(queryParamId, response, LabComment, filter, models) {
  if (queryParamId) {
    const query = {
      ...filter,
      raw: true,
      subQuery: false,
      ...buildIncludes(queryParamId, models),
    };
    response = LabComment.findAndCountAll(query);
  }
  return response;
}
