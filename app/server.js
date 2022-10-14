require('dotenv').config();
const express = require('express');
const nunjucks = require('nunjucks');
const app = express();

const postController = require('./controllers/postController');
const categoryController = require('./controllers/categoryController');
const siteController = require('./controllers/siteController');

app.use(express.json()); // for parsing application/json
app.use(express.static('public'));

//Controllers
app.use('/posts', postController);
app.use('/categories', categoryController);
app.use('/site', siteController);

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.listen(process.env.PORT, () => {
    console.log(`Running on port  ${process.env.PORT}`);
});
