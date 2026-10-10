---
name: iris-api
description: Work an Iris organization through the Iris public API or the Iris MCP server. Use when asked to find or update a contact, check which sequences a contact is in, enroll or cancel a contact in a sequence, pause or resume a sequence, read a send log or sequence totals, build a draft sequence, schedule, start or pause a broadcast send, change an appointment’s title, notes or attendee details, or read appointments, conversations and calls in Iris.
required_environment_variables:
  - name: IRIS_API_KEY
    prompt: Iris API key (starts with iris_sk_)
    help: In the Iris dashboard, open Settings > My agent access and create a personal key with the scopes you need. An owner or admin can create an organization key under Organization > API keys instead. The key is shown once.
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

## Authenticate

Send the key as a bearer token on every request:

```
Authorization: Bearer $IRIS_API_KEY
```

Read the key from the `IRIS_API_KEY` environment variable. Never print it, never write it to a
file, and never put it in a URL. A key belongs to one organization. The organization always
comes from the key, never from a request body, so you cannot reach another organization.

## Connect over MCP

The MCP server is one operation, `mcp_request` (`POST /api/v1/mcp`). Add it to your client as
a Streamable HTTP server with the header `Authorization: Bearer $IRIS_API_KEY`. The config for
each client is in `references/auth.md`. Every other operation is a tool with the same name.
Read tools carry `readOnlyHint: true`. A 404 from the MCP URL means MCP is not turned on for
this organization yet. Use REST instead.

Claude Desktop, claude.ai, Cowork and ChatGPT cannot send that header. Add the MCP URL as a
custom connector with no header and no client id: the client finds the Iris authorization
server from the 401, registers itself, and opens the Iris consent page, where the user signs in
and approves the scopes. Any member can approve for themselves. The steps for each client are in `references/auth.md`. With OAuth, the
client holds the token and you do not need `IRIS_API_KEY`.

## Start with whoami

Call `me_get` (`GET /api/v1/me`) before anything else. It needs no scope beyond a live key.
It returns:

- `organization`: the `id` and `name` you act on. Tell the user which organization it is.
- `api_key.scopes`: what this key may do. Do not call an operation whose scope is missing.
  Over OAuth, `api_key` is null and `oauth_client.scopes` holds what the owner granted.
- `api_key.role`, `api_key.location_ids` and `api_key.powers`: for a key with a role, the role it
  acts at (`MANAGER` or `MEMBER`), the locations it is limited to and the manager powers it acts
  with. `role` and `powers` are null for a key with no role, and `location_ids` for a key that
  reaches the whole organization.
- `principal`: the person behind the credential, their `role` now and the `location_ids` they
  reach. Over OAuth it is the person who granted the token, and for a personal key its owner. An
  organization key has no `principal`.
- `scopes_available`: every scope, with a label, so you can tell the user what to add.
- `rate_limit`: the request budget.

If `me_get` returns 401, the key is missing, wrong or revoked, or an owner or admin turned the
person's agent access off. Stop and ask the user: My agent access says when access is off, and
then the same key works again once it is back on. Do not retry.

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
`sequences_resume`, `sequences_enroll`, `sequences_start_schedule`, `conversations_send_sms`,
`conversations_reply`, `conversations_resume`) unless they asked for that exact action.

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
| 401 | | The key is missing, wrong or revoked, or an owner turned the person's agent access off. Stop and ask the user. |
| 403 | `insufficient_scope` | The key lacks the scope in `required`. Tell the user to create a key with it under My agent access, or under Organization > API keys for an organization key. |
| 403 | `insufficient_role` | The person behind the credential is a MEMBER, and members cannot call this operation or act for another team member. A key with a role gets it where a person in that role, with its powers, cannot act. Do not retry. Ask an owner or admin. |
| 404 | `not_found` | The id does not exist in this organization. Search again. Do not guess ids. |
| 404 | `not_found` from `sequences_get_schedule`, `sequences_start_schedule` or `sequences_pause_schedule` | The broadcast may have no schedule yet. Set one with `sequences_set_schedule`. |
| 409 | `sequence_inactive` | The sequence is off. Do not enroll. Ask the user. |
| 409 | `sequence_paused` | The sequence is paused. Resume it first, or wait. |
| 409 | `sequence_not_paused` | `sequences_resume` on a sequence that is not paused. Nothing changed. Read its `status`. |
| 409 | `contact_not_at_location` | The sequence runs for one location and the contact is not there. Do not retry. Tell the user. |
| 409 | `sms_not_permitted` | The contact has not consented or is suppressed. Do not send. |
| 429 | | Too many requests. Wait 60 seconds, then retry. |
| 5xx | | Retry once after a few seconds. Then stop and report. |

