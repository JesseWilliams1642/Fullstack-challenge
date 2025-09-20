#!/bin/bash

cat ./frontend/.env > .env
cat ./backend/.env > .env
sort -u .env -o .env            # Remove duplicate variables

# $@ allows us to add more options/tags on the end
docker-compose --env-file .env up "$@"

# Make it an executable by running:
# chmod +x compose-up.sh