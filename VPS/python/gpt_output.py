# To modify where we get the gpt output from change the get_output function, once we're running gpt locally we can change the function to run gpt instead of making a request to vic's api

import requests


# When editing this function, make sure not to change the parameters unless it is really needed
def get_output(input: str, max_length: int, temperature: float, top_p: float):
    "Send a request to the api to generate a response for the given context."

    payload = {
        "context": input,
        "token_max_length": max_length,
        "temperature": temperature,
        "top_p": top_p,
    }

    response = requests.post("http://api.vicgalle.net:5000/generate", params=payload).json()

    return response["text"]