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
from schema.schema import SampleData,TokenRefreshRequest, TokenRefreshResponse,ForgotPasswordRequest,ResetPasswordRequest,UserProfileUpdate
from utils.auth_utils import generate_jwt
import datetime
from datetime import timedelta
from config import settings
import jwt
from passlib.context import CryptContext
from utils.auth_utils import create_access_token,create_refresh_token, verify_refresh_token,verify_password,hash_password
from models.models import User,ResetToken,validate_password_complexity
from schema.schema import LoginUser,Token,OTPResponse,ChangeRoleRequest
import secrets
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from services.servicename import generate_otp,send_otp_email
from typing import Union
import logging
from pydantic_core import ValidationError
import re





router = APIRouter(route_class=CustomRoute)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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



# @app.post("/login", response_model=Union[Token, OTPResponse])
# async def login(request: Request, payload: LoginUser):
#     # Validate input
#     if not (payload.username or payload.email):
#         raise HTTPException(status_code=400, detail="Username or email is required")

#     # Password-based login
#     if payload.password:
#         # Determine if input is an email or username
#         query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

#         # Fetch user from MongoDB
#         stored_user = await User.find_one(query_filter)
#         if not stored_user:
#             raise HTTPException(status_code=401, detail="Invalid username/email or password")

#         # Verify password
#         if not verify_password(payload.password, stored_user.password):
#             raise HTTPException(status_code=401, detail="Invalid username/email or password")

#         # Generate and send OTP
#         otp = await generate_otp()
#         otp_expiry = datetime.datetime.now() + timedelta(minutes=5)  # OTP valid for 5 minutes

#         # Update user with OTP and expiry time
#         await User.find_one(query_filter).update({"$set": {"otp": otp, "otp_expiry": otp_expiry}})

#         # Send OTP via email
#         await send_otp_email(payload.username if "@" in payload.username else stored_user.email, otp)

#         return {"message": "OTP sent successfully"}

#     # OTP-based login
#     elif payload.otp:
#         # Determine if input is an email or username
#         query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

#         # Fetch user from MongoDB
#         stored_user = await User.find_one(query_filter)
#         if not stored_user:
#             raise HTTPException(status_code=404, detail="User not found")

#         # Verify OTP
#         if not stored_user.otp or stored_user.otp != payload.otp or stored_user.otp_expiry < datetime.datetime.now():
#             raise HTTPException(status_code=401, detail="Invalid or expired OTP or Already Used OTP")

#         # Clear OTP fields after successful verification
#         await User.find_one(query_filter).update({"$set": {"otp": None, "otp_expiry": None}})

#         # Generate JWT tokens
#         access_token = create_access_token(data={"sub": stored_user.username})
#         refresh_token = create_refresh_token(data={"sub": stored_user.username})

#         return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

#     else:
#         raise HTTPException(status_code=400, detail="Invalid login request")





@app.post("/login", response_model=Union[Token, OTPResponse])
async def login(request: Request, payload: LoginUser):
    # Validate input
    if not (payload.username or payload.email):
        raise HTTPException(status_code=400, detail="Username or email is required")

    # Determine if input is an email or username
    query_filter = {"email": payload.username} if "@" in payload.username else {"username": payload.username}

    # Fetch user from MongoDB
    stored_user = await User.find_one(query_filter)
    if not stored_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Password-based login
    if payload.password:
        # Verify password
        if not verify_password(payload.password, stored_user.password):
            raise HTTPException(status_code=401, detail="Invalid username/email or password")

        # Generate JWT tokens
        access_token = create_access_token(data={"sub": stored_user.username},role=stored_user.role)
        refresh_token = create_refresh_token(data={"sub": stored_user.username},role=stored_user.role)

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    # OTP-based login
    elif payload.otp:
        # Verify OTP
        if not stored_user.otp or stored_user.otp != payload.otp or stored_user.otp_expiry < datetime.datetime.now():
            raise HTTPException(status_code=401, detail="Invalid or expired OTP or Already Used OTP")

        # Clear OTP fields after successful verification
        await User.find_one(query_filter).update({"$set": {"otp": None, "otp_expiry": None}})

        # Generate JWT tokens
        access_token = create_access_token(data={"sub": stored_user.username},role=stored_user.role)
        refresh_token = create_refresh_token(data={"sub": stored_user.username},role=stored_user.role)

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    # Request for OTP
    else:
        # Generate and send OTP
        otp = await generate_otp()
        otp_expiry = datetime.datetime.now() + timedelta(minutes=5)  # OTP valid for 5 minutes

        # Update user with OTP and expiry time
        await User.find_one(query_filter).update({"$set": {"otp": otp, "otp_expiry": otp_expiry}})

        # Send OTP via email
        await send_otp_email(stored_user.email, otp)

        return {"message": "OTP sent successfully"}

