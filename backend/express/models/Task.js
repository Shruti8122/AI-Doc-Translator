const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'error'],
    default: 'uploaded'
  },
  progress: { type: Number, default: 0 },
  message: { type: String, default: '' },
  error: { type: String, default: null },
  sourceLang: { type: String, default: 'en' },
  targetLang: { type: String, default: null },
  sourceLangName: { type: String, default: '' },
  targetLangName: { type: String, default: '' },
  originalFilename: { type: String, default: '' },
  pdfPath: { type: String, default: null },
  outputPath: { type: String, default: null },
  totalPages: { type: Number, default: 0 },
  pagesCompleted: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Task', taskSchema)
