#!/bin/sh
set -e

# Run migrations
node ace migration:run

# Current path flag is now in a persistent volume
SEED_FLAG_FILE="/home/node/app/adonis_state/.seeded_sf_adonis"

# Check if the database has already been seeded
if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "Database not seeded yet for Adonis, running seeders..."
  node ace db:seed
  if [ $? -eq 0 ]; then # Check if seeding was successful
    touch "$SEED_FLAG_FILE"
    echo "Adonis database seeded successfully."
  else
    echo "Adonis database seeding failed."
    # Optionally exit if seeding is critical for the first run
    exit 1
  fi
else
  echo "Adonis database already seeded, skipping."
fi

# Start server
exec node ace serve --watch
