const {
	NODE_ENV = 'development',

	APP_PORT = 3001,
	APP_HOSTNAME = 'localhost',
	APP_PROTOCOL = 'http',

	APP_SECRET = '4d2ca599b4189f74a771f44b8a8d06f572208b5649f5ae216f8e94612a267ff0',
} = process.env;

module.exports = {
	NODE_ENV,
	APP_PORT,
	APP_HOSTNAME,
	APP_PROTOCOL,
	APP_SECRET,
};
