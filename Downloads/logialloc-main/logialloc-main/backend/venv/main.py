from fastapi import FastAPI, UploadFile, File
import pandas as pd
import os

from optimizer import optimize_routes
from ml_model import predict_cost

app = FastAPI()

UPLOAD_FOLDER = "uploads"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Read CSV or XLSX
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_path)

    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(file_path)

    else:
        return {"error": "Unsupported file"}

    routes = optimize_routes(df)

    cost_prediction = predict_cost(df)

    return {
        "optimized_routes": routes,
        "predicted_cost": cost_prediction
    }