# Apache2 + Let's Encrypt setup (sbmi.ca)

Domain is **sbmi.ca** (and www.sbmi.ca). Document root: **/var/www/sbmi.ca**. Apache proxies to the app on **127.0.0.1:3004** — run the Next.js app from /var/www/sbmi.ca with `PORT=3004` (e.g. `PORT=3004 npm run start`).

## 1. Enable required modules

```bash
sudo a2enmod ssl proxy proxy_http headers rewrite
sudo systemctl reload apache2
```

## 2. Install configs on the server

From the repo root (adjust path if needed):

```bash
# sites-available
sudo cp /path/to/sbmi.ca/deploy/sites-available/sbmi-ca.conf /etc/apache2/sites-available/

# Enable site (symlinks into sites-enabled)
sudo a2ensite sbmi-ca.conf
```

## 3. Get the Let's Encrypt certificate (first time only)

Use the HTTP-only config so the ACME challenge works, then get the cert, then switch to the full SSL config.

```bash
# HTTP-only for certbot
sudo cp /path/to/sbmi.ca/deploy/sites-available/sbmi-ca-http-only.conf /etc/apache2/sites-available/sbmi-ca.conf
sudo a2ensite sbmi-ca.conf

sudo mkdir -p /var/www/certbot/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/certbot

sudo apache2ctl configtest && sudo systemctl reload apache2

# Get certificate (sbmi.ca + www.sbmi.ca)
sudo certbot certonly --webroot -w /var/www/certbot -d sbmi.ca -d www.sbmi.ca --email your@email.com --agree-tos --non-interactive
```

**Or use certbot's Apache plugin:**

```bash
sudo certbot --apache -d sbmi.ca -d www.sbmi.ca --email your@email.com --agree-tos --non-interactive
```

## 4. Switch to full SSL config

After the certificate exists:

```bash
sudo cp /path/to/sbmi.ca/deploy/sites-available/sbmi-ca.conf /etc/apache2/sites-available/sbmi-ca.conf
sudo apache2ctl configtest && sudo systemctl reload apache2
```

## 5. Optional: auto-renewal

```bash
sudo certbot renew --dry-run
```

---

**Deploy app to /var/www/sbmi.ca:** Use `./deploy/push-via-ssh.sh` from the repo. Then on the server: `sudo rsync -a --delete ~/sbmi.ca/ /var/www/sbmi.ca/`, then in `/var/www/sbmi.ca`: `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run build`, and run the app on **port 3004** (e.g. `PORT=3004 npm run start` or PM2 with `PORT=3004`).

**Summary:** Configs use **sbmi.ca** and **www.sbmi.ca**. Copy from `deploy/sites-available/` to `/etc/apache2/sites-available/` and enable with `a2ensite sbmi-ca.conf`.
