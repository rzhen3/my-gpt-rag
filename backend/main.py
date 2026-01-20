from fastapi import FastAPI

# "uvicorn main:app" where 'main' corresponds to file, 'app' corresponds to variable name
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "health"}