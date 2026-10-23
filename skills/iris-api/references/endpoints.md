# Iris API endpoints

Generated from the Iris public OpenAPI document (Iris Public API 1.0.0) by
`scripts/contracts/agent-kit/generate.mts` in the Iris monorepo. Do not edit by hand.

Base URL: `https://api.iris.dotfun.co`. Send `Authorization: Bearer $IRIS_API_KEY` on every call.

## Agents

### agents_activate

`POST /api/v1/agents/{agentId}/activate`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Turn a subagent on, so it takes calls

- `agentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### agents_disable

`POST /api/v1/agents/{agentId}/disable`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Turn a subagent off, so it stops taking calls

- `agentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### agents_get

`GET /api/v1/agents/{agentId}`. Scope: `agents:read`. Member: `open`.

Read one phone agent

- `agentId` (path, string uuid, required)

### agents_get_staging_diff

`GET /api/v1/agents/{agentId}/staging-diff`. Scope: `agents:read`. Member: `open`.

Check whether an agent’s draft differs from its live version

- `agentId` (path, string uuid, required)

### agents_go_live

`POST /api/v1/agents/{agentId}/go-live`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Publish an agent’s draft, so callers hear it

- `agentId` (path, string uuid, required)
- `notes` (body, string): Notes to keep with the new version

### agents_list

`GET /api/v1/agents`. Scope: `agents:read`. Member: `open`.

List the organization’s phone agents

### agents_list_versions

`GET /api/v1/agents/{agentId}/versions`. Scope: `agents:read`. Member: `open`.

List the versions an agent has published

- `agentId` (path, string uuid, required)
- `limit` (query, number)
- `offset` (query, number)

### agents_rollback

`POST /api/v1/agents/{agentId}/rollback`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Put an earlier version of an agent back on the phone line

- `agentId` (path, string uuid, required)
- `version_number` (body, number, required): The version to go back to, from `agents_list_versions`

### agents_update

`PATCH /api/v1/agents/{agentId}`. Scope: `agents:write`. Member: `deny`. Changes: `agents`.

Change a phone agent’s name, greeting or prompt fields

- `agentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `first_message` (body, string): The greeting. Null clears it.
- `prompt_template` (body, string)
- `custom_notes` (body, string)
- `agent_instructions` (body, string)
- `transfer_condition` (body, string)
- `agent_tone_option_id` (body, string uuid)

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

`POST /api/v1/appointments/{appointmentId}/cancel`. Scope: `appointments:write`. Member: `scoped`. Confirm: required. Changes: `appointments`.

Cancel an appointment

- `appointmentId` (path, string uuid, required)

### appointments_create

`POST /api/v1/appointments`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`. Idempotent: send `idempotency_key`.

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

`POST /api/v1/appointments/{appointmentId}/reschedule`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Move an appointment to a new time

- `appointmentId` (path, string uuid, required)
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required)

### appointments_update

`PATCH /api/v1/appointments/{appointmentId}`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Change an appointment’s title, notes or attendee details

- `appointmentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `title` (body, string)
- `description` (body, string): Notes on the appointment. `null` clears them.
- `attendee_name` (body, string)
- `attendee_phone` (body, string): E.164, e.g. +14155550100
- `attendee_email` (body, string)
- `attendee_notes` (body, string): Notes about the attendee

## Audiences

### audiences_add_member

`POST /api/v1/audiences/{audienceId}/members`. Scope: `audiences:write`. Member: `deny`. Changes: `audiences`.

Add a contact to a static audience

- `audienceId` (path, string uuid, required)
- `contact_id` (body, string uuid, required)

### audiences_archive

`POST /api/v1/audiences/{audienceId}/archive`. Scope: `audiences:write`. Member: `deny`. Changes: `audiences`.

Archive an audience

- `audienceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### audiences_count

`GET /api/v1/audiences/{audienceId}/count`. Scope: `audiences:read`. Member: `open`.

Count the contacts in a saved audience

- `audienceId` (path, string uuid, required)

### audiences_create

`POST /api/v1/audiences`. Scope: `audiences:write`. Member: `deny`. Changes: `audiences`. Idempotent: send `idempotency_key`.

