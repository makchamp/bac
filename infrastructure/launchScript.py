
import colorama
import getopt
import paramiko
import re
import sys
import traceback
import vagrant
from python_terraform import *
from fabric.api import *

# Vagrant Variables
HOST = '192.168.33.223'
KEY_LOCATION = 'virtualbox/private_key'
TF_OUTPUT_OFFSET = 4

# SSH Variables
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# Script Variables
help_text = '''
-t or --teardown:   used to tear down the entire deployment
-l or --launch:     used to launch the deployment server and VM
-p or --playbook:   used to connect to the VM and run the playbook
-s or --status:     used to verify the current state of both machines
'''

def fix_ansi(a) -> str:
    INITIAL = r"^(b')"
    NEWLINE = r"\\r\\n'"
    STARTLINE = r"\\r"
    ESC = r"\\x1b"
    NEW_ESC = r"\033"
    returnMe = re.sub(INITIAL, '', a)
    returnMe = re.sub(NEWLINE, '', returnMe)
    returnMe = re.sub(STARTLINE, '', returnMe)
    returnMe = re.sub(ESC, NEW_ESC, returnMe)
    return returnMe

def format_tf_output(output) -> str:
    return re.sub(r'(?m)^', ' ' * TF_OUTPUT_OFFSET, str(output))

def launch_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.init(kwargs={"capture_output":True})
    print(format_tf_output(output))
    output = deployment_machine.apply(skip_plan=True)
    print(format_tf_output(output))

def destroy_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.destroy(auto_approve=IsFlagged, force=IsNotFlagged)
    print(format_tf_output(output))

def validate_deployment_server() -> None:
    deployment_machine = Terraform(working_dir='./deployment/')
    output = deployment_machine.plan()
    print(format_tf_output(output))

def start_virtual_machine(machine_name) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   local_virtual_machine.up(vm_name=machine_name)

def destroy_virtual_machine(machine_name) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   local_virtual_machine.destroy(vm_name=machine_name)

def validate_virtual_machine(machine_name) -> None:
   vagrant_file = './development/'
   local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
   status = local_virtual_machine.status(vm_name=machine_name)
   for stat in status:
       print(stat)

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

def ssh_connect(host=HOST, machine_name='default') -> None:
    try:
       print("creating connection")
       key = f"development/.vagrant/machines/{machine_name}/{KEY_LOCATION}"
       ssh_key = paramiko.RSAKey.from_private_key(open(key))
       ssh.connect(host, username='vagrant', pkey=ssh_key)
       print("Connected!")
    except Exception as e:
        print("[-] Listen failed: " + str(e))
        traceback.print_stack()
        sys.exit(1)
       
def ssh_disconnect() -> None:
    print("closing connection")
    ssh.close()
    print("closed")

def main(argv):
    try:
        opts, args = getopt.getopt(argv,"htlps",["teardown","launch","playbook","status"])
    except getopt.GetoptError:
        print(help_text)
        sys.exit(2)
    if (len(opts) == 0):
        print(help_text)
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print(help_text)
            sys.exit()
        elif opt in ("-t", "--teardown"):
            destroy_deployment_server()
            destroy_virtual_machine('main')
        elif opt in ("-l", "--launch"):
            launch_deployment_server()
            start_virtual_machine("main")
        elif opt in ("-p", "--playbook"):
            ssh_connect(HOST, 'main')
            run_playbook()
            ssh_disconnect()
        elif opt in ("-s", "--status"):
            validate_deployment_server()
            validate_virtual_machine('main')

if __name__ == "__main__":
   main(sys.argv[1:])

