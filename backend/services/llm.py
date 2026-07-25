from groq import Groq
from backend.core.config import settings


class LLMServiceError(Exception):
    """Custom exception for LLM errors."""
    pass


client = Groq(api_key=settings.GROQ_API_KEY)


def get_llm_response(user_text: str, system_prompt: str = None) -> str:
    """
    Send user message to Groq LLM and return the response.
    """

    try:
        messages = []

        if system_prompt:
            messages.append(
                {
                    "role": "system",
                    "content": system_prompt
                }
            )

        messages.append(
            {
                "role": "user",
                "content": user_text
            }
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=512
        )

        return response.choices[0].message.content

    except Exception as e:
        raise LLMServiceError(f"Groq API Error: {str(e)}")