Create an audience

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required)
- `description` (body, string)
- `kind` (body, string, one of `static`, `dynamic`): `dynamic` holds the contacts that match `definition`. `static` holds the contacts added to it. Fixed after create.
- `channel` (body, string, one of `any`, `email`, `sms`): The channel the audience is meant for
- `definition` (body, AudienceFilterDto): Which contacts a dynamic audience holds. A static audience keeps its members instead, and ignores it.
  - `match` (body, string, one of `all`, `any`): `all`: a contact must meet every rule (AND). `any`: one rule is enough (OR).
  - `rules` (body, array of AudienceFilterRuleDto): At most 50 rules, in one flat list: a rule holds no other rules. No rules, or an empty list, means every contact of the organization.
    - `field` (body, string, required): The contact field the rule tests. Either a contact column: `display_name`, `email`, `phone_number` (text); `total_calls` (number); `first_seen_at`, `last_seen_at`, `created_at`, `updated_at` (dates, compared as ISO 8601 strings). Or `field_values.<key>`, which reads a CRM custom field of this organization: `<key>` is the name of an enabled custom field (letters, digits and underscore only). A custom field of type number or currency compares as a number, date or datetime as an ISO 8601 string, boolean as true or false, and any other type as text. To filter by pipeline stage, use the `audience_field` that `contacts_list_stages` answers, with stage ids as values. Any other field makes `audiences_preview_count`, and `audiences_count` and `audiences_list_members` on a dynamic audience, answer 400. Create and update check only its format, at most 200 characters.
    - `op` (body, string, required, one of `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`, `lte`, `contains`, `contains_any`, `exists`, `not_exists`): `eq`, `neq`: equal or not equal. `in`, `not_in`: equal to one of a list, or to none of it. `gt`, `gte`, `lt`, `lte`: greater or less than; only on number and date fields (`total_calls`, the four date columns, and custom fields of type number, currency, date or datetime). `contains`: the text holds the value, ignoring case. `contains_any`: the text holds any value of the list. Both work on the text columns and on custom fields, not on `total_calls` or dates. `exists`, `not_exists`: the field has a value, or has none. `eq`, `neq`, `in`, `not_in`, `exists` and `not_exists` work on every field.
    - `value` (body, object): What the field is compared with. Leave it out for `exists` and `not_exists`. `in`, `not_in` and `contains_any` take a non-empty array of at most 500 strings, numbers or booleans. Every other op takes one string, number or boolean. A number field needs a number (or a numeric string). A string is at most 1000 characters. An object, or an array inside the array, answers 400.
  - `exclude_opted_out` (body, boolean): Stored with the audience. Counts and contact lists do not apply it: opted-out contacts are removed when a message is sent.

### audiences_get

`GET /api/v1/audiences/{audienceId}`. Scope: `audiences:read`. Member: `open`.

Read one audience with its definition

- `audienceId` (path, string uuid, required)

### audiences_list

`GET /api/v1/audiences`. Scope: `audiences:read`. Member: `open`.

List the organization’s audiences

### audiences_list_members

`GET /api/v1/audiences/{audienceId}/contacts`. Scope: `audiences:read`. Member: `deny`.

List the contacts in an audience

- `audienceId` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### audiences_preview_count

`POST /api/v1/audiences/preview-count`. Scope: `audiences:read`. Member: `open`. Changes: none.

Count the contacts a draft definition matches

- `match` (body, string, one of `all`, `any`): `all`: a contact must meet every rule (AND). `any`: one rule is enough (OR).
- `rules` (body, array of AudienceFilterRuleDto): At most 50 rules, in one flat list: a rule holds no other rules. No rules, or an empty list, means every contact of the organization.
  - `field` (body, string, required): The contact field the rule tests. Either a contact column: `display_name`, `email`, `phone_number` (text); `total_calls` (number); `first_seen_at`, `last_seen_at`, `created_at`, `updated_at` (dates, compared as ISO 8601 strings). Or `field_values.<key>`, which reads a CRM custom field of this organization: `<key>` is the name of an enabled custom field (letters, digits and underscore only). A custom field of type number or currency compares as a number, date or datetime as an ISO 8601 string, boolean as true or false, and any other type as text. To filter by pipeline stage, use the `audience_field` that `contacts_list_stages` answers, with stage ids as values. Any other field makes `audiences_preview_count`, and `audiences_count` and `audiences_list_members` on a dynamic audience, answer 400. Create and update check only its format, at most 200 characters.
  - `op` (body, string, required, one of `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`, `lte`, `contains`, `contains_any`, `exists`, `not_exists`): `eq`, `neq`: equal or not equal. `in`, `not_in`: equal to one of a list, or to none of it. `gt`, `gte`, `lt`, `lte`: greater or less than; only on number and date fields (`total_calls`, the four date columns, and custom fields of type number, currency, date or datetime). `contains`: the text holds the value, ignoring case. `contains_any`: the text holds any value of the list. Both work on the text columns and on custom fields, not on `total_calls` or dates. `exists`, `not_exists`: the field has a value, or has none. `eq`, `neq`, `in`, `not_in`, `exists` and `not_exists` work on every field.
  - `value` (body, object): What the field is compared with. Leave it out for `exists` and `not_exists`. `in`, `not_in` and `contains_any` take a non-empty array of at most 500 strings, numbers or booleans. Every other op takes one string, number or boolean. A number field needs a number (or a numeric string). A string is at most 1000 characters. An object, or an array inside the array, answers 400.
- `exclude_opted_out` (body, boolean): Stored with the audience. Counts and contact lists do not apply it: opted-out contacts are removed when a message is sent.

### audiences_remove_member

`DELETE /api/v1/audiences/{audienceId}/members/{contactId}`. Scope: `audiences:write`. Member: `deny`. Confirm: required. Changes: `audiences`.

Remove a contact from a static audience

- `audienceId` (path, string uuid, required)
- `contactId` (path, string uuid, required)

### audiences_update

`PATCH /api/v1/audiences/{audienceId}`. Scope: `audiences:write`. Member: `deny`. Changes: `audiences`.

Change an audience

