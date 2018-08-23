'use strict';

const faker = require('faker');
const errors = require('@feathersjs/errors');

function createMessage(to, from, subject, text) {
  const message = {
    to,
    from,
    subject,
    text,
  };
  return message;
}

function divisionString(string) {
  const [admin, teacher, student] = string.split('|');

  return {
    admin,
    teacher,
    student,
  };
}

function getPermission(permissions) {
  return {
    create: permissions.includes('c'),
    read: permissions.includes('r'),
    update: permissions.includes('u'),
    delete: permissions.includes('d'),
  };
}

function createPermissions(permissions) {
  const users = divisionString(permissions);
  return {
    admin: getPermission(users.admin),
    teacher: getPermission(users.teacher),
    student: getPermission(users.student),
  };
}

function handleId(queryParams, Model, filter, queryParamsBindings) {
  if (!queryParams) return null;

  const incomingParamKeys = Object.keys(queryParams);
  const incomingParamValues = Object.values(queryParams);

  const modelChain = queryParamsBindings[incomingParamKeys[0]];
  if (!modelChain) return null;
  const queryParamId = incomingParamValues[0];

  const query = {
    ...filter,
    subQuery: false,
    ...buildIncludes(queryParamId, modelChain),
  };
  return Model.findAndCountAll(query);
}

// eslint-disable-next-line complexity
async function appendParentData(initialResults, parentModel) {
  if (!initialResults || initialResults.length === 0) return initialResults;
  const parentColumnName = getLowerCaseName(parentModel);
  const parentsIds = initialResults.map(model => model[`${parentColumnName}Id`]);

  const parents = await parentModel.findAll({
    where: { id: { $in: parentsIds } },
  });

  for (let i = 0; i < initialResults.length; i += 1) {
    for (let j = 0; j < parents.length; j += 1) {
      if (initialResults[i][`${parentColumnName}Id`] === parents[j].id) {
        initialResults[i][parentColumnName] = parents[j];
      }
    }
  }
  return initialResults;
}

async function appendDependentCount(rows, parentModel, dependentModel) {
  if (!rows || rows.length === 0) return rows;

  const parentName = getLowerCaseName(parentModel);
  const dependentName = getLowerCaseName(dependentModel);
  const parentsIds = rows.map(model => model.id);

  const dependencies = await dependentModel.findAll({
    where: { [`${parentName}Id`]: { $in: parentsIds } },
  });

  rows.forEach((parentRow) => {
    const matchingDependencies = dependencies.filter((dependentRow) => {
      return (dependentRow[`${parentName}Id`] === parentRow.id);
    });
    parentRow[`${dependentName}Count`] = matchingDependencies.length;
  });

  return rows;
}

// This next function is just an experiment for fun :)
// eslint-disable-next-line complexity
async function appendParentDataDeep(initialResults, parentModelChain) {
  const parentsNames = [];
  parentModelChain.forEach((Model) => {
    const name = getLowerCaseName(Model);
    parentsNames.push(name);
  });
  const resultsAggregate = [initialResults];

  // eslint-disable-next-line complexity
  async function doWork(parentModelChainParam, index = 0, resultsAggregateParam) {
    if (index === parentModelChainParam.length) return null;

    const currentResults = resultsAggregateParam[index];
    const parentColumnName = parentsNames[index];

    const parentsIds = currentResults.map(model => model[`${parentColumnName}Id`]);

    const dependencies = await parentModelChainParam[index].findAll({
      where: { id: { $in: parentsIds } },
    });

    resultsAggregateParam.push([]);

    const nextResults = resultsAggregateParam[index + 1];

    for (let i = 0; i < currentResults.length; i += 1) {
      for (let j = 0; j < dependencies.length; j += 1) {
        const currentId = currentResults[i][`${parentColumnName}Id`];
        if (currentId === dependencies[j].id) {
          nextResults.push(dependencies[j]);
          break;
        }
      }
    }
    await doWork(parentModelChainParam, index + 1, resultsAggregateParam);
    for (let i = 0; i < currentResults.length; i += 1) {
      currentResults[i][parentColumnName] = nextResults[i];
    }

    return null;
  }

  await doWork(parentModelChain, 0, resultsAggregate);

  return initialResults;
}

function projectDatabaseResponse(response, projector) {
  return {
    count: response.count,
    rows: response.rows.map(projector),
  };
}

function getLowerCaseName(model) {
  return model.name.charAt(0).toLowerCase() + model.name.slice(1);
}

function buildIncludes(param, models) {
  const modelsCopy = [...models];
  modelsCopy.reverse();
  return modelsCopy.reduce((accumulator, model, index) => {
    if (index === 0) {
      accumulator.include = [
        {
          model,
          required: true,
          where: {
            id: param,
          },
        },
      ];
      return accumulator;
    }

    accumulator.include = [
      {
        model,
        required: true,
        include: accumulator.include,
      },
    ];
    return accumulator;
  }, {});
}

function generatePhoneNumber() {
  const prefixes = ['06', '07'];
  const chosenPrefix = faker.random.arrayElement(prefixes);
  const rest = faker.random.number({ min: 1000000, max: 9999999 });

  return `${chosenPrefix}${rest}`;
}

function generateUniqueEmail(emails) {
  let genEmail = faker.internet.email().toLocaleLowerCase();
  const predicate = object => object.email === genEmail;
  while (emails.find(predicate)) {
    genEmail = faker.internet.email().toLocaleLowerCase();
  }
  return genEmail;
}

function generateUniqueNumber(phoneNumbers) {
  let genNumber = generatePhoneNumber();
  const predicate = object => object.phone_number === genNumber;
  while (phoneNumbers.find(predicate)) {
    genNumber = generatePhoneNumber();
  }
  return genNumber;
}

function detectDuplicate(array) {
  const sorted = array.slice().sort();

  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (sorted[i] === sorted[i + 1]) return true;
  }

  return false;
}

async function assertEmailNotTaken(email, models) {
  const userRequests = [];

  models.forEach((model) => {
    userRequests.push(model.findOne({ where: { email } }));
  });

  const users = await Promise.all(userRequests);

  for (let i = 0; i < users.length; i += 1) {
    if (users[i]) throw errors.BadRequest('EMAIL_ALREADY_TAKEN');
  }
}

module.exports = {
  createMessage,
  permissions: createPermissions,
  buildIncludes,
  handleId,
  appendParentData,
  appendParentDataDeep,
  appendDependentCount,
  projectDatabaseResponse,
  generatePhoneNumber,
  generateUniqueEmail,
  generateUniqueNumber,
  detectDuplicate,
  assertEmailNotTaken,
};
