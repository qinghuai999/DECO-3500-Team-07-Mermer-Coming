# Discord 控制面板

## 当前实现

- 一条消息包含 Funny Exit、Collaborative Portrait、Random Picker 三个按钮，发布时自动置顶。
- Funny Exit：私密预览 → Another One / Send / Cancel。只有确认 Send 才会在结果频道公开发送并标明离开者。
- Portrait 和 Random Picker：入口可点击，当前仅给点击者返回“尚未开放”，未实现多人会话、AI 画像、公平轮换或数据库。
- 保留 `/test`，`/excuse` 改为同样的私密预览流程。
- 再次发布会查找并更新本机器人已有面板；也可指定 `PANEL_MESSAGE_ID` 精确更新。机器人重启不会重新发面板。

Discord 置顶消息不会一直悬浮在聊天窗口顶部。推荐创建独立的 `#bot-panel` 普通文字频道，只有机器人发消息；互动结果发到游戏聊天频道。把 `#bot-panel` 放在频道列表前面，玩家打开它即可看到三个入口。Discord 无法由机器人强制所有客户端进服后自动打开指定频道。

## 1. 配置频道

在 Discord 创建 `#bot-panel`，为普通玩家允许 View Channel、Read Message History，关闭 Send Messages。按钮仍可使用。需要检查其他身份组覆盖权限，确保普通玩家不能持续发送消息把面板挤走。

机器人在面板频道需要 View Channel、Read Message History、Send Messages、Embed Links、Pin Messages；在游戏聊天频道需要 View Channel、Send Messages。无需授予 Administrator。角色权限为英文列出，中文客户端对应查看频道、读取消息历史、发送消息、嵌入链接、置顶消息。

打开 Discord 用户设置 → Advanced → Developer Mode，右键两个频道 → Copy Channel ID。`GUILD_ID` 是服务器 ID，不是频道 ID。

## 2. 更新 EC2 代码与配置

先将本次代码提交并推送到团队仓库的 `main`（或合并对应 PR），再在 **EC2 Session Manager 终端**执行：

```bash
cd ~/DECO-3500-Team-07-Mermer-Coming
git pull --ff-only origin main
cd discord-example-app
sudo docker build -t mermer-bot:node24 .
```

确认构建成功才进行后续步骤。若 Git 提示输入密码，使用有仓库读取权限的 GitHub token，不是账户密码。

编辑现有服务器配置，保留已有 APP_ID、PUBLIC_KEY、DISCORD_TOKEN 等内容：

```bash
nano /home/ec2-user/mermer-runtime/bot.env
```

补充以下配置，把中文占位内容换成真实 ID，等号后不要留空格：

```dotenv
GUILD_ID=服务器ID
PANEL_CHANNEL_ID=面板频道ID
RESULT_CHANNEL_ID=游戏聊天频道ID
```

不配置 `RESULT_CHANNEL_ID` 时，结果发送到点击按钮所在频道，会逐渐挤走面板，因此推荐单独设置结果频道。两个频道都应位于 `GUILD_ID` 对应服务器。配置与 token 留在服务器运行目录，不提交 Git。

## 3. 更新机器人容器

先保留旧容器用于回退。以下备份名称如果已存在，需要换一个未使用的名称：

```bash
sudo docker stop mermer-bot
sudo docker rename mermer-bot mermer-bot-before-panel
sudo docker run -d \
  --name mermer-bot \
  --network mermer-net \
  --restart unless-stopped \
  --env-file /home/ec2-user/mermer-runtime/bot.env \
  -p 127.0.0.1:3000:3000 \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  mermer-bot:node24
```

检查机器人已启动及 HTTPS 仍正常：

```bash
sudo docker logs --tail 30 mermer-bot
curl -fsS https://mermerteam07.duckdns.org/
```

预期显示 `Listening on port 3000` 和 `ok`。Caddy 与 Discord 的 Interactions Endpoint URL 保持现有配置。

## 4. 发布并置顶

```bash
sudo docker exec mermer-bot npm run panel
```

该命令会实际发送或更新一条 Discord 面板消息并置顶。成功后打印消息链接及 `PANEL_MESSAGE_ID`，记录它以便后续精确更新。不要对同一频道同时运行多个发布命令。

如果提示面板已保存但置顶失败，补上机器人的 Pin Messages 权限，再次运行即可。重新发布会复用现有面板。也可以使用输出的消息 ID：

```bash
sudo docker exec -e PANEL_MESSAGE_ID=消息ID mermer-bot npm run panel
```

面板入口无需重新注册 slash command。

## 5. 验收

1. 用普通玩家账号进入面板频道，确认三个按钮可见、可点击且不能发聊天消息。
2. 点击 Funny Exit：仅自己看到预览，游戏频道没有消息。
3. Another One 更换理由；Cancel 结束预览，无公开消息。
4. 重新打开预览并 Send：游戏频道出现一条消息，重复点击不会重复发送。
5. 点击另外两个入口：仅自己看到待开放提示。
6. 再运行发布命令：更新同一条消息，不重复创建面板。

本阶段私密预览保存于单进程内存，10 分钟过期；机器人重启会使旧预览失效，重新点击面板即可。暂不支持多副本部署。网络超时导致发送结果不确定时，先检查结果频道，程序不会自动重发。

如新容器启动失败，可回退旧版本：

```bash
sudo docker rm -f mermer-bot
sudo docker rename mermer-bot-before-panel mermer-bot
sudo docker start mermer-bot
```

旧版本无法处理新面板按钮；回退后暂时不要使用面板，修复并重新部署再启用。

本地验证：`npm test`，所有 Discord 写入均由测试替身处理，不会发布真实消息。

参考：[Discord 置顶说明](https://support.discord.com/hc/en-us/articles/221421867-Pin-Messages-FAQ)、[Discord 消息 API](https://docs.discord.com/developers/resources/message)。
