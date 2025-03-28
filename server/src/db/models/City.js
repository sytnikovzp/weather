const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      City.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'cityId',
      });
    }
  }
  City.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'City',
      tableName: 'cities',
      underscored: true,
    }
  );
  return City;
};
