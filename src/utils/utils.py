# import yaml

# def read_yaml(file_path: str):
#     with open(file_path, "r") as file:
#         return yaml.safe_load(file)

####################################################################
# import os
# import socket
# import uuid
# import base64
# import binascii
# import re
# from glob import glob
# from time import gmtime

# import yaml
# import aiomysql
# from asynch import pool as pool_async
# from config import settings
# from fastapi import Request
# from smart_logger.logger import InitializeLogger


# async def get_async_connection_pool():
#     print("config['db_hostname']",settings.DB_HOST)
#     return await pool_async.create_pool(
#         minsize = settings.CH_POOL_MIN_SIZE,
#         maxsize = settings.CH_POOL_MAX_SIZE,
#         host = settings.DB_HOST,
#         port = settings.DB_PORT,
#         database= settings.DB_NAME,
#         password= settings.DB_PASSWD,
#         user=settings.DB_USER
#     )
    
# async def get_mariadb_connection_pool():
#     """Initialize mariadb pool"""
#     pool = await aiomysql.create_pool(
#         user=settings.MARIA_DB_USER,
#         password=settings.MARIA_DB_PASSWORD,
#         host=settings.MARIA_DB_HOST,
#         port=int(settings.MARIA_DB_PORT),
#         db=settings.MARIA_DB_NAME,
#         minsize = int(settings.MR_POOL_MIN_SIZE),
#         maxsize = int(settings.MR_POOL_MAX_SIZE)
#     )
#     return

# def create_api_directories(directories_dict):
#     for d in directories_dict.values():
#         if not os.path.isdir(d):
#             os.mkdir(d)
#     return True 

# def decode_username(encoded_username):
#     try:
#         decoded_username = base64.urlsafe_b64decode(encoded_username + '===').decode('utf-8')
#         if not encoded_username == base64.urlsafe_b64encode(decoded_username.encode('utf-8')).decode('utf-8'):
#             raise Exception('Not a valid user')
#     except (binascii.Error, UnicodeDecodeError) as e:
#         raise Exception(f"Error decoding the username: {e}")
#     return decoded_username

# async def prepare_context(request:Request):
#     try:
#         payload = await request.json()
#     except:
#         payload = request.query_params
#     context = {
#         'uuid':uuid.uuid1().__str__(),
#         'method':request.method,
#         'url':str(request.url),
#         'host':socket.gethostname(),
#         'payload':payload,
#         'service_name': args.service
#     }
    
# parser = argparse.ArgumentParser()
# parser.add_argument('--port',help='Provide the port')
# parser.add_argument('--service',help='Provide the Service name')
# args=  parser.parse_args()


# def get_api_config():
#     """function to read api yaml file"""
#     query_files = glob(os.path.join('api','services',args.service,'src','common/*.yaml'),
#                        recursive=True)
#     queries = {}
#     for qfile in query_files:
#         key = os.path.splitext(os.path.basename(qfile))[0]
#         with open(qfile) as file:
#             queries[key] = yaml.load(file, Loader=yaml.SafeLoader)
#     return queries

# def initlogger():
#     port = args.port
#     service_name = args.service
    
#     logpath = f"/Application/GyanSys/{service_name}"
#     if not os.path.exists(logpath):
#         os.makedirs(logpath)
#     config = {
#         'logger_name': f'{service_name}',
#         'formatter': '%(asctime)s| %(uuid)s | %(userid)s | %(host)s | %(exec_time)s | %(levelname)s | %(lineno)s | '
#                     '%(funcName)s | %(message)s',
#         'extra_keys': ['service_name', 'exec_time', 'host', 'userid' ,'status',
#                        'method', 'url', 'status_msg' ,'payload' ,'error_msg' ,'uuid'],
#         'log_level': 'DEBUG',
#         'custom_methods': ['query', 'payload', 'access'],
#         'single_method_file' : True,
#         'profiling': False,
#         'log_path': logpath,
#         'log_filename': f'ApplicationRolling_{port}',
#         'timezone': gmtime,
#         'retention': {'when': 'midnight', 'interval':1, 'backupCount': 30} 
#     }
    
#     access_logpath = logpath + '/accesslogs/'
#     if not os.path.exists(access_logpath):
#         os.makedirs(access_logpath)
#     access_config = {
#         'logger_name': f'{service_name}_access',
#         'formatter': '%(asctime)s| %(uuid)s | %(host)s | %(userid)s | %(status)s | %(method)s | %(url)s | '
#                     '%(status_msg)s | %(error_msg)s | %(payload)s | %(service_name)s | %(exec_time)s ',
#         'extra_keys': ['service_name', 'exec_time', 'host', 'userid' ,'status',
#                        'method', 'url', 'status_msg' ,'payload' ,'error_msg' ,'uuid'],
#         'log_level': 'DEBUG',
#         'custom_methods': ['query', 'payload', 'access'],
#         'single_method_file' : True,
#         'profiling': False,
#         'log_path': access_logpath,
#         'log_filename': f'access_log_{port}',
#         'timezone': gmtime,
#         'retention': {'when': 'midnight', 'interval':1, 'backupCount': 30} 
#     }
    
