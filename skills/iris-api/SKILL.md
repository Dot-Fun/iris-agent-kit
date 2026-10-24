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
Read tools carry `readOnlyHint: true`. Every write tool carries
`destructiveHint: true`. A 404 from the MCP URL means MCP is not turned on for
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

Each operation in `references/endpoints.md` states these facts, and the OpenAPI document carries
them as extensions. `Confirm: required` (`x-iris-confirm`) marks a call that sends to a customer,
deletes or cancels, or moves money. Ask the user before you call it, unless they asked for that
exact action. `Changes` (`x-iris-changes`) names the resources a write changes, or `none`.
Over MCP, each tool's `_meta` carries both as `iris/confirm` and
`iris/changes`. `Idempotent` (`x-iris-idempotent`) marks a call that takes an `idempotency_key`
of your own. A retry on the same credential with the same key and details within 24 hours
returns the first answer and does not run the call again. The same key with other details
answers 409 `idempotency_key_reused`. A 409 `idempotency_in_progress` means the first call is
still running. A 409 `idempotency_outcome_unknown` means the first call failed and may have
taken effect. A 503 `idempotency_unavailable` means the call did not run.
Each write in the document also carries `x-iris-reverse`: the call that undoes it, or why it
cannot be undone.

To make an update conditional, send `expected_updated_at` with the `updated_at` from your last
GET of the record. A write rewind undoes with takes it as a query parameter. When the record
changed since, the call answers 409 `stale_revision` and changes nothing. Read the record again,
then decide. A contact's tags do not move its `updated_at`, so the check does not see a tag change.

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
| 409 | `stale_revision` | The record changed after the `expected_updated_at` you sent. Nothing changed. Read it again, then decide. |
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
| `contacts:read` | search and read contacts, export them as CSV (`contacts_export`), list suppressed addresses, and read a contact's company and owner at a location |
| `contacts:write` | create and update contacts, notes, tags, suppression and SMS consent, enroll contacts in sequences or cancel them through events, set a contact's locations, company and owner, and suppress or lift an address |
| `sequences:read` | read sequences, enrollments, send logs and totals, and a broadcast's schedule and runs |
| `sequences:write` | create, change, activate, pause, resume and duplicate sequences, enroll and cancel, and set, start and pause a broadcast's schedule and cancel one run, and create and change send windows |
| `appointments:read` | read appointments, calendars, locations, booking options, open slots and territories, and list the appointments that need attention |
| `appointments:write` | book, change, reschedule and cancel appointments, change their place, all-day flag, status and time zone, and keep a conflicted appointment |
| `conversations:read` | read conversations and their messages |
| `conversations:write` | send an SMS, reply in a conversation, and hold or resume its AI (a staff member: only for their own clients, while their SMS setting is on) |
| `calls:read` | read calls and transcripts |
| `calls:write` | delete calls and their recordings (an owner or admin only) |
| `audiences:read` | read and count audiences, and list their contacts |
| `audiences:write` | create, change, archive, restore and delete audiences, and add and remove members |
| `forms:read` | read forms, their fields and their submissions |
| `forms:write` | create, change and delete forms, add, change, reorder and delete their fields, and rotate a form's submission key |
| `calendar:read` | read the calendar settings, a location's schedule, saved views, feeds and view links |
| `calendar:write` | change the calendar settings and a location's schedule, save and assign views, mint and revoke feeds and view links |
| `agents:read` | read phone agents, their versions, and whether a draft differs from the live version |
| `agents:write` | change a phone agent's draft, turn a subagent on or off, publish a draft and roll back, publish every agent at once, and add, delete and rebuild subagents |
| `organization:read` | read the organization's settings and the roles whose agent access is off |
| `organization:write` | change the industry, website and timezone, and turn agent access off or on |
| `members:read` | read the organization's members |
| `members:write` | change a member's role, status, agent access, locations, manager powers, access level and SMS setting, and remove a member |
| `invitations:read` | read the organization's invitations |
| `invitations:write` | invite a person by email, and revoke an invitation |
| `locations:read` | read one location, a draft included, and what each location write can do now |
| `locations:write` | create and delete location drafts, activate and deactivate locations, and choose the default |
| `table_views:read` | read the saved views of a dashboard table, and your own table state and default view |
| `table_views:write` | save, change and delete views of a dashboard table, and set your own table state and default view |
| `crm_fields:read` | read the custom contact fields and the pipeline stage setup |
| `crm_fields:write` | replace the custom contact fields, and set the pipeline stage field and the stages a call outcome moves a contact to |
| `booking_widgets:read` | read a location's booking widget settings, layout and the style visitors see |
| `booking_widgets:write` | change a location's booking widget settings and replace its layout |
| `chat_widget:read` | read the organization's web chat widget |
| `chat_widget:write` | turn the chat widget on or off, and change its origins and appearance |
| `business_notes:read` | read business notes and the field and fact suggestions mined from them |
| `business_notes:write` | add, edit and delete business notes, mine them, and accept, reject or dismiss their suggestions |
| `knowledge_base:read` | read a phone agent's knowledge base documents and its document suggestions |
| `knowledge_base:write` | add a text or web page document to a phone agent's knowledge base, delete one, and generate suggestions |
| `business_data:read` | read the status of a website re-scrape or an agent resync |
| `business_data:write` | re-scrape the organization's website, and resync the business data to every phone agent |
| `integrations:read` | read the GoHighLevel connection (location pairs, sync status, conflicts, transfer runs, held work and what each pair syncs), the HubSpot sync, the Zapier settings and the Google Calendar connections |
| `integrations:write` | run the GoHighLevel connection (pair a location, start, pause, reconnect or disconnect its sync, change what it syncs, settle conflicts and held work, and run a migration cutover), run the HubSpot sync, change the Zapier settings, and sync or disconnect a Google calendar |
| `phone_lines:read` | read the organization's phone lines and the locations each one answers for |
| `phone_lines:write` | add a Twilio or SIP trunk line, route a line to locations, and disconnect, reconnect, retry or delete a line |
| `call_forwarding:read` | read the numbers the phone agents may transfer a call to |
| `call_forwarding:write` | add, change and delete the numbers the phone agents may transfer a call to |
| `staff:write` | read and change where a staff member hears about their appointments, and your own |
| `assistant:write` | delete your own private Assistant note |
| `feedback:write` | send product feedback to Iris as yourself |
| `context_engine:read` | read the facts Iris knows about the business, the links between its records, the archetype, the suggested links and the snapshots |
| `context_engine:write` | write facts and their sharing, set the archetype, add, change and delete links, run and review suggested links, and capture and publish snapshots |
| `context_access:read` | read what each AI agent can read and write |
| `context_access:write` | grant or deny an agent access to facts, set its ceiling, pin it to a snapshot, and remove an add-on agent |
| `crm_imports:read` | read the CRM import jobs, the records waiting for a review decision, and the import merge policy |
| `crm_imports:write` | start, pause, resume and retry a CRM import, resolve its review items, and set its merge policy |
| `discovery:read` | read how much of the business the discovery interview knows |
| `discovery:write` | run the discovery interview and store a fact about the business |
| `marketing_agent:read` | read your own marketing agent sessions, with their questions, plans and results |
| `marketing_agent:write` | start a marketing agent session, answer its questions, approve its plan and cancel it |
| `email_settings:read` | read the email sending settings, without the stored credential |
| `email_settings:write` | save and delete the email sending settings, check the connection and the domain, and send a test email |
| `email_design:read` | read the email brand frame, the saved templates and the headers and footers |
| `email_design:write` | change the brand frame, templates and headers and footers, and send a designed email to yourself |

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
   It lists calls, chats and SMS threads, newest first. Email is in `conversations_list`. Filter with `channel` or `status`. A `page` past the last interaction answers 400.
   To read the contact's notes, call `contacts_list_notes` with the `contactId`. It pages newest first, with `limit` at most 100. A `page` past the last note answers 400.
   A MEMBER, and a MANAGER without the contacts power, get `insufficient_role` there. Notes that belong to one location (dashboard notes and GoHighLevel syncs) are not listed.

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
4. To say which branch the contact took, read each run's `step_key` and `via_edge_key`, and
   match them to `steps` and `edges` from `sequences_get`. `exit_edge_key` names the edge the
   contact left through. A null `via_edge_key` means the contact moved to the next step.

