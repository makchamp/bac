resource "aws_key_pair" "generated_key" {
  key_name   = "jenkinsSSH"
  public_key = file("keys/jenkinsSSH.pub")
}

resource "aws_eip" "jenkins_eip" {
  instance = aws_instance.jenkins_instance.id
  domain   = "vpc"
}

resource "aws_eip_association" "jenkins_eip_association" {
  instance_id   = aws_instance.jenkins_instance.id
  allocation_id = aws_eip.jenkins_eip.id
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "jenkins_instance" {
  ami                    = "ami-053b0d53c279acc90"
  instance_type          = "t2.large"
  availability_zone      = "us-east-1a"
  key_name               = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.sg_jenkins.id]
  tags = {
    Name    = "Jenkins Public Instance"
    Project = "Scattegories"
  }

  connection {
    user        = "ubuntu"
    private_key = file("keys/jenkinsSSH")
    host        = self.public_ip
  }
}

data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

resource "aws_security_group" "sg_jenkins" {
  name        = "sg_jenkins"
  description = "Allow Jenkins Permissions"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
  }

  ingress {
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
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
    content  = aws_eip.jenkins_eip.public_ip
    filename = "jenkins_ip.txt"
}