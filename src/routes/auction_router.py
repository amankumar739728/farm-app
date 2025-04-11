import re
from fastapi import APIRouter, HTTPException,Depends,Request,Body
from models.models import Team, PlayerAuction,format_team_name
from schema.schema import TeamCreateSchema,TeamSchema
from models.models import PlayerUpdateSchema
from typing import List
from common.servicename_app import app,get_current_user
from services.servicename import Mainclass
from utils.constants import Constants
from services.servicename import Mainclass


router = APIRouter()

# 🆕 **Create a Team**

# @router.post("/auction/team/")
# async def create_team(team: TeamCreateSchema):
#     existing_team = await Team.find_one(Team.team_name == team.team_name)
#     if existing_team:
#         raise HTTPException(status_code=400, detail="Team already exists")
#     new_team = Team(team_name=team.team_name,team_owner=team.team_owner,team_logo=team.team_logo)
#     print("New Team Data:", new_team)
#     await new_team.insert()
#     return {"message": f"Team {team.team_name} created successfully!"}

@router.post("/auction/team/")
async def create_team(team: TeamCreateSchema, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to create a team.")
    # if current_user.get("role") not in ["user", "admin", "team_manager"]:
    #     raise HTTPException(status_code=403, detail="You do not have permission to create a team.")

    # Normalize the team name by:
    # 1. Trimming leading/trailing spaces
    # 2. Replacing multiple spaces between words with single space
    # normalized_team_name = re.sub(r' {2,}', ' ', team.team_name.strip())
    formatted_team_name = format_team_name(team.team_name)
    normalized_team_name = re.sub(r' {2,}', ' ', formatted_team_name.strip())
    # Process multiple owners with proper name normalization
    owners = []
    for owner in team.team_owner.split('/'):
        # For each owner: trim, then replace multiple spaces between names with single space
        normalized_owner = re.sub(r' {2,}', ' ', owner.strip())
        owners.append(normalized_owner)
    
    # Join with consistent separator
    normalized_owners = '/'.join(owners)
    # Check for existing team with normalized name (case-sensitive)
    existing_team = await Team.find_one(Team.team_name == normalized_team_name)
    
    if existing_team:
        raise HTTPException(status_code=400, detail="Team already exists")
    
    # Create new team with normalized name
    new_team = Team(
        team_name=normalized_team_name,
        team_owner=normalized_owners,  # normalize owner name too
        team_logo=team.team_logo.strip() if team.team_logo else None
    )
    
    print("New Team Data:", new_team)
    await new_team.insert()
    return {"message": f"Team {normalized_team_name} created successfully!"}

# 🔍 **Get Team List (New Endpoint)**
@router.get("/auction/team_list", response_model=List[str],)
async def get_all_team_names(current_user: dict = Depends(get_current_user)):
    teams = await Team.find().to_list()
    if not teams:
        raise HTTPException(status_code=404, detail="No teams found")
    team_names = [team.team_name for team in teams]  # Extract team_name only
    return team_names  # Return list of team names

# 🔍 **Get Team Info**
@router.get("/auction/team_details/{team_name}")
async def get_team(team_name: str,current_user: dict = Depends(get_current_user)):
    formatted_team_name = format_team_name(team_name)  # Format correctly
    print("Formatted Team Name:", formatted_team_name)
    search_pattern = f"^{formatted_team_name}"  # Find teams starting with the formatted letters

    print(f"Searching MongoDB with: {search_pattern}")  # Debugging print

    # Find a team where the first 4 characters match (case-insensitive)
    team = await Team.find_one({"team_name": {"$regex": search_pattern, "$options": "i"}})

    if not team:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{formatted_team_name}' not found. Try passing a correct team name in capitals seperated by space."
        )

    # Ensure the team_logo is included in the response
    team_details = team.dict(exclude={"id"})
    team_details["team_logo"] = team.team_logo  # Add the team logo URL

    return team_details



