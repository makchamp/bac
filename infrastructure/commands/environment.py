import shutil
import dotenv
from script_command import ScriptCommand

class Environment(ScriptCommand):

    def __init__(self):
        super().__init__()
        self.name = "environment"
        self.help_message = "used to initialize/modify any environment files"
        self.choices = ["setup_env"]

        self.argument = {
            "dest": "selection",
            "nargs": "+",
            "type": str,
            "metavar": "options",
            "help": "setup_env"
        }

    def command(self, *args: str) -> None:
        for arg in args:
            if arg == "setup_env":
                print("Press Enter to use the default value for ports")
                client_port = int(input("Please Enter a Port for the Client: ") or -1)
                client_port = client_port if client_port != -1 else 3001
                host_port = int(input("Please Enter a Port for the Host: ") or -1)
                host_port = host_port if host_port != -1 else 4000
                redis_port = int(input("Please Enter a Port for the Redis: ") or -1)
                redis_port = redis_port if redis_port != -1 else 6379
                domain = input("Please Enter a Domain: ") or "localhost"
                session_secret = input("Please Enter the session secret: ")
                # `openssl rand -hex 32` or go to https://generate-secret.now.sh/32
                self.env_file_setup(session_secret, domain, client_port, host_port, redis_port)
            self.check_arg(arg)

    def set_env_file(self, path: str, env_variables: dict[str, object]) -> None:
        env_file = dotenv.find_dotenv(path)
        dotenv.load_dotenv(env_file)

        for key in env_variables.keys():
            dotenv.set_key(env_file, key, env_variables[key])

    def env_file_setup(self, session_secret: str, domain, client_port: int,
                        host_port: int, redis_port: int) -> None:

        shutil.copyfile('../client/.env.example', '../client/.env')

        client_variables = {
            "PORT": str(client_port),
            "REACT_APP_HOST_PORT": str(host_port),
            "GENERATE_SOURCEMAP": "false",
            "REACT_APP_HOST_PROTOCOL": "http",
            "REACT_APP_HOST_DOMAIN": domain
        }

        self.set_env_file('../client/.env', client_variables)

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

        self.set_env_file('../server/.env', host_variables)
