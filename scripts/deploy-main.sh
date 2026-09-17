#!/usr/bin/env bash
# Deploy remote main on the existing EC2 + Docker + Caddy setup.
# Run as ec2-user, not ssm-user. Never run this with bash -x.
set -Eeuo pipefail
set +x
umask 077

runtime="${MERMER_RUNTIME_DIR:-/home/ec2-user/mermer-runtime}"
deploy_dir="${MERMER_DEPLOY_DIR:-/home/ec2-user/mermer-deploy}"
env_file="$runtime/bot.env"
container='mermer-bot'
network='mermer-net'
volume='mermer-data'
public_url='https://mermerteam07.duckdns.org/'
repository='qinghuai999/DECO-3500-Team-07-Mermer-Coming'
cache="$deploy_dir/repository.git"
expected_commit="${1:-}"
work=''
backup=''
old_exists=0
old_running=false
old_policy='unless-stopped'
old_renamed=0
swapping=0
committed=0
new_attempted=0

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }
docker_cmd() { sudo -n docker "$@"; }

# Runs on failures and interruptions after replacement begins. Never delete a data volume.
cleanup() {
  local rc=$?
  trap - EXIT INT TERM
  set +e
  if (( swapping && !committed )); then
    log 'Deployment failed. Restoring the previous container.'
    local restored=1
    if (( new_attempted )); then
      # Only remove the container this deployment actually created.
      local owner
      owner=$(docker_cmd inspect --format '{{index .Config.Labels "mermer.deployment"}}' "$container" 2>/dev/null)
      if [[ "$owner" == "$release" ]]; then
        docker_cmd rm -f "$container" >/dev/null || restored=0
      fi
    fi
    if (( old_exists )); then
      if (( old_renamed )); then docker_cmd rename "$backup" "$container" || restored=0; fi
      docker_cmd update --restart="$old_policy" "$container" >/dev/null || restored=0
      if [[ "$old_running" == true ]]; then docker_cmd start "$container" >/dev/null || restored=0; fi
      if (( restored )); then log 'Previous container restored. Persistent data was retained.'
      else log "Automatic restore failed. Inspect containers; previous backup name: $backup"; fi
    else
      log 'There was no previous container to restore.'
    fi
    rc=1
  fi
  [[ -z "$work" ]] || rm -rf -- "$work"
  exit "$rc"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for command in git tar curl flock mktemp sudo; do
  command -v "$command" >/dev/null || die "Missing command: $command"
done
[[ -f "$env_file" ]] || die "Missing $env_file. Keep the bot configuration outside Git."
[[ -z "$expected_commit" || "$expected_commit" =~ ^[0-9a-f]{40}$ ]] || die 'Expected a full 40-character commit SHA.'
# Compatibility with the earlier copy/paste HTTPS setup, which saved only credentials.
auth_mode=$(cat "$runtime/github-auth-mode" 2>/dev/null || true)
if [[ -z "$auth_mode" && -s "$runtime/github-credentials" ]]; then auth_mode=https; fi
[[ -n "$auth_mode" ]] || die 'Run setup-github-auth.sh ssh or https first.'
mkdir -p "$deploy_dir"
chmod 700 "$deploy_dir"
exec 9> "$deploy_dir/deploy.lock"
flock -n 9 || die 'Another deployment is already running.'
docker_cmd info >/dev/null || die 'Docker is unavailable or passwordless sudo is not configured for this user.'
docker_cmd network inspect "$network" >/dev/null || die "Missing Docker network: $network"
# Require all current bot settings, but never source or print the env file.
for setting in APP_ID PUBLIC_KEY DISCORD_TOKEN GUILD_ID GAME_VOICE_CHANNEL_ID SOCIAL_TEXT_CHANNEL_ID; do
  grep -Eq "^${setting}=.+" "$env_file" || die "Missing $setting in bot.env"
done

export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=/bin/false
export SSH_ASKPASS=/bin/false
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null
# Avoid inheriting a caller's HTTP debug settings (they can expose authentication).
unset GIT_TRACE GIT_TRACE_CURL GIT_CURL_VERBOSE GIT_CONFIG_COUNT
case "$auth_mode" in
  ssh)
    [[ -r "$runtime/github-deploy-key" && -r "$runtime/github-known-hosts" ]] || die 'SSH key or known-hosts file missing.'
    printf -v key_quoted '%q' "$runtime/github-deploy-key"
    printf -v hosts_quoted '%q' "$runtime/github-known-hosts"
    export GIT_SSH_COMMAND="ssh -F /dev/null -i $key_quoted -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$hosts_quoted -o HostKeyAlgorithms=ssh-ed25519"
    repo_url="git@github.com:$repository.git"
    git_auth=(-c credential.helper=)
    ;;
  https)
    [[ -s "$runtime/github-credentials" ]] || die 'HTTPS credential missing.'
    printf -v credential_quoted '%q' "$runtime/github-credentials"
    git_auth=(-c credential.helper= -c "credential.helper=store --file=$credential_quoted" -c credential.useHttpPath=true)
    repo_url="https://github.com/$repository.git"
    ;;
  *) die 'Unknown Git authentication mode. Run setup-github-auth.sh again.' ;;
