---
name: iris-api
description: Work an Iris organization through the Iris public API or the Iris MCP server. Use when asked to find or update a contact, check which sequences a contact is in, enroll or cancel a contact in a sequence, pause or resume a sequence, read a send log or sequence totals, build a draft sequence, or read appointments, conversations and calls in Iris.
required_environment_variables:
  - name: IRIS_API_KEY
    prompt: Iris API key (starts with iris_sk_)
    help: In the Iris dashboard, open Organization > API keys and create a key with the scopes you need. The key is shown once.
metadata:
  {
    "openclaw": {
      "requires": { "env": ["IRIS_API_KEY"] },
      "primaryEnv": "IRIS_API_KEY"
    }
  }
---

# Iris API

Iris is an AI receptionist for small businesses. It answers calls and texts, books
appointments, keeps a CRM of contacts, and follows up with email and SMS sequences.

This skill teaches you to act on one Iris organization with an API key. Every operation has an
operationId. The same name is the REST operation and the MCP tool, so a recipe step such as
`contacts_search` means "call the `contacts_search` tool" over MCP or "send the request that
`references/endpoints.md` lists under `contacts_search`" over REST.

- REST base URL: `https://api.iris.dotfun.co`
- MCP server: `https://api.iris.dotfun.co/api/v1/mcp` (Streamable HTTP)
- Every endpoint, with its parameters and scope: `references/endpoints.md`
- Keys, scopes and the connection details for each client: `references/auth.md`

The API is growing. If `references/endpoints.md` does not list an operation this skill names,
that operation is not live yet. Tell the user and stop. Do not guess a path.

Four operations may still carry older names in `references/endpoints.md`. Treat them as the
same operation:

| Name in this skill | Older name |
|---|---|
| `contacts_upsert` | `ContactsController_upsert` |
| `sequences_list` | `PublicSequencesController_listSequences` |
| `sequences_list_enrollments` | `PublicSequencesController_listEnrollments` |
| `contacts_list_enrollments` | `PublicSequencesController_listContactEnrollments` |

## Authenticate

Send the key as a bearer token on every request:

```
Authorization: Bearer $IRIS_API_KEY
```

Read the key from the `IRIS_API_KEY` environment variable. Never print it, never write it to a
file, and never put it in a URL. A key belongs to one organization. The organization always
comes from the key, never from a request body, so you cannot reach another organization.

## Start with whoami

Call `me_get` (`GET /api/v1/me`) before anything else. If `references/endpoints.md` does not
list `me_get` yet, skip this step and go on. It needs no scope beyond a live key. It returns:

- `organization`: the `id` and `name` you act on. Tell the user which organization it is.
- `api_key.scopes`: what this key may do. Do not call an operation whose scope is missing.
- `scopes_available`: every scope, with a label, so you can tell the user what to add.
- `rate_limit`: the request budget.

If `me_get` returns 401, the key is missing, wrong or revoked. Stop and ask the user for a new
key. Do not retry.

## The never-write rule

Some things are never writable with a key, whatever its scopes:

- hard delete of a contact or a sequence (no such operation exists),
- billing and the plan,
- organization membership,
- API keys,
- the voice agent configuration.

If the user asks for one of these, say that the API does not allow it and point them to the
Iris dashboard. Do not look for a workaround.

For the writes that do exist:

1. Read the current state first.
2. Tell the user what you will change.
3. Make the smallest write that does it.
4. Read the result back and report it.

Ask the user before any write that sends a message to a person (`sequences_activate`,
`sequences_resume`, `sequences_enroll`, `conversations_send_sms`) unless they asked for that
exact action.

## Errors

Every failure returns the same JSON envelope:

```json
{
  "statusCode": 403,
  "error": "insufficient_scope",
  "required": "contacts:read",
  "timestamp": "2026-09-22T12:00:00.000Z",
  "path": "/api/v1/contacts"
}
```

Branch on `statusCode` and `error`. Never branch on the text of `message`.

| statusCode | error | What to do |
|---|---|---|
| 400 | (validation) | Read `message`, fix the request, try once more. |
| 400 | `sequence_activation_blocked` | Show the user `blockers`. Fix them or stop. |
| 401 | | The key is missing, wrong or revoked. Stop and ask for a new key. |
| 403 | `insufficient_scope` | The key lacks the scope in `required`. Tell the user to add it under Organization > API keys. |
| 404 | | The id does not exist in this organization. Search again. Do not guess ids. |
| 409 | `sequence_inactive` | The sequence is off. Do not enroll. Ask the user. |
| 409 | `sequence_paused` | The sequence is paused. Resume it first, or wait. |
| 409 | `sms_not_permitted` | The contact has not consented or is suppressed. Do not send. |
| 429 | | Too many requests. Wait 60 seconds, then retry. |
| 5xx | | Retry once after a few seconds. Then stop and report. |

Over MCP, a failing tool call returns `isError: true` with the same envelope as its content.

## Paging

Most list operations take `page` (starts at 1) and `limit` (default 25, at most 100). Every
page echoes `total`, `page` and `limit`. Fetch the next page while `page * limit < total`.
`conversations_list` pages with a `cursor` instead: pass back the cursor from the last page.
Stop when you have what you need: do not read every page of a large list to answer one question.

## Scopes

A key carries scopes, one read and one write per noun:

