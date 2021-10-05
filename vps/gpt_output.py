import requests

# Initialize model
...

def get_output(input: str, max_length: int, temperature: float, top_p: float):
    "Send a request to the api to generate a response for the given context."

    payload = {
        "context": input,
        "token_max_length": max_length,
        "temperature": temperature,
        "top_p": top_p,
        "stop_sequence": "A:"
    }

    response = requests.post("http://api.vicgalle.net:5000/generate", params=payload).json()

    return response["text"]