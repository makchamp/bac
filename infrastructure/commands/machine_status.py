import vagrant
from python_terraform import Terraform
from common import format_tf_output
from script_command import ScriptCommand

class MachineStatus(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name = "machine_status"
        self.help_message = "used to check the creation status of the specified machine"

        self.choices = [
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
                self.validate_virtual_machine('main')
            if arg in ("cloud_vm", "all"):
                self.validate_deployment_server()
            self.check_arg(arg)

    def validate_virtual_machine(self, machine_name: str) -> None:
        vagrant_file = './deployment/'
        local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
        status = local_virtual_machine.status(vm_name=machine_name)
        for stat in status:
            print(stat)

    def validate_deployment_server(self) -> None:
        deployment_machine = Terraform(working_dir='./deployment/')
        output = deployment_machine.plan()
        print(format_tf_output("Plan of Deployment Server", output))
