const express = require('express');
const router = express.Router();
const { IcoGenerator, ProcessSvg, CreatePackage, FontConfig } = require('./modules');

/**
 * Dammy function for future version
 * It will convert custom uploaded icon
 * (Not used)
 */
router.post('/', function (req, res, next) {
	res.status(403).end();
	try {
		const iconGenerator = new IcoGenerator();
		let result = {};
		let allCustomIcons = req.body.allCustomIcons ? JSON.parse(req.body.allCustomIcons) : [];
		let icon = req.body.icon ? req.body.icon : null;
		if (icon === null) throw new Error('Icon is null ');
		else ProcessSvg.svgObj = JSON.parse(icon);
		result = ProcessSvg.convert();
		allCustomIcons.push(result);
		iconGenerator.icons = allCustomIcons;
		iconGenerator.init(true); // Only generate custom icon with ttf font
		res.status(200).send({
			success: true,
			icon: result,
			result: iconGenerator.customCssTemplate,
		});
	} catch (e) {
		res.status(200).send({ success: false, message: e });
	}
});

/**
 * Generate JSON object from all svg file and store it in icons.json file
 * Get config from master config file (config.json)
 * Return glyphs list
 */

router.get('/bf142d158ec57bea9a9cae1b77d5018d/svg2json', function (req, res) {
	try {
		const createConfig = new FontConfig();
		const result = createConfig.convertAllSvgToJson();
		res.status(200).send({
			success: true,
			config: result.config,
			folders: result.categoryDirs,
			icons: result.icons,
		});
	} catch (e) {
		res.status(200).send({ success: false, message: e });
	}
});

/**
 * render single svg from icon object and download
 */

router.post('/single_svg', function (req, res, next) {
	try {
		let Icon = req.body.icon;
		Icon = Icon ? JSON.parse(Icon) : { icon_count: 0 };
		const iconGenerator = new IcoGenerator();
		iconGenerator.isSelfPackage = false;
		iconGenerator.singleSvgInit(Icon);

		res.status(200).send({ uuid: iconGenerator.fsMethod.uid, iconName: Icon.name, success: true });
	} catch (e) {
		res.status(200).send({ success: false, message: e });
	}
});

/**
 * Generate icon and font from glyphs object
 * Store uuid in session for download custom package
 */

router.post('/get_session', function (req, res, next) {
	try {
		let selectedIcons = req.body.icons;
		selectedIcons = selectedIcons ? JSON.parse(selectedIcons) : { icon_count: 0 };

		/*
		 * Assign icons to the generator module
		 * Create current user folder and generate everything
		 * Generator module will process this icon and create css, fonts and svg file
		 */
		const iconGenerator = new IcoGenerator();
		iconGenerator.isSelfPackage = false;
		iconGenerator.icons = selectedIcons;
		iconGenerator.generate(); // Generator method will invoke the main functions

		if (iconGenerator.errors.error === true)
			// Check if generator has error after create css, fonts and svg
			console.log('errors: ', iconGenerator.errors.message); // eslint-disable-line no-console
		iconGenerator.fsMethod.zipDir(); // Create zip file after create necessary file and folder

		res.status(200).send({ uuid: iconGenerator.fsMethod.uid, success: true });
	} catch (error) {
		res.status(200).send({ success: false, message: error });
	}
});

/**
 * Generate icofonts.json from main icons.json for view
 * It will generate new package for newly added svg icon which contain css and fonts files
 * Move package folder to the public css and a zip version to the global_download folder for all users
 */

router.get('/bf142d158ec57bea9a9cae1b77d5018d/svg2package', (req, res) => {
	try {
		const _package = new CreatePackage();
		const result = _package.initiate();
		res.status(200).send({ success: true, result });
	} catch (e) {
		res.status(200).send({ success: false });
	}
});

module.exports = router;
