from beanie import Document
from typing import List, Optional
from pydantic import BaseModel,EmailStr
import re
from datetime import datetime, timedelta

# Schema for a single player auction entry
class PlayerAuction(BaseModel):
    player_name: str
    employee_id: str
    points_spent: int

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
        
class User(Document):
    empid: str
    firstname: str
    lastname: str
    email: EmailStr
    phone: str
    domain: str
    location: str
    username: str
    password: str
    
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
    team_name = team_name.strip()
    team_name = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", " ", team_name)
    return team_name.upper()