Over MCP, a failing tool call returns `isError: true` with the same envelope as its content.

## Paging

Most list operations take `page` (starts at 1) and `limit` (default 25, at most 100). Every
page echoes `total`, `page` and `limit`. Fetch the next page while `page * limit < total`.
`conversations_list` and `calls_list` page with a `cursor` instead: pass back `next_cursor` from
the last page until it is null. `sequences_get_schedule` pages its `runs` and names the count
`runs_total`.
Stop when you have what you need: do not read every page of a large list to answer one question.

## Scopes

A key carries scopes, one read and one write per noun:

| Scope | Lets you |
|---|---|
| `contacts:read` | search and read contacts |
| `contacts:write` | create and update contacts, notes, tags, suppression and SMS consent, and enroll contacts in sequences or cancel them through events |
| `sequences:read` | read sequences, enrollments, send logs and totals, and a broadcast's schedule and runs |
| `sequences:write` | create, change, activate, pause, resume and duplicate sequences, enroll and cancel, and set, start and pause a broadcast's schedule and cancel one run |
| `appointments:read` | read appointments, calendars, locations, booking options, open slots and territories |
| `appointments:write` | book, change, reschedule and cancel appointments |
| `conversations:read` | read conversations and their messages |
| `conversations:write` | send an SMS, reply in a conversation, and hold or resume its AI (a staff member: only for their own clients, while their SMS setting is on) |
| `calls:read` | read calls and transcripts |
| `audiences:read` | read and count audiences, and list their contacts |
| `audiences:write` | create, change, archive and restore audiences, and add and remove members |

Each operation in `references/endpoints.md` names its scope. The OpenAPI document at
`/api/v1/docs-json` carries it as `x-iris-scope` on each operation, null when any live key may
call it. Over MCP, the tool list shows only the tools your key's scopes allow.

A credential acts with the role of the person behind it. An organization key and an owner's or
admin's credential reach the whole organization. For a MEMBER, each operation in
`references/endpoints.md` names its member access: `open` (allowed), `scoped` (allowed, limited
to the member's locations), `sms_setting` (allowed while the member's SMS setting is on, limited to
their own clients at their locations) or `deny` (403 `insufficient_role`). Over MCP, a MEMBER does not see
the `deny` tools. A MANAGER gets a MEMBER's access, so every MEMBER rule here applies to a MANAGER
too. An owner or admin may also give a MANAGER powers. A `deny` tool marked `x-manager-power:
contacts` is open to a MANAGER with the contacts power, at their locations only: a contact
elsewhere answers 404.

A key with a role acts at `api_key.role`, at its `api_key.location_ids` when it has them, with the
powers in `api_key.powers`. Every rule here for that role applies to it. A MANAGER key gets 403
`insufficient_role` on a plain `deny` tool, with no `x-manager-power`, and the MCP tool list
leaves it out. A MEMBER key gets it on every `deny` tool. Without the appointments power, the key
cannot book or change an appointment for a team member, because no person stands behind it.

