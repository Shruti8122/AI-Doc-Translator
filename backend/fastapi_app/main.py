import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from . import config
from .ocr_engine import ocr_image
from .translator import translate_text

app = FastAPI(title="Doc Translator Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslateRequest(BaseModel):
    text: str
    target_lang: str


class TranslateResponse(BaseModel):
    translated_text: str


class OCRResponse(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/languages")
def get_languages():
    return {
        name: codes
        for name, codes in config.LANGUAGE_MAP.items()
    }


@app.post("/api/ocr", response_model=OCRResponse)
async def ocr_endpoint(file: UploadFile = File(...), source_lang: str = "en"):
    for v in config.LANGUAGE_MAP.values():
        if v["nllb"] == source_lang:
            source_lang = v["easyocr"]
            break
    valid_codes = {v["easyocr"] for v in config.LANGUAGE_MAP.values()}
    if source_lang not in valid_codes:
        source_lang = "en"
    contents = await file.read()
    try:
        ocr_langs = [source_lang]
        if source_lang != "en":
            ocr_langs.append("en")
        text = ocr_image(contents, ocr_langs)
        return OCRResponse(text=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/translate", response_model=TranslateResponse)
async def translate_endpoint(req: TranslateRequest):
    target = req.target_lang
    source = req.text
    if not target or not source:
        raise HTTPException(status_code=400, detail="text and target_lang are required")
    valid_codes = {v["nllb"] for v in config.LANGUAGE_MAP.values()}
    if target not in valid_codes:
        raise HTTPException(status_code=400, detail=f"Unsupported target language code: {target}")
    try:
        result = translate_text(source, target)
        return TranslateResponse(translated_text=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/translate-form", response_model=TranslateResponse)
async def translate_form_endpoint(text: str = Form(...), target_lang: str = Form(...)):
    if not text or not target_lang:
        raise HTTPException(status_code=400, detail="text and target_lang are required")
    valid_codes = {v["nllb"] for v in config.LANGUAGE_MAP.values()}
    if target_lang not in valid_codes:
        raise HTTPException(status_code=400, detail=f"Unsupported target language code: {target_lang}")
    try:
        result = translate_text(text, target_lang)
        return TranslateResponse(translated_text=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pdf-to-images")
async def pdf_to_images(file: UploadFile = File(...), task_id: str = Form(...)):
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    task_dir = os.path.join(backend_dir, "uploads", task_id)
    images_dir = os.path.join(task_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    pdf_path = os.path.join(task_dir, "input.pdf")
    contents = await file.read()
    with open(pdf_path, "wb") as f:
        f.write(contents)

    from ..flask_app.pdf_utils import pdf_to_images as convert_pdf
    image_paths = convert_pdf(pdf_path, images_dir)
    return {"image_paths": image_paths}


@app.post("/api/generate-pdf")
async def generate_pdf(task_id: str = Form(...), texts: str = Form(...), target_lang: str = Form(...)):
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    task_dir = os.path.join(backend_dir, "uploads", task_id)
    output_pdf = os.path.join(task_dir, "output.pdf")

    text_pages = json.loads(texts)
    target_script = target_lang.split("_")[1] if "_" in target_lang else "Latn"

    from ..flask_app.pdf_utils import text_to_pdf
    text_to_pdf(text_pages, output_pdf, target_script)
    return {"output_path": output_pdf}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.HOST, port=config.PORT)