- `audienceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `description` (body, string): Null clears it
- `channel` (body, string, one of `any`, `email`, `sms`)
- `definition` (body, AudienceFilterDto): Replaces the whole definition. Which contacts a dynamic audience holds. A static audience keeps its members instead, and ignores it.
  - `match` (body, string, one of `all`, `any`): `all`: a contact must meet every rule (AND). `any`: one rule is enough (OR).
  - `rules` (body, array of AudienceFilterRuleDto): At most 50 rules, in one flat list: a rule holds no other rules. No rules, or an empty list, means every contact of the organization.
    - `field` (body, string, required): The contact field the rule tests. Either a contact column: `display_name`, `email`, `phone_number` (text); `total_calls` (number); `first_seen_at`, `last_seen_at`, `created_at`, `updated_at` (dates, compared as ISO 8601 strings). Or `field_values.<key>`, which reads a CRM custom field of this organization: `<key>` is the name of an enabled custom field (letters, digits and underscore only). A custom field of type number or currency compares as a number, date or datetime as an ISO 8601 string, boolean as true or false, and any other type as text. To filter by pipeline stage, use the `audience_field` that `contacts_list_stages` answers, with stage ids as values. Any other field makes `audiences_preview_count`, and `audiences_count` and `audiences_list_members` on a dynamic audience, answer 400. Create and update check only its format, at most 200 characters.
    - `op` (body, string, required, one of `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`, `lte`, `contains`, `contains_any`, `exists`, `not_exists`): `eq`, `neq`: equal or not equal. `in`, `not_in`: equal to one of a list, or to none of it. `gt`, `gte`, `lt`, `lte`: greater or less than; only on number and date fields (`total_calls`, the four date columns, and custom fields of type number, currency, date or datetime). `contains`: the text holds the value, ignoring case. `contains_any`: the text holds any value of the list. Both work on the text columns and on custom fields, not on `total_calls` or dates. `exists`, `not_exists`: the field has a value, or has none. `eq`, `neq`, `in`, `not_in`, `exists` and `not_exists` work on every field.
    - `value` (body, object): What the field is compared with. Leave it out for `exists` and `not_exists`. `in`, `not_in` and `contains_any` take a non-empty array of at most 500 strings, numbers or booleans. Every other op takes one string, number or boolean. A number field needs a number (or a numeric string). A string is at most 1000 characters. An object, or an array inside the array, answers 400.
  - `exclude_opted_out` (body, boolean): Stored with the audience. Counts and contact lists do not apply it: opted-out contacts are removed when a message is sent.
- `is_archived` (body, boolean): `false` restores an archived audience. Archive with `audiences_archive`.

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

`POST /api/v1/contacts/{contactId}/notes`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`. Idempotent: send `idempotency_key`.

Add a note to a contact

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `body` (body, string, required)

### contacts_add_tag

`POST /api/v1/contacts/{contactId}/tags`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Add a tag to a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `tag` (body, string, required): Tag name. Matched without regard to case or surrounding space; created on first use.

### contacts_get

`GET /api/v1/contacts/{contactId}`. Scope: `contacts:read`. Member: `scoped`.

Get one contact

- `contactId` (path, string uuid, required)

### contacts_list_interactions

`GET /api/v1/contacts/{contactId}/interactions`. Scope: `contacts:read`. Member: `scoped`.

List the interactions of a contact

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `channel` (query, string, one of `voice`, `chat`, `sms`): Only interactions on this channel
- `status` (query, string, one of `in_progress`, `completed`, `abandoned`): Only interactions in this status

### contacts_list_notes

`GET /api/v1/contacts/{contactId}/notes`. Scope: `contacts:read`. Member: `deny`. Manager power: `contacts`.

List the notes of a contact

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### contacts_list_stages

`GET /api/v1/contacts/stages`. Scope: `contacts:read`. Member: `open`.

List the organization’s pipeline stages

### contacts_remove_tag

`DELETE /api/v1/contacts/{contactId}/tags/{tag}`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Confirm: required. Changes: `contacts`.

Remove a tag from a contact

- `contactId` (path, string uuid, required)
- `tag` (path, string, required): Tag name, URL-encoded
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### contacts_search

`GET /api/v1/contacts`. Scope: `contacts:read`. Member: `scoped`.

Search contacts

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `q` (query, string): Free text. Matches contacts whose name, email or phone contains it, without regard to case.
- `email` (query, string email): Exact email, without regard to case
- `phone` (query, string): Exact phone number with its country code. Spaces, dashes and brackets are ignored, so `+1 (415) 555-0100` works. Matches the contact's phone number, not a phone held in `custom_fields`.

### contacts_suppress

`POST /api/v1/contacts/{contactId}/suppress`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Confirm: required. Changes: `contacts`, `sequences`.

Suppress a contact on email or SMS

- `contactId` (path, string uuid, required)
- `channels` (body, array of string, required, one of `email`, `sms`)
- `reason` (body, string): Why, for example "asked to stop on a call". Written to the server log; not stored on the contact.

### contacts_update

`PATCH /api/v1/contacts/{contactId}`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Update a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `phone` (body, string): E.164, e.g. +14155550100
- `email` (body, string email)
- `stage_id` (body, string): A stage `id` from the organization's pipeline
- `custom_fields` (body, object): Custom field values to merge, keyed by field name. An unknown name is a 400 that names it. At most 200 keys.

### contacts_upsert

`POST /api/v1/contacts`. Scope: `contacts:write`. Member: `deny`. Confirm: required. Changes: `contacts`, `sequences`.

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

`POST /api/v1/contacts/{contactId}/sms-consent`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Confirm: required. Changes: `contacts`, `sequences`. Idempotent: send `idempotency_key`.

Record a contact’s SMS opt-in or opt-out

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `action` (body, string, required, one of `opt_in`, `opt_out`)
- `source` (body, string): Where the contact gave or withdrew consent, for example "web form". Kept with an opt-in.

### conversations_get

`GET /api/v1/conversations/{conversationId}`. Scope: `conversations:read`. Member: `scoped`.

