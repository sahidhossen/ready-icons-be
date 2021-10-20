class DownloadController {
	constructor(req = null) {
		this.req = req;
	}

	downloadFile(req, res, send) {
		const filePath = req.body.filePath;
	}
}

module.exports = DownloadController;
