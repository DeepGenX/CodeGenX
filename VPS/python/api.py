import errors
import json
import threading
import time
from typing import *

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from gpt_output import *
from logger import Level, Logger
from text_processing import *


class Request(BaseModel):
    language: str
    input: str
    max_length: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None

app = FastAPI()
logger = Logger()

config = {}
def update_config() -> None:
    global config

    while True:
        try:
            with open("config.json", "r") as f:
                new = json.load(f)
                if config != new:
                    config = new
            
            time.sleep(1)
        except:
            logger.log(Level.WARNING, "Failed to read config file.")

            time.sleep(3)

def create_response(success: bool, error_or_output: Union[str, dict]) -> dict:
    if success:
        return {"success": True, "output": error_or_output}
    return {"success": False, "error": error_or_output.get_dict()}

@app.post("/generate")
async def generate(request: Request):
    # Validating the parameters and setting them to default values if they're empty
    parameters = {
        "max_length": request.max_length,
        "temperature": request.temperature,
        "top_p": request.top_p
    }

    for parameter in parameters:
        if parameters[parameter] == None:
            parameters[parameter] = config["default_parameters"][parameter]
    
    # Checking if the language is supported
    if request.language not in COMMENTS:
        return create_response(False, errors.LANGUAGE_NOT_SUPPORTED)
    
    # Checking if the input is not empty
    if len(request.input.strip()) == 0:
        return create_response(False, errors.EMPTY_INPUT)

    # Loggin the request
    logger.log(Level.INFO, {"input": ("... " + request.input.splitlines()[-1].strip()) if len(request.input.splitlines()) > 0 else "...", "max_length": parameters["max_length"], "temperature": parameters["temperature"], "top_p": parameters["top_p"]})

    # Processing the input & output
    processed_input = process_input(request.input, request.language)
    output = get_output(processed_input, parameters["max_length"], parameters["temperature"], parameters["top_p"])
    processed_output = process_output(request.input, output, request.language)
    processed_blocks = process_blocks(processed_output, count_leading_spaces(request.input.splitlines()[-1]), COMMENTS[request.language])

    # Return a response
    return create_response(True, processed_blocks)

if __name__ == "__main__":
    # Starting a thread to update the config when it changes
    thread = threading.Thread(target=update_config)
    thread.start()

    # Reading the config file
    with open("config.json", "r") as f:
        config = json.load(f)

    uvicorn.run(app, host=config["host"], port=config["port"], log_level="info")