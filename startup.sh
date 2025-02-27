#!/bin/bash

#uvicorn src.app:app --host 0.0.0.0 --port 8000 --reload

python src/app.py --port=9123 --service=servicename
