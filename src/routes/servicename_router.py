# from fastapi import APIRouter, Depends
# from src.services.servicename import get_sample_response
# from src.schema.schema import SampleResponse

# router = APIRouter()

# @router.get("/sample", response_model=SampleResponse)
# async def sample_endpoint():
#     return get_sample_response()

import bcrypt
import traceback
from fastapi.responses import JSONResponse
from fastapi import (APIRouter, Depends, HTTPException,Request,BackgroundTasks)
from utils.constants import Constants
from common.servicename_app import CustomRoute,app,get_current_user
from services.servicename import Mainclass
from utils.utils import queries
from schema.schema import SampleData,TokenRefreshRequest, TokenRefreshResponse,ForgotPasswordRequest,ResetPasswordRequest
from utils.auth_utils import generate_jwt
import datetime
from datetime import timedelta
from config import settings
import jwt
from passlib.context import CryptContext
from utils.auth_utils import create_access_token,create_refresh_token, verify_refresh_token,verify_password,hash_password
from models.models import User,ResetToken
from schema.schema import LoginUser,Token,OTPResponse
import secrets
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from services.servicename import generate_otp,send_otp_email
from typing import Union



router = APIRouter(route_class=CustomRoute)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# In-memory storage for reset tokens (for simplicity, use Redis or DB in production)
reset_tokens = {}

# Configure email sending
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False 
)


async def send_reset_email(email: str, token: str):
    """Function to send password reset email."""
    reset_link = f"https://farm-app-frontend.onrender.com/reset-password?token={token}"
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email],
        body=f"Click the link to reset your password: {reset_link}",
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


# @router.post("/login")
# async def generate_token(payload: AuthRequest):
#     """API to generate JWT token dynamically."""
#     if not payload.username:
#         raise HTTPException(status_code=400, detail="Username is required")

#     token = generate_jwt(payload.username)
#     return {"access_token": token, "token_type": "bearer"}

fake_users_db = {
    "testuser": {
        "username": "testuser",
        "password": pwd_context.hash("testpassword")  # Hashed password
    }
}


# Login route to generate token
# @app.post("/login")
# async def login(payload: User):
#     if not payload.username:
#         raise HTTPException(status_code=400, detail="Username is required")
#     # Check if user exists in fake_users_db
#     stored_user = fake_users_db.get(payload.username)
#     if not stored_user:
#         raise HTTPException(status_code=401, detail="Invalid username or password")

#     # Verify password using bcrypt (hashed password check)
#     # if not bcrypt.checkpw(payload.password.encode('utf-8'), stored_user["password"].encode('utf-8')):
#     #     raise HTTPException(status_code=401, detail="Invalid username or password")
    
#     # Create the JWT token for the user
#     token = generate_jwt(payload.username)
#     return {"access_token": token, "token_type": "bearer"}


# @app.post("/login")
# async def login(payload: LoginUser):
#     if not payload.username or not payload.password:
#         raise HTTPException(status_code=400, detail="Username and password are required")

#     # stored_user = fake_users_db.get(payload.username)
#     # Fetch the user from MongoDB
#     stored_user = await User.find_one({"username": payload.username})
#     if not stored_user:
#         raise HTTPException(status_code=401, detail="Invalid username or password")
#     # Verify the password
#     if not verify_password(payload.password, stored_user.password):
#         raise HTTPException(status_code=401, detail="Invalid username or password")

#     token = generate_jwt(payload.username)
#     return {"access_token": token, "token_type": "bearer"}



#Final------------------------working code(/login)--------------

# @app.post("/login",response_model=Token)
# async def login(payload: LoginUser):
#     if not payload.username or not payload.password:
#         raise HTTPException(status_code=400, detail="Username/email and password are required")

#     # Check if input is an email or username
#     query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

#     # Fetch user from MongoDB
#     stored_user = await User.find_one(query_filter)
#     if not stored_user:
#         raise HTTPException(status_code=401, detail="Invalid username/email or password")

#     # Verify password
#     if not verify_password(payload.password, stored_user.password):
#         raise HTTPException(status_code=401, detail="Invalid username/email or password")

