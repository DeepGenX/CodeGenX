import json
import os
import re
import secrets
import smtplib
import threading
import time
from typing import *

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

import errors
from gpt_output import *
from logger import Level, Logger
from text_processing import *
from token_manager import TokenManager

ALLOW_REGISTRATION = True
VERIFY_TIME = 15 * 60 # 15 Minutes

email_server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
email_server.ehlo()
email_server.login(os.environ.get("CODEGENX_EMAIL_ADDRESS"), os.environ.get("CODEGENX_EMAIL_PASSWORD"))

class GenerationRequest(BaseModel):
    token: str
    language: str
    input: str
    max_length: Optional[int] = 512
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 0.9

class RegistrationRequest(BaseModel):
    email: str

app = FastAPI()
logger = Logger(__name__)

def create_response(success: bool, error_or_message: Optional[Union[errors.Error, str]] = None) -> dict:
    if success:
        return {"success": True, "message": error_or_message}
    return {"success": False, "error": error_or_message.get_dict()}

def generate_output(processed_input: str, parameters: dict, request: GenerationRequest) -> Tuple[int, List[str]]:
    output = get_output(processed_input, parameters["max_length"], parameters["temperature"], parameters["top_p"])

    if output.startswith("Sorry, the public API is limited to around 20 queries per every 30 minutes."): # TODO: Remove this when our own model is deployed
        return

    processed_output = process_output(request.input, output, request.language)

    processed_blocks = process_blocks(processed_output, count_leading_spaces(request.input.splitlines()[-1]), COMMENTS[request.language])
    
    return processed_blocks

sent_emails = {}
def send_email(address: str, subject: str, content: str) -> None:
    now = time.time()
    if address in sent_emails:
        if now - sent_emails[address] < VERIFY_TIME:
            raise errors.EmailVerificationAlreadySent(address)
    sent_emails[address] = now

    email_server.sendmail(email_server.user, address, f"Subject: {subject}\n\n{content}")

verification_codes = {}
def create_verification_url(email: str) -> str:
    code = secrets.token_hex(32)
    verification_codes[code] = email
    threading.Thread(target=delete_verification_code, args=(code,), daemon=True).start()
    logger.log(Level.INFO, f"Created verification code \"{code}\" for email \"{email}\".")
    return f"http://{config['host']}:{config['port']}/verify?code={code}"

def delete_verification_code(code: str) -> None:
    time.sleep(VERIFY_TIME)
    if code in verification_codes:
        verification_codes.pop(code)
        logger.log(Level.INFO, f"Verification code \"{code}\" timed out.")

def cooldown_loop() -> None:
    while True:
        time.sleep(60)
        token_manager.update_all_cooldowns()

@app.post("/generate")
async def generate(request: GenerationRequest):
    # Validate the token
    error = token_manager.validate_token(request.token)
    if error != None:
        return create_response(False, error)
    
    # If the api limit has been exceeded, return an error message
    if token_manager.cooldowns[request.token] == 0:
        return create_response(False, errors.ApiLimitExceededError(request.token))

    # Validating the parameters and setting them to default values if they're empty
    parameters = {
        "max_length": request.max_length,
        "temperature": request.temperature,
        "top_p": request.top_p
    }
    
    # Checking if the language is supported
    if request.language not in COMMENTS:
        return create_response(False, errors.LanguageNotSupportedError())
    
    # Checking if the input is not empty
    if len(request.input.strip()) == 0:
        return create_response(False, errors.EmptyInputError())

    # Loggin the request
    logger.log(Level.INFO, {"input": ("... " + request.input.splitlines()[-1].strip()) if len(request.input.splitlines()) > 0 else "...", "max_length": parameters["max_length"], "temperature": parameters["temperature"], "top_p": parameters["top_p"]})

    # Processing the input & output
    processed_input = process_input(request.input, request.language)

    # Generate the output
    output = generate_output(processed_input, parameters, request)

    # Decrementing the amount of requests the user can make this minute
    if token_manager.cooldowns[request.token] > 0:
        token_manager.cooldowns[request.token] -= 1

    # Return a response
    return create_response(True, output)

@app.post("/register")
async def register(request: RegistrationRequest):
    # Check if the given email is a valid email
    if not re.match(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", request.email):
        return create_response(False, errors.EmailAddressInvalid(request.email))

    # If registration is disabled
    if not ALLOW_REGISTRATION:
        return create_response(False, errors.RegistrationNotAllowed())

    # If the email has already been used
    if token_manager.get_token(request.email) != None:
        return create_response(False, errors.EmailAlreadyUsed(request.email))
    
    # Send a verification email
    try:
        send_email(request.email, "Verify your email address", f"Click the following url to verify your email address: {create_verification_url(request.email)}.\n\nIf you did not request this email you can just ignore it.")
    except errors.EmailVerificationAlreadySent as e:
        return create_response(False, e)

    return create_response(True, "Please verify your email.")

@app.get("/verify/")
async def verify(code: str):
    # If the verification code isn't valid
    if code not in verification_codes:
        return create_response(False, errors.InvalidVerificationCode(code))
    email = verification_codes.pop(code)

    logger.log(Level.INFO, f"Verified email \"{email}\" using verification code \"{code}\".")

    return token_manager.add_token(email)

if __name__ == "__main__":
    # Reading the config file
    with open("config.json", "r") as f:
        config = json.load(f)

    # Creating a token manager
    token_manager = TokenManager(os.environ.get("CODEGENX_TOKEN_FILE"))

    threading.Thread(target=cooldown_loop, daemon=True).start()

    uvicorn.run(app, host=config["host"], port=config["port"], log_level="info")