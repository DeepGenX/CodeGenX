import datetime
from typing import *

from termcolor import colored


class Level:
    ERROR = 0
    WARNING = 1
    INFO = 2

    colors = [
        "red",
        "yellow",
        "green"
    ]

    @staticmethod
    def to_string(level: int) -> str:
        return [key for key in Level.__dict__][1:][level]

class Logger:
    def __init__(self, name: str, format: Optional[str] = "[{name}]  [{y}-{m}-{d}] [{H}:{M}:{S}]  [{level}]  ") -> str:
        self.name = name
        self.format = format
    
    def log(self, level: Level, message: str) -> None:
        now = datetime.datetime.now()
        
        print(colored(self.format
        .replace("{name}", self.name)
        .replace("{y}", str(now.year).zfill(4))
        .replace("{m}", str(now.month).zfill(2))
        .replace("{d}", str(now.day).zfill(2))
        .replace("{H}", str(now.hour).zfill(2))
        .replace("{M}", str(now.minute).zfill(2))
        .replace("{S}", str(now.second).zfill(2))
        .replace("{level}", Level.to_string(level))
        , Level.colors[level], attrs=["bold"]) + str(message))