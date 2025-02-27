from fastapi import APIRouter, HTTPException
from models.models import Team, PlayerAuction,format_team_name
from schema.schema import TeamCreateSchema,TeamSchema

router = APIRouter()

# 🆕 **Create a Team**

@router.post("/auction/team/")
async def create_team(team: TeamCreateSchema):
    existing_team = await Team.find_one(Team.team_name == team.team_name)
    if existing_team:
        raise HTTPException(status_code=400, detail="Team already exists")

    new_team = Team(team_name=team.team_name,team_owner=team.team_owner)
    await new_team.insert()
    return {"message": f"Team {team.team_name} created successfully!"}


# 🔍 **Get Team Info**
# @router.get("/auction/team_details/{team_name}")
# async def get_team(team_name: str):
#     # format the team name
#     formatted_team_name = format_team_name(team_name) 
#     print("Formatted Team Name:", formatted_team_name)
#     team = await Team.find_one(Team.team_name == formatted_team_name)
#     #Case-insensitive search in MongoDB
#     team = await Team.find_one({"team_name": {"$regex": f"^{formatted_team_name}$", "$options": "i"}})
#     if not team:
#         raise HTTPException(status_code=404, detail="Team not found please enter the team in capital Letters")
#     return team.dict(exclude={"id"})


@router.get("/auction/team_details/{team_name}")
async def get_team(team_name: str):
    formatted_team_name = format_team_name(team_name)  # Format correctly
    print("Formatted Team Name:", formatted_team_name)
    search_pattern = f"^{formatted_team_name[:4]}"  # First 4 letters

    print(f"Searching MongoDB with: {search_pattern}")  # Debugging print

    # Find a team where the first 4 characters match (case-insensitive)
    team = await Team.find_one({"team_name": {"$regex": search_pattern, "$options": "i"}})

    if not team:
        raise HTTPException(
            status_code=404,
            detail=f"Team '{formatted_team_name}' not found. Try passing a correct team name in capitals seperated by space."
        )

    return team.dict(exclude={"id"})


# 💰 **Add Player to Team (Auction Purchase)**
@router.post("/auction/team/{team_name}/player/")
async def add_player_to_team(team_name: str, player: PlayerAuction):
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
