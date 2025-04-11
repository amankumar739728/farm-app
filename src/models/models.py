from beanie import Document
from typing import List, Optional
from pydantic import BaseModel,EmailStr,Field,validator
import re
from datetime import datetime, timedelta

# Schema for a single player auction entry
class PlayerAuction(BaseModel):
    player_name: str
    employee_id: str
    points_spent: int

class PlayerUpdateSchema(BaseModel):
    player_name: Optional[str] = None
    points_spent: Optional[int] = None

# Team Model (MongoDB Document)
class Team(Document):
    team_name: str
    team_owner: str
    total_budget: int = 100000  # Default budget per team
    remaining_budget: int = 100000  # Initially, same as total budget
    used_budget: int = 0  # Initially zero
    players: List[PlayerAuction] = []  # List of auctioned players
    team_logo: Optional[str] = None 

    class Settings:
        name = "Team"  # MongoDB Collection Name
        
# class User(Document):
#     empid: str
#     role: Optional[str] = "user"  # Added role field with default value
#     firstname: str
#     lastname: str
#     email: EmailStr
#     phone: str
#     domain: str
#     location: str
#     username: str
#     password: str
#     otp: Optional[str] = None  # Store the OTP
#     otp_expiry: Optional[datetime] = None  # Store the OTP expiry time
    
#     class Settings:
#         name = "users"
        
        
# New User class for User(Document):
class User(Document):
    empid: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_-]+$")
    role: str = Field("user", pattern="^(user|team_manager|analyst|admin)$")  # Including 'admin' role
    firstname: str = Field(..., min_length=1, max_length=50)
    lastname: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone: str = Field(..., pattern="^[0-9]{10,15}$")
    domain: str = Field(..., min_length=2, max_length=50)
    location: str = Field(..., min_length=2, max_length=50)
    username: str = Field(..., min_length=4, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=100)
    otp: Optional[str] = None  # Store the OTP
    otp_expiry: Optional[datetime] = None  # Store the OTP expiry time

    @validator('password')
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    class Settings:
        name = "users"
        
        
class ResetToken(Document):
    email: EmailStr  # Associate token with the user's email
    token: str       # The reset token
    expires_at: datetime  # Expiration timestamp

    class Settings:
        name = "reset_tokens"
        
def format_team_name(team_name: str) -> str:
    """Formats the team name correctly with spaces and converts to uppercase."""
    team_name = (team_name.strip()).lower()
    team_name = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", " ", team_name)
    return team_name.upper()

def validate_password_complexity(password: str):
    """
    Validate password meets complexity requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, ""
