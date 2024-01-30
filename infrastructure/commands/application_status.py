from script_command import ScriptCommand

class ApplicationStatus(ScriptCommand):

   def __init__(self):
        self.name = "application_status"
        self.help_message = "used to check the application's status of the specified machine"
        self.choices = ["prod", "jenkins", "vm", "all"]
        self.argument = {"dest": "selection", "nargs": "+", "type": str, "metavar": "machine/s", "help": "prod|jenkins|vm|all"}
   
   def command(self, *args: str) -> None:
       print("Not Yet Implemented!")