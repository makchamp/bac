import colorama
import time
from common import *
from script_command import ScriptCommand

class Launch(ScriptCommand):

    def __init__(self):
        self.name="launch"
        self.help_message="used to launch the application on the specified machine"
        self.choices=["prod", "jenkins", "vm", "all"]
        self.argument = {"dest": "selection", "nargs": "+", "type": str, "metavar": "machine/s", "help": "prod|jenkins|vm|all"}

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
            if arg == "jenkins" or arg == "all":
                ssh_connect(HOST, 'main')
                self.run_jenkins_playbook()
                ssh_disconnect()

    def enter_timed_commands(self, stdin: paramiko.ChannelFile, command: str) -> None:
        stdin.write(f"{command}\n")
        stdin.flush()
        time.sleep(3)

    def run_application_locally(self, session_secret: str) -> None:
        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('cd /home/vagrant/bac/infrastructure' + '\n')
        stdin.write('git pull origin' + '\n')
        self.enter_timed_commands(stdin, 'python3 launchScript.py -d')
        self.enter_timed_commands(stdin, '')
        self.enter_timed_commands(stdin, '')
        self.enter_timed_commands(stdin, '')
        self.enter_timed_commands(stdin, HOST)
        self.enter_timed_commands(stdin, session_secret)
        stdin.write('exit' + '\n')
        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()

    def run_jenkins_playbook(self) -> None:
        with open('development/jenkins_ip.txt', 'r') as file:
            static_ip = file.read().rstrip()
        launch_playbook = 'ANSIBLE_FORCE_COLOR=True ansible-playbook --extra-vars \'{"aws_server":"X.X.X.X", "key1":"/home/vagrant/jenkins_key"}\' /home/vagrant/bac/infrastructure/development/jenkins.yaml -i /home/vagrant/bac/infrastructure/development/hosts.yaml'
        ansible_playbook_command = launch_playbook.replace('X.X.X.X', static_ip)

        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('cd /home/vagrant/bac' + '\n')
        stdin.write('git pull origin' + '\n')
        stdin.write(ansible_playbook_command + '\n')
        stdin.write('exit' + '\n')
        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()

    def run_deployment_playbook(self) -> None:
        with open('deployment/instance_ip.txt', 'r') as file:
            static_ip = file.read().rstrip()
        launch_playbook = 'ANSIBLE_FORCE_COLOR=True ansible-playbook --extra-vars \'{"aws_server":"X.X.X.X", "key1":"/home/vagrant/key"}\' /home/vagrant/bac/infrastructure/deployment/deployment.yaml -i /home/vagrant/bac/infrastructure/deployment/hosts.yaml'
        ansible_playbook_command = launch_playbook.replace('X.X.X.X', static_ip)

        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('cd /home/vagrant/bac' + '\n')
        stdin.write('git pull origin' + '\n')
        stdin.write(ansible_playbook_command + '\n')
        stdin.write('exit' + '\n')
        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()