Get one conversation with its messages

- `conversationId` (path, string uuid, required)

### conversations_hold

`POST /api/v1/conversations/{conversationId}/hold`. Scope: `conversations:write`. Member: `sms_setting`. Changes: `conversations`.

Hold an SMS or web chat conversation for a person: the AI stops answering

- `conversationId` (path, string uuid, required)

### conversations_list

`GET /api/v1/conversations`. Scope: `conversations:read`. Member: `scoped`.

List email, SMS and web chat conversations

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `channel` (query, string, one of `email`, `sms`, `chat`): Only this channel. Every channel when left out. A search (`q`) leaves chat out.
- `q` (query, string): Free text search

### conversations_reply

`POST /api/v1/conversations/{conversationId}/reply`. Scope: `conversations:write`. Member: `sms_setting`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Reply in an email, SMS or web chat conversation

- `conversationId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `body` (body, string, required): The text of the reply. At most 1600 characters for SMS and 4000 for chat.

### conversations_resume

`POST /api/v1/conversations/{conversationId}/resume`. Scope: `conversations:write`. Member: `sms_setting`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Hand an SMS or web chat conversation back to the AI

- `conversationId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### conversations_send_sms

`POST /api/v1/conversations/sms`. Scope: `conversations:write`. Member: `sms_setting`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Send an SMS to a contact who has consented

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `contact_id` (body, string uuid): Send to this contact’s phone number
- `phone` (body, string): Send to this number, with its country code
- `body` (body, string, required)

## CRM fields

### crm_fields_get_stage_config

`GET /api/v1/crm-fields/stage-config`. Scope: `crm_fields:read`. Member: `open`.

Read the pipeline stage setup

### crm_fields_list

`GET /api/v1/crm-fields`. Scope: `crm_fields:read`. Member: `open`.

List the organization’s custom contact fields

### crm_fields_set

`PUT /api/v1/crm-fields`. Scope: `crm_fields:write`. Member: `deny`. Confirm: required. Changes: `crm_fields`.

Replace the organization’s custom contact fields

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `fields` (body, array of CrmFieldInputV1Dto, required): Every field that stays on, in order. Each `field_name` once.
  - `field_name` (body, string, required): The key a contact’s `custom_fields` holds this field’s value under
  - `field_type` (body, string, required, one of `text`, `number`, `enum`, `boolean`, `date`, `datetime`, `email`, `phone`, `currency`, `url`, `multi_select_enum`, `long_text`)
  - `field_label` (body, string, required): The name people see
  - `description` (body, string): What the field holds. Phone agents read it. Empty when left out.
  - `is_required` (body, boolean, required): Whether phone agents must collect it
  - `enum_options` (body, array of CrmFieldOptionV1Dto, required): The choices of an `enum` or `multi_select_enum` field, in order. `[]` for any other type.
    - `value` (body, string, required): The stored value. On the stage field it is the stage id.
    - `label` (body, string, required): The name people see
  - `sync_to_calendar` (body, boolean, required): Whether a `date` or `datetime` value goes on the calendar

### crm_fields_set_stage_config

`PUT /api/v1/crm-fields/stage-config`. Scope: `crm_fields:write`. Member: `deny`. Changes: `crm_fields`.

Set the pipeline stage field and the stages a call outcome moves a contact to

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `stage_field` (body, string, required): The `field_name` of an enum field that is on. null turns the pipeline off and clears both stage ids.
- `booking_stage_id` (body, string): One of the stage field’s option values, or null. Left out, it is cleared.
- `no_booking_stage_id` (body, string): One of the stage field’s option values, or null. Left out, it is cleared.

## Forms

### forms_add_field

`POST /api/v1/forms/{formId}/fields`. Scope: `forms:write`. Member: `deny`. Changes: `forms`.

Add a field to a form

- `formId` (path, string uuid, required)
- `type` (body, string, required, one of `text`, `email`, `phone`, `select`, `checkbox`, `hidden`)
- `key` (body, string, required): The key of this answer in a submission `payload`: lowercase letters, digits and single underscores, starting with a letter. Unique on the form.
- `label` (body, string, required)
- `placeholder` (body, string)
- `required` (body, boolean): A `hidden` field cannot be required.
- `options` (body, array of FormFieldOptionDto): The choices of a `select` field
  - `value` (body, string, required)
  - `label` (body, string, required)
- `contact_target` (body, string): Where the answer saves on the contact: `none`, `full_name`, `first_name`, `last_name`, `phone`, or `field:<CRM field key>`. Null: by key. An `email` field takes null.

### forms_create

`POST /api/v1/forms`. Scope: `forms:write`. Member: `deny`. Changes: `forms`. Idempotent: send `idempotency_key`.

Create a form

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required)
- `description` (body, string)
- `status` (body, string, one of `draft`, `published`, `archived`): Only a `published` form takes submissions.
- `location_id` (body, string uuid): An active location from `locations_list`. Its leads join that location and notify its managers. Null: all locations.
- `settings` (body, FormSettingsInputDto)
  - `target_sequence_id` (body, string uuid): Enroll every accepted submitter in this sequence of the organization. Null: none.
  - `captcha_enabled` (body, boolean): Whether a submission needs a passing captcha
  - `origin_allowlist` (body, array of string): The website origins whose browsers may submit the form, such as `https://example.com`. Other origins get a 403. Empty: server-to-server calls only.
  - `appearance` (body, FormEmbedAppearanceInputDto)
    - `style_mode` (body, string, one of `iris`, `site`)
    - `accent_color` (body, string): A #RRGGBB hex color. Null: the default.
    - `submit_label` (body, string)
    - `success_message` (body, string)

