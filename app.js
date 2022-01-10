const path = require('path');

require('dotenv').config({
  path: './.env'
})

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// Set up session storage
const MongoDbStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDbStore({
  uri: process.env.DB_URI,
  collection: process.env.SESSIONS_COLLECTION
  // expires: ::TODO
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({ 
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  const sessionUserId = req.session.user?._id;
  if (!sessionUserId) {
    next()
    return
  }
  User.findById(sessionUserId)
    .then(user => {
      req.user = user;
      next()
    })
    .catch(e => {
      console.log(e)
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: process.env.DAMMY_USER_NAME,
          email: process.env.DAMMY_USER_EMAIL,
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(process.env.PORT);
  })
  .catch(err => {
    console.log(err);
  });