#     # Generate JWT token with the stored username
#     # Generate JWT tokens
#     access_token = create_access_token(data={"sub": stored_user.username})
#     refresh_token = create_refresh_token(data={"sub": stored_user.username})

#     return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}





#-----------Test login


# @app.post("/login", response_model=Union[Token, OTPResponse])
# async def login(request: Request, payload: LoginUser):
#     # Validate input
#     if not (payload.username or payload.email):
#         raise HTTPException(status_code=400, detail="Username or email is required")

#     # Password-based login
#     if payload.password:
#         if not (payload.username or payload.email):
#             raise HTTPException(status_code=400, detail="Username or email is required for password-based login")

#         # Check if input is an email or username
#         # query_filter = {"email": payload.email} if payload.email else {"username": payload.username}
#         query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

#         # Fetch user from MongoDB
#         stored_user = await User.find_one(query_filter)
#         if not stored_user:
#             raise HTTPException(status_code=401, detail="Invalid username/email or password")

#         # Verify password
#         if not verify_password(payload.password, stored_user.password):
#             raise HTTPException(status_code=401, detail="Invalid username/email or password")

#     # OTP-based login
#     elif payload.otp:
#         if not (payload.email):
#             raise HTTPException(status_code=400, detail="Email is required for OTP-based login")

#         # Check if input is an email 
#         query_filter = {"email": payload.email}

#         # Fetch user from MongoDB
#         stored_user = await User.find_one(query_filter)
#         if not stored_user:
#             raise HTTPException(status_code=404, detail="User not found")

#         # Verify OTP
#         if not stored_user.otp or stored_user.otp != payload.otp or stored_user.otp_expiry < datetime.datetime.now():
#             raise HTTPException(status_code=401, detail="Invalid or expired OTP")

#         # Clear OTP fields after successful verification
#         await User.find_one(query_filter).update({"$set": {"otp": None, "otp_expiry": None}})

#     # Request OTP
#     else:
#         if not (payload.email):
#             raise HTTPException(status_code=400, detail="Email is required to request OTP")

#         # Check if input is an email
#         query_filter = {"email": payload.email}

#         # Fetch user from MongoDB
#         stored_user = await User.find_one(query_filter)
#         if not stored_user:
#             raise HTTPException(status_code=404, detail="User not found")

#         # Generate OTP
#         otp = await generate_otp()
#         otp_expiry = datetime.datetime.now() + timedelta(minutes=5)  # OTP valid for 5 minutes

#         # Update user with OTP and expiry time
#         await User.find_one(query_filter).update({"$set": {"otp": otp, "otp_expiry": otp_expiry}})

#         # Send OTP via email or SMS
#         if payload.email:
#             await send_otp_email(payload.email, otp)

#         return {"message": "OTP sent successfully"}

#     # Generate JWT tokens
#     access_token = create_access_token(data={"sub": stored_user.username})
#     refresh_token = create_refresh_token(data={"sub": stored_user.username})

#     return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}



@app.post("/login", response_model=Union[Token, OTPResponse])
async def login(request: Request, payload: LoginUser):
    # Validate input
    if not (payload.username or payload.email):
        raise HTTPException(status_code=400, detail="Username or email is required")

    # Password-based login
    if payload.password:
        # Determine if input is an email or username
        query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

        # Fetch user from MongoDB
        stored_user = await User.find_one(query_filter)
        if not stored_user:
            raise HTTPException(status_code=401, detail="Invalid username/email or password")

        # Verify password
        if not verify_password(payload.password, stored_user.password):
            raise HTTPException(status_code=401, detail="Invalid username/email or password")

        # Generate and send OTP
        otp = await generate_otp()
        otp_expiry = datetime.datetime.now() + timedelta(minutes=5)  # OTP valid for 5 minutes

        # Update user with OTP and expiry time
        await User.find_one(query_filter).update({"$set": {"otp": otp, "otp_expiry": otp_expiry}})

        # Send OTP via email
        await send_otp_email(payload.username if "@" in payload.username else stored_user.email, otp)

        return {"message": "OTP sent successfully"}

    # OTP-based login
    elif payload.otp:
        # Determine if input is an email or username
        query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

        # Fetch user from MongoDB
        stored_user = await User.find_one(query_filter)
        if not stored_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify OTP
        if not stored_user.otp or stored_user.otp != payload.otp or stored_user.otp_expiry < datetime.datetime.now():
            raise HTTPException(status_code=401, detail="Invalid or expired OTP or Already Used OTP")

        # Clear OTP fields after successful verification
        await User.find_one(query_filter).update({"$set": {"otp": None, "otp_expiry": None}})

        # Generate JWT tokens
        access_token = create_access_token(data={"sub": stored_user.username})
        refresh_token = create_refresh_token(data={"sub": stored_user.username})

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    else:
        raise HTTPException(status_code=400, detail="Invalid login request")

