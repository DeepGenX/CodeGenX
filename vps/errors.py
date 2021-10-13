from __future__ import annotations
from typing import *
from logger import Logger, Level

logger = Logger(__name__)

def report_error(error: Error) -> None:
    # Here we can keep track of what errors are thrown and how often they are thrown
    logger.log(Level.WARNING, f"{error.code}: {error.message}")

class Error(Exception):
    "Baseclass for all custom errors, has a code and a message."
    
    def __init__(self, code: str, message: str) -> None:
        self.code = code

        self.message = message.capitalize()

        if not self.message.endswith("."):
            self.message += "."

        super().__init__(self.message)

        report_error(self)
    
    def get_dict(self) -> dict:
        return {"code": self.code, "message": self.message}

# Code generation
class GenerationError(Error):
    "Baseclass for all generation related errors."
    
    def __init__(self, code: str, message: str) -> None:
        super().__init__(code, message=message)

class LanguageNotSupportedError(GenerationError):
    "Gets raised when value of language in the generation request is not in the list of supported languages."
    
    def __init__(self) -> None:
        super().__init__("LANGUAGE_NOT_SUPPORTED", "language is not supported")

class EmptyInputError(GenerationError):
    "Gets raised when the value of input in the generation request is empty."
    
    def __init__(self) -> None:
        super().__init__("EMPTY_INPUT", "input cannot be empty")

# Token validation and limiting
class TokenError(Error):
    "Baseclass for all token authorization related errors."
    
    def __init__(self, token: str, code: str, message: str) -> None:
        super().__init__(code, message=message)
        self.token = token

class TokenInvalidError(TokenError):
    "Gets raised when the value of token in the generation request is not a valid token."
    
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_INVALID", f"token \"{token}\" is invalid")

class TokenDisabledError(TokenError):
    "Gets raised when the value of token in the generation request is a disabled token."
    
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_DISABLED", f"token \"{token}\" has been disabled")

class ApiLimitExceededError(TokenError):
    "Gets raised when the value of token in the generation request has exceeded the api limit."
    
    def __init__(self, token: str) -> None:
        super().__init__(token, "API_LIMIT_EXCEEDED", f"token \"{token}\" has exceeded the api limit")

class TokenAlreadyExistsError(TokenError):
    "Gets raised when trying to create a token for an email that already has a token mapped to it."
    
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_ALREADY_EXISTS", f"token \"{token}\" already exists")

# Email errors
class EmailError(Error):
    "Baseclass for all email related errors."
    
    def __init__(self, email: str, code: str, message: str) -> None:
        super().__init__(code, message)
        self.email = email

class EmailAlreadyUsed(EmailError):
    "Gets raised when an email has already been used to create a token."
    
    def __init__(self, email: str) -> None:
        super().__init__(email, "EMAIL_ALREADY_USED", f"email \"{email}\" has already been used")

class EmailVerificationAlreadySent(EmailError):
    "Gets raised when a verification email has already been sent to a certain address."
    
    def __init__(self, email: str) -> None:
        super().__init__(email, "EMAIL_VERIFICATION_ALREADY_SENT", f"a verification email has already been sent to \"{email}\"")

class EmailAddressInvalid(EmailError):
    "Gets raised when an email address is not valid."
    
    def __init__(self, email: str) -> None:
        super().__init__(email, "EMAIL_ADDRESS_INVALID", f"email address \"{email}\" is not valid")

# Verification errors
class VerificationError(Error):
    "Baseclass for all verification related errors."
    
    def __init__(self, verification_code: str, code: str, message: str) -> None:
        super().__init__(code, message)
        self.verification_code = verification_code

class InvalidVerificationCode(VerificationError):
    "Gets raised when an invalid verification code is used."
    
    def __init__(self, verification_code: str) -> None:
        super().__init__(verification_code, "INVALID_VERIFICATION_CODE", f"verification code \"{verification_code}\" is not valid")

# Misc errors
class RegistrationNotAllowed(Error):
    "Gets raised when a new user tries to register while registering is disabled."
    
    def __init__(self) -> None:
        super().__init__("REGISTRATION_NOT_ALLOWED", "registration of new accounts is currently disabled")
