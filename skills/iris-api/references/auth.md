# Authentication and connection

## Get a key

1. Sign in to the Iris dashboard at https://iris.dotfun.co.
2. Open Settings > My agent access.
3. Create a key. Pick only the scopes the agent needs.
4. Copy the key. Iris shows it once and stores only a hash.
5. Put it in the `IRIS_API_KEY` environment variable of the agent.

A key looks like `iris_sk_` followed by 32 characters and belongs to one organization. There are
two kinds:

- A **personal key** acts for the member who created it, with that member's role and locations
  now. Any active member creates one under My agent access, and there is no limit on how many.
  An owner or admin sees every personal key under Organization > API keys and can revoke it
  there.
- An **organization key** acts on the whole organization. Only an owner or admin creates one,
  under Organization > API keys.

Revoke a key in the screen where it was made. A revoked key gets 401 at once.

A personal key follows its owner. After a demotion from admin to member it keeps working with a
member's access. When the owner is deactivated or removed, it is revoked. An organization key does
not stop when the person who created it loses admin power. When an owner demotes that admin to
member, deactivates them or removes them, Iris offers to revoke the organization keys they created,
and revokes them unless the owner unticks the box. If the agent gets 401 after a team change, ask
the user for a new key.

## Send the key

```
Authorization: Bearer iris_sk_...
```

The scheme name `Bearer` is case-insensitive. Nothing else authenticates a public call: no query
parameter, no cookie, no body field.

## What the answers mean

- **401** `Invalid API key`: the header is missing, uses another scheme, or the key is malformed,
  unknown or revoked. All five cases give the same answer on purpose. Ask the user for a new key.
- **403** `insufficient_scope`: the key is live but lacks the scope named in `required`. The
  user creates a new key with the scope under My agent access, or under Organization > API keys.
- **403** `insufficient_role`: the person behind the credential is a MEMBER, and members cannot
  call this operation or act for another team member. A new scope does not help. An owner or admin must do it.

Call `me_get` to see the organization, the key's scopes and the full scope catalog.

## Scopes

| Scope | Label |
|---|---|
| `contacts:read` | Search and read contacts |
| `contacts:write` | Create and update contacts, notes, tags, suppression, SMS consent |
| `sequences:read` | Read sequences, enrollments, send logs and totals |
| `sequences:write` | Author, activate, pause, resume and duplicate sequences, enroll and cancel |
| `appointments:read` | Read appointments and calendars |
| `appointments:write` | Book, reschedule and cancel appointments |
| `conversations:read` | Read conversations and messages |
| `conversations:write` | Send an SMS |
| `calls:read` | Read calls and transcripts |
| `audiences:read` | Read audiences |
| `audiences:write` | Add and remove audience members |

`me_get` returns the live catalog. When this table and `me_get` differ, trust `me_get`.

## Rate limit

600 requests a minute per client address on each public route. A 429 means wait 60 seconds.

## MCP connection

The MCP server is `https://api.iris.dotfun.co/api/v1/mcp` (Streamable HTTP, stateless). It is
rolling out behind a feature flag. An organization without the flag gets 404 after the key is
checked. Tool names are the operationIds, and read tools carry `readOnlyHint: true`.

Clients that can send a header use the key today:

- Claude Code: the `iris` plugin's `.mcp.json` sends `Authorization: Bearer ${IRIS_API_KEY}`.
- Codex: in `~/.codex/config.toml`:

  ```toml
  [mcp_servers.iris]
  url = "https://api.iris.dotfun.co/api/v1/mcp"
  bearer_token_env_var = "IRIS_API_KEY"
  ```

- Hermes Agent: in `~/.hermes/config.yaml`:

  ```yaml
  mcp_servers:
    iris:
      url: "https://api.iris.dotfun.co/api/v1/mcp"
      headers:
        Authorization: "Bearer ${IRIS_API_KEY}"
  ```

- OpenClaw: `openclaw mcp add iris --url https://api.iris.dotfun.co/api/v1/mcp --transport streamable-http`,
  then set the `Authorization` header in the Settings config editor.

claude.ai, Claude Desktop, Claude Cowork and ChatGPT cannot send a custom header. They connect
with OAuth instead (IRIS-3783):

1. Add `https://api.iris.dotfun.co/api/v1/mcp` as a custom connector. In Claude, open
   Customize > Connectors. In ChatGPT, turn on Developer mode, then add a connector. Leave the
   client id and secret empty: the client registers itself.
2. The client opens the Iris consent page. The user signs in and approves the scopes it lists.
   Any active member can approve. A member's client reaches only what that member can do: their
   locations, and no operation marked `deny`.
3. The client holds the tokens and refreshes them itself. Nothing goes in an environment
   variable.

Each person sees the clients they connected under My agent access, and an owner or admin sees
every connected client under Organization > API keys, with who granted it. Revoke in either place
ends its access at once. Each person who approves a client gets their own connection. It keeps
working after a demotion, with the new role's access, and stops when that person is deactivated
or leaves the organization (IRIS-4138). Claude Code and Codex can use OAuth too: add the server with no header
and they start the same flow. An OAuth token answers `me_get` with `api_key: null` and an
`oauth_client` that names the client and its scopes.

An OAuth token acts for the person who approved it, and a personal key for its owner, with that
person's current role. `me_get` shows them as `principal`: `user_id`, `role` and
`location_ids`. Iris reads the role on every request. A MEMBER cannot call an operation whose member access is `deny` in
`references/endpoints.md`, and the MCP tool list hides those tools from a MEMBER.
