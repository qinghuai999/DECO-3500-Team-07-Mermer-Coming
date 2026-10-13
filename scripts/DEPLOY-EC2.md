# Deploying GitHub main from EC2 with one command

These scripts are for the existing EC2, Docker and Caddy setup. Running one command by hand fetches the remote `main`, builds it, replaces the container and checks the HTTP service, without asking for GitHub credentials each time. This is not yet CI/CD that triggers on every push.

To trigger testing and deployment from a button on GitHub, follow the [CI/CD setup guide](CICD-EC2.md). This page is still used for the first-time authentication setup on EC2, and for deploying by hand when needed.

The current repository is [qinghuai999/DECO-3500-Team-07-Mermer-Coming](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming). For the existing EC2 instance, follow the next section once after the repository transfer; for a new machine, go to “First installation”.

<a id="transfer-ec2"></a>
## Updating EC2 after the repository transfer

First push the new versions of the scripts to `main` of the new repository from your Mac, then do the following. This updates how EC2 authenticates to read from GitHub; the AWS OIDC trust policy and the GitHub variable are updated separately, following the [CI/CD guide](CICD-EC2.md).

### 1. In the EC2 terminal, switch user and update origin

In Session Manager, run this on its own first:

```bash
sudo -iu ec2-user
```

Then run:

```bash
cd /home/ec2-user/DECO-3500-Team-07-Mermer-Coming
git remote set-url origin https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming.git
git fetch origin main
```

The working directory keeps using HTTPS for this one update. If asked for a username, enter `qinghuai999`; for the password, enter a GitHub token that can read the new repository. The working directory's remote and the deployment script's authentication are independent, so later deployments can still use SSH.

If you already use a dedicated deploy key and do not want to use a token for this one update, use the following instead of the `set-url` and `fetch` above:

```bash
git remote set-url origin git@github.com:qinghuai999/DECO-3500-Team-07-Mermer-Coming.git
GIT_SSH_COMMAND='ssh -F /dev/null -i /home/ec2-user/mermer-runtime/github-deploy-key -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/home/ec2-user/mermer-runtime/github-known-hosts -o HostKeyAlgorithms=ssh-ed25519' git fetch origin main
```

Only use this alternative if the key and the known-hosts file already exist and the new repository still has that public key registered. Later manual fetches also need this dedicated key specified; the automated deployment script specifies it by itself.

### 2. After a successful fetch, update the scripts in the runtime directory

The following commands validate both scripts in a temporary directory before installing them, so a failed fetch cannot overwrite the existing scripts. Copy and run the whole block together:

```bash
(
  set -eu
  cd /home/ec2-user/DECO-3500-Team-07-Mermer-Coming
  script_tmp=$(mktemp -d)
  trap 'rm -rf -- "$script_tmp"' EXIT
  git show FETCH_HEAD:scripts/setup-github-auth.sh > "$script_tmp/setup-github-auth.sh"
  git show FETCH_HEAD:scripts/deploy-main.sh > "$script_tmp/deploy-main.sh"
  bash -n "$script_tmp/setup-github-auth.sh" "$script_tmp/deploy-main.sh"
  grep -q "repo='qinghuai999/DECO-3500-Team-07-Mermer-Coming'" "$script_tmp/setup-github-auth.sh"
  grep -q "repository='qinghuai999/DECO-3500-Team-07-Mermer-Coming'" "$script_tmp/deploy-main.sh"
  mkdir -p /home/ec2-user/mermer-runtime
  chmod 700 /home/ec2-user/mermer-runtime
  install -m 700 "$script_tmp/setup-github-auth.sh" /home/ec2-user/mermer-runtime/setup-github-auth.sh
  install -m 700 "$script_tmp/deploy-main.sh" /home/ec2-user/mermer-runtime/deploy-main.sh
  echo 'Updated scripts for qinghuai999.'
)
```

Continue only when you see `Updated scripts for qinghuai999.`. Otherwise, first confirm that the local updates have been pushed to `main` of the new repository and that the fetch above succeeded. This does not switch the branch of the original working directory, and it does not overwrite `bot.env` or the runtime data.

### 3. Choose one, matching the authentication you used before

**If you used an HTTPS token: the credential must be saved again for the new path.**

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh https
```

Enter `qinghuai999` and a token that can read the new repository. The script limits the credential to the new repository path. The old token can be reused if it still has access. For a fine-grained token, check that the resource owner is `qinghuai999`, that the new repository is selected, and that it grants at least read access to Contents; create a new token if necessary. Do not print the credentials file in the terminal.

**If you used an SSH deploy key: reuse the key and confirm it is registered on GitHub.**

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh ssh
```

An existing key is reused, and the script only shows the public key. In the new repository, check **Settings → Deploy keys** for this public key. If it is there, do not add it again; add it only if it is missing, and keep it read-only. GitHub's documentation describes how a transfer keeps deploy keys: [transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).

Choose only one of the two. Whichever you run last becomes the method used by automated deployment. When done, go back to GitHub and start a new run: **Deploy EC2 → Run workflow → main**. You do not need to start a deployment by hand on EC2.

## Push local changes to main first

AWS can only get commits that are on GitHub. Feature changes and the scripts in this directory are not deployed while they are uncommitted or unpushed.
Check and commit the changes you need in your IDE, then push to the remote `main`. Do not commit `bot.env`, tokens or SSH private keys.

## First installation (in the EC2 Session Manager terminal)

Run this on its own first:

```bash
sudo -iu ec2-user
```

