# from fastapi import FastAPI, Request, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from src.config.settings import get_settings
# from src.utils.auth_utils import verify_jwt

# settings = get_settings()

# app = FastAPI(title="ServiceName", version="1.0.0")

# # Middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Middleware to validate JWT token
# @app.middleware("http")
# async def validate_authenticity(request: Request, call_next):
#     token = request.headers.get("Authorization")
#     if not token or not verify_jwt(token):
#         raise HTTPException(status_code=401, detail="Unauthorized")
#     response = await call_next(request)
#     return response

# # Startup and Shutdown Events
# @app.on_event("startup")
# async def startup():
#     print("Service is starting up...")

# @app.on_event("shutdown")
# async def shutdown():
#     print("Service is shutting down...")


#############################fastapi_app.py#################################

# from fastapi import FastAPI, Request, HTTPException,status,Response
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.middleware.gzip import GZipMiddleware
# from fastapi.routing import APIRoute
# from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
# from jose import JWTError
# from jwt import decode
# from starlette.middleware.base import BaseHTTPMiddleware
# from src.config.settings import get_settings
# from src.utils.auth_utils import verify_jwt
# from src.utils.utils import access_logger,args,get_async_connection_pool, logger,get_mariadb_connection_pool
# from utils.auth_utils import AuthUtil
# from fastapi.responses import JSONResponse

# import itertools
# import socket
# import time
# import traceback
# import uuid
# from contextvars import ContextVar
# from typing import Callable

# import pandas as pd
# from config import settings

# # settings = get_settings()

# # # Create the FastAPI app
# # app = FastAPI(title="ServiceName", version="1.0.0")


# app = FastAPI()
# context_vars = ContextVar('context',default={})
# auth_schema = HTTPBearer()

# # Middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Middleware to validate JWT token
# @app.middleware("http")
# async def validate_authenticity(request: Request, call_next):
#     token = request.headers.get("Authorization")
#     if not token or not verify_jwt(token):
#         raise HTTPException(status_code=401, detail="Unauthorized")
#     response = await call_next(request)
#     return response

# # Startup and Shutdown Events
# @app.on_event("startup")
# async def startup():
#     try:
#         app.state.pool =await get_async_connection_pool()
#         app.state.mariadbpool= await get_mariadb_connection_pool()
#         print("Service is starting up...")
#         print("Startup done")
#     except Exception as e:
#         print("Error during startup: ", str(e))

# @app.on_event("shutdown")
# async def shutdown():
#     try:
#         await app.state.pool.terminate()
#         app.state.mariadbpool.close()
#         await app.state.mariadbpool.wait_closed()
#         print("Service shutdown done")
#     except Exception as e:
#         print("Error during stutdown: ", str(e))
        
# async def get_query_with_mariadb_pool(request,pool,query,resp_type="dict"):
#     try:
#         conn= await pool.acquire()
#         async with conn.cursor() as cur:
#             await cur.execute(query)
#             request.app_log.info(f"Query Executed Successfully: {query}",extra=request.context)
#             data= await cur.fetchall()
#             col= [desc[0] for desc in cur.description]
#             if resp_type == "df":
#                 data = pd.DataFrame(data,columns=col)
#             elif resp_type == "dict":
#                 data = list(map(lambda row: dict(itertools.zip_longest(list(col),row)),data))
#                 if len(data) != 0:
#                     data = [
#                         {
#                             k: " ".join(val.split("\x00")).strip()
#                             if isinstance(val,str)
#                             else val
#                             for k,val in d.items()
#                         }
#                         for d in data
#                     ]
#     except Exception as e:
#         request.app_log.error(f"Query executing failed: {str(e)}",extra=request.context)
#         raise e
#     await pool.release(conn)
#     return data
    
# async def update_query_with_mariadb_pool(request, pool, query):
#     """
#     Executes an UPDATE query using the MariaDB connection pool.
#     """
#     try:
#         conn = await pool.acquire()
#         async with conn.cursor() as cur:
#             await cur.execute(query)
#             await conn.commit()
#             request.app_log.info(f"Update Query Executed Successfully: {query}", extra=request.context)
#     except Exception as e:
#         request.app_log.error(f"Update Query execution failed: {str(e)}", extra=request.context)
#         raise e
#     await pool.release(conn)
#     return "Deleted Successfully !!"