### forms_delete

`DELETE /api/v1/forms/{formId}`. Scope: `forms:write`. Member: `deny`. Confirm: required. Changes: `forms`.

Delete a form

- `formId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### forms_delete_field

`DELETE /api/v1/forms/{formId}/fields/{fieldId}`. Scope: `forms:write`. Member: `deny`. Confirm: required. Changes: `forms`.

Delete a field of a form

- `formId` (path, string uuid, required)
- `fieldId` (path, string uuid, required): A field `id` from `forms_get`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### forms_get

`GET /api/v1/forms/{formId}`. Scope: `forms:read`. Member: `open`.

Get one form with its fields

- `formId` (path, string uuid, required)

### forms_list

`GET /api/v1/forms`. Scope: `forms:read`. Member: `open`.

List the organization’s forms

### forms_list_submissions

`GET /api/v1/forms/{formId}/submissions`. Scope: `forms:read`. Member: `deny`.

List the submissions of a form

- `formId` (path, string uuid, required)
- `page` (query, number): 1-based page number. (page - 1) * limit must be at most 2147483647.
- `limit` (query, number): Page size (capped at 100)
- `status` (query, string, one of `accepted`, `spam`)
- `from` (query, string): ISO 8601 datetime with a time part. Only submissions at or after it.
- `to` (query, string): ISO 8601 datetime with a time part. Only submissions at or before it. At most 366 days after `from`.
- `search` (query, string): Case-insensitive match on part of the contact's email or the submitted email. At most 320 characters.

### forms_reorder_fields

`PUT /api/v1/forms/{formId}/fields/reorder`. Scope: `forms:write`. Member: `deny`. Changes: `forms`.

Reorder the fields of a form

- `formId` (path, string uuid, required)
- `field_ids` (body, array of string uuid, required): Every field id of the form, each once, in the new order

### forms_rotate_submission_key

`POST /api/v1/forms/{formId}/submission-key/rotate`. Scope: `forms:write`. Member: `deny`. Confirm: required. Changes: `forms`.

Rotate a form’s submission key

- `formId` (path, string uuid, required)

### forms_update

`PATCH /api/v1/forms/{formId}`. Scope: `forms:write`. Member: `deny`. Changes: `forms`.

Change a form

- `formId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `description` (body, string)
- `status` (body, string, one of `draft`, `published`, `archived`): Only a `published` form takes submissions.
- `location_id` (body, string uuid): An active location from `locations_list`. Null: all locations.
- `settings` (body, FormSettingsInputDto)
  - `target_sequence_id` (body, string uuid): Enroll every accepted submitter in this sequence of the organization. Null: none.
  - `captcha_enabled` (body, boolean): Whether a submission needs a passing captcha
  - `origin_allowlist` (body, array of string): The website origins whose browsers may submit the form, such as `https://example.com`. Other origins get a 403. Empty: server-to-server calls only.
  - `appearance` (body, FormEmbedAppearanceInputDto)
    - `style_mode` (body, string, one of `iris`, `site`)
    - `accent_color` (body, string): A #RRGGBB hex color. Null: the default.
    - `submit_label` (body, string)
    - `success_message` (body, string)

### forms_update_field

`PATCH /api/v1/forms/{formId}/fields/{fieldId}`. Scope: `forms:write`. Member: `deny`. Changes: `forms`.

Change a field of a form

- `formId` (path, string uuid, required)
- `fieldId` (path, string uuid, required): A field `id` from `forms_get`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `type` (body, string, one of `text`, `email`, `phone`, `select`, `checkbox`, `hidden`)
- `key` (body, string): The key of this answer in a submission `payload`: lowercase letters, digits and single underscores, starting with a letter. Unique on the form.
- `label` (body, string)
- `placeholder` (body, string)
- `required` (body, boolean): A `hidden` field cannot be required.
- `options` (body, array of FormFieldOptionDto): The choices of a `select` field
  - `value` (body, string, required)
  - `label` (body, string, required)
- `contact_target` (body, string): Where the answer saves on the contact: `none`, `full_name`, `first_name`, `last_name`, `phone`, or `field:<CRM field key>`. Null: by key. An `email` field takes null.

## Invitations

### invitations_create

`POST /api/v1/invitations`. Scope: `invitations:write`. Member: `deny`. Confirm: required. Changes: `invitations`. Idempotent: send `idempotency_key`.

Invite a person to the organization by email

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `email` (body, string, required): The email to invite. Stored in lower case.
- `role` (body, string, one of `ADMIN`, `MEMBER`): Nobody is invited above ADMIN.

### invitations_list

`GET /api/v1/invitations`. Scope: `invitations:read`. Member: `deny`.

List the organization’s invitations

### invitations_revoke

`DELETE /api/v1/invitations/{invitationId}`. Scope: `invitations:write`. Member: `deny`. Confirm: required. Changes: `invitations`.

Revoke an invitation

- `invitationId` (path, string uuid, required)

## Locations

### locations_activate

`POST /api/v1/locations/{locationId}/activate`. Scope: `locations:write`. Member: `deny`. Confirm: required. Changes: `locations`. Idempotent: send `idempotency_key`.

Activate a location, which adds it to the subscription

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key returns the first answer and does not run the call again.

