import time
import colorama
import paramiko
import select
import re
import sys
import traceback
from paramiko import AuthenticationException, BadHostKeyException, SSHException

# Vagrant Variables
HOST = '192.168.33.223'
KEY_LOCATION = 'virtualbox/private_key'
TF_OUTPUT_OFFSET = 4

# SSH Variables
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

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

def ssh_commands(commands: list[str], time_limit: float) -> None:
    colorama.init(convert=True, autoreset=True)
    channel = ssh.invoke_shell()
    command_counter = 0
    time_counter = time_limit

    while True:
        if channel.exit_status_ready():                                
            break

        if channel.recv_ready():
            output = channel.recv(1024)
            print((fix_ansi(str(output))))
            time_counter = time_limit
        else:
            time.sleep(1)
            time_counter -= 1
            if (time_counter == 0):
                if (command_counter < len(commands)):
                    channel.send(commands[command_counter] + '\n')
                    command_counter += 1
                time_counter = time_limit
    
    channel.close()

def ssh_disconnect() -> None:
    print("closing connection")
    ssh.close()
    print("closed")