# async def insert_query_with_mariadb_pool(request, pool, query):
#     """
#     Executes an INSERT query using the MariaDB connection pool.
#     """
#     try:
#         conn = await pool.acquire()
#         async with conn.cursor() as cur:
#             await cur.execute(query)
#             await conn.commit()
#             last_insert_id = cur.lastrowid
#             request.app_log.info(f"Data Inserted with ID: {last_insert_id}", extra=request.context)
#     except Exception as e:
#         request.app_log.error(f"Insert Query execution failed: {str(e)}", extra=request.context)
#         raise e
#     await pool.release(conn)
#     return "Data Inserted successfully !!"

# async def get_query_with_pool(request, pool,query,resp_type="dict"):
#     """Function to query the sql with connection pool"""
#     try:
#         async with pool.acquire() as conn:
#             async with conn.cursor() as cur:
#                 await cur.execute(query)
#                 request.app_log.info(f"Query Executed Successfully: {query}", extra=request.context)
#                 data = await cur.fetchall()
#                 col= cur._columns
#                 if resp_type == "df":
#                     data = pd.DataFrame(data,columns=col)
#                 elif resp_type == "dict":
#                     data = list(map(lambda row: dict(itertools.zip_longest(list(col),row)),data))
#                     if len(data) != 0:
#                         data = [
#                             {
#                                 k: " ".join(val.split("\x00")).strip()
#                                 if isinstance(val,str)
#                                 else val
#                                 for k,val in d.items()
#                             }
#                             for d in data
#                         ]
#     except Exception as e:
#         request.app_log.error(f"Query execution failed: {str(e)}",extra=request.context)
#         raise e
#     return data

# async def insert_query_with_pool(request, pool, query,data):
#     """Function to execute an INSERT SQL query with connection pool"""
#     try:
#         async with pool.acquire() as conn:
#             async with conn.cursor() as cur:
#                 await cur.executemany(query,data)
#                 request.app_log.info(f"Insert Query Executed Successfully: {query}", extra=request.context)
#     except Exception as e:
#         request.app_log.error(f"Insert Query execution failed: {str(e)}", extra=request.context)
#         raise e
#     return "Data Inserted Successfully !!"


# @app.middleware("http")
# async def add_process_time_header(request: Request, call_next):
#     start_time = time.time()
#     response = await call_next(request)
#     process_time = time.time() - start_time
#     response.headers["X-Process-Time"] = str(process_time)
#     return response

# token_cache = {}

# async def verify_jwt(request: Request, authorization: str):
#     try:
#         if not (request.url.path.endswith("/login")):
#             user_data = decode(authorization,settings.SECRET_KEY, algorithms="HS256")
#             if not user_data.get("username"):
#                 return HTTPException(status_code=401,detail="Unauthorized token")
#             return user_data
#     except JWTError as je:
#         raise HTTPException(status_code=401,detail="Unauthorized token") from je
#     except Exception as e:
#         import traceback
#         print(traceback.print_exc())
#         raise HTTPException(status_code=401,detail="Unauthorized token") from e
    
# @app.middleware("http")
# async def validate_authenticity(request: Request, call_next):
#     start_ts = time.time()
#     auth_log = logger.getLogger(context_vars.get())
#     auth_log.info(f"Authenticity Validation Started: {request.url.path}", extra=request.context)
#     authorization: str = request.headers.get('Authorization','')
#     schema,param = AuthUtil.get_authorization_scheme_param(authorization)
#     if not authorization or schema.lower() != 'bearer':
#         auth_log.error('Unautorized, token passed is invalid',extra=context_vars.get())
#         return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED,content={'detail': 'Unauthorized, No/Invalid Bearer Token Passed'})
#     try:
#         payload = {}
#         if settings.ENABLE_PINGSSO:
#             try:
#                 # Ping SSO
#                 user_cache = token_cache.get(param,{})
#                 token = user_cache.get('token')
#                 expiration_time = user_cache.get('expiration_time')
#                 payload = user_cache.get('payload')
#                 if token is None or time.time() >expiration_time:
#                     auth_log.error('Token not found in cache,authenticating using ping sso auth',extra=context_vars.get())
#                     payload = await AuthUtil.get_user_from_oauth(str(param))
#                     user_cache['token'] = param
#                     user_cache['expiration_time'] = payload['exp']
#                     user_cache['payload'] = payload
#                     token_cache[param] = user_cache
                    
