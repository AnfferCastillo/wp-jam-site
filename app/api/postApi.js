const httpClient = require('./httpClient');
const postUtils = require('../utils/postUtils');
const logger = require('../utils/logger');

const fetchPost = async (id) => {
    try {
        const { data } = await httpClient.get(`/posts/${id}`);
        const post = postUtils.parsePostFromWPApi(data);
        return post;
    } catch (e) {
        logger.error(`Error fetching post`, e.message);
        return null;
    }
};

const fetchPosts = async (perPage = 100, pageCount = 0, query = '') => {
    let page = 1;
    let isPageCountSet = false;
    const totalPageHeader = 'x-wp-totalpages';
    const totalPostsHeader = 'x-wp-total';

    const articles = [];
    try {
        let totalPages = pageCount || 1;
        while (page <= totalPages) {
            const { data, headers } = await httpClient.get(
                `/posts?per_page=${perPage}&page=${page}&${!!query ? query : ''}`
            );
            page++;
            for (i = 0; i < data.length; i++) {
                const article = postUtils.parsePostFromWPApi(data[i]);
                articles.push(article);
            }

            if (!isPageCountSet && !pageCount) {
                totalPages = headers[totalPageHeader];
                totalPosts = headers[totalPostsHeader];
                isPageCountSet = true;
            }
        }
    } catch (e) {
        logger.error(`Error fetching posts  ${e.message}`);
    }

    return articles;
};

const getRelatedPosts = (posts, categoryNames) => {
    return posts
        .filter((post) => {
            if (post.categoryNames && post.categoryNames.length > 0) {
                return post.categoryNames.some((cName) => {
                    return categoryNames.some((name) => name === cName);
                });
            }
            return false;
        })
        .splice(0, 4);
};

const getInterestedPosts = (index, posts) => {
    const count = 5;
    let interested = [];
    if (index > 4) {
        interested = posts.slice(0, count);
    } else {
        interested = [...posts.slice(0, index), ...posts.slice(index + 1, count + 1)];
    }

    return interested.map((post) => ({
        title: post.title,
        slug: post.slug,
        id: post.id,
    }));
};

const importPosts = async () => {
    const posts = await fetchPosts(100, 5);
    return posts;
};

const fetchPostPreview = async (id) => {
    try {
        const { data } = await httpClient.get(`/posts/${id}/revisions`);
        return postUtils.parsePostFromWPApi(data[0]);
    } catch (e) {
        return Promise.reject(e);
    }
};

module.exports = {
    fetchPosts,
    importPosts,
    getRelatedPosts,
    getInterestedPosts,
    fetchPost,
    fetchPostPreview,
};
