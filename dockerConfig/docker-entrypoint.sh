#!/bin/sh
set -e

VOLUME_MOUNT_PATH="/home/node/app/adonis_state"
LOG_DIR="/home/node/app/storage/logs"

echo "Entrypoint: Running as user: $(whoami)"

# Cek apakah direktori mount point ada
if [ -d "$VOLUME_MOUNT_PATH" ]; then
    echo "Entrypoint: Checking ownership of $VOLUME_MOUNT_PATH"
    # Skrip ini berjalan sebagai root, jadi perintah chown akan berhasil.
    chown -R node:node "$VOLUME_MOUNT_PATH"
    echo "Entrypoint: Ownership of $VOLUME_MOUNT_PATH set to 'node'."
else
    # Jika direktori tidak ada karena volume tidak di-mount (misalnya saat build), buat saja.
    mkdir -p "$VOLUME_MOUNT_PATH"
    chown -R node:node "$VOLUME_MOUNT_PATH"
    echo "Entrypoint: Created and set ownership for $VOLUME_MOUNT_PATH"
fi

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"
# Set ownership of the log directory to 'node'
chown -R node:node "/home/node/app/storage"

# 1. Apply cron jobs from /etc/cron.d/automation-cron
crontab /etc/cron.d/automation-cron
echo "Entrypoint: Cron jobs applied."

# 2. Start the cron service in the background
echo "Entrypoint: Crond service started in the background."
crond -f &

# 3. Drop privileges and run the command as the 'node' user
exec su-exec node "$@"
# ===================================================
