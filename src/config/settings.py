from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ServiceName"
    app_version: str = "1.0.0"
    jwt_secret: str
    database_url: str
    secret_key: str
    password_secret_key: str
    db_name: str
    db_user: str
    db_password: str
    db_host: str
    db_port: int
    ch_pool_min_size: int
    ch_pool_max_size: int

    algorithm: str


    class Config:
        env_file = ".env.development"

def get_settings():
    return Settings()



import os
from pathlib import Path

from dotenv import load_dotenv

env = os.environ.get("PY_ENV") or "development"
env_path = os.path.join(Path(__file__).parent.parent.parent, f".env.{env}")
load_dotenv(dotenv_path=env_path)

#ENV CONFIGURATION
SECRET_KEY = os.environ.get('SECRET_KEY')
PASSWORD_SECRET_KEY = os.environ.get('PASSWORD_SECRET_KEY')
REFRESH_SECRET_KEY = os.environ.get('REFRESH_SECRET_KEY')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES'))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get('REFRESH_TOKEN_EXPIRE_DAYS'))

OAUTH_INTROSPECT_ENDPOINT = os.environ.get('OAUTH_INTROSPECT_ENDPOINT')
OAUTH_CLIENT_ID = os.environ.get('OAUTH_CLIENT_ID')
OAUTH_CLIENT_SECRET= os.environ.get('OAUTH_CLIENT_SECRET')
ALGORITHM= os.environ.get('ALGORITHM')


#PORT = os.environ.get('PORT') or '8080'
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = int(os.environ.get('DB_PORT'))

CH_POOL_MIN_SIZE = int(os.environ.get('CH_POOL_MIN_SIZE'))
CH_POOL_MAX_SIZE = int(os.environ.get('CH_POOL_MAX_SIZE'))

#Mariadb

MARIA_DB_NAME = os.environ.get('MARIA_DB_NAME')
MARIA_DB_USER = os.environ.get('MARIA_DB_USER')
MARIA_DB_PASSWD = os.environ.get('MARIA_DB_PASSWORD')
MARIA_DB_HOST = os.environ.get('MARIA_DB_HOST')
MARIA_DB_PORT = int(os.environ.get('MARIA_DB_PORT'))

MR_POOL_MIN_SIZE = int(os.environ.get('MR_POOL_MIN_SIZE'))
MR_POOL_MAX_SIZE = int(os.environ.get('MR_POOL_MAX_SIZE'))

DATABASE_URL = os.environ.get('DATABASE_URL')


MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_FROM = os.environ.get('MAIL_FROM')
MAIL_PORT = int(os.environ.get('MAIL_PORT'))
MAIL_SERVER = os.environ.get('MAIL_SERVER')

JWT_EXCLUDE_PATH = [
    '/docs',
    '/swaggerapi/docs',
    '/health',
    'openapi.json'
]

ENABLE_JWT = True
ENABLE_PINGSSO = True
