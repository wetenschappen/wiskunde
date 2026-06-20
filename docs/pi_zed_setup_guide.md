# Pi AI CLI + Zed AI Bridge — Setup Guide

> **Last Updated:** 2026-06-19  
> **Status:** Production — reflects current installed state

---

## 📋 Architecture Overview

Pi Coding Agent does not support native OAuth plugins, so we use a **Local Proxy Architecture**:

```
pi-zed (launcher)
  └─► Pi Coding Agent  (anthropic-messages API)
        └─► POST http://localhost:5005/v1/messages   ← zed-proxy.js
              └─► POST https://cloud.zed.dev/completions
                    └─► Claude Sonnet 4.6 (via Zed AI subscription)
```

| Component | File | Purpose |
|---|---|---|
| Token interceptor | `/usr/local/bin/zed-token` | Reads Zed's OAuth JWT from process memory |
| Proxy server | `~/.zed-proxy/zed-proxy.js` | Translates Anthropic → Zed format, attaches JWT |
| Model config | `~/.pi/agent/models.json` | Routes `anthropic` provider to local proxy |
| Pi settings | `~/.pi/agent/settings.json` | Autocompact enabled |
| Launcher | `~/.local/bin/pi-zed` | Starts proxy, checks token, launches Pi |

---

## 🛠️ Installation

### Step 1: Install Pi CLI

```bash
npm install -g @earendil-works/pi-coding-agent
```

---

### Step 2: Token Interceptor (`zed-token`)

Scans Zed editor's process memory for the active OAuth JWT and writes it to `~/.zed-proxy/auth.json`. Must be run with `sudo` to access `/proc/<pid>/mem`.

**File: `/usr/local/bin/zed-token`** (also at `~/.local/bin/zed-token`)
```python
#!/usr/bin/env python3
import os, re, sys, json

def find_zed_pid():
    pids = []
    for sub in os.listdir('/proc'):
        if sub.isdigit():
            try:
                with open(os.path.join('/proc', sub, 'cmdline'), 'r') as f:
                    cmd = f.read()
                    if 'zed-editor' in cmd and '--crash-handler' not in cmd:
                        pids.append(int(sub))
            except: pass
    return pids

def scan_mem(pid):
    try:
        maps_file = open(f'/proc/{pid}/maps', 'r')
        mem_file  = open(f'/proc/{pid}/mem', 'rb')
    except PermissionError:
        print(f"Permission denied for PID {pid}. Run with sudo.")
        return []
    except: return []
    jwt_pattern = re.compile(br'eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_~+/=]+')
    tokens = set()
    for line in maps_file:
        parts = line.strip().split()
        if len(parts) < 2: continue
        addr_range, perms = parts[0], parts[1]
        if not perms.startswith('rw'): continue
        if len(parts) >= 6:
            path = parts[-1]
            if path.startswith('/') or path.startswith('['):
                if not (path == '[heap]' or path == '[stack]'): continue
        start_str, end_str = addr_range.split('-')
        start, end = int(start_str, 16), int(end_str, 16)
        if end - start > 100 * 1024 * 1024: continue
        try:
            mem_file.seek(start)
            data = mem_file.read(end - start)
            for match in jwt_pattern.finditer(data):
                try:
                    token = match.group(0).decode('utf-8')
                    if "eyJhbGciOiJIUzI1NiJ9" in token:
                        tokens.add(token)
                except: pass
        except: pass
    maps_file.close(); mem_file.close()
    return list(tokens)

def main():
    pids = find_zed_pid()
    if not pids:
        print("Zed editor is not running. Launch Zed and log in first.")
        sys.exit(1)
    print(f"Scanning memory of Zed (PIDs: {pids})...")
    token = None
    for pid in pids:
        tokens = scan_mem(pid)
        if tokens: token = tokens[0]; break
    if not token:
        print("Could not intercept token. Make sure Zed is logged in.")
        sys.exit(1)
    print("Successfully intercepted Zed session token.")
    sudo_user = os.environ.get("SUDO_USER")
    home_dir = os.path.expanduser(f"~{sudo_user}") if sudo_user else os.path.expanduser("~")
    auth_json_path = os.path.join(home_dir, ".zed-proxy/auth.json")
    try:
        auth_data = json.load(open(auth_json_path)) if os.path.exists(auth_json_path) else {}
    except: auth_data = {}
    auth_data["zed-ai"] = {
        "methodID": "oauth", "type": "oauth",
        "token": token, "expires": 1781894759000
    }
    os.makedirs(os.path.dirname(auth_json_path), exist_ok=True)
    with open(auth_json_path, 'w') as f:
        json.dump(auth_data, f, indent=2)
    print("Zed token has been synchronized with Pi.")

if __name__ == '__main__':
    main()
```

