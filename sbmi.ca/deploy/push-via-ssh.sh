#!/usr/bin/env bash
# Push sbmi.ca app and Apache deploy configs to EC2.
# Web root on server: /var/www/sbmi.ca

set -e
SSH_KEY="${HOME}/.ssh/intoria-php.pem"
SERVER="ubuntu@ec2-40-177-112-84.ca-west-1.compute.amazonaws.com"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -i "$SSH_KEY")
RSYNC_SSH="ssh -i $SSH_KEY"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Pushing app to server ~/sbmi.ca/ (you will copy to /var/www/sbmi.ca on server)"
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='dev.db' \
  --exclude='dev.db-journal' \
  "$APP_DIR/" \
  "$SERVER:~/sbmi.ca/"

echo "Pushing deploy configs to ~/sbmi-ca-deploy/"
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude='push-via-ssh.sh' \
  "$SCRIPT_DIR/" \
  "$SERVER:~/sbmi-ca-deploy/"

echo ""
echo "Done. On the server run:"
echo "  ssh -i $SSH_KEY $SERVER"
echo "  sudo rsync -a --delete ~/sbmi.ca/ /var/www/sbmi.ca/"
echo "  sudo cp ~/sbmi-ca-deploy/sites-available/sbmi-ca.conf /etc/apache2/sites-available/"
echo "  sudo a2ensite sbmi-ca.conf"
echo "  (Then in /var/www/sbmi.ca: npm ci, npx prisma migrate deploy, build/start app; see APACHE-SETUP.md for certbot)"
echo ""
