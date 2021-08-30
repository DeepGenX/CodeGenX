from gpt_output import *
from text_processing *
from logger import Logger, Level
from typing import *

from fastapi import FastAPI
import json

app = FastAPI()
logger = Logger()

logger.log(Level.INFO, "Hey wasup")

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
            logger.log(logger.WARNING, "Failed to read config file")

            time.sleep(5
        
# Starting a thread to update the config when it changes
thread = threading.Thread(target=update_config)

@app.post("/generate")
async def generate(context: str, max_length: Optional[int] = None, temperature: Optional[float] = 1.22, top_p: Optional[float] = 0.94) -> str:
    # Validating the parameters and setting them to default values if they're empty
    parameters = {
        "max_length": max_length,
        "temperature": temperature,
        "top_p": top_p
    }

    for parameter in parameters:
        if parameter == None:
            parameters[parameter] = config["default_parameters"][]

    output = get_output(context, max_length, temperature, top_p)