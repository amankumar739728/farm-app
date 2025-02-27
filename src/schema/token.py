import jwt
import datetime

# Define your secret key (Must match the one in your FastAPI app)
SECRET_KEY = "kqpOBfns5uzo4LvzHyirUeLtFkp0aWnN"
ALGORITHM = "HS256"

# Create a function to generate JWT tokens
def generate_jwt(username: str):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    payload = {
        "username": username,
        "exp": expiration
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

# Generate a token for testing
test_token = generate_jwt("testuser")
print("Generated Token:", test_token)
