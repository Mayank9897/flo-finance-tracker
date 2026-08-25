const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET || 'flo-development-secret-change-me'

function signToken(user) { return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' }) }
function verifyToken(token) { return jwt.verify(token, secret) }

module.exports = { signToken, verifyToken }