A sequence may run for one location (`location_id`), or for the whole organization (null). A
`deny` tool marked `x-manager-power: sequences` is open to a MANAGER with the sequences power for
the sequences of their locations. Such a manager must send one of their `location_id`s to
`sequences_create`. A manager's write to an organization-wide sequence answers 403, and another
location's sequence answers 404.

On a `scoped` operation a MEMBER's lists hold only its own locations' rows, and an id at another
location answers 404, as an id that does not exist does. Do not retry it. A MEMBER can book,
reschedule and cancel appointments at its own locations. At a staffed location it books itself
only and changes only its own appointments: another team member answers 403 `insufficient_role`. Leave out
`team_member_id`. `locations_booking_options` shows a MEMBER only itself and the services it
handles, with every buffer as 0.

A MANAGER with the appointments power books any team member at its own locations, and reschedules
and cancels anyone's appointment there. `locations_booking_options` shows it every team member, so
book the one the user names. A location-wide block still answers 403, and another location 404.

A MEMBER (staff) reads only the calls of its own clients, the contacts on its appointments, at
either access level. `calls_get` on any other call answers 404, so it is out of reach, not missing.
Without a linked staff profile, `calls_list` is empty.

A MEMBER at the own-records level reads only its own records: its appointments, the contacts on
them, and those contacts' conversations and calls. Any other contact, conversation, call or
appointment answers 404, so it is out of reach, not missing. Do not retry it. It books only itself.
It may book a new client: any contact at its locations whose id it has.

## Operator recipes

### 1. Find a contact

1. If you have an email, call `contacts_search` with `email`. It returns the exact match only.
2. Otherwise call `contacts_search` with `q` (part of a name, email or phone).
3. If more than one contact matches, show the user the candidates (name, email, phone) and ask.
4. Call `contacts_get` with the `contactId` for the full record: stage, tags, custom fields. A
   MEMBER, and a MANAGER without the contacts power, get only `id`, `name`, `email` and `phone`,
   from both `contacts_search` and `contacts_get`.
5. To see what happened with the contact, call `contacts_list_interactions` with the `contactId`.
   It lists calls, chats and SMS threads, newest first. Email is in `conversations_list`. Filter with `channel` or `status`.
   It does not list notes: `contacts_get` only counts them.

Never create a contact to "find" one. `contacts_upsert` creates or updates by email, so use it
only when the user wants a contact created or changed.

### 2. Check which sequences a contact is in

1. Find the contact (recipe 1).
2. Call `contacts_list_enrollments` with the `contactId`.
3. Report each enrollment: sequence, `status`, current step, and the next send time.
   The next send time is `next_run_at`. On `sequences_list_enrollments` it is
   `next_step_due_at`, or `next_run_at` when that is empty.
   A sequence `status` is `active`, `paused` (every enrollment held, shown as `paused`) or `inactive` (off).

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
6. On 409 `sequence_inactive`, `sequence_paused` or `contact_not_at_location`, stop and tell the user.

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
4. Call `sequences_resume`. The answer shows `status: active`. A sequence that is not paused
   answers 409 `sequence_not_paused`, and nothing changes.

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
4. Call `sequences_update` to change steps, delays or copy. `steps`, `edges` and
   `exit_conditions` each replace the whole list, so start from `sequences_get`, edit, and send
   the full list back with every `step_key` kept. Read it back with `sequences_get`.
5. Show the user the draft and ask before you activate it.
6. Call `sequences_activate`. On 400 `sequence_activation_blocked`, show the `blockers` (for
   example a missing sending domain) and stop.

### 9. Book an appointment

1. Find the contact (recipe 1).
2. Call `locations_list` and pick the location. Note its `timezone` and `staffed`.
3. Call `locations_booking_options` with the location id. Pick a service from `offerings`, and a
   team member from its `team_member_ids` if the user names one.
4. For a home visit, call `territories_list` to check that the customer's postal code is covered.
5. Call `appointments_availability` with `location_id`, `date`, and `offering_id`,
   `team_member_id` and `postal_code` as needed. Offer the user the slots it returns.
