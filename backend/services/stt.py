import os
from groq import Groq
from backend.core.config import settings


class STTServiceError(Exception):
    """Custom exception for Speech-to-Text errors."""
    pass


client = Groq(api_key=settings.GROQ_API_KEY)


def transcribe_audio(audio_file_path: str) -> str:
    """
    Convert speech audio into text using Groq Whisper.
    """

    try:

        with open(audio_file_path, "rb") as audio_file:

            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="text"
            )

        if not transcription:
            raise STTServiceError("No speech detected.")

        return transcription

    except Exception as e:
        raise STTServiceError(f"Speech-to-Text Error: {str(e)}")