### 7. Read sequence totals

1. Call `sequences_analytics` with the `sequenceId`.
2. Report the per-step counts and the rollup.
3. Read `email_delivery_reporting` before you report email numbers:
   - `supported`: delivery and bounce counts are real.
   - `unsupported`: the sending provider does not report delivery. A zero means "unknown", not
     "none". Say so.
   - `not_applicable`: the sequence sends no email.
4. To say where contacts went, read `paths`. `nodes` counts runs per `step_key`, `edges` and
   `exits` count traversals per `edge_key`, and `implied` counts moves to the next step.

### 8. Build a draft sequence and activate it

1. Call `sequences_capabilities`, `sequences_list_triggers`, `sequences_list_variables` and
   `sequences_get_condition_vocabulary`. Use only the step kinds, triggers, variables and
   conditions they return.
2. Call `sequences_create` with the name, trigger, steps and delays. It always creates an
   inactive draft. Do not send `is_active: true`: it returns 400.
3. To start from a sequence that works, call `sequences_duplicate` instead and change the copy.
4. Call `sequences_update` to change steps, delays or copy. `steps`, `edges` and
   `exit_conditions` each replace the whole list, so start from `sequences_get`, edit, and send
   the full list back with every `step_key` and `edge_key` kept. Send its `definition_revision`
   as `expected_revision`. On 409 `stale_revision`, read the sequence again and redo the edit.
   Read it back with `sequences_get`.
5. If the sequence has contacts in it, call `sequences_preview_update` with the same body first.
   Show the user each `affected` step that has `waiting` contacts and each edge in
   `removed_edges_with_traffic`, and ask before you send the update.
6. Show the user the draft and ask before you activate it.
7. Call `sequences_activate`. On 400 `sequence_activation_blocked`, show the `blockers` (for
   example a missing sending domain) and stop.
8. To throw away a draft the user no longer wants, ask first, then call `sequences_delete`. It
   deletes the sequence with its enrollments and send log, and it cannot be restored. To stop a
   sequence and keep it, pause it (recipe 5) instead.

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
3. Call `contacts_add_note` with what you learned. The note is stored with source `api` and, as its
   author, the user you act for (an organization key stores no author).
4. Call `contacts_add_tag` or `contacts_remove_tag` to change tags. Both are safe to repeat. An added
   tag is applied with source `api`, by the user you act for (an organization key records no user).
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
   reads an enabled CRM custom field. To filter by pipeline stage, call `contacts_list_stages`:
   use its `audience_field` as the `field`, with stage ids as values.
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

### 14. Test a step and pick a send window

1. To pick when a sequence may send, call `sequences_list_send_schedules`. It pages with `page` and `limit`, and the windows are in `items`. Pass the `id` you
   choose as `send_schedule_id` on `sequences_create` or `sequences_update`. A sequence with none
   uses the window where `is_default` is true. To add a window, ask the user, then call
   `sequences_create_send_schedule`. To change one, call `sequences_update_send_schedule` with the
   whole window: the change reaches every sequence that uses it. A window cannot be deleted.
2. To test a step, save it first: the test sends what is saved. Call `sequences_test_step` with
   the `sequenceId` and the `step_key` of the step.
3. Send `to_email` (email step) or `to_phone` (SMS step) only to an address or number the user
   owns, never to a customer. Or send `contact_id` to fill the variables from a contact: the
   message then goes to that contact, so ask the user first.
4. Read `success`. When false, `error` and `reason_code` say why, for example `opted_out`.

