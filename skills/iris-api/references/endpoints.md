# Iris API endpoints

Generated from the Iris public OpenAPI document (Iris Public API 1.0.0) by
`scripts/contracts/agent-kit/generate.mts` in the Iris monorepo. Do not edit by hand.

Base URL: `https://api.iris.dotfun.co`. Send `Authorization: Bearer $IRIS_API_KEY` on every call.

## Appointments

### appointments_availability

`GET /api/v1/appointments/availability`. Scope: `appointments:read`. Member: `scoped`.

Find open slots at a location on one day

- `location_id` (query, string uuid, required): A location from `locations_list`
- `date` (query, string, required): The day, in the location’s time zone
- `offering_id` (query, string uuid): Only slots for this service, at its length
- `team_member_id` (query, string uuid): Only slots this team member is free for
- `postal_code` (query, string): The customer’s postal code for a home visit. Only people who cover it.
- `country_code` (query, string): ISO 3166-1 alpha-2 country of `postal_code`
- `duration_minutes` (query, number): Ignored when `offering_id` is sent

### appointments_cancel

`POST /api/v1/appointments/{appointmentId}/cancel`. Scope: `appointments:write`. Member: `scoped`.

Cancel an appointment

- `appointmentId` (path, string uuid, required)

### appointments_create

`POST /api/v1/appointments`. Scope: `appointments:write`. Member: `scoped`.

Book an appointment for a contact

- `calendar_id` (body, string uuid): A calendar from `calendars_list`. It sets the location. Send this or `location_id`, not both. Use it at a location that is not staffed.
- `location_id` (body, string uuid): A location from `locations_list`. Send this or `calendar_id`, not both. A staffed location needs this shape.
- `offering_id` (body, string uuid): With `location_id`: a service from `locations_booking_options`. The end time must match its `duration_minutes`.
- `team_member_id` (body, string uuid): With `location_id`: the team member to book. Leave it out to book the first team member who is free.
- `service_address` (body, ServiceAddressDto): With `location_id`: where a home visit happens. Its postal code must be in a territory.
  - `line1` (body, string)
  - `line2` (body, string)
  - `city` (body, string)
  - `region` (body, string): State, province or region
  - `postal_code` (body, string): Decides the territory, and so who can come
  - `country_code` (body, string): ISO 3166-1 alpha-2
- `contact_id` (body, string uuid, required): The contact the appointment is for
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required)
- `title` (body, string)
- `idempotency_key` (body, string, required): Your own key for this booking. A retry with the same key and the same details returns the first booking. The same key with other details is a 409.

### appointments_get

`GET /api/v1/appointments/{appointmentId}`. Scope: `appointments:read`. Member: `scoped`.

Get one appointment

- `appointmentId` (path, string uuid, required)

### appointments_list

`GET /api/v1/appointments`. Scope: `appointments:read`. Member: `scoped`.

List appointments in a time window

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `contact_id` (query, string uuid): Only this contact’s appointments: bookings made for the contact, and bookings whose attendee phone or email is the contact’s.
- `from` (query, string date-time): Start of the window. Defaults to now.
- `to` (query, string date-time): End of the window. Defaults to 30 days after `from`. At most 92 days after it.

### appointments_reschedule

`POST /api/v1/appointments/{appointmentId}/reschedule`. Scope: `appointments:write`. Member: `scoped`.

Move an appointment to a new time

- `appointmentId` (path, string uuid, required)
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required)

## Audiences

### audiences_add_member

`POST /api/v1/audiences/{audienceId}/members`. Scope: `audiences:write`. Member: `deny`.

Add a contact to a static audience

- `audienceId` (path, string uuid, required)
- `contact_id` (body, string uuid, required)

### audiences_list

`GET /api/v1/audiences`. Scope: `audiences:read`. Member: `open`.

List the organization’s audiences

### audiences_remove_member

`DELETE /api/v1/audiences/{audienceId}/members/{contactId}`. Scope: `audiences:write`. Member: `deny`.

Remove a contact from a static audience

- `audienceId` (path, string uuid, required)
- `contactId` (path, string uuid, required)

## Calendars

### calendars_list

`GET /api/v1/calendars`. Scope: `appointments:read`. Member: `scoped`.

List the calendars appointments can be booked on

## Calls

### calls_get

