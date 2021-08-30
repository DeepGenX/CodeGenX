from typing import *

class Error:
    def __init__(self, message: Optional[str]) -> None:
        self.message = message.capitalize()

        if not self.message.endswith("."):
            self.message += "."

# Code generation
LANGUAGE_NOT_SUPPORTED = Error("language is not supported")

# Token validation
TOKEN_INVALID = Error("token is invalid")
TOKEN_DISABLED = Error("token has been disabled")

# Misc
NONE = Error(None)