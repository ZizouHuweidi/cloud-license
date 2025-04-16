#! /usr/bin/env bash

set -e
set -x

# Let the DB start
# Use Python's module system instead of direct file execution
# This ensures proper module resolution
cd /app
python -m app.backend_pre_start

# Run migrations
alembic upgrade head

# Create initial data in DB
python -m app.initial_data
