const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');

router.post('/', (req, res) => {
  categoryService.createCategoriesData(req.body);
  res.sendStatus(202);
});

module.exports = router;