`GET /api/v1/calls/{callId}`. Scope: `calls:read`. Member: `scoped`.

Get one call with its transcript

- `callId` (path, string, required): The `id` from `calls_list`

### calls_list

`GET /api/v1/calls`. Scope: `calls:read`. Member: `scoped`.

List calls

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `contact_id` (query, string uuid): Only calls to or from this contact’s phone number
- `from` (query, string date-time): Only calls that started at or after this time
- `to` (query, string date-time): Only calls that started at or before this time

## Contacts

### contacts_add_note

`POST /api/v1/contacts/{contactId}/notes`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Add a note to a contact

- `contactId` (path, string uuid, required)
- `body` (body, string, required)

### contacts_add_tag

`POST /api/v1/contacts/{contactId}/tags`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Add a tag to a contact

- `contactId` (path, string uuid, required)
- `tag` (body, string, required): Tag name. Matched without regard to case or surrounding space; created on first use.

### contacts_get

`GET /api/v1/contacts/{contactId}`. Scope: `contacts:read`. Member: `scoped`.

Get one contact

- `contactId` (path, string uuid, required)

### contacts_remove_tag

`DELETE /api/v1/contacts/{contactId}/tags/{tag}`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Remove a tag from a contact

- `contactId` (path, string uuid, required)
- `tag` (path, string, required): Tag name, URL-encoded

### contacts_search

`GET /api/v1/contacts`. Scope: `contacts:read`. Member: `scoped`.

Search contacts

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `q` (query, string): Free text. Matches contacts whose name, email or phone contains it, without regard to case.
- `email` (query, string email): Exact email, without regard to case
- `phone` (query, string): Exact phone number with its country code. Spaces, dashes and brackets are ignored, so `+1 (415) 555-0100` works. Matches the contact's phone number, not a phone held in `custom_fields`.

### contacts_suppress

`POST /api/v1/contacts/{contactId}/suppress`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Suppress a contact on email or SMS

- `contactId` (path, string uuid, required)
- `channels` (body, array of string, required, one of `email`, `sms`)
- `reason` (body, string): Why, for example "asked to stop on a call". Written to the server log; not stored on the contact.

### contacts_update

`PATCH /api/v1/contacts/{contactId}`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Update a contact

- `contactId` (path, string uuid, required)
- `name` (body, string)
- `phone` (body, string): E.164, e.g. +14155550100
- `email` (body, string email)
- `stage_id` (body, string): A stage `id` from the organization's pipeline
- `custom_fields` (body, object): Custom field values to merge, keyed by field name. An unknown name is a 400 that names it. At most 200 keys.

### contacts_upsert

`POST /api/v1/contacts`. Scope: `contacts:write`. Member: `deny`.

Create or update a contact by email

- `name` (body, string, required): Contact full name
- `email` (body, string email, required): Contact email address — the upsert key, matched case-insensitively
- `phone` (body, string): Contact phone number. Stored in field_values; the contact itself stays email-keyed with phone_number NULL.
- `source` (body, string, required): Attribution source
- `fields` (body, object): Arbitrary key/value data merged into the contact's CRM field values. At most 200 keys. With assessment_abandoned, user_message_count must be a numeric nonnegative safe integer when present. Cohort routing uses this request's count: started requires a positive count, never_started requires zero, and missing counts match only unfiltered triggers.
- `cancel_events` (body, array of ContactCancelEventDto): Sequence events to CANCEL for this contact, unconditionally. Processed before `events`, and idempotent because a second call cancels nothing. Use it for a goal exit, such as ending a win-back nurture once the contact converts.
  - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
  - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.
- `events` (body, array of ContactEventDto): Sequence events to FIRE for this contact, after the cancellations. Each event in turn claims its `key`, cancels the enrollments named in its `supersedes`, then enrolls. An event with no subscribing sequence leaves its key unspent, so a later retry still enrolls.
  - `name` (body, string, required): Event name. Matched as free text against the `event_name` of every active `event` sequence in the organization.
  - `key` (body, string, required): Caller-owned idempotency key for this event. Stable for "the same logical event", so a redelivery is a no-op. Surrounding whitespace is trimmed.
  - `supersedes` (body, array of ContactCancelEventDto): Events whose running enrollments this one REPLACES. Cancelled after this event claims its `key` and before it enrolls, so a redelivery with the same `key` cancels nothing and enrolls nothing. Use this for mutually exclusive states of one subject; use the top-level `cancel_events` for an unconditional exit.
    - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
    - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.

