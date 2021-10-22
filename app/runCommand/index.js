const { FontConfig, CreatePackage } = require('../generator/modules');

const buildFontJson = () => {
	new FontConfig().convertAllSvgToJson();
};

const buildFontPackage = () => {
	new CreatePackage().initiate();
};

module.exports = {
	buildFontJson,
	buildFontPackage,
};
