from script_command import ScriptCommand

class Halt(ScriptCommand):

    def __init__(self):
        self.name="halt"
        self.help_message="used to stop the application on the specified machine"
        self.choices=["prod", "jenkins", "vm", "all"]
        self.argument = {"dest": "selection", "nargs": "+", "type": str, "metavar": "machine/s", "help": "prod|jenkins|vm|all"}

    def command(self, *args: str) -> None:
        print("Not Yet Implemented!")