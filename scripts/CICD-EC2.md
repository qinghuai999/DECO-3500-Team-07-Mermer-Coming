# Deploying to EC2 from a button on GitHub

This setup is **automatic CI plus manually triggered CD**. Tests run automatically on every push to `main` and every pull request to `main`. Clicking **Deploy EC2 → Run workflow** once on GitHub runs the tests again and then deploys automatically through AWS Systems Manager. Pushing code does not replace the live bot straight away.

Deployment path: `GitHub main → tests → temporary AWS identity → SSM Run Command → EC2 builds the image → container replaced → HTTP check`.

Current repository: [qinghuai999/DECO-3500-Team-07-Mermer-Coming](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming). If everything was already set up under the old owner, follow the transfer checklist below first; there is no need to rebuild from scratch.

## The repository has moved to qinghuai999: migrate in this order

This checklist applies when only the GitHub repository was transferred and the original AWS account and EC2 instance are still in use. Checked through the GitHub API on 2026-09-17: the new owner ID is `58069249`, the repository ID is still `1340324828`, and the default branch is still `main`.

On the same day, `AWS_ROLE_ARN` was confirmed to exist in the new repository with the correct value, and the read-only deploy key named `mermer-ec2-readonly` had been kept. Neither needs to be recreated just because of the transfer. Whether the private key on EC2 matches that public key has not yet been verified, and the trust policy on AWS has not been changed.

| Where | What to do |
|---|---|
| Files in the local repository | The three deployment and authentication scripts and the trust policy JSON have been updated for the new owner; commit and push these changes |
| origin on the local Mac | Change it to the new repository address, using the commands below |
| AWS IAM deployment role | Edit the existing role's **Trust relationships** and replace it with the complete updated JSON |
| Actions variables in the new repository | Check that `AWS_ROLE_ARN` exists and has the correct value; the same AWS role needs no change of ARN |
| origin of the EC2 working directory | Change it to the new address and fetch the new authentication script from `main` |
| GitHub authentication on EC2 | For HTTPS, the credential must be saved again for the new repository path; for SSH, check the original deploy key and reuse the existing key |
| GitHub deployment run | When the setup is complete, start a new Run workflow; do not re-run an old commit from before the transfer |

### A. In a terminal on the Mac: update origin, commit and push

```bash
cd /Users/sushiqi/Java/IdeaProject/Q/DECO-3500-Team-07-Mermer-Coming
git remote set-url origin https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming.git
git remote -v
```

HTTPS is used here, the same protocol as the local remote used before. After confirming which changes to publish, commit in the IDE and push to `main`, or merge through a pull request if branch protection requires it. Changing local files alone does not update EC2 or AWS IAM.

### B. In the AWS console: change the trust policy of the existing role

Open **IAM → Roles → mermer-github-deploy → Trust relationships → Edit trust policy**, replace the contents with the complete [`aws/github-trust-policy.json`](aws/github-trust-policy.json) from this repository, and save.

The two allowed values in the new policy are:

```text
repo:qinghuai999/DECO-3500-Team-07-Mermer-Coming:ref:refs/heads/main
repo:qinghuai999@58069249/DECO-3500-Team-07-Mermer-Coming@1340324828:ref:refs/heads/main
```

The old owner's subject must be replaced; changing only the repository URL is not enough. Keep the role's existing `MermerDeployEC2` permissions policy and the OIDC provider. With the same AWS account, region and instance, these do not need to be recreated.

### C. In the new GitHub repository: check the deployment variable

Open **Settings → Secrets and variables → Actions → Variables** and confirm:

```text
AWS_ROLE_ARN = arn:aws:iam::081999475353:role/mermer-github-deploy
```

If it already exists with the correct value, leave it as it is; create it only if it is missing. The role name does not need to change to match the GitHub username.

### D. In EC2 Session Manager: update the remote and the authentication

