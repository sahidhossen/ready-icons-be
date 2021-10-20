const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

class FsManager {
	constructor() {
		this.uid = '';
		this.publicPath = path.resolve('./public');
		this.packageName = 'readyicon-icons';
		this.commonFolder = ['fonts'];
	}
	singleSvgInit(uuid) {
		this.uid = uuid;
		this.createDownloadFolder();
	}
	init(uuid, force = false) {
		this.uid = uuid;
		if (force === true) {
			this.clearTrashCan();
			this.createDownloadFolder();
			this.createIcoFontFolders();
		}
	}
	clearTrashCan() {
		const publicPath = path.join(this.publicPath);
		if (fs.existsSync(publicPath)) shell.rm('-rf', publicPath);
	}

	createDownloadFolder() {
		this.userFolder = path.join(this.publicPath);
		shell.mkdir('-p', this.userFolder);
	}
	createIcoFontFolders() {
		this.fontsFolder = path.join(this.userFolder, this.packageName, 'fonts');

		this.cssFolder = path.join(this.userFolder, this.packageName);
		this.exampleFolder = path.join(this.userFolder, this.packageName);

		shell.mkdir('-p', [this.userFolder, this.fontsFolder]);
	}
	zipDir() {
		const baseDir = this.userFolder + '/' + this.packageName + '/';
		const archive = archiver.create('zip', {});
		const output = fs.createWriteStream(this.userFolder + '/' + this.packageName + '.zip');
		archive.pipe(output);
		archive.directory(baseDir, this.packageName);
		archive.finalize();
		this.userZipFolder = this.userFolder + '/' + this.packageName + '.zip';
	}
	moveFilesToDestination() {
		const assets = path.join(this.publicPath, this.packageName);
		const downloadPath = path.join(this.publicPath, 'download', 'global_package');
		if (fs.existsSync(assets)) shell.rm('-rf', assets);
		if (fs.existsSync(downloadPath + '/' + this.packageName + '.zip'))
			shell.rm('-rf', downloadPath + '/' + this.packageName + '.zip');

		const baseDir = this.userFolder + '/' + this.packageName + '/';
		shell.mv(baseDir, assets);
		shell.mv(this.userFolder + '/' + this.packageName + '.zip', downloadPath);
		shell.rm('-rf', this.userFolder);
	}
}

module.exports = FsManager;
