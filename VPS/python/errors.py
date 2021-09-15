from typing import *


class Error(Exception):
    def __init__(self, code: str, message: Optional[str] = None) -> None:
        self.code = code

        if message == None:
            self.message = ""
            return

        self.message = message.capitalize()

        if not self.message.endswith("."):
            self.message += "."

        super().__init__(self.message)
    
    def get_dict(self) -> dict:
        return {"code": self.code, "message": self.message}

# Code generation
LanguageNotSupportedError = Error("LANGUAGE_NOT_SUPPORTED", "language is not supported")
EmptyInputError = Error("EMPTY_INPUT", "input cannot be empty")

# Token validation
ApiLimitExceededError = Error("API_LIMIT_EXCEEDED", "you have exceeded the api limit")
TokenInvalidError = Error("TOKEN_INVALID", "token is invalid")
TokenDisabledError = Error("TOKEN_DISABLED", "token has been disabled")

# Misc
NoneError = Error("NONE")