```bash
chmod +x /usr/local/bin/zed-token
chmod +x ~/.local/bin/zed-token
```

**Auto-refresh cron (every 30 min):**
```
*/30 * * * * /home/albertshalaj/.local/bin/zed-token > /dev/null 2>&1
```

> **If token is expired and `sudo zed-token` pulls the same expired token:** Zed's own session died. Fix: sign out → sign back in inside Zed editor → `sudo zed-token`.

---

### Step 3: Proxy Server (`~/.zed-proxy/zed-proxy.js`)

Translates Anthropic API requests into Zed's format and streams responses back.

**Optimisations built in:**
- **Prompt caching** — preserves `cache_control` on system prompt array, tool definitions (last tool), and last user message content blocks → 3 Anthropic cache breakpoints active
- **Adaptive thinking** — forwards Pi's `thinking` param so Sonnet 4.6 reasons when needed
- **Temperature suppression** — automatically dropped when thinking is active (Anthropic requirement)

The full current file is at `~/.zed-proxy/zed-proxy.js`. Key function `buildZedPayload`:

```javascript
function buildZedPayload(originalBody) {
    const { messages = [], system, tools, max_tokens, temperature } = originalBody;

    // Tools: preserve cache_control on last tool for caching
    let cleanTools;
    if (Array.isArray(tools)) {
        cleanTools = tools.map(t => ({
            name: t.name || t.id,
            description: t.description,
            input_schema: t.input_schema || t.parameters,
            ...(t.cache_control && { cache_control: t.cache_control }),
        })).filter(t => t.name);
    }

    // Messages: cache_control on last user message preserved via `return block`
    const cleanMessages = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => { /* normalises tool_use/tool_result blocks, passes rest through */ });

    // System: pass as array (with cache_control intact), plain text for Zed wrapper
    const systemParam = system || "";
    const systemText  = Array.isArray(system) ? system.map(b => b.text||"").join("\n") : (system||"");

    // Thinking: forward from Pi; drop temperature when active
    const { thinking } = originalBody;
    const thinkingActive = thinking && thinking.type !== "disabled";

    return {
        thread_id: crypto.randomUUID(), prompt_id: crypto.randomUUID(),
        intent: "user_prompt", provider: "anthropic", model: "claude-sonnet-4-6",
        provider_request: {
            model: "claude-sonnet-4-6", max_tokens: max_tokens || 64000,
            messages: cleanMessages,
            ...(cleanTools?.length > 0 && { tools: cleanTools }),
            system: systemParam,
            ...(thinking && { thinking }),
            ...(!thinkingActive && { temperature: temperature || 1.0 }),
        },
        system: systemText,
        ...(!thinkingActive && { temperature: temperature || 1.0 }),
    };
}
```

---

### Step 4: Model Config (`~/.pi/agent/models.json`)

Minimal — only overrides the `anthropic` provider's base URL. NVIDIA NIM and DeepSeek are added natively through Pi's built-in provider menu (full native support, correct compat flags, 1M context windows).

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "http://localhost:5005"
    }
  }
}
```

---

### Step 5: Pi Settings (`~/.pi/agent/settings.json`)

```json
{
  "lastChangelogVersion": "0.79.8",
  "theme": "dark",
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-6",
  "compaction": {
    "enabled": true
  }
}
```

`compaction.enabled` activates Pi's autocompact — summarises old history when context grows large.

---

### Step 6: Launcher (`~/.local/bin/pi-zed`)

```bash
#!/usr/bin/env bash

mkdir -p /home/albertshalaj/.local/share/opencode/log