# 💰 **Add Player to Team (Auction Purchase)**
@router.post("/auction/team/{team_name}/player/")
async def add_player_to_team(team_name: str, player: PlayerAuction, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to add a player to a team.")
    # if current_user.get("role") not in ["user", "admin", "team_manager"]:
    #     raise HTTPException(status_code=403, detail="You do not have permission to add a player to this team.")

    # Check if the team exists
    team = await Team.find_one(Team.team_name == team_name)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if the player with the same employee_id already exists in any team
    existing_player = await Team.find_one({"players.employee_id": player.employee_id})
    if existing_player:
        raise HTTPException(
            status_code=400,
            detail=f"Player with employee_id {player.employee_id} already exists in team {existing_player.team_name}"
        )

    # Check if the team has enough budget to purchase the player
    if team.remaining_budget < player.points_spent:
        raise HTTPException(status_code=400, detail="Not enough budget to purchase player")

    # Deduct the points spent from the team's remaining budget
    team.remaining_budget -= player.points_spent
    team.used_budget += player.points_spent

    # Add the player to the team's players list
    team.players.append(player)

    # Save the updated team
    await team.save()

    return {"message": f"Player {player.player_name} sold to {team_name} with point {player.points_spent}"}
 

@router.get("/auction/player/{player_name}")
async def get_player_by_name(request: Request, player_name: str, current_user: dict = Depends(get_current_user)):
    if not player_name:
        raise HTTPException(status_code=400, detail="Please provide a player_name")
    # Normalize the player name to lowercase for case-insensitive search
    normalized_player_name = player_name.lower()
    # Compile the regular expression
    pattern = re.compile(normalized_player_name, re.IGNORECASE)

    res = Mainclass(request, app.state.pool)
    teams = await res.get_team_players()  # Fetch all teams' player details

    matching_players = []

    for team in teams:
        for player in team.players:
            if pattern.search(player.player_name):
                matching_players.append({
                    "team_name": team.team_name,
                    "player_name": player.player_name,
                    "employee_id": player.employee_id,
                    "points_spent": player.points_spent
                })

    if not matching_players:
        raise HTTPException(status_code=404, detail="Player not found")

    return matching_players


@router.get("/auction/playerdetails/{employee_id}")   
async def get_player_by_name(request: Request, employee_id: str,current_user: dict = Depends(get_current_user)):
    if not employee_id:
        raise HTTPException(status_code=400, detail="Provided employee_id does not exist!")
    res = Mainclass(request, app.state.pool)
    teams = await res.get_team_players()  # Fetch all teams' player details
    for team in teams:
        for player in team.players:
            if player.employee_id == employee_id:
                return {
                    "team_name": team.team_name,
                    "player_name": player.player_name,
                    "employee_id": player.employee_id,
                    "points_spent": player.points_spent
                }

    raise HTTPException(status_code=404, detail="Player not found")


# @router.get("/auction/team/{team_name}/players")
# async def get_players_by_team(team_name: str, current_user: dict = Depends(get_current_user)):
#     """Get all players belonging to a specific team"""
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required to view team players.")
#     team = await Team.find_one(Team.team_name == team_name)
#     if not team:
#         raise HTTPException(status_code=404, detail="Team not found")
    
#     # Extract just the player names from the team's players
#     player_names = [player.player_name for player in team.players]
    
#     return player_names


@router.get("/auction/team/{team_name}/players")
async def get_players_by_team(team_name: str, current_user: dict = Depends(get_current_user)):
    """Get all players belonging to a specific team (case-insensitive and partial match)"""
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required to view team players.")
    
    # Create a regex pattern for case-insensitive matching
    # Escape special regex characters in the team_name first
    escaped_team_name = re.escape(team_name)
    pattern = f".*{escaped_team_name}.*"
    
    # Find team with case-insensitive matching
    team = await Team.find_one({
        "team_name": {
            "$regex": pattern,
            "$options": "i"  # 'i' for case-insensitive
        }
    })
    
    if not team:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{team_name}' not found."
        )
    
    # Extract just the player names from the team's players
    player_names = [player.player_name for player in team.players]
    
    return player_names


@router.get("/auction/team/{team_name}/empid")
async def get_players_by_team(team_name: str, current_user: dict = Depends(get_current_user)):
    """Get all players belonging to a specific team (case-insensitive and partial match)"""
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required to view team players.")
    
    # Create a regex pattern for case-insensitive matching
    # Escape special regex characters in the team_name first
    escaped_team_name = re.escape(team_name)
    pattern = f".*{escaped_team_name}.*"
    
    # Find team with case-insensitive matching
    team = await Team.find_one({
        "team_name": {
            "$regex": pattern,
            "$options": "i"  # 'i' for case-insensitive
        }
    })
    
    if not team:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{team_name}' not found."
        )
    
    # Extract just the player names from the team's players
    player_empid = [player.employee_id for player in team.players]
    
    return player_empid

