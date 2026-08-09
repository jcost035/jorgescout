#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
VENV_PYTHON="${REPO_DIR}/server/venv/bin/python"
REQUIREMENTS="${REPO_DIR}/server/requirements.txt"
SERVICES=(flaskapp jorgescout-scheduler)

if [[ ! -x "${VENV_PYTHON}" ]]; then
    printf 'Virtual environment Python not found: %s\n' "${VENV_PYTHON}" >&2
    exit 1
fi

printf 'Installing backend requirements...\n'
"${VENV_PYTHON}" -m pip install -r "${REQUIREMENTS}"

printf 'Reloading systemd configuration...\n'
sudo systemctl daemon-reload

printf 'Restarting services...\n'
sudo systemctl restart "${SERVICES[@]}"

printf 'Service status:\n'
sudo systemctl status "${SERVICES[@]}" --no-pager --full
