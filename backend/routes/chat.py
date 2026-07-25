from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.llm import (
    get_llm_response,
    LLMServiceError
)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest):

    try:

        reply = get_llm_response(
            user_text=data.message,
            system_prompt="You are a helpful AI Voice Assistant."
        )

        return ChatResponse(response=reply)

    except LLMServiceError as e:
        return {
            "response": str(e)
        }