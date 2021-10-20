const express = require('express');
const router = express.Router();

const { DownloadController } = require('../controllers');

const downloadController = new DownloadController();

router.post('/download', downloadController.downloadFile);

module.exports = router;
