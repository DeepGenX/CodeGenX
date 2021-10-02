from token_manager import *

import json

# Reading the config file
with open("config.json", "r") as f:
    config = json.load(f)

# Creating a token manager
token_manager = TokenManager(config["token_path"])

print("Token Manager Shell")
print("===================")
while True:
    try:
        print(exec(input("> ")))
    except KeyboardInterrupt:
        exit()
    except Exception as e:
        print(e.message)