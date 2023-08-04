echo ""
echo "============================================"
echo "         UPDATING OS DEPENDENCIES           "
echo "============================================"
echo ""

apt update -y

echo ""
echo "============================================"
echo "          INSTALLING REPOSITORY             "
echo "============================================"
echo ""

cp /transfer/id_rsa /home/vagrant/.ssh/
cp /transfer/id_rsa.pub /home/vagrant/.ssh/
cp /keys/scattegoriesSSH /home/vagrant/key
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
  cd /home/vagrant/bac; \
  git checkout deployment; \
'

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
echo "                 COMPLETED                  "
echo "============================================"
echo ""