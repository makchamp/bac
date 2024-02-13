from abc import ABCMeta, abstractmethod

class ScriptCommand(metaclass=ABCMeta):
    def __init__(self):
        self.name: str
        self.help_message: str
        self.choices: list[str]
        self.argument = None

    @abstractmethod
    def command(self, *args: str):
        pass