#             except Exception as auth_exe:
#                 auth_log.error(f'ping sso validation failed,error: {str(auth_exe)}',extra=context_vars.get())
#         if not payload and settings.ENABLE_JWT:
#             try:
#                 payload = await verify_jwt(request, param)
#             except Exception as auth_exe:
#                 auth_log.error(f'ping sso validation failed,error: {str(auth_exe)}',extra=context_vars.get())
#         if payload:
#             request.state.security_context = payload
#             context = context_vars.get()
#             if 'userid' in request.state.security_context:
#                 context['userid'] = request.state.security_context['userid']
#             elif 'username' in request.state.security_context:
#                 context['userid'] = request.state.security_context['username']
#             elif 'userID' in request.state.security_context:
#                 context['userid'] = request.state.security_context['userID']
#             elif 'client_id' in request.state.security_context:
#                 context['userid'] = request.state.security_context['client_id']
#             if 'email' in request.state.security_context:
#                 context['email'] = request.state.security_context['email']
#             context_vars.set(context)
#             auth_log.info(f"User Validation Successfull, time taken: {time.time()-start_ts}", extra=context_vars.get())
            
#             return await call_next(request)
        
#     except Exception as auth_exe:
#         auth_log.exception(f'User validation failed,error: {str(auth_exe)}',extra=context_vars.get())
#     return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED,content={'error':'Invalid Token'})

# app.add_middleware(GZipMiddleware,minimum_size=1000)

# class RequestContextLogMiddleware(BaseHTTPMiddleware):
#     """Middleware to capture api details"""
#     async def set_body(self,request: Request):
#         receive_ = await request._receive()
        
#         async def receive():
#             return receive_
        
#         request._receive = receive
        
#     async def dispatch(self, request: Request, call_next):
#         """Capture API details and log them"""
#         try:
#             await self.set_body(request)
#             start_time = time.time()
#             context = prepare_context_fastapi(request)
#             try:
#                 payload = await request.json()
#             except Exception:
#                 payload = request.query_params
#             context = {
#                 'uuid': str(uuid.uuid1()),
#                 'method': request.method,
#                 'url': str(request.url),
#                 'host': socket.gethostname(),
#                 'payload': payload,
#                 'service_name': args.service,
#                 'status': None    
#             }
#             context.update(request.headers)
#             context_vars.set(context)
#             app_log = access_logger.getLogger(context_vars.get())
#             try:
#                 response = await call_next(request)
#             except Exception as exc:
#                 if str(exc) == 'No response returned.' and await request.is_disconnected():
#                     return Response(status_code=status.HTTP_204_NO_CONTENT)
#                 raise
#             process_time = (time.time() - start_time)*1000
#             context['exec_time'] = process_time
#             if "status" in context and context['status'] is None:
#                 context['status'] = response.status_code
#             res = [i for i in dir(status) if str(response.status_code) in i]
#             context["status_msg"] = res[0][res[0].rfind('_')+1:]
#             app_log.info('',extra=context)
#             response.headers["X-Process-Time"] = str(process_time)
#             return response
#         except Exception as e:
#             context = prepare_context_fastapi(request)
#             context_vars.set(context)
#             app_log = access_logger.getLogger(context_vars.get())
#             context["status"] = 500
#             context["error_msg"] = traceback.format_exc()
#             app_log.info(str(e),extra=context)
            
# app.add_middleware(RequestContextLogMiddleware)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )


# class CustomRoute(APIRoute):
#     """Custom Router"""
#     def get_route_handler(self) -> Callable:
#         original_route_handler = super().get_route_handler()
    
#         async def custom_route_handler(request: Request) -> Response:
#             context = prepare_context_fastapi(request)
#             app_log = logger.getLogger(context)
#             setattr(request,'app_log', app_log)
#             setattr(request,'context', context_vars.get())
#             return await original_route_handler(request)
#         return custom_route_handler
        
        
#######################Latest####################


