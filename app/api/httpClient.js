const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = require('axios');

const logger = require('../utils/logger');

const WP_USER = process.env.WP_USER || 'user';
const WP_PASSWORD = process.env.WP_PASSWORD || '123456';
const ENDPONT = process.env.LOGIN_ENDPOINT;
const auth = {
    token: '',
};

const client = axios.create({
    baseURL: process.env.API_URL,
    httpsAgent,
});

client.interceptors.request.use(
    function (config) {
        config.headers['Authorization'] = `Bearer ${auth.token}`;
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

const login = async () => {
    try {
        const { data } = await axios.post(ENDPONT, {
            username: WP_USER,
            password: WP_PASSWORD,
        });
        auth.token = data.token;
        logger.info('Logged in auth.token');
    } catch (e) {
        logger.error('error loggin in', e);
    }
};

login();

module.exports = client;
