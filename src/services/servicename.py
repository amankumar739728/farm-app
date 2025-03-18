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
import random
import smtplib
from email.mime.text import MIMEText
from config import settings
from fastapi import HTTPException


    
# Helper functions
async def generate_otp():
    return str(random.randint(100000, 999999))  # 6-digit OTP

async def send_otp_email(email: str, otp: str):
    subject = "Please Use Below OTP for Login Valid for 5 minutes"
    body = f"Your Login OTP is: {otp}"
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = settings.MAIL_FROM
    msg['To'] = email
    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, [email], msg.as_string())
    except Exception as e:
        print(f"Error sending OTP via Mail: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP via Mail")

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