| Scope | Lets you |
|---|---|
| `contacts:read` | search and read contacts |
| `contacts:write` | create and update contacts, notes, tags, suppression and SMS consent |
| `sequences:read` | read sequences, enrollments, send logs and totals |
| `sequences:write` | create, change, activate, pause, resume and duplicate sequences, enroll and cancel |
| `appointments:read` | read appointments and calendars |
| `appointments:write` | book, reschedule and cancel appointments |
| `conversations:read` | read conversations and their messages |
| `conversations:write` | send an SMS |
| `calls:read` | read calls and transcripts |
| `audiences:read` | read audiences |
| `audiences:write` | add and remove audience members |

Over MCP, the tool list shows only the tools your key's scopes allow.

## Operator recipes

### 1. Find a contact

1. If you have an email, call `contacts_search` with `email`. It returns the exact match only.
2. Otherwise call `contacts_search` with `q` (part of a name, email or phone).
3. If more than one contact matches, show the user the candidates (name, email, phone) and ask.
4. Call `contacts_get` with the `contactId` for the full record: stage, tags, custom fields.

Never create a contact to "find" one. `contacts_upsert` creates or updates by email, so use it
only when the user wants a contact created or changed.

### 2. Check which sequences a contact is in

1. Find the contact (recipe 1).
2. Call `contacts_list_enrollments` with the `contactId`.
3. Report each enrollment: sequence, `status`, current step, and the next send time.
   The next send time is `next_step_due_at`, or `next_run_at` when that is empty.

To go the other way (who is in one sequence), call `sequences_list` to find the sequence, then
`sequences_list_enrollments` with its `sequenceId`. Filter with `status`, `contact_id` or
`email`.

### 3. Enroll a contact without double-enrolling

1. Call `sequences_list` and pick the sequence. Its `status` must be `active`.
2. Find the contact (recipe 1).
3. Call `sequences_list_enrollments` with the `sequenceId` and `contact_id`. If an enrollment is
   `active` or `paused`, the contact is already in. Tell the user and stop.
4. Call `sequences_enroll` with `contact_id` (or `email`).
5. Read `status` in the answer:
   - `enrolled`: done. Report the enrollment.
   - `skipped` with `reason: already_enrolled`: the contact was already in. Nothing changed.
6. On 409 `sequence_inactive` or `sequence_paused`, stop and tell the user.

`sequences_enroll` is safe to retry: a second call answers `skipped`, not a second enrollment.

### 4. Cancel an enrollment

1. Find the enrollment with recipe 2. Note its `sequenceId` and `enrollmentId`.
2. Call `sequences_cancel_enrollment`.
3. The answer is the cancelled enrollment. A repeat call returns the same row, so a retry is
   safe.

### 5. Pause and resume a sequence

Pause holds every contact where they are. Nothing sends while the sequence is paused. Resume
continues each contact from its current step, with the same spacing. Use pause to fix the copy
of a live sequence.

1. Call `sequences_get` and check `status` is `active`.
2. Call `sequences_pause`. The answer shows `status: paused`.
3. Make the fix (recipe 8, step 4).
4. Call `sequences_resume`. The answer shows `status: active`.

Do not use `sequences_update` with `is_active: false` to pause. Deactivating cancels every
enrollment, and resume cannot bring them back.

### 6. Read the send log for one contact in one sequence

1. Find the enrollment (recipe 2).
2. Call `sequences_get_enrollment` with `sequenceId` and `enrollmentId`.
3. It returns the enrollment, its step runs and its events in order: sent, delivered, bounced,
   replied. Answer "what happened to this person" from these events only.

### 7. Read sequence totals

1. Call `sequences_analytics` with the `sequenceId`.
2. Report the per-step counts and the rollup.
3. Read `email_delivery_reporting` before you report email numbers:
   - `supported`: delivery and bounce counts are real.
   - `unsupported`: the sending provider does not report delivery. A zero means "unknown", not
     "none". Say so.
   - `not_applicable`: the sequence sends no email.

### 8. Build a draft sequence and activate it

1. Call `sequences_capabilities`, `sequences_list_triggers`, `sequences_list_variables` and
   `sequences_get_condition_vocabulary`. Use only the step kinds, triggers, variables and
   conditions they return.
2. Call `sequences_create` with the name, trigger, steps and delays. It always creates an
   inactive draft. Do not send `is_active: true`: it returns 400.
3. To start from a sequence that works, call `sequences_duplicate` instead and change the copy.
4. Call `sequences_update` to change steps, delays or copy. Read it back with `sequences_get`.
5. Show the user the draft and ask before you activate it.
6. Call `sequences_activate`. On 400 `sequence_activation_blocked`, show the `blockers` (for
   example a missing sending domain) and stop.

### 9. Keep the CRM current after a call

1. Find the contact (recipe 1).
2. Call `contacts_update` to change the name, phone, email, stage or custom fields. An unknown
   custom field key returns 400 naming it.
3. Call `contacts_add_note` with what you learned.
4. Call `contacts_add_tag` or `contacts_remove_tag` to change tags. Both are safe to repeat.
5. When a person asks to stop email or SMS, call `contacts_suppress` with the channels at once.

## Other operations

These follow the same rules. Their parameters are in `references/endpoints.md`.

- Appointments: `appointments_list`, `appointments_get`, `appointments_create`,
  `appointments_reschedule`, `appointments_cancel`. Call `calendars_list` to pick a calendar.
- Conversations: `conversations_list`, `conversations_get` (with messages),
  `conversations_send_sms`. Record SMS consent with `contacts_record_sms_consent`.
- Calls: `calls_list`, `calls_get` (with transcript).
- Audiences: `audiences_list`, `audiences_add_member`, `audiences_remove_member`. Both writes
  are safe to repeat.