### 15. Change a phone agent and publish it

1. Call `agents_list` and pick the agent by `name`. The Assistant is not a phone agent: its id
   answers 404.
2. Call `agents_get` and keep its `updated_at`.
3. Call `agents_update` with only the fields to change and `expected_updated_at`. A 409
   `stale_revision` means someone changed it since: read it again and ask the user. The change
   edits the draft, and `status` reads `updating` until the voice agent catches up. Callers still
   hear the live version.
4. Call `agents_get_staging_diff` and show the user `changed_fields`.
5. Ask the user, then call `agents_go_live`. Publish the orchestrator before a subagent. Going
   live cannot be undone. To undo it, call `agents_list_versions` and `agents_rollback` to the
   version before.
6. To turn a subagent on or off, call `agents_activate` or `agents_disable`. Turning one on uses
   an agent slot: a 403 means the plan has none left, so tell the user. The orchestrator answers
   400 on both.
7. To add a subagent, call `agents_create_subagent` with `agent_name`, `agent_role`,
   `transfer_condition`, the orchestrator's id as `parent_agent_id` and an `idempotency_key`.
   Call `agents_get` until `status` leaves `provisioning`. When it reads `failed`, call
   `agents_retry_provisioning`.
8. Ask the user before `agents_delete`: a deleted subagent cannot come back. The orchestrator
   answers 400.
9. To publish every agent at once, ask the user, then call `agents_go_live_all`. Read each
   agent's entry in `results`: one can fail while the others go live.

Every write needs an owner or admin. A MEMBER or MANAGER gets 403 `insufficient_role`: tell the
user, and do not retry.

### 16. Update the organization settings

1. Call `organization_get` and keep its `updated_at`.
2. Call `organization_update` with only the fields to change (`industry`, `website_url`,
   `timezone`) and `expected_updated_at`. An empty `website_url` clears it. The name cannot
   change here: tell the user to change it in the Context Engine.
3. To turn agent access off for a role, send the whole list to `organization_set_agent_access`
   as `disabled_roles`. Ask the user first: people in those roles lose their personal keys,
   agent connections and Assistant until the role is turned back on. Only an owner's credential
   can add or remove `ADMIN`. Any other caller gets 409: tell the user an owner must do it.

### 17. Add a location and make it the default

1. Call `locations_create` with `name`, an IANA `timezone` and an `idempotency_key`. The new
   location is an inactive draft. A 409 means multi-location is not available to the
   organization: tell the user.
2. Call `locations_get` and read `actions.activate`. When `allowed` is false, tell the user its
   `blocker_message`.
3. Ask the user first: activation adds the location to the subscription and can charge a
   prorated amount at once. Then call `locations_activate` with an `idempotency_key`. Read
   `status`: `applied` means done, `pending_payment` means the user must pay first, and
   `retryable` means Iris retries by itself.
4. To make it the default, call `locations_set_default` with the `updated_at` from
   `locations_get` as `expected_updated_at`. The answer names the old default as
   `previous_default_location_id`.
5. To retire a location, move the default away first, ask the user, then call
   `locations_deactivate` with an `idempotency_key`. To remove a draft that was not active, ask
   the user and call `locations_delete`. It cannot be restored.

Every location operation except `locations_list` and `locations_booking_options` needs an owner
or admin. A MEMBER or MANAGER gets 403 `insufficient_role`: tell the user, and do not retry.

### 18. Build a lead form and publish it

1. Call `forms_create` with `name` and an `idempotency_key`. The new form is a `draft` with no
   fields. Send `location_id` from `locations_list` to send its leads to one location.
2. Call `forms_add_field` once for each field, with `type`, `key` and `label`. The `key` names
   the answer in a submission `payload`: lowercase letters, digits and single underscores. A 409
   means the form has a field with that `key`. A `select` field takes its choices in `options`.
3. To change a field, call `forms_update_field` with the values to change. To change the order,
   call `forms_reorder_fields` with every field id from `forms_get` in the new order.
4. To publish, call `forms_update` with `status: published` and the form's `updated_at` from
   `forms_get` as `expected_updated_at`. A field change does not move the form's `updated_at`.
5. Ask the user before `forms_delete_field`, `forms_delete` or `forms_rotate_submission_key`. A
   deleted form takes its fields and submissions with it. A rotation answers with the new
   `submission_key`, and the old key stops taking submissions: tell the user to update the embed.

Every form write needs an owner or admin. A MEMBER or MANAGER gets 403 `insufficient_role`: tell
the user, and do not retry. No read returns the submission key.

### 19. Save a view of a dashboard table and open the table with it

1. Call `table_views_list` with the `tableId`, such as `crm.contacts`, to see the shared views and
   your own private ones. Read one with `table_views_get`.
2. Call `table_views_create` with a `name`, `visibility` (`shared` by default, or `private`), the
   whole `state` (all seven keys: `search`, `sorting`, `filters`, `columnSizing`, `columnOrder`,
   `columnVisibility` and `pageSize`) and an `idempotency_key`. Use the table's own column ids.
3. To change it, call `table_views_update` with `name`, the whole `state`, and its `updated_at` as
   `expected_updated_at`. Only its creator, an owner or an admin changes a shared view: anyone else
   gets 403, so tell the user.
4. To open the table with it, read `table_views_get_preferences`, then call
   `table_views_set_preferences` with a `state` and the view's `id` as `default_view_id`. Send the
   preferences' `updated_at` as `expected_updated_at` when there are some.
5. To remove a view, ask the user, then call `table_views_delete` with its `updated_at` as
   `expected_updated_at`. It cannot be restored.

Every table views operation acts as a person. An organization key gets 403 `no_acting_user`: tell
the user to use a personal key or an agent connection.

### 20. Set up the pipeline stages

1. Call `crm_fields_list` for the custom fields that are on, and `crm_fields_get_stage_config` for
   the field that holds the stage. Keep both `updated_at` values.
