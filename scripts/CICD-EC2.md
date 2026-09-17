# GitHub 点按钮部署 EC2

这版是 **自动 CI + 手动触发 CD**：提交到 main 或发起面向 main 的 Pull Request 时自动测试；在 GitHub 点一次 **Deploy EC2 → Run workflow**，会重新测试，然后通过 AWS Systems Manager 自动部署。提交代码不会立即替换线上机器人。

部署路径：`GitHub main → 测试 → AWS 临时身份 → SSM Run Command → EC2 构建镜像 → 替换容器 → HTTP 检查`。

## 1. 把这些文件提交到 GitHub main

在 IDE 中检查并提交 `.github/workflows/` 和 `scripts/`，推送到远端 main。不要提交 bot.env、Token、私钥或运行数据。如果 main 有保护规则，先提交分支再通过 PR 合并。

这些文件只存在本地时，GitHub 不会显示新的部署按钮。第一次推送后，Actions 中的 **CI** 会自动运行。

## 2. AWS 添加 GitHub 身份提供商（一次）

在 AWS 控制台打开 **IAM → Identity providers**。如果已经有 `token.actions.githubusercontent.com`，打开它确认 Audience 包含 `sts.amazonaws.com`，直接复用。

否则点 **Add provider**：

- Provider type：**OpenID Connect**
- Provider URL：`https://token.actions.githubusercontent.com`
- Audience：`sts.amazonaws.com`
- 点击 **Add provider**。

GitHub 用这个身份提供商取得短期 AWS 凭据，无需保存 AWS Access Key。[GitHub 官方配置说明](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)

## 3. 创建专门给 GitHub 部署用的 IAM Role（一次）

打开 **IAM → Roles → Create role → Custom trust policy**：

1. 用 [`aws/github-trust-policy.json`](aws/github-trust-policy.json) 的完整内容替换编辑框。
2. 下一步先不添加宽泛的托管权限。
3. Role name 填 **mermer-github-deploy**，创建角色。
4. 打开新角色，选择 **Permissions → Add permissions → Create inline policy → JSON**。
5. 粘贴 [`aws/github-deploy-permissions.json`](aws/github-deploy-permissions.json) 的完整内容。
6. 策略名填 **MermerDeployEC2**，保存。

这两个文件已按此前截图配置：AWS 账号 `081999475353`、区域 `ap-southeast-2`、实例 `i-0fb34ffbb056595e0`。操作时核对当前 AWS 账号。如果换账号或实例，需要同步调整策略和脚本中的配置。

**EC2 继续使用原来的 `mermer-ec2-ssm` 角色。新角色不绑定到 EC2。** 原角色负责实例连接 SSM，新角色负责允许 GitHub 向这个实例发送部署命令。

信任策略只允许这个 GitHub 仓库的 main 分支，同时列出了 GitHub 的两种默认 subject 格式。仓库、所有者 ID 已从 GitHub 核对。不需要创建 GitHub Environment；如果以后增加 Environment，必须一起修改 OIDC subject。

