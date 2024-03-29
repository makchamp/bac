import vagrant
from python_terraform import Terraform, IsFlagged, IsNotFlagged
from common import format_tf_output
from script_command import ScriptCommand

class Teardown(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name="teardown"
        self.help_message="used to completely destroy the specified machine"

        self.choices=[
            "cloud_vm",
            "local_vm",
            "all"
        ]

        self.argument= {
            "dest": "selection",
            "nargs": "+",
            "type": str,
            "metavar": "machine/s",
            "help": "cloud_vm|local_vm|all"
        }

    def command(self, *args: str) -> None:
        for arg in args:
            if arg in ("local_vm", "all"):
                self.destroy_virtual_machine('main')
            if arg in ("cloud_vm", "all"):
                self.destroy_deployment_server()
            self.check_arg(arg)

    def destroy_virtual_machine(self, machine_name: str) -> None:
        vagrant_file = './deployment/'
        local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
        local_virtual_machine.destroy(vm_name=machine_name)

    def destroy_deployment_server(self) -> None:
        deployment_machine = Terraform(working_dir='./deployment/')
        output = deployment_machine.destroy(auto_approve=IsFlagged, force=IsNotFlagged)
        print(format_tf_output("Teardown of Deployment Server", output))
