import colorama
import time
from common import *
from script_command import ScriptCommand

class Launch(ScriptCommand):

    def __init__(self):
        self.name="launch"
        self.help_message="used to launch the application on the specified machine"
        self.choices=["prod", "vm", "all"]
        self.argument = {"dest": "selection", "nargs": "+", "type": str, "metavar": "machine/s", "help": "prod|vm|all"}

    def command(self, *args: str) -> None:
        for arg in args:
            if arg == "vm" or arg == "all":
                ssh_connect(HOST, 'main')
                session_secret = input("Please Enter the session secret: ")
                self.run_application_locally(session_secret)
                ssh_disconnect()
            if arg == "prod" or arg == "all":
                ssh_connect(HOST, 'main')
                self.run_deployment_playbook()
                ssh_disconnect()

    def run_application_locally(self, session_secret: str) -> None:
        script = [
            'cd /home/vagrant/bac/infrastructure',
            'git pull origin',
            'python3 launchScript.py environment setup_env',
            '',
            '',
            '',
            HOST,
            session_secret,
            'exit'
        ]
        ssh_commands(script, 5.0)

    def run_deployment_playbook(self) -> None:
        with open('deployment/instance_ip.txt', 'r') as file:
            static_ip = file.read().rstrip()
        launch_playbook = 'ANSIBLE_FORCE_COLOR=True ansible-playbook --extra-vars \'{"aws_server":"X.X.X.X", "key1":"/home/vagrant/key"}\' /home/vagrant/bac/infrastructure/deployment/deployment.yaml -i /home/vagrant/bac/infrastructure/deployment/hosts.yaml'
        ansible_playbook_command = launch_playbook.replace('X.X.X.X', static_ip)

        script = [
            'cd /home/vagrant/bac',
            'git pull origin',
            ansible_playbook_command,
            'exit'
        ]

        ssh_commands(script, 30.0)