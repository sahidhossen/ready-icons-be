const express = require('express');
const router = express.Router();

const { IconGeneratorController } = require('../controllers');

router.get('/icons', (req, res, next) => {
	const controller = new IconGeneratorController(req);
	return controller
		.getIcons()
		.then((result) => res.send(result))
		.catch(next);
});

router.post('/download-svg', (req, res, next) => {
	const controller = new IconGeneratorController(req);
	return controller
		.generateAndDownloadSvg()
		.then((result) => res.send(result))
		.catch(next);
});

router.get('/create-font-config', (req, res, next) => {
	return new IconGeneratorController(req)
		.createFontConfigaration()
		.then((result) => res.send(result))
		.catch(next);
});

router.get('/create-package', (req, res, next) => {
	return new IconGeneratorController(req)
		.createPackage()
		.then((result) => res.send(result))
		.catch(next);
});

router.post('/svg-to-json', (req, res, next) => {
	return new IconGeneratorController(req)
		.convertSvgToJson()
		.then((result) => res.send(result))
		.catch(next);
});

router.post('/json-to-svg', (req, res, next) => {
	return new IconGeneratorController(req)
		.convertAllJsonToSvg()
		.then((result) => res.send(result))
		.catch(next);
});

module.exports = router;
