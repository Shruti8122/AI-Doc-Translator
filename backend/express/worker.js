const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const Task = require('./models/Task')
const History = require('./models/History')
const { FASTAPI_URL, UPLOAD_FOLDER, LANGUAGES } = require('./config')

async function updateTask(taskId, data) {
  await Task.findOneAndUpdate({ taskId }, { $set: data })
}

async function saveHistory(task) {
  try {
    if (!task.userId) return
    const sourceLangEntry = Object.entries(LANGUAGES).find(([, v]) => v.nllb === task.sourceLang || v.easyocr === task.sourceLang)
    const targetLangEntry = Object.entries(LANGUAGES).find(([, v]) => v.nllb === task.targetLang)
    await History.create({
      userId: task.userId,
      taskId: task.taskId,
      originalFilename: task.originalFilename || 'document.pdf',
      sourceLang: task.sourceLang,
      targetLang: task.targetLang,
      sourceLangName: task.sourceLangName || (sourceLangEntry ? sourceLangEntry[0] : 'English'),
      targetLangName: task.targetLangName || (targetLangEntry ? targetLangEntry[0] : ''),
      status: 'completed',
      pageCount: task.totalPages || 0,
    })
  } catch (err) {
    console.error('[Worker] Error saving history:', err.message)
  }
}

async function callFastAPIForm(endpoint, formData) {
  const url = `${FASTAPI_URL}${endpoint}`
  console.log(`\n[Worker] Calling FastAPI: POST ${url}`)
  try {
    const res = await axios.post(url, formData, {
      headers: formData.getHeaders(),
      timeout: 600000
    })
    console.log(`[Worker] FastAPI response [${res.status}]:`, JSON.stringify(res.data).substring(0, 200))
    return res.data
  } catch (err) {
    console.error(`[Worker] FastAPI error for ${url}:`, err.message)
    if (err.response) {
      console.error(`[Worker] Status: ${err.response.status}`)
      console.error(`[Worker] Response data:`, JSON.stringify(err.response.data))
    }
    if (err.request) {
      console.error(`[Worker] No response received - FastAPI might be down`)
    }
    throw err
  }
}

async function callFastAPIJSON(endpoint, data) {
  const url = `${FASTAPI_URL}${endpoint}`
  console.log(`\n[Worker] Calling FastAPI: POST ${url}`)
  console.log(`[Worker] Request body:`, JSON.stringify(data).substring(0, 200))
  try {
    const res = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 600000
    })
    console.log(`[Worker] FastAPI response [${res.status}]:`, JSON.stringify(res.data).substring(0, 200))
    return res.data
  } catch (err) {
    console.error(`[Worker] FastAPI error for ${url}:`, err.message)
    if (err.response) {
      console.error(`[Worker] Status: ${err.response.status}`)
      console.error(`[Worker] Response data:`, JSON.stringify(err.response.data))
    }
    if (err.request) {
      console.error(`[Worker] No response received - FastAPI might be down`)
    }
    throw err
  }
}

function getEasyocrCode(sourceLang) {
  for (const v of Object.values(LANGUAGES)) {
    if (v.nllb === sourceLang) return v.easyocr
  }
  return 'en'
}

async function runTranslation(taskId) {
  try {
    const task = await Task.findOne({ taskId })
    if (!task) return

    const sourceLang = getEasyocrCode(task.sourceLang)
    const targetLang = task.targetLang
    const taskDir = path.join(UPLOAD_FOLDER, taskId)

    await updateTask(taskId, { progress: 5, message: 'Converting PDF to images...' })

    const form = new FormData()
    form.append('file', fs.createReadStream(path.join(taskDir, 'input.pdf')), 'input.pdf')
    form.append('task_id', taskId)
    const pdfResult = await callFastAPIForm('/api/pdf-to-images', form)

    if (pdfResult.image_paths.length === 0) {
      await updateTask(taskId, { progress: 0, message: 'Error', error: 'PDF has no pages' })
      return
    }

    const totalPages = pdfResult.image_paths.length
    await updateTask(taskId, { totalPages, pagesCompleted: 0 })
    await updateTask(taskId, { progress: 10, message: `Running OCR on ${totalPages} pages...` })

    const ocrTexts = []
    for (let i = 0; i < totalPages; i++) {
      const imgForm = new FormData()
      imgForm.append('file', fs.createReadStream(pdfResult.image_paths[i]), `page_${i + 1}.png`)
      imgForm.append('source_lang', sourceLang)
      const ocrResult = await callFastAPIForm('/api/ocr', imgForm)
      ocrTexts.push(ocrResult.text || '')

      await updateTask(taskId, {
        pagesCompleted: i + 1,
        progress: 10 + Math.round(((i + 1) / totalPages) * 40),
        message: `OCR: ${i + 1}/${totalPages} pages done...`
      })
    }

    await updateTask(taskId, { progress: 50, message: `Translating ${totalPages} pages...` })

    const translatedTexts = []
    for (let i = 0; i < totalPages; i++) {
      if (!ocrTexts[i].trim()) {
        translatedTexts.push('')
      } else {
        const translateResult = await callFastAPIJSON('/api/translate', {
          text: ocrTexts[i],
          target_lang: targetLang
        })
        translatedTexts.push(translateResult.translated_text || '')
      }

      await updateTask(taskId, {
        progress: 50 + Math.round(((i + 1) / totalPages) * 40),
        message: `Translate: ${i + 1}/${totalPages} pages done...`
      })
    }

    await updateTask(taskId, { progress: 92, message: 'Generating translated PDF...' })

    const pdfGenForm = new FormData()
    pdfGenForm.append('task_id', taskId)
    pdfGenForm.append('texts', JSON.stringify(translatedTexts))
    pdfGenForm.append('target_lang', targetLang)
    await callFastAPIForm('/api/generate-pdf', pdfGenForm)

    await updateTask(taskId, {
      progress: 100,
      message: 'Translation complete!',
      status: 'completed',
      outputPath: path.join(taskDir, 'output.pdf')
    })

    const completedTask = await Task.findOne({ taskId })
    await saveHistory(completedTask)

  } catch (err) {
    console.error(`\n========== WORKER ERROR for ${taskId} ==========`)
    console.error(`Error name:`, err.name)
    console.error(`Error message:`, err.message)
    console.error(`Error code:`, err.code)
    console.error(`Error stack:`, err.stack)
    if (err.response) {
      console.error(`Response status:`, err.response.status)
      console.error(`Response statusText:`, err.response.statusText)
      console.error(`Response headers:`, JSON.stringify(err.response.headers))
      console.error(`Response data:`, JSON.stringify(err.response.data))
    }
    if (err.request) {
      console.error(`Request method:`, err.request.method)
      console.error(`Request path:`, err.request.path)
    }
    if (err.config) {
      console.error(`Request URL:`, err.config.url)
      console.error(`Request method:`, err.config.method)
    }
    console.error(`============================================\n`)
    const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : (err.message || err.code || 'Unknown error')
    await updateTask(taskId, { progress: 0, message: 'Error', error: errorDetail, status: 'error' })
  }
}

module.exports = { runTranslation }
