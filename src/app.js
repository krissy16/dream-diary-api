require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const logger = require('./logger');
const dreamRouter = require('./dreams/dreams-router')
const usersRouter = require('./users/users-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use( cors({ origin: CLIENT_ORIGIN }));

//validate the api token
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

app.use('/api/dreams', dreamRouter)
app.use('/api/users', usersRouter)
//app.use('/api/auth', authRouter)
app.get('/*', (req, res) => {
   res.send('Route note found')
})

app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
     response = { error: { message: 'server error' } }
   } else {
     console.error(error)
     response = { message: error.message, error }
   }
  res.status(500).json(response)
})


module.exports = app