esac

if [[ ! -d "$cache" ]]; then git init --bare "$cache" >/dev/null; fi
log 'Fetching GitHub main without changing your existing working directory.'
git "${git_auth[@]}" --git-dir="$cache" fetch --no-tags "$repo_url" '+refs/heads/main:refs/heads/main'
commit=$(git --git-dir="$cache" rev-parse 'refs/heads/main^{commit}')
if [[ -n "$expected_commit" && "$commit" != "$expected_commit" ]]; then
  die "main changed after this workflow started. Tested $expected_commit, current main $commit. Run deployment again."
fi
release="$(date -u +%Y%m%dT%H%M%SZ)-${commit:0:12}-$$"
image="mermer-bot:release-$release"
backup="mermer-bot-backup-$release"
work=$(mktemp -d "$deploy_dir/build.XXXXXX")
git --git-dir="$cache" archive "$commit" discord-example-app | tar -x -C "$work"
[[ -f "$work/discord-example-app/Dockerfile" ]] || die 'main does not contain the application Dockerfile.'
log "Building main commit $commit. The current bot stays running during the build."
docker_cmd build --label "org.opencontainers.image.revision=$commit" -t "$image" "$work/discord-example-app"

if docker_cmd container inspect "$container" >/dev/null 2>&1; then
  old_exists=1
  old_running=$(docker_cmd inspect --format '{{.State.Running}}' "$container")
  old_policy=$(docker_cmd inspect --format '{{.HostConfig.RestartPolicy.Name}}' "$container")
  if [[ "$old_policy" == on-failure ]]; then
    retries=$(docker_cmd inspect --format '{{.HostConfig.RestartPolicy.MaximumRetryCount}}' "$container")
    [[ "$retries" == 0 ]] || old_policy="on-failure:$retries"
  fi
  mount=$(docker_cmd inspect --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Type}}:{{.Name}}{{end}}{{end}}' "$container")
  [[ "$mount" == "volume:$volume" ]] || die "Existing container must mount $volume at /app/data. Refusing to switch to empty or different state storage."
fi
# A first deployment may create this volume; existing deployments always reuse it.
docker_cmd volume create "$volume" >/dev/null
log 'Replacing the bot container. A short interruption is expected.'
swapping=1
if (( old_exists )); then
  # Disable automatic restart on the backup so it cannot launch a second bot after an EC2 reboot.
  docker_cmd update --restart=no "$container" >/dev/null
  docker_cmd stop --time 20 "$container" >/dev/null
  docker_cmd rename "$container" "$backup"
  old_renamed=1
fi
new_attempted=1
docker_cmd run -d --name "$container" --label "mermer.deployment=$release" \
  --label "org.opencontainers.image.revision=$commit" \
  --network "$network" --restart unless-stopped \
  --env-file "$env_file" -e STATE_DIR=/app/data \
  -v "$volume:/app/data" -p 127.0.0.1:3000:3000 \
  --log-opt max-size=10m --log-opt max-file=3 "$image" >/dev/null

log 'Checking the new container, localhost endpoint and public HTTPS endpoint.'
healthy=0
streak=0
for (( attempt=1; attempt<=30; attempt++ )); do
  running=$(docker_cmd inspect --format '{{.State.Running}}' "$container" 2>/dev/null || true)
  local_reply=$(curl --noproxy '*' -fsS --connect-timeout 2 --max-time 4 http://127.0.0.1:3000/ 2>/dev/null || true)
  public_reply=$(curl -fsS --connect-timeout 3 --max-time 5 "$public_url" 2>/dev/null || true)
  if [[ "$running" == true && "$local_reply" == ok && "$public_reply" == ok ]]; then
    streak=$((streak + 1))
    if (( streak >= 3 )); then healthy=1; break; fi
  else streak=0; fi
  sleep 2
done
(( healthy )) || die 'Health checks failed. The previous container will be restored.'
committed=1
# These bookkeeping operations must not roll back a healthy running deployment.
if ! docker_cmd tag "$image" mermer-bot:node24; then log 'Warning: could not update the convenience image tag.'; fi
if ! printf '%s\n' "$commit" > "$deploy_dir/last-successful-commit"; then log 'Warning: could not record the successful commit.'; fi
log "Deployment succeeded: main $commit"
(( !old_exists )) || log "Previous container retained (stopped): $backup"
log 'HTTP checks passed. In Discord, use /social and test the voice-based features.'
