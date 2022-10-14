const fs = require('fs');
const path = require('path');
const postService = require('./postService');
const categoryApi = require('../api/categoryApi');
const CATEGORIES_FILES = path.join(__dirname, '../data/categories.json');

const buildCategoryDictionary = async (categories) => {
    const categoryDictionary = {};

    if (categories == undefined || categories.length == 0) {
        categories = await categoryApi.fetchCategories();
    }

    categories.forEach((category) => {
        if (categoryDictionary[category.slug] == undefined) {
            categoryDictionary[category.slug] = {
                id: category.id,
                name: category.name,
                slug: category.slug,
            };
        }
    });
    return categoryDictionary;
};

const fetchCategoriesData = async (categories = []) => {
    const categoryData = [];

    for (const categoryName in categories) {
        if (Object.hasOwnProperty.call(categories, categoryName)) {
            const category = categories[categoryName];
            const data = await getPostsByCategory(category);
            categoryData.push(data);
        }
    }

    return categoryData;
};

const writeCategoryFiles = (categories) => {
    try {
        fs.unlinkSync(CATEGORIES_FILES);
    } catch (e) {
        console.error('There was an error saving category data', e);
    }

    try {
        fs.appendFileSync(CATEGORIES_FILES, JSON.stringify(categories));
    } catch (e) {
        console.error('There was an error saving category data', e);
    }
};

async function getPostsByCategory(category) {
    const posts = await postService.fetchPosts(20, 1, `categories=${category.id}`);
    const data = {
        name: category.name,
        slug: category.slug,
        taxonomy: category.taxonomy,
        posts: posts,
    };
    return data;
}

const createCategoriesData = (categories) => {
    return new Promise(async (resolve, reject) => {
        const categoryDictionary = await buildCategoryDictionary(categories);

        fetchCategoriesData(categoryDictionary).then((categories) => {
            writeCategoryFiles(categories);
            resolve(categories);
        });
    });
};

module.exports = {
    createCategoriesData,
    fetchCategoriesData,
};
