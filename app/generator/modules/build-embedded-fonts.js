const fs = require('fs');
const _ = require('lodash');
const SvgPath = require('svgpath');
const uuidv4 = require('uuid/v4');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const b64 = require('base64-js');
const compressor = require('node-minify');
const cssbeautify = require('cssbeautify');
const FsManager = require('./fs-manager');
const TemplateEngine = require('../template_engine/engine');
const BaseModule = require('./base-module');
const SvgModule = require('./svg-module');

class IcoGenerator extends BaseModule {
	constructor() {
		super();
		this.icons = [];
		this.errors = {
			error: false,
			message: [],
		};
		this.glyphs = [];
		this.uid = uuidv4();
		this.isSelfPackage = false;
		this.fsMethod = new FsManager();
		this.svgMethod = new SvgModule();
		this.loadFont();
	}

	generate() {
		this.init();
		this.exportResource();
		if (!fs.existsSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.svg')) {
			this.errorLog('convert not possible, SVG file not exists!');
		} else {
			this.convertSvgToWebFont();
		}
	}

	async createSingleSvg(iconData) {
		try {
			const svgTemplate = this.svgMethod.createSvg({ data: iconData, font: this.font });
			this.fsMethod.singleSvgInit(this.uid);
			this.svgMethod.exportSingleSVG({ path: this.fsMethod.userFolder, name: iconData.name, svgTemplate });
			return { path: this.fsMethod.userFolder, iconName: iconData.name };
		} catch (err) {
			throw err;
		}
	}

	init(isCustom = false) {
		this.flashModule();
		this.glyphGenerator();
		if (isCustom === false) {
			if (this.isSelfPackage) {
				this.fsMethod.srcPath = 'global_package';
			} else {
				this.fsMethod.srcPath = 'download';
			}

			this.fsMethod.packageName = this.font.packageName;
			this.fsMethod.init(this.uid, true);
			this.renderTemplate();
		} else {
			this.exportFontFace();
		}
	}

	glyphGenerator() {
		_.forEach(this.icons, (glyph) => {
			this.addIcon(glyph);
		});
	}

	addIcon(glyph) {
		this.glyphs.push({
			height: typeof glyph.svg.height === 'undefined' ? glyph.svg.width : glyph.svg.height,
			width: glyph.svg.width,
			d: new SvgPath(glyph.svg.path).scale(1, -1).translate(0, 850).abs().round(0).rel().toString(),
			css: glyph.name,
			assign: glyph.assign,
			alias: glyph.alias,
			duotone: glyph.duotone,
			id: glyph.id,
			name: glyph.name,
			content: '&#x' + glyph.code + ';',
			unicode: glyph.code,
		});
	}

	getUnicode(glyph_name) {
		let unicode = glyph_name.split('');
		unicode.filter((s, i) => {
			if (!isNaN(s)) {
				unicode[i] = '&#x3' + unicode[i] + ';';
			}
		});
		unicode = unicode.join('').split('-').join('_');
		return unicode;
	}

	renderTemplate() {
		this.svgTemplate = TemplateEngine.svgFontTemplate({ font: this.font, glyphs: this.glyphs });
		this.cssTemplate = TemplateEngine.cssFontFile({ font: this.font, glyphs: this.glyphs });
		this.cssTemplate = cssbeautify(this.cssTemplate, {
			indent: '  ',
			openbrace: 'separate-line',
			autosemicolon: true,
		});
		//Ignore duplicate icons loop
		this.exampleTemplate = TemplateEngine.exampleHtml({ font: this.font, glyphs: this.glyphs });
	}

	exportFontFace(svg) {
		const ttf = svg2ttf(svg, {}).buffer;
		return 'data:font/truetype;base64,' + b64.fromByteArray(ttf);
	}

	exportSVG() {
		fs.writeFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.svg', this.svgTemplate, 'utf8');
		return true;
	}
	exportCSS() {
		fs.writeFileSync(this.fsMethod.cssFolder + '/' + this.font.filename + '.css', this.cssTemplate, 'utf8');
		return true;
	}

	minifiedCss() {
		const cssUrl = this.fsMethod.cssFolder + '/' + this.font.filename + '.css';
		const cssUrlMinified = this.fsMethod.cssFolder + '/' + this.font.filename + '.min.css';
		compressor.minify({
			compressor: 'clean-css',
			input: cssUrl,
			output: cssUrlMinified,
			options: {
				advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
				aggressiveMerging: false, // set to false to disable aggressive merging of properties.
				keepSpecialComments: '*',
			},
			callback: (err, min) => {
				if (err) this.errorLog('Css minified problem');
			},
		});
	}
	exportExampleFile() {
		fs.writeFileSync(this.fsMethod.exampleFolder + '/demo.html', this.exampleTemplate, 'utf8');
		return true;
	}
	exportResource() {
		if (!this.exportSVG()) this.errorLog('exportSVG has problem!');
		if (this.exportCSS()) this.minifiedCss();
		// else
		// this.errorLog("exportCSS has problem! ");
		if (!this.exportExampleFile()) this.errorLog('exportExampleFile has problem! ');
	}
	svgToTtf() {
		const ttf = svg2ttf(fs.readFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.svg', 'utf-8'), {});
		fs.writeFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.ttf', new Buffer.from(ttf.buffer));
		return true;
	}
	ttfToEot() {
		const input = fs.readFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.ttf');
		fs.writeFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.eot', ttf2eot(input));
		return true;
	}
	ttfToWoff() {
		const ttf = ttf2woff(fs.readFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.ttf'), {});
		fs.writeFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.woff', new Buffer.from(ttf.buffer));
		return true;
	}
	ttfToWoff2() {
		const input = fs.readFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.ttf');
		fs.writeFileSync(this.fsMethod.fontsFolder + '/' + this.font.filename + '.woff2', ttf2woff2(input, {}));
		return true;
	}

	convertSvgToWebFont() {
		if (!this.svgToTtf()) this.errorLog('svg2ttf generate problem ');
		// if(!this.ttfToEot())
		//     this.errorLog("ttfToEot generate problem ");
		if (!this.ttfToWoff()) this.errorLog('ttfToWoff generate problem ');
		if (!this.ttfToWoff2()) this.errorLog('ttfToWoff2 generate problem ');
	}
	flashModule() {
		this.errors = { error: false, message: [] };
		this.glyphs = [];
	}
	errorLog(error) {
		let errorMessage = this.errors.message;
		errorMessage.push(error);
		this.errors = { error: true, message: errorMessage };
	}
}

module.exports = IcoGenerator;