Run `sudo -iu ec2-user` on its own first, then follow [“Updating EC2 after the repository transfer” in `DEPLOY-EC2.md`](DEPLOY-EC2.md#transfer-ec2) to update origin, the scripts in the runtime directory, and the GitHub authentication. That section has the exact commands for both HTTPS and SSH; choose the one you used before.

A GitHub transfer keeps deploy keys, so if you use SSH, first check **Settings → Deploy keys** in the new repository. The original key can usually be reused; there is no need to delete and regenerate it just because of the transfer. See [GitHub's notes on transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).

HTTPS credentials are saved by this project's script per repository path, and the old path belongs to the old owner. You must therefore run the **new** authentication script to save the credential again, and the token itself must be able to read the new repository.

### E. Start a new deployment

In the new repository, go to **Actions → Deploy EC2 → Run workflow → main**. Do not click Re-run on an old failed run: that would use the scripts from the old commit again. A new run checks out the new commit, obtains AWS permissions and deploys.

The EC2 instance, public IP, DuckDNS, Caddy, the Discord application and its token, the channel IDs, `bot.env`, the Docker network and the data volume do not need to change because of the GitHub transfer. The name of the local repository directory can also stay the same. The separate deployment cache is fetched from the new URL in the script each time, so neither the cache nor the data volume needs to be deleted.

The following sections are kept for first-time setup. If you have completed the transfer checklist, go straight to “Every release from now on”.

## 1. Commit these files to main on GitHub

In your IDE, check and commit `.github/workflows/` and `scripts/`, and push to the remote `main`. Do not commit `bot.env`, tokens, private keys or runtime data. If `main` has protection rules, commit to a branch first and merge through a pull request.

While these files exist only locally, GitHub does not show the new deployment button. After the first push, **CI** runs automatically under Actions.

## 2. Add the GitHub identity provider in AWS (once)

In the AWS console, open **IAM → Identity providers**. If `token.actions.githubusercontent.com` is already there, open it, confirm that the Audience includes `sts.amazonaws.com`, and reuse it.

Otherwise click **Add provider**:

- Provider type: **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`
- Click **Add provider**.

GitHub uses this identity provider to obtain short-lived AWS credentials, so no AWS access key needs to be stored. See [GitHub's setup guide](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

## 3. Create an IAM role used only for GitHub deployments (once)

Open **IAM → Roles → Create role → Custom trust policy**:

1. Replace the contents of the editor with the complete [`aws/github-trust-policy.json`](aws/github-trust-policy.json).
2. On the next step, do not add any broad managed permissions yet.
3. Enter **mermer-github-deploy** as the role name and create the role.
4. Open the new role and choose **Permissions → Add permissions → Create inline policy → JSON**.
5. Paste the complete [`aws/github-deploy-permissions.json`](aws/github-deploy-permissions.json).
6. Enter **MermerDeployEC2** as the policy name and save.

These two files are already configured from earlier screenshots: AWS account `081999475353`, region `ap-southeast-2`, instance `i-0fb34ffbb056595e0`. Check the current AWS account when you do this. If the account or the instance changes, the policies and the settings in the scripts must be changed to match.

**EC2 keeps using its original `mermer-ec2-ssm` role. The new role is not attached to EC2.** The original role lets the instance connect to SSM; the new role allows GitHub to send deployment commands to this instance.

The trust policy only allows the `main` branch of this GitHub repository, and lists both of GitHub's default subject formats. The repository and owner IDs have been checked against GitHub. No GitHub Environment needs to be created; if an Environment is added later, the OIDC subject must be changed with it.

The permission to send commands only allows the target instance and `AWS-RunShellScript`. The APIs for querying and cancelling commands do not support resource-level restrictions, so those two use `Resource: "*"` and are limited by region. See the [AWS permissions reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_ssm.html).

## 4. Add one variable on GitHub (once)

Open the Settings of the **project repository**, not your personal account settings:

**Settings → Secrets and variables → Actions → Variables → New repository variable**

- Name: `AWS_ROLE_ARN`
- Value: `arn:aws:iam::081999475353:role/mermer-github-deploy`

If you chose a custom path when creating the role, use the role ARN that the IAM page actually shows. If you do not have access to the repository's Settings, ask a repository administrator to do this step. This is an ordinary variable; do not enter a GitHub password, a token or the Discord token here.

## 5. Check the GitHub authentication and the existing setup on EC2 once

Open the EC2 terminal through the Session Manager you already use, and run this on its own first:

```bash
sudo -iu ec2-user
```

This approach relies on the existing Docker, Caddy, the `mermer-net` network and `mermer-runtime/bot.env`. **The temporary AWS identity is used to control EC2; EC2 still needs a GitHub read credential to pull the private repository.**

If `setup-github-auth.sh ssh/https` has already been set up for the **current new repository path**, keep using it. If the credential was set up before the transfer, complete the transfer checklist on this page first. If it has not been set up at all, follow “First installation” and “One-time authentication setup” in [`DEPLOY-EC2.md`](DEPLOY-EC2.md) once.

The following read-only checks can be run; none of them prints a token:

```bash
test -s /home/ec2-user/mermer-runtime/bot.env && echo 'bot.env exists'
sudo docker network inspect mermer-net --format '{{.Name}}'
sudo docker inspect mermer-bot --format '{{range .Mounts}}{{println .Type .Name .Destination}}{{end}}'
curl -fsS https://mermerteam07.duckdns.org/; printf '\n'
```

The mount output should include `volume mermer-data /app/data`, and the HTTP check should return `ok`. If the mount does not match, keep the old container and confirm where the existing data is first. The deployment script refuses to switch data storage, to avoid losing state.

CI/CD sends the deployment script from that commit to EC2 on every run. You do not need to copy the script by hand each time, and SSH port 22 does not need to be open.

## Every release from now on

1. When development is finished, merge or push the code to be released to **main** on GitHub.
2. Open the repository's **Actions → Deploy EC2 → Run workflow**.
3. Choose **main** as the branch and click the green **Run workflow**.
4. Open the run and look at the results of **tests** and **Deploy tested main through SSM**.

Green means that the tests and the HTTP check after deployment passed. The run summary shows the deployed commit, the instance and the SSM Command ID. Finally, use `/social` in Discord to verify the real interactions, the reading of voice channel members and the button permissions.

A deployment stops the bot briefly, and interactions in progress may be interrupted. It keeps the old container under a unique backup name, which avoids the earlier name clashes. If the new container fails to start or fails the HTTP check, it tries to restore the old container. The data volume stays shared, so a rollback does not undo data changes. The build and the tests use the same commit, but external npm and Docker dependencies can still affect the build; this version does not release a pre-built image artefact.

## Where to look when a run fails

| Where it failed, or the message | What to do |
|---|---|
| tests | Look at the failing test; the live container has not been replaced |
| AWS_ROLE_ARN missing | Check that the variable was created under this repository's Actions → Variables |
| Get temporary AWS credentials / AssumeRoleWithWebIdentity | Check the IAM provider, the role ARN, the trust policy, and that `main` was selected |
| SendCommand AccessDenied | Check the inline policy of the new deployment role |
| InvalidInstanceId / DeliveryTimedOut | Confirm that the instance is running and shows as Online in SSM; check the target region and instance ID |
| Git authentication failed | Update the deploy key or token that EC2 uses to read the repository |
| main changed after this workflow started | `main` received a new commit after this test run; click Run workflow again |
| Existing container must mount… | Confirm the original state directory and migrate the data before deploying; do not delete the old container first |
| Health checks failed | Read the restore result in the log, and check whether the old bot is reachable |

Do not click Cancel while the container is being switched. When monitoring fails or is cancelled, the script tries to cancel the SSM command, but after a forced termination or a power loss a rollback cannot be guaranteed. First check the result under **AWS Systems Manager → Run Command** using the Command ID, then start the next deployment. If the network dropped while the command was being sent and no Command ID was returned, also check the Run Command list first; do not assume that EC2 ran nothing. See [how SSM cancellation works](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_CancelCommand.html).

GitHub queues deployments one after another, and EC2 also has a deployment lock. The script keeps old images and stopped backup containers and does not clean up data automatically. After many deployments, check the disk from time to time and remove backups that are confirmed to be no longer needed.

## Verifying locally

```bash
cd discord-example-app
npm ci
npm test
cd ..
bash -n scripts/deploy-main.sh scripts/setup-github-auth.sh
python3 -m unittest discover -s scripts/test -p 'test_*.py' -v
```

The deployment tests use stand-ins for Git, Docker, HTTP and AWS calls. They do not operate a real EC2 instance or send Discord messages. Real AWS permissions and network connectivity can only be confirmed by the first workflow run after the one-time setup above.
