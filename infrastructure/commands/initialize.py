import vagrant
from common import format_tf_output
from python_terraform import Terraform
from script_command import ScriptCommand

class Initialize(ScriptCommand):

    def __init__(self):
        self.name="initialize"
        self.help_message="used to create the specified machine from scratch"
        self.choices=["prod", "jenkins", "vm", "all"]
        self.argument = {"dest": "selection", "nargs": "+", "type": str, "metavar": "machine/s", "help": "prod|jenkins|vm|all"}

    def initialize_jenkins_server(self) -> None:
        jenkins_machine = Terraform(working_dir='./development/')
        output = jenkins_machine.init(kwargs={"capture_output":True})
        print(format_tf_output("Initialization of Jenkins Server", output))
        output = jenkins_machine.apply(skip_plan=True)
        print(format_tf_output("Creation of Jenkins Server", output))

    def initialize_virtual_machine(self, machine_name: str) -> None:
        vagrant_file = './development/'
        local_virtual_machine = vagrant.Vagrant(vagrant_file, out_cm=vagrant.stdout_cm, err_cm=vagrant.stderr_cm)
        local_virtual_machine.up(vm_name=machine_name)

    def initialize_deployment_server(self) -> None:
        deployment_machine = Terraform(working_dir='./deployment/')
        output = deployment_machine.init(kwargs={"capture_output":True})
        print(format_tf_output("Initialization of Deployment Server", output))
        output = deployment_machine.apply(skip_plan=True)
        print(format_tf_output("Creation of Deployment Server", output))

    def command(self, *args: str) -> None:
        for arg in args:
            if arg == "vm" or arg == "all":
                self.initialize_virtual_machine("main")
            if arg == "prod" or arg == "all":
                self.initialize_deployment_server()
            if arg == "jenkins" or arg == "all":
                self.initialize_jenkins_server()