@router.post("/refresh-token", response_model=TokenRefreshResponse)
async def refresh_token(request: TokenRefreshRequest):
    try:
        # Verify the refresh token
        payload = verify_refresh_token(request.refresh_token)
        # Create new access token
        access_token = create_access_token(
            data={"sub": payload["sub"]},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )


@router.get("/v1/sample/response/{fullname}")
async def sample_endpoint(request: Request,fullname:str,current_user: dict = Depends(get_current_user)):
    if not fullname:
        raise HTTPException(status_code=400, detail="Please provide a name")
    # if not hasattr(app.state, "pool") or app.state.pool is None:  # Check if `pool` exists before using
    #     raise HTTPException(status_code=500, detail="Database pool is not initialized")
    # Log the incoming request
    print(f"Received request for fullname: {fullname}")
    print(f"Request headers: {request.headers}")
    data={}
    data[Constants.NAME] = fullname
    res= Mainclass(request, app.state.pool)
    try:
        resp = await res.get_sample_response(data)
        if isinstance(resp, dict):  # Ensure it's a dict before using JSONResponse
            print("Returning successful response")
            return JSONResponse(content=resp, media_type="application/json", status_code=200)
        else:
            raise HTTPException(status_code=500, detail="Invalid response format")
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
    except Exception as e:
        print(f"Error in sample_endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
@router.post("/v1/sample/dynamic-response")
async def sample_post_endpoint(request: Request, payload: SampleData):
    """Receives JSON payload and returns a formatted dynamic response"""
    try:
        res = Mainclass(request, app.state.pool)
        response = await res.get_dynamic_response(payload)
        return JSONResponse(content=response, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
@router.post("/signup")   
async def signup(user: User):
    existing_user = await User.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    user_data = {
        "empid": user.empid,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phone": user.phone,
        "domain": user.domain,
        "location": user.location,
        "username": user.username,
        "password": hashed_password
    }
    user_obj = User(**user_data)  # ✅ Create an instance of User
    await user_obj.insert()  # ✅ Insert into MongoDB

    return {"message": "User created successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """Step 1: User requests a password reset."""
    
    user = await User.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store token in MongoDB with expiration time (e.g., 1 hour)
    await ResetToken(
        email=user.email,
        token=reset_token,
        expires_at=datetime.datetime.utcnow() + timedelta(hours=1)
    ).insert()

    # Send reset email in the background
    background_tasks.add_task(send_reset_email, user.email, reset_token)
    print(f"Generated Token for {request.email}: {reset_token}")

    return {
        "message": f"Password reset link sent to your email: {user.email}",
        "reset_link": f"https://farm-app-frontend.onrender.com/reset-password?token={reset_token}"
    }


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Step 2: User submits new password with token."""
    
    # Find the token in MongoDB
    token_entry = await ResetToken.find_one({"token": request.token})
    
    if not token_entry or token_entry.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Find the user associated with this token
    user = await User.find_one({"email": token_entry.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hash the new password before saving
    hashed_password = hash_password(request.new_password)
    user.password = hashed_password
    await user.save()

    # Delete the used token
    await token_entry.delete()

    return {"message": "Password has been reset successfully"}