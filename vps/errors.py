from __future__ import annotations
from typing import *
from logger import Logger, Level

logger = Logger(__name__)

def report_error(error: Error) -> None:
    # Here we can keep track of what errors are thrown and how often they are thrown
    logger.log(Level.WARNING, f"{error.code}: {error.message}")

class Error(Exception):
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
    def __init__(self, code: str, message: str) -> None:
        super().__init__(code, message=message)

class LanguageNotSupportedError(GenerationError):
    def __init__(self) -> None:
        super().__init__("LANGUAGE_NOT_SUPPORTED", "language is not supported")

class EmptyInputError(GenerationError):
    def __init__(self) -> None:
        super().__init__("EMPTY_INPUT", "input cannot be empty")

# Token validation and limiting
class TokenError(Error):
    def __init__(self, token: str, code: str, message: str) -> None:
        super().__init__(code, message=message)
        self.token = token

class TokenInvalidError(TokenError):
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_INVALID", f"token \"{token}\" is invalid")

class TokenDisabledError(TokenError):
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_DISABLED", f"token \"{token}\" has been disabled")

class ApiLimitExceededError(TokenError):
    def __init__(self, token: str) -> None:
        super().__init__(token, "API_LIMIT_EXCEEDED", f"token \"{token}\" has exceeded the api limit")

class TokenAlreadyExistsError(TokenError):
    def __init__(self, token: str) -> None:
        super().__init__(token, "TOKEN_ALREADY_EXISTS", f"token \"{token}\" already exists")

# Misc errors
class EmailAlreadyUsed(Error):
    def __init__(self, email: str) -> None:
        super().__init__("EMAIL_ALREADY_USED", f"email \"{email}\" has already been used")