import os
from mistralai.client import Mistral

api_key = os.environ.get("MISTRAL_API_KEY", "")
model = os.environ.get("MISTRAL_MODEL", "mistral-medium-latest")

if not api_key:
    print("Please set MISTRAL_API_KEY environment variable.")
    exit(1)

client = Mistral(api_key=api_key)

chat_response = client.chat.complete(
    model=model,
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?",
        },
        {
            "role": "assistant",
            "content": "The Capital of France is **Paris**.",
        },
        {
            "role": "user",
            "content": "Translate that to French.",
        },
    ],
)

print(chat_response.choices[0].message.content)
