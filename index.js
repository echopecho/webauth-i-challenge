const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');

const Users = require('./users/user-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.post('/api/register', async (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  const newUser = await Users.add(user);
  res.status(201).json(newUser);
})

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
})