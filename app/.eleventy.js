module.exports = function (config) {
    return {
        dir: {
            input: 'views',
            output: 'public',
            data: '../data',
            tempalteFomrats: ['njk'],
        },
    };
};
