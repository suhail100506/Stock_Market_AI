"""
StockSense-AI: Authentication Models & Schemas
==============================================

STEP 16: Authentication Models
- Registration with password hashing
- Login with JWT generation
- User profile schemas matching MongoDB 'users' collection
- Never expose password_hash
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full user name")
    email: str = Field(..., min_length=5, max_length=120, description="Email address")
    password: str = Field(..., min_length=6, max_length=128, description="Plain-text password (will be hashed)")
    phone: Optional[str] = Field(None, max_length=20, description="Optional phone number")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    """
    Public user profile schema matching MongoDB 'users' document.
    Never exposes 'password_hash'.
    """
    id: str = Field(..., alias="_id", description="MongoDB user identifier")
    name: str
    email: str
    balance: float = Field(1000000.00, description="Virtual paper trading balance in INR")
    created_at: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class AuthResponse(BaseModel):
    """
    Response returned on successful Registration and Login.
    Includes JWT access token.
    """
    token: str
    token_type: str = "Bearer"
    user: UserResponse
    message: str


class LogoutResponse(BaseModel):
    success: bool = True
    message: str = "Logged out successfully"
