const express = require('express');
const router = express.Router();
const postService = require('../services/postService');
const eleventyService = require('../services/eleventyService');
const categoryService = require('../services/categoryService');
const homeService = require('../services/homeService');
const logger = require('../utils/logger');

const ftpClient = require('../services/ftpClient');

//FIXME: Mover a otro lado fuera del controller
const buildKeys = (categories, post = false) => {
    const keys = categories.map((cat) => `${cat.slug}/index.html`);
    keys.push('index.html');

    if (post) {
        keys.push(`posts/${post.id}/${post.slug}/index.html`);

        for (const size in post.featureMediaInfo) {
            if (Object.hasOwnProperty.call(post.featureMediaInfo, size)) {
                const path = post.featureMediaInfo[size];
                keys.push(path);
            }
        }
    }
    return keys;
};

router.get('', (req, res) => {
    console.log('This is the post id: ' + req.query.id);
    res.status(200).send();
});

router.post('/', (req, res) => {
    const postRequest = req.body;
    Promise.all([
        postService.createSinglePostData(postRequest),
        categoryService.createCategoriesData(postRequest.categories),
        homeService.createHomeData(),
    ]).then(([post, categories]) => {
        let keys = buildKeys(categories, post);
        eleventyService.generate().then(() => {
            if (process.env.FTP_ENABLED == 'true') ftpClient.syncObjects(keys);
        });
    });

    res.sendStatus(202);
});

router.delete('/', (req, res) => {
    const post = req.body;
    logger.info('Deleting post: ' + post.id);
    Promise.all([
        homeService.createHomeData(),
        categoryService.createCategoriesData(post.categories),
    ]).then(([homeData, categories]) => {
        let keys = buildKeys(categories);
        ftpClient.deleteObject(`posts/${post.id}/${post.slug}/index.html`);
        eleventyService.generate().then(() => ftpClient.syncObjects(keys));
    });

    res.sendStatus(202);
});

router.get('/:id/preview', async (req, res) => {
    const post = await postService.getPostPreview(req.params.id);
    console.log(req.body);
    res.render('posts.njk', { post });
});

module.exports = router;
