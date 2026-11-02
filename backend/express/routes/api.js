const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Task = require('../models/Task')
const { runTranslation } = require('../worker')
const { UPLOAD_FOLDER, LANGUAGES } = require('../config')
const { optionalAuth } = require('../middleware/auth')

const router = express.Router()

// ========== REQUEST LOGGING MIDDLEWARE ==========
router.use((req, res, next) => {
  const start = Date.now()
  console.log(`\n========== REQUEST ==========`)
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2))
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, JSON.stringify(req.body, null, 2))
  }
  if (req.file) {
    console.log(`File:`, JSON.stringify({ originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size }, null, 2))
  }

  const originalJson = res.json.bind(res)
  const originalStatus = res.status.bind(res)
  let statusCode = 200
  res.status = function (code) {
    statusCode = code
    return originalStatus(code)
  }
  res.json = function (data) {
    console.log(`\nResponse [${statusCode}]:`, JSON.stringify(data, null, 2))
    console.log(`Duration: ${Date.now() - start}ms`)
    console.log(`========== END ==========\n`)
    return originalJson(data)
  }
  next()
})
// ================================================

const upload = multer({
  dest: path.join(UPLOAD_FOLDER, 'temp'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf'
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf')
    if (isPdfMime || isPdfExt) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

router.get('/languages', (req, res) => {
  res.json(LANGUAGES)
})

router.post('/upload', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const taskId = uuidv4()
    const taskDir = path.join(UPLOAD_FOLDER, taskId)
    fs.mkdirSync(taskDir, { recursive: true })

    const pdfPath = path.join(taskDir, 'input.pdf')
    fs.renameSync(req.file.path, pdfPath)

    const taskData = { taskId, pdfPath, originalFilename: req.file.originalname }
    if (req.user) {
      taskData.userId = req.user._id
    }
    await Task.create(taskData)

    res.json({ task_id: taskId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/start-translation', optionalAuth, async (req, res) => {
  try {
    const { task_id, source_lang, target_lang, source_lang_name, target_lang_name } = req.body
    if (!task_id || !target_lang) {
      return res.status(400).json({ error: 'task_id and target_lang are required' })
    }

    const task = await Task.findOne({ taskId: task_id })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    task.sourceLang = source_lang || 'en'
    task.targetLang = target_lang
    task.sourceLangName = source_lang_name || ''
    task.targetLangName = target_lang_name || ''
    task.status = 'processing'
    task.progress = 0
    task.message = 'Starting...'
    if (req.user) {
      task.userId = req.user._id
    }
    await task.save()

    runTranslation(task.taskId).catch(err => {
      console.error('Translation worker error:', err)
    })

    res.json({ task_id, status: 'started' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/progress/:taskId', async (req, res) => {
  try {
    const task = await Task.findOne({ taskId: req.params.taskId })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json({
      progress: task.progress,
      message: task.message,
      error: task.error
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/result/:taskId', (req, res) => {
  const outputPdf = path.join(UPLOAD_FOLDER, req.params.taskId, 'output.pdf')
  if (!fs.existsSync(outputPdf)) {
    return res.status(404).json({ error: 'Result not ready' })
  }
  res.sendFile(outputPdf)
})

router.get('/result/:taskId/download', (req, res) => {
  const outputPdf = path.join(UPLOAD_FOLDER, req.params.taskId, 'output.pdf')
  if (!fs.existsSync(outputPdf)) {
    return res.status(404).json({ error: 'Result not ready' })
  }
  res.download(outputPdf, 'translated_document.pdf')
})

module.exports = router