#     logger= InitializeLogger(config)
#     access_logger= InitializeLogger(access_config)
#     return logger, access_logger

# logger,access_logger = initlogger()
# queries = get_api_config()


##################################################################################

import os
import socket
import uuid
import base64
import binascii
import argparse
import yaml
import logging
import aiomysql
from asynch import pool as pool_async
from time import gmtime
from glob import glob
from fastapi import Request
from config import settings


# Set up logging
logging.basicConfig(level=logging.WARNING, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("ServiceName")
access_logger = logging.getLogger("ServiceName_Access")


# async def get_async_connection_pool():
#     print("config['db_hostname']", settings.DB_HOST)
#     return await pool_async.create_pool(
#         minsize=settings.CH_POOL_MIN_SIZE,
#         maxsize=settings.CH_POOL_MAX_SIZE,
#         host=settings.DB_HOST,
#         port=settings.DB_PORT,
#         database=settings.DB_NAME,
#         password=settings.DB_PASSWD,
#         user=settings.DB_USER
#     )


# async def get_mariadb_connection_pool():
#     """Initialize MariaDB pool"""
#     pool = await aiomysql.create_pool(
#         user=settings.MARIA_DB_USER,
#         password=settings.MARIA_DB_PASSWD,
#         host=settings.MARIA_DB_HOST,
#         port=int(settings.MARIA_DB_PORT),
#         db=settings.MARIA_DB_NAME,
#         minsize=int(settings.MR_POOL_MIN_SIZE),
#         maxsize=int(settings.MR_POOL_MAX_SIZE)
#     )
#     return pool  # Ensure this returns the pool


async def get_async_connection_pool():
    """Skipping database pool creation"""
    return None  # Return None instead of trying to connect

async def get_mariadb_connection_pool():
    """Skipping database pool creation"""
    return None  # Return None instead of trying to connect


def create_api_directories(directories_dict):
    """Create directories if they don't exist."""
    for d in directories_dict.values():
        if not os.path.isdir(d):
            os.mkdir(d)
    return True


def decode_username(encoded_username):
    """Decode a base64-encoded username."""
    try:
        decoded_username = base64.urlsafe_b64decode(encoded_username + '===').decode('utf-8')
        if not encoded_username == base64.urlsafe_b64encode(decoded_username.encode('utf-8')).decode('utf-8'):
            raise Exception('Not a valid user')
    except (binascii.Error, UnicodeDecodeError) as e:
        raise Exception(f"Error decoding the username: {e}")
    return decoded_username


async def prepare_context(request: Request):
    """Prepare request context."""
    try:
        payload = await request.json()
    except:
        payload = request.query_params
    context = {
        'uuid': uuid.uuid1().__str__(),
        'method': request.method,
        'url': str(request.url),
        'host': socket.gethostname(),
        'payload': payload,
        'service_name': args.service
    }
    return context


parser = argparse.ArgumentParser()
parser.add_argument('--port', help='Provide the port')
parser.add_argument('--service', help='Provide the Service name')
args = parser.parse_args()


def get_api_config():
    """Read API YAML configuration."""
    query_files = glob(os.path.join('api', 'services', args.service, 'src', 'common/*.yaml'), recursive=True)
    queries = {}
    for qfile in query_files:
        key = os.path.splitext(os.path.basename(qfile))[0]
        with open(qfile) as file:
            queries[key] = yaml.safe_load(file)
    return queries


def initlogger():
    """Initialize logging using Python's built-in logging module."""
    port = args.port
    service_name = args.service

    logpath = f"/Application/GyanSys/{service_name}"
    access_logpath = os.path.join(logpath, 'accesslogs')

    # Create log directories if they don't exist
    os.makedirs(logpath, exist_ok=True)
    os.makedirs(access_logpath, exist_ok=True)

    log_format = "%(asctime)s | %(uuid)s | %(userid)s | %(host)s | %(exec_time)s | %(levelname)s | %(lineno)s | %(funcName)s | %(message)s"

    # Main logger
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.WARNING)
    file_handler = logging.FileHandler(os.path.join(logpath, f'ApplicationRolling_{port}.log'))
    file_handler.setFormatter(logging.Formatter(log_format))
    logger.addHandler(file_handler)

    # Access logger
    access_logger = logging.getLogger(f"{service_name}_access")
    access_logger.setLevel(logging.WARNING)
    access_file_handler = logging.FileHandler(os.path.join(access_logpath, f'access_log_{port}.log'))
    access_file_handler.setFormatter(logging.Formatter(log_format))
    access_logger.addHandler(access_file_handler)
    
    # Stream handler for access logger
    access_stream_handler = logging.StreamHandler()
    access_stream_handler.setFormatter(logging.Formatter(log_format))
    access_logger.addHandler(access_stream_handler)

    return logger, access_logger


# Initialize loggers
logger, access_logger = initlogger()
queries = get_api_config()


