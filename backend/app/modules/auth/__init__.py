from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    empresa_id: int


class LoginResponse(BaseModel):
    token: str
    user: dict
    empresa: dict
