from google import genai
from google.genai import types
from .config import llm_settings

class GeminiClient:
    def __init__(self):
        self.client = genai.Client(api_key=llm_settings.GEMINI_API_KEY)
        self.model = "gemini-2.0-flash"

    async def generate_response(self, prompt: str)-> str:
        """
        simple generate response according to prompt with default seed.
        """
        try:
            response = self.client.models.generate_content(
                model = self.model,
                contents = prompt,
                config = types.GenerateContentConfig(
                    seed = 0
                )
            )

            return response.text
        
        except Exception as e:
            print(f"gemini error: {e}")
            raise Exception(f"Failed to generate response: {str(e)}")
        
gemini_client = GeminiClient()