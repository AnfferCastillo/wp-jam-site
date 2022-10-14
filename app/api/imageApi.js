const httpClient = require('./httpClient');

const BASE_IMAGE_PATH = process.env.BASE_IMAGE_PATH || '';
const PATH_PATTERN = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/;

const getFilePath = (url) => {
    const matches = PATH_PATTERN.exec(url);
    if (matches.length >= 4) return `${BASE_IMAGE_PATH}/${matches[3]}`;
    return '';
};

const fetchMediaInfrmation = async (mediaId) => {
    try {
        const { data } = await httpClient.get(`/media/${mediaId}`);
        const mediaDetails = {
            thumbnail: `${getFilePath(data.media_details.sizes.thumbnail.source_url)}`,
            full: `${getFilePath(data.source_url)}`,
            medium: `${getFilePath(data.media_details.sizes.medium.source_url)}`,
        };
        return mediaDetails;
    } catch (e) {
        console.log(`Error fetching images for ${mediaId}`, e.message);
    }
    return {};
};

module.exports = {
    fetchMediaInfrmation,
};
