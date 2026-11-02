const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: String, required: true },
  originalFilename: { type: String, default: '' },
  sourceLang: { type: String, default: 'en' },
  targetLang: { type: String, default: '' },
  sourceLangName: { type: String, default: 'English' },
  targetLangName: { type: String, default: '' },
  status: { type: String, enum: ['completed', 'error'], default: 'completed' },
  fileSize: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  ocrText: { type: String, default: '' },
  translatedText: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('History', historySchema)
