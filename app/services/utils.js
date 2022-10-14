const axios = require('axios');
const API_URL = 'https://cheverenoticias.com/wp-json/wp/v2';

const fetchCategories = async () => {
  try {
    console.log('Fetching categories');
    const { data } = await axios.get(`${API_URL}/categories`);
    return data;
  } catch (e) {
    console.error('error in categories', e);
  }
};


exports ={ fetchCategories, fetchPosts };
