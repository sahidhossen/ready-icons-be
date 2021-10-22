const fs = require('fs');
const uuidv4 = require('uuid/v4');
const path = require('path');
const ProcessSvg = require('./process-svg');
const TemplateEngine = require('../template_engine/engine');
const shell = require('shelljs');
const BaseModule = require('./base-module');
const FsManager = require('./fs-manager');
const SvgModule = require('./svg-module');

class FontConfig extends BaseModule {
	constructor() {
		super();
		this.fsMethod = new FsManager();
		this.svgMethod = new SvgModule();
	}

	async getIcons() {
		try {
			const icons = JSON.parse(fs.readFileSync(path.resolve(this.configFolder + '/icons.json'), 'utf8'));
			return icons.glyphs;
		} catch (err) {
			return { success: false, message: err };
		}
	}

	async convertAllJsonToSvg() {
		try {
			this.loadFont();
			const { icons } = JSON.parse(fs.readFileSync(path.resolve('./icofont-icons.json'), 'utf8'));
			icons.map((icon) => {
				if (icon.cat) {
					const folderLocation = path.resolve(this.packagesFolder, icon.cat);
					this.fsMethod.createFolder(folderLocation);
					const svgTemplate = this.svgMethod.createSvgWithViewport(icon);
					this.svgMethod.exportSingleSVG({ path: folderLocation, name: icon.name, svgTemplate });
				} else {
					console.log('cat not found: ', icon);
				}
			});
			return { success: true };
		} catch (err) {
			console.log('====convertAllJsonToSvg error===:', err);
			return { success: false };
		}
	}

	async convertAllSvgToJson() {
		try {
			this.loadFont();
			const alias = await this.readAlias();
			const catDirectories = await this.readCategoryDirectory();
			if (catDirectories.length === 0) {
				throw 'Category folder not found';
			}
			const result = await this.readSvgIcons({ catDirectories, alias });
			const configPath = path.resolve(this.configFolder, 'icons.json');

			fs.writeFile(configPath, JSON.stringify({ glyphs: result.glyphs, font: result.font }, null, 2), 'utf8', (err) => {
				if (err) console.log('file write error:  ', err); // eslint-disable-line no-console
			});

			this.updateFontCode(result.updateCode);

			return result;
		} catch (err) {
			console.log('FontConfig error: ', err);
			return { success: false };
		}
	}

	async updateFontCode(updateCode) {
		if (this.font.updateCode !== updateCode) {
			fs.writeFile(
				this.fontConfigPath,
				JSON.stringify({ font: { ...this.font, updateCode } }, null, 2),
				'utf8',
				(err) => {
					if (err) console.log('Font config file write error:  ', err); // eslint-disable-line no-console
				},
			);
		}
	}

	async readAlias() {
		const alias = JSON.parse(fs.readFileSync(path.resolve(this.configFolder, 'joomla-font-alias.json'), 'utf8'));
		return alias;
	}

	async readCategoryDirectory() {
		const categoryDirectory = fs.readdirSync(this.packagesFolder).filter((file) => {
			return fs.statSync(this.packagesFolder + '/' + file).isDirectory();
		});
		return categoryDirectory;
	}

	async readSvgIcons({ alias, catDirectories }) {
		try {
			const fontConfig = { ...this.font };
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
				const iconPath = this.packagesFolder + '/' + folderName + '/';
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
			return { glyphs: iconCollection, font: fontConfig, updateCode };
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
