const httpClient = require('./httpClient');

const fetchCategories = async (query = ``) => {
  try {
    const { data } = await httpClient.get(`/categories?per_page=100&${!!query ? query : ''}`);
    return data;
  } catch (e) {
    console.log('error in categories', e.message);
  }
};

module.exports = { fetchCategories };