When you see the `ec2-user` prompt, run:

```bash
cd /home/ec2-user/DECO-3500-Team-07-Mermer-Coming
git remote set-url origin https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming.git
mkdir -p /home/ec2-user/mermer-runtime
chmod 700 /home/ec2-user/mermer-runtime
git fetch origin main
```

If this still uses HTTPS, it asks for an account and a token; in the password field enter a GitHub Personal Access Token, not your GitHub login password.
Then copy the two committed scripts. You do not need to switch the branch EC2 is on:

```bash
git show FETCH_HEAD:scripts/setup-github-auth.sh > /home/ec2-user/mermer-runtime/setup-github-auth.sh
git show FETCH_HEAD:scripts/deploy-main.sh > /home/ec2-user/mermer-runtime/deploy-main.sh
chmod 700 /home/ec2-user/mermer-runtime/setup-github-auth.sh /home/ec2-user/mermer-runtime/deploy-main.sh
```

If `git show` reports that the path does not exist, first confirm that both scripts have been pushed to `main` on GitHub. Do not go on to run empty scripts.

## One-time authentication setup: choose one

### Option A: read-only SSH deploy key

Suitable for someone who can manage the repository's Settings, or who can ask a repository administrator to add the public key.

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh ssh
```

The script creates a dedicated key on EC2 and shows the **public key**. On this project's GitHub page, go to:

`Settings → Deploy keys → Add deploy key`

- Title: `mermer-ec2-readonly`
- Key: paste the complete `ssh-ed25519 ...` public key shown by the script
- **Do not tick Allow write access**

This only needs to be added once. The private key stays on EC2. The script verifies the server's identity with GitHub's official Ed25519 host key and does not turn host verification off.

### Option B: reuse an existing username and token

If you are not a repository administrator, this option is usually more convenient. The token must already be able to read this private repository.

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh https
```

Enter your GitHub username and token when prompted. The token is not shown as you type and does not enter the shell command history.
It is saved on EC2 in the file `mermer-runtime/github-credentials`, with permissions 600, and is limited to this repository. **This is a plain-text credentials file on disk.** Do not commit it, screenshot it or share it. When the token expires or is revoked, run this command again to update it.

GitHub's documentation: [deploy keys and HTTPS tokens](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys).

## Every deployment after that is this one line

On EC2, as `ec2-user`, run:

```bash
bash /home/ec2-user/mermer-runtime/deploy-main.sh
```

The script always fetches the remote `main` of `qinghuai999/DECO-3500-Team-07-Mermer-Coming`, whatever directory or Git branch you are currently in. After the repository transfer, the old scripts in the runtime directory must be updated first; the steps are in the transfer section of this page.

What it does:

1. Checks the environment and takes a deployment lock, so two deployments cannot replace the container at the same time.
2. Fetches `main` into a separate Git cache and exports that commit to a temporary build directory, without overwriting the original working directory.
3. Builds a separate image labelled with the commit. The old bot keeps running during the build.
4. Stops the old container and gives it a unique backup name made from the time, the commit and the process ID, to avoid name clashes.
5. Starts the new `mermer-bot`, using the same environment file, network and data volume as before.
6. Checks three times in a row that the container is running and that both the local `/` and the public HTTPS `/` return `ok`.
7. If the start or the health check fails, tries to restore the old container's name, restart policy and previous running state.

There is a short interruption while the container is switched, and any vote in progress ends when the bot restarts. On failure the container is restored, but the contents of the data volume are not rolled back automatically. If a data format migration is introduced later, data backup and migration rollback should be designed separately.

## Fixed settings that match the existing environment

| Item | Value |
|---|---|
| Runtime user | ec2-user |
| Configuration file | `/home/ec2-user/mermer-runtime/bot.env` |
| Git cache and deployment records | `/home/ec2-user/mermer-deploy` |
| Container | `mermer-bot` |
| Docker network | `mermer-net` |
| Data volume | `mermer-data:/app/data` |
| Port | `127.0.0.1:3000:3000` |
| Public check | `https://mermerteam07.duckdns.org/` |

`bot.env` must already contain `APP_ID`, `PUBLIC_KEY`, `DISCORD_TOKEN`, `GUILD_ID`, `GAME_VOICE_CHANNEL_ID` and `SOCIAL_TEXT_CHANNEL_ID`. The script forces `STATE_DIR=/app/data` inside the container.

If the old container does not have `mermer-data:/app/data` mounted, the script exits before stopping it, to avoid switching to empty data by accident. Check where the current data is and migrate it first. Do not simply delete the old container.

Caddy keeps its existing configuration and is not rebuilt by the script. Backup containers are kept, but with automatic restart turned off, so that several bots do not connect at once when EC2 restarts. The script does not delete old images, backup containers or data volumes automatically. After a long period of deployments, backups that are confirmed to be no longer needed can be cleaned up by hand.

A successful HTTP check does not mean that Discord permissions and every feature have been verified. After a successful deployment, run `/social` in Discord, join the game voice channel, and test Random Pick, Trait Picker and sending an excuse.

The script does not register slash commands or publish channel messages. Current feature updates need no new commands. If the command definitions change in future, run the registration step separately.

## Verifying the scripts locally

```bash
bash -n scripts/setup-github-auth.sh scripts/deploy-main.sh
python3 scripts/test/test_deploy.py
```

In the tests, Git, Docker, sudo and HTTP are all stand-in programs. They do not contact AWS, GitHub or Discord.
