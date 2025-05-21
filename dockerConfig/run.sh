#!/bin/sh
set -e

# Run migrations
node ace migration:run

# Start seeders
node ace db:seed

# Start server
exec node ace serve --watch
