const Route = require('../../structures/Route');
const config = require('../../../../config');
const db = require('knex')(config.server.database);
const bcrypt = require('bcrypt');
const moment = require('moment');
const JWT = require('jsonwebtoken');

class loginPOST extends Route {
	constructor() {
		super('/auth/login', 'post', { bypassAuth: true });
	}

	async run(req, res) {
		if (!req.body) return res.status(400).json({ message: 'No body provided' });
		const { username, password } = req.body;
		if (!username || !password) return res.status(401).json({ message: 'Invalid body provided' });

		const user = await db.table('users').where('username', username).first();
		if (!user) return res.status(401).json({ message: 'Invalid authorization' });

		const comparePassword = await bcrypt.compare(password, user.password);
		if (!comparePassword) return res.status(401).json({ message: 'Invalid authorization.' });

		const jwt = JWT.sign({
			iss: 'lolisafe',
			sub: user.id,
			iat: moment.utc().valueOf()
		}, config.server.secret, { expiresIn: '30d' });

		return res.json({
			message: 'Successfully logged in.',
			user: { username: user.username },
			token: jwt,
			apiKey: user.apiKey
		});
	}
}

module.exports = loginPOST;