@router.delete("/auction/team/{team_name}/player/{player_name}")
async def remove_player_from_team(
    team_name: str, 
    player_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a player from a team (supports partial and case-insensitive team name)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to remove a player from a team.")
    escaped_team_name = re.escape(team_name)
    # pattern = f"{escaped_team_name}"
    pattern = f".*{escaped_team_name}.*"

    team = await Team.find_one({
        "team_name": {
            "$regex": pattern,
            "$options": "i"
        }
    })

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Find the player to remove (case-insensitive match)
    player_to_remove = None
    for player in team.players:
        if player.player_name.lower() == player_name.lower():
            player_to_remove = player
            break

    if not player_to_remove:
        raise HTTPException(status_code=404, detail="Player not found in this team")

    # Adjust team budgets
    team.remaining_budget += player_to_remove.points_spent
    team.used_budget -= player_to_remove.points_spent

    # Remove player
    team.players = [p for p in team.players if p.player_name.lower() != player_name.lower()]

    await team.save()

    return {"message": f"Player {player_name} removed from {team.team_name} successfully"}


@router.put("/auction/team/{team_name}/player/{employee_id}")
async def update_player_details(
    team_name: str,
    employee_id: str,
    updated_player: PlayerAuction = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update player details within a team by employee_id"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to update player details.")

    # Case-insensitive search for the team
    escaped_team_name = re.escape(team_name)
    pattern = f".*{escaped_team_name}.*"
    team = await Team.find_one({
        "team_name": {"$regex": pattern, "$options": "i"}
    })

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Locate the player by employee_id
    player_to_update = None
    for idx, player in enumerate(team.players):
        if player.employee_id == employee_id:
            player_to_update = player
            player_index = idx
            break

    if not player_to_update:
        raise HTTPException(status_code=404, detail=f"Player with employee_id {employee_id} not found in team")

    # Adjust team budget if points_spent is being updated
    if updated_player.points_spent != player_to_update.points_spent:
        budget_diff = updated_player.points_spent - player_to_update.points_spent
        if team.remaining_budget < budget_diff:
            raise HTTPException(status_code=400, detail="Not enough budget to update player's points")
        team.remaining_budget -= budget_diff
        team.used_budget += budget_diff

    # Update player details
    team.players[player_index] = updated_player
    await team.save()

    return {"message": f"Player {employee_id} updated successfully in {team.team_name}"}


@router.patch("/auction/team/{team_name}/player/{employee_id}")
async def patch_player_details(
    team_name: str,
    employee_id: str,
    updates: PlayerUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to update player details.")
    escaped_team_name = re.escape(team_name)
    pattern = f".*{escaped_team_name}.*"
    team = await Team.find_one({
        "team_name": {"$regex": pattern, "$options": "i"}
    })

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Find the player
    player_index = None
    for idx, player in enumerate(team.players):
        if player.employee_id == employee_id:
            player_index = idx
            break

    if player_index is None:
        raise HTTPException(status_code=404, detail="Player not found")

    player = team.players[player_index]

    # Adjust budget if points_spent is updated
    if updates.points_spent is not None:
        budget_diff = updates.points_spent - player.points_spent
        if budget_diff > 0 and team.remaining_budget < budget_diff:
            raise HTTPException(status_code=400, detail="Not enough budget to update player's points")
        team.remaining_budget -= budget_diff
        team.used_budget += budget_diff
        player.points_spent = updates.points_spent

    # Update name if provided
    if updates.player_name is not None:
        player.player_name = updates.player_name

    # Save updated player back into the list
    team.players[player_index] = player
    await team.save()

    return {
        "message": f"Player {employee_id} updated successfully in {team.team_name}",
        "updated_data": {
            "player_name": player.player_name,
            "employee_id": player.employee_id,
            "points_spent": player.points_spent
        }
    }
    