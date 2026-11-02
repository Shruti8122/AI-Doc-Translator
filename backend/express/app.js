require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const connectDB = require('./db')
const apiRoutes = require('./routes/api')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const historyRoutes = require('./routes/history')
const { PORT, UPLOAD_FOLDER, FRONTEND_FOLDER } = require('./config')

const app = express()

app.use(cors())
app.use(express.json())

fs.mkdirSync(path.join(UPLOAD_FOLDER, 'temp'), { recursive: true })

app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/history', historyRoutes)

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 50 MB.' })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' })
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message })
  }
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.use('/uploads', express.static(UPLOAD_FOLDER))

const dist = FRONTEND_FOLDER
app.use(express.static(dist))
app.get('*', (req, res) => {
  const index = path.join(dist, 'index.html')
  if (fs.existsSync(index)) {
    res.sendFile(index)
  } else {
    res.status(404).json({ error: 'Frontend not built. Run: cd frontend && npm install && npm run build' })
  }
})

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`)
  })
}

start()
