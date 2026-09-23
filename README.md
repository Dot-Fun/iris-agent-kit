# Iris agent kit

Connect an AI agent to [Iris](https://iris.dotfun.co), the AI receptionist by dotfun. This repo
holds everything an agent client needs:

- the `iris-api` skill, which teaches an agent the Iris API and the daily operator routine,
- the Iris MCP server connection,
- the public OpenAPI document (`openapi/openapi.json`),
- a plugin marketplace for Claude Code and Claude Cowork, and one for Codex.

Site: https://dot-fun.github.io/iris-agent-kit/ serves `llms.txt`, `llms-full.txt`,
`openapi.json` and the `.well-known` skill indexes.

## Before you start

1. **Get a key.** In the Iris dashboard, open Organization > API keys. Create a key with the
   scopes the agent needs. Iris shows the key once.
2. **Set the key.** Export it as `IRIS_API_KEY` in the environment the agent runs in:

   ```sh
   export IRIS_API_KEY=iris_sk_...
   ```

3. **Know the MCP status.** The MCP server is `https://api.iris.dotfun.co/api/v1/mcp`. It is
   rolling out behind a feature flag. If your organization does not have it yet, the server
   answers 404, and the skill still works over plain REST with the same key.

Never commit the key or paste it into a chat.

## Claude Code

Install:

```text
/plugin marketplace add Dot-Fun/iris-agent-kit
/plugin install iris@iris
```

Or from a shell: `claude plugin marketplace add Dot-Fun/iris-agent-kit`, then
`claude plugin install iris@iris`.

Auth: the plugin's `.mcp.json` sends `Authorization: Bearer ${IRIS_API_KEY}`. Start Claude Code
from a shell where `IRIS_API_KEY` is set.

Update: the plugin has no version, so every commit to `main` is an update. Claude Code checks
in the background. To update now, run `/plugin marketplace update iris`, then
`/plugin update iris@iris`.

## Claude Cowork and Claude Desktop

Install: in Cowork, or the Code tab of Claude Desktop, add the marketplace `Dot-Fun/iris-agent-kit`
and install the `iris` plugin. The skill arrives with it.

Auth: the MCP connection in Cowork, Claude Desktop chat and claude.ai is a custom connector
(Customize > Connectors, URL `https://api.iris.dotfun.co/api/v1/mcp`). These connectors cannot
send an API key header. They need OAuth on the Iris server, which is not live yet. Organizations
in Anthropic's request-headers beta can add `Authorization: Bearer iris_sk_...` under Request
headers today.

Update: Cowork checks the marketplace for updates. Press Update on the marketplace page to pull
now.

## Codex CLI and Codex desktop

Install the plugin:

```sh
codex plugin marketplace add Dot-Fun/iris-agent-kit
```

Then open `/plugins` in Codex and install `iris`. To install only the skill, run
`$skill-installer install https://github.com/Dot-Fun/iris-agent-kit/tree/main/skills/iris-api`
inside Codex.

Auth: add the MCP server to `~/.codex/config.toml`. The CLI, the desktop app and the IDE
extension share this file.

```toml
[mcp_servers.iris]
url = "https://api.iris.dotfun.co/api/v1/mcp"
bearer_token_env_var = "IRIS_API_KEY"
```

Update: run `codex plugin marketplace upgrade iris`, then restart the desktop app. Codex caches
the plugin by version, and every skill change here bumps it.

## ChatGPT

Iris on ChatGPT waits for OAuth. ChatGPT connectors do not accept an API key, and the Iris
server does not offer OAuth yet. This section changes when it does.

When OAuth ships: turn on Settings > Security and login > Developer mode, open
chatgpt.com/plugins, press the plus button, and enter `https://api.iris.dotfun.co/api/v1/mcp`.
ChatGPT reads the tool list live, so no update step exists.

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

Update: `hermes skills check`, then `hermes skills update iris-api`.

## OpenClaw

Install the skill:

```sh
openclaw skills install skills-sh:Dot-Fun/iris-agent-kit/iris-api
```

The skill stays inactive until `IRIS_API_KEY` is set.

Auth: add the MCP server, then set the `Authorization: Bearer ...` header in the Settings config
editor. Do not write the key into the config as a literal.

```sh
openclaw mcp add iris --url https://api.iris.dotfun.co/api/v1/mcp --transport streamable-http
```

Update: OpenClaw refreshes only ClawHub installs. Run the install command again to update.

## npx skills

Install for one or more agents:

```sh
npx skills add Dot-Fun/iris-agent-kit
npx skills add Dot-Fun/iris-agent-kit --skill iris-api -g -a claude-code -a codex -a hermes -a openclaw -y
```

Auth: set `IRIS_API_KEY`, and add the MCP server in each client as its section above shows.

Update: `npx skills update`.

## Gemini CLI

Install the skill:

```sh
gemini skills install https://github.com/Dot-Fun/iris-agent-kit.git --path skills/iris-api --consent
```

Auth: set `IRIS_API_KEY`. The skill calls the REST API with it.

Update: Gemini CLI has no update command. Run the install command again.

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
`agent-kit-publish` workflow copies them here on every push to its `develop` branch that
changes the public API contract or the skill. Do not edit those two paths in this repo: the next
publish overwrites them.

The rule: every change to an Iris `/api/v1` route updates the skill and this kit in the same
pull request. The monorepo enforces it. Its freshness check fails when the generated
`references/endpoints.md` drifts from the OpenAPI document, or when the document has an
operation the skill never names.

The Codex version rule: bump `version` in `.codex-plugin/plugin.json` in the same commit as any
change under `skills/`. Codex caches plugins by version, so without a bump Codex users keep the
old skill. The publish workflow does this for you (a patch bump). `.claude-plugin/plugin.json`
has no version on purpose: Claude Code and Cowork treat every commit as an update.

The site rebuilds on every push to `main`. To build it locally, run `node scripts/build-site.mjs`
and open `_site/index.html`. It needs Node 20 or newer and no packages.

## License

MIT. See `LICENSE`.
