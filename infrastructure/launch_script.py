import argparse
import importlib
import os
import sys
import paramiko
from increased_argument_parser import IncreasedArgumentParser
from script_command import ScriptCommand

# Vagrant Variables
HOST = '192.168.33.223'
KEY_LOCATION = 'virtualbox/private_key'
TF_OUTPUT_OFFSET = 4

# SSH Variables
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def script_execution() -> None:
    parser = argparse.ArgumentParser(
        prog="launch_script.py",
        usage="launch_script.py [-h] [-v] subcommands",
        description="Execute Any Automated Infrastructure Task",
        epilog="For future additions or questions ask Avery for help! :)",
        allow_abbrev=False,
        formatter_class=IncreasedArgumentParser
    ) # argument_default=argparse.SUPPRESS to remove defaults

    parser.add_argument("-v", "--version", action="version", version="%(prog)s 0.5")

    subparsers = parser.add_subparsers(
        title="subcommands",
        metavar=""
    )

    command_files = []
    for walked_output in os.walk("commands"):
        filenames = walked_output[2]
        command_files.extend(filenames)
        break

    for filename in command_files:
        file_path = os.path.join("commands", filename)
        module_name = ""
        module_split = filename.rsplit("_")
        for piece in module_split:
            module_name += piece.capitalize()
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        sys.modules[module_name] = module
        command_class: ScriptCommand
        command_class =  getattr(module, module_name.replace(".py", ""))
        script_command = command_class()
        sub_parser = subparsers.add_parser(script_command.name, help=script_command.help_message)
        sub_parser.set_defaults(func=script_command.command)
        if script_command.argument is not None:
            sub_parser.add_argument(**script_command.argument)

    args = parser.parse_args()
    args.func(*args.selection)

if __name__ == "__main__":
    script_execution()
