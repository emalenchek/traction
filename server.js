const express = require("express"); //backend framework
const mongoose = require('mongoose'); //mongoDB ORM
const path = require('path');
const config = require('config');

require("dotenv").config();

const app = express();

// Bodyparser middleware

app.use(express.json());

// MongoDB URI DB config

const db = config.get('mongoURI');

// connect to Mongo

mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('MongoDB connected ...'))
    .catch(err => console.log(err));

// Use routes

app.use('/api/users', require('./routes/api/users'));
//
//
//


// Serve static assets if in production

if(process.env.NODE_ENV === 'production') {
    // Set static Folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// environmental variable / Port 5000

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
