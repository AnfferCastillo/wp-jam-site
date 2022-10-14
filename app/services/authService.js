const httpClient = require('../api/httpClient');
const logger = require('../utils/logger');

const WP_USER = process.env.WP_USER || 'user';
const WP_PASSWORD = process.env.WP_PASSWORD || '123456';
const ENDPONT = process.env.LOGIN_ENDPOINT;
const auht = {
    token: '',
};

const login = async () => {
    try {
        auht.token = await httpClient.post(ENDPONT, {
            username: WP_USER,
            password: WP_PASSWORD,
        });
    } catch (e) {
        logger.error(e);
    }
};
