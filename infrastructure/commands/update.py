from common import HOST, ssh_connect, ssh_disconnect, ssh_commands
from script_command import ScriptCommand

class Update(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name="update"
        self.help_message="used to pull and update the specified machine with the latest changes"

        self.choices=["vm_branch", "vm_docker"]

        self.argument = {
            "dest": "selection",
            "nargs": "+",
            "type": str,
            "metavar": "machine/s",
            "help": "vm_branch {followed by the branch name} | vm_docker"
        }

    def command(self, *args: str) -> None:
        for arg in args:
            if arg == "vm_branch":
                ssh_connect(HOST, 'main')
                self.vm_update_codebase(args[1])
                ssh_disconnect()
            if arg == "vm_docker":
                ssh_connect(HOST, 'main')
                self.vm_update_docker()
                ssh_disconnect()

    def vm_update_codebase(self, branch_name: str) -> None:
        script = [
            'cd /home/vagrant/bac',
            f"git checkout {branch_name}",
            'git pull origin',
            'exit',
        ] #'exit'
        ssh_commands(script, 3.0)

    def vm_update_docker(self) -> None:
        script = [
            'sudo docker compose -f /home/vagrant/bac/infrastructure/deployment/docker-compose.yml down -v --rmi all',
            'sudo docker compose -f /home/vagrant/bac/infrastructure/deployment/docker-compose.yml build --no-cache',
            'sudo docker compose -f /home/vagrant/bac/infrastructure/deployment/docker-compose.yml up --pull always --force-recreate',
        ] #'exit'
        ssh_commands(script, 300.0)