from fastapi import FastAPI, Request, HTTPException, status, Response,Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.routing import APIRoute
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError,ExpiredSignatureError
from jwt import decode
from starlette.middleware.base import BaseHTTPMiddleware
from common.database import init_db

#from src.config.settings import get_settings
from utils.auth_utils import AuthUtil
from utils.utils import access_logger, args, get_async_connection_pool, logger, get_mariadb_connection_pool
from fastapi.responses import JSONResponse

import itertools
import socket
import time
import traceback
import uuid
from contextvars import ContextVar
from typing import Callable
import logging
import pandas as pd
from config import settings
import jwt
from datetime import datetime,timezone
from fastapi.security import OAuth2PasswordBearer



# Initialize FastAPI
app = FastAPI()

# Context Variables
context_vars = ContextVar('context', default={})
auth_schema = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Set up Logging
logging.basicConfig(level=logging.WARNING, format="%(asctime)s | %(levelname)s | %(message)s")
app_log = logging.getLogger("ServiceName")
access_logger = logging.getLogger("ServiceName_Access")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to validate JWT token
# @app.middleware("http")
# async def validate_authenticity(request: Request, call_next):
#     token = request.headers.get("Authorization")
#     if not token or not verify_jwt(token):
#         app_log.warning("Unauthorized access attempt")
#         raise HTTPException(status_code=401, detail="Unauthorized")
#     response = await call_next(request)
#     return response

###########################above function is not req#################

# Startup and Shutdown Events
# @app.on_event("startup")
# async def startup():
#     try:
#         app.state.pool = await get_async_connection_pool()
#         app.state.mariadbpool = await get_mariadb_connection_pool()
#         app_log.info("Service is starting up...")
#     except Exception as e:
#         app_log.error(f"Error during startup: {str(e)}")


# @app.on_event("shutdown")
# async def shutdown():
#     try:
#         await app.state.pool.terminate()
#         app.state.mariadbpool.close()
#         await app.state.mariadbpool.wait_closed()
#         app_log.info("Service shutdown completed")
#     except Exception as e:
#         app_log.error(f"Error during shutdown: {str(e)}")

@app.on_event("startup")
async def startup():
    try:
        # Initialize MongoDB database
        await init_db()
        
        # Remove other database connections if not needed
        app.state.pool = None
        app.state.mariadbpool = None
        app_log.info("Service started successfully without a database.")

    except Exception as e:
        app_log.error(f"Error during startup: {str(e)}")

        
@app.on_event("shutdown")
async def shutdown():
    try:
        if app.state.pool:
            await app.state.pool.terminate()
        if app.state.mariadbpool:
            app.state.mariadbpool.close()
            await app.state.mariadbpool.wait_closed()
        app_log.info("Service shutdown completed")
    except Exception as e:
        app_log.error(f"Error during shutdown: {str(e)}")
        
# Middleware to track request processing time
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers['Access-Control-Allow-Origin'] = '*'  
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Token Cache
token_cache = {}

# JWT Verification
# async def verify_jwt(request: Request, authorization: str):
#     try:
#         if not (request.url.path.endswith("/login")):
#             user_data = decode(authorization, settings.SECRET_KEY, algorithms="HS256")
#             if not user_data.get("username"):
#                 return HTTPException(status_code=401, detail="Unauthorized token")
#             return user_data
#     except JWTError as je:
#         raise HTTPException(status_code=401, detail="Unauthorized token") from je
#     except Exception as e:
#         print(traceback.print_exc())
#         raise HTTPException(status_code=401, detail="Unauthorized token") from e



# async def verify_jwt(request: Request, authorization: str):
#     if not authorization:
#         raise HTTPException(status_code=401, detail="Token missing")

