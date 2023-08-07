resource "aws_key_pair" "generated_key" {
  key_name   = "scattegoriesSSH"
  public_key = file("keys/scattegoriesSSH.pub")
}

resource "aws_eip" "scattegories_eip" {
  instance = aws_instance.scattegoies_instance.id
  domain   = "vpc"
}

resource "aws_eip_association" "scattegories_eip_association" {
  instance_id   = aws_instance.scattegoies_instance.id
  allocation_id = aws_eip.scattegories_eip.id
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "scattegoies_instance" {
  ami                    = "ami-053b0d53c279acc90"
  instance_type          = "t2.large"
  availability_zone      = "us-east-1a"
  key_name               = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.sg_scattegories.id]
  tags = {
    Name    = "Scattegories Public Instance"
    Project = "Scattegories"
  }

  connection {
    user        = "ubuntu"
    private_key = file("keys/scattegoriesSSH")
    host        = self.public_ip
  }
}

data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

resource "aws_security_group" "sg_scattegories" {
  name        = "sg_scattegories"
  description = "Allow Scattegories Permissions"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 81
    to_port     = 81
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "local_file" "static_ip" {
    content  = aws_eip.scattegories_eip.public_ip
    filename = "instance_ip.txt"
}