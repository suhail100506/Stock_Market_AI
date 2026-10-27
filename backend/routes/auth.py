"""
StockSense-AI: Authentication Routes
====================================

STEP 16: Authentication System
- Register (with password hashing and initial ₹10,00,000 balance in MongoDB)
- Login (with password verification and JWT token generation)
- Logout (session termination)
- JWT Token issuance & verification
- Protected /me profile endpoint
- MongoDB 'users' collection persistence (never stores plain-text passwords)
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import Dict, Any, Optional

from ..models.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    AuthResponse,
    LogoutResponse,
)
from ..utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user_payload,
)
from database.mongo import mongo_users
from database.db import db as paper_db

router = APIRouter(prefix="/api/auth", tags=["Authentication & JWT"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user with hashed password in MongoDB"
)
def register(req: RegisterRequest):
    """
    Registers a new paper trading user:
    1. Validates that email is unique in MongoDB collection 'users'.
    2. Hashes password using cryptographic PBKDF2-HMAC-SHA256 (Never plain-text).
    3. Saves user into MongoDB 'users' with initial ₹10,00,000 virtual balance.
    4. Initializes paper wallet in paper trading ledger.
    5. Signs and issues JWT access token.
    """
    # Check email duplicate
    existing = mongo_users.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{req.email}' already exists. Please login instead."
        )

    # Cryptographic password hashing (Zero plain text storage)
    hashed = hash_password(req.password)

    # Create document in MongoDB 'users'
    user_doc = mongo_users.create_user(
        name=req.name,
        email=req.email,
        password_hash=hashed,
        balance=1000000.00
    )

    # Initialize paper wallet ledger
    paper_db.get_wallet(user_id=user_doc["_id"])

    # Issue JWT token
    token = create_access_token({
        "sub": user_doc["_id"],
        "email": user_doc["email"],
        "name": user_doc["name"]
    })

    return AuthResponse(
        token=token,
        token_type="Bearer",
        user=UserResponse(
            _id=user_doc["_id"],
            name=user_doc["name"],
            email=user_doc["email"],
            balance=user_doc["balance"],
            created_at=user_doc["created_at"]
        ),
        message="User registered successfully with ₹10,00,000 virtual cash. Saved in MongoDB."
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email & password and receive JWT token"
)
def login(creds: LoginRequest):
    """
    Authenticates user:
    1. Looks up user by email in MongoDB 'users'.
    2. Verifies plain password against stored salted hash.
    3. Generates signed JWT token.
    """
    user_doc = mongo_users.get_user_by_email(creds.email)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password against hash
    is_valid = verify_password(creds.password, user_doc.get("password_hash", ""))
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate signed JWT token
    token = create_access_token({
        "sub": user_doc["_id"],
        "email": user_doc["email"],
        "name": user_doc["name"]
    })

    return AuthResponse(
        token=token,
        token_type="Bearer",
        user=UserResponse(
            _id=user_doc["_id"],
            name=user_doc["name"],
            email=user_doc["email"],
            balance=user_doc.get("balance", 1000000.00),
            created_at=user_doc["created_at"]
        ),
        message="Login successful. JWT token issued."
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout user and invalidate session"
)
def logout():
    """
    Terminates user session on client side.
    """
    return LogoutResponse(
        success=True,
        message="Logged out successfully. JWT session terminated."
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated user profile via JWT"
)
def get_current_user(payload: Dict[str, Any] = Depends(get_current_user_payload)):
    """
    Protected route: Extracts user ID from validated JWT token and returns MongoDB profile.
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT claims."
        )

    user_doc = mongo_users.get_user_by_id(user_id)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in MongoDB."
        )

    return UserResponse(
        _id=user_doc["_id"],
        name=user_doc["name"],
        email=user_doc["email"],
        balance=user_doc.get("balance", 1000000.00),
        created_at=user_doc["created_at"]
    )
