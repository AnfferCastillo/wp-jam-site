const httpClient = require('./httpClient');


const fetchTagsById = async (ids) => {
    const idsString = ids.join(',');
    try {
      const { data } = await httpClient.get(`/tags?include=${idsString}`);
      return data.map((tag) => {
        const { id, slug, name } = tag;
        return { id, slug, name };
      });
    } catch (e) {
      console.error('Error getting tags ' + ids.join('-'), e.message);
    }
  };

module.exports = {
    fetchTagsById
}