const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const Users = require('./users/user-model.js');

const server = express();

const sessionOptions = {
  name: 'authenticationproject',
  secret: 'just filler information',
  cookie: {
    maxAge: 1000 * 60 * 60 * 5,
    secure: false
  },
  httpOnly: true,
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    knex: require('./data/dbConfig.js'),
    tablename: 'sessions',
    sidfieldname: 'sid',
    createTable: true,
    clearInterval: 1000 * 60 * 60
  })
};

server.use(session(sessionOptions));
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
      req.session.user = user;
      res.status(200).json({message: `Welcome ${username}`});
    } else {
      res.status(401).json({error: "Invalid Credentials."})
    }
  } catch (e) {
    res.status(500).json({error: "Something went wrong with the server."});
  }
});

async function restricted(req, res, next) {
  
  if(req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({message: "Please log in."})
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