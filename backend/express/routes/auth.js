const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { generateAccessToken, generateRefreshToken, authenticate, JWT_SECRET, JWT_REFRESH_SECRET } = require('../middleware/auth')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    const user = await User.create({ name, email, password })
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    user.refreshTokens.push({ token: refreshToken })
    await user.save()
    res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    user.refreshTokens.push({ token: refreshToken })
    await user.save()
    res.json({ user, accessToken, refreshToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }
    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken)
    if (!tokenExists) {
      return res.status(401).json({ error: 'Refresh token not recognized' })
    }
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken)
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    user.refreshTokens.push({ token: newRefreshToken })
    await user.save()
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken)
      await req.user.save()
    }
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ error: 'No account with that email' })
    const crypto = require('crypto')
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save()
    res.json({ message: 'Password reset link sent', resetToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' })
    user.password = password
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    user.refreshTokens = []
    await user.save()
    res.json({ message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