## Conversations

### contacts_record_sms_consent

`POST /api/v1/contacts/{contactId}/sms-consent`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`.

Record a contact’s SMS opt-in or opt-out

- `contactId` (path, string uuid, required)
- `action` (body, string, required, one of `opt_in`, `opt_out`)
- `source` (body, string): Where the contact gave or withdrew consent, for example "web form". Kept with an opt-in.

### conversations_get

`GET /api/v1/conversations/{conversationId}`. Scope: `conversations:read`. Member: `scoped`.

Get one conversation with its messages

- `conversationId` (path, string uuid, required)

### conversations_list

`GET /api/v1/conversations`. Scope: `conversations:read`. Member: `scoped`.

List email and SMS conversations

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `channel` (query, string, one of `email`, `sms`): Only this channel. Both when left out.
- `q` (query, string): Free text search

### conversations_send_sms

`POST /api/v1/conversations/sms`. Scope: `conversations:write`. Member: `deny`. Manager power: `contacts`.

Send an SMS to a contact who has consented

- `contact_id` (body, string uuid): Send to this contact’s phone number
- `phone` (body, string): Send to this number, with its country code
- `body` (body, string, required)

## Locations

### locations_booking_options

`GET /api/v1/locations/{locationId}/booking-options`. Scope: `appointments:read`. Member: `scoped`.

List the services and team members a location books

- `locationId` (path, string uuid, required)

### locations_list

`GET /api/v1/locations`. Scope: `appointments:read`. Member: `scoped`.

List the locations appointments can be booked at

## MCP

### mcp_request

`POST /api/v1/mcp`. Scope: any live key. Member: `open`.

Send one MCP JSON-RPC message

## Me

### me_get

`GET /api/v1/me`. Scope: any live key. Member: `open`.

Describe the calling API key or connected client, and the locations it reaches

## Sequences

### contacts_list_enrollments

`GET /api/v1/contacts/{contactId}/enrollments`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

List one contact’s enrollments across every sequence

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### sequences_activate

`POST /api/v1/sequences/{sequenceId}/activate`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Turn a sequence on

- `sequenceId` (path, string uuid, required)

### sequences_analytics

`GET /api/v1/sequences/{sequenceId}/analytics`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

Get the send totals of a sequence

- `sequenceId` (path, string uuid, required)

### sequences_cancel_enrollment

`POST /api/v1/sequences/{sequenceId}/enrollments/{enrollmentId}/cancel`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Remove a contact from a sequence

- `sequenceId` (path, string uuid, required)
- `enrollmentId` (path, string uuid, required)

### sequences_capabilities

`GET /api/v1/sequences/capabilities`. Scope: `sequences:read`. Member: `open`.

What sequence authoring this server allows

### sequences_create

`POST /api/v1/sequences`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Create a draft sequence

- `name` (body, string, required)
- `description` (body, string)
- `trigger_type` (body, string, required): The primary trigger, a `key` from `sequences_list_triggers`
- `trigger_config` (body, object): Settings of the primary trigger
- `triggers` (body, array of SequenceTriggerInputDto): Every trigger. The first is the primary one and must match `trigger_type` when both are sent.
  - `type` (body, string, required): A trigger `key` from `sequences_list_triggers` whose `authorable` is true
  - `config` (body, object): Trigger settings
- `kind` (body, string, one of `automation`, `broadcast`): `automation` runs off a trigger. `broadcast` sends to an audience.
- `audience_id` (body, string uuid): For a broadcast: its audience
- `send_schedule_id` (body, string uuid): A saved send schedule. Null uses the organization default.
- `location_id` (body, string uuid): The location the sequence runs for: it enrolls only contacts at that location. Null or omitted is organization-wide, which only an owner or admin may set. A manager must name one of their locations. On an update, a move is refused while any enrollment, live or finished, holds a contact who is not at the new location.
- `is_active` (body, boolean, one of `false`): Only `false`, and `true` is a 400. A new sequence is always an inactive draft. On an update, `false` turns the sequence off and cancels every enrollment. Turn a sequence on with `sequences_activate`, and hold contacts in place with `sequences_pause`.
- `steps` (body, array of SequenceStepInputDto, required): The ordered steps. On an update, replaces them all.
  - `step_index` (body, number, required): Zero-based position of the step
  - `channel` (body, string, required, one of `email`, `sms`, `wait`, `task`): `email` and `sms` message the contact. `wait` only waits. `task` notifies the team: its subject is the title and its body the note.
  - `delay_minutes` (body, number, required): Minutes to wait after the previous step before this one runs
  - `step_key` (body, string): Stable id of the step. Edges name steps by it. Keep it when you edit a step. Generated when omitted.
  - `subject_template` (body, string): Email subject, or the task title. May use `{{variables}}`.
  - `body_template` (body, string): Message body, or the task note. May use `{{variables}}`.
  - `preheader_template` (body, string): Email preview text shown next to the subject in the inbox
  - `body_document` (body, object): A designed email body (EmailDocument v1). Omit to keep the stored one. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
- `exit_conditions` (body, array of SequenceExitConditionInputDto): Replaces the exit conditions. An enrollment stops when any of them is met.
  - `condition` (body, object, required): A condition in the DSL `sequences_get_condition_vocabulary` describes, e.g. `{ "signal": "replied" }`
  - `cancel_reason` (body, string, required, one of `goal_met`, `converted`, `stage_reached`, `replied`, `booked`, `opted_out`): Recorded on the enrollment when this exit fires
- `edges` (body, array of SequenceEdgeInputDto): Replaces the branch edges. Omit for a straight sequence.
  - `from_step_key` (body, string, required): `step_key` of the step the edge leaves
  - `to_step_key` (body, string): `step_key` it goes to. Null ends the sequence.
  - `condition` (body, object): A routing condition in the condition DSL. Omit for the fallback edge.
  - `priority` (body, number): Lower runs first. The first edge that matches wins.
  - `max_iterations` (body, number): Most passes through a loop. Required on an edge that goes back.
  - `variant_weight` (body, number): A/B split weight. Every edge from the step must carry one, and they sum to 100.
- `send_window` (body, SendWindowInputDto): Hours of the day email and SMS may send. Null removes the window.
  - `start_minute` (body, number, required): Opens at this minute of the day, organization time. 540 is 09:00.
  - `end_minute` (body, number, required): Closes at this minute (exclusive). 1080 is 18:00.

### sequences_duplicate

`POST /api/v1/sequences/{sequenceId}/duplicate`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Copy a sequence into a new draft

- `sequenceId` (path, string uuid, required)

### sequences_enroll

`POST /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Enroll a contact in a sequence

