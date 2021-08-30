from typing import *


class Error:
    def __init__(self, code: str, message: Optional[str] = None) -> None:
        self.code = code

        globals()[self.code] = self

        if message == None:
            self.message = ""
            return

        self.message = message.capitalize()

        if not self.message.endswith("."):
            self.message += "."
    
    def get_dict(self) -> dict:
        return {"code": self.code, "message": self.message}

# Code generation
Error("LANGUAGE_NOT_SUPPORTED", "language is not supported")
Error("EMPTY_INPUT", "input cannot be empty")

# Token validation
Error("TOKEN_INVALID", "token is invalid")
Error("TOKEN_DISABLED", "token has been disabled")

# Misc
Error("NONE")