2. To change the stages, edit the `enum_options` of the stage field. Each option's `value` is the
   stage id that `contacts_update` takes as `stage_id`, and its `label` is the name people see.
   Do not change the `value` of a stage contacts are on: they stay on the old id.
3. Call `crm_fields_set` with every field from step 1, in order, and the edited stage field. It
   replaces the whole list: a field you leave out is turned off. Ask the user first. Send the
   list's `updated_at` as `expected_updated_at`. A 409 `stale_revision` means someone changed the
   fields: start again from step 1.
4. Call `crm_fields_set_stage_config` with `stage_field`, and the `booking_stage_id` and
   `no_booking_stage_id` a call moves its contact to, or null. A stage id you leave out is cleared,
   so send both. Send the stage setup's `updated_at` as `expected_updated_at`. A 400 means the field is
   not an enum field that is on, or a stage id is not one of its options.
5. Call `contacts_list_stages` to read the stages back. Both writes need an owner or admin: a
   staff member gets 403 `insufficient_role`. Tell the user, and do not retry.

### 21. Set up the booking page and the web chat widget

1. Call `locations_list` and take the location `id`. Call `booking_widgets_get` with it. A 404
   means the location has no booking widget yet.
2. Call `booking_widgets_update` with every setting: `slug`, `title`, `enabled`,
   `allowed_origins`, `timezone`, `duration_minutes`, the availability window,
   `enabled_weekdays` and `google_integration_id` (null for none). Send the `updated_at` from
   `booking_widgets_get` as `expected_updated_at` when the widget exists. A 409 on a new widget
   means the slug is taken: ask the user for another one.
3. To change the sections or the questions, take `layout` from `booking_widgets_get`, change it,
   and send it whole to `booking_widgets_replace_layout`. Keep `name` and `email` as required
   fields. Read `effective_style` and `fallback_reason` back: a style can show as `sections`
   until its needs are met.
4. For the chat widget, call `chat_widget_get` to read it, then `chat_widget_update` with only
   the fields to change. Send its `updated_at` as `expected_updated_at`. A null or empty
   `greeting`, `widget_title` or `accent_color` restores the default. Each origin is a scheme and
   a host, such as `https://www.example.com`.

The booking widget needs an owner or admin, or a manager with the location settings power at their
own location. Only an owner or admin changes the chat widget. Any other caller gets 403
`insufficient_role`: tell the user, and do not retry.

### 22. Teach the business from a note

1. Call `business_notes_create` with `body`, an optional `title` and an `idempotency_key`.
2. To find a note, call `business_notes_list`, or `business_notes_get` with its id. To fix a
   note, call `business_notes_update` with the new `body` and the note's `updated_at` as
   `expected_updated_at`. A 409 means the note is mined, or it changed since you read it.
3. Call `business_notes_mine`. It reads every note not yet mined and answers the new suggestions.
   A mined note can no longer be edited.
4. Show the user `business_notes_list_suggestions` and `business_notes_list_fact_suggestions`. On
   the user's choice, review each field suggestion with `business_notes_accept_suggestion`,
   `business_notes_reject_suggestion` or `business_notes_dismiss_suggestion`, and each fact
   suggestion with `business_notes_accept_fact_suggestion` or
   `business_notes_dismiss_fact_suggestion`. Accepting a field suggestion adds a custom field.
   Accepting a fact suggestion writes its values, and `failed_slots` names any it could not write.
5. Ask the user before `business_notes_delete`. A deleted note cannot be restored.

Every business note operation needs an owner or admin. A MEMBER or MANAGER gets 403
`insufficient_role`: tell the user, and do not retry.

### 23. Add a document to a phone agent's knowledge base

1. Find the agent with `agents_list`.
2. Call `knowledge_base_create` with `name`, `type` and an `idempotency_key`. Send `text` for a
   `text` document or `url` for a public web page. To add a file, send its text.
3. A background job sends the document to the agent. Call `knowledge_base_list` until its
   `status` is `active` or `failed`. `last_error` says why a document failed.
4. Ask the user before `knowledge_base_delete`. A deleted document cannot be restored.
5. To find what the agent still lacks, call `knowledge_base_generate_suggestions`, then read the
   result with `knowledge_base_get_suggestions`. New suggestions replace the earlier ones.

After the user changes the website, call `business_data_rescrape_website`, then
`business_data_resync` to update every agent. Ask the user first: each one replaces data. Both
answer a `job_id`: read its progress with `business_data_get_job`.

### 24. Connect GoHighLevel and keep it in sync

1. Call `ghl_get_status`. It lists the GoHighLevel location pairs (mappings) and their `status`.
   A 404 on every GoHighLevel operation means the organization does not have the integration.
2. When nothing is connected, call `ghl_get_authorization` and give the user the link. The user
   approves it in a browser. You cannot approve it.
3. Call `ghl_get_setup_options` for the locations to pair, then `ghl_preview_mapping` with the
   connection, grant, both location ids, the environment and an `idempotency_key`. It makes the
   mapping and a preview run that writes nothing.
4. Read the preview with `ghl_list_run_results`. For a contact that needs a decision, call
   `ghl_get_review_options`, then `ghl_review_contact`. `ghl_refresh_preview` runs the preview
   again.
5. Show the user the preview, then call `ghl_begin_sync` with the `previewRun` `id` as
   `preview_id` and an `idempotency_key`. The first transfer writes contacts on both sides. If it stops, call
   `ghl_continue_transfer` with the `run_id`.
6. To check health, call `ghl_get_mapping`, `ghl_list_runs` and `ghl_list_run_outcomes`. For a
   failed contact, call `ghl_retry_contact`, or `ghl_recover_rejected_create` after the user
   checked GoHighLevel.
7. Call `ghl_pause` and `ghl_reconnect` to stop and start the sync. Ask the user before
   `ghl_disconnect`.