- `sequenceId` (path, string uuid, required)
- `contact_id` (body, string uuid): The contact to enroll
- `email` (body, string): Or the email of the contact to enroll, matched without regard to case
- `start_step_key` (body, string): Start at this `step_key` instead of the first step

### sequences_get

`GET /api/v1/sequences/{sequenceId}`. Scope: `sequences:read`. Member: `open`.

Get one sequence with its steps

- `sequenceId` (path, string uuid, required)

### sequences_get_condition_vocabulary

`GET /api/v1/sequences/condition-vocabulary`. Scope: `sequences:read`. Member: `open`.

List the signals a condition can test

### sequences_get_enrollment

`GET /api/v1/sequences/{sequenceId}/enrollments/{enrollmentId}`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

Get the send log of one enrollment

- `sequenceId` (path, string uuid, required)
- `enrollmentId` (path, string uuid, required)

### sequences_list

`GET /api/v1/sequences`. Scope: `sequences:read`. Member: `open`.

List the organization’s sequences

### sequences_list_enrollments

`GET /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

List the contacts enrolled in one sequence

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `status` (query, string, one of `active`, `paused`, `completed`, `cancelled`, `failed`): Only enrollments with this status
- `contact_id` (query, string uuid): Only this contact's enrollments in the sequence
- `email` (query, string): Only the enrollments of the contact with this email, in the key’s organization. Matched without regard to case. Takes precedence over `contact_id`. An email no contact carries returns an empty page, not a 404. When more than one contact carries the email, the one that owns it as its identity is used.

### sequences_list_triggers

`GET /api/v1/sequences/triggers`. Scope: `sequences:read`. Member: `open`.

List the triggers a sequence can start on

### sequences_list_variables

`GET /api/v1/sequences/variables`. Scope: `sequences:read`. Member: `open`.

List the variables step copy may use

### sequences_pause

`POST /api/v1/sequences/{sequenceId}/pause`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Pause a sequence

- `sequenceId` (path, string uuid, required)

### sequences_resume

`POST /api/v1/sequences/{sequenceId}/resume`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Resume a paused sequence

- `sequenceId` (path, string uuid, required)

### sequences_update

`PATCH /api/v1/sequences/{sequenceId}`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`.

