const fs = require('fs');
const BaseModule = require('./base-module');
const TemplateEngine = require('../template_engine/engine');

class SvgModule extends BaseModule {
	constructor() {
		super();
	}

	generateSvg(data) {
		return {
			height: typeof data.svg.height === 'undefined' ? data.svg.width : data.svg.height,
			width: data.svg.width,
			d: data.svg.path,
			css: data.name,
			assign: data.assign,
			id: data.id,
			name: data.name,
			unicode: data.code.toString(16),
			content: '&#x' + data.code.toString(16) + ';',
		};
	}

	createSvg({ data, font }) {
		const glyph = this.generateSvg(data);
		const svgTemplate = TemplateEngine.singleSvgFontTemplate({ font: font, glyph });
		return svgTemplate;
	}

	createSvgWithViewport(data) {
		const svg = {
			height: typeof data.svg.height === 'undefined' ? data.svg.width : data.svg.height,
			width: data.svg.width,
			d: data.svg.path,
			viewBox: '0 0 1000 1000',
			code: parseInt(data.code, 16),
		};
		const svgTemplate = TemplateEngine.updateSvgTemplate({ svg });
		return svgTemplate;
	}

	exportSingleSVG({ path, name, svgTemplate }) {
		fs.writeFileSync(path + '/' + name.replace(' ', '') + '.svg', svgTemplate, 'utf8');
		return true;
	}
}

module.exports = SvgModule;
