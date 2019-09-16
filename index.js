const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcryptjs = require('bcryptjs')

const restricted = require('./auth/restricted-middleware')
const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  let hashPass
  
  bcryptjs.genSalt(14, function(err, salt)
  {
    bcryptjs.hash(user.password, salt, function(err, hash)
    {
      hashPass = hash
      Users.add({username: user.username, password: hashPass})
        .then(saved => {
          res.status(201).json(saved);
        })
        .catch(error => {
          res.status(500).json(error);
        });
    })
  })
});


// server.post('/api/register', (req, res) => {
//   let {username, password} = req.body;
//   const hash = bcryptjs.hashSync(password, 12)

//   Users.add({username, password: hash})
//     .then(saved => {
//       res.status(201).json(saved);
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// });

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcryptjs.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

// server.get('/hash', (req, res) =>
// {
//   const name = req.query.name
//   // hash the name
//   let hash = bcryptjs.hashSync(name, 14)
//   res.send(`the hash for the ${name} is ${hash}`)
// })

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
