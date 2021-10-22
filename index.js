const { AppConfig } = require('./app/config/index.js');
const createApp = require('./app/createApp.js');

(async () => {
	const app = createApp();
	app.listen(AppConfig.APP_PORT, () => console.log(`http://localhost:${AppConfig.APP_PORT}`));
})();
