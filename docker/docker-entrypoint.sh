#!/bin/sh
chmod 666 /var/run/docker.sock 2>/dev/null || true
exec "$@"