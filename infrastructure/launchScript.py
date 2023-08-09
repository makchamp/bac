
import time
import colorama
import dotenv
import getopt
import paramiko
import re
import shutil
import sys
import traceback
import vagrant
import git
from paramiko import AuthenticationException, BadHostKeyException, SSHException
from python_terraform import Terraform, IsFlagged, IsNotFlagged

# Vagrant Variables
HOST = '192.168.33.223'
KEY_LOCATION = 'virtualbox/private_key'
TF_OUTPUT_OFFSET = 4

# SSH Variables
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# Script Variables
argument_possibilities = "prod|vm|both"
help_text = '''
    Options                  Arguments                          Descriptions
===================================================================================================
-h or --help:                                        used to display all commands and information
-t or --teardown:           {argument_possibilities}             used to tear down machine
-i or --initialize:         {argument_possibilities}             used to initialize machine
-l or --launch:             {argument_possibilities}             used to launch the application
-s or --status:             {argument_possibilities}             used to verify if the machine is running
-u or --update:                                      used to copy changes from last commit into their volumes
-d or --development:                                 used to setup .env files for local development
'''.format(argument_possibilities=f"{argument_possibilities}")

def fix_ansi(terminal_output: str) -> str:
    INITIAL = "^(b')"
    NEWLINE = r"\\r\\n'"
    STARTLINE = r"\\r"
    ESC = r"\\x1b"
    NEW_ESC = r"\033"
    return_string = re.sub(f"{INITIAL}|{NEWLINE}|{STARTLINE}", '', terminal_output)
    return_string = re.sub(ESC, NEW_ESC, return_string)
    return return_string

def format_tf_output(operation: str, output: tuple) -> str:
    match output[0]:
        case 0:
            return f"{operation} completed successfully"
        case 1:
            return f"{output[2]}"
        case 2:
            return f"{output[1]}"
        case _:
            return re.sub(r'(?m)^', ' ' * TF_OUTPUT_OFFSET, str(output))

def initialize_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.init(kwargs={"capture_output":True})
    print(format_tf_output("Initialization", output))
    output = deployment_machine.apply(skip_plan=True)
    print(format_tf_output("Creation", output))

def destroy_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.destroy(auto_approve=IsFlagged, force=IsNotFlagged)
    print(format_tf_output("Teardown", output))

def validate_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.plan()
    print(format_tf_output("Plan", output))

def initialize_virtual_machine(machine_name: str) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   local_virtual_machine.up(vm_name=machine_name)

def destroy_virtual_machine(machine_name: str) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   local_virtual_machine.destroy(vm_name=machine_name)

def validate_virtual_machine(machine_name: str) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   status = local_virtual_machine.status(vm_name=machine_name)
   for stat in status:
       print(stat)

def enter_timed_commands(stdin: paramiko.ChannelFile, command: str) -> None:
    stdin.write(f"{command}\n")
    stdin.flush()
    time.sleep(3)

def run_application_locally(session_secret: str) -> None:
    channel = ssh.invoke_shell()
    stdin = channel.makefile('wb')
    stdout = channel.makefile('rb')

    stdin.write('cd /home/vagrant/bac/infrastructure' + '\n')
    stdin.write('git pull origin' + '\n')
    enter_timed_commands(stdin, 'python3 launchScript.py -d')
    enter_timed_commands(stdin, '')
    enter_timed_commands(stdin, '')
    enter_timed_commands(stdin, '')
    enter_timed_commands(stdin, HOST)
    enter_timed_commands(stdin, session_secret)
    stdin.write('exit' + '\n')
    stdin.flush()

    colorama.init(convert=True, autoreset=True)
    lines = stdout.readlines()
    for line in lines:
        print(fix_ansi(str(line)))

    channel.close()

def run_playbook() -> None:
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

def ssh_connect(host: str=HOST, machine_name: str='default') -> None:
    try:
       print("creating connection")
       key = f"development/.vagrant/machines/{machine_name}/{KEY_LOCATION}"
       ssh_key = paramiko.RSAKey.from_private_key(open(key))
       ssh.connect(host, username='vagrant', pkey=ssh_key)
       print("Connected!")
    except (BadHostKeyException, AuthenticationException, SSHException) as e:
        print("[-] Listen failed: " + str(e))
        traceback.print_stack()
        sys.exit(1)
       
def ssh_disconnect() -> None:
    print("closing connection")
    ssh.close()
    print("closed")

def set_env_file(path: str, env_variables: dict[str, object]) -> None:
    
    env_file = dotenv.find_dotenv(path)
    dotenv.load_dotenv(env_file)

    for key in env_variables.keys():
        dotenv.set_key(env_file, key, env_variables[key])

