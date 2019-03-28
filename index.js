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
  try {
    const newUser = await Users.add(user);
    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).json({error: "Something went wrong with the server."})
  }
  
});

server.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findBy({ username });

    if(user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({message: `Welcome ${username}`});
    } else {
      res.status(401).json({error: "Invalid Credentials."})
    }
  } catch (e) {
    res.status(500).json({error: "Something went wrong with the server."});
  }
});

async function restricted(req, res, next) {
  const { username, password } = req.headers;

  if(username && password) {
    try {
      const user = await Users.findBy({username});

      if(user && bcrypt.compareSync(password, user.password)) {
        next();
      } else {
        res.status(401).json({message: "Invalid Credentials."})
      }
    } catch (e) {
      res.status(500).json({error: "Something went wrong with the server."})
    }
  } else {
    res.status(500).json({message: "Missing Credentials"});
  }
}

server.get('/api/users', restricted, async (req, res) => {

  try {
    const users = await Users.find();
    res.status(200).json(users)
  } catch (e) {
    res.status(500).json({error: "Something went wrong with the server."})
  }
  
})

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});