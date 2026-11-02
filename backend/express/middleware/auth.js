const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'doc-translator-jwt-secret-dev'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'doc-translator-refresh-secret-dev'

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' })
}

function generateRefreshToken(user) {
  const token = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return token
}

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      User.findById(decoded.userId).then(user => {
        req.user = user || null
        next()
      }).catch(() => {
        req.user = null
        next()
      })
    } else {
      req.user = null
      next()
    }
  } catch {
    req.user = null
    next()
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { generateAccessToken, generateRefreshToken, authenticate, optionalAuth, requireAdmin, JWT_SECRET, JWT_REFRESH_SECRET }
