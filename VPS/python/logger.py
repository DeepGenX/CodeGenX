import datetime
from typing import *

class Level:
    SEVERE = 0
    WARNING = 1
    INFO = 2

    @staticmethod
    def to_string(level: int) -> str:
        return [
            "SEVERE",
            "WARNING",
            "INFO"
        ][level]

class Logger:
    def __init__(self, format: Optional[str] = "[{y}-{m}-{d}] [{H}:{M}:{S}]   [{level}] {message}") -> str:
        self.format = format
    
    def log(self, level: Level, message: str) -> None:
        now = datetime.datetime.now()
        
        print(self.format
        .replace("{y}", now.year)
        .replace("{m}", now.month)
        .replace("{d}", now.day)
        .replace("{H}", now.hour)
        .replace("{M}", now.minute)
        .replace("{S}", now.second)
        .replace("{level}", level)
        .replace("{message}", message)
        )