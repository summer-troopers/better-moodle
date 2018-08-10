'use strict';

module.exports = function defineGroup(sequelize, DataTypes) {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50],
      },
    },
    specialtyId: {
      type: DataTypes.INTEGER,
      field: 'specialty_id',
      allowNull: false,
    },
  },
  {
    tableName: 'groups',
    timestamps: false,
  });
  Group.associate = function associateGroup(models) {
    Group.hasMany(models.Student, { foreignKey: 'groupId', sourceKey: 'id' });
    Group.belongsTo(models.Specialty, { foreignKey: 'specialtyId', targetKey: 'id' });
  };
  return Group;
};
