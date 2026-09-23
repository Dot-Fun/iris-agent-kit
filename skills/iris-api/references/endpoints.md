# Iris API endpoints

Generated from the Iris public OpenAPI document (Iris Public API 1.0.0) by
`scripts/contracts/agent-kit/generate.mts` in the Iris monorepo. Do not edit by hand.

Base URL: `https://api.iris.dotfun.co`. Send `Authorization: Bearer $IRIS_API_KEY` on every call.

## Contacts

### ContactsController_upsert

`POST /api/v1/contacts`. Scope: `contacts:write`.

Create or update a contact by email

- `name` (body, string, required): Contact full name
- `email` (body, string email, required): Contact email address — the upsert key, matched case-insensitively
- `phone` (body, string): Contact phone number. Stored in field_values; the contact itself stays email-keyed with phone_number NULL.
- `source` (body, string, required): Attribution source
- `fields` (body, object): Arbitrary key/value data merged into the contact's CRM field values. At most 200 keys.
- `cancel_events` (body, array of ContactCancelEventDto): Sequence events to CANCEL for this contact, unconditionally. Processed before `events`, and idempotent because a second call cancels nothing. Use it for a goal exit, such as ending a win-back nurture once the contact converts.
  - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
  - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.
- `events` (body, array of ContactEventDto): Sequence events to FIRE for this contact, after the cancellations. Each event in turn claims its `key`, cancels the enrollments named in its `supersedes`, then enrolls. An event with no subscribing sequence leaves its key unspent, so a later retry still enrolls.
  - `name` (body, string, required): Event name. Matched as free text against the `event_name` of every active `event` sequence in the organization.
  - `key` (body, string, required): Caller-owned idempotency key for this event. Stable for "the same logical event", so a redelivery is a no-op. Surrounding whitespace is trimmed.
  - `supersedes` (body, array of ContactCancelEventDto): Events whose running enrollments this one REPLACES. Cancelled after this event claims its `key` and before it enrolls, so a redelivery with the same `key` cancels nothing and enrolls nothing. Use this for mutually exclusive states of one subject; use the top-level `cancel_events` for an unconditional exit.
    - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
    - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.

## PublicSequences

### PublicSequencesController_listContactEnrollments

`GET /api/v1/contacts/{contactId}/enrollments`. Scope: `sequences:read`.

List one contact’s enrollments across every sequence

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### PublicSequencesController_listEnrollments

`GET /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:read`.

List the contacts enrolled in one sequence

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `status` (query, string, one of `active`, `completed`, `cancelled`, `failed`): Only enrollments with this status
- `contact_id` (query, string uuid): Only this contact's enrollments in the sequence
- `email` (query, string): Only the enrollments of the contact with this email, in the key’s organization. Matched without regard to case. Takes precedence over `contact_id`. An email no contact carries returns an empty page, not a 404. When more than one contact carries the email, the one that owns it as its identity is used.

### PublicSequencesController_listSequences

`GET /api/v1/sequences`. Scope: `sequences:read`.

List the organization’s sequences
