# 从 EC2 一键部署 GitHub main

这套脚本用于现有 EC2、Docker 和 Caddy 配置。每次手动运行一个命令，就会自动拉取远端 main、构建、替换容器并检查 HTTP 服务；无需反复输入 GitHub 凭据。它还不是“每次 push 后自动触发”的 CI/CD。

要在 GitHub 点按钮触发测试和部署，按 [CI/CD 配置指南](CICD-EC2.md) 操作。本页仍用于 EC2 首次认证配置，以及需要时手动部署。

## 先把本地修改推送到 main

AWS 只能拿到 GitHub 上的提交。本地未提交、未推送的功能修改和本目录脚本不会被部署。
请先在 IDE 中检查并提交需要的改动，再推送到远端 main。不要提交 bot.env、Token 或 SSH 私钥。

## 第一次安装（在 EC2 的 Session Manager 终端）

先单独执行：

```bash
sudo -iu ec2-user
```

看到 `ec2-user` 提示符后再执行：

```bash
cd /home/ec2-user/DECO-3500-Team-07-Mermer-Coming
mkdir -p /home/ec2-user/mermer-runtime
chmod 700 /home/ec2-user/mermer-runtime
git fetch origin main
```

这一次如果仍使用 HTTPS，会要求账号和 Token；Password 位置填 GitHub Personal Access Token，不是 GitHub 登录密码。
随后复制两个已提交的脚本，不需要切换 EC2 原来的分支：

```bash
git show FETCH_HEAD:scripts/setup-github-auth.sh > /home/ec2-user/mermer-runtime/setup-github-auth.sh
git show FETCH_HEAD:scripts/deploy-main.sh > /home/ec2-user/mermer-runtime/deploy-main.sh
chmod 700 /home/ec2-user/mermer-runtime/setup-github-auth.sh /home/ec2-user/mermer-runtime/deploy-main.sh
```

如果 git show 报路径不存在，先确认两个脚本已经推送到 GitHub main；不要继续运行空脚本。

## 一次性配置认证：二选一

### 方案 A：只读 SSH Deploy Key

适合可以管理仓库 Settings 的人，或者请仓库管理员添加公钥。

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh ssh
```

脚本会在 EC2 创建专用密钥并显示**公钥**。到这个项目的 GitHub 页面：

`Settings → Deploy keys → Add deploy key`

- Title：`mermer-ec2-readonly`
- Key：粘贴脚本显示的完整 `ssh-ed25519 ...` 公钥
- **不要勾选 Allow write access**

只需添加一次。私钥留在 EC2，脚本使用 GitHub 官方 Ed25519 主机公钥验证服务器身份，不会关闭主机验证。

### 方案 B：沿用已有用户名和 Token

如果你不是仓库管理员，这个方案通常更方便。Token 必须已有读取该私有仓库的权限。

```bash
bash /home/ec2-user/mermer-runtime/setup-github-auth.sh https
```

按提示输入 GitHub 用户名和 Token。Token 输入时不显示，也不进入 shell 命令历史。
它会保存在 EC2 的 `mermer-runtime/github-credentials` 文件中，权限为 600，并限定用于这个仓库。**这是磁盘上的明文凭据文件**，不要提交、截图或分享。Token 过期/撤销后，重新执行本命令更新。

GitHub 官方说明：[Deploy keys 与 HTTPS Token](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)。

## 以后每次部署只运行这一行

在 EC2、以 ec2-user 身份运行：

```bash
bash /home/ec2-user/mermer-runtime/deploy-main.sh
```

脚本固定拉取 `Arthur-Arcadia/DECO-3500-Team-07-Mermer-Coming` 的远端 `main`，不依赖你当前所在目录或当前 Git 分支。

流程：

1. 检查环境并锁定部署，避免两次部署同时替换容器。
2. 用独立 Git 缓存获取 main，导出该提交到临时构建目录，不覆盖原工作目录。
3. 构建带提交信息的独立镜像，构建期间旧机器人继续运行。
4. 暂停旧容器，以时间、提交号和进程号生成唯一备份名，避免重名。
5. 启动新 `mermer-bot`，继续使用原来的环境文件、网络和数据卷。
6. 连续三次检查容器运行状态、本机 `/` 和公网 HTTPS `/` 返回 `ok`。
7. 启动或健康检查失败时，尝试恢复旧容器的名称、重启策略和原运行状态。

切换容器时有短暂中断，进行中的投票会随机器人重启结束。失败时恢复容器，不自动回退数据卷内容；后续如果引入数据格式迁移，应另外设计数据备份和迁移回滚。

## 与现有环境对应的固定配置

| 项目 | 值 |
|---|---|
| 运行用户 | ec2-user |
| 配置文件 | `/home/ec2-user/mermer-runtime/bot.env` |
| Git 缓存/部署记录 | `/home/ec2-user/mermer-deploy` |
| 容器 | `mermer-bot` |
| Docker 网络 | `mermer-net` |
| 数据卷 | `mermer-data:/app/data` |
| 端口 | `127.0.0.1:3000:3000` |
| 公网检查 | `https://mermerteam07.duckdns.org/` |

bot.env 必须已有 APP_ID、PUBLIC_KEY、DISCORD_TOKEN、GUILD_ID、GAME_VOICE_CHANNEL_ID、SOCIAL_TEXT_CHANNEL_ID。脚本强制容器内 `STATE_DIR=/app/data`。

如果旧容器没有挂载 `mermer-data:/app/data`，脚本会在停止旧容器前退出，避免无意间换成空数据。先检查当前数据位置并迁移，不要直接删除旧容器。

Caddy 保持原配置，不会被脚本重建。备份容器保留但关闭自动重启，防止 EC2 重启时多个机器人同时连接。脚本不自动删除旧镜像、备份容器或数据卷；长期部署后可手动清理已确认不需要的备份。

HTTP 成功不代表 Discord 权限和所有业务流程都已验证。部署成功后在 Discord 执行 `/social`，进入游戏语音频道，测试 Random Pick、Trait Picker 和借口发送。

脚本不会自动注册 Slash Commands 或发布频道消息；当前功能更新无需新增命令。如果以后改变命令定义，再单独运行注册操作。

## 本地脚本验证

```bash
bash -n scripts/setup-github-auth.sh scripts/deploy-main.sh
python3 scripts/test/test_deploy.py
```

测试中的 Git、Docker、sudo 和 HTTP 都是模拟程序，不访问 AWS、GitHub 或 Discord。
