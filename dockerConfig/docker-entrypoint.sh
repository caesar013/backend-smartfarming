#!/bin/sh
set -e

VOLUME_MOUNT_PATH="/home/node/app/adonis_state"

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

# ================= PERUBAHAN KUNCI =================
# "Drop privileges" dan jalankan CMD yang diberikan sebagai user 'node'
# "$@" adalah semua argumen yang diteruskan ke skrip ini (yaitu CMD dari Dockerfile)
exec su-exec node "$@"
# ===================================================
