const path = require('path');
const express = require('express');
const router = express.Router();
const nodeSass = require('sass');
const fs = require('fs');

const postService = require('../services/postService');
const categoryService = require('../services/categoryService');
const homeService = require('../services/homeService');
const eleventyService = require('../services/eleventyService');
const ftpClient = require('../services/ftpClient');

const PUBLIC_PATH = path.join(__dirname, '../public');
const STATIC_PATH = path.join(__dirname, '../static');

router.post('/', (req, res) => {
    //FIXME: cambiar a su propio js
    const result = nodeSass.compile(`${STATIC_PATH}/css/style.scss`, {
        loadPaths: [`${STATIC_PATH}/css`]
    });
    fs.writeFile(`${PUBLIC_PATH}/css/style.css`, result.css.toString(), (err) => {
        console.log(err);
    });

  categoryService.createCategoriesData().then((categories) => {
        homeService.createHomeDataFromCategories(categories);
        postService.createPostsData(categories);
        eleventyService.generate().then(() => {
            // sync public folder
            if (process.env.FTP_ENABLED == 'true') {
                ftpClient.syncSite(path.join(__dirname, '../public'));
            }
        });
    }); 
    res.sendStatus(202);
});

router.post('/home', (req, res) => {
    homeService.createHomeData();
    res.sendStatus(202);
});

module.exports = router;