6. Call `appointments_create` with `location_id`, `contact_id`, the slot's `start` and `end` as
   `start_time` and `end_time`, `offering_id`, `team_member_id` if chosen, `service_address` for
   a home visit, and an `idempotency_key` of your own. Leave out `team_member_id` to book the
   first team member who is free.
7. On 409, read `error`. `offering_required`: choose from the `booking_options` in the body.
   `slot_taken`, `no_team_member_available` or `outside_hours`: check availability again and
   offer another time. `team_member_not_eligible`: offer another team member.
   `address_out_of_area`: tell the user the address is not covered. `duration_mismatch`: make
   the end time match the service's `duration_minutes`. Another 409 with no code means the key
   was used with other details: use a new key.
8. Tell the user the appointment's time, service and team member.

A location that is not staffed can also be booked with `calendar_id` from `calendars_list`
instead of `location_id`. Send one of the two, never both.

### 10. Keep the CRM current after a call

1. Find the contact (recipe 1).
2. Call `contacts_update` to change the name, phone, email, stage or custom fields. An unknown
   custom field key returns 400 naming it. To move the contact to a stage, call `contacts_list_stages`
   first and send one stage `id` as `stage_id`.
3. Call `contacts_add_note` with what you learned.
4. Call `contacts_add_tag` or `contacts_remove_tag` to change tags. Both are safe to repeat.
5. When a person asks to stop email or SMS, call `contacts_suppress` with the channels at once.

### 11. Report assessment abandonment

1. Call `contacts_upsert` with the contact, `fields.user_message_count`, and an `assessment_abandoned` event with a stable session key.
2. Count nonempty user answers in the current session. Send numeric zero for a session with no answers.
3. Read `assessmentAbandonment`. `accepted` confirms a durable receipt. Keep retry eligibility for `no_subscriber` or a request failure.
4. Record `legacy_unverified` for operator reconciliation. Do not invent a new key to bypass an existing receipt.

Counts must be nonnegative safe integers. Missing counts match only triggers without an `assessmentAudience` filter.
The `started` filter requires a positive count. `never_started` requires zero. These filters apply only to `assessment_abandoned`.
Do not activate the never-started campaign before its copy is approved.

### 12. Send a broadcast on a schedule

A broadcast sends to its audience on its schedule. Each send is a run. `sequences_activate`
does not start a broadcast: only `sequences_start_schedule` does.

1. Call `sequences_get` and check `kind` is `broadcast`. An automation has no schedule.
2. Call `sequences_set_schedule`. For one send, pass `schedule_kind: once` and `send_at`, a
   date-time that ends in `Z` or an offset such as `-05:00`. To repeat, pass
   `schedule_kind: recurring`, an `rrule` such as `FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0`,
   and the `timezone` it is read in. The schedule
   is saved as `draft` and sends nothing yet. A rule takes only `FREQ` (`DAILY`, `WEEKLY` or
   `MONTHLY`), `INTERVAL` (1 to 100), `BYDAY`, `BYMONTHDAY`, `BYSETPOS`, one `BYHOUR` and one
   `BYMINUTE`. There is no `COUNT` or `UNTIL`: end a series with `ends_on`. On 400, read which part
   `message` names and fix it.
3. Call `sequences_get_schedule` to read it back.
4. Show the user when it sends and to which audience, and ask before you start it.
5. Call `sequences_start_schedule`. The answer shows `status: scheduled` and the first send in
   `next_fire_at`. On 400 `sequence_activation_blocked`, show the `blockers` and stop.
6. To watch the sends, call `sequences_get_schedule`. Each item in `runs` is one send, with
   `status` and recipient counts.
7. To stop later sends, call `sequences_pause_schedule`. A run that is already sending keeps
   sending. Start again with `sequences_start_schedule`.
8. To stop one run, call `sequences_cancel_schedule_run` with the run's `id` as `runId`.
   `cancelled` counts the enrollments it stopped.

