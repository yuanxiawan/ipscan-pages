/**
 * Cloudflare Worker —— 私人订阅端点（零知识：你的 UUID/SNI 只存在 Worker 环境变量里）
 *
 * 功能：每次被请求时实时拉取本站最新优选 IP 列表，用你配置的参数拼接 VLESS 订阅，
 *      以标准 Base64 订阅串返回。客户端添加订阅地址后，每次「更新订阅」自动拿到最新 IP。
 *
 * 部署步骤（Cloudflare Dashboard，约 5 分钟）：
 *  1. Workers & Pages → Create Worker → 命名（如 my-sub）→ 粘贴本脚本 → Deploy
 *  2. Worker → Settings → Variables & Secrets 添加：
 *       SUB_TOKEN       必填  随机长字符串（≥32位），订阅地址里的访问口令
 *       VLESS_UUID      必填  你服务器的 UUID
 *       VLESS_SNI       必填  你的域名
 *       VLESS_PORT      可选  默认 443
 *       VLESS_TRANSPORT 可选  tls-tcp（默认）或 tls-ws
 *       VLESS_PATH      可选  tls-ws 时的 path，默认 /
 *       IPS_SOURCE      可选  默认本站 output/ips.txt
 *  3. 订阅地址：https://<worker名>.<账户子域>.workers.dev/sub?token=<SUB_TOKEN>
 *     在客户端（v2rayNG / Clash.Meta 等）添加为订阅即可；token 泄露时改 SUB_TOKEN 即可作废旧链接
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/sub") return new Response("Not found", { status: 404 });

    if (!env.SUB_TOKEN || url.searchParams.get("token") !== env.SUB_TOKEN) {
      return new Response("Forbidden", { status: 403 });
    }
    if (!env.VLESS_UUID || !env.VLESS_SNI) {
      return new Response("Worker 未配置 VLESS_UUID / VLESS_SNI", { status: 500 });
    }

    const ipsUrl = env.IPS_SOURCE || "https://yuanxiawan.github.io/ipscan-pages/output/ips.txt";
    let res;
    try {
      res = await fetch(ipsUrl, { cf: { cacheTtl: 0 } });
    } catch (e) {
      return new Response("IP source unreachable", { status: 502 });
    }
    if (!res.ok) return new Response("IP source unavailable: " + res.status, { status: 502 });

    const text = await res.text();
    const ips = text.split("\n").map(s => s.trim()).filter(l => l && !l.startsWith("#")).slice(0, 20);
    if (!ips.length) return new Response("No IPs available", { status: 502 });

    const transport = env.VLESS_TRANSPORT || "tls-tcp";
    const port = env.VLESS_PORT || "443";
    const links = ips.map(ip => {
      const q = [];
      if (transport === "tls-ws") {
        q.push("security=tls", "type=ws");
        if (env.VLESS_SNI) q.push("sni=" + env.VLESS_SNI);
        q.push("path=" + encodeURIComponent(env.VLESS_PATH || "/"));
      } else {
        q.push("security=tls", "type=tcp");
        if (env.VLESS_SNI) q.push("sni=" + env.VLESS_SNI);
        q.push("alpn=h2,http/1.1");
      }
      return `vless://${env.VLESS_UUID}@${ip}:${port}?` + q.join("&") + "#" + encodeURIComponent(ip);
    });

    const sub = links.join("\n");
    const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(sub)));
    return new Response(b64, {
      headers: {
        "content-type": "text/plain;charset=utf-8",
        "cache-control": "no-store",
        "subscription-userinfo": "upload=0; download=0; total=0; expire=0",
      },
    });
  },
};
