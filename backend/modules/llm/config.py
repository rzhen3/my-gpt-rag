from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class LLMSettings(BaseSettings):
    """
    LLM Module configuration.
    Only includes settings relevant to LLM operations
    """
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding='utf-8',
        case_sensitive = False
    )

    API_PREFIX: str = "/api"
    DEBUG: bool = False

    DATABASE_URL: str

    ALLOWED_ORIGINS: str = ""

    OPENAI_API_KEY: str

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []
    
llm_settings = LLMSettings()