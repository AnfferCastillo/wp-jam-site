const path = require('path');
const sharp = require('sharp');
const logger = require('./logger');

const PUBLIC_FOLDER = `${__dirname}/../public`;
const BASE_IMAGE_PATH = process.env.BASE_IMAGE_PATH || `${__dirname}/../..`;
const PATH_PATTERN = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/;

const convertImage = (imagePath, otuputName) => {
    sharp(imagePath)
        .webp()
        .toFile(`${PUBLIC_FOLDER}/${otuputName}`)
        .then((data) => {
            logger.info(`image ${otuputName} process`);
        })
        .catch((err) => logger.error(`error converting image ${imagePath}`, err));
};

const getAssetPath = (filePath) => {
    let outputName = path.parse(filePath).name;
    outputName = `${outputName}.webp`;
    return `/assets/images/${outputName}`;
};

const convertPostImage = (mediaInfo) => {
    logger.info('Parsing media: ' + mediaInfo.id);

    if (!mediaInfo) return {};

    const convertedImages = {};

    const mediaPaths = {
        thumbnail: `${getFilePath(mediaInfo.sizes.thumbnail.source_url)}`,
        full: `${getFilePath(mediaInfo.sizes.full.source_url)}`,
        medium: `${getFilePath(mediaInfo.sizes.medium.source_url)}`,
    };

    for (const file in mediaPaths) {
        if (Object.hasOwnProperty.call(mediaPaths, file)) {
            const filePath = mediaPaths[file];
            let outputName = getAssetPath(filePath);
            convertImage(filePath, outputName);
            convertedImages[file] = outputName;
        }
    }

    return convertedImages;
};

const parseMediaDetails = (mediaInfo) => {
    if (!mediaInfo) return;
    const mediaPaths = {
        thumbnail: `${getFilePath(mediaInfo.sizes.thumbnail.source_url)}`,
        full: `${getFilePath(mediaInfo.sizes.full.source_url)}`,
        medium: `${getFilePath(mediaInfo.sizes.medium.source_url)}`,
    };

    return {
        thumbnail: getAssetPath(mediaPaths.thumbnail),
        full: getAssetPath(mediaPaths.full),
        medium: getAssetPath(mediaPaths.medium),
    };
};

const getFilePath = (url) => {
    const matches = PATH_PATTERN.exec(url);
    if (matches.length >= 4) return path.normalize(`${BASE_IMAGE_PATH}/${matches[3]}`);
    return '';
};

module.exports = { convertImage, parseMediaDetails, convertPostImage };
