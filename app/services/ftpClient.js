const Client = require('basic-ftp');
const path = require('path');
const logger = require('../utils/logger');

const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_SERVER = process.env.FTP_SERVER;
const PUBLIC_PATH = path.join(__dirname, '../public');

const syncObjects = async (objects) => {
    try {
        const ftpClient = getFtpClientInstance();

        for (const obj of objects) {
            try {
                const key = obj.startsWith('/') ? obj.substring(1) : obj;
                await ftpClient.uploadFrom(`${PUBLIC_PATH}/${key}`, key);
                logger.info(`${PUBLIC_PATH}/${key} file updated`);
            } catch (e) {
                logger.error(logger.info(`${PUBLIC_PATH}/${obj} file updated`));
            }
        }

        ftpClient.close();
    } catch (e) {
        logger.error('this is' + e);
    }
};

const syncSite = async () => {
    try {
        const ftpClient = getFtpClientInstance();
        ftpClient
            .uploadFromDir(PUBLIC_PATH)
            .then(() => ftpClient.close())
            .catch(() => ftpClient.close());
    } catch (e) {
        logger.error('this is' + e);
    }
};

const deleteObject = async (key) => {
    try {
        const ftpClient = getFtpClientInstance();
        ftpClient
            .remove(key)
            .then(() => ftpClient.close())
            .catch(() => ftpClient.close());
    } catch (e) {
        logger.error('this is' + e);
    }
};

const getFtpClientInstance = async () => {
    const ftpClient = new Client.Client();
    ftpClient.ftp.verbose = true;
    await ftpClient.access({
        host: FTP_SERVER,
        user: FTP_USER,
        password: FTP_PASSWORD,
        secure: true,
        secureOptions: {
            rejectUnauthorized: false,
        },
    });
    return ftpClient;
};

module.exports = {
    syncSite,
    syncObjects,
    deleteObject,
};