Many GoHighLevel writes change data in GoHighLevel, and rewind cannot undo them. Most settings carry
a `generation` or a `version`, not `updated_at`. Send the value you read, and on a 409 read them
again. The appointment settings carry no revision, so `ghl_update_appointment_settings` overwrites. Every write needs an owner or admin with their own credential. An organization key gets 403
`no_acting_user`, and a MEMBER or MANAGER 403 `insufficient_role`.

### 25. Connect a phone line and set up call forwarding

1. Call `phone_lines_list` to see the lines. No answer carries a credential.
2. To add a number the customer already owns, call `phone_lines_create_twilio` with the
   `phone_number`, the Twilio `account_sid` and `auth_token`, or `phone_lines_create_sip_trunk`
   with the `auth_method`. Send an `idempotency_key`. Ask the user first: Iris imports the number
   and does not buy one.
3. The import runs in a background job. Call `phone_lines_get` until `status` is `active` or
   `failed`. `last_error` says why a line failed. Call `phone_lines_retry` only for a `failed` line.
4. To choose the locations a line answers for, call `phone_lines_set_routing` with every
   `location_ids` value, or `phone_lines_add_location` with one location.
5. Ask the user before `phone_lines_disconnect` or `phone_lines_delete`. A disconnected line takes
   no calls until `phone_lines_reconnect`. A deleted line cannot be restored.
6. Call `call_forwarding_list` to see the numbers the agents transfer to, or
   `call_forwarding_get` for one. To add one, call `call_forwarding_create` with a `phone_number`,
   the `condition` in plain words and an `idempotency_key`. A `warning` means the number is one of
   the organization's own lines, which can make a call loop. Change a number with
   `call_forwarding_update`, and send `enabled: false` to stop transfers to it. Ask the user before
   `call_forwarding_delete`. A deleted number cannot be restored.

Phone numbers start with `+` and the country code. Any member reads both nouns. Only an owner or
admin changes them. Any other caller gets 403 `insufficient_role`: tell the user, and do not retry.

### 26. Change a location's booking schedule

1. Call `calendar_settings_get` with `location_id` from `locations_list`. Keep its `updated_at`.
2. Call `calendar_settings_update` with the same `location_id`, the `updated_at` as
   `expected_updated_at`, and `booking_hours_override`, `closure_dates` or both. Each replaces what
   it names. A day in `weekly` or `dates` is null (closed), one `{ start_time, end_time }` window
   in `HH:MM`, or a list of windows.
3. To turn the agents' booking tool on or off, call `calendar_settings_update` without
   `location_id`, with `calendar_tool_enabled` only. Take `expected_updated_at` from
   `calendar_settings_get` without `location_id`.

A 409 `stale_revision` means the record changed: read it again before you retry. A MANAGER with
the `location_settings` power changes the schedule at their locations only.

### 27. Share a calendar with a team member

1. Call `calendar_views_list`. With `management_mode: hidden`, team scheduling is not available:
   tell the user, and stop.
2. Save the view with `calendar_views_create`: `name`, `filters` and `visibility: org`.
3. Ask the user, then call `calendar_view_links_issue` with `view_id`, `team_member_id`,
   `serves_feed` and `serves_page`. The answer carries `https_url`, `webcal_url` and `page_url`
   once. Give them to the user to pass on. They cannot be read again.
4. To stop a link, ask the user, then call `calendar_view_links_revoke`.

To subscribe to one person's or one location's appointments, call `calendar_feeds_mint` with
`kind` and the subject id instead. Minting again replaces the live feed for that subject.

### 28. Send a customer their self-service link

1. Call `appointments_get_self_service_link` with the appointment id. It answers `url`, the same
   link each time.
2. Send the `url` only to the customer of that appointment: anyone with it can reschedule or
   cancel it.
3. If the link reached someone else, ask the user, then call
   `appointments_reset_self_service_link`. The old link stops working.

While `self_service_links_enabled` is false in `calendar_settings_get`, every link answers 404.
Turn it on with `calendar_self_service_links_update_settings`.

### 29. Change where a staff member hears about appointments

1. For your own settings, call `staff_get_my_notifications`. For another staff member, take the
   `id` from `locations_booking_options` and call `staff_get_settings` with it.
2. Call `staff_update_my_notifications` or `staff_update` with only the fields to change:
   `notify_phone` (E.164, such as `+14155550100`), `notify_email`, `notify_by_sms` and
   `notify_by_email`. Null clears the phone number or the email address. Send the `updated_at`
   from the read as `expected_updated_at`.
3. A 409 `stale_revision` means the settings changed since you read them: read them again before
   you decide.

Only an owner or admin reads or changes another person's settings. Any role changes its own, with
its own credential: an organization key gets 403 `no_acting_user`. A 404 on your own settings
means your login is linked to no staff member. Tell the user, and do not retry.

### 30. Forget the Assistant note, or send feedback

1. Ask the user before `assistant_delete_note`. It deletes their own note with every copy rewind
   keeps, so nothing brings it back. `deleted` is false when there was no note.
2. To pass on what the user thinks of Iris, call `feedback_submit` with `comment`, an optional
   `rating` from 1 to 5, the `page_context` it is about and an `idempotency_key`. Feedback cannot
   be taken back, so send only what the user asked to send.

Both act as the person behind the credential: an organization key gets 403 `no_acting_user`.

### 31. Run the HubSpot contact sync

1. Call `hubspot_get_status`. When HubSpot is not connected, tell the user to connect it in the
   dashboard. You cannot connect it.
2. Call `hubspot_approve_locations` with the `location_ids` whose contacts sync. Read the choices
   with `hubspot_get_mapping_catalog`, then save the field pairs with `hubspot_update_mappings`.
   Each write replaces the saved set.
3. Call `hubspot_run_assessment` with an `idempotency_key`. It changes no contact. Call
   `hubspot_get_status` until `assessment.stage` is `ready`.
4. Show the user `hubspot_list_assessment_rows` for each `side`. Ask the user, then call
   `hubspot_start_sync` with the `assessment_id` and an `idempotency_key`. The sync writes
   contacts in Iris and HubSpot.
