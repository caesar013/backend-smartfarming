#!/bin/sh
# This script is executed by the docker-entrypoint.sh as the 'node' user.
set -e

# --- SCRIPT CONFIGURATION ---
# The entrypoint script is responsible for ensuring this directory exists and
# is owned by the 'node' user.
STATE_DIR="/home/node/app/adonis_state"
SEED_FLAG_FILE="$STATE_DIR/.seeded_sf_adonis"


# --- 1. RUN DATABASE MIGRATIONS ---
echo "RUN_SCRIPT: Running database migrations as user '$(whoami)'..."
node ace migration:run
if [ $? -ne 0 ]; then
  echo "RUN_SCRIPT: Adonis migrations failed. Exiting."
  exit 1
fi
echo "RUN_SCRIPT: Migrations completed successfully."


# --- 2. RUN DATABASE SEEDER (IF NEEDED) ---
if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "RUN_SCRIPT: Seed flag not found. Database will be seeded."
  node ace db:seed

  if [ $? -eq 0 ]; then
    # The seeder ran successfully. Create the flag file inside the volume
    # to prevent the seeder from running on subsequent container starts.
    # The 'touch' command will succeed because the entrypoint already set
    # the correct permissions on the STATE_DIR.
    touch "$SEED_FLAG_FILE"
    echo "RUN_SCRIPT: Database seeded successfully and flag file created."
  else
    echo "RUN_SCRIPT: Database seeding failed. Exiting."
    exit 1
  fi
else
  echo "RUN_SCRIPT: Seed flag found. Skipping database seeding."
fi


# --- 3. START THE ADONISJS SERVER ---
echo "RUN_SCRIPT: Starting server with hot-reload..."
# Use 'exec' to replace the shell process with the node process,
# which is standard practice for a container's main command.
exec node ace serve --watch