@router.post("/refresh-token", response_model=TokenRefreshResponse)
async def refresh_token(request: TokenRefreshRequest):
    try:
        # Verify the refresh token
        payload = verify_refresh_token(request.refresh_token)
        # Create new access token
        access_token = create_access_token(
            data={"sub": payload["sub"]},role=payload["role"],
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
    
# @router.post("/signup")   
# async def signup(user: User):
#     existing_user = await User.find_one({"username": user.username})
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Username already exists")

#     hashed_password = hash_password(user.password)
#     user_data = {
#         "empid": user.empid,
#         "firstname": user.firstname,
#         "lastname": user.lastname,
#         "email": user.email,
#         "phone": user.phone,
#         "domain": user.domain,
#         "location": user.location,
#         "username": user.username,
#         "password": hashed_password
#     }
#     user_obj = User(**user_data)  # ✅ Create an instance of User
#     await user_obj.insert()  # ✅ Insert into MongoDB

#     return {"message": "User created successfully"}


#######################One root user as admin only###################
# @router.post("/create-root-user")   
# async def create_root_user(user: User) -> dict:

#     """Create a new user and return a success message"""
#     # Check if user already exists and ensure role is not admin
#     # Check if root user already exists
#     existing_user = await User.find_one({"role": "admin"})
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Root user already exists")

#     if existing_user:
#         if existing_user.username == user.username:
#             raise HTTPException(status_code=400, detail="Username already exists")
#         if existing_user.email == user.email:
#             raise HTTPException(status_code=400, detail="Email already registered")
#         if existing_user.empid == user.empid:
#             raise HTTPException(status_code=400, detail="Employee ID already registered")

#     # Hash the password for the root user
#     hashed_password = hash_password(user.password)

#     # Create root user document
#     user_obj = User(
#         empid=user.empid,
#         firstname=user.firstname,
#         lastname=user.lastname,
#         email=user.email,
#         phone=user.phone,
#         domain=user.domain,
#         location=user.location,
#         username=user.username,
#         password=hashed_password,
#         role="admin",  # Set role to admin for root user
#         otp=None,
#         otp_expiry=None
#     )
#     await user_obj.insert()  # Insert the new root user into the database
#     return {"message": "Root user created successfully"}


@router.post("/create-root-user")
async def create_admin(user: User, current_user: User = Depends(get_current_user)) -> dict:
    """Allows an existing admin to create more admin users"""
    if current_user['role'] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create new admins")

    # Check if user with same details already exists
    existing_user = await User.find_one(
        {"$or": [{"username": user.username}, {"email": user.email}, {"empid": user.empid}]}
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="User with given details already exists")

    # Hash the password
    hashed_password = hash_password(user.password)

    # Create admin user
    user_obj = User(
        empid=user.empid,
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        phone=user.phone,
        domain=user.domain,
        location=user.location,
        username=user.username,
        password=hashed_password,
        role="admin",  # Set role to admin
        otp=None,
        otp_expiry=None
    )
    await user_obj.insert()
    return {"message": "Admin user created successfully"}

@router.post("/signup")   
async def signup(user: User, role: str = "user") -> dict:
    """Create a new user and return a success message"""
    # Check if user already exists and ensure role is not admin
    existing_user = await User.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email},
            {"empid": user.empid}
        ]
    })
    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Provided Email already registered")
        if existing_user.empid == user.empid:
            raise HTTPException(status_code=400, detail="Employee ID already registered")

    # Hash the password
    hashed_password = hash_password(user.password)
    
    # Create user document with default role
    user_obj = User(
        empid=user.empid,
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        phone=user.phone,
        domain=user.domain,
        location=user.location,
        username=user.username,
        password=hashed_password,
        role=user.role if hasattr(user, 'role') else "user",  # Default role
        otp=None,
        otp_expiry=None
    )
    
    await user_obj.insert()
    # Return a proper dictionary response
    return {"message": f"User:{user.username} created successfully with {role} role"}