5. Call `hubspot_pause_sync` to stop the writes, and ask the user before `hubspot_resume_sync`.
6. Read problems with `hubspot_list_issues`, and settle one with `hubspot_resolve_issue` and its
   `version`. A 409 means the issue changed: read it again.
7. Ask the user before `hubspot_disconnect`. Only they can connect HubSpot again.

Rewind cannot undo a HubSpot write. Only an owner or admin calls these, and a MEMBER or MANAGER
gets 403 `insufficient_role`. An organization key gets 403 `no_acting_user` on
`hubspot_approve_locations` and `hubspot_resolve_issue`.

### 32. Teach Iris a fact and link the business's records

1. Call `context_engine_list_facts`. Each topic lists its fields by `slot_id`, with the value of
   each field that has one.
2. Call `context_engine_write_fact` with `slot_id`, `value` and an `idempotency_key`. Send the
   fact's `entity_id` to change a value. Leave it out for a field with no value. The phone agents
   get the new value.
3. To change who may hear a fact, call `context_engine_set_fact_sharing` with `slot_id`,
   `entity_id` and `sensitivity`: `public`, `customer` or `internal`.
4. Call `context_engine_list_relationships`. `entities` lists the records, and
   `relationship_types` the link types with the record kinds each joins.
5. Call `context_engine_create_relationship` with `from_entity_id`, `to_entity_id`, `rel_type` and
   an `idempotency_key`.
6. To change a link, read it with `context_engine_get_relationship`, then call
   `context_engine_update_relationship` with all three fields and its `updated_at` as
   `expected_updated_at`. A 409 `stale_revision` means it changed since you read it.
7. Ask the user before `context_engine_delete_relationship`.
8. To let the AI suggest links, call `context_engine_run_relationship_inference`. When its run is
   `succeeded`, show the user `context_engine_list_relationship_suggestions`, and on the user's
   choice call `context_engine_review_relationship_suggestions` with `accept` or `reject`.

The archetype is the kind of business, and it decides which topics and fields apply. Read it with
`context_engine_get_archetype`, and change it with `context_engine_set_archetype` and an `id` of its
`options`. A MEMBER can list facts and links. Every other context engine operation needs an owner
or admin.

### 33. Freeze an agent's facts and set what it may read

1. Call `context_access_get_summary`. Each card names an agent by `principal_id`, and lists what
   it reads, writes and cannot read.
2. Call `context_access_set_grant` with `principal_id`, `access` (`read`, `read_write` or `none`),
   and `domain_id` for a whole topic or `target` for one field. Send one of the two.
3. Call `context_access_set_ceiling` to set the most sensitive facts the agent may read.
4. To freeze a topic, call `context_engine_capture_snapshot` with `domain_id` and an
   `idempotency_key`, then `context_engine_publish_snapshot` with its `id`. To find a snapshot,
   call `context_engine_list_snapshots`.
5. Call `context_access_pin_snapshot` with the agent's `principal_id` and the snapshot `id`. Send
   a null `snapshot_id` to go back to the live facts.
6. Ask the user before `context_access_remove_agent`. Only a card with `removable` true can be
   removed, and the API cannot add it back.

Every context access operation needs an owner or admin, and its own `context_access` scope.

### 34. Import contacts from a CRM

1. Call `crm_imports_get_settings` and tell the user the `merge_policy`. To change it, call
   `crm_imports_update_settings` with `merge_policy` and the `updated_at` you read as
   `expected_updated_at`.
2. Call `crm_imports_list` to see an import already queued, running or paused. Only one import
   per provider runs at a time.
3. Ask the user, then call `crm_imports_start` with `provider`, optional `object_types` and an
   `idempotency_key`. The import writes contacts, and nothing takes them back. A 503 means no
   import source is available for the provider: tell the user.
4. Call `crm_imports_get` until `status` is `completed` or `failed`. To stop it, call
   `crm_imports_pause`. To go on, ask the user, then call `crm_imports_resume` with the job's
   `updated_at` as `expected_updated_at`.
5. For a `failed` job, read `recent_errors`, then ask the user and call `crm_imports_retry_failed`
   to read the failed records again.
6. Call `crm_imports_list_review_items` for the records the import could not match, and
   `crm_imports_get_review_item` for one of them. Show the user the `record` and its
   `candidates`, then call `crm_imports_resolve_review_item` with `merge`
   and a `contact_id`, `create` or `dismiss`. A decision is final.

Only an owner or admin calls these, except `crm_imports_get_settings`, which any member reads. A
MEMBER or MANAGER gets 403 `insufficient_role`. An organization key gets 403 `no_acting_user` on
`crm_imports_start` and `crm_imports_resolve_review_item`.

### 35. Run the discovery interview

1. Call `discovery_get_progress` to see how much of the business Iris knows.
2. Call `discovery_start` with an `idempotency_key`. Show the user the `greeting`, and keep the
   `session_id`.
3. Send each answer with `discovery_send_message` and show the `reply`. Five calls a minute at
   most, one at a time: a 409 means the last message still runs, so wait and send it again.
   Stop when `ended` is true, or send `done: true` to stop early.
4. To store a fact the user already gave, call `discovery_record_fact` with the `session_id`
   as `sessionId`, the `slot_id` (such as `identity.mission`), the `value` and an
   `idempotency_key`. Read `recorded`: when false, `error` says why.

A stored fact cannot be removed or replaced here. A fact without `entity_ref` starts a new
record. Only an owner or admin calls these, and another organization's interview answers 404.

### 36. Plan marketing with the marketing agent

1. Call `marketing_agent_start` with the user's `goal` and an `idempotency_key`.
2. While `status` is `clarifying`, show the user the `questions`. Call `marketing_agent_answer`
   with the session's `version` and an answer per question `id`.