### locations_booking_options

`GET /api/v1/locations/{locationId}/booking-options`. Scope: `appointments:read`. Member: `scoped`.

List the services and team members a location books

- `locationId` (path, string uuid, required)

### locations_create

`POST /api/v1/locations`. Scope: `locations:write`. Member: `deny`. Changes: `locations`. Idempotent: send `idempotency_key`.

Create an inactive location draft

- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key returns the first answer and does not run the call again.
- `name` (body, string, required)
- `timezone` (body, string, required): IANA timezone

### locations_deactivate

`POST /api/v1/locations/{locationId}/deactivate`. Scope: `locations:write`. Member: `deny`. Confirm: required. Changes: `locations`. Idempotent: send `idempotency_key`.

Deactivate a location, which removes it from the subscription

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key returns the first answer and does not run the call again.

### locations_delete

`DELETE /api/v1/locations/{locationId}`. Scope: `locations:write`. Member: `deny`. Confirm: required. Changes: `locations`.

Delete an unused location draft

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### locations_get

`GET /api/v1/locations/{locationId}`. Scope: `locations:read`. Member: `deny`.

Read one location, a draft included

- `locationId` (path, string uuid, required)

### locations_list

`GET /api/v1/locations`. Scope: `appointments:read`. Member: `scoped`.

List the locations appointments can be booked at

### locations_set_default

`PUT /api/v1/locations/{locationId}/default`. Scope: `locations:write`. Member: `deny`. Changes: `locations`.

Make an active location the organization’s default

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

## MCP

### mcp_request

`POST /api/v1/mcp`. Scope: any live key. Member: `open`.

Send one MCP JSON-RPC message

## Me

### me_get

`GET /api/v1/me`. Scope: any live key. Member: `open`.

Describe the calling API key or connected client, the role it acts at and the locations it reaches

## Members

### members_get

`GET /api/v1/members/{membershipId}`. Scope: `members:read`. Member: `open`.

Get one member

- `membershipId` (path, string uuid, required)

### members_list

`GET /api/v1/members`. Scope: `members:read`. Member: `open`.

List the organization’s members

### members_remove

`DELETE /api/v1/members/{membershipId}`. Scope: `members:write`. Member: `deny`. Confirm: required. Changes: `members`.

Remove a member from the organization

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### members_set_access_level

`PUT /api/v1/members/{membershipId}/access-level`. Scope: `members:write`. Member: `deny`. Manager power: `access_levels`. Changes: `members`.

Set a member’s record level

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `access_level` (body, string, required, one of `whole_location`, `own_records`)

### members_set_locations

`PUT /api/v1/members/{membershipId}/locations`. Scope: `members:write`. Member: `deny`. Changes: `members`.

Set a manager’s or member’s locations

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required): The whole set, replacing the current one. Each id is a location of this organization. [] removes all.

### members_set_manager_powers

`PUT /api/v1/members/{membershipId}/manager-powers`. Scope: `members:write`. Member: `deny`. Changes: `members`.

Set a manager’s powers

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `manager_powers` (body, array of string, required, one of `contacts`, `location_settings`, `sequences`, `staff`, `leader_schedules`, `appointments`, `access_levels`): The whole set, replacing the current one.

### members_set_sms_send

`PUT /api/v1/members/{membershipId}/sms-send`. Scope: `members:write`. Member: `deny`. Manager power: `access_levels`. Confirm: required. Changes: `members`.

Let a member text their clients, or stop it

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `sms_send_enabled` (body, boolean, required): True lets a MEMBER text their own consented clients. False stops it.

### members_update_agent_access

`PATCH /api/v1/members/{membershipId}/agent-access`. Scope: `members:write`. Member: `deny`. Manager power: `staff`. Changes: `members`.

Switch a member’s agent access off or on

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `agent_access_enabled` (body, boolean, required): False switches off the person’s personal keys and agent connections. Nothing is revoked.

### members_update_role

`PATCH /api/v1/members/{membershipId}/role`. Scope: `members:write`. Member: `deny`. Confirm: required. Changes: `members`.

Change a member’s role

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `role` (body, string, required, one of `ADMIN`, `MANAGER`, `MEMBER`): An owner is made only by an ownership transfer in the dashboard.

### members_update_status

`PATCH /api/v1/members/{membershipId}/status`. Scope: `members:write`. Member: `deny`. Confirm: required. Changes: `members`.

Activate or deactivate a member

