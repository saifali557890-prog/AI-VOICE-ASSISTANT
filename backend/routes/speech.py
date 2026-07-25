import os
import shutil
import tempfile
import uuid
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from backend.services.stt import (
    transcribe_audio,
    STTServiceError,
)

from backend.services.tts import (
    synthesize_speech,
    TTSServiceError,
)

router = APIRouter()


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    ext = os.path.splitext(file.filename or "")[1] or ".webm"
    safe_name = f"{uuid.uuid4().hex}{ext}"

    temp_dir = tempfile.mkdtemp()
    temp_file = os.path.join(temp_dir, safe_name)

    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = transcribe_audio(temp_file)

        return {"text": text}

    except STTServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


@router.post("/speak")
async def speak(data: dict):

    try:
        text = data.get("text")

        if not text:
            raise HTTPException(
                status_code=400,
                detail="Text is required."
            )

        audio = synthesize_speech(text)

        return StreamingResponse(
            BytesIO(audio),
            media_type="audio/mpeg"
        )

    except TTSServiceError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )