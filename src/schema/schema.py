from pydantic import BaseModel,EmailStr
from typing import List,Optional

class AuthRequest(BaseModel):
    username: str
    
# class LoginUser(BaseModel):
#     username: str
#     password: str


class LoginUser(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None
    
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    
class OTPResponse(BaseModel):
    message: str

class SampleResponse(BaseModel):
    message: str
    status: str
    
class SampleData(BaseModel):
    name: str
    age: int
    city: str
    
class TeamCreateSchema(BaseModel):
    team_name: str
    team_owner: str
    team_logo: Optional[str] = None
    
class PlayerAuctionSchema(BaseModel):
    player_name: str
    employee_id: str
    points_spent: int

class TeamSchema(BaseModel):
    team_name: str
    team_owner: str
    total_budget: int
    remaining_budget: int
    used_budget: int
    players: List[PlayerAuctionSchema] = []
    
class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    
# Pydantic Models
class UserSignup(BaseModel):
    empid: str
    firstname: str
    lastname: str
    email: EmailStr
    phone: str
    domain: str
    location: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    
# Model for Forgot Password request
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Model for Reset Password request
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
    