- `membershipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `status` (body, string, required, one of `ACTIVE`, `DEACTIVATED`)

## Organization

### organization_get

`GET /api/v1/organization`. Scope: `organization:read`. Member: `open`.

Read the organization’s settings

### organization_set_agent_access

`PUT /api/v1/organization/agent-access`. Scope: `organization:write`. Member: `deny`. Confirm: required. Changes: `organization`.

Turn agent access off or on for admins, managers or members

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `disabled_roles` (body, array of string, required, one of `ADMIN`, `MANAGER`, `MEMBER`): The roles whose agent access is off: their personal keys and agent connections answer 401, and their Assistant is off. An OWNER is never switched off.

### organization_update

`PATCH /api/v1/organization`. Scope: `organization:write`. Member: `deny`. Changes: `organization`.

Change the organization’s industry, website or timezone

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `industry` (body, string)
- `website_url` (body, string): An http or https URL. An empty string clears it.
- `timezone` (body, string): IANA timezone, such as America/Chicago

## Sequences

### contacts_list_enrollments

`GET /api/v1/contacts/{contactId}/enrollments`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

List one contact’s enrollments across every sequence

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### sequences_activate

`POST /api/v1/sequences/{sequenceId}/activate`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Turn a sequence on

- `sequenceId` (path, string uuid, required)

### sequences_analytics

`GET /api/v1/sequences/{sequenceId}/analytics`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

Get the send totals of a sequence

- `sequenceId` (path, string uuid, required)

### sequences_cancel_enrollment

`POST /api/v1/sequences/{sequenceId}/enrollments/{enrollmentId}/cancel`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Remove a contact from a sequence

- `sequenceId` (path, string uuid, required)
- `enrollmentId` (path, string uuid, required)

### sequences_cancel_schedule_run

`POST /api/v1/sequences/{sequenceId}/schedule/runs/{runId}/cancel`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Cancel one run of a broadcast

- `sequenceId` (path, string uuid, required)
- `runId` (path, string uuid, required)

### sequences_capabilities

`GET /api/v1/sequences/capabilities`. Scope: `sequences:read`. Member: `open`.

What sequence authoring this server allows

### sequences_create

`POST /api/v1/sequences`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`. Idempotent: send `idempotency_key`.

Create a draft sequence

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required)
- `description` (body, string)
- `trigger_type` (body, string, required): The primary trigger, a `key` from `sequences_list_triggers`
- `trigger_config` (body, object): Settings of the primary trigger
- `triggers` (body, array of SequenceTriggerInputDto): Every trigger. The first is the primary one and must match `trigger_type` when both are sent.
  - `type` (body, string, required): A trigger `key` from `sequences_list_triggers` whose `authorable` is true
  - `config` (body, object): Trigger settings
- `kind` (body, string, one of `automation`, `broadcast`): `automation` runs off a trigger. `broadcast` sends to an audience.
- `audience_id` (body, string uuid): For a broadcast: its audience. An automation stores none. An audience of another organization answers 404.
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
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
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

### sequences_delete

`DELETE /api/v1/sequences/{sequenceId}`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Delete a sequence

- `sequenceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### sequences_duplicate

`POST /api/v1/sequences/{sequenceId}/duplicate`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`. Idempotent: send `idempotency_key`.

Copy a sequence into a new draft

- `sequenceId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### sequences_enroll

`POST /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

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

### sequences_get_schedule

`GET /api/v1/sequences/{sequenceId}/schedule`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`.

Get a broadcast's send schedule and its runs

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

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

### sequences_list_send_schedules

`GET /api/v1/sequences/send-schedules`. Scope: `sequences:read`. Member: `open`.

List the send windows a sequence can use

- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

### sequences_list_triggers

`GET /api/v1/sequences/triggers`. Scope: `sequences:read`. Member: `open`.

List the triggers a sequence can start on

### sequences_list_variables

`GET /api/v1/sequences/variables`. Scope: `sequences:read`. Member: `open`.

List the variables step copy may use

### sequences_pause

`POST /api/v1/sequences/{sequenceId}/pause`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`.

Pause a sequence

- `sequenceId` (path, string uuid, required)

### sequences_pause_schedule

`POST /api/v1/sequences/{sequenceId}/schedule/pause`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`.

Pause a broadcast's schedule

- `sequenceId` (path, string uuid, required)

### sequences_resume

`POST /api/v1/sequences/{sequenceId}/resume`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Resume a paused sequence

- `sequenceId` (path, string uuid, required)

### sequences_set_schedule

`PUT /api/v1/sequences/{sequenceId}/schedule`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Set when a broadcast sends

- `sequenceId` (path, string uuid, required)
- `schedule_kind` (body, string, required, one of `once`, `recurring`): `once` sends at `send_at`. `recurring` sends on `rrule`.
- `send_at` (body, string date-time): When a `once` schedule sends. Required for `once`. A real calendar date-time ending in `Z` or an offset such as `-05:00`, for example `2026-11-01T09:00:00Z`. At most 40 characters.
- `rrule` (body, string): An RFC 5545 rule such as `FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0`, read in `timezone`. Required for `recurring`. Only these parts, each at most once: `FREQ` (`DAILY`, `WEEKLY` or `MONTHLY`), `INTERVAL` (1 to 100), `BYDAY` (1 to 7 distinct weekdays `MO` to `SU`, no number; on `DAILY` only with `INTERVAL=1`), `BYMONTHDAY` (`MONTHLY` only, 1 to 31 distinct days from 1 to 31 or -31 to -1), `BYSETPOS` (`MONTHLY` only, `1` or `-1`), `BYHOUR` (one hour, 0 to 23) and `BYMINUTE` (one minute, 0 to 59). Any other part, such as `COUNT` or `UNTIL`, answers 400. End a series with `ends_on`.
- `timezone` (body, string): The IANA timezone `rrule` is read in
- `starts_on` (body, string date): The first day a recurring schedule may send (YYYY-MM-DD), from 2000-01-01 to 2100-12-31
- `ends_on` (body, string date): The last day a recurring schedule may send (YYYY-MM-DD), from 2000-01-01 to 2100-12-31 and not before `starts_on`
- `catchup_policy` (body, string, one of `skip`, `fire_once`): Sends a recurring schedule missed, for example while Iris was down: `skip` drops them, `fire_once` sends only the latest.
- `throttle_per_minute` (body, number): Stored for a planned limit on sends a minute, from 1 to 2147483647. Iris does not enforce it yet.

### sequences_start_schedule

`POST /api/v1/sequences/{sequenceId}/schedule/start`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Start a broadcast's schedule

- `sequenceId` (path, string uuid, required)

### sequences_test_step

`POST /api/v1/sequences/{sequenceId}/steps/{stepKey}/test`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: none. Idempotent: send `idempotency_key`.

Send a test of one step

- `sequenceId` (path, string uuid, required)
- `stepKey` (path, string, required): The `step_key` of the step, as `sequences_get` lists it. At most 128 characters.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `contact_id` (body, string uuid): Fill the step variables from this contact. The contact must belong to this organization.
- `to_email` (body, string email): The address that gets the email. Needed for an email step when `contact_id` is not sent.
- `to_phone` (body, string): The number that gets the text. Needed for an SMS step when `contact_id` is not sent.

### sequences_update

`PATCH /api/v1/sequences/{sequenceId}`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Change a sequence

- `sequenceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `description` (body, string)
- `trigger_type` (body, string): The primary trigger, a `key` from `sequences_list_triggers`
- `trigger_config` (body, object): Settings of the primary trigger
- `triggers` (body, array of SequenceTriggerInputDto): Every trigger. The first is the primary one and must match `trigger_type` when both are sent.
  - `type` (body, string, required): A trigger `key` from `sequences_list_triggers` whose `authorable` is true
  - `config` (body, object): Trigger settings
