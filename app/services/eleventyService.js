const Eleventy = require('@11ty/eleventy');

const generate = async () => {
  const eleventy = new Eleventy();
  eleventy.init();
  await eleventy.write();
  return true;
};

module.exports = {
  generate,
};
