#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/app"
MIN_NODE_MAJOR=20
WITH_DOCKER=0
CHECK_ONLY=0
SKIP_NPM=0

log() {
  printf '[setup] %s\n' "$*"
}

warn() {
  printf '[setup][warn] %s\n' "$*" >&2
}

fail() {
  printf '[setup][error] %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage: scripts/setup-env.sh [options]

Options:
  --with-docker   Also install/check Docker where supported.
  --check-only    Detect environment without installing packages.
  --skip-npm      Do not run npm ci after dependency checks.
  -h, --help      Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --with-docker)
      WITH_DOCKER=1
      ;;
    --check-only)
      CHECK_ONLY=1
      ;;
    --skip-npm)
      SKIP_NPM=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
  shift
done

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

sudo_cmd() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif has_cmd sudo; then
    sudo "$@"
  else
    fail "sudo is required for system package installation."
  fi
}

detect_os() {
  case "$(uname -s)" in
    Darwin) printf 'macos' ;;
    Linux)
      if [ -f /etc/os-release ]; then
        . /etc/os-release
        printf '%s' "${ID:-linux}"
      else
        printf 'linux'
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*) printf 'windows' ;;
    *) printf 'unknown' ;;
  esac
}

node_major() {
  node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || printf '0'
}

node_ok() {
  has_cmd node && [ "$(node_major)" -ge "$MIN_NODE_MAJOR" ] && has_cmd npm
}

install_node_macos() {
  has_cmd brew || fail "Homebrew is required on macOS. Install it from https://brew.sh/ first."
  brew install node
}

install_node_debian() {
  sudo_cmd apt-get update
  sudo_cmd apt-get install -y ca-certificates curl gnupg git
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo_cmd bash -
  sudo_cmd apt-get install -y nodejs
}

install_node_rhel() {
  local manager="dnf"
  has_cmd dnf || manager="yum"
  curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo_cmd bash -
  sudo_cmd "$manager" install -y nodejs git
}

install_node_arch() {
  sudo_cmd pacman -Sy --needed nodejs npm git
}

install_node_windows() {
  has_cmd winget || fail "winget is required on Windows. Install Node.js 22 LTS manually if winget is unavailable."
  winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  winget install --id Git.Git --accept-package-agreements --accept-source-agreements
}

install_node() {
  local os="$1"
  [ "$CHECK_ONLY" -eq 0 ] || fail "Node.js $MIN_NODE_MAJOR+ or npm is missing. Re-run without --check-only to install."

  case "$os" in
    macos) install_node_macos ;;
    ubuntu|debian|linuxmint|pop) install_node_debian ;;
    fedora|rhel|centos|rocky|almalinux) install_node_rhel ;;
    arch|manjaro) install_node_arch ;;
    windows) install_node_windows ;;
    *) fail "Unsupported OS for automatic Node.js installation: $os" ;;
  esac
}

install_docker() {
  local os="$1"
  if has_cmd docker; then
    log "Docker found: $(docker --version)"
    if docker compose version >/dev/null 2>&1; then
      log "Docker Compose plugin found: $(docker compose version)"
    elif has_cmd docker-compose; then
      log "Docker Compose found: $(docker-compose --version)"
    else
      warn "Docker was found, but Docker Compose was not found."
    fi
    return
  fi

  [ "$CHECK_ONLY" -eq 0 ] || fail "Docker is missing. Re-run without --check-only and with --with-docker to install."

  case "$os" in
    macos)
      has_cmd brew || fail "Homebrew is required to install Docker Desktop on macOS."
      brew install --cask docker
      warn "Docker Desktop was installed. Start Docker Desktop before running docker compose."
      ;;
    ubuntu|debian|linuxmint|pop)
      sudo_cmd apt-get update
      sudo_cmd apt-get install -y docker.io docker-compose-plugin
      sudo_cmd systemctl enable --now docker || warn "Could not start Docker automatically; start it manually."
      ;;
    fedora|rhel|centos|rocky|almalinux)
      local manager="dnf"
      has_cmd dnf || manager="yum"
      sudo_cmd "$manager" install -y docker docker-compose-plugin
      sudo_cmd systemctl enable --now docker || warn "Could not start Docker automatically; start it manually."
      ;;
    arch|manjaro)
      sudo_cmd pacman -Sy --needed docker docker-compose
      sudo_cmd systemctl enable --now docker || warn "Could not start Docker automatically; start it manually."
      ;;
    windows)
      has_cmd winget || fail "winget is required to install Docker Desktop on Windows."
      winget install --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
      warn "Docker Desktop was installed. Start Docker Desktop before running docker compose."
      ;;
    *) fail "Unsupported OS for automatic Docker installation: $os" ;;
  esac
}

OS_ID="$(detect_os)"
log "Detected OS: $OS_ID"

if node_ok; then
  log "Node.js found: $(node --version), npm $(npm --version)"
else
  warn "Node.js $MIN_NODE_MAJOR+ and npm are required."
  install_node "$OS_ID"
fi

node_ok || fail "Node.js installation did not complete successfully."

if [ "$WITH_DOCKER" -eq 1 ]; then
  install_docker "$OS_ID"
fi

if [ "$SKIP_NPM" -eq 0 ]; then
  if [ "$CHECK_ONLY" -eq 1 ]; then
    log "Check-only mode: skipped npm ci."
  else
    log "Installing app dependencies with npm ci..."
    (cd "$APP_DIR" && npm ci)
  fi
fi

log "Environment is ready."
