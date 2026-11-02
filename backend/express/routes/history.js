const express = require('express')
const path = require('path')
const fs = require('fs')
const History = require('../models/History')
const Task = require('../models/Task')
const { authenticate } = require('../middleware/auth')
const { UPLOAD_FOLDER } = require('../config')

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sort = '-createdAt' } = req.query
    const query = { userId: req.user._id }
    if (search) {
      query.$or = [
        { originalFilename: { $regex: search, $options: 'i' } },
        { sourceLangName: { $regex: search, $options: 'i' } },
        { targetLangName: { $regex: search, $options: 'i' } }
      ]
    }
    if (status) {
      query.status = status
    }
    const total = await History.countDocuments(query)
    const items = await History.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authenticate, async (req, res) => {
  try {
    const entry = await History.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ error: 'History entry not found' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const entry = await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ error: 'History entry not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/', authenticate, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id })
    res.json({ message: 'All history cleared' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
