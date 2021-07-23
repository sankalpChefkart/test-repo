require('dotenv').config();
const express = require('express');
const cors = require('cors');

const AWSStorage = require('./routes/AWSStorageRoutes/AWSStorageRoutes');
const AWSBucket = require('./routes/AWSBucketRoutes/AWSBucketRoutes');

const app = express();
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/storage', AWSStorage);
app.use('/bucket', AWSBucket); 

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to chefKart.' + process.env.NODE_ENV});
});

module.exports = app; 