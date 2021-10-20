const express = require('express');
const router = require('./routes/index.js');
const { notFound, serverError } = require('./middleware/index.js');

const createApp = () => {
	const app = express();
	app.use(express.static('public'));

	app.use(express.urlencoded({ limit: '50mb', extended: true }));
	app.use(express.json({ limit: '50mb' }));

	app.use(router); // user signup and user-create by admin

	app.use(notFound); // not found route

	app.use(serverError); // If there is a sever error

	return app;
};

module.exports = createApp;
