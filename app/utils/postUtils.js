const imageUtils = require('./imageUtils');
const logger = require('./logger');

const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const formatDate = (date) => {
    const year = date.substring(0, 4);
    const month = Number(date.substring(5, 7));
    const day = date.substring(8, 10);

    return `${MONTHS[Number(month)]} ${day}, ${year}`;
};

const parseAassociatedPosts = (post, key) => {
    return (
        post[key] &&
        post[key].map((kp) => {
            return {
                id: kp.id,
                slug: kp.slug,
                title: kp.title,
                featureMediaInfo: imageUtils.parseMediaDetails(kp.media_details),
            };
        })
    );
};

const parsePostFromWPApi = (post) => {
    logger.info('Parsing WP Post ' + post.id);
    return {
        id: post.id,
        content: post.content.rendered,
        date: post.date,
        modified: post.modifed,
        formatedDate: formatDate(post.date),
        title: post.title.rendered,
        slug: post.slug,
        exceprt: post.excerpt.rendered.replace('<p>', '').replace('</p>', ''),
        categories: post.categories,
        tags: post.tags_details,
        featuredMedia: post.featured_media,
        featureMediaInfo: imageUtils.convertPostImage(post.media_details),
        relatedPosts: parseAassociatedPosts(post, 'related_posts'),
        interestingPosts: parseAassociatedPosts(post, 'interested_posts'),
    };
};

const parseRequestPost = (post) => {
    const parsedInfo = {
        formatedDate: formatDate(post.date),
        featureMediaInfo: imageUtils.convertPostImage(post.featureMediaInfo),
        relatedPosts: parseAassociatedPosts(post, 'relatedPosts'),
        interestingPosts: parseAassociatedPosts(post, 'interestingPosts'),
    };

    return Object.assign({}, post, parsedInfo);
};

module.exports = { parsePostFromWPApi, parseRequestPost };
