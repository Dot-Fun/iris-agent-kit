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
- An organization key may have a **role**, Manager or Member. It then acts as a person in that
  role with no person behind it. A Manager key holds manager powers: every power from an owner or
  admin, the creator's own from a manager. A Member key holds none, so it reads a contact's name,
  email and phone only, sends no SMS and cannot book or change an appointment for a team member.
- A **location-limited key** is an organization key limited to some locations. It always has a
  role, Manager unless its creator picked Member. An owner or admin creates one for any
  locations, and a manager with the staff power for their own, under Organization > API keys.
  Its role, locations and powers never change. It is revoked when its creator loses the powers it
  carries.
  `me_get` shows them as `api_key.role`, `api_key.location_ids` and `api_key.powers`.

Revoke a key in the screen where it was made. A revoked key gets 401 at once.

A personal key follows its owner. After a demotion from admin to member it keeps working with a
member's access. When the owner is deactivated or removed, it is revoked. An organization key is
revoked when the person who created it loses the powers it carries. That person is removed or
deactivated, an admin becomes a manager or member, or a manager becomes a member. Nobody can keep
it. If the agent gets 401 after a team change, ask the user for a new key.

An owner or admin can also turn agent access off, for one person or for everyone in a role. An
owner's access is always on. While it is off, that person's personal keys and OAuth tokens get
401, and My agent access says so. Nothing is revoked: the same key works again once an owner or
admin turns access back on. Do not create a new key in that case. Organization keys are not
affected.

## Send the key

```
Authorization: Bearer iris_sk_...
```

The scheme name `Bearer` is case-insensitive. Nothing else authenticates a public call: no query
parameter, no cookie, no body field.

## What the answers mean

- **401** `Invalid API key`: the header is missing, uses another scheme, or the key is malformed,
  unknown or revoked. All five cases give the same answer on purpose. A personal key or OAuth
  token also gets it while the person's agent access is off. Ask the user to check My agent
  access, and for a new key only if the page does not say access is off.
- **403** `insufficient_scope`: the key is live but lacks the scope named in `required`. The
  user creates a new key with the scope under My agent access, or under Organization > API keys.
- **403** `insufficient_role`: the person behind the credential is a MEMBER, and members cannot
  call this operation or act for another team member. A key with a role gets it on the operations
  a person in that role, with the key's powers, cannot call. A new scope does not help. An owner or
  admin must do it.

Call `me_get` to see the organization, the key's scopes and the full scope catalog.

## Scopes

| Scope | Label |
|---|---|
| `contacts:read` | Search and read contacts |
| `contacts:write` | Create and update contacts, notes, tags, suppression, SMS consent, and enroll contacts in sequences or cancel them through events |
| `sequences:read` | Read sequences, enrollments, send logs and totals |
| `sequences:write` | Author, activate, pause, resume and duplicate sequences, enroll and cancel |
| `appointments:read` | Read appointments, open slots, calendars, locations, booking options and territories |
| `appointments:write` | Book, reschedule and cancel appointments |
| `conversations:read` | Read conversations and messages |
| `conversations:write` | Send an SMS. A staff member sends only to their own clients, while their SMS setting is on |
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
`references/endpoints.md`, and the MCP tool list hides those tools from a MEMBER. A MANAGER gets
a MEMBER's access, plus the `deny` operations marked `x-manager-power` for a power the manager
holds, at their locations. With the `sequences` power that means the sequences bound to their
locations only, never an organization-wide one. An operation whose member access is `sms_setting`
(`conversations_send_sms`) admits a MEMBER only while their SMS setting is on, and only for their
own clients, and a MANAGER only with the `contacts` power. While a person may not text, the consent
page leaves `conversations:write` out and the grant drops it, and a personal key cannot take it.
