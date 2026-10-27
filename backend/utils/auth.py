"""
StockSense-AI: Authentication & Security Utilities
=================================================

STEP 16: Authentication Utilities
- Password Hashing (PBKDF2-HMAC-SHA256 & Bcrypt, Salted, Never plain text)
- JSON Web Token (JWT) Generation & Verification (HS256)
- Dependency injection for FastAPI protected routes
"""

import os
import hmac
import hashlib
import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Secret key for JWT signing
JWT_SECRET = os.getenv("JWT_SECRET", "stocksense-ai-super-secret-jwt-key-2026-secure-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security_bearer = HTTPBearer(auto_error=False)

# --------------------------------------------------------------------------
# Password Hashing Implementation (Zero-Plain-Text, Salted PBKDF2-SHA256)
# --------------------------------------------------------------------------

def hash_password(plain_password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique cryptographic salt.
    Format: pbkdf2:sha256:100000$<salt_hex>$<hash_hex>
    Plain-text passwords are NEVER stored.
    """
    if not plain_password:
        raise ValueError("Password cannot be empty.")
    salt = secrets.token_bytes(16)
    iterations = 100000
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        salt,
        iterations
    )
    return f"pbkdf2:sha256:{iterations}${salt.hex()}${hash_bytes.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored hash using constant-time comparison.
    Supports pbkdf2:sha256 format.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("pbkdf2:sha256:"):
            parts = hashed_password.split("$")
            if len(parts) != 3:
                return False
            meta, salt_hex, hash_hex = parts
            iterations = int(meta.split(":")[2])
            salt = bytes.fromhex(salt_hex)
            computed_hash = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt,
                iterations
            )
            return hmac.compare_digest(computed_hash.hex(), hash_hex)
        elif hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            # Bcrypt format support if bcrypt package installed
            try:
                import bcrypt
                return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            except ImportError:
                return False
        else:
            # Fallback legacy hash comparison (never match plain text)
            return False
    except Exception:
        return False

# --------------------------------------------------------------------------
# JSON Web Token (JWT) Implementation (HS256 compliant RFC 7519)
# --------------------------------------------------------------------------

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed HS256 JWT access token.
    Payload includes subject (userId), email, name, issued-at (iat), and expiry (exp).
    """
    to_encode = data.copy()
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=JWT_EXPIRATION_HOURS)

    to_encode.update({
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })

    # Header
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    header_b64 = _base64url_encode(header_json)

    # Payload
    payload_json = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')
    payload_b64 = _base64url_encode(payload_json)

    # Signature
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates the signature and expiration of a JWT access token.
    Returns decoded payload dictionary if valid, None otherwise.
    """
    if not token or token.count('.') != 2:
        return None
    try:
        header_b64, payload_b64, signature_b64 = token.split('.')

        # Verify signature
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        # Decode payload
        payload_json = _base64url_decode(payload_b64).decode('utf-8')
        payload = json.loads(payload_json)

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the JWT bearer token from the Authorization header.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