发送命令权限只允许目标实例和 `AWS-RunShellScript`。查询/取消命令的 API 不支持资源级限制，因此这两项使用 `Resource: "*"` 并限制区域。[AWS 权限参考](https://docs.aws.amazon.com/service-authorization/latest/reference/list_ssm.html)

## 4. GitHub 添加一个变量（一次）

打开**项目仓库**的 Settings，不是个人账号 Settings：

**Settings → Secrets and variables → Actions → Variables → New repository variable**

- Name：`AWS_ROLE_ARN`
- Value：`arn:aws:iam::081999475353:role/mermer-github-deploy`

如果创建角色时选了自定义 path，请使用 IAM 页面实际显示的 Role ARN。如果你没有仓库 Settings 权限，请让仓库管理员完成这一步。这里是普通变量，不需要填 GitHub 密码、Token 或 Discord Token。

## 5. EC2 检查一次 GitHub 认证和现有配置

通过你现在使用的 Session Manager 打开 EC2 终端，先单独执行：

```bash
sudo -iu ec2-user
```

本方案依赖现有 Docker、Caddy、`mermer-net` 网络和 `mermer-runtime/bot.env`。**AWS 的临时身份用于控制 EC2；EC2 拉取私有 GitHub 仓库仍然需要 GitHub 读取凭据。**

如果已经按之前脚本保存了 `mermer-runtime/github-credentials`，或者配置过 `setup-github-auth.sh ssh/https`，可以沿用。否则按照 [`DEPLOY-EC2.md`](DEPLOY-EC2.md) 的“第一次安装”和“一次性配置认证”完成一次，推荐只读 Deploy Key。

可执行以下只读检查，均不会输出 Token：

```bash
test -s /home/ec2-user/mermer-runtime/bot.env && echo 'bot.env exists'
sudo docker network inspect mermer-net --format '{{.Name}}'
sudo docker inspect mermer-bot --format '{{range .Mounts}}{{println .Type .Name .Destination}}{{end}}'
curl -fsS https://mermerteam07.duckdns.org/; printf '\n'
```

挂载输出应含 `volume mermer-data /app/data`，HTTP 应返回 `ok`。如果挂载不匹配，先保留旧容器并确认现有数据位置；部署脚本会拒绝切换数据存储，避免丢失状态。

CI/CD 每次自动传送该提交中的部署脚本到 EC2，不需要每次手动复制脚本，也不需要开放 SSH 22 端口。

## 以后每次上线

1. 开发完成，把需要上线的代码合并或推送到 GitHub **main**。
2. 打开仓库 **Actions → Deploy EC2 → Run workflow**。
3. Branch 选择 **main**，点击绿色 **Run workflow**。
4. 打开这次运行，查看 **tests** 和 **Deploy tested main through SSM** 两项结果。

绿色表示测试和部署 HTTP 检查通过。运行摘要会显示部署的 commit、实例和 SSM Command ID。最后在 Discord 用 `/social` 验证实际交互、语音成员读取和按钮权限。

部署会短暂停止机器人，正在进行的交互可能中断。它会保留旧容器，使用唯一备份名，避免之前的重名问题；新容器启动或 HTTP 检查失败时尝试恢复旧容器。数据卷继续共用，回滚不撤销数据变化。构建与测试使用相同提交，但 npm/Docker 外部依赖仍可能影响构建；这版不是预构建镜像制品发布。

## 红色失败时看哪里

| 出错位置或信息 | 操作 |
|---|---|
| tests | 查看失败的测试；线上容器尚未被替换 |
| AWS_ROLE_ARN missing | 检查变量是否建在该仓库的 Actions → Variables |
| Get temporary AWS credentials / AssumeRoleWithWebIdentity | 检查 IAM 提供商、角色 ARN、信任策略，以及是否选择 main |
| SendCommand AccessDenied | 检查新部署角色的 inline policy |
| InvalidInstanceId / DeliveryTimedOut | 确认实例运行，且 SSM 显示 Online；检查目标区域和实例 ID |
| Git authentication failed | 在 EC2 更新读取仓库的 Deploy Key 或 Token |
| main changed after this workflow started | 本次测试后 main 又有新提交；重新点 Run workflow |
| Existing container must mount… | 确认原状态目录并迁移数据后再部署，不要先删旧容器 |
| Health checks failed | 查看日志中的恢复结果，并检查旧机器人能否正常访问 |

不要在切换容器期间点 Cancel。监控失败/取消时脚本会尝试取消 SSM 命令，但强制终止、断电等情况下不能保证完成回滚；先在 **AWS Systems Manager → Run Command** 根据 Command ID 检查结果，再部署下一次。若发送命令时网络断开、没有拿到 Command ID，也先检查 Run Command 列表，不能假定 EC2 完全没执行。[SSM 取消语义](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_CancelCommand.html)

GitHub 会串行安排部署，EC2 也有部署锁。脚本保留旧镜像和停止的备份容器，不自动清理数据；多次部署后需定期查看磁盘并清理确认不再需要的备份。

## 本地验证

```bash
cd discord-example-app
npm ci
npm test
cd ..
bash -n scripts/deploy-main.sh scripts/setup-github-auth.sh
python3 -m unittest discover -s scripts/test -p 'test_*.py' -v
```

部署测试使用模拟 Git、Docker、HTTP 和 AWS 调用，不会操作真实 EC2 或发送 Discord 消息。真正的 AWS 权限和网络连通性，需要完成上述一次性配置后的首次工作流运行才能确认。
