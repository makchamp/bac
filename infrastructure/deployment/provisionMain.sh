echo ""
echo "============================================"
echo "         UPDATING OS DEPENDENCIES           "
echo "============================================"
echo ""

apt update -y

echo ""
echo "============================================"
echo "             INSTALLING PIP                 "
echo "============================================"
echo ""

apt install python3-pip -y

echo ""
echo "============================================"
echo "            INSTALLING ANSIBLE              "
echo "============================================"
echo ""

python3 -m pip install --upgrade ansible

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

cp /keys/deployment/scattegoriesSSH /home/vagrant/key
chmod 600 /home/vagrant/key
chown vagrant:vagrant key

# Obtaining the REPO
sudo -u vagrant bash -c '
  git clone https://github.com/makchamp/bac.git /home/vagrant/bac; \
  cd /home/vagrant/bac/infrastructure; \
  pip3 install -r requirements.txt; \
'

echo ""
echo "============================================"
echo "                 COMPLETED                  "
echo "============================================"
echo ""