@router.put("/users/{username}/role", dependencies=[Depends(get_current_user)])
async def change_user_role(
    username: str,
    request: ChangeRoleRequest,
    current_user: dict = Depends(get_current_user)
):
    # Only admin can change roles
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admin can change user roles")
    
    # Access the new_role attribute from the request object
    new_role = request.new_role
    
    # Validate the new role
    if new_role not in ["user", "admin", "team_manager"]:  # Add other roles as needed
        raise HTTPException(status_code=400, detail="Invalid role specified")
    
    # Find the user to update
    user_to_update = await User.find_one({"username": username})
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the role
    user_to_update.role = new_role
    await user_to_update.save()
    
    return {"message": f"Role for username: {username} updated to {new_role} successfully"}

@router.get("/users/list", dependencies=[Depends(get_current_user)])
async def list_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admin can fetch the list of all users")

    try:
        users = await User.find().to_list()
    except ValidationError as e:
        # Log the validation error and handle it appropriately
        print(f"Validation error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error: Validation failed for some user records")

    return [
        {
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "firstname": user.firstname,
            "lastname": user.lastname
        }
        for user in users
    ]
    
    
@router.delete("/users/delete/{username}", dependencies=[Depends(get_current_user)])
async def delete_user(username: str, current_user: dict = Depends(get_current_user)):
    """Delete a user by username. Only accessible to admins."""
    # Only admin can delete users
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete users")

    # Find the user to delete
    user_to_delete = await User.find_one({"username": username})
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deletion of the root user
    if user_to_delete.username == "root":
        raise HTTPException(status_code=403, detail="The root user cannot be deleted")

    # Delete the user
    await user_to_delete.delete()
    return {"message": f"User {username} deleted successfully"}

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
    print("Reset password request received.")

    
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

    # Log the token entry before deletion
    print(f"Token entry before deletion: {token_entry}")

    try:
        # Delete the used token
        await token_entry.delete()
        print("Token entry deleted successfully.")
    except Exception as e:
        print(f"Error deleting token entry: {str(e)}")


    return {"message": "Password has been reset successfully"}

@router.get("/profile", dependencies=[Depends(get_current_user)])
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's profile information
    """
    user = await User.find_one({"username": current_user["username"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user.username,
        "email": user.email,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "phone": user.phone,
        "domain": user.domain,
        "location": user.location,
        "role": user.role,
        "empid": user.empid
    }

@router.put("/profile", dependencies=[Depends(get_current_user)])
async def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current user's profile information
    """
    user = await User.find_one({"username": current_user["username"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = update_data.dict(exclude_unset=True)
    
    # Prevent role and empid updates through this endpoint
    if "role" in update_dict:
        del update_dict["role"]
    if "empid" in update_dict:
        del update_dict["empid"]
    
    # Check if email is being updated to one that already exists
    if "email" in update_dict and update_dict["email"] != user.email:
        existing_user = await User.find_one({"email": update_dict["email"]})
        if existing_user and existing_user.username != user.username:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    # Apply updates
    for field, value in update_dict.items():
        setattr(user, field, value)
    
    await user.save()
    
    return {"message": "Profile updated successfully"}


@router.post("/change-password", dependencies=[Depends(get_current_user)])
async def change_password(
    request_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Change password for authenticated user with full validation:
    - Requires current password, new password, and confirm password
    - Validates password complexity
    - Checks new passwords match
    - Verifies current password
    - Ensures new password is different
    """
    # Find the user in database
    user = await User.find_one({"username": current_user["username"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all required fields from request
    current_password = request_data.get("current_password")
    new_password = request_data.get("new_password")
    confirm_password = request_data.get("confirm_password")

    # Validate all fields are present
    if not all([current_password, new_password, confirm_password]):
        raise HTTPException(
            status_code=400,
            detail="Current password, new password and confirm password are required"
        )

    # Verify new passwords match
    if new_password != confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirm password do not match"
        )

    # Verify current password is correct
    if not verify_password(current_password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    # Validate new password complexity
    is_valid, message = validate_password_complexity(new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # Check if new password is different from current password
    if verify_password(new_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    # Hash and save the new password
    user.password = hash_password(new_password)
    await user.save()

    return {
        "success": True,
        "message": "Password changed successfully"
    }