const path = require('path');
const fs = require('fs');
const SvgPath = require('svgpath');
const _ = require('lodash');
const IcoGenerator = require('./build-embedded-fonts');
const ProcessSvg = require('./process-svg');
const BaseModule = require('./base-module');

class CreatePackage extends BaseModule {
	constructor() {
		super();
	}
	initiate() {
		try {
			if (!fs.existsSync(this.packagesFolder)) {
				throw 'Font directory not exits!';
			}
			const iconGenerator = new IcoGenerator();

			const jsonWritePath = this.packagesFolder + '/icofonts.json';
			const cfg = JSON.parse(fs.readFileSync(path.resolve(this.configFolder, 'icons.json'), 'utf8'));
			const collection = this.collectGlyphData(cfg, this.packagesFolder);
			iconGenerator.font = Object.assign({}, iconGenerator.font, cfg.font);
			iconGenerator.icons = collection.glyphs;
			iconGenerator.isSelfPackage = true;
			iconGenerator.generate(); // Generator method will invoke the main functions
			if (iconGenerator.errors.error === true) {
				// Check if generator has error after create css, fonts and svg
				console.log('errors: ', iconGenerator.errors.message); // eslint-disable-line no-console
			}
			//iconGenerator.fsMethod.zipDir() // Create zip file after create necessary file and folder
			fs.writeFile(jsonWritePath, JSON.stringify(collection, null, 2), 'utf8', (err) => {
				if (err) console.log('file write error:  ', err); // eslint-disable-line no-console
			});
			return { success: true, message: 'Package created!' };
		} catch (err) {
			console.log('CREATE PACKAGE ERROR: ', err);
			return { success: false, message: err };
		}
	}

	collectGlyphData(cfg, fontDir) {
		let configServer = {
			glyphs: [],
			icons: [],
			categories: {},
			font: {},
			meta: {},
		};
		try {
			configServer.font = _.clone(cfg.font, true);
			// iterate glyphs
			_.forEach(cfg.glyphs, function (glyph) {
				// Cleanup fields list
				let glyphData = _.pick(glyph, ['css', 'name', 'duotone', 'assign', 'code', 'id', 'css-ext', 'cat']);
				// Add more data for server config
				glyphData.filename = cfg.font.filename;
				glyphData.svg = {};
				// load file & translate coordinates
				let fileName = path.join(fontDir, glyph.cat, glyphData.name + '.svg');
				// let svg = ProcessSvg.parseSvgImage(fs.readFileSync(fileName, 'utf8'), fileName)
				let svg = ProcessSvg.convert(fs.readFileSync(fileName, 'utf8'));

				// FIXME: Apply transform from svg file. Now we understand
				// pure paths only.
				let scale = 1000 / svg.height;
				glyphData.svg.width = +(svg.width * scale).toFixed(1);
				glyphData.svg.path = new SvgPath(svg.d).translate(-svg.x, -svg.y).scale(scale).abs().round(1).rel().toString();
				const newGlyphs = {
					id: glyphData.id,
					name: glyphData.css,
					assign: glyphData.assign,
					duotone: glyphData.duotone,
					code: glyphData.code,
					svg: glyphData.svg,
					cat: glyphData.cat,
					alias: glyph.alias,
				};

				if (configServer.categories[glyphData.cat]) {
					configServer.categories[glyphData.cat].total = configServer.categories[glyphData.cat].total + 1;
				} else {
					configServer.categories[glyphData.cat] = { cat_name: glyphData.cat, total: 1 };
				}
				configServer.glyphs.push(_.clone(newGlyphs, true));
			});
			return configServer;
		} catch (err) {
			console.log('Glyph collection error: ', err);
			return configServer;
		}
	}
}

module.exports = CreatePackage;
