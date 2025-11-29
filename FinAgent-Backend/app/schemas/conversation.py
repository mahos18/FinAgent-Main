from pydantic import BaseModel

class MessageCreate(BaseModel):
    message: str

class AdvisorReply(BaseModel):
    reply: str