#     try:
#         user_data = decode(authorization, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
#         if not user_data.get("username"):
#             raise HTTPException(status_code=401, detail="Invalid token")
#         return user_data
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Unauthorized token")

        
async def verify_jwt(request: Request, authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        user_data = decode(authorization, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        #print(f'User data: {user_data}')
        exp_timestamp = user_data.get("exp")
        if exp_timestamp is not None:
            exp_timestamp = int(exp_timestamp)
            current_timestamp = int(datetime.now(timezone.utc).timestamp())
            # print(f'Current timestamp: {current_timestamp}')
            # print(f'Expiration timestamp: {exp_timestamp}')
            if exp_timestamp < current_timestamp:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
        if not user_data.get("sub"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                                detail="Invalid token: Missing 'sub' (username)")
        return user_data
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid token")
    
# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     try:
#         app_log.info(f"Verifying token: {token[:50]}...")  # Log first 50 chars of token
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         app_log.info(f"Token payload: {payload}")

#         username: str = payload.get("username")
#         if username is None:
#             app_log.error("Token missing username in payload")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid authentication credentials",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )

#         return {"username": username}
#     except JWTError as e:
#         app_log.error(f"JWT verification failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid authentication credentials",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
        
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        app_log.info(f"Token payload: {payload}")
        username: str = payload.get("sub") # ✅ Extract "sub" instead of "username"
        if username is None:
            app_log.error("Token missing username in payload")
            raise credentials_exception
    except JWTError as e:
        app_log.error(f"JWT verification failed: {str(e)}")
        raise credentials_exception
    return username


# Middleware to validate JWT token
# @app.middleware("http")
# async def validate_authenticity(request: Request, call_next):
#     start_ts = time.time()
#     # auth_log = logger.getLogger(context_vars.get())
#     auth_log = logging.getLogger("ServiceName")
#     context_data = context_vars.get()
#     auth_log.info(f"Authenticity Validation Started: {request.url.path}", extra=context_data)
#     #auth_log.info(f"Authenticity Validation Started: {request.url.path}", extra=request.context)
#     authorization: str = request.headers.get('Authorization', '')
#     schema, param = AuthUtil.get_authorization_scheme_param(authorization)
#     if not authorization or schema.lower() != 'bearer':
#         auth_log.error('Unauthorized, token passed is invalid', extra=context_vars.get())
#         return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'detail': 'Unauthorized, No/Invalid Bearer Token Passed'})
#     try:
#         payload = {}
#         if settings.ENABLE_PINGSSO:
#             try:
#                 user_cache = token_cache.get(param, {})
#                 token = user_cache.get('token')
#                 expiration_time = user_cache.get('expiration_time')
#                 payload = user_cache.get('payload')
#                 if token is None or time.time() > expiration_time:
#                     auth_log.error('Token not found in cache, authenticating using ping sso auth', extra=context_vars.get())
#                     payload = await AuthUtil.get_user_from_oauth(str(param))
#                     user_cache['token'] = param
#                     user_cache['expiration_time'] = payload['exp']
#                     user_cache['payload'] = payload
#                     token_cache[param] = user_cache
#             except Exception as auth_exe:
#                 auth_log.error(f'Ping SSO validation failed, error: {str(auth_exe)}', extra=context_vars.get())
#         if not payload and settings.ENABLE_JWT:
#             try:
#                 payload = await verify_jwt(request, param)
#             except Exception as auth_exe:
#                 auth_log.error(f'JWT validation failed, error: {str(auth_exe)}', extra=context_vars.get())
#         if payload:
#             request.state.security_context = payload
#             context = context_vars.get()
#             context['userid'] = payload.get('userid') or payload.get('username') or payload.get('userID') or payload.get('client_id')
#             context['email'] = payload.get('email', '')
#             context_vars.set(context)
#             auth_log.info(f"User Validation Successful, time taken: {time.time()-start_ts}", extra=context_vars.get())
#             return await call_next(request)
#     except Exception as auth_exe:
#         auth_log.exception(f'User validation failed, error: {str(auth_exe)}', extra=context_vars.get())
#     return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': 'Invalid Token'})


@app.middleware("http")
async def validate_authenticity(request: Request, call_next):
    """Middleware to validate JWT token, but skip for token generation"""
    # Skip preflight requests
    if request.method == "OPTIONS":
        return await call_next(request)
    # Skip token authentication for login and signup
    if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
        return await call_next(request)
    if request.url.path.startswith("/login") or request.url.path.startswith("/signup"):
        return await call_next(request)
    if request.url.path.startswith("/refresh-token"):  # Skip token authentication for /refresh-token as well
        return await call_next(request)
    if request.url.path.startswith("/forgot-password"):  # Skip token authentication for /forgot-password as well
        return await call_next(request)
    if request.url.path.startswith("/reset-password"):  # Skip token authentication for /reset-password as well
        return await call_next(request)

    authorization: str = request.headers.get('Authorization', '')
    if not authorization:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized, No/Invalid Bearer Token Passed"})
    schema, param = AuthUtil.get_authorization_scheme_param(authorization)

    if not authorization or schema.lower() != 'bearer':
        return JSONResponse(status_code=403, content={'detail': 'Unauthorized, No/Invalid Bearer Token Passed'})

    try:
        payload = await verify_jwt(request, param)
        request.state.security_context = payload
        return await call_next(request)
    except Exception:
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
        return JSONResponse(status_code=401, content={'detail': 'Unauthorized token'}, headers=headers)
    

        
async def get_query_with_mariadb_pool(request, pool, query, resp_type="dict"):
    try:
        conn = await pool.acquire()
        async with conn.cursor() as cur:
            await cur.execute(query)
            app_log.info(f"Query Executed Successfully: {query}")
            data = await cur.fetchall()
            col = [desc[0] for desc in cur.description]
            if resp_type == "df":
                data = pd.DataFrame(data, columns=col)
            elif resp_type == "dict":
                data = [dict(zip(col, row)) for row in data]
    except Exception as e:
        app_log.error(f"Query execution failed: {str(e)}")
        raise e
    await pool.release(conn)
    return data

async def update_query_with_mariadb_pool(request, pool, query):
    try:
        conn = await pool.acquire()
        async with conn.cursor() as cur:
            await cur.execute(query)
            await conn.commit()
            app_log.info(f"Update Query Executed Successfully: {query}")
    except Exception as e:
        app_log.error(f"Update Query execution failed: {str(e)}")
        raise e
    await pool.release(conn)
    return "Update Successful!"

async def insert_query_with_mariadb_pool(request, pool, query):
    try:
        conn = await pool.acquire()
        async with conn.cursor() as cur:
            await cur.execute(query)
            await conn.commit()
            last_insert_id = cur.lastrowid
            app_log.info(f"Data Inserted with ID: {last_insert_id}")
    except Exception as e:
        app_log.error(f"Insert Query execution failed: {str(e)}")
        raise e
    await pool.release(conn)
    return "Data Inserted Successfully!"

# Query Functions
async def get_query_with_pool(request, pool, query, resp_type="dict"):
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query)
                app_log.info(f"Query Executed Successfully: {query}")
                data = await cur.fetchall()
                col = cur._columns
                if resp_type == "df":
                    data = pd.DataFrame(data, columns=col)
                elif resp_type == "dict":
                    data = [dict(zip(col, row)) for row in data]
    except Exception as e:
        app_log.error(f"Query execution failed: {str(e)}")
        raise e
    return data

async def insert_query_with_pool(request, pool, query, data):
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.executemany(query, data)
                app_log.info(f"Insert Query Executed Successfully: {query}")
    except Exception as e:
        app_log.error(f"Insert Query execution failed: {str(e)}")
        raise e
    return "Data Inserted Successfully !!"

# Custom Middleware for Logging Request Details
class RequestContextLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            start_time = time.time()
            context = context_vars.get()
            context.update({
                'uuid': str(uuid.uuid1()),
                'method': request.method,
                'url': str(request.url),
                'host': socket.gethostname(),
                'service_name': args.service
            })
            #context.update({k: str(v) for k, v in request.headers.items()})
            context_vars.set(context)
            app_log.info(f"Processing request: {request.url.path}")
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            return response
        except Exception as e:
            app_log.exception(f"Error processing request: {str(e)}")
            return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

# Adding Middleware
app.add_middleware(RequestContextLogMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom Route Wrapper
class CustomRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()
        async def custom_route_handler(request: Request) -> Response:
            context = context_vars.get()
            app_log.info(f"Custom Routing: {request.url.path}")
            setattr(request, 'context', context)
            return await original_route_handler(request)
        return custom_route_handler