Setting the schedule again puts it back to `draft` and cancels the runs that have not ended:
start it again after a change. Do not use `sequences_pause` on a broadcast: it answers 400.

### 13. Build an audience

1. Call `audiences_list` to check that a fitting audience does not already exist.
2. Write a `definition`: `match` (`all` or `any`) and `rules` of `field`, `op` and `value`. The
   `audiences_create` schema lists the fields and which ops each takes. `field_values.<key>`
   reads an enabled CRM custom field.
3. Call `audiences_preview_count` with the definition. A 400 names the field, op or value to fix.
   Show the user the count.
4. Call `audiences_create` with the name and definition. For a hand-picked list, send
   `kind: static` and no definition, then add contacts with `audiences_add_member`.
5. To change it, read it with `audiences_get`, edit the definition, and send it whole to
   `audiences_update`. `kind` cannot change.
6. Call `audiences_count` for its size now, and `audiences_list_members` to see who is in it.
   Both count opted-out contacts: they are left out only when a message is sent.
7. To retire it, call `audiences_archive`. `audiences_update` with `is_archived: false` restores
   it.

## Other operations

These follow the same rules. Their parameters are in `references/endpoints.md`.

- Appointments: `appointments_list`, `appointments_get`, `appointments_create`,
  `appointments_update`, `appointments_reschedule`, `appointments_cancel`, `appointments_availability`, `locations_list`,
  `locations_booking_options`, `territories_list`, `calendars_list`. To book, follow recipe 9.
  To answer "when is Jane booked", find the contact (recipe 1) and call `appointments_list` with
  `contact_id`.
  To fix a title, notes or attendee detail without moving the appointment, call
  `appointments_update`. It refuses time and status fields with a 400 that names the operation to use.
  Cancel, update and reschedule answer 409 `recurring_series_not_supported` for a row with
  `recurring: true`. Nothing changes: tell the user to change it in the Iris dashboard.
  Reschedule answers 409 `appointment_cancelled` for a cancelled appointment. Nothing changes:
  book a new appointment instead. A 422 from `appointments_create` can mean the user who created
  the API key left the organization: tell the user to create a new key.
- Conversations: `conversations_list`, `conversations_get` (with messages),
  `conversations_reply`, `conversations_hold`, `conversations_resume`, `conversations_send_sms`.
  The channels are `email`, `sms` and `chat` (web chat). A search (`q`) skips chat.
  `conversations_reply` answers on the conversation's own channel: read the conversation first.
  `conversations_hold` stops the AI answering an SMS or chat conversation until
  `conversations_resume`, and `response_mode` in `conversations_get` shows who answers. An email
  conversation has no AI: hold and resume answer 422 `channel_not_supported`. Do not retry it.
  `conversations_reply` is not safe to retry: after a 5xx the message may already have gone to the
  contact. Read the conversation with `conversations_get` before you send it again.
  A 422 `no_acting_user` on an email reply means the key has no person to send as: tell the user.
  Read the conversation before you text the contact. The text goes from
  the number of the contact's location, else from the default number. A 422 can mean no number
  can text the contact, or (for a manager) that the contact's thread on that number belongs to
  another location: tell the user, and do not retry. A staff member (MEMBER) texts only their own
  clients, and only while an owner, admin or manager has turned their SMS setting on. A 403
  `insufficient_role` means the setting is off: tell the user to ask for it, and do not retry. A
  404 means the contact is not one of their clients there, or their thread on that number is at
  another location. Record SMS consent
  with `contacts_record_sms_consent` only when the contact gave it to the user. On 409
  `sms_not_permitted`, do not send, and do not record consent to get past it.
- Calls: `calls_list`, `calls_get` (with transcript). Filter `calls_list` with `contact_id` to
  see one contact's calls.
- Audiences: `audiences_list`, `audiences_add_member`, `audiences_remove_member`. Both member
  writes are safe to repeat. Only a `static` audience takes members. To build or change an
  audience, follow recipe 13.
