![Screenshot 2022-01-15 at 14 39 23](https://user-images.githubusercontent.com/20843520/149620462-3c903f53-0f11-4d90-a4a1-24d4192bfa45.png)


## Shopping Cart APP Built With Node.JS, Express, MongoDB, EJS, Stripe & EJS
- This is a simple NodeJs shopping cart application built on mongoDB, serving template pages with ejs. In this project I implemented a full CRUD operations

## Project setup
Make sure you have [Node.js](https://nodejs.org/en/) instaled.

- git clone `git@github.com:mpwanyi256/node-mongo-shopping-cart.git`
- cd Cities
- create a `.env` file in the project root directory with the following key pair attributes

    - DB_URI=your-mongodb-connection-uri
    - SESSIONS_COLLECTION=collectionName
    - SESSION_SECRET_KEY=mysecretkey
    - DAMMY_USER_NAME=mongodb-username
    - PORT=3000
    - SEND_GRID_API_KEY=SendGrid-account-api-key
    - STRIPE_PRIVATE_KEY=your-stripe

- npm install
- npm run serve

Your app should be running on [localhost:3000/](http://localhost:8080/)

### Compiles and hot-reloads for development
```
npm run start
```

### Reference documentation for middlewares used
- [MongoDb](https://www.mongodb.com/)
- [Stripe](https://stripe.com/en-gb-us)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [multer](https://www.npmjs.com/package/multer)
- [sendgrid](https://sendgrid.com/)
