#!/bin/sh
set -e

# Selalu jalankan migrasi untuk memastikan skema database up-to-date
echo "Running Adonis migrations..."
node ace migration:run
if [ $? -ne 0 ]; then
  echo "Adonis migrations failed."
  exit 1
fi
echo "Adonis migrations completed successfully."


# Path ke flag file di dalam named volume
SEED_FLAG_FILE="/home/node/app/adonis_state/.seeded_sf_adonis"

# Cek apakah seeder perlu dijalankan
if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "Database not seeded yet, running seeders..."
  node ace db:seed
  if [ $? -eq 0 ]; then
    # Buat direktori jika belum ada (langkah pengamanan)
    mkdir -p /home/node/app/adonis_state
    touch "$SEED_FLAG_FILE"
    echo "Adonis database seeded successfully."
  else
    echo "Adonis database seeding failed."
    exit 1
  fi
else
  echo "Adonis database already seeded, skipping seeding."
fi

# Start server
echo "Starting server..."
exec node ace serve --watch
