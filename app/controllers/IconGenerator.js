const { IcoGenerator, ProcessSvg, CreatePackage, FontConfig } = require('../generator/modules');

class IconGeneratorController {
	constructor(req) {
		this.req = req;
	}

	async getIcons() {
		try {
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async generateAndDownloadSvg() {
		try {
			const Icon = this.req.body.icon;
			// Icon = Icon ? JSON.parse(Icon) : { icon_count: 0 };
			const iconGenerator = new IcoGenerator();
			iconGenerator.isSelfPackage = false;
			iconGenerator.singleSvgInit(Icon);
			return { uuid: iconGenerator.fsMethod.uid, iconName: Icon.name, success: true };
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async createFontConfigaration() {
		try {
			const configMethod = new FontConfig();
			const result = await configMethod.initiate();
			return {
				success: true,
				result,
			};
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async createPackage() {
		try {
			const _package = new CreatePackage();
			const result = _package.initiate();
			return {
				success: true,
				result,
			};
		} catch (err) {
			return { success: false, message: err };
		}
	}
}
module.exports = IconGeneratorController;
