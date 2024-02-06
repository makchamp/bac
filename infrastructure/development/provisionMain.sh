echo ""
echo "============================================"
echo "         UPDATING OS DEPENDENCIES           "
echo "============================================"
echo ""

apt update -y

echo ""
echo "============================================"
echo "            INSTALLING ANSIBLE              "
echo "============================================"
echo ""

apt update -y
apt install software-properties-common -y
add-apt-repository --yes --update ppa:ansible/ansible
apt install ansible -y
apt install ansible-lint -y

echo ""
echo "============================================"
echo "             INSTALLING PIP                 "
echo "============================================"
echo ""

apt install python3-pip -y

echo ""
echo "============================================"
echo "            INSTALLING DOCKER               "
echo "============================================"
echo ""

apt install ca-certificates curl gnupg -y

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update -y
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
docker run hello-world

echo ""
echo "============================================"
echo "            INSTALLING VAGRANT              "
echo "============================================"
echo ""

apt install virtualbox -y
wget -P /tmp/ https://releases.hashicorp.com/vagrant/2.3.7/vagrant_2.3.7-1_amd64.deb
apt install /tmp/vagrant_2.3.7-1_amd64.deb -y

echo ""
echo "============================================"
echo "          INSTALLING REPOSITORY             "
echo "============================================"
echo ""

cp /transfer/deployment/id_rsa /home/vagrant/.ssh/
cp /transfer/deployment/id_rsa.pub /home/vagrant/.ssh/
cp /keys/deployment/scattegoriesSSH /home/vagrant/key
cp /keys/development/jenkinsSSH /home/vagrant/jenkins_key
chmod 700 /home/vagrant/.ssh
chmod 600 /home/vagrant/.ssh/id_rsa
chmod 600 /home/vagrant/key
chmod 644 /home/vagrant/.ssh/id_rsa.pub
chown vagrant:vagrant .ssh/id_rsa .ssh/id_rsa.pub key

# Obtaining the REPO
sudo -u vagrant bash -c '
  ssh-keyscan -H github.com >> ~/.ssh/known_hosts
  eval `ssh-agent`; \
  ssh-add; \
  git clone git@github.com:makchamp/bac.git /home/vagrant/bac; \
  cd /home/vagrant/bac/infrastructure; \
  pip3 install -r requirements.txt; \
'

echo ""
echo "============================================"
echo "                 COMPLETED                  "
echo "============================================"
echo ""