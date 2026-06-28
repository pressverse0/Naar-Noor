#!/bin/sh
# Health check script for Nginx frontend container

# Check if Nginx is responding
curl -f http://localhost/health > /dev/null 2>&1

if [ $? -eq 0 ]; then
    exit 0
else
    exit 1
fi
