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

    def check_arg(self, arg: str):
        if arg not in self.choices:
            print(f"The following argument is not supported: {arg}\
                  \nPlease Select from the following {self.choices}")
