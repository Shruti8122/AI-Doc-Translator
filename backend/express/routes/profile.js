const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { authenticate } = require('../middleware/auth')
const { UPLOAD_FOLDER } = require('../config')

const router = express.Router()

const avatarUpload = multer({
  dest: path.join(UPLOAD_FOLDER, 'avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

router.get('/', authenticate, (req, res) => {
  res.json({ user: req.user })
})

router.put('/', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body
    if (name) req.user.name = name
    if (email) {
      const existing = await req.constructor.model('User').findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } })
      if (existing) return res.status(400).json({ error: 'Email already in use' })
      req.user.email = email
    }
    await req.user.save()
    res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' })
    const ext = path.extname(req.file.originalname) || '.png'
    const filename = `avatar_${req.user._id}${ext}`
    const destPath = path.join(UPLOAD_FOLDER, 'avatars', filename)
    fs.renameSync(req.file.path, destPath)
    req.user.avatar = `/uploads/avatars/${filename}`
    await req.user.save()
    res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }
    const isMatch = await req.user.comparePassword(currentPassword)
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' })
    req.user.password = newPassword
    await req.user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/settings', authenticate, async (req, res) => {
  try {
    const { theme, language, notifications } = req.body
    if (theme) req.user.settings.theme = theme
    if (language) req.user.settings.language = language
    if (notifications !== undefined) req.user.settings.notifications = notifications
    await req.user.save()
    res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
