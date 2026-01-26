from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pathlib import Path

CONFIG_DIR = Path(__file__).resolve().parent
MODULES_DIR = CONFIG_DIR.parent
BACKEND_DIR = MODULES_DIR.parent
ROOT = BACKEND_DIR.parent

ENV_FILE_PATH = ROOT / '.env'

class LLMSettings(BaseSettings):
    """
    LLM Module configuration.
    Only includes settings relevant to LLM operations
    """
    model_config = SettingsConfigDict(
        env_file = ENV_FILE_PATH,
        env_file_encoding='utf-8',
        case_sensitive = False,
        extra='ignore'
    )

    API_PREFIX: str = "/api"
    DEBUG: bool = False

    ALLOWED_ORIGINS: str

    GEMINI_API_KEY: str

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []
    
llm_settings = LLMSettings()