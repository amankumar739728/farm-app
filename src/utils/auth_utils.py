# from src.config.settings import get_settings

# settings = get_settings()

# def verify_jwt(token: str) -> bool:
#     # Replace with actual JWT validation logic
#     return token == "valid_token"


##########################Middle########################
# import jwt
# import datetime

# SECRET_KEY = "your_secret_key"
# ALGORITHM = "HS256"

# def create_jwt(payload: dict) -> str:
#     expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#     payload.update({"exp": expiration})
#     return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# def verify_jwt(token: str) -> bool:
#     try:
#         jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return True
#     except jwt.ExpiredSignatureError:
#         return False
#     except jwt.InvalidTokenError:
#         return False

############################Latest###################################################

import time
import jwt
# import datetime
from typing import Tuple
from datetime import datetime,timedelta
from fastapi import HTTPException

import httpx

from config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthUtil:
    @staticmethod
    def get_authorization_scheme_param(authorization_header_value: str) -> Tuple[str, str]:
        if not authorization_header_value:
            return "", ""
        scheme, _,param = authorization_header_value.partition(" ")
        return scheme, param
    
    @staticmethod
    async def get_user_from_oauth(token):
        try:
            async with httpx.AsyncClient() as client:
                headers = {"Content-Type": "application/x-www-form-urlencoded"}
                data = f"client_id={settings.OAUTH_CLIENT_ID}&token={token}&client_secret={settings.OAUTH_CLIENT_SECRET}"
                response= await client.post(settings.OAUTH_INTROSPECT_ENDPOINT, headers=headers,data=data)
                response_json = response.json()
                if 'exp' in response_json and response_json['exp'] >=time.time():
                    return response_json
                raise Exception("Token expired!")
        except Exception as ex:
            raise ex
        
    @staticmethod
    def is_route_expected(url):
        return any(list(map(url.endswith,settings.JWT_EXCLUDE_PATH)))
    
    @staticmethod
    def is_route_included(url):
        return any(list(map(url.startswith,settings.JWT_EXCLUDE_PATH)))
    
    
# def generate_jwt(username: str):
#     """Generate JWT token dynamically."""
#     expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
#     payload = {
#         "username": username,
#         "exp": expiration
#     }
#     token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
#     return token

#--->latest
# def generate_jwt(username: str, password: str):
#     """Generate JWT token dynamically."""
#     expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
#     payload = {
#         "username": username,
#         "password": password,
#         "exp": expiration
#     }
#     token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
#     return token


def generate_jwt(username: str):
    """Generate a secure JWT token."""
    expiration = datetime.utcnow() + timedelta(hours=1)  
    payload = {
        "sub": username,  # ✅ Use "sub" instead of "username"
        "exp": expiration
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token

def create_access_token(data: dict, expires_delta: timedelta =None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_refresh_token(token: str):
    print(f"Verifying refresh token: {token}")  # Log the token being validated

    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Refresh token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
        
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
