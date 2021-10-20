const notFound = (req, res, next) => res.status(404).json({ message: 'Route Not Found' });

const serverError = (err, req, res, next) => {
	if (!err.status) {
		console.error(err.stack);
	}
	res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

module.exports = {
	notFound,
	serverError,
};
