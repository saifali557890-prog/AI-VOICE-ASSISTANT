from gtts import gTTS
from io import BytesIO


class TTSServiceError(Exception):
    """Custom exception for Text-to-Speech errors."""
    pass


def synthesize_speech(text: str) -> bytes:
    """
    Convert text into speech and return MP3 audio bytes.
    """

    try:

        audio_buffer = BytesIO()

        tts = gTTS(
            text=text,
            lang="en",
            slow=False
        )

        tts.write_to_fp(audio_buffer)

        audio_buffer.seek(0)

        return audio_buffer.read()

    except Exception as e:
        raise TTSServiceError(f"TTS Error: {str(e)}")