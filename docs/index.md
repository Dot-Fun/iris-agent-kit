# Iris agent kit

This kit connects an AI agent to Iris, the AI receptionist by dotfun.

- **Skill.** `skills/iris-api/SKILL.md` teaches the API: whoami first, the never-write rule, the
  error envelope, paging, scopes, and the operator recipes (find a contact, check enrollments,
  enroll, cancel, pause and resume, read the send log and totals, build a draft sequence).
- **MCP.** `https://api.iris.dotfun.co/api/v1/mcp`, Streamable HTTP, bearer API key. Tool names are
  the API operationIds. The server is rolling out behind a feature flag.
- **OpenAPI.** `openapi.json` is the public v1 contract. The skill and the MCP tools come from it.
- **Discovery.** `/.well-known/skills/index.json` (v0.1.0) and `/.well-known/agent-skills/index.json`
  (v0.2.0) list the skill for clients that install from a URL.

Install steps for Claude Code, Claude Cowork and Desktop, Codex, ChatGPT, Hermes Agent, OpenClaw,
`npx skills` and Gemini CLI are in the README: https://github.com/Dot-Fun/iris-agent-kit#readme
