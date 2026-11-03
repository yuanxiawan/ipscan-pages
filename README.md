# ipscan-pages · Cloudflare 优选 IP 订阅站

> **在线预览：<https://yuanxiawan.github.io/ipscan-pages/>**

Cloudflare Anycast IP 自动优选 + VLESS 订阅链接生成器。
纯静态站点（GitHub Pages），无后端、无追踪、零知识：所有涉及凭据的操作都在你自己的浏览器里完成。

## 它是什么 / 不是什么

- ✅ 每 30 分钟自动更新的 Cloudflare 优选 IP 列表（延迟、落地地区、POP 机场、综合评分）
- ✅ 浏览器端 VLESS 链接 / 批量订阅串生成器（TCP+TLS / WebSocket / gRPC / 明文 TCP）
- ✅ AES-256-GCM 加密的本地档案（保存 / 迁移你的配置）
- ❌ **不提供任何代理节点**——UUID、SNI 等信息必须来自你自己的服务器（如 Cloudflare Workers、自建 VLESS 服务端）。本页只负责"优选 IP"这一环。

## 快速上手

1. 打开[预览网址](https://yuanxiawan.github.io/ipscan-pages/)，等待「Top 扫描」表格加载
2. 在「生成订阅链接」卡片中：
   - **IP**：从 Top 榜下拉选择，或直接手动输入
   - **UUID**：填入你自己服务器的 UUID（36 位，形如 `xxxxxxxx-xxxx-…`）
   - **SNI / 端口 / 传输协议**：与你的服务端配置保持一致
3. 点击 **生成单条链接** → 复制 → 在客户端（v2rayN / v2rayNG / Clash.Meta 等）导入
   或点击 **生成批量订阅（Base64）** → 复制 → 客户端选择「从剪贴板导入订阅」

### 支持的传输协议与常用端口

| 协议 | 常用端口 | 说明 |
|---|---|---|
| TCP + TLS | 443 / 8443 / 2053 / 2083 / 2096 | 可选 XTLS flow（`xtls-rprx-vision`） |
| WebSocket + TLS | 443 / 8443 / 2053 | 可自定义 Path |
| gRPC + TLS | 443 / 8443 | 可自定义 serviceName |
| TCP 明文 | 80 / 8080 / 8880 | 无 TLS，无需 SNI |

## 加密档案（本地保存 / 换设备迁移）

- **加密保存到本浏览器**：参数与生成的链接以 AES-256-GCM 加密（PBKDF2 60 万轮）存入浏览器，下次打开输入口令一键恢复
- **下载 .vlessbox**：加密档案文件，可备份或迁移——在其它设备打开本页 → 导入文件 → 输入同一口令即恢复
- 口令永不保存于明文、永不上传；**忘记口令 = 档案无法恢复**（无任何找回手段）
- 「记住口令」为可选项：勾选后本机浏览器免输口令，安全性略降，请按需使用

## 安全与隐私

- 本页无后端、无统计脚本：你填写的 UUID / SNI 等信息只在浏览器内存中拼接成链接，**不会发送到任何服务器或仓库**
- 生成的 `vless://` 链接与 Base64 订阅串**内含明文 UUID，等同于你的凭据**，请勿公开发布或分享给不信任的人
- 本仓库（含 `output/` 数据文件）中只有 Cloudflare 的 IP 列表，不含任何用户凭据

## 数据说明

| 文件 | 内容 | 更新频率 |
|---|---|---|
| `output/scan_result.json` | 最新扫描结果（IP / POP / 地区 / 延迟 / 评分） | 每 60 分钟（GitHub Actions 自动） |
| `output/ips.txt` | 纯文本优选 IP 列表 | 同上 |
| `output/speed.json` | 真实出口测速结果（需 self-hosted runner） | 每小时（配置后） |

## 免责声明

本项目仅供学习研究使用，请遵守当地法律法规。使用本站生成的配置所产生的任何行为及后果，由使用者自行承担。
