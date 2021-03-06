const express = require('express');
const router = express.Router();
const api = require('./api');
const web = require('./web');

router.use('/api', api);

router.use(web);

module.exports = router;
