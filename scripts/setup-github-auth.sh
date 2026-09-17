#!/usr/bin/env bash
# Run as ec2-user on EC2. Never run this with bash -x.
set -euo pipefail
set +x
umask 077

runtime="${MERMER_RUNTIME_DIR:-/home/ec2-user/mermer-runtime}"
mode="${1:-ssh}"
repo='Arthur-Arcadia/DECO-3500-Team-07-Mermer-Coming'
mkdir -p "$runtime"
chmod 700 "$runtime"

case "$mode" in
  ssh)
    key="$runtime/github-deploy-key"
    if [[ ! -f "$key" ]]; then
      ssh-keygen -t ed25519 -C mermer-ec2-readonly -N '' -f "$key"
    fi
    [[ -f "$key.pub" ]] || { echo 'Missing public key. Do not replace an existing private key.' >&2; exit 1; }
    chmod 600 "$key"
    # Official GitHub Ed25519 host key. Strict verification remains enabled.
    # https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints
    printf '%s\n' 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' > "$runtime/github-known-hosts"
    printf '%s\n' ssh > "$runtime/github-auth-mode"
    printf '\nAdd the following PUBLIC key to %s -> Settings -> Deploy keys.\n' "$repo"
    printf 'Leave "Allow write access" unchecked. Then run deploy-main.sh.\n\n'
    cat "$key.pub"
    ;;
  https)
    [[ -t 0 ]] || { echo 'Run HTTPS setup in an interactive EC2 terminal.' >&2; exit 1; }
    read -r -p 'GitHub username: ' github_user
    read -r -s -p 'GitHub personal access token (not your account password): ' github_token
    printf '\n'
    [[ "$github_user" =~ ^[A-Za-z0-9-]+$ && -n "$github_token" ]] || { echo 'Username and token are required.' >&2; exit 1; }
    # Restrict the credential to this repository; never embed it in a Git URL.
    credential_file="$runtime/github-credentials"
    credential_temp=$(mktemp "$runtime/.github-credentials.XXXXXX")
    trap 'rm -f -- "$credential_temp"; unset github_token' EXIT
    printf 'protocol=https\nhost=github.com\npath=%s.git\nusername=%s\npassword=%s\n\n' "$repo" "$github_user" "$github_token" |
      git credential-store --file="$credential_temp" store
    chmod 600 "$credential_temp"
    mv -f -- "$credential_temp" "$credential_file"
    unset github_token
    printf '%s\n' https > "$runtime/github-auth-mode"
    printf 'Saved a repository-scoped credential in %s (mode 600).\n' "$credential_file"
    printf 'It is stored as plaintext on this EC2 disk, not in the repository. Treat this file as a secret.\n'
    ;;
  *) echo 'Usage: bash setup-github-auth.sh ssh|https' >&2; exit 2 ;;
esac
