import colorama
from common import *
from script_command import ScriptCommand

class Update(ScriptCommand):

    def __init__(self):
        self.name="update"
        self.help_message="used to pull and update the specified machine with the latest changes"
        self.choices=["vm_branch, vm_docker"]
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
        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('cd /home/vagrant/bac' + '\n')
        stdin.write('git checkout ' + branch_name + '\n')
        stdin.write('git pull origin' + '\n')
        stdin.write('exit' + '\n')
        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()
    
    def vm_update_docker(self) -> None:
        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('sudo docker compose -f /home/vagrant/bac/infrastructure/development/docker-compose.yml down -v --rmi all' + '\n')
        stdin.write('sudo docker compose -f /home/vagrant/bac/infrastructure/development/docker-compose.yml build --no-cache' + '\n')
        stdin.write('sudo docker compose -f /home/vagrant/bac/infrastructure/development/docker-compose.yml up --pull always --force-recreate' + '\n')

        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()