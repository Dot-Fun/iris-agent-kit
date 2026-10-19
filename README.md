# Iris agent kit

Connect an AI agent to [Iris](https://iris.dotfun.co), the AI receptionist by dotfun. This repo
holds everything an agent client needs:

- the `iris-api` skill, which teaches an agent the Iris API and the daily operator routine,
- the Iris MCP server connection,
- the public OpenAPI document (`openapi/openapi.json`),
- a plugin marketplace for Claude Code and Claude Cowork, and one for Codex.

Setup guide: https://www.dotfun.co/iris/mcp shows the steps for every client on one page.

Site: https://dot-fun.github.io/iris-agent-kit/ serves `llms.txt`, `llms-full.txt`,
`openapi.json` and the `.well-known` skill indexes.

## Before you start

The MCP server is `https://api.iris.dotfun.co/api/v1/mcp`. Chat apps (claude.ai, Claude Desktop,
ChatGPT) sign in with Iris (OAuth) and need no key. Claude Code and Codex can sign in with Iris
or send an API key. The plugins, the skill and the other clients need an API key:

1. **Get a key.** In the Iris dashboard, open Organization > API keys. Create a key with the
   scopes the agent needs. Iris shows the key once.
2. **Set the key.** Export it as `IRIS_API_KEY` in the environment where the agent runs:

   ```sh
   export IRIS_API_KEY=iris_sk_...
   ```

Never commit the key or paste it into a chat.

Iris tools send real SMS and book real appointments. Keep your client set to confirm each
write. For read-only access, give the key only `:read` scopes.

## Cursor and VS Code

- [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=iris&config=eyJ1cmwiOiJodHRwczovL2FwaS5pcmlzLmRvdGZ1bi5jby9hcGkvdjEvbWNwIn0=)
- [Install in VS Code](https://vscode.dev/redirect/mcp/install?name=iris&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapi.iris.dotfun.co%2Fapi%2Fv1%2Fmcp%22%7D)

GitHub may not open the Cursor link, because it uses a custom scheme. If a link does not open,
copy its URL into your browser:

```text
cursor://anysphere.cursor-deeplink/mcp/install?name=iris&config=eyJ1cmwiOiJodHRwczovL2FwaS5pcmlzLmRvdGZ1bi5jby9hcGkvdjEvbWNwIn0=
https://vscode.dev/redirect/mcp/install?name=iris&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapi.iris.dotfun.co%2Fapi%2Fv1%2Fmcp%22%7D
```

Auth: Cursor and VS Code cannot sign in with Iris yet, so they send an API key.

- Cursor: after you install, add `"headers": { "Authorization": "Bearer ${env:IRIS_API_KEY}" }`
  to the `iris` entry in `~/.cursor/mcp.json`.
- VS Code: run MCP: Open User Configuration and add the same header. Use a `promptString`
  input in place of the environment variable.

## Claude Code

Install:

```text
/plugin marketplace add Dot-Fun/iris-agent-kit
/plugin install iris@iris
```

From a shell, run `claude plugin marketplace add Dot-Fun/iris-agent-kit`, then
`claude plugin install iris@iris`.

Auth: the plugin's `.mcp.json` sends `Authorization: Bearer ${IRIS_API_KEY}`. Start Claude Code
from a shell where `IRIS_API_KEY` is set.

To sign in with Iris instead, connect the MCP server without the plugin:

1. Run `claude mcp add --transport http iris https://api.iris.dotfun.co/api/v1/mcp`.
2. In Claude Code, open `/mcp`, choose `iris` and sign in.

Update: the plugin has no version, so every commit to `main` is an update. Claude Code checks
for updates in the background. To update now, run `/plugin marketplace update iris`, then
`/plugin update iris@iris`.

## Claude Cowork and Claude Desktop

Install: in Cowork or the Code tab of Claude Desktop, add the marketplace
`Dot-Fun/iris-agent-kit` and install the `iris` plugin. The skill comes with the plugin.

Auth: Cowork, Claude Desktop chat and claude.ai connect to the MCP server through a custom
connector:

1. Open Customize > Connectors.
2. Add a custom connector with the URL `https://api.iris.dotfun.co/api/v1/mcp`.
3. Press Connect and sign in with Iris.

Update: Cowork checks the marketplace for updates. To update now, press Update on the
marketplace page.

## Codex CLI and Codex desktop

Install the plugin:

1. Add the marketplace:

   ```sh
   codex plugin marketplace add Dot-Fun/iris-agent-kit
   ```

2. Open `/plugins` in Codex and install `iris`.

To install only the skill, run
`$skill-installer install https://github.com/Dot-Fun/iris-agent-kit/tree/main/skills/iris-api`
inside Codex.

Auth: to sign in with Iris, run `codex mcp add iris --url https://api.iris.dotfun.co/api/v1/mcp`,
then `codex mcp login iris`.

To use an API key instead, add the MCP server to `~/.codex/config.toml`. The CLI, the desktop
app and the IDE extension share this file.

```toml
[mcp_servers.iris]
url = "https://api.iris.dotfun.co/api/v1/mcp"
bearer_token_env_var = "IRIS_API_KEY"
```

Update: run `codex plugin marketplace upgrade iris`, then restart the desktop app. Codex caches
the plugin by version, and every skill change here bumps the version.

## ChatGPT

1. Turn on Settings > Security and login > Developer mode.
2. Open chatgpt.com/plugins and press the plus button.
3. Enter `https://api.iris.dotfun.co/api/v1/mcp`.
4. When ChatGPT asks, sign in with Iris.

ChatGPT reads the tool list live, so it needs no update step.

## Hermes Agent

Install the skill:

```sh
hermes skills install Dot-Fun/iris-agent-kit/skills/iris-api
```

Hermes asks for `IRIS_API_KEY` because the skill declares it.

Auth: add the MCP server to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  iris:
    url: "https://api.iris.dotfun.co/api/v1/mcp"
    headers:
      Authorization: "Bearer ${IRIS_API_KEY}"
```

Update: run `hermes skills check`, then `hermes skills update iris-api`.

## OpenClaw

Install the skill:

```sh
openclaw skills install skills-sh:Dot-Fun/iris-agent-kit/iris-api
```

The skill stays inactive until you set `IRIS_API_KEY`.

Auth:

1. Add the MCP server:

   ```sh
   openclaw mcp add iris --url https://api.iris.dotfun.co/api/v1/mcp --transport streamable-http
   ```

2. In the Settings config editor, set the `Authorization: Bearer ...` header. Do not write the
   key into the config as a literal.

Update: OpenClaw refreshes only ClawHub installs. To update, run the install command again.

## npx skills

Install for one or more agents:

```sh
npx skills add Dot-Fun/iris-agent-kit
npx skills add Dot-Fun/iris-agent-kit --skill iris-api -g -a claude-code -a codex -a hermes -a openclaw -y
```

Auth: set `IRIS_API_KEY`. Then add the MCP server in each client, as that client's section
shows.

Update: run `npx skills update`.

## Gemini CLI

Install the skill:

```sh
gemini skills install https://github.com/Dot-Fun/iris-agent-kit.git --path skills/iris-api --consent
```

Auth: set `IRIS_API_KEY`. The skill calls the REST API with it.

Update: Gemini CLI has no update command. To update, run the install command again.

## What is in this repo

| Path | Used by |
|---|---|
| `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json` | Claude Code, Claude Cowork |
| `.agents/plugins/marketplace.json`, `.codex-plugin/plugin.json` | Codex |
| `.mcp.json` | Claude Code, Claude Cowork |
| `skills/iris-api/` | every client |
| `openapi/openapi.json` | code generators, the site |
| `docs/llms.txt`, `docs/index.md` | the site |
| `scripts/build-site.mjs`, `.github/workflows/pages.yml` | the site build |

## Maintaining

The Iris monorepo is the source of `skills/iris-api/` and `openapi/openapi.json`. Its
`agent-kit-publish` workflow copies them here. The workflow runs on every push to the monorepo
`develop` branch that changes the public API contract or the skill. Do not edit those two paths
in this repo. The next publish overwrites them.

Every change to an Iris `/api/v1` route must update the skill and this kit in the same pull
request. The monorepo enforces this rule. Its freshness check fails when the generated
`references/endpoints.md` differs from the OpenAPI document. It also fails when the document
has an operation that the skill does not name.

Codex version rule: bump `version` in `.codex-plugin/plugin.json` in the same commit as any
change under `skills/`. Codex caches plugins by version, so without a bump Codex users keep the
old skill. The publish workflow makes this patch bump for you. `.claude-plugin/plugin.json` has
no version on purpose, because Claude Code and Cowork treat every commit as an update.

The site rebuilds on every push to `main`. To build it locally, run `node scripts/build-site.mjs`
and open `_site/index.html`. The build needs Node 20 or newer and no packages.

## License

MIT. See `LICENSE`.
