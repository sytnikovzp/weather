const { Favorite, City, User } = require('../db/models');
// ==============================================================
const { emailToLowerCase } = require('../utils/sharedFunctions');
// ==============================================================
const { badRequest, notFound } = require('../errors/customErrors');

class FavoriteService {
  async getFavorites(email) {
    const emailToLower = emailToLowerCase(email);
    const user = await User.findOne({ where: { email: emailToLower } });

    if (!user) throw notFound('User not found');

    const favorites = await Favorite.findAll({
      where: { userId: user.id },
      include: [
        { model: City, attributes: ['title', 'country', 'openWeatherId'] },
      ],
    });

    const formattedFavorites = favorites.map((favorite) => ({
      cityName: favorite.City.title,
      country: favorite.City.country,
      openWeatherId: favorite.City.openWeatherId,
    }));

    return formattedFavorites;
  }

  async addFavorite(userEmail, openWeatherId, cityName, country, transaction) {
    const emailToLower = emailToLowerCase(userEmail);
    const user = await User.findOne({ where: { email: emailToLower } });
    if (!user) throw notFound('User not found');

    let city = await City.findOne({ where: { openWeatherId } });

    if (!city) {
      city = await City.create(
        {
          title: cityName,
          country,
          openWeatherId,
        },
        { transaction }
      );
    }

    const existingFavorite = await Favorite.findOne({
      where: { userId: user.id, cityId: city.id },
    });
    if (existingFavorite) throw badRequest('The city is already in favorites');

    const favorite = await Favorite.create(
      {
        userId: user.id,
        cityId: city.id,
      },
      { transaction }
    );

    return favorite;
  }

  async removeFavorite(userEmail, cityId, transaction) {
    const emailToLower = emailToLowerCase(userEmail);
    const user = await User.findOne({ where: { email: emailToLower } });
    if (!user) throw notFound('User not found');

    const favorite = await Favorite.findOne({
      where: { userId: user.id, cityId },
    });

    if (!favorite) throw notFound('Favorite not found');

    await Favorite.destroy({
      where: { userId: user.id, cityId },
      transaction,
    });
  }
}

module.exports = new FavoriteService();