def env_file_setup(session_secret: str, domain, client_port: int,
                    host_port: int, redis_port: int) -> None:
    
    shutil.copyfile('../client/.env.example', '../client/.env')

    client_variables = {
        "PORT": str(client_port),
        "REACT_APP_HOST_PORT": str(host_port),
        "GENERATE_SOURCEMAP": "false",
        "REACT_APP_HOST_PROTOCOL": "http",
        "REACT_APP_HOST_DOMAIN": domain
    }

    set_env_file('../client/.env', client_variables)

    shutil.copyfile('../server/.env.example', '../server/.env')

    host_variables = {
        "PORT": str(host_port),
        "CLIENT_PROTOCOL": "http",
        "CLIENT_DOMAIN": domain,
        "CLIENT_PORT": str(client_port),
        "REDIS_DOMAIN": "redis",
        "REDIS_PORT": str(redis_port),
        "SESSION_SECRET": session_secret
    }

    set_env_file('../server/.env', host_variables)

def script_execution(opts: list[tuple[str, str]], arg_options: list[str]) -> None:
    exit_code = 0
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print(help_text)
            sys.exit()
        elif opt in ("-t", "--teardown"):
            if arg == "vm" or arg == "both":
                destroy_virtual_machine('main')
            if arg == "prod" or arg == "both":
                destroy_deployment_server()
            if arg not in arg_options:
                print(f"The following argument is not accepted for the flag -t or --teardown: {arg}")
                exit_code = 2
        elif opt in ("-i", "--initialize"):
            if arg == "vm" or arg == "both":
                initialize_virtual_machine("main")
            if arg == "prod" or arg == "both":
                initialize_deployment_server()
            if arg not in arg_options:
                print(f"The following argument is not accepted for the flag -i or --initialize: {arg}")
                exit_code = 2
        elif opt in ("-l", "--launch"):
            if arg == "vm" or arg == "both":
                ssh_connect(HOST, 'main')
                session_secret = input("Please Enter the session secret: ")
                run_application_locally(session_secret)
                ssh_disconnect()
            if arg == "prod" or arg == "both":
                ssh_connect(HOST, 'main')
                run_playbook()
                ssh_disconnect()
            if arg not in arg_options:
                print(f"The following argument is not accepted for the flag -l or --launch: {arg}")
                exit_code = 2
        elif opt in ("-s", "--status"):
            if arg == "vm" or arg == "both":
                validate_virtual_machine('main')
            if arg == "prod" or arg == "both":
                validate_deployment_server()
            if arg not in arg_options:
                print(f"The following argument is not accepted for the flag -s or --status: {arg}")
                exit_code = 2
        elif opt in ("-u", "--update"):
            current_repo = git.Repo('../')
            current_branch = current_repo.active_branch
            head_commit = current_repo.commit(current_branch)
            origin_commit = current_repo.commit(f"origin/{current_branch}")
            diffy = current_repo.git.diff(f"{head_commit}..{origin_commit}", name_only=True)
            lines = diffy.splitlines()
            for line in lines:
                print(line)
                if (line.startswith("client/")):
                    file_name = line[len("client/")]
                    shutil.copyfile(f"../client/{file_name}", f"/var/lib/docker/volumes/development_vol_client/_data/{file_name}")
                elif (line.startswith("server/")):
                    file_name = line[len("server/")]
                    shutil.copyfile(f"../server/{file_name}", f"/var/lib/docker/volumes/development_vol_server/_data/{file_name}")
        elif opt in ("-d", "--development"):
            print("Press Enter to use the default value for ports")
            client_port = int(input("Please Enter a Port for the Client: ") or -1)
            client_port = client_port if client_port != -1 else 3001
            host_port = int(input("Please Enter a Port for the Host: ") or -1)
            host_port = host_port if host_port != -1 else 4000
            redis_port = int(input("Please Enter a Port for the Redis: ") or -1)
            redis_port = redis_port if redis_port != -1 else 6379
            domain = input("Please Enter a Domain: ") or "localhost"
            session_secret = input("Please Enter the session secret: ") # `openssl rand -hex 32` or go to https://generate-secret.now.sh/32
            env_file_setup(session_secret, domain, client_port, host_port, redis_port)
        else:
            sys.exit(2)
    sys.exit(exit_code)

def main(argv: list[str]):
    short_options = "ht:i:l:s:ud"
    long_options = ["help", "teardown=","initialize=","launch=","status=", "update", "development"]
    try:
        opts, args = getopt.getopt(argv, short_options, long_options)
    except getopt.GetoptError:
        print(help_text)
        sys.exit(2)
    if (len(opts) == 0):
        print(help_text)
        sys.exit(2)

    arg_options = argument_possibilities.split('|')
    script_execution(opts, arg_options)

if __name__ == "__main__":
   main(sys.argv[1:])
