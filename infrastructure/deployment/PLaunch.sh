#!/bin/bash

echo ""
echo "============================================"
echo "            SETTING UP IP TABLE             "
echo "============================================"
echo ""

ufw allow 22
ufw allow 80
ufw allow 81
ufw allow 3001
ufw allow 4000
ufw --force enable
ufw status

sysctl net.ipv4.ip_forward=1
iptables -t filter -A INPUT -i eth0 -p tcp --dport 3001 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -t filter -A OUTPUT -o eth0 -p tcp --sport 3001 -m state --state ESTABLISHED -j ACCEPT
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3001

iptables -t filter -A INPUT -i eth0 -p tcp --dport 4000 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -t filter -A OUTPUT -o eth0 -p tcp --sport 4000 -m state --state ESTABLISHED -j ACCEPT
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 81 -j REDIRECT --to-port 4000

echo ""
echo "============================================"
echo "                 COMPLETED                  "
echo "============================================"
echo ""