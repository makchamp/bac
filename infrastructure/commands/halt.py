from script_command import ScriptCommand

class Halt(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name="halt"
        self.help_message="used to stop the application on the specified machine"

        self.choices=[
            "cloud_vm",
            "local_vm",
            "all"
        ]

        self.argument = {
            "dest": "selection",
            "nargs": "+",
            "type": str,
            "metavar": "machine/s",
            "help": "cloud_vm|local_vm|all"
        }

    def command(self, *args: str) -> None:
        print("Not Yet Implemented!")
