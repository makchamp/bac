from common import HOST, ssh_connect, ssh_commands, ssh_disconnect
from script_command import ScriptCommand

class Launch(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name="launch"
        self.help_message="used to launch the application on the specified machine"

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
        for arg in args:
            if arg in ("local_vm", "all"):
                ssh_connect(HOST, 'main')
                session_secret = input("Please Enter the session secret: ")
                self.run_application_locally(session_secret)
                ssh_disconnect()
            if arg in ("cloud_vm", "all"):
                ssh_connect(HOST, 'main')
                self.run_deployment_playbook()
                ssh_disconnect()
            self.check_arg(arg)

    def run_application_locally(self, session_secret: str) -> None:
        script = [
            'cd /home/vagrant/bac/infrastructure',
            'git pull origin',
            'python3 launch_script.py environment setup_env',
            '',
            '',
            '',
            HOST,
            session_secret,
            'cd deployment',
            'sudo docker compose up'
        ] #'exit'
        ssh_commands(script, 5.0)

    def run_deployment_playbook(self) -> None:
        with open('deployment/instance_ip.txt', 'r') as file:
            static_ip = file.read().rstrip()
        launch_playbook = 'ANSIBLE_FORCE_COLOR=True ansible-playbook --extra-vars \'{"aws_server":"X.X.X.X", "key1":"/home/vagrant/key"}\' /home/vagrant/bac/infrastructure/deployment/deployment.yaml -i /home/vagrant/bac/infrastructure/deployment/hosts.yaml'
        ansible_playbook_command = launch_playbook.replace('X.X.X.X', static_ip)

        script = [
            'cd /home/vagrant/bac',
            'git pull origin',
            ansible_playbook_command
        ] #'exit'

        ssh_commands(script, 10.0)
