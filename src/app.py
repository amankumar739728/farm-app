import uvicorn
from utils.utils import args
from common.servicename_app import app
from routes import servicename_router,auction_router

# Include the router
app.include_router(servicename_router.router)
app.include_router(auction_router.router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(args.port))