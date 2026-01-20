from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# "uvicorn main:app" where 'main' corresponds to file, 'app' corresponds to variable name
app = FastAPI(
    title = 'my-gpt-rag',
    description = 'prompting environment project',
    version = '0.1.0',
    docs_url = '/docs',
    redoc_url = '/redoc',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)



@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "health"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run('main:app', port=8000, reload = True)