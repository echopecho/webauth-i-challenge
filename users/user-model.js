const db = require('../data/dbConfig.js');

module.exports = {

  add: async (user) => {
    const [id] = await db('users').insert(user);

    return db('users').where('id', id).first();
  }
}