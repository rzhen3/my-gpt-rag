from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from modules.llm.api import router as llm_router
import logging

# configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# "uvicorn main:app" where 'main' corresponds to file, 'app' corresponds to variable name
app = FastAPI(
    title = 'my-gpt-rag',
    description = 'prompting environment project',
    version = '0.1.0',
    docs_url = '/docs',
    redoc_url = '/redoc',
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# add LLM module router
app.include_router(llm_router, prefix="/api/llm", tags=["llm"])

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "health"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run('main:app', port=8000, reload = True)