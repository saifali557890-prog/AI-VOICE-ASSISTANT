import os
import shutil
import tempfile
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.services.stt import transcribe_audio
from backend.services.llm import get_llm_response
from backend.services.tts import synthesize_speech

router = APIRouter()


@router.post("/converse")
async def converse(file: UploadFile = File(...)):

    # Use a safe generated filename instead of the client-supplied one
    # (avoids path issues / unsafe characters on the serverless filesystem).
    ext = os.path.splitext(file.filename or "")[1] or ".webm"
    safe_name = f"{uuid.uuid4().hex}{ext}"

    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, safe_name)

    try:
        # Save uploaded audio
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("Audio saved:", temp_path)

        # Speech to Text
        user_text = transcribe_audio(temp_path)
        print("User:", user_text)

        # LLM
        ai_response = get_llm_response(
            user_text,
            "You are a helpful AI Voice Assistant."
        )
        print("AI:", ai_response)

        # Text to Speech
        audio = synthesize_speech(ai_response)
        print("Audio bytes:", len(audio))

        return {
            "user_text": user_text,
            "ai_response": ai_response,
            "audio": audio.hex()
        }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        # Delete temporary folder and files
        shutil.rmtree(temp_dir, ignore_errors=True)