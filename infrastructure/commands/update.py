#import git
#import sys
import colorama
from common import *
from script_command import ScriptCommand

class Update(ScriptCommand):

    def __init__(self):
        self.name="update"
        self.help_message="used to pull and update the specified machine with the latest changes"
        self.choices=["vm"]
        self.argument = {
            "dest": "selection",
            "nargs": 2,
            "type": str,
            "metavar": "machine/s",
            "help": "vm    followed by the branch name"
        }
    
    def command(self, *args: str) -> None:
        for arg in args:
            if arg == "vm":
                ssh_connect(HOST, 'main')
                self.vm_update_codebase()
                ssh_disconnect()
        # current_repo = git.Repo('../')
        # current_branch = current_repo.active_branch
        # head_commit = current_repo.commit(current_branch)
        # origin_commit = current_repo.commit(f"origin/{current_branch}")
        # diffy = current_repo.git.diff(f"{head_commit}..{origin_commit}", name_only=True)
        # lines = diffy.splitlines()
        # for line in lines:
        #     print(line)
        #     if (line.startswith("client/")):
        #         file_name = line[len("client/")]
        #         shutil.copyfile(f"../client/{file_name}", f"/var/lib/docker/volumes/development_vol_client/_data/{file_name}")
        #     elif (line.startswith("server/")):
        #         file_name = line[len("server/")]
        #         shutil.copyfile(f"../server/{file_name}", f"/var/lib/docker/volumes/development_vol_server/_data/{file_name}")

    def vm_update_codebase(self) -> None:
        channel = ssh.invoke_shell()
        stdin = channel.makefile('wb')
        stdout = channel.makefile('rb')

        stdin.write('cd /home/vagrant/bac' + '\n')
        stdin.write('git checkout jenkins_pipeline' + '\n')
        stdin.write('git pull origin' + '\n')
        stdin.write('exit' + '\n')
        stdin.flush()

        colorama.init(convert=True, autoreset=True)
        lines = stdout.readlines()
        for line in lines:
            print(fix_ansi(str(line)))

        channel.close()