const path = require('path');

class BaseModule {
	constructor() {
		this.configFolder = path.resolve('./config/');
		this.packagesFolder = path.resolve('./packages/');
		this.publicPath = path.resolve('./public');
	}
}

module.exports = BaseModule;