3. When `status` is `proposed`, show the user the `plan`. Ask the user, then call
   `marketing_agent_approve` with the `version`, the `plan_hash` and `approved: true`. The plan
   creates, changes and turns on sequences, which send to contacts. Read each action in `results`.
4. To stop, call `marketing_agent_cancel`. Actions already done stay applied.
5. To pick up a session, call `marketing_agent_list` and `marketing_agent_get`.

A 409 means the session changed since you read it: read it again with `marketing_agent_get`. A
session belongs to a person, so an organization key gets 403 `no_acting_user`. Only an owner or
admin calls these.

### 37. Stop or allow messages to an address

1. To see who gets no email or SMS, call `contacts_list_suppressions`. Filter with `channel` and
   `q`. Lifted SMS opt-outs show only with `include_lifted` true.
2. To stop messages to an address, ask the user, then call `contacts_suppress_address` with
   `channel`, `identifier` (an email address, or a phone number in E.164) and `reason`. The address
   need not belong to a contact. A 409 means it is already suppressed.
3. To lift one, ask the user, then call `contacts_lift_suppression` with its `id`, its `channel`
   and a `reason`. A 403 means the contact opted out themselves: only the contact can opt back in.

Only an owner or admin manages suppressions. Both writes act as the key's person: a key with no
creator gets 403 `no_acting_user`.

### 38. Move contacts to a location

1. To link several contacts to one more location, call `contacts_assign_location` with
   `contact_ids` (at most 100) and `location_id`. Their other locations stay.
2. To set exactly where one contact belongs, read it with `contacts_get`, then call
   `contacts_set_locations` with `location_ids` (at least one) and its `updated_at` as
   `expected_updated_at`. Every location left out is removed.
3. To change the contact's company or owner at a location, call `contacts_get_affiliation`, then
   `contacts_update_affiliation` with the `revision` it answered as `expected_revision`. Create or
   rename a company with `contacts_upsert_company`. A 409 means it changed: read it again. These act
   as a person, and answer 404 while GoHighLevel is not on for the organization.

A MANAGER with the contacts power moves contacts at their own locations only.

### 39. Set up the email provider

1. Call `email_settings_get`. A 404 means no settings are saved yet.
2. Call `email_settings_update` with the `provider`, `from_email`, `from_name` and the
   `credentials` the user gives you. Send `expected_updated_at` from the read when there was one.
   No answer carries the credential back: `has_credentials` says one is stored.
3. Call `email_settings_verify_connection`. When `success` is false, show the user the `error`.
4. Call `email_settings_verify_domain` and show the user the DNS records to publish. Call it again
   after they publish them. SMTP answers `status` `unsupported`.
5. Ask the user, then call `email_settings_send_test` with a `to_email` and an `idempotency_key`.

Ask the user before `email_settings_delete`: Iris stops sending email and the credential is gone.
Every write needs an owner or admin. A MEMBER or MANAGER gets 403 `insufficient_role`.

### 40. Design an email

1. Call `email_design_get_brand_frame`. To change it, send every field to
   `email_design_set_brand_frame` with `expected_updated_at`, because it replaces the frame.
2. To save a template, call `email_design_create_template` with a `name`, a block `document` and an
   `idempotency_key`. A 409 means the name is taken.
3. To add a footer, call `email_design_create_frame_part` with `kind` `footer`, a `name`, the
   `blocks` and an `idempotency_key`. To make it the one every email uses, call
   `email_design_set_default_frame_part` with its id as `partId`.
4. To change a template or part, send its `updated_at` as `expected_updated_at`. A 409
   `stale_revision` means it changed: read it again.
5. Ask the user, then call `email_design_send_test` with a `subject`, the `document` and an
   `idempotency_key`. It goes to the person behind the credential, so an organization key gets 403
   `no_acting_user`.

Read templates with `email_design_list_templates` and `email_design_get_template`, and change or
delete one with `email_design_update_template` and `email_design_delete_template`. Read headers and
footers with `email_design_list_frame_parts` and `email_design_get_frame_part`, and change, copy or
delete one with `email_design_update_frame_part`, `email_design_duplicate_frame_part` and
`email_design_delete_frame_part`.

Ask the user before a delete. The default header or footer answers 409: make another part the
default first. Every write but the test send needs an owner or admin.

## Other operations

These follow the same rules. Their parameters are in `references/endpoints.md`.

- Appointments: `appointments_list`, `appointments_get`, `appointments_create`,
  `appointments_update`, `appointments_reschedule`, `appointments_cancel`, `appointments_availability`, `locations_list`,
  `locations_booking_options`, `territories_list`, `calendars_list`. To book, follow recipe 9.
  To answer "when is Jane booked", find the contact (recipe 1) and call `appointments_list` with
  `contact_id`.
  To fix a title, notes or attendee detail without moving the appointment, call
  `appointments_update`. It refuses time and status fields with a 400 that names the operation to use.
  To change the place, the all-day flag, the status or the time zone, call
  `appointments_update_details`. It refuses `cancelled`: cancel with `appointments_cancel`. One
  occurrence of a repeating appointment answers 409 with the `series_id` to change instead.
  `appointments_list_conflicted` lists, for one `location_id`, the appointments whose team member
  can no longer do them, with each cause's `key`. To keep one as it is, ask the user, then call
  `appointments_keep_conflicted` with the `cause_keys`. An owner, an admin, or a manager with the
  staff power does this.
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
- Calendar: `calendar_views_get`, `calendar_views_update`, `calendar_views_delete`,
  `calendar_views_set_assignments`, `calendar_feeds_list`, `calendar_feeds_revoke`,
  `calendar_feeds_update_settings`, `calendar_view_links_list`. Read a view with
  `calendar_views_get` and send its `updated_at` as `expected_updated_at` on a change or delete.
  Ask the user before a delete or a revoke: a deleted view takes its view links with it, and a
  revoked feed stops working for every calendar app that reads it.
  `calendar_feeds_update_settings` sets `feed_contact_details_enabled`, with `expected_updated_at`
  from `calendar_settings_get`. Without team scheduling, view writes answer 409: tell the user.
