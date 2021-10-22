const path = require('path');
const fs = require('fs');
class BaseModule {
	constructor() {
		this.configFolder = path.resolve('./config/');
		this.packagesFolder = path.resolve('./packages/');
		this.publicPath = path.resolve('./public');
		this.fontConfigPath = path.resolve(this.configFolder, 'icon-config.json');
		this.font = null;
	}

	loadFont() {
		if (!this.font) {
			console.log('======generate font======');
			const config = JSON.parse(fs.readFileSync(this.fontConfigPath, 'utf8'));
			config.font.copyright = config.font.copyright.replace('{year}', new Date().getFullYear());
			this.font = config.font;
		}
	}
}

module.exports = BaseModule;
