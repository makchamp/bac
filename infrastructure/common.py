import time
import re
import sys
import traceback
import colorama
import paramiko
from paramiko import AuthenticationException, BadHostKeyException, SSHException

# Vagrant Variables
HOST = '192.168.56.10'
KEY_LOCATION = 'virtualbox/private_key'
TF_OUTPUT_OFFSET = 4

# SSH Variables
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def fix_ansi(terminal_output: bytes) -> str:
    initial_one = "^(b')"
    initial_two = "^(b\")"
    end_one = "( ')$"
    end_two = "( \")$"
    esc_linux = "\\\\x1b"
    start_line = "\\\\r"
    new_line = "\\\\n"
    cleaned_output = re.sub(f"{start_line}{new_line}'|{start_line}{new_line}", '\n', str(terminal_output))
    cleaned_output = re.sub(f"{initial_one}|{initial_two}|{start_line}|{end_one}|{end_two}", "", cleaned_output)
    cleaned_output = re.sub(f"{esc_linux}", "\\033", cleaned_output)

    return cleaned_output

def modified_line(current_line: str) -> str:
    current_line = re.sub("vagrant@server", '\033[32mvagrant@server\033[0m', current_line)
    initial_part, end_part = re.split(":.+$", current_line, 1)
    mid_part = re.search(":.+$", current_line).group()[1:-1]
    return f"{initial_part}:\033[34m{mid_part}\033[0m${end_part}"

def fix_terminal_inputs(previous_line: str, current_line: str) -> list[str]:
    if "vagrant@server" in current_line:
        current_line = modified_line(current_line)
    elif "vagrant@server" in previous_line:
        previous_line = modified_line(previous_line)

    currentline = ""
    currentline = current_line.split('\n', 1)[0] or ''
    nextline = current_line.split('\n', 1)[1] or ''
    if previous_line:
        currentline = f"{previous_line} {currentline}"
    return [currentline, nextline]

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
        key = f"deployment/.vagrant/machines/{machine_name}/{KEY_LOCATION}"
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
    current_line = ""
    previous_line = ""

    while True:
        if channel.exit_status_ready():
            break

        if channel.recv_ready():
            output = channel.recv(1024)
            current_line = fix_ansi(output)
            current_line, previous_line = fix_terminal_inputs(previous_line, current_line)
            print(current_line)
            time_counter = time_limit
        else:
            time.sleep(1)
            time_counter -= 1
            if time_counter == 0:
                if command_counter < len(commands):
                    channel.send(commands[command_counter] + '\n')
                    command_counter += 1
                time_counter = time_limit

    print(previous_line)
    channel.close()

def ssh_disconnect() -> None:
    print("closing connection")
    ssh.close()
    print("closed")
