const { IcoGenerator, ProcessSvg, CreatePackage, FontConfig } = require('../generator/modules');

class IconGeneratorController {
	constructor(req) {
		this.req = req;
	}

	async getIcons() {
		try {
			const configMethod = new FontConfig();
			const icons = await configMethod.getIcons();
			return { success: true, icons };
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async generateAndDownloadSvg() {
		try {
			const iconName = this.req.body.iconName;
			const code = this.req.body.code;
			const configMethod = new FontConfig();
			const icons = await configMethod.getIcons();
			const icon = icons.find((i) => i.name === iconName && i.code === code);
			if (!icon) {
				throw 'Icon not found!';
			}
			const iconGenerator = new IcoGenerator();
			const result = await iconGenerator.createSingleSvg(icon);
			return { ...result, success: true };
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async createFontConfigaration() {
		try {
			const configMethod = new FontConfig();
			const result = await configMethod.convertAllSvgToJson();
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

	async convertSvgToJson() {
		try {
			const fontConfig = new FontConfig();
			const result = await fontConfig.convertAllSvgToJson();
			return {
				success: true,
				config: result.config,
				folders: result.categoryDirs,
				icons: result.icons,
			};
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async convertAllJsonToSvg() {
		try {
			const fontConfig = new FontConfig();
			const result = await fontConfig.convertAllJsonToSvg();
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
