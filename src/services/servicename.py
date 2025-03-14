# from src.schema.schema import SampleResponse

# def get_sample_response():
#     return SampleResponse(message="Hello, World!", status="success")

import asyncio
from ast import literal_eval
import numpy as np
import pandas as pd
from utils.constants import Constants
from common.servicename_app import get_query_with_pool
from utils.utils import queries
# from utils.arrow_utils import ArrowUtils
from schema.schema import SampleResponse
from models.models import Team

class Mainclass():
    def __init__(self, request,conn):
        #self.query = queries['servicename']
        self.query = queries.get("servicename", {})
        self.request = request
        self.conn_pool = conn
        
        
    async def get_sample_response(self,data):
        return SampleResponse(message=f"Hello, {data['fullname']}!", status="success").dict()
    
    async def get_dynamic_response(self, data):
        """Formats the input data dynamically"""
        formatted_response = {
            "message": f"Hello {data.name}, you are {data.age} years old and live in {data.city}.",
            "status": "success",
            "uppercase_name": data.name.upper(),
            "reversed_city": data.city.upper()[::-1]
        }
        return formatted_response
    
    async def get_team_players(self):
        # Assuming you store teams in a collection
        teams = await Team.find_all().to_list()
        return teams