- Zapier: `zapier_get_status`, `zapier_get_event_catalog`, `zapier_get_event_config`,
  `zapier_update_event_config`, `zapier_get_field_mappings`, `zapier_update_field_mappings`,
  `zapier_send_test_event`, `zapier_rotate_signing_secret`, `zapier_disconnect`. The user
  connects Zapier from Zapier. Read a setting before you change it: each write replaces the whole
  set, and rewind cannot undo it. A rotation and the settings writes need an active connection and
  answer 404 without one. With no connection, a test event reaches no Zap. Ask the user before a test event, which runs the subscribed Zaps, before a rotation, which
  stops the old secret at once, and before a disconnect. Any role reads. Only an owner or admin
  writes.
- Google Calendar: `google_calendar_get_status`, `google_calendar_sync` and
  `google_calendar_disconnect` for a location's calendar. `google_calendar_get_team_member`,
  `google_calendar_list_my_calendars`, `google_calendar_choose_my_calendar` and
  `google_calendar_disconnect_team_member` for a team member's own calendar. The user connects a
  calendar in the dashboard. `google_calendar_sync` answers `success: false` when the location has
  no calendar. Only the person lists or chooses their own calendars. The person, or an owner or
  admin, disconnects one. Ask the user before a disconnect: rewind cannot undo it. An
  organization key gets 403 `no_acting_user` on the disconnects and the team member operations.
- Calls: `calls_list`, `calls_get` (with transcript). Filter `calls_list` with `contact_id` to
  see one contact's calls. `calls_delete` deletes calls with their recordings for good: ask the
  user first. It needs `calls:write` and an owner or admin. `deleted` counts what it removed.
- Audiences: `audiences_list`, `audiences_add_member`, `audiences_remove_member`. Both member
  writes are safe to repeat. Only a `static` audience takes members. To build or change an
  audience, follow recipe 13. `audiences_delete` removes an audience for good, for an owner only:
  ask the user first, and offer `audiences_archive` instead. A 409 names the broadcasts and
  sequences that still use it.
- Forms: `forms_list`, `forms_get` (with fields), `forms_list_submissions`. To review the leads
  a form brought in, call `forms_list` for the form's `id`, then `forms_list_submissions` with it.
  Each submission's `payload` is keyed by the `key` of the form's fields, and `contact` is the
  contact it created or updated: use `contacts_get` for more. Submissions page with `page` and
  `limit`. Filter by `status` (`accepted` or `spam`), `from`, `to` (ISO 8601 with a time) and
  `search` (part of an email). Submissions are personal data: quote only what the user asked
  for. A staff member (MEMBER) reads forms but gets 403 `insufficient_role` on submissions: tell the
  user, and do not retry.
- Members: `members_list`, `members_get`, `members_update_role`, `members_update_status`,
  `members_update_agent_access`, `members_set_locations`, `members_set_manager_powers`,
  `members_set_access_level`, `members_set_sms_send`, `members_remove`. A member is a dashboard
  login, not a team member who takes appointments. Read the member with `members_get` and send
  its `updated_at` as `expected_updated_at` on the change. A 409 `stale_revision` means it changed
  after you read it: read it again before you decide. Only an owner or admin changes members, with
  their own credential: an organization key gets 403 `no_acting_user`, and a staff member 403
  `insufficient_role`. Nobody changes their own membership, and an admin does not change an
  owner. Ownership transfer is in the dashboard only. Confirm a role change, a deactivation, an
  SMS change and a removal with the user first: a demotion, a deactivation and a removal revoke
  the keys the person created.
- GoHighLevel: what a pair syncs is `ghl_update_capabilities`, then the settings with their
  GoHighLevel reads. Appointments: `ghl_get_appointment_settings`,
  `ghl_list_appointment_options`, `ghl_update_appointment_settings`, `ghl_list_appointment_reviews`,
  `ghl_confirm_appointment`. Engagement: `ghl_get_engagement_settings`,
  `ghl_list_workflow_options`, `ghl_update_engagement_settings`, `ghl_get_conversation_context`,
  `ghl_list_engagement_reviews`, `ghl_list_summary_receipts`, `ghl_resolve_engagement_review`.
  Objects: `ghl_get_object_settings`, `ghl_get_object_catalog`, `ghl_update_object_settings`,
  `ghl_list_object_recovery`, `ghl_reconcile_object`. Custom fields: `ghl_get_custom_fields`,
  `ghl_get_custom_field_catalog`, `ghl_update_custom_fields`. Associations:
  `ghl_get_associations`, `ghl_get_association_catalog`, `ghl_update_associations`. Enrichment:
  `ghl_list_enrichment_recovery`, `ghl_reconcile_enrichment`. Conflicts: `ghl_list_conflicts`,
  `ghl_resolve_conflict`. Contact recovery and relinks: `ghl_list_contact_recovery`,
  `ghl_reconcile_contact`, `ghl_list_relink_options`, `ghl_preview_relink`, `ghl_apply_relink`.
  Reconciliation: `ghl_list_reconciliations`, `ghl_begin_reconciliation`. Migration cutover:
  `ghl_list_cutovers`, `ghl_preview_cutover`, `ghl_freeze_cutover`, `ghl_rollback_cutover`. A
  settling action on held work tells GoHighLevel nothing new: settle an item only after the user
  checked GoHighLevel. Ask the user before `ghl_rollback_cutover`.
- Invitations: `invitations_list`, `invitations_create`, `invitations_revoke`. Only an owner or
  admin invites, with their own credential. `invitations_create` emails the person at once, so
  confirm the email and the role (`ADMIN` or `MEMBER`) with the user first, and send an
  `idempotency_key`. A 409 `EMAIL_ALREADY_EXISTS` means the person is a member already or has a
  pending invitation. No response holds the invitation link: the person gets it by email.
