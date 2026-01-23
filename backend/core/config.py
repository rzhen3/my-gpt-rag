from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

CONFIG_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CONFIG_DIR.parent
ROOT = BACKEND_DIR.parent

ENV_FILE_PATH = ROOT / '.env'


class Settings(BaseSettings):

    DATABASE_URL: str

    model_config = SettingsConfigDict(
        env_file = ENV_FILE_PATH,
        env_file_encoding='utf-8',
        case_sensitive = False,
        extra='ignore'
    )

print(f"Loading .env from: {ENV_FILE_PATH}")
print(f".env exists: {ENV_FILE_PATH.exists()}")

settings = Settings()