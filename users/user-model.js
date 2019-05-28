const db = require('../data/dbConfig.js');

module.exports = {

  add: async (user) => {
    const [id] = await db('users').insert(user);

    return db('users').where(id).first();
  },

  find: () => {
    return db('users');
  },

  findBy: (user) => {
    return db('users').where(user).first();
  }
}