# 1. Start proxy if not running
if ! curl -s http://127.0.0.1:5005 > /dev/null; then
    echo "Starting Zed Proxy server..."
    nohup node /home/albertshalaj/.zed-proxy/zed-proxy.js \
        > /home/albertshalaj/.local/share/opencode/log/zed-proxy.log 2>&1 &
    sleep 1
fi

# 2. Check token validity
node -e "
const fs = require('fs'), path = require('path');
const authJsonPath = path.join(process.env.HOME||'/home/albertshalaj', '.zed-proxy/auth.json');
if (!fs.existsSync(authJsonPath)) { console.log('\x1b[31mauth.json missing. Run sudo zed-token.\x1b[0m'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(authJsonPath,'utf8'));
const zedAi = data['zed-ai'];
if (!zedAi || (!zedAi.key && !zedAi.token)) { console.log('\x1b[31mToken missing. Run sudo zed-token.\x1b[0m'); process.exit(1); }
try {
  const payload = JSON.parse(Buffer.from((zedAi.token||zedAi.key).split('.')[1],'base64').toString('utf8'));
  const now = Math.floor(Date.now()/1000);
  if (now >= payload.exp) {
    console.log('\x1b[33mWarning: Token EXPIRED (' + new Date(payload.exp*1000).toLocaleString() + ').\x1b[0m');
    console.log('\x1b[33mSign out/in in Zed editor, then run sudo zed-token.\x1b[0m\n');
  } else {
    console.log('\x1b[32mToken VALID. (' + Math.floor((payload.exp-now)/60) + ' min remaining)\x1b[0m');
  }
} catch(e) { console.log('\x1b[31mError parsing token. Run sudo zed-token.\x1b[0m'); }
"

# 3. Launch Pi — 1-hour prompt cache TTL via PI_CACHE_RETENTION=long
ANTHROPIC_API_KEY=foo PI_CACHE_RETENTION=long pi "$@"
```

```bash
chmod +x ~/.local/bin/pi-zed
```

---

## 🚀 Daily Usage

```bash
pi-zed                  # Launch
sudo zed-token          # Refresh token (Zed must be running and logged in)
/compact                # Compact session history mid-session
/model                  # Switch model (e.g. to DeepSeek for execution turns)
Ctrl+C → pi-zed        # Start fresh session for a new task
```

---

## ⚡ Capability Summary

| Feature | Status | Notes |
|---|---|---|
| Text generation | ✅ Full | |
| Tool use (read/write/bash/grep/find/ls) | ✅ Full | |
| Streaming | ✅ Full | |
| 1M context window | ✅ Full | |
| 64K max output | ✅ Full | |
| Prompt caching (3 breakpoints, 1h TTL) | ✅ Full | System + tools + history |
| Adaptive thinking | ✅ Full | Model decides when to reason |
| Autocompact | ✅ Enabled | Pi's built-in defaults |
| Model selection | ⚠️ Fixed to Sonnet 4.6 | All Anthropic model selections → Sonnet 4.6 |
| Cost tracking | ❌ N/A | Zed doesn't return token counts |
| Subagents / parallelism | ❌ None | Pi is single-threaded sequential |

---

## 💰 Budget Optimisation ($10/month Zed AI)

With 3 cache breakpoints + 1h TTL, cached tokens cost **$0.30/MTok** vs **$3.00/MTok** fresh (10× cheaper). By turn 10 of a session, 85–90% of input tokens are cache hits.

**Tips:**
- `/compact` when switching topics — keeps rolling history small
- Start `pi-zed` from project directory (not `~`) — scoped context
- New task → new session — avoids carrying irrelevant history
- Add short `AGENTS.md` in project root — Pi auto-loads it (cached after turn 1)
- For NVIDIA NIM / DeepSeek: add via Pi's native `/login` — no manual config

---

## 🔧 Troubleshooting

### "Auth file not found at ~/.qwen/auth.json"
A stale old proxy process is still running. Kill it:
```bash
pkill -f "node.*zed-proxy.js"
pi-zed   # restarts the correct proxy automatically
```

### Token expires and `sudo zed-token` keeps pulling the same expired token
Zed's session died. Fix: sign out → sign in inside Zed UI → `sudo zed-token`.

### Proxy fails to start
```bash
cat ~/.local/share/opencode/log/zed-proxy.log
```