- `kind` (body, string, one of `automation`, `broadcast`): `automation` runs off a trigger. `broadcast` sends to an audience.
- `audience_id` (body, string uuid): For a broadcast: its audience. An automation stores none. An audience of another organization answers 404.
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
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
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

## Table views

### table_views_create

`POST /api/v1/table-views/{tableId}`. Scope: `table_views:write`. Member: `open`. Changes: `table_views`. Idempotent: send `idempotency_key`.

Save a new view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): Trimmed.
- `visibility` (body, string, one of `shared`, `private`)
- `state` (body, PublicTableStateDto, required)
  - `search` (body, string, required): The search box text. Empty for none.
  - `sorting` (body, array of object, required): Sort columns, first one first. `id` is a column id of the table. Empty for the default order.
  - `filters` (body, array of object, required): `between` takes a two-value list, and `last_days` and `not_last_days` a whole number of days from 1 to 36500.
  - `columnSizing` (body, object, required): Column widths in pixels, by column id.
  - `columnOrder` (body, array of string, required): Column ids in display order.
  - `columnVisibility` (body, object, required): false hides a column, by column id.
  - `pageSize` (body, integer, required)

### table_views_delete

`DELETE /api/v1/table-views/{tableId}/{viewId}`. Scope: `table_views:write`. Member: `open`. Confirm: required. Changes: `table_views`.

Delete a saved view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.
- `viewId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### table_views_get

`GET /api/v1/table-views/{tableId}/{viewId}`. Scope: `table_views:read`. Member: `open`.

Read one saved view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.
- `viewId` (path, string uuid, required)

### table_views_get_preferences

`GET /api/v1/table-views/{tableId}/preferences`. Scope: `table_views:read`. Member: `open`.

Read your own state and default view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.

### table_views_list

`GET /api/v1/table-views/{tableId}`. Scope: `table_views:read`. Member: `open`.

List the saved views of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.

### table_views_set_preferences

`PUT /api/v1/table-views/{tableId}/preferences`. Scope: `table_views:write`. Member: `open`. Changes: `table_views`.

Set your own state and default view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `state` (body, PublicTableStateDto, required): The whole state. Required.
  - `search` (body, string, required): The search box text. Empty for none.
  - `sorting` (body, array of object, required): Sort columns, first one first. `id` is a column id of the table. Empty for the default order.
  - `filters` (body, array of object, required): `between` takes a two-value list, and `last_days` and `not_last_days` a whole number of days from 1 to 36500.
  - `columnSizing` (body, object, required): Column widths in pixels, by column id.
  - `columnOrder` (body, array of string, required): Column ids in display order.
  - `columnVisibility` (body, object, required): false hides a column, by column id.
  - `pageSize` (body, integer, required)
- `default_view_id` (body, string uuid): A view of this table that you can see, from `table_views_list`. null or left out: no default view.

### table_views_update

`PATCH /api/v1/table-views/{tableId}/{viewId}`. Scope: `table_views:write`. Member: `open`. Changes: `table_views`.

Change a saved view of a dashboard table

- `tableId` (path, string, required): The dashboard table, such as `crm.contacts`.
- `viewId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string, required): Trimmed. Required on every update.
- `visibility` (body, string, one of `shared`, `private`): Left out, the view keeps its visibility.
- `state` (body, PublicTableStateDto, required): The whole state. Required on every update.
  - `search` (body, string, required): The search box text. Empty for none.
  - `sorting` (body, array of object, required): Sort columns, first one first. `id` is a column id of the table. Empty for the default order.
  - `filters` (body, array of object, required): `between` takes a two-value list, and `last_days` and `not_last_days` a whole number of days from 1 to 36500.
  - `columnSizing` (body, object, required): Column widths in pixels, by column id.
  - `columnOrder` (body, array of string, required): Column ids in display order.
  - `columnVisibility` (body, object, required): false hides a column, by column id.
  - `pageSize` (body, integer, required)

## Territories

### territories_list

`GET /api/v1/territories`. Scope: `appointments:read`. Member: `deny`.

List the service territories and their postal codes