Change a sequence

- `sequenceId` (path, string uuid, required)
- `name` (body, string)
- `description` (body, string)
- `trigger_type` (body, string): The primary trigger, a `key` from `sequences_list_triggers`
- `trigger_config` (body, object): Settings of the primary trigger
- `triggers` (body, array of SequenceTriggerInputDto): Every trigger. The first is the primary one and must match `trigger_type` when both are sent.
  - `type` (body, string, required): A trigger `key` from `sequences_list_triggers` whose `authorable` is true
  - `config` (body, object): Trigger settings
- `kind` (body, string, one of `automation`, `broadcast`): `automation` runs off a trigger. `broadcast` sends to an audience.
- `audience_id` (body, string uuid): For a broadcast: its audience
- `send_schedule_id` (body, string uuid): A saved send schedule. Null uses the organization default.
- `location_id` (body, string uuid): The location the sequence runs for: it enrolls only contacts at that location. Null or omitted is organization-wide, which only an owner or admin may set. A manager must name one of their locations. On an update, a move is refused while any enrollment, live or finished, holds a contact who is not at the new location.
- `is_active` (body, boolean, one of `false`): Only `false`, and `true` is a 400. A new sequence is always an inactive draft. On an update, `false` turns the sequence off and cancels every enrollment. Turn a sequence on with `sequences_activate`, and hold contacts in place with `sequences_pause`.
- `steps` (body, array of SequenceStepInputDto): The ordered steps. On an update, replaces them all.
  - `step_index` (body, number, required): Zero-based position of the step
  - `channel` (body, string, required, one of `email`, `sms`, `wait`, `task`): `email` and `sms` message the contact. `wait` only waits. `task` notifies the team: its subject is the title and its body the note.
  - `delay_minutes` (body, number, required): Minutes to wait after the previous step before this one runs
  - `step_key` (body, string): Stable id of the step. Edges name steps by it. Keep it when you edit a step. Generated when omitted.
  - `subject_template` (body, string): Email subject, or the task title. May use `{{variables}}`.
  - `body_template` (body, string): Message body, or the task note. May use `{{variables}}`.
  - `preheader_template` (body, string): Email preview text shown next to the subject in the inbox
  - `body_document` (body, object): A designed email body (EmailDocument v1). Omit to keep the stored one. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
- `exit_conditions` (body, array of SequenceExitConditionInputDto): Replaces the exit conditions. An enrollment stops when any of them is met.
  - `condition` (body, object, required): A condition in the DSL `sequences_get_condition_vocabulary` describes, e.g. `{ "signal": "replied" }`
  - `cancel_reason` (body, string, required, one of `goal_met`, `converted`, `stage_reached`, `replied`, `booked`, `opted_out`): Recorded on the enrollment when this exit fires
- `edges` (body, array of SequenceEdgeInputDto): Replaces the branch edges. Omit for a straight sequence.
  - `from_step_key` (body, string, required): `step_key` of the step the edge leaves
  - `to_step_key` (body, string): `step_key` it goes to. Null ends the sequence.
  - `condition` (body, object): A routing condition in the condition DSL. Omit for the fallback edge.
  - `priority` (body, number): Lower runs first. The first edge that matches wins.
  - `max_iterations` (body, number): Most passes through a loop. Required on an edge that goes back.
  - `variant_weight` (body, number): A/B split weight. Every edge from the step must carry one, and they sum to 100.
- `send_window` (body, SendWindowInputDto): Hours of the day email and SMS may send. Null removes the window.
  - `start_minute` (body, number, required): Opens at this minute of the day, organization time. 540 is 09:00.
  - `end_minute` (body, number, required): Closes at this minute (exclusive). 1080 is 18:00.

## Territories

### territories_list

`GET /api/v1/territories`. Scope: `appointments:read`. Member: `deny`.

List the service territories and their postal codes
