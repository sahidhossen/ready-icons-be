const fs = require('fs');
const uuidv4 = require('uuid/v4');
const path = require('path');
const ProcessSvg = require('./process-svg');
const TemplateEngine = require('../template_engine/engine');
const shell = require('shelljs');

class FontConfig {
	constructor() {
		this.rootPath = path.resolve('./packages');
		this.packagePath = '';
		this.targetPackageFolder = path.resolve('./packages/');
		this.categoryDirs = '';
		this.configFolder = path.resolve('./config/');
	}

	async initiate() {
		try {
			const { config, alias } = await this.readConfigFile();
			const catDirectories = await this.readCategoryDirectory();
			if (catDirectories.length === 0) {
				throw 'Category folder not found';
			}
			const result = await this.readSvgIcons({ catDirectories, config, alias });
			return result;
		} catch (err) {
			console.log('FontConfig error: ', err);
			return { success: false };
		}
	}

	async readConfigFile() {
		const config = JSON.parse(fs.readFileSync(path.resolve(this.configFolder, 'icon-config.json'), 'utf8'));
		const alias = JSON.parse(fs.readFileSync(path.resolve(this.configFolder, 'joomla-font-alias.json'), 'utf8'));
		config.font.copyright = config.font.copyright.replace('{year}', new Date().getFullYear());
		return {
			config,
			alias,
		};
	}

	async readCategoryDirectory() {
		const categoryDirectory = fs.readdirSync(this.targetPackageFolder).filter((file) => {
			return fs.statSync(this.targetPackageFolder + '/' + file).isDirectory();
		});
		return categoryDirectory;
	}

	async readSvgIcons({ config, alias, catDirectories }) {
		try {
			const fontConfig = { ...config.font };
			let updateCode = fontConfig.updateCode ? fontConfig.updateCode : fontConfig.code - 1;

			/**
			 * Check is duotone or not. If doutone then classname will be same as before one
			 * @param {string} filename
			 * @param {path} filePath
			 * @param {boolean} isDuoton
			 * @param {boolean} type
			 */
			const storeGlyphs = (folderName, filename, filePath, isDuoton, type) => {
				let glyph = {};
				const cssClass = filename.replace('-secondary', '');
				let svg = ProcessSvg.convert(fs.readFileSync(filePath, 'utf8'));
				if (!isDuoton && typeof alias[cssClass] !== 'undefined') {
					glyph.alias = alias[cssClass].join(',');
				}

				if (!svg.code) {
					updateCode = updateCode + 1;
					glyph.code = updateCode.toString(16);
					svg.code = updateCode;
					this.updateSvgFile(filePath, svg);
				} else {
					glyph.code = svg.code.toString(16);
				}

				glyph.id = uuidv4();
				glyph.name = filename;
				glyph.css = cssClass;
				glyph.cat = folderName;
				glyph.duotone = isDuoton;
				glyph.assign = type ? 'after' : 'before';
				glyph.transform = svg.transform;
				return glyph;
			};

			/**
			 * Get svg files from each folder and collect path data
			 */
			const iconCollection = [];
			catDirectories.map((folderName) => {
				const iconPath = this.targetPackageFolder + '/' + folderName + '/';
				const duotone = folderName.split('-')[0] === 'duotone';
				fs.readdirSync(iconPath).map((file) => {
					const filename = file.substring(0, file.lastIndexOf('.'));
					if (filename !== '') {
						const filePath = path.join(iconPath, filename + '.svg');
						let isSecondary = false;
						if (duotone === true) {
							isSecondary = filename.split('-').includes('secondary');
						}
						iconCollection.push(storeGlyphs(folderName, filename, filePath, duotone, isSecondary));
					}
				});
			});
			return { icons: iconCollection, config: { ...config, font: fontConfig }, updateCode };
		} catch (err) {
			console.log('SVG GENERATOR ERROR: ', err);
			throw new Error(err);
		}
	}

	updateSvgFile(iconPath, svg) {
		try {
			const newSvg = TemplateEngine.updateSvgTemplate({ svg });
			shell.rm(iconPath);
			fs.writeFileSync(iconPath, newSvg, 'utf8');
		} catch (err) {
			console.log('UPDATE SVG FILE ERROR: ', err);
		}
	}
}

module.exports = FontConfig;
