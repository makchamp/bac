from script_command import ScriptCommand

class ApplicationStatus(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name = "application_status"
        self.help_message = "used to check the application's status of the specified machine"

        self.choices = [
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
