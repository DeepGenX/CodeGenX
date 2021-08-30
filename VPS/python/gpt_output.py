# To modify where we get the gpt output from change the get_output function, once we're running gpt locally we can change the function to run gpt instead of making a request to vic's api

import requests

def get_output(context: str, max_length: int = 1024, temp: float = 1.2, top_p: float = 0.7):
    "Send a request to the api to generate a response for the given context."

    payload = {
        "context": context,
        "token_max_length": max_length,
        "temperature": temp,
        "top_p": top_p,
    }

    response = requests.post("http://api.vicgalle.net:5000/generate", params=payload).json()

    with open("raw_output.txt", "w") as f:
        f.write(response["text"])

    return response["text"]