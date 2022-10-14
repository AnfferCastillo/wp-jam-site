const fs = require('fs');
const path = require('path');
const imageUtils = require('../utils/imageUtils');
const postApi = require('../api/postApi');
const tagApi = require('../api/tagApi');
const postUtils = require('../utils/postUtils');

const POST_FILE_PATH = path.join(__dirname, '../data/posts.json');

const createSinglePostData = async (postRequest) => {
    let post = postUtils.parseRequestPost(postRequest);
    try {
        console.log(`deleting existing posts data file`);
        fs.unlinkSync(POST_FILE_PATH);
    } catch (e) {}
    console.log(`creating new post data file`);
    fs.appendFileSync(POST_FILE_PATH, JSON.stringify([post]));

    return post;
};

const parsePostsMedia = (posts) => {
    console.log(`parsePostsMedia - Start`);
    posts.forEach(parseSinglePostMedia);
    console.log(`parsePostsMedia - End`);
    return posts;
};

const parseSinglePostMedia = (post) => {
    console.log(`parseSinglePostMedia - updating media info for ${post.id}`);
    post.featureMediaInfo = imageUtils.parseMediaDetails(post.media_details);
};

const updatePostsTags = async (posts) => {
    console.log(`updatePostsTags - Start`);
    for (const post of posts) {
        const tags = await tagApi.fetchTagsById(post.tags);
        post.tags = tags;
        post.tagNames = tags.map((tag) => tag.name);
    }
    console.log(`updatePostsTags - End`);
    return posts;
};

const fetchPosts = async (perPage = 100, pageCount = 0, query = '') => {
    return await postApi.fetchPosts(perPage, pageCount, query);
};

const createPostsData = (categories) => {
    const postMap = {};
    const posts = [];

    categories.forEach((cat) => {
        cat.posts.map((post) => {
            if (!postMap[post.id]) {
                postMap[post.id] = 1;
                posts.push(post);
            }
        });
    });

    try {
        console.log(`deleting existing posts data file`);
        fs.unlinkSync(POST_FILE_PATH);
    } catch (e) {
        console.error('No file found', e);
    }
    console.log(`creating new post data file`);
    fs.appendFileSync(POST_FILE_PATH, JSON.stringify(posts));
    console.log(`Post data file created`);
};

const getPostPreview = async (id) => {
    return postApi.fetchPostPreview(id);
};

module.exports = {
    updatePostsMedia: parsePostsMedia,
    updateSinglePostMedia: parseSinglePostMedia,
    fetchPosts,
    updatePostsTags,
    createSinglePostData,
    createPostsData,
    getPostPreview,
};
