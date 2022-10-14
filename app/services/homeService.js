const fs = require('fs');
const path = require('path');
const postApi = require('../api/postApi');
const categoryApi = require('../api/categoryApi');
const postService = require('./postService');

const HOME_FILE_PATH = path.join(__dirname, '../data/home.json');

const HOME_CATEGORIES_MAP = {
    importante: 4,
    economia: 5,
    internacionales: 4,
    deportes: 5,
    farandula: 4,
    noticias: 5,
    tubazo: 1,
};

const buildHomeData = (categoriesData) => {
    const homeData = {};

    categoriesData.forEach((category) => {
        if (HOME_CATEGORIES_MAP[category.name]) {
            homeData[category.name] = category.posts.slice(
                0,
                HOME_CATEGORIES_MAP[category.name]
            );
        }
    });

    return homeData;
};

const createHomeData = async () => {
    const categories = await categoryApi.fetchCategories();
    const homeData = {};
    for (const homeCategory in HOME_CATEGORIES_MAP) {
        if (Object.hasOwnProperty.call(HOME_CATEGORIES_MAP, homeCategory)) {
            const count = HOME_CATEGORIES_MAP[homeCategory];
            const category = categories.filter((c) => c.name == homeCategory)[0];
            homeData[homeCategory] = await postService.fetchPosts(
                count,
                1,
                `categories=${category.id}`
            );
        }
    }
    writeHomeFileData(homeData);
};

const createHomeDataFromCategories = (categoriesData) => {
    const homeData = buildHomeData(categoriesData);
    writeHomeFileData(homeData);
};

function writeHomeFileData(homeData) {
    try {
        fs.unlinkSync(HOME_FILE_PATH);
    } catch (e) {
        console.error('There was an error saving home data', e);
    }

    try {
        fs.appendFileSync(HOME_FILE_PATH, JSON.stringify(homeData));
    } catch (e) {
        console.error('There was an error saving home data', e);
    }
}

module.exports = {
    createHomeDataFromCategories,
    createHomeData,
};
