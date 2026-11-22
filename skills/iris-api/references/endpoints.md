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

### agents_create_subagent

`POST /api/v1/agents/subagents`. Scope: `agents:write`. Member: `deny`. Changes: `agents`. Idempotent: send `idempotency_key`.

Add a subagent that the orchestrator transfers calls to

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `agent_name` (body, string, required): The name the dashboard shows
- `agent_role` (body, string, required): What the subagent handles, such as sales, billing or support
- `transfer_condition` (body, string, required): When the orchestrator transfers a call to this subagent
- `parent_agent_id` (body, string uuid, required): The orchestrator, from `agents_list`
- `evaluation_criteria` (body, array of object): How the subagent’s calls are scored
- `data_collection` (body, object): What the subagent collects on a call
- `dynamic_variables` (body, object): Values the transfer passes to the subagent

### agents_delete

`DELETE /api/v1/agents/{agentId}`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Delete a subagent

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

### agents_go_live_all

`POST /api/v1/agents/go-live-all`. Scope: `agents:write`. Member: `deny`. Confirm: required. Changes: `agents`.

Publish the draft of every phone agent, so callers hear them

### agents_list

`GET /api/v1/agents`. Scope: `agents:read`. Member: `open`.

List the organization’s phone agents

### agents_list_versions

`GET /api/v1/agents/{agentId}/versions`. Scope: `agents:read`. Member: `open`.

List the versions an agent has published

- `agentId` (path, string uuid, required)
- `limit` (query, number)
- `offset` (query, number)

### agents_retry_provisioning

`POST /api/v1/agents/{agentId}/retry`. Scope: `agents:write`. Member: `deny`. Changes: `agents`.

Build a failed subagent’s voice agent again

- `agentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

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
- `prompt_template` (body, string): The prompt, with its placeholders. For a write that changes the template, Iris adds the line `<!-- iris-prompt-template: v2 -->` first when a non-empty template does not start with it.
- `custom_notes` (body, string)
- `agent_instructions` (body, string)
- `transfer_condition` (body, string)
- `agent_tone_option_id` (body, string uuid)

## Allowances

### allowances_get

`GET /api/v1/payments/allowances/{id}`. Scope: `allowances:read`. Member: `scoped`.

Get an allowance grant; funded_minor appears only for financial readers (OWNER, ADMIN, or MANAGER with billing); no dedupe_key is returned

- `id` (path, string uuid, required)

### allowances_get_balance

`GET /api/v1/payments/allowances/balance`. Scope: `allowances:read`. Member: `scoped`.

Get an allowance balance; funded_minor appears on grants only for financial readers (OWNER, ADMIN, or MANAGER with billing); no dedupe_key is returned

- `contact_id` (query, string uuid)
- `group_id` (query, string uuid)

### allowances_grant

`POST /api/v1/payments/allowances`. Scope: `allowances:write`. Member: `action`. Action (`x-iris-action`): `allowances.grant`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Grant allowance units

- `idempotency_key` (body, string, required): Your own key for this grant. A retry with the same key grants nothing more. The same key with another plan, owner or payment is a 409.
- `plan_id` (body, string, required)
- `owner_contact_id` (body, string)
- `owner_group_id` (body, string)
- `origin` (body, string, required, one of `manual`, `complimentary`, `credit_terms`, `paid`)
- `reason` (body, string)
- `payment_id` (body, string)
- `valid_from` (body, string)
- `expires_at` (body, string)

### allowances_list

`GET /api/v1/payments/allowances`. Scope: `allowances:read`. Member: `scoped`.

List allowance grants; funded_minor appears only for financial readers (OWNER, ADMIN, or MANAGER with billing); no dedupe_key is returned

### allowances_list_entries

`GET /api/v1/payments/allowances/{id}/entries`. Scope: `allowances:read`. Member: `scoped`.

Page allowance ledger entries by cursor; entries never include dedupe_key

- `id` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### allowances_record_usage

`POST /api/v1/payments/allowances/{id}/uses`. Scope: `allowances:write`. Member: `action`. Action (`x-iris-action`): `allowances.record_usage`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Use grant units for work done on a work record or task with no appointment; refused beyond available units; keyed for safe retries

- `id` (path, string uuid, required)
- `recipient_contact_id` (body, string uuid, required)
- `quantity` (body, integer, required)
- `source_kind` (body, string, required, one of `work_record`, `task`)
- `source_id` (body, string uuid, required)
- `reason` (body, string)
- `idempotency_key` (body, string, required): Your key for this use is scoped to the calling credential, API key or OAuth connection. Repeating it with the same grant, recipient, quantity, source and reason returns the first entry with status exists. Changing any of them, including the reason, returns 409 idempotency_conflict.

### allowances_transfer

`POST /api/v1/allowances/{id}/transfer`. Scope: `allowances:write`. Member: `action`. Action (`x-iris-action`): `allowances.transfer`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Transfer available units to one contact or group when sold terms allow it; preserve expiry and purchase history; create no money row. Pending subscription units return 409 allowance_subscription_pending

- `id` (path, string uuid, required)
- `quantity` (body, integer, required)
- `to_contact_id` (body, string uuid): Send exactly one of to_contact_id and to_group_id.
- `to_group_id` (body, string uuid): A contact group. Send exactly one destination.
- `reason` (body, string)
- `idempotency_key` (body, string, required): Your key for this transfer, scoped to the calling API key or OAuth connection. The same source, destination, quantity and reason return the first grant. Changed details return 409 idempotency_conflict.

## Appointments

### appointment_series_end

`POST /api/v1/appointment-series/{seriesId}/end`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.edit`. Changes: `appointments`.

End a live or ended appointment series

- `seriesId` (path, string uuid, required)
- `ends_at` (body, string date-time, required)

### appointment_series_get

`GET /api/v1/appointment-series/{seriesId}`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

Get one live or ended appointment series

- `seriesId` (path, string uuid, required)

### appointment_series_list

`GET /api/v1/appointment-series/{seriesId}/occurrences`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

List live or ended appointment series occurrences

- `seriesId` (path, string uuid, required)
- `from` (query, string date-time)
- `to` (query, string date-time)

### appointment_series_replace

`PUT /api/v1/appointment-series/{seriesId}`. Scope: `appointments:write`. Member: `scoped`. Action (`x-iris-action`): `appointment.edit`. Changes: `appointments`.

Replace a live or ended appointment series

- `seriesId` (path, string uuid, required)
- `recurrence_series_id` (body, string uuid): Optional live series id; the path source id is stable.
- `rule` (body, string, required): RFC 5545 RRULE. Null returns the source to a single appointment.
- `timezone` (body, string): IANA time zone. Defaults to the current series time zone.
- `dtstart` (body, string date-time): The first occurrence start.
- `duration` (body, string): PostgreSQL interval, for example `30 minutes`.
- `ends_at` (body, string date-time)
- `status` (body, string, one of `active`, `ended`)
- `team_member_id` (body, string uuid)
- `resources` (body, array of AppointmentSeriesResourceDto)
  - `resource_kind` (body, string, required, one of `staff`, `asset`, `location`)
  - `resource_id` (body, string uuid, required)

### appointments_availability

`GET /api/v1/appointments/availability`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

Find open slots at a location on one day

- `staff_preference` (query, string, one of `none`, `preferred`, `only`): Named person policy. A busy preferred person is never replaced during booking.
- `team_group_id` (query, string uuid): A bookable team group for this offering
- `location_id` (query, string uuid, required): A location from `locations_list`
- `date` (query, string, required): The day, in the location’s time zone
- `offering_id` (query, string uuid): Only slots for this service, at its length
- `team_member_id` (query, string uuid): Only slots this team member is free for
- `add_ons` (query, array of string uuid): Add-on ids from locations_booking_options. Their extra minutes extend each slot.
- `postal_code` (query, string): The customer’s postal code for a home visit. Only people who cover it.
- `country_code` (query, string): ISO 3166-1 alpha-2 country of `postal_code`
- `duration_minutes` (query, number): Ignored when `offering_id` is sent

### appointments_cancel

`POST /api/v1/appointments/{appointmentId}/cancel`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.cancel`. Confirm: required. Changes: `appointments`.

Cancel an appointment

- `appointmentId` (path, string uuid, required)
- `cancelled_by_kind` (body, string, one of `customer`, `business`)

### appointments_create

`POST /api/v1/appointments`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.book`. Changes: `appointments`. Idempotent: send `idempotency_key`.

Book an appointment for a contact

- `staff_preference` (body, string, one of `none`, `preferred`, `only`): Named person policy. A busy preferred person is never replaced during booking.
- `team_group_id` (body, string uuid): A bookable team group for this offering
- `add_ons` (body, array of string uuid): Add-on ids from locations_booking_options.
- `recurrence` (body, string): An RFC 5545 RRULE for the existing recurrence series. Omit for a single appointment.
- `hold_id` (body, string uuid): Confirm this hold instead of reserving another slot. The location, times, contact and any supplied staff or service must match the hold.
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
- `idempotency_key` (body, string, required): Your own key for this booking. A retry with the same key and the same details returns the first booking until its start passes, then answers 409 `start_in_past`. The same key with other details is a 409.

### appointments_detach_occurrence

`POST /api/v1/appointments/{appointmentId}/occurrences/{occurrenceStart}/detach`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.edit`. Changes: `appointments`.

Detach one occurrence from an appointment series

- `appointmentId` (path, string uuid, required)
- `occurrenceStart` (path, string date-time, required): The occurrence start in ISO 8601 format

### appointments_get

`GET /api/v1/appointments/{appointmentId}`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.view`.

Get one appointment, including detached booking lines

- `appointmentId` (path, string uuid, required)

### appointments_get_self_service_link

`POST /api/v1/appointments/{appointmentId}/self-service-link`. Scope: `appointments:write`. Member: `deny`. Changes: `appointments`.

Get the self-service link of an appointment

- `appointmentId` (path, string uuid, required)

### appointments_keep_conflicted

`POST /api/v1/appointments/{appointmentId}/keep`. Scope: `appointments:write`. Member: `deny`. Manager power: `staff`. Changes: `appointments`.

Keep a conflicted appointment as it is

- `appointmentId` (path, string uuid, required)
- `cause_keys` (body, array of string, required): The cause `key`s from `appointments_list_conflicted`. A key that is no longer a cause is ignored.

### appointments_list

`GET /api/v1/appointments`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

List appointments in a time window

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `contact_id` (query, string uuid): Only this contact’s appointments: bookings made for the contact, and bookings whose attendee phone or email is the contact’s.
- `from` (query, string date-time): Start of the window. Defaults to now.
- `to` (query, string date-time): End of the window. Defaults to 30 days after `from`. At most 92 days after it.

### appointments_list_conflicted

`GET /api/v1/appointments/conflicted`. Scope: `appointments:read`. Member: `deny`. Manager power: `staff`.

List appointments whose team member cannot do them

- `location_id` (query, string uuid, required): The location to check, from `locations_list`

### appointments_record_minutes

`POST /api/v1/appointments/{appointmentId}/record-minutes`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Record actual minutes on a completed appointment

- `appointmentId` (path, string uuid, required)
- `minutes` (body, number, required)
- `expected_revision` (body, string date-time, required)

### appointments_reschedule

`POST /api/v1/appointments/{appointmentId}/reschedule`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.reschedule`. Changes: `appointments`.

Move an appointment to a new time

- `appointmentId` (path, string uuid, required)
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required)
- `hold_id` (body, string uuid): Confirm a hold for this appointment and target time. Omit to create and confirm one atomically.

### appointments_reset_self_service_link

`POST /api/v1/appointments/{appointmentId}/self-service-link/reset`. Scope: `appointments:write`. Member: `deny`. Confirm: required. Changes: `appointments`.

Reset the self-service link of an appointment

- `appointmentId` (path, string uuid, required)

### appointments_transition

`POST /api/v1/appointments/{appointmentId}/transition`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Start, complete, mark no-show, cancel or reopen an appointment

- `appointmentId` (path, string uuid, required)
- `cancelled_by_kind` (body, string, one of `customer`, `business`)
- `to_state` (body, string, required, one of `in_progress`, `completed`, `no_show`, `cancelled`, `confirmed`)
- `reason` (body, string): Required when reopening a terminal appointment.
- `actual_minutes` (body, number)
- `expected_revision` (body, string date-time, required): The updated_at revision read by the caller.

### appointments_update

`PATCH /api/v1/appointments/{appointmentId}`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.edit`. Changes: `appointments`.

Change an appointment’s title, notes or attendee details

- `appointmentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `title` (body, string)
- `description` (body, string): Notes on the appointment. `null` clears them.
- `attendee_name` (body, string)
- `attendee_phone` (body, string): E.164, e.g. +14155550100
- `attendee_email` (body, string)
- `attendee_notes` (body, string): Notes about the attendee

### appointments_update_details

`PATCH /api/v1/appointments/{appointmentId}/details`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Change an appointment’s status, place, time zone, all-day flag or repeat rule

- `appointmentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location` (body, string): The free-text place. `null` clears it.
- `all_day` (body, boolean)
- `status` (body, string, one of `confirmed`, `completed`, `no_show`): `completed` and `no_show` can start the matching follow-up sequences.
- `reason` (body, string): Why a completed, cancelled or no-show appointment is set back to `confirmed`. Required for that set-back; the lifecycle records it with the reopen.
- `timezone` (body, string): IANA time zone, e.g. America/Denver. The start and end do not move.
- `recurrence_rule` (body, string): An RFC 5545 RRULE, e.g. FREQ=WEEKLY;COUNT=4. `null` stops the repeat.

### holds_confirm

`POST /api/v1/holds/{holdId}/confirm`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.book`. Confirm: required. Changes: `appointments`.

Confirm a live hold and return the appointment id

- `holdId` (path, string uuid, required)

### holds_create

`POST /api/v1/holds`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.book`. Changes: `appointments`. Idempotent: send `idempotency_key`.

Reserve a time and resources until the hold expires

- `recurrence` (body, string): An RFC 5545 RRULE for a series. Use the same recurrence when confirming through appointments_create.
- `staff_preference` (body, string, one of `none`, `preferred`, `only`): Use team_member_id for the named person. A disabled staff choice treats preferred as none and refuses only.
- `location_id` (body, string uuid, required): The active location to reserve.
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required): After start_time. Matches the service duration when a service is selected.
- `offering_id` (body, string uuid): The service to reserve at this location.
- `team_member_id` (body, string uuid): Reserve this person. Without it, the resolver selects available staff.
- `team_id` (body, string uuid): Limit staff selection to this bookable team at the location.
- `contact_id` (body, string uuid): The customer, when known.
- `title` (body, string): The appointment title if this hold is confirmed.
- `idempotency_key` (body, string): Retry with the same key to read the first hold. A replay does not extend its expiry. Keys are shared across the organization, voice, SMS and all API keys or OAuth grants. Each new hold, including one after expiry or release, needs a new, unique key.

### holds_get

`GET /api/v1/holds/{holdId}`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

Read a booking hold, its expiry and reserved resources

- `holdId` (path, string uuid, required)

### holds_release

`POST /api/v1/holds/{holdId}/release`. Scope: `appointments:write`. Member: `action`. Action (`x-iris-action`): `appointment.book`. Changes: `appointments`.

Release a booking hold and free its reserved resources

- `holdId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `reason` (body, string, one of `abandoned`, `superseded`, `cancelled`, `slot_lost`)

## Approvals

### approvals_create

`POST /api/v1/approvals`. Scope: `approvals:write`. Member: `action`. Action (`x-iris-action`): `approvals.file`. Changes: `approvals`. Idempotent: send `idempotency_key`.

File an approval request for an action this credential needs

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `kind` (body, string, required)
- `action_key` (body, string, required)
- `records` (body, array of object, required)
- `params` (body, object, required)
- `reason` (body, string, required)

### approvals_get

`GET /api/v1/approvals/{approvalId}`. Scope: `approvals:read`. Member: `scoped`.

Read one approval request visible to this credential

- `approvalId` (path, string uuid, required)

### approvals_list

`GET /api/v1/approvals`. Scope: `approvals:read`. Member: `scoped`.

List approval requests visible to this credential

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### approvals_withdraw

`POST /api/v1/approvals/{approvalId}/withdraw`. Scope: `approvals:write`. Member: `action`. Action (`x-iris-action`): `approvals.withdraw`. Changes: `approvals`.

Withdraw an approval request created by this credential

- `approvalId` (path, string uuid, required)

## Assistant

### assistant_delete_note

`DELETE /api/v1/assistant/note`. Scope: `assistant:write`. Member: `open`. Confirm: required. Changes: `assistant`.

Delete your private Assistant note

## Audiences

### audiences_add_member

`POST /api/v1/audiences/{audienceId}/members`. Scope: `audiences:write`. Member: `action`. Action (`x-iris-action`): `audiences.manage`. Changes: `audiences`.

Add a contact to a static audience

- `audienceId` (path, string uuid, required)
- `contact_id` (body, string uuid, required)

### audiences_archive

`POST /api/v1/audiences/{audienceId}/archive`. Scope: `audiences:write`. Member: `action`. Action (`x-iris-action`): `audiences.manage`. Changes: `audiences`.

Archive an audience

- `audienceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### audiences_count

`GET /api/v1/audiences/{audienceId}/count`. Scope: `audiences:read`. Member: `action`. Action (`x-iris-action`): `audiences.view`.

Count the contacts in a saved audience

- `audienceId` (path, string uuid, required)

### audiences_create

`POST /api/v1/audiences`. Scope: `audiences:write`. Member: `action`. Action (`x-iris-action`): `audiences.manage`. Changes: `audiences`. Idempotent: send `idempotency_key`.

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

### audiences_delete

`DELETE /api/v1/audiences/{audienceId}`. Scope: `audiences:write`. Member: `deny`. Confirm: required. Changes: `audiences`.

Delete an audience

- `audienceId` (path, string uuid, required)

### audiences_get

`GET /api/v1/audiences/{audienceId}`. Scope: `audiences:read`. Member: `action`. Action (`x-iris-action`): `audiences.view`.

Read one audience with its definition

- `audienceId` (path, string uuid, required)

### audiences_list

`GET /api/v1/audiences`. Scope: `audiences:read`. Member: `action`. Action (`x-iris-action`): `audiences.view`.

List the organization’s audiences

### audiences_list_members

`GET /api/v1/audiences/{audienceId}/contacts`. Scope: `audiences:read`. Member: `action`. Action (`x-iris-action`): `audiences.manage`.

List the contacts in an audience

- `audienceId` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### audiences_preview_count

`POST /api/v1/audiences/preview-count`. Scope: `audiences:read`. Member: `action`. Action (`x-iris-action`): `audiences.view`. Changes: none.

Count the contacts a draft definition matches

- `match` (body, string, one of `all`, `any`): `all`: a contact must meet every rule (AND). `any`: one rule is enough (OR).
- `rules` (body, array of AudienceFilterRuleDto): At most 50 rules, in one flat list: a rule holds no other rules. No rules, or an empty list, means every contact of the organization.
  - `field` (body, string, required): The contact field the rule tests. Either a contact column: `display_name`, `email`, `phone_number` (text); `total_calls` (number); `first_seen_at`, `last_seen_at`, `created_at`, `updated_at` (dates, compared as ISO 8601 strings). Or `field_values.<key>`, which reads a CRM custom field of this organization: `<key>` is the name of an enabled custom field (letters, digits and underscore only). A custom field of type number or currency compares as a number, date or datetime as an ISO 8601 string, boolean as true or false, and any other type as text. To filter by pipeline stage, use the `audience_field` that `contacts_list_stages` answers, with stage ids as values. Any other field makes `audiences_preview_count`, and `audiences_count` and `audiences_list_members` on a dynamic audience, answer 400. Create and update check only its format, at most 200 characters.
  - `op` (body, string, required, one of `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`, `lte`, `contains`, `contains_any`, `exists`, `not_exists`): `eq`, `neq`: equal or not equal. `in`, `not_in`: equal to one of a list, or to none of it. `gt`, `gte`, `lt`, `lte`: greater or less than; only on number and date fields (`total_calls`, the four date columns, and custom fields of type number, currency, date or datetime). `contains`: the text holds the value, ignoring case. `contains_any`: the text holds any value of the list. Both work on the text columns and on custom fields, not on `total_calls` or dates. `exists`, `not_exists`: the field has a value, or has none. `eq`, `neq`, `in`, `not_in`, `exists` and `not_exists` work on every field.
  - `value` (body, object): What the field is compared with. Leave it out for `exists` and `not_exists`. `in`, `not_in` and `contains_any` take a non-empty array of at most 500 strings, numbers or booleans. Every other op takes one string, number or boolean. A number field needs a number (or a numeric string). A string is at most 1000 characters. An object, or an array inside the array, answers 400.
- `exclude_opted_out` (body, boolean): Stored with the audience. Counts and contact lists do not apply it: opted-out contacts are removed when a message is sent.

### audiences_remove_member

`DELETE /api/v1/audiences/{audienceId}/members/{contactId}`. Scope: `audiences:write`. Member: `action`. Action (`x-iris-action`): `audiences.manage`. Confirm: required. Changes: `audiences`.

Remove a contact from a static audience

- `audienceId` (path, string uuid, required)
- `contactId` (path, string uuid, required)

### audiences_update

`PATCH /api/v1/audiences/{audienceId}`. Scope: `audiences:write`. Member: `action`. Action (`x-iris-action`): `audiences.manage`. Changes: `audiences`.

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

## Billing

### billing_get_subscription

`GET /api/v1/billing/subscription`. Scope: `billing:read`. Member: `open`.

Read the organization’s subscription: its plan, status and renewal date

### billing_list_plans

`GET /api/v1/billing/plans`. Scope: `billing:read`. Member: `open`.

List the plans the subscription can switch to, with their prices

### billing_reactivate

`POST /api/v1/billing/subscription/reactivate`. Scope: `billing:write`. Member: `deny`. Confirm: required. Changes: `billing`. Idempotent: send `idempotency_key`.

Keep a subscription that is set to cancel, so it renews again

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### billing_switch_plan

`POST /api/v1/billing/subscription/switch-plan`. Scope: `billing:write`. Member: `deny`. Confirm: required. Changes: `billing`. Idempotent: send `idempotency_key`.

Switch the subscription to another plan, which moves money

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `price_id` (body, string, required): A `price_id` from `billing_list_plans`

## Booking policies

### booking_policies_create

`POST /api/v1/booking-policies`. Scope: `booking_policies:write`. Member: `deny`. Changes: `booking_policies`. Idempotent: send `idempotency_key`.

Create a booking policy and publish its first terms

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `label` (body, string, required)
- `is_default` (body, boolean): Make this the organization default. Requires a version already in force. Offerings with no override follow it for new holds.
- `cancellation_policy` (body, object): Version 1 policy: notice_minutes (null or nonnegative integer), late_fee (kind none, fixed with amount_minor and currency, or percent with ppm), deposit_on_late_cancel (forfeit, credit, refund), deposit_on_timely_cancel (credit, refund), deposit_treatment (apply, forfeit, refund). Omitted means no fees.
- `no_show_policy` (body, object): Version 1 policy: fee (kind none, fixed with amount_minor and currency, or percent with ppm), deposit (forfeit, credit, refund), deposit_treatment (apply, forfeit, refund). Omitted means no fees.
- `effective_from` (body, string date-time): When this version takes effect. Defaults to now. A future version affects holds created after that time.

### booking_policies_get

`GET /api/v1/booking-policies/{policyId}`. Scope: `booking_policies:read`. Member: `open`.

Read a booking policy and its current terms

- `policyId` (path, string uuid, required)

### booking_policies_list

`GET /api/v1/booking-policies`. Scope: `booking_policies:read`. Member: `open`.

List booking policies

- `include_archived` (query, boolean)

### booking_policies_update

`PATCH /api/v1/booking-policies/{policyId}`. Scope: `booking_policies:write`. Member: `deny`. Changes: `booking_policies`.

Change a booking policy by publishing a new version

- `policyId` (path, string uuid, required)
- `label` (body, string)
- `is_default` (body, boolean): Make this the organization default. Requires a version already in force. Offerings with no override follow it for new holds.
- `cancellation_policy` (body, object): Version 1 policy: notice_minutes (null or nonnegative integer), late_fee (kind none, fixed with amount_minor and currency, or percent with ppm), deposit_on_late_cancel (forfeit, credit, refund), deposit_on_timely_cancel (credit, refund), deposit_treatment (apply, forfeit, refund). Omitted means no fees.
- `no_show_policy` (body, object): Version 1 policy: fee (kind none, fixed with amount_minor and currency, or percent with ppm), deposit (forfeit, credit, refund), deposit_treatment (apply, forfeit, refund). Omitted means no fees.
- `effective_from` (body, string date-time): When this version takes effect. Defaults to now. A future version affects holds created after that time.
- `archived_at` (body, string date-time): Archive a non-default policy. Existing snapshots remain readable. An archived override cannot accept new holds.

## Booking widgets

### booking_widgets_get

`GET /api/v1/booking-widgets/{locationId}`. Scope: `booking_widgets:read`. Member: `deny`. Manager power: `location_settings`.

Get the booking widget of a location

- `locationId` (path, string uuid, required): A location `id` from `locations_list`

### booking_widgets_replace_layout

`PUT /api/v1/booking-widgets/{locationId}/layout`. Scope: `booking_widgets:write`. Member: `deny`. Manager power: `location_settings`. Changes: `booking_widgets`.

Replace the layout of a location’s booking widget

- `locationId` (path, string uuid, required): A location `id` from `locations_list`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `layout` (body, PublicBookingWidgetLayoutDto, required)
  - `version` (body, number, required, one of `1`, `2`): Version 2 adds `style`, the optional sections and `offering_order`.
  - `style` (body, string, one of `sections`, `steps`, `time_first`): Version 2 only. Leave it out for `sections`.
  - `sections` (body, array of string, required, one of `address`, `offering`, `team_member`, `calendar`, `times`, `details`): `calendar`, `times` and `details` always. Version 2 may add `address`, `offering` and `team_member`, each once, `team_member` after `offering`.
  - `fields` (body, array of PublicBookingWidgetLayoutFieldDto, required): Each field at most once. `name` and `email` are always there and required.
    - `kind` (body, string, required, one of `builtin`, `crm`): `builtin` for name, email, phone or industry. `crm` for a CRM field of the organization.
    - `key` (body, string, required): The builtin field, or the CRM field key
    - `required` (body, boolean, required)
  - `offering_order` (body, array of string uuid): Version 2 only: the order of the services in the service section

### booking_widgets_update

`PUT /api/v1/booking-widgets/{locationId}`. Scope: `booking_widgets:write`. Member: `deny`. Manager power: `location_settings`. Changes: `booking_widgets`.

Create or replace the booking widget settings of a location

- `locationId` (path, string uuid, required): A location `id` from `locations_list`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `slug` (body, string, required): Unique across Iris
- `title` (body, string, required)
- `description` (body, string)
- `enabled` (body, boolean, required): An enabled widget needs at least one allowed origin.
- `allowed_origins` (body, array of string, required): At most 25, the Iris app origin included, so at most 24 others. Iris adds its own app origin, so the hosted booking link works.
- `timezone` (body, string, required): IANA timezone
- `duration_minutes` (body, number, required)
- `availability_start_time` (body, string, required): HH:MM
- `availability_end_time` (body, string, required): HH:MM, not equal to the start
- `enabled_weekdays` (body, array of number, required): Unique days, 0 (Sunday) to 6
- `google_integration_id` (body, string uuid, required): A Google Calendar connected at this location. Null: the Iris calendar.
- `redirect_url` (body, string): HTTPS page opened after a successful booking. Omit to keep the stored value. Null keeps the confirmation page.
- `min_notice_minutes` (body, integer): Minimum notice in minutes. Null means no limit. Applies to bookings Iris takes by phone, chat and text. Staff bookings are not limited.
- `max_bookings_per_day` (body, integer): Maximum bookings per person per day. Null means no limit. Applies to bookings Iris takes by phone, chat and text. Staff bookings are not limited.
- `max_days_ahead` (body, integer): How many days ahead a person may book. Null means no limit. Applies to bookings Iris takes by phone, chat and text. Staff bookings are not limited.

## Business data

### business_data_get_job

`GET /api/v1/business-data/jobs/{jobId}`. Scope: `business_data:read`. Member: `open`.

Get the status of a re-scrape or a resync

- `jobId` (path, string, required): The `job_id` of `business_data_rescrape_website` or `business_data_resync`

### business_data_rescrape_website

`POST /api/v1/business-data/rescrape-website`. Scope: `business_data:write`. Member: `deny`. Confirm: required. Changes: `business_data`.

Re-scrape the organization’s website

### business_data_resync

`POST /api/v1/business-data/resync`. Scope: `business_data:write`. Member: `deny`. Confirm: required. Changes: `business_data`, `agents`.

Send the business data to every phone agent

## Business notes

### business_notes_accept_fact_suggestion

`POST /api/v1/business-notes/fact-suggestions/{suggestionId}/accept`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Accept a fact suggestion

- `suggestionId` (path, string uuid, required): A fact suggestion `id` from `business_notes_list_fact_suggestions`
- `fields` (body, array of BusinessNoteFactOverrideDto): Values to write in place of the suggested ones. A `slot_id` the suggestion lacks changes nothing.
  - `slot_id` (body, string, required): A `slot_id` of the suggestion’s `fields`
  - `value` (body, object, required): The value to write in its place

### business_notes_accept_suggestion

`POST /api/v1/business-notes/suggestions/{suggestionId}/accept`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Accept a custom field suggestion

- `suggestionId` (path, string uuid, required): A suggestion `id` from `business_notes_list_suggestions`
- `label` (body, string): The field label. Blank: the proposed label.
- `sensitivity` (body, string): The data classification tier, such as `internal`
- `enum_values` (body, array of string): The options of an enum field

### business_notes_create

`POST /api/v1/business-notes`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`. Idempotent: send `idempotency_key`.

Add a business note

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `body` (body, string, required): The note text
- `title` (body, string): A short title, such as "Hours"

### business_notes_delete

`DELETE /api/v1/business-notes/{noteId}`. Scope: `business_notes:write`. Member: `deny`. Confirm: required. Changes: `business_notes`.

Delete a business note

- `noteId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### business_notes_dismiss_fact_suggestion

`POST /api/v1/business-notes/fact-suggestions/{suggestionId}/dismiss`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Dismiss a fact suggestion

- `suggestionId` (path, string uuid, required): A fact suggestion `id` from `business_notes_list_fact_suggestions`

### business_notes_dismiss_suggestion

`POST /api/v1/business-notes/suggestions/{suggestionId}/dismiss`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Dismiss a custom field suggestion

- `suggestionId` (path, string uuid, required): A suggestion `id` from `business_notes_list_suggestions`

### business_notes_get

`GET /api/v1/business-notes/{noteId}`. Scope: `business_notes:read`. Member: `deny`.

Get one business note

- `noteId` (path, string uuid, required)

### business_notes_list

`GET /api/v1/business-notes`. Scope: `business_notes:read`. Member: `deny`.

List the organization’s business notes

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### business_notes_list_fact_suggestions

`GET /api/v1/business-notes/fact-suggestions`. Scope: `business_notes:read`. Member: `deny`.

List the fact suggestions mined from notes

- `status` (query, string, one of `pending`, `accepted`, `rejected`, `dismissed`): Only suggestions with this review status

### business_notes_list_suggestions

`GET /api/v1/business-notes/suggestions`. Scope: `business_notes:read`. Member: `deny`.

List the custom field suggestions mined from notes

- `status` (query, string, one of `pending`, `accepted`, `rejected`, `dismissed`): Only suggestions with this review status

### business_notes_mine

`POST /api/v1/business-notes/mine`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Mine the new business notes into suggestions

### business_notes_reject_suggestion

`POST /api/v1/business-notes/suggestions/{suggestionId}/reject`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Reject a custom field suggestion

- `suggestionId` (path, string uuid, required): A suggestion `id` from `business_notes_list_suggestions`

### business_notes_update

`PATCH /api/v1/business-notes/{noteId}`. Scope: `business_notes:write`. Member: `deny`. Changes: `business_notes`.

Change the text of a business note

- `noteId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `body` (body, string, required): The new note text

## Calendar

### calendar_feeds_list

`GET /api/v1/calendar/feeds`. Scope: `calendar:read`. Member: `open`.

List the calendar feeds

### calendar_feeds_mint

`POST /api/v1/calendar/feeds`. Scope: `calendar:write`. Member: `open`. Confirm: required. Changes: `calendar`.

Mint a calendar subscription feed

- `kind` (body, string, required, one of `team_member`, `location`): team_member: one person’s appointments. location: a location’s.
- `team_member_id` (body, string uuid): With `kind: team_member`: the team member.
- `location_id` (body, string uuid): With `kind: location`: a location from `locations_list`.

### calendar_feeds_revoke

`DELETE /api/v1/calendar/feeds/{feedId}`. Scope: `calendar:write`. Member: `open`. Confirm: required. Changes: `calendar`.

Revoke a calendar feed

- `feedId` (path, string uuid, required)

### calendar_feeds_update_settings

`PATCH /api/v1/calendar/feeds/settings`. Scope: `calendar:write`. Member: `deny`. Changes: `calendar`.

Turn customer contact details in calendar feeds on or off

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `feed_contact_details_enabled` (body, boolean, required): Whether every calendar feed carries customer phone, email, notes and service address. Turning it on needs team scheduling.

### calendar_self_service_links_update_settings

`PATCH /api/v1/calendar/self-service-links/settings`. Scope: `calendar:write`. Member: `deny`. Changes: `calendar`.

Turn customers’ self-service appointment links on or off

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `self_service_links_enabled` (body, boolean, required): False makes every self-service link answer 404 until it is on again. No link is reset.

### calendar_settings_get

`GET /api/v1/calendar/settings`. Scope: `calendar:read`. Member: `scoped`.

Read the calendar settings

- `location_id` (query, string uuid): A location from `locations_list`. With it, the answer adds that location’s booking schedule.

### calendar_settings_update

`PATCH /api/v1/calendar/settings`. Scope: `calendar:write`. Member: `deny`. Manager power: `location_settings`. Changes: `calendar`.

Turn agent booking on or off, or change a location’s booking schedule

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_id` (query, string uuid): The location whose booking schedule changes. Leave it out to change `calendar_tool_enabled`, which is organization-wide.
- `calendar_tool_enabled` (body, boolean): Turn the agents’ booking tool on or off for the organization. Without `location_id` only, and an OWNER’s or ADMIN’s credential only.
- `booking_hours_override` (body, object): With `location_id` only. Replaces the location’s booking hours. `{ "weekly": {}, "dates": {} }` keeps its normal hours. `weekly` maps a weekday (`monday` … `sunday`) and `dates` maps a `YYYY-MM-DD` date to null (closed), one `{ start_time, end_time }` window in `HH:MM`, or a list of 1 to 6 windows. A weekday or date left out keeps the location’s hours.
- `closure_dates` (body, array of string): With `location_id` only. Replaces the dates the location takes no bookings, as unique `YYYY-MM-DD`.

### calendar_view_links_issue

`POST /api/v1/calendar/view-links`. Scope: `calendar:write`. Member: `deny`. Manager power: `staff`. Confirm: required. Changes: `calendar`.

Issue an organization view to a team member as a link

- `view_id` (body, string uuid, required): An organization view from `calendar_views_list`.
- `team_member_id` (body, string uuid, required): An active team member of the organization.
- `serves_feed` (body, boolean, required): The link opens the calendar feed.
- `serves_page` (body, boolean, required): The link opens the read-only web page.

### calendar_view_links_list

`GET /api/v1/calendar/view-links`. Scope: `calendar:read`. Member: `deny`. Manager power: `staff`.

List the view links issued to team members

- `team_member_id` (query, string uuid): Only the links issued to this team member.

### calendar_view_links_revoke

`DELETE /api/v1/calendar/view-links/{linkId}`. Scope: `calendar:write`. Member: `deny`. Manager power: `staff`. Confirm: required. Changes: `calendar`.

Revoke a view link

- `linkId` (path, string uuid, required)

### calendar_views_create

`POST /api/v1/calendar/views`. Scope: `calendar:write`. Member: `open`. Changes: `calendar`. Idempotent: send `idempotency_key`.

Save a calendar view

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The name shown in the calendar sidebar.
- `filters` (body, PublicCalendarViewFiltersDto, required): The sidebar filters. A filter left out reads as its default. A date range is refused.
  - `team_member_ids` (body, array of string): Team members shown, null for everyone.
  - `offering_ids` (body, array of string): Services shown, null for every service.
  - `booked_via` (body, array of string, one of `widget`, `agent`, `dashboard`, `self_service_link`): Booking channels shown, null for every channel.
  - `tentative_only` (body, boolean)
  - `show_google_busy` (body, boolean)
  - `show_cancelled` (body, boolean)
  - `only_conflicted` (body, boolean)
- `visibility` (body, string, required, one of `personal`, `org`): personal: only you. org: the organization’s, which only an OWNER or ADMIN saves.

### calendar_views_delete

`DELETE /api/v1/calendar/views/{viewId}`. Scope: `calendar:write`. Member: `open`. Confirm: required. Changes: `calendar`.

Delete a saved calendar view

- `viewId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### calendar_views_get

`GET /api/v1/calendar/views/{viewId}`. Scope: `calendar:read`. Member: `open`.

Read one saved calendar view

- `viewId` (path, string uuid, required)

### calendar_views_list

`GET /api/v1/calendar/views`. Scope: `calendar:read`. Member: `open`.

List the saved calendar views

### calendar_views_set_assignments

`PUT /api/v1/calendar/views/{viewId}/assignments`. Scope: `calendar:write`. Member: `deny`. Manager power: `staff`. Changes: `calendar`.

Assign an organization view to team members

- `viewId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `team_member_ids` (body, array of string uuid, required): Every team member the view is assigned to. Replaces the list. Empty unassigns it from everyone.

### calendar_views_update

`PATCH /api/v1/calendar/views/{viewId}`. Scope: `calendar:write`. Member: `open`. Changes: `calendar`.

Rename a saved calendar view or change its filters

- `viewId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string): A new name. Left out keeps the name.
- `filters` (body, PublicCalendarViewFiltersDto): The new filter set, which replaces the old one. Left out keeps the filters.
  - `team_member_ids` (body, array of string): Team members shown, null for everyone.
  - `offering_ids` (body, array of string): Services shown, null for every service.
  - `booked_via` (body, array of string, one of `widget`, `agent`, `dashboard`, `self_service_link`): Booking channels shown, null for every channel.
  - `tentative_only` (body, boolean)
  - `show_google_busy` (body, boolean)
  - `show_cancelled` (body, boolean)
  - `only_conflicted` (body, boolean)

## Calendars

### calendars_list

`GET /api/v1/calendars`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

List the calendars appointments can be booked on

## Call forwarding

### call_forwarding_create

`POST /api/v1/call-forwarding`. Scope: `call_forwarding:write`. Member: `deny`. Changes: `call_forwarding`. Idempotent: send `idempotency_key`.

Add a call forwarding number

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `phone_number` (body, string, required): E.164
- `condition` (body, string, required): When the agent transfers a call here
- `label` (body, string)
- `client_message` (body, string): What the agent tells the caller as it transfers
- `agent_message` (body, string): What the agent tells the person who answers
- `enabled` (body, boolean)

### call_forwarding_delete

`DELETE /api/v1/call-forwarding/{callForwardingId}`. Scope: `call_forwarding:write`. Member: `deny`. Confirm: required. Changes: `call_forwarding`.

Delete a call forwarding number

- `callForwardingId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### call_forwarding_get

`GET /api/v1/call-forwarding/{callForwardingId}`. Scope: `call_forwarding:read`. Member: `open`.

Get one call forwarding number

- `callForwardingId` (path, string uuid, required)

### call_forwarding_list

`GET /api/v1/call-forwarding`. Scope: `call_forwarding:read`. Member: `open`.

List the call forwarding numbers

### call_forwarding_update

`PATCH /api/v1/call-forwarding/{callForwardingId}`. Scope: `call_forwarding:write`. Member: `deny`. Changes: `call_forwarding`.

Change a call forwarding number

- `callForwardingId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `phone_number` (body, string): E.164
- `condition` (body, string)
- `label` (body, string)
- `client_message` (body, string)
- `agent_message` (body, string)
- `enabled` (body, boolean)

## Calls

### calls_delete

`POST /api/v1/calls/delete`. Scope: `calls:write`. Member: `deny`. Confirm: required. Changes: `calls`.

Delete calls, and list under failed each call kept after a provider error

- `call_ids` (body, array of string, required): Call `id`s from `calls_list`
- `location_id` (body, string uuid): Delete only the calls at this location

### calls_get

`GET /api/v1/calls/{callId}`. Scope: `calls:read`. Member: `action`. Action (`x-iris-action`): `calls.view`.

Get one call with its transcript

- `callId` (path, string, required): The `id` from `calls_list`

### calls_list

`GET /api/v1/calls`. Scope: `calls:read`. Member: `action`. Action (`x-iris-action`): `calls.view`.

List calls

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `contact_id` (query, string uuid): Only calls to or from this contact’s phone number
- `from` (query, string date-time): Only calls that started at or after this time
- `to` (query, string date-time): Only calls that started at or before this time

## Changes

### changes_list

`GET /api/v1/changes`. Scope: `changes:read`. Member: `action`. Action (`x-iris-action`): `contact.view`.

List record changes with optional visible values

- `record_kind` (query, string, required, one of `contact`): The kind of the record. Only `contact` today.
- `record_id` (query, string uuid, required): The id of the record.
- `include` (query, string, one of `values`): Include before and after values for changed fields.
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

## Chat widget

### chat_widget_get

`GET /api/v1/chat-widget`. Scope: `chat_widget:read`. Member: `open`.

Get the organization’s web chat widget

### chat_widget_update

`PATCH /api/v1/chat-widget`. Scope: `chat_widget:write`. Member: `deny`. Changes: `chat_widget`.

Change the organization’s web chat widget

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `enabled` (body, boolean): Turn the widget on or off. An enabled widget answers only on allowed origins.
- `allowed_origins` (body, array of string): Replaces the whole list. Each entry is an origin such as https://www.example.com.
- `greeting` (body, string): Null or blank: the default.
- `widget_title` (body, string): Null or blank: the default.
- `accent_color` (body, string): A #RRGGBB color. Null or blank: the brand color.
- `launcher_position` (body, string, one of `bottom-right`, `bottom-left`)

## Connected account

### connected_account_get

`GET /api/v1/connected-account`. Scope: `connected_account:read`. Member: `deny`.

Read the business's Stripe account for customer payments

## Contacts

### contacts_add_address

`POST /api/v1/contacts/{contactId}/addresses`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`. Idempotent: send `idempotency_key`.

Add a postal address to a contact

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `lines` (body, ContactAddressLinesDto, required)
  - `line1` (body, string)
  - `line2` (body, string)
  - `locality` (body, string): City or town
  - `admin_area_level_1` (body, string): State, province or region
  - `postal_code` (body, string)
  - `country_code` (body, string): ISO 3166-1 alpha-2
  - `raw_text` (body, string): The address in the customer’s own words
- `label` (body, string)
- `is_primary` (body, boolean)

### contacts_add_endpoint

`POST /api/v1/contacts/{contactId}/endpoints`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`. Idempotent: send `idempotency_key`.

Add a phone number or email address to a contact

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `kind` (body, string, required, one of `phone`, `email`)
- `value` (body, string, required): Phone or email value. It is normalized before storage.
- `label` (body, string)
- `is_primary` (body, boolean)

### contacts_add_note

`POST /api/v1/contacts/{contactId}/notes`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`. Idempotent: send `idempotency_key`.

Add a note to a contact

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `body` (body, string, required)

### contacts_add_tag

`POST /api/v1/contacts/{contactId}/tags`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Add a tag to a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `tag` (body, string, required): Tag name. Matched without regard to case or surrounding space; created on first use.

### contacts_archive

`POST /api/v1/contacts/{contactId}/archive`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.archive`. Changes: `contacts`.

Archive a contact

- `contactId` (path, string uuid, required)

### contacts_archive_address

`POST /api/v1/contacts/{contactId}/addresses/{addressId}/archive`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Archive a contact address

- `contactId` (path, string uuid, required)
- `addressId` (path, string uuid, required)

### contacts_archive_endpoint

`POST /api/v1/contacts/{contactId}/endpoints/{endpointId}/archive`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Archive a contact endpoint

- `contactId` (path, string uuid, required)
- `endpointId` (path, string uuid, required)

### contacts_assign_location

`POST /api/v1/contacts/locations`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Link several contacts to one location

- `contact_ids` (body, array of string uuid, required)
- `location_id` (body, string uuid, required): An active location from `locations_list`

### contacts_dismiss_merge_suggestion

`POST /api/v1/contacts/{contactId}/merge-suggestions/{suggestionId}/dismiss`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Dismiss a merge suggestion

- `contactId` (path, string uuid, required)
- `suggestionId` (path, string, required)

### contacts_export

`GET /api/v1/contacts/export`. Scope: `contacts:read`. Member: `deny`.

Export contacts as CSV

- `location_id` (query, string uuid): Only the contacts linked to this location
- `q` (query, string): Free text. Only contacts whose name, email or phone contains it.

### contacts_find_by_endpoint

`GET /api/v1/contacts/lookup`. Scope: `contacts:read`. Member: `scoped`. Action (`x-iris-action`): `contact.view`.

Find contacts by a viewable endpoint

- `email` (query, string email): Exact email address, without regard to case
- `phone` (query, string): Exact E.164 phone number

### contacts_get

`GET /api/v1/contacts/{contactId}`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contact.view`.

Get one contact with its relationships

- `contactId` (path, string uuid, required)

### contacts_get_affiliation

`GET /api/v1/contacts/{contactId}/locations/{locationId}/affiliation`. Scope: `contacts:read`. Member: `scoped`.

Get a contact’s owner, company and extra addresses at a location

- `contactId` (path, string uuid, required)
- `locationId` (path, string, required): A location the contact is linked to

### contacts_get_communication

`GET /api/v1/contacts/{contactId}/communication`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contacts.details`.

Read the stops, opt-outs and consents of a contact’s phones and emails

- `contactId` (path, string uuid, required)

### contacts_lift_suppression

`POST /api/v1/contacts/suppressions/{suppressionId}/lift`. Scope: `contacts:write`. Member: `deny`. Confirm: required. Changes: `contacts`.

Lift a suppression

- `suppressionId` (path, string uuid, required)
- `channel` (body, string, required, one of `email`, `sms`): The `channel` of the suppression
- `reason` (body, string, required): Why. Stored in the suppression audit log.

### contacts_list_addresses

`GET /api/v1/contacts/{contactId}/addresses`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contacts.details`.

List a contact’s postal addresses

- `contactId` (path, string uuid, required)
- `include_archived` (query, boolean): Also list archived rows. A credential that reads identity only never gets them.

### contacts_list_endpoints

`GET /api/v1/contacts/{contactId}/endpoints`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contact.view`.

List a contact’s phone numbers and email addresses

- `contactId` (path, string uuid, required)
- `include_archived` (query, boolean): Also list archived rows. A credential that reads identity only never gets them.

### contacts_list_groups

`GET /api/v1/contacts/{contactId}/groups`. Scope: `contacts:read`. Member: `scoped`. Action (`x-iris-action`): `contact.view`.

List the contact groups a contact belongs to

- `contactId` (path, string uuid, required)

### contacts_list_interactions

`GET /api/v1/contacts/{contactId}/interactions`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contact.view`.

List the interactions of a contact

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `channel` (query, string, one of `voice`, `chat`, `sms`): Only interactions on this channel
- `status` (query, string, one of `in_progress`, `completed`, `abandoned`): Only interactions in this status

### contacts_list_merge_suggestions

`GET /api/v1/contacts/merge-suggestions`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contacts.details`.

List merge suggestions

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `status` (query, string, one of `open`, `merged`, `dismissed`)
- `contact_id` (query, string uuid): Only suggestions that name this contact, on either side

### contacts_list_notes

`GET /api/v1/contacts/{contactId}/notes`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contacts.details`.

List the notes of a contact

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### contacts_list_stages

`GET /api/v1/contacts/stages`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contacts.metadata`.

List the organization’s pipeline stages

### contacts_list_suppressions

`GET /api/v1/contacts/suppressions`. Scope: `contacts:read`. Member: `deny`.

List suppressed email addresses and phone numbers

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `channel` (query, string, one of `email`, `sms`): One channel. Both when left out.
- `q` (query, string): Matches the suppressed email or phone, without regard to case
- `include_lifted` (query, boolean): Also list lifted SMS opt-outs, with `active` false

### contacts_remove_tag

`DELETE /api/v1/contacts/{contactId}/tags/{tag}`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Confirm: required. Changes: `contacts`.

Remove a tag from a contact

- `contactId` (path, string uuid, required)
- `tag` (path, string, required): Tag name, URL-encoded
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### contacts_restore

`POST /api/v1/contacts/{contactId}/restore`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.archive`. Changes: `contacts`.

Restore an archived contact

- `contactId` (path, string uuid, required)

### contacts_search

`GET /api/v1/contacts`. Scope: `contacts:read`. Member: `action`. Action (`x-iris-action`): `contact.list`.

Search viewable contact fields

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `q` (query, string): Free text. Matches contacts whose name, email or phone contains it, without regard to case.
- `email` (query, string email): Exact email, without regard to case
- `phone` (query, string): Exact phone number with its country code. Spaces, dashes and brackets are ignored, so `+1 (415) 555-0100` works. Matches the contact's phone number, not a phone held in `custom_fields`.

### contacts_set_communication

`POST /api/v1/contacts/{contactId}/communication`. Scope: `contacts:write`. Member: `scoped`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Set a communication rule and return readable contact communication facts

- `contactId` (path, string uuid, required)
- `endpoint_id` (body, string uuid, required): The endpoint whose communication rule changes
- `purpose` (body, string, required, one of `service`, `billing`, `marketing`)
- `channel` (body, string, required, one of `sms`, `voice`, `email`)
- `state` (body, string, required, one of `opted_in`, `opted_out`)

### contacts_set_locations

`PUT /api/v1/contacts/{contactId}/locations`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Set the locations of a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required): Every location the contact is linked to after the call. Each must be an active location.

### contacts_suggest_merge

`POST /api/v1/contacts/{contactId}/suggest-merge`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Suggest a contact merge

- `contactId` (path, string uuid, required)
- `duplicate_contact_id` (body, string uuid, required): The other contact in the same organization.
- `reason` (body, string): Why these contacts may be the same person.

### contacts_suppress

`POST /api/v1/contacts/{contactId}/suppress`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Confirm: required. Changes: `contacts`, `sequences`.

Suppress a contact on email or SMS

- `contactId` (path, string uuid, required)
- `channels` (body, array of string, required, one of `email`, `sms`)
- `reason` (body, string): Why, for example "asked to stop on a call". Written to the server log; not stored on the contact.

### contacts_suppress_address

`POST /api/v1/contacts/suppressions`. Scope: `contacts:write`. Member: `deny`. Confirm: required. Changes: `contacts`, `sequences`.

Suppress an email address or phone number

- `channel` (body, string, required, one of `email`, `sms`)
- `identifier` (body, string, required): An email address, or a phone number with its country code (E.164). It need not belong to a contact.
- `reason` (body, string, required): Why. Stored in the suppression audit log.

### contacts_update

`PATCH /api/v1/contacts/{contactId}`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Update a contact and its relationships

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `relationships` (body, object): Relationship targets to replace per catalog field key. Omitted keys stay unchanged. An empty array clears a field. Each target must match the field kind and organization.
- `name` (body, string)
- `phone` (body, string): E.164, e.g. +14155550100
- `email` (body, string email)
- `stage_id` (body, string): A stage `id` from the organization's pipeline
- `custom_fields` (body, object): Custom field values to merge, keyed by field name. An unknown name is a 400 that names it. At most 200 keys, each at most 255 characters long.

### contacts_update_address

`PATCH /api/v1/contacts/{contactId}/addresses/{addressId}`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Update an address label or primary flag

- `contactId` (path, string uuid, required)
- `addressId` (path, string uuid, required)
- `label` (body, string)
- `is_primary` (body, boolean)
- `lines` (body, ContactAddressLinesDto): Address lines are immutable. Archive and add a new address.
  - `line1` (body, string)
  - `line2` (body, string)
  - `locality` (body, string): City or town
  - `admin_area_level_1` (body, string): State, province or region
  - `postal_code` (body, string)
  - `country_code` (body, string): ISO 3166-1 alpha-2
  - `raw_text` (body, string): The address in the customer’s own words

### contacts_update_affiliation

`PUT /api/v1/contacts/{contactId}/locations/{locationId}/affiliation`. Scope: `contacts:write`. Member: `scoped`. Changes: `contacts`.

Change a contact’s owner, company or extra addresses at a location

- `contactId` (path, string uuid, required)
- `locationId` (path, string, required): A location the contact is linked to
- `expected_revision` (body, number, required): The `revision` read last, or 0 when `affiliation` is null
- `owner_id` (body, string uuid): `null` clears the owner
- `business_id` (body, string uuid): `null` clears the company
- `additional_emails` (body, array of string): Replaces the list. Never the primary email.
- `additional_phones` (body, array of string): E.164. Replaces the list. Never the primary phone.

### contacts_update_endpoint

`PATCH /api/v1/contacts/{contactId}/endpoints/{endpointId}`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Changes: `contacts`.

Update an endpoint label or primary flag

- `contactId` (path, string uuid, required)
- `endpointId` (path, string uuid, required)
- `label` (body, string)
- `is_primary` (body, boolean)
- `value` (body, string): Endpoint values are immutable. Archive and add a new endpoint.

### contacts_upsert

`POST /api/v1/contacts`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contacts.ingest`. Confirm: required. Changes: `contacts`, `sequences`.

Upsert a contact by email or phone, checking pipeline stages

- `name` (body, string, required): Contact full name
- `location_id` (body, string uuid): Location to link only when this call creates a contact. Must belong to the key scope and organization. One scoped location is implied. Several scoped locations require this field on creation. Explicit inactive locations answer location_inactive. An inactive implied location creates unlinked. Matched contacts keep their links.
- `email` (body, string email): Contact email address. When present it is the upsert key, matched case-insensitively. Send an email, a phone, or both.
- `phone` (body, string): Contact phone number. With an email, it is stored as a non-primary lead endpoint and the contact stays email-keyed with phone_number NULL. With no email, it is the upsert key: it must start with + and a country code, and it matches every active contact that holds the number.
- `source` (body, string, required): Attribution source
- `fields` (body, object): Arbitrary key/value data merged into the contact's CRM field values. Empty strings and null clear the live stage. Whitespace-only stage strings clear it and are stored as an empty string. At most 200 keys, each at most 255 characters long. With assessment_abandoned, user_message_count must be a numeric nonnegative safe integer when present. Cohort routing uses this request's count: started requires a positive count, never_started requires zero, and missing counts match only unfiltered triggers.
- `cancel_events` (body, array of ContactCancelEventDto): Sequence events to CANCEL for this contact, unconditionally. Processed before `events`, and idempotent because a second call cancels nothing. Use it for a goal exit, such as ending a win-back nurture once the contact converts.
  - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
  - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.
- `events` (body, array of ContactEventDto): Sequence events to FIRE for this contact, after the cancellations. Each event in turn claims its `key`, cancels the enrollments named in its `supersedes`, then enrolls. An event with no subscribing sequence leaves its key unspent, so a later retry still enrolls.
  - `name` (body, string, required): Event name. Matched as free text against the `event_name` of every active `event` sequence in the organization.
  - `key` (body, string, required): Caller-owned idempotency key for this event. Stable for "the same logical event", so a redelivery is a no-op. Surrounding whitespace is trimmed.
  - `supersedes` (body, array of ContactCancelEventDto): Events whose running enrollments this one REPLACES. Cancelled after this event claims its `key` and before it enrolls, so a redelivery with the same `key` cancels nothing and enrolls nothing. Use this for mutually exclusive states of one subject; use the top-level `cancel_events` for an unconditional exit.
    - `name` (body, string, required): Event name whose enrollments should be cancelled for this contact.
    - `reason` (body, string, one of `replied`, `booked`, `opted_out`, `manual`, `sequence_deactivated`, `converted`, `stage_reached`, `goal_met`, `schedule_cancelled`, `assessment_retake`): Why the journey ended. Defaults to `goal_met`.
- `skip_automations` (body, boolean): When true, the upsert itself starts nothing. A new contact starts no "New lead" (lead_created) sequence and sends no `crm.lead.created` event to integrations. An updated contact sends no `crm.contact.updated` or `crm.contact.stage_changed` event and starts no `stage_changed` automation. `events` and `cancel_events` still run as named. Use it to load existing customers. Defaults to false.

### contacts_upsert_company

`PUT /api/v1/contacts/{contactId}/locations/{locationId}/affiliation/companies/{companyId}`. Scope: `contacts:write`. Member: `scoped`. Changes: `contacts`.

Create or rename a customer company at a location

- `contactId` (path, string uuid, required)
- `locationId` (path, string, required): A location the contact is linked to
- `companyId` (path, string, required): A new UUID to create, or a company `id` to rename
- `expected_revision` (body, number, required): 0 creates the company. To rename, the `revision` read last.
- `name` (body, string, required)

## Context access

### context_access_get_summary

`GET /api/v1/context-engine/access/summary`. Scope: `context_access:read`. Member: `deny`.

Show what each AI agent can read and write

- `principal_id` (query, string): Only this agent. Leave it out for every agent.

### context_access_pin_snapshot

`PUT /api/v1/context-engine/access/pin`. Scope: `context_access:write`. Member: `deny`. Changes: `context_access`.

Pin an agent to a published snapshot

- `principal_id` (body, string, required): One of the organization’s own agents, `agent:<id>`
- `snapshot_id` (body, string uuid): A published snapshot `id`. Null: unpin, and the agent reads the live facts.

### context_access_remove_agent

`DELETE /api/v1/context-engine/access/agents/{principalId}`. Scope: `context_access:write`. Member: `deny`. Confirm: required. Changes: `context_access`.

Remove an add-on agent from the workspace

- `principalId` (path, string, required): A `principal_id` whose card has `removable` true

### context_access_set_ceiling

`PUT /api/v1/context-engine/access/ceiling`. Scope: `context_access:write`. Member: `deny`. Changes: `context_access`.

Set the most sensitive facts an agent may read

- `principal_id` (body, string, required): The agent, a `principal_id` of `context_access_get_summary`, such as `agent:<id>` or `scheduler`
- `ceiling` (body, string, required, one of `public`, `customer`, `internal`, `restricted`, `default`): `default` removes this organization’s setting

### context_access_set_grant

`PUT /api/v1/context-engine/access/grants`. Scope: `context_access:write`. Member: `deny`. Changes: `context_access`.

Grant or deny an agent access to facts

- `principal_id` (body, string, required): The agent, a `principal_id` of `context_access_get_summary`, such as `agent:<id>` or `scheduler`
- `access` (body, string, required, one of `read`, `read_write`, `none`): `none` denies it
- `domain_id` (body, string): A whole topic. Send this or `target`, not both.
- `target` (body, ContextAccessTargetDto): A topic, a kind of record or one field
  - `level` (body, string, required, one of `domain`, `entity_type`, `slot`)
  - `domain_id` (body, string, required)
  - `entity_type_id` (body, string): Needed for `entity_type`
  - `slot_id` (body, string): Needed for `slot`

## Context engine

### context_engine_capture_snapshot

`POST /api/v1/context-engine/snapshots`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`. Idempotent: send `idempotency_key`.

Capture a snapshot of one topic’s facts

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `domain_id` (body, string, required): The topic to freeze, a domain `id` of `context_engine_list_facts`

### context_engine_create_relationship

`POST /api/v1/context-engine/relationships`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`. Idempotent: send `idempotency_key`.

Link two of the business’s records

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `from_entity_id` (body, string uuid, required): The source record, an `id` of `entities`
- `to_entity_id` (body, string uuid, required): The target record
- `rel_type` (body, string): The link type. Leave it out for `related_to`.

### context_engine_delete_relationship

`DELETE /api/v1/context-engine/relationships/{relationshipId}`. Scope: `context_engine:write`. Member: `deny`. Confirm: required. Changes: `context_engine`.

Delete a link

- `relationshipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### context_engine_get_archetype

`GET /api/v1/context-engine/archetype`. Scope: `context_engine:read`. Member: `deny`.

Get the kind of business Iris treats the organization as

### context_engine_get_fact

`GET /api/v1/context-engine/facts/{entityId}/{slotId}`. Scope: `context_engine:read`. Member: `open`.

Get one fact of a record

- `entityId` (path, string uuid, required)
- `slotId` (path, string, required)

### context_engine_get_relationship

`GET /api/v1/context-engine/relationships/{relationshipId}`. Scope: `context_engine:read`. Member: `deny`.

Get one link

- `relationshipId` (path, string uuid, required)

### context_engine_list_facts

`GET /api/v1/context-engine/facts`. Scope: `context_engine:read`. Member: `open`.

List the facts Iris knows about the business

### context_engine_list_relationship_suggestions

`GET /api/v1/context-engine/relationship-suggestions`. Scope: `context_engine:read`. Member: `deny`.

List the links the AI suggests

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `status` (query, string, one of `pending`, `accepted`, `rejected`)

### context_engine_list_relationships

`GET /api/v1/context-engine/relationships`. Scope: `context_engine:read`. Member: `open`.

List the links between the business’s records

### context_engine_list_snapshots

`GET /api/v1/context-engine/snapshots`. Scope: `context_engine:read`. Member: `deny`.

List the fact snapshots

- `domain_id` (query, string): Only the snapshots of this topic

### context_engine_publish_snapshot

`POST /api/v1/context-engine/snapshots/{snapshotId}/publish`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Publish a captured snapshot

- `snapshotId` (path, string uuid, required)

### context_engine_remove_fact

`POST /api/v1/context-engine/facts/remove`. Scope: `context_engine:write`. Member: `deny`. Confirm: required. Changes: `context_engine`.

Remove a fact that is wrong or no longer true

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `slot_id` (body, string, required): The field, a `slot_id` of `context_engine_list_facts`
- `entity_id` (body, string uuid, required): The record the value belongs to

### context_engine_restore_fact

`POST /api/v1/context-engine/facts/restore`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Restore a removed fact

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `slot_id` (body, string, required): The field, a `slot_id` of `context_engine_list_facts`
- `entity_id` (body, string uuid, required): The record the value belongs to

### context_engine_review_relationship_suggestions

`POST /api/v1/context-engine/relationship-suggestions/review`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Accept or reject suggested links

- `candidate_ids` (body, array of string uuid, required): Suggestion `id`s
- `decision` (body, string, required, one of `accept`, `reject`): `accept` adds each link. `reject` sets them aside.

### context_engine_run_relationship_inference

`POST /api/v1/context-engine/relationship-suggestions/runs`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Find links the business’s records should have

### context_engine_set_archetype

`PUT /api/v1/context-engine/archetype`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Set the kind of business Iris treats the organization as

- `archetype_id` (body, string, required): An `id` of `options`, or null to go back to the archetype of the business vertical

### context_engine_set_fact_sharing

`PATCH /api/v1/context-engine/facts/sharing`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Set who Iris may share a fact with

- `slot_id` (body, string, required): The field
- `entity_id` (body, string uuid, required): The record the value belongs to
- `sensitivity` (body, string, required, one of `public`, `customer`, `internal`)

### context_engine_update_relationship

`PATCH /api/v1/context-engine/relationships/{relationshipId}`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`.

Change a link

- `relationshipId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `from_entity_id` (body, string uuid, required)
- `to_entity_id` (body, string uuid, required)
- `rel_type` (body, string, required)

### context_engine_write_fact

`POST /api/v1/context-engine/facts`. Scope: `context_engine:write`. Member: `deny`. Changes: `context_engine`. Idempotent: send `idempotency_key`.

Write a fact about the business

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `slot_id` (body, string, required): The field, a `slot_id` of `context_engine_list_facts`
- `entity_id` (body, string uuid): The record to write on. Leave it out for a field with no value yet: a new record is made.
- `entity_type_id` (body, string): The kind of record to make, such as `offering`, when there is no `entity_id`
- `value` (body, object, required): The value, in the field’s `data_type`
- `sensitivity` (body, string, one of `public`, `customer`, `internal`): Who Iris may share it with. Leave it out to keep the default.

## Conversations

### contacts_record_sms_consent

`POST /api/v1/contacts/{contactId}/sms-consent`. Scope: `contacts:write`. Member: `action`. Action (`x-iris-action`): `contact.edit`. Confirm: required. Changes: `contacts`, `sequences`. Idempotent: send `idempotency_key`.

Record a contact’s SMS opt-in or opt-out

- `contactId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `action` (body, string, required, one of `opt_in`, `opt_out`)
- `source` (body, string): Where the contact gave or withdrew consent, for example "web form". Kept with an opt-in.

### conversations_get

`GET /api/v1/conversations/{conversationId}`. Scope: `conversations:read`. Member: `action`. Action (`x-iris-action`): `conversations.view`.

Get one conversation with its messages

- `conversationId` (path, string uuid, required)

### conversations_hold

`POST /api/v1/conversations/{conversationId}/hold`. Scope: `conversations:write`. Member: `action`. Action (`x-iris-action`): `conversations.reply`. Changes: `conversations`.

Hold an SMS or web chat conversation for a person: the AI stops answering

- `conversationId` (path, string uuid, required)

### conversations_list

`GET /api/v1/conversations`. Scope: `conversations:read`. Member: `action`. Action (`x-iris-action`): `conversations.view`.

List email, SMS and web chat conversations

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `channel` (query, string, one of `email`, `sms`, `chat`): Only this channel. Every channel when left out. A search (`q`) leaves chat out.
- `q` (query, string): Free text search

### conversations_reply

`POST /api/v1/conversations/{conversationId}/reply`. Scope: `conversations:write`. Member: `action`. Action (`x-iris-action`): `conversations.reply`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Reply in an email, SMS or web chat conversation

- `conversationId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `body` (body, string, required): The text of the reply. At most 1600 characters for SMS and 4000 for chat.

### conversations_resume

`POST /api/v1/conversations/{conversationId}/resume`. Scope: `conversations:write`. Member: `action`. Action (`x-iris-action`): `conversations.reply`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Hand an SMS or web chat conversation back to the AI

- `conversationId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### conversations_send_sms

`POST /api/v1/conversations/sms`. Scope: `conversations:write`. Member: `action`. Action (`x-iris-action`): `conversations.reply`. Confirm: required. Changes: `conversations`. Idempotent: send `idempotency_key`.

Send an SMS for a purpose, checked against the contact’s consent for it

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `contact_id` (body, string uuid): Send to this contact’s phone number
- `phone` (body, string): Send to this number, with its country code
- `body` (body, string, required)
- `purpose` (body, string, one of `service`, `billing`, `marketing`): Why you send the text: `service` (about something the contact asked for or booked), `billing` or `marketing`. The communication gate checks the contact’s consent for this purpose. The default depends on the thread the text joins. In a live thread (the number texted it in the last 24 hours) the default is `service` with the `reactive_reply` exemption, so a reply needs no opt-in. A staff member (MEMBER) still needs the client’s opt-in. Outside a live thread the default is `marketing`, which needs a marketing opt-in: pass `service` for a reminder or an update, or the send is refused with 409 `sms_not_permitted`.

## Credit notes

### credit_notes_create

`POST /api/v1/credit-notes`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `credit_notes.issue`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Create a credit note from an invoice

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `invoice_id` (body, string uuid, required)
- `lines` (body, array of CreditNoteLineDto, required)
  - `line_id` (body, string uuid, required)
  - `amount_minor` (body, number, required)
  - `description` (body, string)
- `reason` (body, string, required)

### credit_notes_get

`GET /api/v1/credit-notes/{id}`. Scope: `invoices:read`. Member: `scoped`.

Get a credit note

- `id` (path, string uuid, required)

### credit_notes_issue

`POST /api/v1/credit-notes/{id}/issue`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `credit_notes.issue`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Issue a credit note

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### credit_notes_list

`GET /api/v1/credit-notes`. Scope: `invoices:read`. Member: `scoped`.

List credit notes

### invoices_close_unpaid

`POST /api/v1/invoices/{id}/close-unpaid`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.close_unpaid`. Confirm: required. Changes: `invoices`.

Close an unpaid invoice

- `id` (path, string uuid, required)
- `reason` (body, string, required)

### invoices_reopen

`POST /api/v1/invoices/{id}/reopen`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.reopen`. Confirm: required. Changes: `invoices`.

Reopen invoice collection

- `id` (path, string uuid, required)

### invoices_void

`POST /api/v1/invoices/{id}/void`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.void`. Confirm: required. Changes: `invoices`.

Void an unpaid invoice

- `id` (path, string uuid, required)
- `reason` (body, string, required)

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

## CRM imports

### crm_imports_get

`GET /api/v1/crm-imports/jobs/{jobId}`. Scope: `crm_imports:read`. Member: `deny`.

Get one CRM import

- `jobId` (path, string uuid, required)

### crm_imports_get_review_item

`GET /api/v1/crm-imports/review-items/{itemId}`. Scope: `crm_imports:read`. Member: `deny`.

Get one CRM import review item

- `itemId` (path, string uuid, required)

### crm_imports_get_settings

`GET /api/v1/crm-imports/settings`. Scope: `crm_imports:read`. Member: `open`.

Get the CRM import merge policy

### crm_imports_list

`GET /api/v1/crm-imports/jobs`. Scope: `crm_imports:read`. Member: `deny`.

List the organization’s CRM imports

- `limit` (query, number)

### crm_imports_list_review_items

`GET /api/v1/crm-imports/review-items`. Scope: `crm_imports:read`. Member: `deny`.

List the imported records that wait for a review decision

- `status` (query, string, one of `pending`, `merged`, `created`, `dismissed`, `all`): `all` lists the resolved items too
- `limit` (query, number)

### crm_imports_pause

`POST /api/v1/crm-imports/jobs/{jobId}/pause`. Scope: `crm_imports:write`. Member: `deny`. Changes: `crm_imports`.

Pause a CRM import

- `jobId` (path, string uuid, required)

### crm_imports_resolve_review_item

`POST /api/v1/crm-imports/review-items/{itemId}/resolve`. Scope: `crm_imports:write`. Member: `deny`. Confirm: required. Changes: `crm_imports`, `contacts`.

Decide which contact an imported record is

- `itemId` (path, string uuid, required)
- `action` (body, string, required, one of `merge`, `create`, `dismiss`): `merge` the record into `contact_id` under the item’s `merge_policy`, `create` a new contact from it, or `dismiss` it.
- `contact_id` (body, string uuid): Required for `merge`: the contact to merge into, usually one of the item’s `candidates`.

### crm_imports_resume

`POST /api/v1/crm-imports/jobs/{jobId}/resume`. Scope: `crm_imports:write`. Member: `deny`. Confirm: required. Changes: `crm_imports`, `contacts`.

Resume a paused or failed CRM import

- `jobId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### crm_imports_retry_failed

`POST /api/v1/crm-imports/jobs/{jobId}/retry-failed`. Scope: `crm_imports:write`. Member: `deny`. Confirm: required. Changes: `crm_imports`, `contacts`.

Retry the records a failed CRM import could not import

- `jobId` (path, string uuid, required)

### crm_imports_start

`POST /api/v1/crm-imports/jobs`. Scope: `crm_imports:write`. Member: `deny`. Confirm: required. Changes: `crm_imports`, `contacts`. Idempotent: send `idempotency_key`.

Start a CRM import

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `provider` (body, string, required, one of `zapier`, `hubspot`, `mcp`, `ghl`): The CRM to import from. Only `hubspot` imports today.
- `connection_id` (body, string uuid): The active connection to import through. It must be this organization’s, for the same provider.
- `object_types` (body, array of string, one of `contacts`, `companies`, `deals`): The record kinds to import, in this order: contacts, companies, deals. Defaults to contacts.
- `merge_policy` (body, string, one of `iris_wins`, `source_wins`, `newest_wins`): The merge policy of this import only. Defaults to the organization’s, from `crm_imports_get_settings`. `iris_wins` keeps what Iris holds and only fills blanks. `source_wins` takes the provider’s value. `newest_wins` takes it only when the provider’s record is newer than the contact. Email and phone are never overwritten.

### crm_imports_update_settings

`PUT /api/v1/crm-imports/settings`. Scope: `crm_imports:write`. Member: `deny`. Confirm: required. Changes: `crm_imports`.

Set the CRM import merge policy

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `merge_policy` (body, string, required, one of `iris_wins`, `source_wins`, `newest_wins`): The organization’s merge policy, for the imports started after it. `iris_wins` keeps what Iris holds and only fills blanks. `source_wins` takes the provider’s value. `newest_wins` takes it only when the provider’s record is newer than the contact. Email and phone are never overwritten.

## Customer subscriptions

### customer_subscriptions_cancel

`POST /api/v1/customer-subscriptions/{id}/cancel`. Scope: `customer_subscriptions:write`. Member: `action`. Action (`x-iris-action`): `subscriptions.cancel`. Confirm: required. Changes: `customer_subscriptions`, `invoices`, `allowances`.

Cancel a customer subscription at period end, or at once when the business allows it. A pending Stripe-issued row without a subscription binding can be cancelled after its subscription.created record is past the Stripe push cursor. Before then it answers 409 subscription_stripe_push_pending. A pending credit-terms cancel closes all unused grant units and voids an unpaid issued first invoice when no unit was used. A used unit keeps the invoice collectible and reminders active. A reserved unit answers 409 subscription_units_reserved and leaves the subscription, grant, invoice and reminders unchanged. The cancel succeeds once the hold that reserved the unit is released. A parked organization keeps subscription_stripe_push_pending until its push cursor advances. It leaves a draft first invoice unchanged. It refuses while that invoice is part-paid or credited. Machine gated: a key gets 403 needs_approval and nothing changes

- `id` (path, string uuid, required)
- `timing` (body, string, one of `period_end`, `immediate`): `period_end` stops renewal at the next boundary. `immediate` cancels now and needs the business setting `immediate_cancel_allowed`. Neither credits anything.

### customer_subscriptions_change

`POST /api/v1/customer-subscriptions/{id}/change`. Scope: `customer_subscriptions:write`. Member: `action`. Action (`x-iris-action`): `subscriptions.change`. Confirm: required. Changes: `customer_subscriptions`, `invoices`, `allowances`.

Next-period changes need subscriptions.change. On an Iris subscription, they replace same-kind schedules. A new next-period change on a Stripe subscription replaces any pending one. Immediate or dated changes withdraw overlapping schedules, return withdrawn_change_ids and need subscriptions.change_now. On a Stripe-issued subscription, a next_period change stays scheduled. Iris shows the old plan and seats until Stripe switches the phase at the period end. A Stripe next_period request at or after the Iris boundary returns 400 subscription_change_date_invalid until Iris records the renewal. Omitted timing also uses next_period, without proration or an extra invoice. Immediate changes prorate the paid item and release the pending schedule. Stripe on_date stays refused (R6). Charges can remain draft, extra units wait for payment and credits stay unapplied. Machine gated: a key or OAuth token gets 403 needs_approval without execution, unless a matching enabled api_key or oauth_grant rule allows subscriptions.change_now. Scope, role, record access, amount limits and second-person controls still apply

- `id` (path, string uuid, required)
- `kind` (body, string, required, one of `plan`, `quantity`)
- `plan_id` (body, string uuid): Required for a plan change.
- `quantity` (body, number): Required for a quantity change.
- `timing` (body, string, one of `next_period`, `immediate`, `on_date`): On a Stripe-issued subscription, a next_period change stays scheduled. Iris shows the old plan and seats until Stripe switches the phase at the period end. Omitted timing also uses next_period, with no proration or extra invoice. A new next-period change on a Stripe subscription replaces any pending one. Immediate prorates the paid item and releases the pending schedule. Stripe on_date stays refused (R6).
- `effective_at` (body, string date-time): Required for on_date, within the current period. Stripe-issued subscriptions refuse on_date (R6).

### customer_subscriptions_create

`POST /api/v1/customer-subscriptions`. Scope: `customer_subscriptions:write`. Member: `action`. Action (`x-iris-action`): `subscriptions.create`. Confirm: required. Changes: `customer_subscriptions`, `invoices`. Idempotent: send `idempotency_key`.

Sell a subscription plan to a contact or group. Machine gated: a key gets 403 needs_approval and nothing is created. A sold subscription stays pending until its period 1 invoice is paid

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `plan_id` (body, string uuid, required): The subscription plan sold. It needs a live price in the currency.
- `bill_to_contact_id` (body, string uuid): The contact billed. Give this or `bill_to_group_id`, not both.
- `bill_to_group_id` (body, string uuid): The group billed. Give this or `bill_to_contact_id`, not both.
- `quantity` (body, number): How many of the plan each period bills and grants.
- `currency` (body, string): The currency, fixed for the life of the subscription. Defaults to the organization currency.
- `location_id` (body, string uuid): The location the subscription belongs to.
- `starts_at` (body, string date-time): When period 1 starts. Defaults to now.
- `auto_issue` (body, boolean): Issue each period invoice when the period opens.
- `auto_send` (body, boolean): Send each issued period invoice to its remembered recipients.
- `credit_terms` (body, boolean): Explicit credit terms: each period funds its grant when it opens instead of when its invoice is paid.
- `issuer` (body, string, one of `iris`, `stripe`): Defaults to `iris`. `stripe` makes Stripe issue and collect each invoice on the connected account. It needs an active Stripe connection and a contact bill-to, and refuses credit terms, a future `starts_at`, `auto_issue` false, `auto_send` true and a plan with default tax rates. The subscription stays pending, with no Iris period or invoice, until its first Stripe invoice is paid.

### customer_subscriptions_get

`GET /api/v1/customer-subscriptions/{id}`. Scope: `customer_subscriptions:read`. Member: `scoped`.

Get a customer subscription with its issuer and scheduled changes

- `id` (path, string uuid, required)

### customer_subscriptions_list

`GET /api/v1/customer-subscriptions`. Scope: `customer_subscriptions:read`. Member: `scoped`.

Page customer subscriptions by cursor with issuer, state and next billing boundary

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `bill_to_contact_id` (query, string uuid): Only subscriptions billed to this contact. The contact must be visible to the caller.
- `bill_to_group_id` (query, string uuid): Only subscriptions billed to this group. The group must be visible to the caller.

### customer_subscriptions_list_periods

`GET /api/v1/customer-subscriptions/{id}/periods`. Scope: `customer_subscriptions:read`. Member: `scoped`.

Page subscription periods by cursor with invoices, grants and prices under the invoices_get financial visibility rule

- `id` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### customer_subscriptions_pause

`POST /api/v1/customer-subscriptions/{id}/pause`. Scope: `customer_subscriptions:write`. Member: `action`. Action (`x-iris-action`): `subscriptions.change`. Confirm: required. Changes: `customer_subscriptions`.

Schedule a pause on a billing boundary, the next by default, when the plan permits it. Paused time has no period, invoice or grant. A plan pause limit supplies a resume date when none is chosen. Requires subscriptions.change. Machine gated: a key gets 403 needs_approval and nothing changes

- `id` (path, string uuid, required)
- `pause_at` (body, string date-time): Billing boundary. Defaults to the next boundary.
- `resume_at` (body, string date-time): Resume date. Defaults to the plan pause limit when set.

### customer_subscriptions_preview_change

`POST /api/v1/customer-subscriptions/{id}/preview-change`. Scope: `customer_subscriptions:read`. Member: `scoped`. Confirm: required. Changes: none.

Preview a plan or quantity change with its effective date, prorated charge or credit and extra units. A Stripe-issued subscription previews the proration Stripe will charge and may create its Product and Price on the connected account. Next_period, including omitted timing, previews a schedule phase at the Stripe period end with no proration or invoice. On a Stripe-issued subscription, a next_period change stays scheduled. Iris shows the old plan and seats until Stripe switches the phase at the period end. A Stripe next_period request at or after the Iris boundary returns 400 subscription_change_date_invalid until Iris records the renewal. It still refuses on_date (R6). It creates no Iris change, invoice or grant. Amounts follow period financial visibility

- `id` (path, string uuid, required)
- `kind` (body, string, required, one of `plan`, `quantity`)
- `plan_id` (body, string uuid): Required for a plan change.
- `quantity` (body, number): Required for a quantity change.
- `timing` (body, string, one of `next_period`, `immediate`, `on_date`): On a Stripe-issued subscription, a next_period change stays scheduled. Iris shows the old plan and seats until Stripe switches the phase at the period end. Omitted timing also uses next_period, with no proration or extra invoice. A new next-period change on a Stripe subscription replaces any pending one. Immediate prorates the paid item and releases the pending schedule. Stripe on_date stays refused (R6).
- `effective_at` (body, string date-time): Required for on_date, within the current period. Stripe-issued subscriptions refuse on_date (R6).

### customer_subscriptions_resume

`POST /api/v1/customer-subscriptions/{id}/resume`. Scope: `customer_subscriptions:write`. Member: `action`. Action (`x-iris-action`): `subscriptions.change`. Confirm: required. Changes: `customer_subscriptions`, `invoices`, `allowances`.

Resume with a fresh period on the resume date, now by default, or schedule that date. Before a scheduled pause starts, withdraw it with status withdrawn and no new period. Requires subscriptions.change. Machine gated: a key gets 403 needs_approval and nothing changes

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `resume_at` (body, string date-time): Fresh period start. Defaults to the database clock.

## Discovery

### discovery_get_progress

`GET /api/v1/discovery/progress`. Scope: `discovery:read`. Member: `deny`.

Read how much of the business the discovery interview knows

### discovery_record_fact

`POST /api/v1/discovery/sessions/{sessionId}/facts`. Scope: `discovery:write`. Member: `deny`. Changes: `discovery`, `agents`. Idempotent: send `idempotency_key`.

Store one fact the owner gave in a discovery interview

- `sessionId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `slot_id` (body, string, required): The exact knowledge slot id
- `value` (body, string, required): The value as the owner said it. It is converted to the slot’s type.
- `entity_ref` (body, string): Groups facts about one thing, such as one service
- `confidence` (body, number): How sure the owner is, 0 to 1. The default is 0.9.

### discovery_send_message

`POST /api/v1/discovery/sessions/{sessionId}/messages`. Scope: `discovery:write`. Member: `deny`. Confirm: required. Changes: `discovery`, `agents`. Idempotent: send `idempotency_key`.

Send the owner’s next answer in a discovery interview

- `sessionId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `content` (body, string, required): The owner’s next answer in the interview
- `done` (body, boolean): True ends the interview after this message

### discovery_start

`POST /api/v1/discovery/sessions`. Scope: `discovery:write`. Member: `deny`. Confirm: required. Changes: `discovery`. Idempotent: send `idempotency_key`.

Start a discovery interview about the business

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

## Disputes

### disputes_get

`GET /api/v1/disputes/{disputeId}`. Scope: `disputes:read`. Member: `deny`.

Get one payment dispute with its linked records

- `disputeId` (path, string uuid, required)

### disputes_list

`GET /api/v1/disputes`. Scope: `disputes:read`. Member: `deny`.

List payment disputes

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `review_state` (query, string, one of `open`, `acknowledged`, `resolved`): Only disputes in this review state: `open`, `acknowledged` by staff, or `resolved` by Stripe.

## Documents

### credit_notes_send

`POST /api/v1/credit-notes/{id}/send`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `credit_notes.send`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Send an issued credit note to chosen recipients, or request staff approval

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this send. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_conflict`.
- `recipients` (body, array of DocumentRecipientInputDto): Pass at least one recipient. An empty resolved list answers 400 `recipients_required` unless select_all is true.
  - `contact_id` (body, string uuid)
  - `endpoint_id` (body, string uuid)
  - `address_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `value_snapshot` (body, string)
  - `channel` (body, string, required, one of `email`, `sms`, `pdf`)
  - `selected_how` (body, string, one of `manual`, `remembered`, `all_members`)
- `select_all` (body, boolean)

### invoices_acknowledge_line

`POST /api/v1/invoices/{id}/lines/{line_id}/acknowledge`. Scope: `invoices:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Acknowledge an estimated invoice line price

- `id` (path, string uuid, required)
- `line_id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### invoices_create

`POST /api/v1/invoices`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Create a draft invoice with an optional work-record or appointment source

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `currency` (body, string, required)
- `location_id` (body, string uuid)
- `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
- `discount_value` (body, number): Fixed minor units, or parts per million when discount_kind is percent.
- `lines` (body, array of DocumentLineInputDto, required)
  - `line_kind` (body, string, required, one of `offering`, `add_on`, `custom`, `fee`, `allowance_plan`, `subscription_period`, `adjustment`, `credit`, `provider`)
  - `offering_id` (body, string uuid)
  - `add_on_id` (body, string uuid)
  - `plan_id` (body, string uuid)
  - `appointment_id` (body, string uuid): The appointment this document line bills. The appointment must be visible to the API key.
  - `appointment_line_id` (body, string uuid): The booking line this document line bills. With appointment_id it must belong to that appointment. Without it, Iris stores the booking line's appointment.
  - `terms_version_id` (body, string uuid)
  - `fee_kind` (body, string, one of `no_show`, `late_cancellation`): Only on fee lines. Null is allowed on any line. Existing fee-line carry rules still apply.
  - `unit_label` (body, string): Optional unit label, at most 100 characters. Null clears the label.
  - `reduces_line_id` (body, string uuid): Only on credit lines. Carry-back only on draft replacement: send the latest stored credit line id and its unchanged link. The target must belong to the same organization and another version of the same document. Create and revise with caller lines refuse links. Null drops the link. A new, changed or foreign link answers 409 credit_link_not_editable.
  - `description` (body, string)
  - `quantity` (body, number)
  - `unit_price_minor` (body, number)
  - `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
  - `discount_value` (body, number)
  - `discountable` (body, boolean)
  - `taxes` (body, array of DocumentLineTaxInputDto)
    - `tax_rate_id` (body, string uuid, required)
    - `rate_ppm` (body, number, required)
    - `label` (body, string, required)
- `parties` (body, array of DocumentPartyInputDto)
  - `role` (body, string, required, one of `requester`, `bill_to`, `service_recipient`)
  - `contact_id` (body, string uuid)
  - `group_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `address_snapshot` (body, object)
- `source` (body, DocumentSourceInputDto)
  - `kind` (body, string, required, one of `work_record`, `appointment`)
  - `id` (body, string uuid, required)

### invoices_create_draft_rule

`POST /api/v1/invoices/draft-rules`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Create an invoice draft rule for acceptance, completion or work status

- `trigger` (body, string, required, one of `proposal_accepted`, `appointment_completed`, `appointment_late_cancelled`, `appointment_no_show`, `work_status_entered`)
- `work_status_id` (body, string uuid): Required exactly for work_status_entered.
- `share_ppm` (body, number)
- `milestone_no` (body, number)
- `final` (body, boolean)
- `auto_issue` (body, boolean)
- `auto_send` (body, boolean)
- `enabled` (body, boolean)
- `idempotency_key` (body, string): A retry key scoped to this credential.

### invoices_get

`GET /api/v1/invoices/{id}`. Scope: `invoices:read`. Member: `scoped`.

Read an invoice with issuer and, for financial readers, due and provider_amount_remaining

- `id` (path, string uuid, required)

### invoices_issue

`POST /api/v1/invoices/{id}/issue`. Scope: `invoices:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Issue an invoice with an optional staleness check, or request staff approval

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): Send the invoice document updated_at. A different token answers 409 stale_revision. A current token keeps document_not_draft for an invoice in the wrong state. After stale_revision, read the document again and send a new idempotency_key. A same-key retry answers 409 idempotency_outcome_unknown. Omit the token to keep the current behaviour.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `issuer_snapshot` (body, object): Issuer details frozen into the issued version snapshot.

### invoices_list

`GET /api/v1/invoices`. Scope: `invoices:read`. Member: `scoped`.

List invoices with issuer and, for financial readers, due and provider_amount_remaining

- `include_archived` (query, boolean)

### invoices_list_draft_rules

`GET /api/v1/invoices/draft-rules`. Scope: `invoices:read`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`.

List invoice draft rules and their milestone shares

### invoices_list_events

`GET /api/v1/invoices/{id}/events`. Scope: `invoices:read`. Member: `scoped`.

List the views, downloads and delivery outcomes of an invoice

- `id` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### invoices_pause_collection

`POST /api/v1/invoices/{id}/pause_collection`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.collection`. Confirm: required. Changes: `invoices`.

Pause collection and cancel live invoice reminder enrollments

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### invoices_replace_draft

`PUT /api/v1/invoices/{id}/draft`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`. Confirm: required. Changes: `invoices`.

Replace every field of an invoice draft

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `lines` (body, array of DocumentDraftLineInputDto, required)
  - `line_kind` (body, string, required, one of `offering`, `add_on`, `custom`, `fee`, `allowance_plan`, `subscription_period`, `adjustment`, `credit`, `provider`)
  - `offering_id` (body, string uuid)
  - `add_on_id` (body, string uuid)
  - `plan_id` (body, string uuid)
  - `appointment_id` (body, string uuid): The appointment this document line bills. The appointment must be visible to the API key.
  - `appointment_line_id` (body, string uuid): The booking line this document line bills. With appointment_id it must belong to that appointment. Without it, Iris stores the booking line's appointment.
  - `terms_version_id` (body, string uuid)
  - `fee_kind` (body, string, one of `no_show`, `late_cancellation`): Only on fee lines. Null is allowed on any line. Existing fee-line carry rules still apply.
  - `unit_label` (body, string): Optional unit label, at most 100 characters. Null clears the label.
  - `reduces_line_id` (body, string uuid): Only on credit lines. Carry-back only on draft replacement: send the latest stored credit line id and its unchanged link. The target must belong to the same organization and another version of the same document. Create and revise with caller lines refuse links. Null drops the link. A new, changed or foreign link answers 409 credit_link_not_editable.
  - `description` (body, string)
  - `quantity` (body, number)
  - `unit_price_minor` (body, number)
  - `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
  - `discount_value` (body, number)
  - `discountable` (body, boolean)
  - `taxes` (body, array of DocumentLineTaxInputDto)
    - `tax_rate_id` (body, string uuid, required)
    - `rate_ppm` (body, number, required)
    - `label` (body, string, required)
  - `id` (body, string uuid)
- `parties` (body, array of DocumentPartyInputDto, required)
  - `role` (body, string, required, one of `requester`, `bill_to`, `service_recipient`)
  - `contact_id` (body, string uuid)
  - `group_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `address_snapshot` (body, object)
- `discount_kind` (body, string, required, one of `none`, `fixed`, `percent`)
- `discount_value` (body, number, required)
- `prices_include_tax` (body, boolean)

### invoices_resume_collection

`POST /api/v1/invoices/{id}/resume_collection`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.collection`. Confirm: required. Changes: `invoices`.

Resume collection and enroll eligible invoices with reminders enabled and no live enrollment

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### invoices_send

`POST /api/v1/invoices/{id}/send`. Scope: `invoices:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `invoices`. Idempotent: send `idempotency_key`.

Send an issued invoice to chosen recipients, or request staff approval

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `recipients` (body, array of DocumentRecipientInputDto)
  - `contact_id` (body, string uuid)
  - `endpoint_id` (body, string uuid)
  - `address_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `value_snapshot` (body, string)
  - `channel` (body, string, required, one of `email`, `sms`, `pdf`)
  - `selected_how` (body, string, one of `manual`, `remembered`, `all_members`)
- `select_all` (body, boolean)

### invoices_update

`PATCH /api/v1/invoices/{id}`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`. Confirm: required. Changes: `invoices`.

Update a draft invoice

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `due_on` (body, string date)
- `valid_until` (body, string date)

### invoices_update_draft_rule

`PATCH /api/v1/invoices/draft-rules/{ruleId}`. Scope: `invoices:write`. Member: `action`. Action (`x-iris-action`): `invoices.draft_write`. Confirm: required. Changes: `invoices`.

Change an invoice draft rule or disable future automatic drafts

- `ruleId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `trigger` (body, string, one of `proposal_accepted`, `appointment_completed`, `appointment_late_cancelled`, `appointment_no_show`, `work_status_entered`)
- `work_status_id` (body, string uuid): Required exactly for work_status_entered.
- `share_ppm` (body, number)
- `milestone_no` (body, number)
- `final` (body, boolean)
- `auto_issue` (body, boolean)
- `auto_send` (body, boolean)
- `enabled` (body, boolean)

### proposals_acknowledge_line

`POST /api/v1/proposals/{id}/lines/{line_id}/acknowledge`. Scope: `proposals:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Acknowledge an estimated proposal line price

- `id` (path, string uuid, required)
- `line_id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): For an issued or accepted proposal, use the draft version updated_at from GET versions or the last write response draft_version. For a draft proposal, use the document updated_at. A stale token answers 409 stale_revision and changes nothing. Omit it to write without the check.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### proposals_create

`POST /api/v1/proposals`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.draft_write`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Create a draft proposal with an optional work-record source

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `currency` (body, string, required)
- `location_id` (body, string uuid)
- `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
- `discount_value` (body, number): Fixed minor units, or parts per million when discount_kind is percent.
- `lines` (body, array of DocumentLineInputDto, required)
  - `line_kind` (body, string, required, one of `offering`, `add_on`, `custom`, `fee`, `allowance_plan`, `subscription_period`, `adjustment`, `credit`, `provider`)
  - `offering_id` (body, string uuid)
  - `add_on_id` (body, string uuid)
  - `plan_id` (body, string uuid)
  - `appointment_id` (body, string uuid): The appointment this document line bills. The appointment must be visible to the API key.
  - `appointment_line_id` (body, string uuid): The booking line this document line bills. With appointment_id it must belong to that appointment. Without it, Iris stores the booking line's appointment.
  - `terms_version_id` (body, string uuid)
  - `fee_kind` (body, string, one of `no_show`, `late_cancellation`): Only on fee lines. Null is allowed on any line. Existing fee-line carry rules still apply.
  - `unit_label` (body, string): Optional unit label, at most 100 characters. Null clears the label.
  - `reduces_line_id` (body, string uuid): Only on credit lines. Carry-back only on draft replacement: send the latest stored credit line id and its unchanged link. The target must belong to the same organization and another version of the same document. Create and revise with caller lines refuse links. Null drops the link. A new, changed or foreign link answers 409 credit_link_not_editable.
  - `description` (body, string)
  - `quantity` (body, number)
  - `unit_price_minor` (body, number)
  - `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
  - `discount_value` (body, number)
  - `discountable` (body, boolean)
  - `taxes` (body, array of DocumentLineTaxInputDto)
    - `tax_rate_id` (body, string uuid, required)
    - `rate_ppm` (body, number, required)
    - `label` (body, string, required)
- `parties` (body, array of DocumentPartyInputDto)
  - `role` (body, string, required, one of `requester`, `bill_to`, `service_recipient`)
  - `contact_id` (body, string uuid)
  - `group_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `address_snapshot` (body, object)
- `source` (body, ProposalDocumentSourceInputDto)
  - `kind` (body, string, required, one of `work_record`)
  - `id` (body, string uuid, required)

### proposals_decline

`POST /api/v1/proposals/{id}/decline`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.record_acceptance`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Record that the customer declined a proposal (a machine credential needs approval)

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `document_version_id` (body, string uuid, required): The current issued version the customer decided on.
- `person_name` (body, string, required): The person who decided, as they gave their name.
- `person_contact_id` (body, string uuid): The contact who decided, when they are a contact.
- `evidence_note` (body, string): Where the decision came from, such as the email or the call.
- `decided_at` (body, string date-time): When the customer decided. Left out, now. It must lie between the time the version was issued and now (up to five minutes ahead, for a fast clock). Any other time answers 400 `proposal_decided_at_invalid`.
- `method` (body, string, one of `staff_email`, `staff_phone`)

### proposals_get

`GET /api/v1/proposals/{id}`. Scope: `proposals:read`. Member: `scoped`.

Read a proposal document

- `id` (path, string uuid, required)

### proposals_issue

`POST /api/v1/proposals/{id}/issue`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.issue`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Issue a proposal draft or revision with an optional staleness check, or request staff approval

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): For draft issue, send the document updated_at. For revision issue, send the draft version updated_at. A different token or a missing revision draft answers 409 stale_revision. A current token keeps document_not_draft or proposal_not_revisable for a proposal in the wrong state. After stale_revision, read the document again and send a new idempotency_key. A same-key retry answers 409 idempotency_outcome_unknown. Omit the token to keep the current behaviour.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `issuer_snapshot` (body, object): Issuer details frozen into the issued version snapshot.

### proposals_list

`GET /api/v1/proposals`. Scope: `proposals:read`. Member: `scoped`.

List proposal documents

- `include_archived` (query, boolean)

### proposals_record_acceptance

`POST /api/v1/proposals/{id}/acceptances`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.record_acceptance`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Record that the customer accepted a proposal by email or phone (a machine credential needs approval)

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `document_version_id` (body, string uuid, required): The current issued version the customer decided on.
- `person_name` (body, string, required): The person who decided, as they gave their name.
- `person_contact_id` (body, string uuid): The contact who decided, when they are a contact.
- `evidence_note` (body, string): Where the decision came from, such as the email or the call.
- `decided_at` (body, string date-time): When the customer decided. Left out, now. It must lie between the time the version was issued and now (up to five minutes ahead, for a fast clock). Any other time answers 400 `proposal_decided_at_invalid`.
- `content_hash` (body, string, required): The content_hash of the version the customer accepted. Any other hash is refused.
- `method` (body, string, required, one of `staff_email`, `staff_phone`): How the customer told you they accept.

### proposals_replace_draft

`PUT /api/v1/proposals/{id}/draft`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.draft_write`. Confirm: required. Changes: `proposals`.

Replace every field of a proposal draft

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): For an issued or accepted proposal, use the draft version updated_at from GET versions or the last write response draft_version. For a draft proposal, use the document updated_at. A stale token answers 409 stale_revision and changes nothing. Omit it to write without the check.
- `lines` (body, array of DocumentDraftLineInputDto, required)
  - `line_kind` (body, string, required, one of `offering`, `add_on`, `custom`, `fee`, `allowance_plan`, `subscription_period`, `adjustment`, `credit`, `provider`)
  - `offering_id` (body, string uuid)
  - `add_on_id` (body, string uuid)
  - `plan_id` (body, string uuid)
  - `appointment_id` (body, string uuid): The appointment this document line bills. The appointment must be visible to the API key.
  - `appointment_line_id` (body, string uuid): The booking line this document line bills. With appointment_id it must belong to that appointment. Without it, Iris stores the booking line's appointment.
  - `terms_version_id` (body, string uuid)
  - `fee_kind` (body, string, one of `no_show`, `late_cancellation`): Only on fee lines. Null is allowed on any line. Existing fee-line carry rules still apply.
  - `unit_label` (body, string): Optional unit label, at most 100 characters. Null clears the label.
  - `reduces_line_id` (body, string uuid): Only on credit lines. Carry-back only on draft replacement: send the latest stored credit line id and its unchanged link. The target must belong to the same organization and another version of the same document. Create and revise with caller lines refuse links. Null drops the link. A new, changed or foreign link answers 409 credit_link_not_editable.
  - `description` (body, string)
  - `quantity` (body, number)
  - `unit_price_minor` (body, number)
  - `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
  - `discount_value` (body, number)
  - `discountable` (body, boolean)
  - `taxes` (body, array of DocumentLineTaxInputDto)
    - `tax_rate_id` (body, string uuid, required)
    - `rate_ppm` (body, number, required)
    - `label` (body, string, required)
  - `id` (body, string uuid)
- `parties` (body, array of DocumentPartyInputDto, required)
  - `role` (body, string, required, one of `requester`, `bill_to`, `service_recipient`)
  - `contact_id` (body, string uuid)
  - `group_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `address_snapshot` (body, object)
- `discount_kind` (body, string, required, one of `none`, `fixed`, `percent`)
- `discount_value` (body, number, required)
- `prices_include_tax` (body, boolean)
- `milestone_plan` (body, array of MilestonePlanEntryDto)
  - `milestone_no` (body, number, required)
  - `share_ppm` (body, number, required)
  - `final` (body, boolean)

### proposals_revise

`POST /api/v1/proposals/{id}/revise`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.draft_write`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Start a proposal revision with an optional proposal timestamp check

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): Send the proposal document updated_at. A different token or an existing revision draft answers 409 stale_revision. A current token keeps proposal_not_revisable for a proposal in the wrong state. After stale_revision, read the document again and send a new idempotency_key. A same-key retry answers 409 idempotency_outcome_unknown. Omit the token to keep the current behaviour.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `lines` (body, array of DocumentLineInputDto): The lines of the new version. Left out, the current version’s lines and taxes are copied.
  - `line_kind` (body, string, required, one of `offering`, `add_on`, `custom`, `fee`, `allowance_plan`, `subscription_period`, `adjustment`, `credit`, `provider`)
  - `offering_id` (body, string uuid)
  - `add_on_id` (body, string uuid)
  - `plan_id` (body, string uuid)
  - `appointment_id` (body, string uuid): The appointment this document line bills. The appointment must be visible to the API key.
  - `appointment_line_id` (body, string uuid): The booking line this document line bills. With appointment_id it must belong to that appointment. Without it, Iris stores the booking line's appointment.
  - `terms_version_id` (body, string uuid)
  - `fee_kind` (body, string, one of `no_show`, `late_cancellation`): Only on fee lines. Null is allowed on any line. Existing fee-line carry rules still apply.
  - `unit_label` (body, string): Optional unit label, at most 100 characters. Null clears the label.
  - `reduces_line_id` (body, string uuid): Only on credit lines. Carry-back only on draft replacement: send the latest stored credit line id and its unchanged link. The target must belong to the same organization and another version of the same document. Create and revise with caller lines refuse links. Null drops the link. A new, changed or foreign link answers 409 credit_link_not_editable.
  - `description` (body, string)
  - `quantity` (body, number)
  - `unit_price_minor` (body, number)
  - `discount_kind` (body, string, one of `none`, `fixed`, `percent`)
  - `discount_value` (body, number)
  - `discountable` (body, boolean)
  - `taxes` (body, array of DocumentLineTaxInputDto)
    - `tax_rate_id` (body, string uuid, required)
    - `rate_ppm` (body, number, required)
    - `label` (body, string, required)
- `parties` (body, array of DocumentPartyInputDto): The parties of the new version, such as a new bill-to. Left out, the current parties are copied.
  - `role` (body, string, required, one of `requester`, `bill_to`, `service_recipient`)
  - `contact_id` (body, string uuid)
  - `group_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `address_snapshot` (body, object)
- `discount_kind` (body, string, one of `none`, `fixed`, `percent`): Left out, the current discount kind.
- `discount_value` (body, number): Fixed minor units, or parts per million when discount_kind is percent. Left out, the current value.

### proposals_send

`POST /api/v1/proposals/{id}/send`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.send`. Confirm: required. Changes: `proposals`. Idempotent: send `idempotency_key`.

Send an issued proposal to chosen recipients, or request staff approval

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `recipients` (body, array of DocumentRecipientInputDto)
  - `contact_id` (body, string uuid)
  - `endpoint_id` (body, string uuid)
  - `address_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `value_snapshot` (body, string)
  - `channel` (body, string, required, one of `email`, `sms`, `pdf`)
  - `selected_how` (body, string, one of `manual`, `remembered`, `all_members`)
- `select_all` (body, boolean)

### proposals_update

`PATCH /api/v1/proposals/{id}`. Scope: `proposals:write`. Member: `action`. Action (`x-iris-action`): `proposals.draft_write`. Confirm: required. Changes: `proposals`.

Update a draft proposal

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `due_on` (body, string date)
- `valid_until` (body, string date)

### proposals_withdraw

`POST /api/v1/proposals/{id}/withdraw`. Scope: `proposals:write`. Member: `deny`. Confirm: required. Changes: `proposals`.

Withdraw an issued proposal

- `id` (path, string uuid, required)
- `reason` (body, string): Why the proposal is withdrawn.

## Email design

### email_design_create_frame_part

`POST /api/v1/email-design/frame-parts`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`. Idempotent: send `idempotency_key`.

Create a header or footer

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `kind` (body, string, required, one of `header`, `footer`)
- `name` (body, string, required): Unique among the organization’s parts of its kind
- `blocks` (body, array of object, required): The part’s blocks, in the block format of a document’s `blocks`. Iris sanitizes them on write and on read.

### email_design_create_template

`POST /api/v1/email-design/templates`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`. Idempotent: send `idempotency_key`.

Save an email template

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): Unique in the organization
- `folder` (body, string): The folder the template is filed under. Null, or blank, is Unfiled.
- `document` (body, object, required): A block document: `{ "version": 1, "blocks": [...] }`, the format the email designer saves. Iris sanitizes it on write and on read.

### email_design_delete_frame_part

`DELETE /api/v1/email-design/frame-parts/{partId}`. Scope: `email_design:write`. Member: `deny`. Confirm: required. Changes: `email_design`.

Delete a header or footer

- `partId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### email_design_delete_template

`DELETE /api/v1/email-design/templates/{templateId}`. Scope: `email_design:write`. Member: `deny`. Confirm: required. Changes: `email_design`.

Delete a saved email template

- `templateId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### email_design_duplicate_frame_part

`POST /api/v1/email-design/frame-parts/{partId}/duplicate`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`. Idempotent: send `idempotency_key`.

Copy a header or footer

- `partId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The copy’s name, unique among the parts of its kind

### email_design_get_brand_frame

`GET /api/v1/email-design/brand-frame`. Scope: `email_design:read`. Member: `open`.

Get the email brand frame

### email_design_get_frame_part

`GET /api/v1/email-design/frame-parts/{partId}`. Scope: `email_design:read`. Member: `open`.

Get one header or footer

- `partId` (path, string uuid, required)

### email_design_get_template

`GET /api/v1/email-design/templates/{templateId}`. Scope: `email_design:read`. Member: `open`.

Get one saved email template

- `templateId` (path, string uuid, required)

### email_design_list_frame_parts

`GET /api/v1/email-design/frame-parts`. Scope: `email_design:read`. Member: `open`.

List the headers and footers

- `kind` (query, string, one of `header`, `footer`): Only headers or only footers. Leave it out for both.

### email_design_list_templates

`GET /api/v1/email-design/templates`. Scope: `email_design:read`. Member: `open`.

List the saved email templates

### email_design_send_test

`POST /api/v1/email-design/test-send`. Scope: `email_design:write`. Member: `open`. Confirm: required. Changes: `email_design`. Idempotent: send `idempotency_key`.

Send a designed email to yourself

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `subject` (body, string, required): The subject. Iris puts `Test: ` before it.
- `preheader` (body, string): The preview line an inbox shows after the subject
- `document` (body, object, required): A block document: `{ "version": 1, "blocks": [...] }`, the format the email designer saves. Iris sanitizes it on write and on read.

### email_design_set_brand_frame

`PUT /api/v1/email-design/brand-frame`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`.

Replace the email brand frame

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `logo_url` (body, string, required): The public URL of a logo uploaded to the organization’s brand assets, or null for no logo
- `brand_color` (body, string, required): The accent colour, as #rrggbb
- `button_color` (body, string, required): The button colour, as #rrggbb
- `text_color` (body, string, required): The body text colour, as #rrggbb
- `background_color` (body, string, required): The colour behind the email card, as #rrggbb
- `header_layout` (body, string, required, one of `logo_name`, `logo`, `name`): What the header shows: the logo, the name, or both
- `business_name` (body, string, required): The business name in the header
- `business_line` (body, string, required): The line under it, such as the phone
- `footer_text` (body, string, required): The footer line above the unsubscribe link, such as the name and postal address

### email_design_set_default_frame_part

`PUT /api/v1/email-design/frame-parts/{partId}/default`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`.

Make a header or footer the default

- `partId` (path, string uuid, required)

### email_design_update_frame_part

`PATCH /api/v1/email-design/frame-parts/{partId}`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`.

Change a header or footer

- `partId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string): Unique among the organization’s parts of its kind
- `blocks` (body, array of object): The part’s blocks, in the block format of a document’s `blocks`. Iris sanitizes them on write and on read.

### email_design_update_template

`PATCH /api/v1/email-design/templates/{templateId}`. Scope: `email_design:write`. Member: `deny`. Changes: `email_design`.

Change a saved email template

- `templateId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string): Unique in the organization
- `folder` (body, string): The folder the template is filed under. Null, or blank, is Unfiled.
- `document` (body, object): A block document: `{ "version": 1, "blocks": [...] }`, the format the email designer saves. Iris sanitizes it on write and on read.

## Email settings

### email_settings_delete

`DELETE /api/v1/email-settings`. Scope: `email_settings:write`. Member: `deny`. Confirm: required. Changes: `email_settings`.

Delete the email sending settings

### email_settings_get

`GET /api/v1/email-settings`. Scope: `email_settings:read`. Member: `open`.

Get the email sending settings

### email_settings_send_test

`POST /api/v1/email-settings/test`. Scope: `email_settings:write`. Member: `deny`. Confirm: required. Changes: `email_settings`. Idempotent: send `idempotency_key`.

Send a test email

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `to_email` (body, string, required): The address the test email goes to

### email_settings_update

`PUT /api/v1/email-settings`. Scope: `email_settings:write`. Member: `deny`. Confirm: required. Changes: `email_settings`.

Save the email sending settings

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `provider` (body, string, one of `smtp`, `sendgrid`, `mailgun`, `ses`, `gmail`, `outlook`, `yahoo`, `zoho`, `icloud`, `fastmail`, `postmark`, `resend`): The provider Iris sends through
- `enabled` (body, boolean): Whether Iris sends email through this provider
- `from_email` (body, string): The From address of every email
- `from_name` (body, string): The From name
- `signature_html` (body, string): The mailbox signature as HTML. Iris sanitizes it and derives the plain text. Null removes it.
- `reply_to_email` (body, string): The Reply-To address
- `default_reply_forwarding_email` (body, string): Who gets a copy of each reply that reaches the Iris reply gateway
- `smtp_host` (body, string): The SMTP host, for an SMTP provider
- `smtp_port` (body, number): The SMTP port, for an SMTP provider
- `smtp_use_tls` (body, boolean): Whether the SMTP connection uses TLS
- `credentials` (body, object): The provider credential, such as `{ "username", "password" }` for SMTP or `{ "apiKey" }` for an API provider. Iris stores it encrypted and never returns it. Leave it out to keep the stored one.
- `daily_limit` (body, number): The most emails a day
- `hourly_limit` (body, number): The most emails an hour
- `per_recipient_daily_limit` (body, number): The most emails a day to one address

### email_settings_verify_connection

`POST /api/v1/email-settings/verify`. Scope: `email_settings:write`. Member: `deny`. Changes: `email_settings`.

Check the email provider connection

### email_settings_verify_domain

`POST /api/v1/email-settings/domain/verify`. Scope: `email_settings:write`. Member: `deny`. Changes: `email_settings`.

Check the sending domain

## Feedback

### feedback_submit

`POST /api/v1/feedback`. Scope: `feedback:write`. Member: `open`. Changes: `feedback`. Idempotent: send `idempotency_key`.

Send product feedback to the Iris team

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `rating` (body, number): A rating from 1 (poor) to 5 (great)
- `comment` (body, string, required): What the user wants to tell Iris
- `page_context` (body, string): The page of the app the feedback is about

## Fields

### fields_archive

`POST /api/v1/fields/{fieldId}/archive`. Scope: `fields:write`. Member: `action`. Action (`x-iris-action`): `fields.manage`. Confirm: required. Changes: `fields`.

Archive a custom field while keeping its values

- `fieldId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `expected_revision` (body, integer): When supplied, refuse a stale revision with 409.

### fields_create

`POST /api/v1/fields`. Scope: `fields:write`. Member: `action`. Action (`x-iris-action`): `fields.manage`. Changes: `fields`. Idempotent: send `idempotency_key`.

Create a custom field. Contact name clashes return 422 field_builtin_contact_name

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `subject` (body, string, required): The record kind this field describes.
- `label` (body, string, required): Display label. Creation derives a stable key from it.
- `type` (body, string, required, one of `text`, `number`, `money`, `duration`, `date`, `datetime`, `bool`, `choice`, `list`, `relationship`)
- `description` (body, string)
- `format` (body, string, one of `email`, `phone`, `url`, `long_text`, `currency_legacy`)
- `options` (body, array of FieldOptionWriteDto)
  - `key` (body, string, required): Stable stored value. Keep existing keys and archive removed options.
  - `label` (body, string, required)
  - `archived` (body, boolean)
- `cardinality` (body, string, one of `one`, `many`)
- `relationship_subject` (body, string): Target record kind for a relationship field.
- `is_required` (body, boolean)
- `display_order` (body, integer)
- `sensitivity` (body, string, one of `public`, `customer`, `internal`, `restricted`)
- `access_class` (body, string, one of `contact_details`, `contact_profile`, `customer_financial`, `internal_financial`, `private_staff`, `restricted`): OWNER and ADMIN configure the access class.
- `settings` (body, object): Field settings. Calendar sync requires contact_details or no class.

### fields_get

`GET /api/v1/fields/{fieldId}`. Scope: `fields:read`. Member: `action`. Action (`x-iris-action`): `fields.view`.

Get one custom field

- `fieldId` (path, string uuid, required)

### fields_get_usage

`GET /api/v1/fields/{fieldId}/usage`. Scope: `fields:read`. Member: `action`. Action (`x-iris-action`): `fields.manage`.

See what uses a custom field before you archive it, with no names for kinds you cannot read

- `fieldId` (path, string uuid, required)

### fields_list

`GET /api/v1/fields`. Scope: `fields:read`. Member: `action`. Action (`x-iris-action`): `fields.view`.

List the custom fields of each record kind

- `subject` (query, string): Only the fields of this record kind, such as `contact`, `offering` or `staff`.
- `include_archived` (query, boolean): Also list archived fields.

### fields_list_objects

`GET /api/v1/fields/objects/{record_kind}`. Scope: `fields:read`. Member: `action`. Action (`x-iris-action`): `fields.view`.

List the record types and their business labels

- `record_kind` (path, string, required): The record kind, such as `contact`, `offering` or `staff`.

### fields_restore

`POST /api/v1/fields/{fieldId}/restore`. Scope: `fields:write`. Member: `action`. Action (`x-iris-action`): `fields.manage`. Changes: `fields`.

Restore a custom field. Contact name clashes return 422 field_builtin_contact_name

- `fieldId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `expected_revision` (body, integer): When supplied, refuse a stale revision with 409.

### fields_update

`PATCH /api/v1/fields/{fieldId}`. Scope: `fields:write`. Member: `action`. Action (`x-iris-action`): `fields.manage`. Changes: `fields`.

Change a custom field. Contact name clashes return 422 field_builtin_contact_name

- `fieldId` (path, string uuid, required)
- `subject` (body, string): The record kind this field describes.
- `label` (body, string): Display label. Creation derives a stable key from it.
- `type` (body, string, one of `text`, `number`, `money`, `duration`, `date`, `datetime`, `bool`, `choice`, `list`, `relationship`)
- `description` (body, string)
- `format` (body, string, one of `email`, `phone`, `url`, `long_text`, `currency_legacy`)
- `options` (body, array of FieldOptionWriteDto)
  - `key` (body, string, required): Stable stored value. Keep existing keys and archive removed options.
  - `label` (body, string, required)
  - `archived` (body, boolean)
- `cardinality` (body, string, one of `one`, `many`)
- `relationship_subject` (body, string): Target record kind for a relationship field.
- `is_required` (body, boolean)
- `display_order` (body, integer)
- `sensitivity` (body, string, one of `public`, `customer`, `internal`, `restricted`)
- `access_class` (body, string, one of `contact_details`, `contact_profile`, `customer_financial`, `internal_financial`, `private_staff`, `restricted`): OWNER and ADMIN configure the access class.
- `settings` (body, object): Field settings. Calendar sync requires contact_details or no class.
- `expected_revision` (body, integer, required): Revision returned by fields_get. A stale revision answers 409.
- `key` (body, string): Immutable stored key. A change is rejected.

### fields_update_object

`PATCH /api/v1/fields/objects/{record_kind}`. Scope: `fields:write`. Member: `action`. Action (`x-iris-action`): `fields.manage`. Changes: `fields`.

Configure a record kind’s business labels and owner field

- `record_kind` (path, string, required): The record kind, such as `contact`, `offering` or `staff`.
- `singular_label` (body, string): Required with plural_label when this kind has no labels yet.
- `plural_label` (body, string)
- `owner_field_id` (body, string uuid): An active staff relationship field on this kind. Null clears it.

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

`GET /api/v1/forms/{formId}`. Scope: `forms:read`. Member: `action`. Action (`x-iris-action`): `forms.view`.

Get one form with its fields

- `formId` (path, string uuid, required)

### forms_list

`GET /api/v1/forms`. Scope: `forms:read`. Member: `action`. Action (`x-iris-action`): `forms.view`.

List the organization’s forms

### forms_list_submissions

`GET /api/v1/forms/{formId}/submissions`. Scope: `forms:read`. Member: `action`. Action (`x-iris-action`): `forms.manage`.

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

## Groups

### group_type_labels_archive

`POST /api/v1/group-type-labels/{labelId}/archive`. Scope: `groups:write`. Member: `deny`. Confirm: required. Changes: `groups`.

Archive a nondefault group type label

- `labelId` (path, string uuid, required)

### group_type_labels_create

`POST /api/v1/group-type-labels`. Scope: `groups:write`. Member: `deny`. Changes: `groups`.

Create a business name for a group type

- `type` (body, string, required, one of `container`, `team`, `territory`, `asset`, `contact_group`)
- `singular_label` (body, string, required)
- `plural_label` (body, string, required)

### group_type_labels_list

`GET /api/v1/group-type-labels`. Scope: `groups:read`. Member: `action`. Action (`x-iris-action`): `groups.metadata`.

List the names the business uses for each group type

- `include_archived` (query, boolean): Also list archived rows. An archived row keeps its id, and nothing it names is cancelled.

### group_type_labels_update

`PATCH /api/v1/group-type-labels/{labelId}`. Scope: `groups:write`. Member: `deny`. Changes: `groups`.

Rename a group type label

- `labelId` (path, string uuid, required)
- `singular_label` (body, string)
- `plural_label` (body, string)

### groups_add_downtime

`POST /api/v1/groups/{groupId}/downtime`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Mark an asset unavailable for a time window

- `groupId` (path, string uuid, required)
- `starts_at` (body, string date-time, required)
- `ends_at` (body, string date-time, required)
- `reason` (body, string, required)

### groups_add_member

`POST /api/v1/groups/{groupId}/members`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Add a staff or contact membership

- `groupId` (path, string uuid, required)
- `member_kind` (body, string, required, one of `staff`, `contact`)
- `member_id` (body, string uuid, required)
- `until` (body, string date-time): When this membership expires. Null or omitted means no expiry.
- `label` (body, string)
- `since` (body, string date-time)

### groups_archive

`POST /api/v1/groups/{groupId}/archive`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Confirm: required. Changes: `groups`.

Archive a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### groups_create

`POST /api/v1/groups`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Create a container, team, territory, asset or contact group

- `type` (body, string, required, one of `container`, `team`, `territory`, `asset`, `contact_group`)
- `label` (body, string, required)
- `parent_group_id` (body, string uuid)
- `home_location_id` (body, string uuid)
- `type_label_id` (body, string uuid)
- `bookable` (body, boolean)

### groups_end_downtime

`POST /api/v1/groups/{groupId}/downtime/end`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

End an asset downtime window

- `groupId` (path, string uuid, required)
- `downtime_id` (body, string uuid, required)

### groups_end_member

`POST /api/v1/groups/{groupId}/members/end`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Confirm: required. Changes: `groups`.

End the earliest current staff or contact membership

- `groupId` (path, string uuid, required)
- `member_kind` (body, string, required, one of `staff`, `contact`)
- `member_id` (body, string uuid, required)
- `until` (body, string date-time): End the earliest current membership row at this time, default now. Later renewal rows remain.

### groups_get

`GET /api/v1/groups/{groupId}`. Scope: `groups:read`. Member: `action`. Action (`x-iris-action`): `group.view`.

Read one group

- `groupId` (path, string uuid, required)

### groups_list

`GET /api/v1/groups`. Scope: `groups:read`. Member: `action`. Action (`x-iris-action`): `group.list`.

List the business’s groups: containers, teams, territories, assets and contact groups

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `type` (query, string, one of `container`, `team`, `territory`, `asset`, `contact_group`): Only groups of this type
- `include_archived` (query, boolean): Also list archived rows. An archived row keeps its id, and nothing it names is cancelled.

### groups_list_downtime

`GET /api/v1/groups/{groupId}/downtime`. Scope: `groups:read`. Member: `action`. Action (`x-iris-action`): `group.list`.

List downtime windows for an asset

- `groupId` (path, string uuid, required)
- `include_ended` (query, boolean): Include downtime windows that have ended.

### groups_list_members

`GET /api/v1/groups/{groupId}/members`. Scope: `groups:read`. Member: `action`. Action (`x-iris-action`): `group.view`.

List a group’s staff or contact memberships

- `groupId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `include_ended` (query, boolean): Include ended memberships. A membership is current while until is null, or later than both now and since.

### groups_move

`POST /api/v1/groups/{groupId}/move`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Move a group under a parent or to the top level

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `parent_group_id` (body, string uuid, required)

### groups_restore

`POST /api/v1/groups/{groupId}/restore`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Restore a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### groups_set_links

`PUT /api/v1/groups/{groupId}/links`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Replace all links of a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `links` (body, array of GroupLinkWriteDto, required)
  - `to_group_id` (body, string uuid, required)
  - `link_kind` (body, string, required, one of `serves_territory`, `uses_asset`)

### groups_set_owners

`PUT /api/v1/groups/{groupId}/owners`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Replace all owners of a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `contact_ids` (body, array of string uuid, required)

### groups_set_postal_codes

`PUT /api/v1/groups/{groupId}/postal-codes`. Scope: `groups:write`. Member: `deny`. Changes: `groups`.

Replace all postal codes of a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `postal_codes` (body, array of GroupPostalCodeWriteDto, required)
  - `country_code` (body, string, required)
  - `postal_code` (body, string, required)

### groups_set_priority_order

`PUT /api/v1/groups/{groupId}/priority-order`. Scope: `groups:write`. Member: `deny`. Changes: `groups`.

Set the complete group priority order at a home location

- `groupId` (path, string uuid, required)
- `ids` (body, array of string uuid, required): Every group of the target group’s type and home location, in order. Priority becomes 1024 times rank.

### groups_set_serves

`PUT /api/v1/groups/{groupId}/serves`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Replace all serves of a group

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required)

### groups_update

`PATCH /api/v1/groups/{groupId}`. Scope: `groups:write`. Member: `deny`. Manager power: `groups`. Changes: `groups`.

Change a group’s name, home location, type label or booking flag

- `groupId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `label` (body, string)
- `home_location_id` (body, string uuid)
- `type_label_id` (body, string uuid)
- `bookable` (body, boolean)

## Integrations

### ghl_apply_relink

`POST /api/v1/integrations/ghl/mappings/{mappingId}/relink/{reviewId}/apply`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Move a GoHighLevel link to another contact

- `mappingId` (path, string uuid, required)
- `reviewId` (path, string uuid, required): The `id` from `ghl_preview_relink`

### ghl_begin_reconciliation

`POST /api/v1/integrations/ghl/mappings/{mappingId}/reconciliation`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`. Idempotent: send `idempotency_key`.

Find and apply GoHighLevel changes the sync missed

- `mappingId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### ghl_begin_sync

`POST /api/v1/integrations/ghl/mappings/{mappingId}/start`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`. Idempotent: send `idempotency_key`.

Start the first transfer and the sync

- `mappingId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `preview_id` (body, string uuid, required): The `id` of the completed preview run the user reviewed

### ghl_confirm_appointment

`POST /api/v1/integrations/ghl/mappings/{mappingId}/appointments/review/{operationId}/confirm`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Confirm an appointment that exists in GoHighLevel

- `mappingId` (path, string uuid, required)
- `operationId` (path, string uuid, required): An `id` from `ghl_list_appointment_reviews`
- `revision` (body, string, required): The `revision` of the review item
- `ghl_appointment_id` (body, string, required): The GoHighLevel appointment the user found

### ghl_continue_transfer

`POST /api/v1/integrations/ghl/mappings/{mappingId}/resume`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`. Idempotent: send `idempotency_key`.

Continue a stopped transfer run

- `mappingId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `run_id` (body, string uuid, required): The `id` of the paused or failed transfer run

### ghl_disconnect

`POST /api/v1/integrations/ghl/mappings/{mappingId}/disconnect`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`.

Disconnect a mapping

- `mappingId` (path, string uuid, required)

### ghl_freeze_cutover

`POST /api/v1/integrations/ghl/mappings/{mappingId}/cutover/freeze`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`.

Freeze writes for a migration cutover

- `mappingId` (path, string uuid, required)
- `cutover_id` (body, string uuid, required): The cutover `id` from `ghl_list_cutovers` or `ghl_preview_cutover`

### ghl_get_appointment_settings

`GET /api/v1/integrations/ghl/mappings/{mappingId}/appointments/config`. Scope: `integrations:read`. Member: `scoped`.

Get the appointment sync settings of a mapping

- `mappingId` (path, string uuid, required)

### ghl_get_association_catalog

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/associations/catalog`. Scope: `integrations:read`. Member: `deny`.

List the GoHighLevel owners and companies

- `mappingId` (path, string uuid, required)

### ghl_get_associations

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/associations`. Scope: `integrations:read`. Member: `deny`.

Get the owner and company pairs of a mapping

- `mappingId` (path, string uuid, required)

### ghl_get_authorization

`GET /api/v1/integrations/ghl/authorization`. Scope: `integrations:read`. Member: `deny`.

Get the link that connects GoHighLevel

- `capabilities` (query, array of string, one of `appointments`, `opportunities`, `notesTasks`, `customFields`, `affiliations`, `conversations`, `callSummaries`, `workflows`, `agencyAuthorization`): The optional capabilities to ask GoHighLevel for, comma-separated. Omit it for contacts only. Asking does not turn a capability on.

### ghl_get_conversation_context

`GET /api/v1/integrations/ghl/mappings/{mappingId}/engagement/contacts/{contactId}/context`. Scope: `integrations:read`. Member: `scoped`.

Read a contact’s recent GoHighLevel conversations

- `mappingId` (path, string uuid, required)
- `contactId` (path, string uuid, required): An Iris contact linked to GoHighLevel

### ghl_get_custom_field_catalog

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/custom-fields/catalog`. Scope: `integrations:read`. Member: `deny`.

List the GoHighLevel contact fields

- `mappingId` (path, string uuid, required)

### ghl_get_custom_fields

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/custom-fields`. Scope: `integrations:read`. Member: `deny`.

Get the custom field pairs of a mapping

- `mappingId` (path, string uuid, required)

### ghl_get_engagement_settings

`GET /api/v1/integrations/ghl/mappings/{mappingId}/engagement/config`. Scope: `integrations:read`. Member: `scoped`.

Get the engagement settings of a mapping

- `mappingId` (path, string uuid, required)

### ghl_get_mapping

`GET /api/v1/integrations/ghl/mappings/{mappingId}`. Scope: `integrations:read`. Member: `scoped`.

Get one GoHighLevel location mapping

- `mappingId` (path, string uuid, required)

### ghl_get_object_catalog

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/catalog`. Scope: `integrations:read`. Member: `deny`.

List the GoHighLevel pipelines, stages and owners

- `mappingId` (path, string uuid, required)

### ghl_get_object_settings

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/settings`. Scope: `integrations:read`. Member: `deny`.

Get the opportunity, note and task settings of a mapping

- `mappingId` (path, string uuid, required)

### ghl_get_review_options

`GET /api/v1/integrations/ghl/mappings/{mappingId}/review`. Scope: `integrations:read`. Member: `deny`.

List the Iris contacts a preview result may link to

- `mappingId` (path, string uuid, required)
- `preview_id` (query, string uuid, required): The `id` of the preview run
- `object_id` (query, string, required): The `object_id` of a preview result to review

### ghl_get_setup_options

`GET /api/v1/integrations/ghl/setup-options`. Scope: `integrations:read`. Member: `deny`.

List the locations you can pair

- `environment` (query, string, one of `production`, `staging`, `develop`, `ci`, `local`)

### ghl_get_status

`GET /api/v1/integrations/ghl/status`. Scope: `integrations:read`. Member: `scoped`.

Get the GoHighLevel connection status

### ghl_list_appointment_options

`GET /api/v1/integrations/ghl/mappings/{mappingId}/appointments/options`. Scope: `integrations:read`. Member: `scoped`.

List the GoHighLevel calendars a mapping can use

- `mappingId` (path, string uuid, required)

### ghl_list_appointment_reviews

`GET /api/v1/integrations/ghl/mappings/{mappingId}/appointments/review`. Scope: `integrations:read`. Member: `scoped`.

List the appointment work held for review

- `mappingId` (path, string uuid, required)

### ghl_list_conflicts

`GET /api/v1/integrations/ghl/conflicts`. Scope: `integrations:read`. Member: `scoped`.

List the open sync conflicts

### ghl_list_contact_recovery

`GET /api/v1/integrations/ghl/mappings/{mappingId}/contact-recovery`. Scope: `integrations:read`. Member: `deny`.

List the contact writes held for review

- `mappingId` (path, string uuid, required)

### ghl_list_cutovers

`GET /api/v1/integrations/ghl/mappings/{mappingId}/cutover`. Scope: `integrations:read`. Member: `deny`.

List the migration cutovers of a mapping

- `mappingId` (path, string uuid, required)

### ghl_list_engagement_reviews

`GET /api/v1/integrations/ghl/mappings/{mappingId}/engagement/review`. Scope: `integrations:read`. Member: `scoped`.

List the summaries and workflow handoffs held for review

- `mappingId` (path, string uuid, required)

### ghl_list_enrichment_recovery

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/enrichment-recovery/{kind}`. Scope: `integrations:read`. Member: `deny`.

List the custom field or association writes held for review

- `mappingId` (path, string uuid, required)
- `kind` (path, string, required, one of `customFields`, `associations`)
- `offset` (query, number)

### ghl_list_object_recovery

`GET /api/v1/integrations/ghl/mappings/{mappingId}/objects/recovery`. Scope: `integrations:read`. Member: `deny`.

List the opportunity, note and task work held for review

- `mappingId` (path, string uuid, required)
- `offset` (query, number)

### ghl_list_reconciliations

`GET /api/v1/integrations/ghl/mappings/{mappingId}/reconciliation`. Scope: `integrations:read`. Member: `deny`.

List the reconciliation runs of a mapping

- `mappingId` (path, string uuid, required)

### ghl_list_relink_options

`GET /api/v1/integrations/ghl/mappings/{mappingId}/relink/options`. Scope: `integrations:read`. Member: `deny`.

List the contact links and contacts a relink can use

- `mappingId` (path, string uuid, required)
- `page` (query, number)

### ghl_list_run_outcomes

`GET /api/v1/integrations/ghl/mappings/{mappingId}/runs/{runId}/outcomes`. Scope: `integrations:read`. Member: `scoped`.

List the outcomes of a transfer run

- `mappingId` (path, string uuid, required)
- `runId` (path, string uuid, required): A run `id` from `ghl_list_runs`
- `page` (query, number)

### ghl_list_run_results

`GET /api/v1/integrations/ghl/mappings/{mappingId}/runs/{runId}/results`. Scope: `integrations:read`. Member: `scoped`.

List the results of a preview run

- `mappingId` (path, string uuid, required)
- `runId` (path, string uuid, required): A run `id` from `ghl_list_runs`
- `page` (query, number)

### ghl_list_runs

`GET /api/v1/integrations/ghl/mappings/{mappingId}/runs`. Scope: `integrations:read`. Member: `scoped`.

List the transfer runs of a mapping

- `mappingId` (path, string uuid, required)

### ghl_list_summary_receipts

`GET /api/v1/integrations/ghl/mappings/{mappingId}/engagement/summary-receipts`. Scope: `integrations:read`. Member: `scoped`.

List the call summaries posted to GoHighLevel

- `mappingId` (path, string uuid, required)

### ghl_list_workflow_options

`GET /api/v1/integrations/ghl/mappings/{mappingId}/engagement/workflow-options`. Scope: `integrations:read`. Member: `deny`.

List the GoHighLevel workflows a handoff can start

- `mappingId` (path, string uuid, required)

### ghl_pause

`POST /api/v1/integrations/ghl/mappings/{mappingId}/pause`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Pause the sync of a mapping

- `mappingId` (path, string uuid, required)

### ghl_preview_cutover

`POST /api/v1/integrations/ghl/mappings/{mappingId}/cutover/preview`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`. Idempotent: send `idempotency_key`.

Preview a migration cutover

- `mappingId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### ghl_preview_mapping

`POST /api/v1/integrations/ghl/mappings/preview`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`. Idempotent: send `idempotency_key`.

Pair a location and preview the first transfer

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `connection_id` (body, string uuid, required): The `connectionId` of a location from `ghl_get_setup_options`
- `grant_id` (body, string uuid, required): The `grantId` of the same GoHighLevel location
- `iris_location_id` (body, string uuid, required): An eligible Iris location from `ghl_get_setup_options`
- `ghl_location_id` (body, string, required): The `id` of the GoHighLevel location
- `environment` (body, string, required, one of `production`, `staging`, `develop`, `ci`, `local`)

### ghl_preview_relink

`POST /api/v1/integrations/ghl/mappings/{mappingId}/relink/preview`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Preview moving a GoHighLevel link to another contact

- `mappingId` (path, string uuid, required)
- `link_id` (body, string uuid, required): A link `id` from `ghl_list_relink_options`
- `target_contact_id` (body, string uuid, required): A contact `id` from `ghl_list_relink_options`
- `remote_id` (body, string, required): The GoHighLevel contact id

### ghl_reconcile_contact

`POST /api/v1/integrations/ghl/mappings/{mappingId}/contact-recovery/{operationId}/reconcile`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Check a held contact write in GoHighLevel

- `mappingId` (path, string uuid, required)
- `operationId` (path, string uuid, required): An `id` from `ghl_list_contact_recovery`
- `remote_id` (body, string): The GoHighLevel contact id, when a create lost its answer and the user found the contact

### ghl_reconcile_enrichment

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/objects/enrichment-recovery/{kind}/{jobId}`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Check a held custom field or association write in GoHighLevel

- `mappingId` (path, string uuid, required)
- `kind` (path, string, required, one of `customFields`, `associations`)
- `jobId` (path, string uuid, required): A recovery item `id`
- `expected_revision` (body, string, required): The `revision` of the recovery item, exactly as listed

### ghl_reconcile_object

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/objects/recovery/{jobId}`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Link a held record to the GoHighLevel object the user found

- `mappingId` (path, string uuid, required)
- `jobId` (path, string uuid, required): A recovery item `id`
- `expected_revision` (body, number, required): The `source_revision` of the recovery item
- `remote_id` (body, string, required): The existing GoHighLevel object the user picked

### ghl_reconnect

`POST /api/v1/integrations/ghl/mappings/{mappingId}/reconnect`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Turn the sync of a mapping back on

- `mappingId` (path, string uuid, required)

### ghl_recover_rejected_create

`POST /api/v1/integrations/ghl/mappings/{mappingId}/runs/{runId}/recover-rejected-create`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`. Idempotent: send `idempotency_key`.

Create again a contact GoHighLevel rejected

- `mappingId` (path, string uuid, required)
- `runId` (path, string uuid, required): A run `id` from `ghl_list_runs`
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `outbound_operation_id` (body, string uuid, required): The `recoverRejectedOperationId` of a transfer outcome
- `confirmed_ghl_location_id` (body, string, required): The `ghlLocationId` of the outcomes page, which the user confirmed

### ghl_refresh_preview

`POST /api/v1/integrations/ghl/mappings/{mappingId}/preview`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`. Idempotent: send `idempotency_key`.

Run a new preview of a mapping

- `mappingId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### ghl_resolve_conflict

`POST /api/v1/integrations/ghl/conflicts/{conflictId}/resolve`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`.

Settle a sync conflict

- `conflictId` (path, string uuid, required)
- `resolution` (body, string, required, one of `resolved_iris`, `resolved_ghl`, `resolved_manual`)
- `value` (body, string): The value both sides take, for `resolved_manual` only. Null clears the field.

### ghl_resolve_engagement_review

`POST /api/v1/integrations/ghl/mappings/{mappingId}/engagement/review/{operationId}/resolve`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Record what happened to a held summary or handoff

- `mappingId` (path, string uuid, required)
- `operationId` (path, string uuid, required): An `id` from `ghl_list_engagement_reviews`
- `revision` (body, string, required): The `source_revision` of the review item
- `outcome` (body, string, required, one of `confirmed`, `no_effect`)
- `receipt` (body, string, required): What the user saw in GoHighLevel

### ghl_retry_contact

`POST /api/v1/integrations/ghl/mappings/{mappingId}/runs/{runId}/retry-contact`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`. Idempotent: send `idempotency_key`.

Retry one contact that failed to transfer from GoHighLevel

- `mappingId` (path, string uuid, required)
- `runId` (path, string uuid, required): A run `id` from `ghl_list_runs`
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `inbound_event_id` (body, string uuid, required): The `retryInboundEventId` of a transfer outcome

### ghl_review_contact

`POST /api/v1/integrations/ghl/mappings/{mappingId}/review`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Decide how a previewed contact transfers

- `mappingId` (path, string uuid, required)
- `preview_id` (body, string uuid, required): The `id` of the preview run
- `object_id` (body, string, required): The `object_id` of a preview result to review
- `decision` (body, string, required, one of `link_existing`, `create_distinct`, `skip`)
- `iris_contact_id` (body, string uuid): The Iris contact to link, for `link_existing`

### ghl_rollback_cutover

`POST /api/v1/integrations/ghl/mappings/{mappingId}/cutover/rollback`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`.

Roll back a migration cutover

- `mappingId` (path, string uuid, required)
- `cutover_id` (body, string uuid, required): The cutover `id` from `ghl_list_cutovers` or `ghl_preview_cutover`

### ghl_update_appointment_settings

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/appointments/config`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Change the appointment sync of a mapping

- `mappingId` (path, string uuid, required)
- `enabled` (body, boolean, required)
- `calendar_mappings` (body, object, required): An `irisCalendars` `id` to a GoHighLevel calendar `id`, both from `ghl_list_appointment_options`
- `staff_mappings` (body, object, required): An `irisCalendars` `id` to a GoHighLevel user id from `ghlUsers` of `ghl_list_appointment_options`. Each key must also be a key of `calendar_mappings`. Send `{}` for none.

### ghl_update_associations

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/objects/associations`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Change the owner and company pairs of a mapping

- `mappingId` (path, string uuid, required)
- `expected_version` (body, number, required): The settings `version` from `ghl_get_associations`, or 0 the first time
- `mappings` (body, object, required): `owners` and `businesses`, each a list of `{ irisId, ghlId }` pairs, as `ghl_get_associations` shows them

### ghl_update_capabilities

`PATCH /api/v1/integrations/ghl/mappings/{mappingId}/capabilities`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Choose what a mapping syncs

- `mappingId` (path, string uuid, required)
- `capabilities` (body, object, required): Every capability as `ghl_get_mapping` shows it: `appointments`, `opportunities`, `notes`, `tasks`, `associations`, `customFields`, `conversations`, `workflows`. A missing one counts as false.
- `expected_generation` (body, number, required): The mapping’s `connectionGeneration` from `ghl_get_mapping`

### ghl_update_custom_fields

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/objects/custom-fields`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Change the custom field pairs of a mapping

- `mappingId` (path, string uuid, required)
- `expected_version` (body, number, required): The settings `version` from `ghl_get_custom_fields`, or 0 the first time
- `fields` (body, array of GhlCustomFieldPairInputDto, required): One-to-one pairs of an Iris custom field and a GoHighLevel field of a compatible type
  - `irisFieldId` (body, string uuid, required)
  - `ghlFieldId` (body, string, required)

### ghl_update_engagement_settings

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/engagement/config`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Change the engagement settings of a mapping

- `mappingId` (path, string uuid, required)
- `conversations` (body, boolean, required)
- `publish_call_summaries` (body, boolean, required)
- `workflows` (body, boolean, required)
- `workflow_mappings` (body, array of GhlWorkflowMappingInputDto, required)
  - `eventKey` (body, string, required, one of `call.completed`, `appointment.created`, `appointment.rescheduled`, `appointment.cancelled`)
  - `workflowId` (body, string, required)
  - `enabled` (body, boolean, required)
- `expected_generation` (body, number, required): The `generation` of the settings from `ghl_get_engagement_settings`

### ghl_update_object_settings

`PUT /api/v1/integrations/ghl/mappings/{mappingId}/objects/settings`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Change the opportunity, note and task settings of a mapping

- `mappingId` (path, string uuid, required)
- `expected_version` (body, number, required): The settings `version` from `ghl_get_object_settings`, or 0 the first time
- `mappings` (body, object, required): `version` (the next version), `pipelines` (each `{ irisId, ghlId, stages: [{ irisId, ghlId }] }`) and `owners` (`{ irisId, ghlId }` pairs)
- `allow_creates` (body, array of string, required, one of `opportunities`, `notes`, `tasks`): The kinds Iris may create in GoHighLevel

### google_calendar_choose_my_calendar

`PUT /api/v1/integrations/google-calendar/me/calendar`. Scope: `integrations:write`. Member: `open`. Changes: `integrations`.

Choose which of your Google calendars Iris reads

- `calendar_id` (body, string, required): The `id` of one of your own calendars from `google_calendar_list_my_calendars`

### google_calendar_disconnect

`DELETE /api/v1/integrations/google-calendar/locations/{locationId}`. Scope: `integrations:write`. Member: `deny`. Manager power: `location_settings`. Confirm: required. Changes: `integrations`.

Disconnect a location’s Google Calendar

- `locationId` (path, string uuid, required): An Iris location `id`

### google_calendar_disconnect_team_member

`DELETE /api/v1/integrations/google-calendar/team-members/{teamMemberId}`. Scope: `integrations:write`. Member: `open`. Confirm: required. Changes: `integrations`.

Disconnect a team member’s own Google Calendar

- `teamMemberId` (path, string uuid, required): A team member `id` from `locations_booking_options`

### google_calendar_get_status

`GET /api/v1/integrations/google-calendar/locations/{locationId}`. Scope: `integrations:read`. Member: `scoped`.

Get a location’s Google Calendar connection

- `locationId` (path, string uuid, required): An Iris location `id`

### google_calendar_get_team_member

`GET /api/v1/integrations/google-calendar/team-members/{teamMemberId}`. Scope: `integrations:read`. Member: `open`.

Get a team member’s own Google Calendar connection

- `teamMemberId` (path, string uuid, required): A team member `id` from `locations_booking_options`

### google_calendar_list_my_calendars

`GET /api/v1/integrations/google-calendar/me/calendars`. Scope: `integrations:read`. Member: `open`.

List your own Google calendars

### google_calendar_sync

`POST /api/v1/integrations/google-calendar/locations/{locationId}/sync`. Scope: `integrations:write`. Member: `scoped`. Changes: `integrations`, `calendar`. Idempotent: send `idempotency_key`.

Sync a location’s Google Calendar now

- `locationId` (path, string uuid, required): An Iris location `id`
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### hubspot_approve_locations

`PUT /api/v1/integrations/hubspot/locations`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Choose the locations whose contacts sync with HubSpot

- `location_ids` (body, array of string uuid, required): The active Iris locations whose contacts sync

### hubspot_disconnect

`DELETE /api/v1/integrations/hubspot/connection`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`.

Disconnect HubSpot

### hubspot_get_mapping_catalog

`GET /api/v1/integrations/hubspot/mappings/catalog`. Scope: `integrations:read`. Member: `deny`.

List the fields a HubSpot contact mapping may pair

### hubspot_get_status

`GET /api/v1/integrations/hubspot/status`. Scope: `integrations:read`. Member: `deny`.

Get the HubSpot connection and sync status

### hubspot_list_assessment_rows

`GET /api/v1/integrations/hubspot/assessments/{assessmentId}/rows`. Scope: `integrations:read`. Member: `deny`.

List what an assessment found for each contact

- `assessmentId` (path, string uuid, required): The assessment `id` from `hubspot_get_status`
- `side` (query, string, one of `iris`, `hubspot`): Which contact set to read
- `cursor` (query, string): The `nextCursor` of the page before

### hubspot_list_issues

`GET /api/v1/integrations/hubspot/issues`. Scope: `integrations:read`. Member: `deny`.

List the HubSpot contact sync issues

- `cursor` (query, string): The `nextCursor` of the page before

### hubspot_pause_sync

`POST /api/v1/integrations/hubspot/sync/pause`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Pause the HubSpot contact sync

### hubspot_resolve_issue

`POST /api/v1/integrations/hubspot/issues/{issueId}/resolve`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`, `contacts`.

Resolve a HubSpot contact sync issue

- `issueId` (path, string uuid, required): An issue `id` from `hubspot_list_issues`
- `choice` (body, string, required, one of `iris`, `hubspot`, `detach`, `retry`, `link`, `route`): `iris` or `hubspot` keeps that side’s value of a conflict, `detach` unlinks the pair, `retry` tries again, `link` links two records, `route` sends the contact to `location_id`
- `version` (body, string, required): The issue’s `version` from `hubspot_list_issues`. A changed issue answers 409.
- `contact_id` (body, string uuid): With `link`: the Iris contact
- `external_id` (body, string): With `link`: the HubSpot contact id
- `location_id` (body, string uuid): With `route`: one of the issue’s `locationIds`

### hubspot_resume_sync

`POST /api/v1/integrations/hubspot/sync/resume`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`, `contacts`.

Resume the paused HubSpot contact sync

### hubspot_run_assessment

`POST /api/v1/integrations/hubspot/assessments`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`. Idempotent: send `idempotency_key`.

Assess the Iris and HubSpot contacts before a sync

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### hubspot_start_sync

`POST /api/v1/integrations/hubspot/sync/start`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`, `contacts`. Idempotent: send `idempotency_key`.

Start the HubSpot contact sync

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `assessment_id` (body, string uuid, required): The `id` of the ready assessment the user reviewed, from `hubspot_get_status`

### hubspot_update_mappings

`PUT /api/v1/integrations/hubspot/mappings`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Save the HubSpot contact field mappings

- `mappings` (body, array of HubSpotContactMappingInputDto, required): Every contact mapping. It replaces the saved set.
  - `iris` (body, string, required): `email`, `phone_number`, `display_name`, or `field:<key>` for an Iris custom field from `hubspot_get_mapping_catalog`
  - `hubspot` (body, string, required): The `name` of a HubSpot contact property from `hubspot_get_mapping_catalog`
  - `type` (body, string, required, one of `text`, `number`, `boolean`, `date`)

### integrations_list

`GET /api/v1/integrations`. Scope: `integrations:read`. Member: `deny`.

List connected provider accounts and their sync status

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `provider` (query, string, one of `google_calendar`, `hubspot`, `zapier`, `ghl`, `elevenlabs`, `gmail`, `twilio`, `email_provider`, `stripe`)
- `status` (query, string, one of `active`, `account_unknown`, `paused`, `disconnected`)

### integrations_list_bindings

`GET /api/v1/integrations/bindings`. Scope: `integrations:read`. Member: `deny`.

List the external objects linked to Iris records

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `provider` (query, string, one of `google_calendar`, `hubspot`, `zapier`, `ghl`, `elevenlabs`, `gmail`, `twilio`, `email_provider`, `stripe`)
- `status` (query, string, one of `active`, `account_unknown`, `paused`, `disconnected`)
- `record_kind` (query, string)
- `record_id` (query, string uuid)
- `external_type` (query, string)

### zapier_disconnect

`DELETE /api/v1/integrations/zapier/connection`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`.

Disconnect Zapier

### zapier_get_event_catalog

`GET /api/v1/integrations/zapier/event-catalog`. Scope: `integrations:read`. Member: `open`.

List the events Iris can send to Zapier

### zapier_get_event_config

`GET /api/v1/integrations/zapier/event-config`. Scope: `integrations:read`. Member: `open`.

Get which events Zapier gets

### zapier_get_field_mappings

`GET /api/v1/integrations/zapier/field-mappings`. Scope: `integrations:read`. Member: `open`.

Get the fields Zapier gets for each event

### zapier_get_status

`GET /api/v1/integrations/zapier/status`. Scope: `integrations:read`. Member: `open`.

Get the Zapier connection status

### zapier_rotate_signing_secret

`POST /api/v1/integrations/zapier/signing-secret/rotate`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`.

Replace the Zapier signing secret

### zapier_send_test_event

`POST /api/v1/integrations/zapier/test-events`. Scope: `integrations:write`. Member: `deny`. Confirm: required. Changes: `integrations`. Idempotent: send `idempotency_key`.

Send a test event to Zapier

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `event_key` (body, string, required, one of `crm.contact.created`, `crm.lead.created`, `crm.contact.updated`, `crm.contact.stage_changed`, `crm.contact.deleted`, `crm.interaction.completed`, `crm.note.added`, `crm.contact.tag_added`, `crm.contact.tag_removed`, `appointment.created`, `appointment.rescheduled`, `appointment.cancelled`, `appointment.completed`, `appointment.transitioned`, `sms.message.received`, `sms.message.sent`, `sms.message.delivered`, `sms.message.failed`, `sms.contact.opted_out`, `sms.contact.opted_in`, `call.completed`, `call.transcript_ready`, `phone_line.connected`, `phone_line.disconnected`, `conversation.started`, `conversation.human_takeover_started`, `conversation.human_takeover_ended`, `webchat.session_started`, `agent.went_live`, `sequence.enrollment_created`, `sequence.step_sent`, `sequence.completed`, `sequence.stopped`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`, `audience.member_added`, `audience.member_removed`, `form.submitted`): An event `key` from `zapier_get_event_catalog`
- `payload` (body, object): The payload to send. Leave it out to send the event’s `samplePayload`.

### zapier_update_event_config

`PUT /api/v1/integrations/zapier/event-config`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Turn Zapier events on or off

- `disabled_events` (body, array of string, required): The event keys Zapier stops getting. It replaces the saved set: send `[]` to turn every event on.

### zapier_update_field_mappings

`PUT /api/v1/integrations/zapier/field-mappings`. Scope: `integrations:write`. Member: `deny`. Changes: `integrations`.

Choose the fields Zapier gets for each event

- `mappings` (body, object, required): The mappings by event key. It replaces the saved set: an event left out has no mapping. A field must be one of the event’s `availableFields`.

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

### invitations_resend

`POST /api/v1/invitations/{invitationId}/resend`. Scope: `invitations:write`. Member: `deny`. Confirm: required. Changes: `invitations`. Idempotent: send `idempotency_key`.

Send an invitation again, with a new link

- `invitationId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### invitations_revoke

`DELETE /api/v1/invitations/{invitationId}`. Scope: `invitations:write`. Member: `deny`. Confirm: required. Changes: `invitations`.

Revoke an invitation

- `invitationId` (path, string uuid, required)

## Knowledge base

### knowledge_base_create

`POST /api/v1/agents/{agentId}/knowledge-base`. Scope: `knowledge_base:write`. Member: `deny`. Changes: `knowledge_base`. Idempotent: send `idempotency_key`.

Add a document to an agent’s knowledge base

- `agentId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The document name the agent and the dashboard show
- `type` (body, string, required, one of `text`, `url`): `text`: the document is `text`. `url`: the agent reads the web page at `url`. To add a file, send its text.
- `text` (body, string): The document text. Required when `type` is `text`.
- `url` (body, string): A public web page. Required when `type` is `url`. A private or local address answers 400.

### knowledge_base_delete

`DELETE /api/v1/agents/{agentId}/knowledge-base/{documentId}`. Scope: `knowledge_base:write`. Member: `deny`. Confirm: required. Changes: `knowledge_base`.

Delete a document from an agent’s knowledge base

- `agentId` (path, string uuid, required)
- `documentId` (path, string uuid, required): A document `id` from `knowledge_base_list`

### knowledge_base_generate_suggestions

`POST /api/v1/agents/{agentId}/knowledge-base/suggestions/generate`. Scope: `knowledge_base:write`. Member: `deny`. Changes: `knowledge_base`.

Generate new document suggestions for an agent

- `agentId` (path, string uuid, required)

### knowledge_base_get_suggestions

`GET /api/v1/agents/{agentId}/knowledge-base/suggestions`. Scope: `knowledge_base:read`. Member: `open`.

Get the documents the AI suggests for an agent

- `agentId` (path, string uuid, required)

### knowledge_base_list

`GET /api/v1/agents/{agentId}/knowledge-base`. Scope: `knowledge_base:read`. Member: `open`.

List the documents of an agent’s knowledge base

- `agentId` (path, string uuid, required)

## Locations

### locations_activate

`POST /api/v1/locations/{locationId}/activate`. Scope: `locations:write`. Member: `deny`. Confirm: required. Changes: `locations`. Idempotent: send `idempotency_key`.

Activate a location, which adds it to the subscription

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key returns the first answer and does not run the call again.

### locations_booking_options

`GET /api/v1/locations/{locationId}/booking-options`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

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

`GET /api/v1/locations`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `appointment.list`.

List the locations appointments can be booked at

### locations_set_default

`PUT /api/v1/locations/{locationId}/default`. Scope: `locations:write`. Member: `deny`. Changes: `locations`.

Make an active location the organization’s default

- `locationId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

## Marketing agent

### marketing_agent_answer

`POST /api/v1/marketing-agent/sessions/{sessionId}/answer`. Scope: `marketing_agent:write`. Member: `deny`. Changes: `marketing_agent`.

Answer the questions of a marketing agent session

- `sessionId` (path, string uuid, required)
- `version` (body, number, required): The session’s `version`, from its last read. Another one answers 409.
- `answers` (body, object, required): The answer to each question, keyed by the question `id`
- `message` (body, string): More detail for the plan, such as a change to the last one

### marketing_agent_approve

`POST /api/v1/marketing-agent/sessions/{sessionId}/approve`. Scope: `marketing_agent:write`. Member: `deny`. Confirm: required. Changes: `marketing_agent`, `sequences`.

Approve a marketing agent plan, so its sequence changes run

- `sessionId` (path, string uuid, required)
- `version` (body, number, required): The session’s `version`, from its last read
- `plan_hash` (body, string, required): The session’s `plan_hash`, so you approve the plan you read
- `approved` (body, boolean, required, one of `true`)

### marketing_agent_cancel

`POST /api/v1/marketing-agent/sessions/{sessionId}/cancel`. Scope: `marketing_agent:write`. Member: `deny`. Confirm: required. Changes: `marketing_agent`.

Cancel a marketing agent session

- `sessionId` (path, string uuid, required)

### marketing_agent_get

`GET /api/v1/marketing-agent/sessions/{sessionId}`. Scope: `marketing_agent:read`. Member: `deny`.

Read one of your marketing agent sessions

- `sessionId` (path, string uuid, required)

### marketing_agent_list

`GET /api/v1/marketing-agent/sessions`. Scope: `marketing_agent:read`. Member: `deny`.

List your marketing agent sessions

### marketing_agent_start

`POST /api/v1/marketing-agent/sessions`. Scope: `marketing_agent:write`. Member: `deny`. Confirm: required. Changes: `marketing_agent`. Idempotent: send `idempotency_key`.

Start a marketing agent session with a goal

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `goal` (body, string, required): What the marketing should achieve, in plain words

## MCP

### mcp_request

`POST /api/v1/mcp`. Scope: any live key. Member: `open`.

Send one MCP JSON-RPC message

## Me

### me_get

`GET /api/v1/me`. Scope: any live key. Member: `open`.

Describe the calling API key or connected client, the role it acts at and the locations it reaches

### me_get_permissions

`GET /api/v1/me/permissions`. Scope: any live key. Member: `open`.

Read your effective actions, limits, field classes and role labels

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
- `manager_powers` (body, array of string, required, one of `contacts`, `location_settings`, `sequences`, `staff`, `leader_schedules`, `appointments`, `access_levels`, `groups`, `billing`): The whole set, replacing the current one.

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

## Offerings

### offerings_activate

`POST /api/v1/offerings/{offeringId}/activate`. Scope: `offerings:write`. Member: `deny`. Confirm: required. Changes: `offerings`.

Turn a service on so customers can book it

- `offeringId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### offerings_confirm_price

`POST /api/v1/offerings/{offeringId}/confirm-price`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Confirm an offering price

- `offeringId` (path, string uuid, required)
- `price_display` (body, string, required, one of `exact`, `starting_at`)

### offerings_create

`POST /api/v1/offerings`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`. Idempotent: send `idempotency_key`.

Create a service

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The service name customers see

### offerings_deactivate

`POST /api/v1/offerings/{offeringId}/deactivate`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Turn a service off so customers cannot book it

- `offeringId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### offerings_get

`GET /api/v1/offerings/{offeringId}`. Scope: `offerings:read`. Member: `open`.

Read one service with its resource requirements and bookable groups

- `offeringId` (path, string uuid, required)

### offerings_list

`GET /api/v1/offerings`. Scope: `offerings:read`. Member: `open`.

List services with requirements, bookable groups and staff choice

### offerings_set_add_ons

`PUT /api/v1/offerings/{offeringId}/add-ons`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Replace an offering add-on list

- `offeringId` (path, string uuid, required)
- `add_ons` (body, array of OfferingAddOnInputDto, required)
  - `id` (body, string uuid)
  - `label` (body, string, required)
  - `price_kind` (body, string, required, one of `fixed`, `per_unit`)
  - `price_minor` (body, number, required)
  - `price_currency` (body, string, required)
  - `price_unit_label` (body, string)
  - `extra_minutes` (body, number)
  - `display_order` (body, number)

### offerings_set_bookable_groups

`PUT /api/v1/offerings/{offeringId}/bookable-groups`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Replace the bookable teams and assets for a service

- `offeringId` (path, string uuid, required)
- `bookable_groups` (body, array of OfferingBookableGroupDto, required): Replace the complete set of bookable teams and assets
  - `group_id` (body, string uuid, required)
  - `requirement_id` (body, string uuid): Required for assets. Must name a requirement of this offering.

### offerings_set_locations

`PUT /api/v1/offerings/{offeringId}/locations`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Replace the locations a service is offered at

- `offeringId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required): The complete set of open locations this service is offered at

### offerings_set_options

`PUT /api/v1/offerings/{offeringId}/options`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Replace an offering price options list

- `offeringId` (path, string uuid, required)
- `options` (body, array of OfferingPriceOptionInputDto, required)
  - `id` (body, string uuid)
  - `label` (body, string, required)
  - `price_kind` (body, string, required, one of `fixed`, `per_unit`, `quote`)
  - `price_minor` (body, number)
  - `price_currency` (body, string)
  - `price_unit_label` (body, string)
  - `recurring_basis` (body, string, one of `weekly`, `monthly`, `annually`)
  - `status` (body, string, one of `unconfirmed`, `confirmed`)
  - `source_ce_entity_id` (body, string uuid)

### offerings_set_requirements

`PUT /api/v1/offerings/{offeringId}/requirements`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Replace the staff and asset quantities a service needs

- `offeringId` (path, string uuid, required)
- `requirements` (body, array of OfferingRequirementInputDto, required): Replace the complete set. At most one staff requirement.
  - `id` (body, string uuid): Keep this requirement id when replacing the set
  - `resource_kind` (body, string, required, one of `staff`, `asset`)
  - `quantity` (body, number, required)
  - `label` (body, string)

### offerings_update

`PATCH /api/v1/offerings/{offeringId}`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Change a service name, description, duration or buffers

- `offeringId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `description` (body, string): Null clears it
- `duration_minutes` (body, number): Customer-visible length in minutes. Leave it out to keep it. Null clears it, which also deactivates the service.
- `buffer_before_minutes` (body, number): Minutes blocked before the appointment. Customers do not see it.
- `buffer_after_minutes` (body, number): Minutes blocked after the appointment. Customers do not see it.

### offerings_update_pricing

`PATCH /api/v1/offerings/{offeringId}/pricing`. Scope: `offerings:write`. Member: `deny`. Changes: `offerings`.

Update offering pricing. API price edits require confirmation again

- `offeringId` (path, string uuid, required)
- `price_kind` (body, string, one of `fixed`, `per_unit`, `quote`)
- `price_minor` (body, number)
- `price_currency` (body, string)
- `price_unit_label` (body, string)
- `price_display` (body, string, one of `exact`, `starting_at`)
- `price_status` (body, string, one of `unconfirmed`, `confirmed`): For an API caller, sending unconfirmed sets status to unconfirmed. This is refused if a percentage deposit would remain. Sending confirmed does not confirm a price. Price field changes reset status to unconfirmed. With no price field change, the stored status stays. Use offerings_confirm_price to confirm. A signed-in OWNER or ADMIN in the dashboard keeps the status sent, or the stored status when omitted. For all callers, any edit that would leave a percentage deposit on an unconfirmed price answers percent_deposit_needs_confirmed_price. This includes sending unconfirmed and adding a percentage deposit to an unconfirmed price. A percentage deposit needs a confirmed exact price. To change the price, change the deposit in the same request (deposit_kind none or fixed), or have an owner or admin edit it.
- `deposit_kind` (body, string, one of `none`, `fixed`, `percent`)
- `deposit_minor` (body, number)
- `deposit_ppm` (body, number)
- `booking_policy_id` (body, string uuid): Offering booking policy override; null follows the organization default

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

## Organizations

### organizations_create

`POST /api/v1/organizations`. Scope: `organizations:write`. Member: `open`. Confirm: required. Changes: `organizations`. Idempotent: send `idempotency_key`.

Create a new organization owned by the person behind the credential

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The new organization’s name
- `industry` (body, string, required): A suggested industry or a typed one
- `website_url` (body, string): An http or https URL
- `terms_accepted` (body, boolean, required): The person accepted the Iris privacy policy and terms. Must be true.

## Payment links

### payment_links_cancel

`POST /api/v1/payment-links/{id}/cancel`. Scope: `payment_links:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`.

Revoke an invoice, hold, package or subscription signup link and expire its open Checkout sessions

- `id` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### payment_links_create

`POST /api/v1/payment-links`. Scope: `payment_links:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Create a hosted Checkout link for an invoice, hold deposit, package, or subscription signup

- `Idempotency-Key` (header, string): Organization-wide durable retry key. Must match body idempotency_key when both are supplied.
- `subject_kind` (body, string, required, one of `document`, `hold`, `package`, `subscription_signup`): Accepts document, hold, package, or subscription_signup. Package and signup links require plan_kind, plan_id, currency and bill_to_contact_id. They need an OWNER or ADMIN credential, or one acting on behalf of one. Hold deposits use card only.
- `subject_id` (body, string uuid): The subject ID. Document and hold links require it. Package and subscription_signup links take plan_id instead. For package and subscription_signup links it must equal plan_id. For holds, use the live deposit-gated hold ID. Requests with mixed currencies answer 422 hold_not_payable.
- `plan_kind` (body, string, one of `allowance_plan`, `subscription_plan`)
- `plan_id` (body, string uuid)
- `currency` (body, string)
- `bill_to_contact_id` (body, string uuid)
- `bill_to_group_id` (body, string uuid)
- `issuer` (body, string, one of `iris`, `stripe`)
- `expires_at` (body, string date-time)
- `allow_bank_debit` (body, boolean): For invoice links, omit this field to derive eligibility from the account switch and Stripe ach_debit_payments capability. An explicit true requires both; holds always use card only. The stored value is frozen on the payment attempt.
- `idempotency_key` (body, string): Organization-wide retry key for MCP or REST. REST also accepts Idempotency-Key. If both are supplied, they must match. Replays recheck access and return the same URL. Changed fields answer 409 idempotency_conflict.

### payment_links_get

`GET /api/v1/payment-links/{id}`. Scope: `payment_links:read`. Member: `scoped`.

Get an invoice, hold, package or subscription signup link and its verified payment state

- `id` (path, string uuid, required)

### payment_links_list

`GET /api/v1/payment-links`. Scope: `payment_links:read`. Member: `scoped`.

List invoice, hold, package and subscription signup links at reachable locations for reachable clients

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### payment_links_send

`POST /api/v1/payment-links/{linkId}/send`. Scope: `payment_links:write`. Member: `scoped`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Send a hosted payment link through the billing communication gate

- `linkId` (path, string uuid, required)
- `Idempotency-Key` (header, string): Conversation retry key. Reusing it for the same link returns the previous sent answer.
- `channel` (body, string, one of `sms`, `email`)
- `idempotency_key` (body, string): Retry key. REST also accepts Idempotency-Key, and both values must match when supplied.

## Payments

### payments_allocate

`POST /api/v1/payments/{id}/allocate`. Scope: `payments:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`, `invoices`. Idempotent: send `idempotency_key`.

Allocate payment funds to an issued invoice

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `document_id` (body, string uuid, required)
- `amount_minor` (body, number, required)

### payments_create_claim

`POST /api/v1/payments/claims`. Scope: `payments:write`. Member: `action`. Action (`x-iris-action`): `payments.claim`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Create a payment claim for approval

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `document_id` (body, string uuid)
- `contact_id` (body, string uuid)
- `amount_minor` (body, number, required)
- `currency` (body, string, required)
- `conversation_key` (body, string)
- `note` (body, string)

### payments_get

`GET /api/v1/payments/{id}`. Scope: `payments:read`. Member: `scoped`.

Get a recorded payment

- `id` (path, string uuid, required)

### payments_list

`GET /api/v1/payments`. Scope: `payments:read`. Member: `scoped`.

List recorded payments

### payments_list_returns

`GET /api/v1/payments/{id}/returns`. Scope: `payments:read`. Member: `scoped`.

List the refunds and returns of a payment

- `id` (path, string uuid, required)

### payments_record

`POST /api/v1/payments`. Scope: `payments:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`. Idempotent: send `idempotency_key`.

Record a verified payment

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `amount_minor` (body, number, required)
- `currency` (body, string, required)
- `method` (body, string, required, one of `card`, `wallet`, `bank_debit`, `cash`, `check`, `bank_transfer`, `other`)
- `received_on` (body, string, required)
- `payer_contact_id` (body, string uuid)
- `payer_group_id` (body, string uuid)
- `payer_name` (body, string, required)
- `reference` (body, string)
- `staff_note` (body, string)
- `location_id` (body, string uuid)
- `auto_receipt` (body, boolean)

### payments_record_refund

`POST /api/v1/payments/{id}/refunds/record`. Scope: `payments:write`. Member: `action`. Action (`x-iris-action`): `payments.refund`. Confirm: required. Changes: `payments`, `invoices`, `approvals`. Idempotent: send `idempotency_key`.

Record a refund already made outside Iris

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this refund, unique within the organization: any credential of the organization that sends it gets the same return. A retry with the same key refunds nothing more and answers the same return. The same key with another payment, amount, reason or approval is a 409 `idempotency_conflict`.
- `amount_minor` (body, number, required): Minor units in the payment currency. A bank debit refunds only in full.
- `currency` (body, string, required): The payment currency. The refund limit is checked in it.
- `reason` (body, string, required): Why the money goes back. Staff see it on the return.
- `approval_request_id` (body, string uuid): An approved refund approval request, filed with payments_request_refund. Required when the caller needs approval to refund this amount.

### payments_release_allocation

`POST /api/v1/payments/{id}/release-allocation`. Scope: `payments:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`, `invoices`. Idempotent: send `idempotency_key`.

Release an invoice allocation

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `amount_minor` (body, number, required)
- `reason` (body, string)

### payments_request_refund

`POST /api/v1/payments/{id}/refunds`. Scope: `payments:write`. Member: `action`. Action (`x-iris-action`): `payments.refund`. Confirm: required. Changes: `payments`, `invoices`, `approvals`. Idempotent: send `idempotency_key`.

Refund money from a payment

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this refund, unique within the organization: any credential of the organization that sends it gets the same return. A retry with the same key refunds nothing more and answers the same return. The same key with another payment, amount, reason or approval is a 409 `idempotency_conflict`.
- `amount_minor` (body, number, required): Minor units in the payment currency. A bank debit refunds only in full.
- `currency` (body, string, required): The payment currency. The refund limit is checked in it.
- `reason` (body, string, required): Why the money goes back. Staff see it on the return.
- `approval_request_id` (body, string uuid): An approved refund approval request to execute. Leave it out to request a refund; a refund that needs approval files one.

### payments_void

`POST /api/v1/payments/{id}/void`. Scope: `payments:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `payments`.

Void an unapplied payment

- `id` (path, string uuid, required)
- `reason` (body, string, required)

### receipts_get

`GET /api/v1/receipts/{id}`. Scope: `receipts:read`. Member: `scoped`.

Get a payment receipt

- `id` (path, string uuid, required)

### receipts_list

`GET /api/v1/receipts`. Scope: `receipts:read`. Member: `scoped`.

List payment receipts

### receipts_send

`POST /api/v1/receipts/{id}/send`. Scope: `receipts:write`. Member: `deny`. Manager power: `billing`. Confirm: required. Changes: `receipts`. Idempotent: send `idempotency_key`.

Send a payment receipt to chosen recipients, or request staff approval

- `id` (path, string uuid, required)
- `idempotency_key` (body, string, required): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `recipients` (body, array of DocumentRecipientInputDto)
  - `contact_id` (body, string uuid)
  - `endpoint_id` (body, string uuid)
  - `address_id` (body, string uuid)
  - `name_snapshot` (body, string, required)
  - `value_snapshot` (body, string)
  - `channel` (body, string, required, one of `email`, `sms`, `pdf`)
  - `selected_how` (body, string, one of `manual`, `remembered`, `all_members`)
- `select_all` (body, boolean)

## Phone lines

### phone_lines_add_location

`POST /api/v1/phone-lines/{phoneLineId}/locations/{locationId}`. Scope: `phone_lines:write`. Member: `deny`. Changes: `phone_lines`.

Add one location a phone line answers for

- `phoneLineId` (path, string uuid, required)
- `locationId` (path, string uuid, required): A location `id` from `locations_list`

### phone_lines_create_sip_trunk

`POST /api/v1/phone-lines/sip-trunk`. Scope: `phone_lines:write`. Member: `deny`. Confirm: required. Changes: `phone_lines`. Idempotent: send `idempotency_key`.

Add a phone line from the customer’s SIP trunk

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `phone_number` (body, string, required): A number the SIP trunk carries, in E.164
- `label` (body, string, required): The name the dashboard shows for the line
- `auth_method` (body, string, required, one of `ip_allowlist`, `digest`): `ip_allowlist`: calls from `allowed_ip_ranges`. `digest`: a SIP username and password.
- `sip_username` (body, string): Required for `digest`. Never returned.
- `sip_password` (body, string): For `digest`, optional. Stored encrypted and never returned.
- `allowed_ip_ranges` (body, array of string): Required for `ip_allowlist`: the IP addresses or CIDR ranges calls come from.
- `location_ids` (body, array of string uuid): Location ids from `locations_list`. Required when the organization has more than one active location.

### phone_lines_create_twilio

`POST /api/v1/phone-lines/twilio`. Scope: `phone_lines:write`. Member: `deny`. Confirm: required. Changes: `phone_lines`. Idempotent: send `idempotency_key`.

Add a phone line from the customer’s Twilio account

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `phone_number` (body, string, required): A number the Twilio account owns, in E.164
- `label` (body, string, required): The name the dashboard shows for the line
- `account_sid` (body, string, required): The Twilio Account SID: AC and 32 hexadecimal characters
- `auth_token` (body, string, required): The Twilio auth token. It is stored encrypted and never returned.
- `location_ids` (body, array of string uuid): Location ids from `locations_list`. Required when the organization has more than one active location.

### phone_lines_delete

`DELETE /api/v1/phone-lines/{phoneLineId}`. Scope: `phone_lines:write`. Member: `deny`. Confirm: required. Changes: `phone_lines`.

Delete a phone line

- `phoneLineId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### phone_lines_disconnect

`POST /api/v1/phone-lines/{phoneLineId}/disconnect`. Scope: `phone_lines:write`. Member: `deny`. Confirm: required. Changes: `phone_lines`.

Disconnect a phone line

- `phoneLineId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### phone_lines_get

`GET /api/v1/phone-lines/{phoneLineId}`. Scope: `phone_lines:read`. Member: `open`.

Get one phone line

- `phoneLineId` (path, string uuid, required)

### phone_lines_list

`GET /api/v1/phone-lines`. Scope: `phone_lines:read`. Member: `open`.

List the organization’s phone lines

### phone_lines_reconnect

`POST /api/v1/phone-lines/{phoneLineId}/reconnect`. Scope: `phone_lines:write`. Member: `deny`. Changes: `phone_lines`.

Reconnect a disconnected phone line

- `phoneLineId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### phone_lines_retry

`POST /api/v1/phone-lines/{phoneLineId}/retry`. Scope: `phone_lines:write`. Member: `deny`. Changes: `phone_lines`.

Retry the import of a failed phone line

- `phoneLineId` (path, string uuid, required)

### phone_lines_set_routing

`PUT /api/v1/phone-lines/{phoneLineId}/routing`. Scope: `phone_lines:write`. Member: `deny`. Changes: `phone_lines`.

Set the locations a phone line answers for

- `phoneLineId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required): Every location the line answers for, from `locations_list`. Replaces the set. Empty leaves none.

## Sequences

### contacts_list_enrollments

`GET /api/v1/contacts/{contactId}/enrollments`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.manage`.

List one contact’s enrollments across every sequence

- `contactId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### sequences_activate

`POST /api/v1/sequences/{sequenceId}/activate`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Turn a sequence on

- `sequenceId` (path, string uuid, required)

### sequences_analytics

`GET /api/v1/sequences/{sequenceId}/analytics`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.manage`.

Get the send totals of a sequence

- `sequenceId` (path, string uuid, required)
- `since` (query, string date-time): Count only the runs created at or after this instant, in paths and step_counts_by_key. The per-step counts and the rollup ignore it

### sequences_cancel_enrollment

`POST /api/v1/sequences/{sequenceId}/enrollments/{enrollmentId}/cancel`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Remove a contact or an invoice from a sequence

- `sequenceId` (path, string uuid, required)
- `enrollmentId` (path, string uuid, required)

### sequences_cancel_schedule_run

`POST /api/v1/sequences/{sequenceId}/schedule/runs/{runId}/cancel`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Cancel one run of a broadcast

- `sequenceId` (path, string uuid, required)
- `runId` (path, string uuid, required)

### sequences_capabilities

`GET /api/v1/sequences/capabilities`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

What sequence authoring this server allows

### sequences_create

`POST /api/v1/sequences`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Changes: `sequences`. Idempotent: send `idempotency_key`.

Create a draft sequence

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `purpose` (body, string, one of `service`, `billing`, `marketing`): Omitted or null derives on create. On update, omitted preserves the purpose and null clears it.
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
  - `channel` (body, string, required, one of `email`, `sms`, `wait`, `task`, `add_to_sequence`, `create_task`): `email` and `sms` message the contact. `wait` only waits. `task` notifies the team: its subject is the title and its body the note. `add_to_sequence` enrolls the contact in the sequence `target_sequence_id` names, and the contact moves on to the next step. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll. `create_task` creates a follow-up task from `task_config`.
  - `task_config` (body, SequenceTaskConfigInputDto): Required when channel is create_task.
    - `task_type_id` (body, string uuid, required)
    - `title` (body, string, required): Task title; variables are resolved when the task is created.
    - `description` (body, string)
    - `assign` (body, SequenceTaskAssignmentInputDto, required)
      - `source` (body, string, required, one of `none`, `fixed`, `appointment_staff`, `enrolled_staff`, `contact_field`)
      - `staff_ids` (body, array of string, required): Fixed staff ids; empty unless source is fixed.
      - `field_key` (body, string): Contact relationship field key when source is contact_field.
    - `due` (body, SequenceTaskDueInputDto, required)
      - `basis` (body, string, required, one of `none`, `run`, `anchor`)
      - `offset_minutes` (body, number, required): Signed minutes from the due basis.
      - `all_day` (body, boolean, required)
    - `links` (body, SequenceTaskLinksInputDto, required)
      - `contact` (body, boolean, required)
      - `appointment` (body, boolean, required)
    - `notify_assignees` (body, boolean, required)
  - `delay_minutes` (body, number, required): Minutes to wait after the previous step before this one runs
  - `step_key` (body, string): Stable id of the step. Edges name steps by it. Keep it when you edit a step. Generated when omitted.
  - `subject_template` (body, string): Email subject, or the task title. May use `{{variables}}`.
  - `body_template` (body, string): Message body, or the task note. May use `{{variables}}`.
  - `preheader_template` (body, string): Email preview text shown next to the subject in the inbox
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
  - `wait_kind` (body, string, one of `duration`, `until`, `window`, `anchor`, `event`): What a `wait` step waits for. `duration`: `delay_minutes`. `until`: a date and time. `window`: the next open slot of a weekly window. `anchor`: a time before or after the appointment, in a sequence triggered by an appointment. `event`: a signal on the outgoing edges, or the timeout. Other channels are `duration`. Omitted is `duration`.
  - `wait_config` (body, object): Settings for `wait_kind`. Its keys are camelCase, as stored, like a condition. `duration`: null, or `{ resumeWindow }` to resume inside a window. `until`: `{ at: "YYYY-MM-DDTHH:mm", zone }`, a local time with no offset. `window`: `{ weekdays, startMinute, endMinute, zone, skipWeekends? }`, weekdays 0 (Sunday) to 6. `anchor`: `{ edge: "start"|"end", direction: "before"|"after", offsetMinutes }`. `event`: `{ signal, params?, timeoutMinutes }`: signal `replied`, `clicked`, `booked`, `stage_reached` or `converted` (the two stage signals need `params.stage`, the destination stage value), and `timeoutMinutes` (1 or more) is saved as `delay_minutes`. The wait ends when the signal arrives or the stage changes to it. `zone` is `contact` or `org`. Settings that do not fit the kind answer 400.
  - `sender_email` (body, string): Who an `email` step comes from: an `email` from `sequences_list_sender_addresses` whose `can_send` is true. Null sends from the organization's default address. Omit to keep the stored one. An OWNER or ADMIN may name any of the organization's addresses, any other role only their own login email (403). An address that is not verified, or not one of the organization's, answers 400.
  - `target_sequence_id` (body, string uuid): The sequence an `add_to_sequence` step enrolls the contact in: the `id` of another automation of the organization from `sequences_list`. Required on an `add_to_sequence` step and ignored on the others. The sequence itself, a broadcast, a team notice (it sends to the team), or an id that names no sequence of the organization answers 400. A credential that acts as a member limited to some locations may name only a sequence at one of them or an organization-wide one, and any other answers the same 400. An inactive or paused target saves, and the step then skips the contact. The step never enrolls a contact twice from the same source sequence, which stops a loop. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll.
- `exit_conditions` (body, array of SequenceExitConditionInputDto): Replaces the exit conditions. An enrollment stops when any of them is met.
  - `condition` (body, object, required): A condition in the DSL `sequences_get_condition_vocabulary` describes, e.g. `{ "signal": "replied" }`
  - `cancel_reason` (body, string, required, one of `goal_met`, `converted`, `stage_reached`, `replied`, `booked`, `opted_out`): Recorded on the enrollment when this exit fires
- `edges` (body, array of SequenceEdgeInputDto): Replaces the branch edges. Omit for a straight sequence.
  - `edge_key` (body, string): The `edge_key` `sequences_get` returned. Send it back to keep the edge and the traffic recorded on it. Omit it for a new edge.
  - `from_step_key` (body, string, required): `step_key` of the step the edge leaves
  - `to_step_key` (body, string): `step_key` it goes to. Null ends the sequence.
  - `condition` (body, object): A routing condition in the condition DSL. Omit for the fallback edge.
  - `priority` (body, number): Lower runs first. The first edge that matches wins.
  - `max_iterations` (body, number): Most passes through a loop. Required on an edge that goes back.
  - `variant_weight` (body, number): A/B split weight. Every edge from the step must carry one, and they sum to 100.
- `send_window` (body, SendWindowInputDto): Hours of the day email and SMS may send. Null removes the window.
  - `start_minute` (body, number, required): Opens at this minute of the day, organization time. 540 is 09:00.
  - `end_minute` (body, number, required): Closes at this minute (exclusive). 1080 is 18:00.

### sequences_create_send_schedule

`POST /api/v1/sequences/send-schedules`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Create a send window

- `name` (body, string, required)
- `weekdays` (body, array of number, required): Days a send may go out: 0 is Sunday, 6 is Saturday
- `start_minute` (body, number, required): First minute of the day a send may go out
- `end_minute` (body, number, required): Last minute of the day, exclusive. After `start_minute`.
- `timezone_mode` (body, string, required, one of `contact`, `organization`): Whose clock the window is read in
- `skip_holidays` (body, boolean, required)
- `holiday_calendar` (body, string, required, one of `US`)
- `randomize_minutes` (body, number, required): Minutes of random delay added to each send
- `is_default` (body, boolean, required): True makes it the window a sequence with no `send_schedule_id` uses

### sequences_delete

`DELETE /api/v1/sequences/{sequenceId}`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Delete a sequence

- `sequenceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### sequences_duplicate

`POST /api/v1/sequences/{sequenceId}/duplicate`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Changes: `sequences`. Idempotent: send `idempotency_key`.

Copy a sequence into a new draft

- `sequenceId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.

### sequences_enroll

`POST /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`. Idempotent: send `idempotency_key`.

Enroll a contact, or an issued invoice for payment reminders, in a sequence

- `sequenceId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this enrollment request, or send the `Idempotency-Key` header. A repeat from the same credential with the same key, sequence and contact or invoice answers the first answer again and changes nothing. The same key with another sequence, contact or invoice is a 409 `idempotency_conflict`. A key that enrolled or found an enrollment stays used and does not expire; a refused request frees its key.
- `contact_id` (body, string uuid): The contact to enroll
- `email` (body, string): Or the email of the contact to enroll, matched without regard to case
- `document_id` (body, string uuid): Or an issued invoice to send payment reminders about (IRIS-4488). The reminders go to the invoice’s own recipients, through the billing gate, and stop when the invoice is paid, voided, closed unpaid, held or paused.
- `start_step_key` (body, string): Start at this `step_key` instead of the first step

### sequences_get

`GET /api/v1/sequences/{sequenceId}`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

Get one sequence with its steps

- `sequenceId` (path, string uuid, required)

### sequences_get_condition_vocabulary

`GET /api/v1/sequences/condition-vocabulary`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

List the signals a condition can test

### sequences_get_enrollment

`GET /api/v1/sequences/{sequenceId}/enrollments/{enrollmentId}`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.manage`.

Get the send log of one enrollment

- `sequenceId` (path, string uuid, required)
- `enrollmentId` (path, string uuid, required)

### sequences_get_schedule

`GET /api/v1/sequences/{sequenceId}/schedule`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.manage`.

Get a broadcast's send schedule and its runs

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

### sequences_get_version

`GET /api/v1/sequences/{sequenceId}/versions/{revision}`. Scope: `sequences:read`. Member: `open`.

Get one saved version of a sequence

- `sequenceId` (path, string uuid, required)
- `revision` (path, integer, required): A `revision` from `sequences_list_versions`

### sequences_list

`GET /api/v1/sequences`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

List the organization’s sequences

### sequences_list_enrollments

`GET /api/v1/sequences/{sequenceId}/enrollments`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.manage`.

List the contacts and invoices enrolled in one sequence. `last_email_subject` is null for an invoice reminder when the caller has no billing access.

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `status` (query, string, one of `active`, `paused`, `completed`, `cancelled`, `failed`): Only enrollments with this status
- `contact_id` (query, string uuid): Only this contact's enrollments in the sequence
- `email` (query, string): Only the enrollments of the contact with this email, in the key’s organization. Matched without regard to case. Takes precedence over `contact_id`. An email no contact carries returns an empty page, not a 404. When more than one contact carries the email, the one that owns it as its identity is used.
- `reached_step_key` (query, string): Only the enrollments that reached this step, by its `step_key`, on any pass of the sequence

### sequences_list_send_schedules

`GET /api/v1/sequences/send-schedules`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

List the send windows a sequence can use

- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

### sequences_list_sender_addresses

`GET /api/v1/sequences/sender-addresses`. Scope: `sequences:read`. Member: `open`.

List the addresses an email step can come from

### sequences_list_triggers

`GET /api/v1/sequences/triggers`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

List the triggers a sequence can start on

### sequences_list_variables

`GET /api/v1/sequences/variables`. Scope: `sequences:read`. Member: `action`. Action (`x-iris-action`): `sequences.view`.

List the variables step copy may use

### sequences_list_versions

`GET /api/v1/sequences/{sequenceId}/versions`. Scope: `sequences:read`. Member: `open`.

List the saved versions of a sequence

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

### sequences_pause

`POST /api/v1/sequences/{sequenceId}/pause`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Changes: `sequences`.

Pause a sequence

- `sequenceId` (path, string uuid, required)

### sequences_pause_schedule

`POST /api/v1/sequences/{sequenceId}/schedule/pause`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Changes: `sequences`.

Pause a broadcast's schedule

- `sequenceId` (path, string uuid, required)

### sequences_preview_update

`POST /api/v1/sequences/{sequenceId}/changes/preview`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`. Changes: none.

Preview what an update would do to enrolled contacts

- `sequenceId` (path, string uuid, required)
- `purpose` (body, string, one of `service`, `billing`, `marketing`): Omitted or null derives on create. On update, omitted preserves the purpose and null clears it.
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
  - `channel` (body, string, required, one of `email`, `sms`, `wait`, `task`, `add_to_sequence`, `create_task`): `email` and `sms` message the contact. `wait` only waits. `task` notifies the team: its subject is the title and its body the note. `add_to_sequence` enrolls the contact in the sequence `target_sequence_id` names, and the contact moves on to the next step. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll. `create_task` creates a follow-up task from `task_config`.
  - `task_config` (body, SequenceTaskConfigInputDto): Required when channel is create_task.
    - `task_type_id` (body, string uuid, required)
    - `title` (body, string, required): Task title; variables are resolved when the task is created.
    - `description` (body, string)
    - `assign` (body, SequenceTaskAssignmentInputDto, required)
      - `source` (body, string, required, one of `none`, `fixed`, `appointment_staff`, `enrolled_staff`, `contact_field`)
      - `staff_ids` (body, array of string, required): Fixed staff ids; empty unless source is fixed.
      - `field_key` (body, string): Contact relationship field key when source is contact_field.
    - `due` (body, SequenceTaskDueInputDto, required)
      - `basis` (body, string, required, one of `none`, `run`, `anchor`)
      - `offset_minutes` (body, number, required): Signed minutes from the due basis.
      - `all_day` (body, boolean, required)
    - `links` (body, SequenceTaskLinksInputDto, required)
      - `contact` (body, boolean, required)
      - `appointment` (body, boolean, required)
    - `notify_assignees` (body, boolean, required)
  - `delay_minutes` (body, number, required): Minutes to wait after the previous step before this one runs
  - `step_key` (body, string): Stable id of the step. Edges name steps by it. Keep it when you edit a step. Generated when omitted.
  - `subject_template` (body, string): Email subject, or the task title. May use `{{variables}}`.
  - `body_template` (body, string): Message body, or the task note. May use `{{variables}}`.
  - `preheader_template` (body, string): Email preview text shown next to the subject in the inbox
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
  - `wait_kind` (body, string, one of `duration`, `until`, `window`, `anchor`, `event`): What a `wait` step waits for. `duration`: `delay_minutes`. `until`: a date and time. `window`: the next open slot of a weekly window. `anchor`: a time before or after the appointment, in a sequence triggered by an appointment. `event`: a signal on the outgoing edges, or the timeout. Other channels are `duration`. Omitted is `duration`.
  - `wait_config` (body, object): Settings for `wait_kind`. Its keys are camelCase, as stored, like a condition. `duration`: null, or `{ resumeWindow }` to resume inside a window. `until`: `{ at: "YYYY-MM-DDTHH:mm", zone }`, a local time with no offset. `window`: `{ weekdays, startMinute, endMinute, zone, skipWeekends? }`, weekdays 0 (Sunday) to 6. `anchor`: `{ edge: "start"|"end", direction: "before"|"after", offsetMinutes }`. `event`: `{ signal, params?, timeoutMinutes }`: signal `replied`, `clicked`, `booked`, `stage_reached` or `converted` (the two stage signals need `params.stage`, the destination stage value), and `timeoutMinutes` (1 or more) is saved as `delay_minutes`. The wait ends when the signal arrives or the stage changes to it. `zone` is `contact` or `org`. Settings that do not fit the kind answer 400.
  - `sender_email` (body, string): Who an `email` step comes from: an `email` from `sequences_list_sender_addresses` whose `can_send` is true. Null sends from the organization's default address. Omit to keep the stored one. An OWNER or ADMIN may name any of the organization's addresses, any other role only their own login email (403). An address that is not verified, or not one of the organization's, answers 400.
  - `target_sequence_id` (body, string uuid): The sequence an `add_to_sequence` step enrolls the contact in: the `id` of another automation of the organization from `sequences_list`. Required on an `add_to_sequence` step and ignored on the others. The sequence itself, a broadcast, a team notice (it sends to the team), or an id that names no sequence of the organization answers 400. A credential that acts as a member limited to some locations may name only a sequence at one of them or an organization-wide one, and any other answers the same 400. An inactive or paused target saves, and the step then skips the contact. The step never enrolls a contact twice from the same source sequence, which stops a loop. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll.
- `exit_conditions` (body, array of SequenceExitConditionInputDto): Replaces the exit conditions. An enrollment stops when any of them is met.
  - `condition` (body, object, required): A condition in the DSL `sequences_get_condition_vocabulary` describes, e.g. `{ "signal": "replied" }`
  - `cancel_reason` (body, string, required, one of `goal_met`, `converted`, `stage_reached`, `replied`, `booked`, `opted_out`): Recorded on the enrollment when this exit fires
- `edges` (body, array of SequenceEdgeInputDto): Replaces the branch edges. Omit for a straight sequence.
  - `edge_key` (body, string): The `edge_key` `sequences_get` returned. Send it back to keep the edge and the traffic recorded on it. Omit it for a new edge.
  - `from_step_key` (body, string, required): `step_key` of the step the edge leaves
  - `to_step_key` (body, string): `step_key` it goes to. Null ends the sequence.
  - `condition` (body, object): A routing condition in the condition DSL. Omit for the fallback edge.
  - `priority` (body, number): Lower runs first. The first edge that matches wins.
  - `max_iterations` (body, number): Most passes through a loop. Required on an edge that goes back.
  - `variant_weight` (body, number): A/B split weight. Every edge from the step must carry one, and they sum to 100.
- `send_window` (body, SendWindowInputDto): Hours of the day email and SMS may send. Null removes the window.
  - `start_minute` (body, number, required): Opens at this minute of the day, organization time. 540 is 09:00.
  - `end_minute` (body, number, required): Closes at this minute (exclusive). 1080 is 18:00.
- `expected_revision` (body, number): The `definition_revision` of the read you changed. The update answers 409 `stale_revision` when the sequence has changed since. Omit it to save regardless.

### sequences_resume

`POST /api/v1/sequences/{sequenceId}/resume`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Resume a paused sequence

- `sequenceId` (path, string uuid, required)

### sequences_revert_version

`POST /api/v1/sequences/{sequenceId}/versions/{revision}/revert`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Put a saved version of a sequence back

- `sequenceId` (path, string uuid, required)
- `revision` (path, integer, required): A `revision` from `sequences_list_versions`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `confirm` (body, boolean, required, one of `true`): Must be true: the revert replaces the steps and edges

### sequences_set_schedule

`PUT /api/v1/sequences/{sequenceId}/schedule`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

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

`POST /api/v1/sequences/{sequenceId}/schedule/start`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Start a broadcast's schedule

- `sequenceId` (path, string uuid, required)

### sequences_test_step

`POST /api/v1/sequences/{sequenceId}/steps/{stepKey}/test`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: none. Idempotent: send `idempotency_key`.

Send a test of one step

- `sequenceId` (path, string uuid, required)
- `stepKey` (path, string, required): The `step_key` of the step, as `sequences_get` lists it. At most 128 characters.
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `contact_id` (body, string uuid): Fill the step variables from this contact. The contact must belong to this organization.
- `to_email` (body, string email): The address that gets the email. Needed for an email step when `contact_id` is not sent.
- `to_phone` (body, string): The number that gets the text. Needed for an SMS step when `contact_id` is not sent.

### sequences_update

`PATCH /api/v1/sequences/{sequenceId}`. Scope: `sequences:write`. Member: `action`. Action (`x-iris-action`): `sequences.manage`. Confirm: required. Changes: `sequences`.

Change a sequence

- `sequenceId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `purpose` (body, string, one of `service`, `billing`, `marketing`): Omitted or null derives on create. On update, omitted preserves the purpose and null clears it.
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
  - `channel` (body, string, required, one of `email`, `sms`, `wait`, `task`, `add_to_sequence`, `create_task`): `email` and `sms` message the contact. `wait` only waits. `task` notifies the team: its subject is the title and its body the note. `add_to_sequence` enrolls the contact in the sequence `target_sequence_id` names, and the contact moves on to the next step. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll. `create_task` creates a follow-up task from `task_config`.
  - `task_config` (body, SequenceTaskConfigInputDto): Required when channel is create_task.
    - `task_type_id` (body, string uuid, required)
    - `title` (body, string, required): Task title; variables are resolved when the task is created.
    - `description` (body, string)
    - `assign` (body, SequenceTaskAssignmentInputDto, required)
      - `source` (body, string, required, one of `none`, `fixed`, `appointment_staff`, `enrolled_staff`, `contact_field`)
      - `staff_ids` (body, array of string, required): Fixed staff ids; empty unless source is fixed.
      - `field_key` (body, string): Contact relationship field key when source is contact_field.
    - `due` (body, SequenceTaskDueInputDto, required)
      - `basis` (body, string, required, one of `none`, `run`, `anchor`)
      - `offset_minutes` (body, number, required): Signed minutes from the due basis.
      - `all_day` (body, boolean, required)
    - `links` (body, SequenceTaskLinksInputDto, required)
      - `contact` (body, boolean, required)
      - `appointment` (body, boolean, required)
    - `notify_assignees` (body, boolean, required)
  - `delay_minutes` (body, number, required): Minutes to wait after the previous step before this one runs
  - `step_key` (body, string): Stable id of the step. Edges name steps by it. Keep it when you edit a step. Generated when omitted.
  - `subject_template` (body, string): Email subject, or the task title. May use `{{variables}}`.
  - `body_template` (body, string): Message body, or the task note. May use `{{variables}}`.
  - `preheader_template` (body, string): Email preview text shown next to the subject in the inbox
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
  - `wait_kind` (body, string, one of `duration`, `until`, `window`, `anchor`, `event`): What a `wait` step waits for. `duration`: `delay_minutes`. `until`: a date and time. `window`: the next open slot of a weekly window. `anchor`: a time before or after the appointment, in a sequence triggered by an appointment. `event`: a signal on the outgoing edges, or the timeout. Other channels are `duration`. Omitted is `duration`.
  - `wait_config` (body, object): Settings for `wait_kind`. Its keys are camelCase, as stored, like a condition. `duration`: null, or `{ resumeWindow }` to resume inside a window. `until`: `{ at: "YYYY-MM-DDTHH:mm", zone }`, a local time with no offset. `window`: `{ weekdays, startMinute, endMinute, zone, skipWeekends? }`, weekdays 0 (Sunday) to 6. `anchor`: `{ edge: "start"|"end", direction: "before"|"after", offsetMinutes }`. `event`: `{ signal, params?, timeoutMinutes }`: signal `replied`, `clicked`, `booked`, `stage_reached` or `converted` (the two stage signals need `params.stage`, the destination stage value), and `timeoutMinutes` (1 or more) is saved as `delay_minutes`. The wait ends when the signal arrives or the stage changes to it. `zone` is `contact` or `org`. Settings that do not fit the kind answer 400.
  - `sender_email` (body, string): Who an `email` step comes from: an `email` from `sequences_list_sender_addresses` whose `can_send` is true. Null sends from the organization's default address. Omit to keep the stored one. An OWNER or ADMIN may name any of the organization's addresses, any other role only their own login email (403). An address that is not verified, or not one of the organization's, answers 400.
  - `target_sequence_id` (body, string uuid): The sequence an `add_to_sequence` step enrolls the contact in: the `id` of another automation of the organization from `sequences_list`. Required on an `add_to_sequence` step and ignored on the others. The sequence itself, a broadcast, a team notice (it sends to the team), or an id that names no sequence of the organization answers 400. A credential that acts as a member limited to some locations may name only a sequence at one of them or an organization-wide one, and any other answers the same 400. An inactive or paused target saves, and the step then skips the contact. The step never enrolls a contact twice from the same source sequence, which stops a loop. An invoice reminder sequence refuses add_to_sequence because it has no contact to enroll.
- `exit_conditions` (body, array of SequenceExitConditionInputDto): Replaces the exit conditions. An enrollment stops when any of them is met.
  - `condition` (body, object, required): A condition in the DSL `sequences_get_condition_vocabulary` describes, e.g. `{ "signal": "replied" }`
  - `cancel_reason` (body, string, required, one of `goal_met`, `converted`, `stage_reached`, `replied`, `booked`, `opted_out`): Recorded on the enrollment when this exit fires
- `edges` (body, array of SequenceEdgeInputDto): Replaces the branch edges. Omit for a straight sequence.
  - `edge_key` (body, string): The `edge_key` `sequences_get` returned. Send it back to keep the edge and the traffic recorded on it. Omit it for a new edge.
  - `from_step_key` (body, string, required): `step_key` of the step the edge leaves
  - `to_step_key` (body, string): `step_key` it goes to. Null ends the sequence.
  - `condition` (body, object): A routing condition in the condition DSL. Omit for the fallback edge.
  - `priority` (body, number): Lower runs first. The first edge that matches wins.
  - `max_iterations` (body, number): Most passes through a loop. Required on an edge that goes back.
  - `variant_weight` (body, number): A/B split weight. Every edge from the step must carry one, and they sum to 100.
- `send_window` (body, SendWindowInputDto): Hours of the day email and SMS may send. Null removes the window.
  - `start_minute` (body, number, required): Opens at this minute of the day, organization time. 540 is 09:00.
  - `end_minute` (body, number, required): Closes at this minute (exclusive). 1080 is 18:00.
- `expected_revision` (body, number): The `definition_revision` of the read you changed. The update answers 409 `stale_revision` when the sequence has changed since. Omit it to save regardless.

### sequences_update_send_schedule

`PUT /api/v1/sequences/send-schedules/{sendScheduleId}`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

Change a send window

- `sendScheduleId` (path, string uuid, required)
- `name` (body, string, required)
- `weekdays` (body, array of number, required): Days a send may go out: 0 is Sunday, 6 is Saturday
- `start_minute` (body, number, required): First minute of the day a send may go out
- `end_minute` (body, number, required): Last minute of the day, exclusive. After `start_minute`.
- `timezone_mode` (body, string, required, one of `contact`, `organization`): Whose clock the window is read in
- `skip_holidays` (body, boolean, required)
- `holiday_calendar` (body, string, required, one of `US`)
- `randomize_minutes` (body, number, required): Minutes of random delay added to each send
- `is_default` (body, boolean, required): True makes it the window a sequence with no `send_schedule_id` uses

## Service plans

### service_plans_create

`POST /api/v1/service-plans`. Scope: `service_plans:write`. Member: `deny`. Confirm: required. Changes: `service_plans`. Idempotent: send `idempotency_key`.

Create a service plan: an allowance plan, or a subscription plan with plan_type subscription

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `plan_type` (body, string, one of `allowance`, `subscription`): `allowance` sells units; `subscription` bills each period and may grant units each period.
- `label` (body, string, required)
- `kind` (body, string, one of `package`, `recurring`): Required for an allowance plan.
- `unit` (body, string, one of `visit`, `appointment`, `minute`): Required for an allowance plan.
- `quantity` (body, number): Required for an allowance plan.
- `owner_scope` (body, string, one of `personal`, `shared`): Required for an allowance plan.
- `validity_days` (body, number)
- `transfer_enabled` (body, boolean)
- `rollover_max_quantity` (body, number)
- `rollover_max_days` (body, number)
- `late_cancel_deducts` (body, boolean)
- `late_cancel_notice_minutes` (body, number)
- `no_show_deducts` (body, boolean)
- `overrun_minutes` (body, number)
- `billing_interval` (body, string, one of `week`, `month`, `year`): Required for a subscription plan.
- `interval_count` (body, number): Billing intervals per period, for a subscription plan.
- `allowance_plan_id` (body, string uuid): The allowance plan whose units each period grants, for a subscription plan. Give it with `units_per_period`.
- `units_per_period` (body, number): Units granted each period, for a subscription plan.

### service_plans_get

`GET /api/v1/service-plans/{id}`. Scope: `service_plans:read`. Member: `open`.

Get a service plan with plan_type, live prices and offering_ids

- `id` (path, string uuid, required)

### service_plans_list

`GET /api/v1/service-plans`. Scope: `service_plans:read`. Member: `open`.

List service plans with plan_type, live prices and offering_ids

### service_plans_set_offerings

`POST /api/v1/service-plans/{id}/offerings`. Scope: `service_plans:write`. Member: `deny`. Confirm: required. Changes: `service_plans`.

Set the offerings an allowance plan covers

- `id` (path, string uuid, required)
- `offering_ids` (body, array of string uuid, required)

### service_plans_set_price

`POST /api/v1/service-plans/{id}/price`. Scope: `service_plans:write`. Member: `deny`. Confirm: required. Changes: `service_plans`. Idempotent: send `idempotency_key`.

Set a service plan price. A subscription already sold keeps the price it was sold at

- `id` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `currency` (body, string, required)
- `amount_minor` (body, number, required)

### service_plans_update

`PATCH /api/v1/service-plans/{id}`. Scope: `service_plans:write`. Member: `deny`. Confirm: required. Changes: `service_plans`.

Update a service plan

- `id` (path, string uuid, required)
- `label` (body, string)
- `archived_at` (body, string)

## Staff

### staff_activate

`POST /api/v1/staff/{staffId}/activate`. Scope: `staff:write`. Member: `deny`. Confirm: required. Changes: `staff`.

Make a staff member bookable, optionally at a location

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_id` (body, string uuid): A location to make the staff member bookable at. Left out, they are active and work at no new location.

### staff_add_exception

`POST /api/v1/staff/{staffId}/exceptions`. Scope: `staff:write`. Member: `scoped`. Changes: `staff`. Idempotent: send `idempotency_key`.

Add time off or an extra shift for a staff member

- `staffId` (path, string uuid, required)
- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `date` (body, string, required): The day, `YYYY-MM-DD`
- `kind` (body, string, required, one of `unavailable`, `available`): `unavailable` is time off. `available` is an extra shift, which must name a location.
- `location_id` (body, string uuid): The location, or null for time off at every location
- `start_time` (body, string): `HH:MM`. Leave out start_time and end_time for the whole day.
- `end_time` (body, string): `HH:MM`, after start_time
- `reason` (body, string): Why, in a few words

### staff_create

`POST /api/v1/staff`. Scope: `staff:write`. Member: `deny`. Changes: `staff`. Idempotent: send `idempotency_key`.

Add a staff member by name

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `name` (body, string, required): The staff member’s name

### staff_deactivate

`POST /api/v1/staff/{staffId}/deactivate`. Scope: `staff:write`. Member: `deny`. Changes: `staff`.

Stop a staff member taking new bookings

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### staff_get

`GET /api/v1/staff/{staffId}`. Scope: `staff:read`. Member: `action`. Action (`x-iris-action`): `staff.view`.

Read one staff member

- `staffId` (path, string uuid, required)

### staff_get_my_notifications

`GET /api/v1/staff/me/notifications`. Scope: `staff:write`. Member: `open`.

Read where you hear about your own appointments

### staff_get_schedule

`GET /api/v1/staff/{staffId}/schedule`. Scope: `staff:read`. Member: `scoped`.

Read a staff member’s weekly hours, time off and extra shifts

- `staffId` (path, string uuid, required)
- `location_id` (query, string uuid): Only this location’s hours, exceptions and location

### staff_get_settings

`GET /api/v1/staff/{staffId}/settings`. Scope: `staff:write`. Member: `deny`.

Read a staff member’s notification settings and linked login

- `staffId` (path, string uuid, required)

### staff_list

`GET /api/v1/staff`. Scope: `staff:read`. Member: `action`. Action (`x-iris-action`): `staff.view`.

List the staff members, with or without a login, archived ones included

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)

### staff_move_priority

`POST /api/v1/staff/{staffId}/priority`. Scope: `staff:write`. Member: `deny`. Manager power: `staff`. Changes: `staff`.

Move a staff member up or down the "anyone" order at one location

- `staffId` (path, string uuid, required)
- `location_id` (body, string uuid, required): The location whose "anyone" order changes
- `direction` (body, string, required, one of `up`, `down`): `up` books the staff member earlier, `down` later

### staff_remove_exception

`DELETE /api/v1/staff/{staffId}/exceptions/{exceptionId}`. Scope: `staff:write`. Member: `scoped`. Confirm: required. Changes: `staff`.

Remove time off or an extra shift

- `staffId` (path, string uuid, required)
- `exceptionId` (path, string uuid, required): The `id` of the entry in `exceptions`
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### staff_set_login

`PUT /api/v1/staff/{staffId}/login`. Scope: `staff:write`. Member: `deny`. Confirm: required. Changes: `staff`.

Link a staff member to a login of the organization, or unlink them

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `membership_id` (body, string uuid, required): The membership (login) of the organization to link, or null to unlink. Required.

### staff_set_offerings

`PUT /api/v1/staff/{staffId}/offerings`. Scope: `staff:write`. Member: `deny`. Changes: `staff`.

Replace the services a staff member handles

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `offering_ids` (body, array of string uuid, required): Every service the staff member handles. An empty list removes them from every service.

### staff_set_schedule

`PUT /api/v1/staff/{staffId}/schedule`. Scope: `staff:write`. Member: `deny`. Manager power: `staff`. Changes: `staff`.

Replace the weekly hours a staff member works at one location

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_id` (body, string uuid, required): The location whose week this replaces
- `intervals` (body, array of StaffIntervalInputDto, required): The whole week at that location. An empty list clears it.
  - `weekday` (body, number, required): The day of the week: 0 is Sunday, 6 is Saturday
  - `start_time` (body, string, required): When the work starts, `HH:MM` at the location
  - `end_time` (body, string, required): When the work ends, `HH:MM`, after start_time. A shift past midnight is two intervals.
  - `effective_from` (body, string): The first day these hours apply, or null
  - `effective_to` (body, string): The last day these hours apply, or null

### staff_update

`PATCH /api/v1/staff/{staffId}`. Scope: `staff:write`. Member: `deny`. Changes: `staff`.

Change where a staff member hears about their appointments

- `staffId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `notify_phone` (body, string): The phone number that gets the staff member’s appointment texts, E.164 such as +14155550100, or null for none
- `notify_email` (body, string email): The email address that gets the staff member’s appointment emails, or null for none
- `notify_by_sms` (body, boolean): Whether the staff member gets a text about their appointments
- `notify_by_email` (body, boolean): Whether the staff member gets an email about their appointments

### staff_update_my_notifications

`PATCH /api/v1/staff/me/notifications`. Scope: `staff:write`. Member: `open`. Changes: `staff`.

Change where you hear about your own appointments

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `notify_phone` (body, string): The phone number that gets the staff member’s appointment texts, E.164 such as +14155550100, or null for none
- `notify_email` (body, string email): The email address that gets the staff member’s appointment emails, or null for none
- `notify_by_sms` (body, boolean): Whether the staff member gets a text about their appointments
- `notify_by_email` (body, boolean): Whether the staff member gets an email about their appointments

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

## Task types

### task_types_archive

`POST /api/v1/task-types/{taskTypeId}/archive`. Scope: `task_types:write`. Member: `action`. Action (`x-iris-action`): `task_types.manage`. Changes: `task_types`.

Archive a task type while preserving its tasks and workflow

- `taskTypeId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### task_types_create

`POST /api/v1/task-types`. Scope: `task_types:write`. Member: `action`. Action (`x-iris-action`): `task_types.manage`. Changes: `task_types`, `fields`.

Create a task type from a template or a full workflow

- `template_key` (body, string, one of `general`, `field_visit`, `reviewed_work`, `follow_up`)
- `key` (body, string)
- `label` (body, string)
- `description` (body, string)
- `assignment_field_id` (body, string uuid)
- `transition_rule` (body, string, one of `listed`, `any`)
- `statuses` (body, array of TaskTypeStatusInputDto)
  - `key` (body, string, required)
  - `label` (body, string, required)
  - `category` (body, string, required, one of `not_started`, `in_progress`, `completed`, `cancelled`)
  - `is_initial` (body, boolean)
- `transitions` (body, array of TaskTypeTransitionInputDto)
  - `from` (body, string, required)
  - `to` (body, string, required)

### task_types_get

`GET /api/v1/task-types/{taskTypeId}`. Scope: `task_types:read`. Member: `action`. Action (`x-iris-action`): `task_types.view`.

Get one task type with its statuses and moves

- `taskTypeId` (path, string uuid, required)

### task_types_list

`GET /api/v1/task-types`. Scope: `task_types:read`. Member: `action`. Action (`x-iris-action`): `task_types.view`.

List the task types with their statuses and moves

- `include_archived` (query, boolean): Also list archived task types.

### task_types_list_templates

`GET /api/v1/task-types/templates`. Scope: `task_types:read`. Member: `action`. Action (`x-iris-action`): `task_types.view`.

List the task templates a task type copies

### task_types_restore

`POST /api/v1/task-types/{taskTypeId}/restore`. Scope: `task_types:write`. Member: `action`. Action (`x-iris-action`): `task_types.manage`. Changes: `task_types`.

Restore an archived task type with its existing workflow

- `taskTypeId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### task_types_set_workflow

`PUT /api/v1/task-types/{taskTypeId}/workflow`. Scope: `task_types:write`. Member: `action`. Action (`x-iris-action`): `task_types.manage`. Changes: `task_types`, `tasks`.

Replace the statuses and allowed moves of a task type

- `taskTypeId` (path, string uuid, required)
- `expected_revision` (body, number, required)
- `statuses` (body, array of TaskTypeStatusInputDto, required): The complete active workflow, in order, with exactly one initial status.
  - `key` (body, string, required)
  - `label` (body, string, required)
  - `category` (body, string, required, one of `not_started`, `in_progress`, `completed`, `cancelled`)
  - `is_initial` (body, boolean)
- `transitions` (body, array of TaskTypeTransitionInputDto, required): The complete set of allowed moves, by status key.
  - `from` (body, string, required)
  - `to` (body, string, required)
- `replacements` (body, object): Map each dropped, held status key to a retained status key.
- `allow_category_change` (body, boolean): Allow a replacement in a different fixed category.

### task_types_update

`PATCH /api/v1/task-types/{taskTypeId}`. Scope: `task_types:write`. Member: `action`. Action (`x-iris-action`): `task_types.manage`. Changes: `task_types`, `tasks`.

Change a task type label, description or assignment field

- `taskTypeId` (path, string uuid, required)
- `expected_revision` (body, number, required): The revision from the last read. A stale value returns revision_conflict.
- `label` (body, string)
- `description` (body, string)
- `assignment_field_id` (body, string uuid): An active task relationship field to staff. Its cardinality may be one or many.

## Tasks

### tasks_add_attachment

`POST /api/v1/tasks/{taskId}/attachments`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Create a signed task attachment upload

- `taskId` (path, string uuid, required)
- `file_name` (body, string, required)
- `content_type` (body, string, required)
- `size_bytes` (body, number, required)

### tasks_add_comment

`POST /api/v1/tasks/{taskId}/comments`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Add a comment to a task

- `taskId` (path, string uuid, required)
- `body` (body, string, required)
- `restricted` (body, boolean)

### tasks_archive

`POST /api/v1/tasks/{taskId}/archive`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Archive a task

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `expected_revision` (body, number, required): The task revision from the last read.

### tasks_archive_attachment

`POST /api/v1/tasks/{taskId}/attachments/{attachmentId}/archive`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Archive a task attachment

- `taskId` (path, string uuid, required)
- `attachmentId` (path, string uuid, required)

### tasks_archive_comment

`POST /api/v1/tasks/{taskId}/comments/{commentId}/archive`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Archive a task comment

- `taskId` (path, string uuid, required)
- `commentId` (path, string uuid, required)

### tasks_create

`POST /api/v1/tasks`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.create`. Changes: `tasks`.

Create a task

- `title` (body, string, required)
- `description` (body, string)
- `task_type_id` (body, string uuid): The task type. The organization’s `general` type when left out.
- `status_id` (body, string uuid): An active status of the type. The type’s initial status when left out. A machine actor needs an enabled `agent_action_rules` row to name a `completed` or `cancelled` status (403 `action_not_allowed`).
- `due_at` (body, string date-time): When the task is due, with `Z` or an offset. It writes no calendar entry.
- `due_all_day` (body, boolean): The task is due on the day of `due_at`, at no set time.
- `location_id` (body, string uuid): A location of the organization. Left out, the task belongs to the whole organization.
- `parent_task_id` (body, string uuid): Makes the task a subtask of this task. A task tree holds at most 10 levels.
- `assignee_ids` (body, array of string uuid): Staff ids for the type’s assignee field. A type with one assignee takes one (422 `assignee_limit`). An id that names no staff member, archived staff, or staff who cannot access the task location is refused with 422 `assignee_cannot_access`. A MEMBER may assign only their own staff record.
- `links` (body, array of TaskLinkDto): Records the task names, such as the contact to call back.
  - `record_kind` (body, string, required): The registered kind of the record, such as `contact`, `appointment` or `location`. A subtask uses `parent_task_id`.
  - `record_id` (body, string uuid, required): The record. A link to a contact merged into another reads as the surviving contact.
- `dedupe_key` (body, string): Your key for this create, unique per organization across API credentials, voice and SMS. A repeat with the same key and the same fields answers the first task and writes nothing, so a retry after a timeout is safe. A repeat with other fields answers 409 `idempotency_conflict`. A member’s or manager’s credential gets 404 on a repeat when it cannot read the task, such as one it created with no location.

### tasks_edit_comment

`PATCH /api/v1/tasks/{taskId}/comments/{commentId}`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Edit a task comment

- `taskId` (path, string uuid, required)
- `commentId` (path, string uuid, required)
- `body` (body, string, required): The replacement comment text.
- `restricted` (body, boolean): Whether the comment is restricted. Omit to keep its current value.

### tasks_get

`GET /api/v1/tasks/{taskId}`. Scope: `tasks:read`. Member: `action`. Action (`x-iris-action`): `task.view`.

Get one task

- `taskId` (path, string uuid, required)

### tasks_link

`POST /api/v1/tasks/{taskId}/links`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Link a record to a task

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `record_kind` (body, string, required): The registered kind of the record, such as `contact`, `appointment` or `location`. A subtask uses `parent_task_id`.
- `record_id` (body, string uuid, required): The record. A link to a contact merged into another reads as the surviving contact.
- `expected_revision` (body, number, required)

### tasks_list

`GET /api/v1/tasks`. Scope: `tasks:read`. Member: `action`. Action (`x-iris-action`): `task.list`.

List tasks, newest first, with filters

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `task_type_id` (query, string uuid): Only tasks of this task type.
- `status_id` (query, string uuid): Only tasks in this status.
- `category` (query, string, one of `not_started`, `in_progress`, `completed`, `cancelled`): Only tasks whose status is in this category.
- `assignee` (query, string): A staff id: tasks whose assignee field names that staff member. `me`: the staff member linked to the person the credential acts for (an organization key has none). `unassigned`: tasks with no assignee.
- `due_before` (query, string date-time): Only tasks due before this time (exclusive). Give `Z` or an offset.
- `due_after` (query, string date-time): Only tasks due at or after this time. Give `Z` or an offset.
- `location_id` (query, string uuid): Only tasks at this location.
- `record_kind` (query, string): With `record_id`: only tasks linked to this record, such as `contact` or `appointment`. `work_record` is refused with 400. Use `work_record_id` instead.
- `record_id` (query, string uuid): With `record_kind`: the linked record. A contact also finds links to contacts merged into it.
- `work_record_id` (query, string uuid): Only tasks linked to this work record through work_links. Use alone, without record_kind or record_id. A scoped credential must be able to read the work record, otherwise the response is 404.
- `parent_task_id` (query, string uuid): Only the subtasks of this task.
- `include_archived` (query, boolean): Also list archived tasks.

### tasks_list_attachments

`GET /api/v1/tasks/{taskId}/attachments`. Scope: `tasks:read`. Member: `action`. Action (`x-iris-action`): `task.view`.

List attachments on a task

- `taskId` (path, string uuid, required)

### tasks_list_comments

`GET /api/v1/tasks/{taskId}/comments`. Scope: `tasks:read`. Member: `action`. Action (`x-iris-action`): `task.view`.

List comments on a task

- `taskId` (path, string uuid, required)

### tasks_list_history

`GET /api/v1/tasks/{taskId}/history`. Scope: `tasks:read`. Member: `action`. Action (`x-iris-action`): `task.view`.

List a task’s change history

- `taskId` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### tasks_reclassify

`POST /api/v1/tasks/{taskId}/reclassify`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Move a task to another task type

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `task_type_id` (body, string uuid, required)
- `status_id` (body, string uuid, required)
- `staff_ids` (body, array of string uuid)
- `expected_revision` (body, number, required)

### tasks_restore

`POST /api/v1/tasks/{taskId}/restore`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Restore an archived task

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `expected_revision` (body, number, required): The task revision from the last read.

### tasks_set_assignees

`POST /api/v1/tasks/{taskId}/assignees`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.assign`. Changes: `tasks`.

Set task assignees

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `staff_ids` (body, array of string uuid, required)
- `expected_revision` (body, number, required)

### tasks_transition

`POST /api/v1/tasks/{taskId}/transition`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Move a task to another status

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `to_status_id` (body, string uuid, required)
- `expected_revision` (body, number, required)
- `reason` (body, string)

### tasks_unlink

`POST /api/v1/tasks/{taskId}/links/remove`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Remove a record link from a task

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `record_kind` (body, string, required): The registered kind of the record, such as `contact`, `appointment` or `location`. A subtask uses `parent_task_id`.
- `record_id` (body, string uuid, required): The record. A link to a contact merged into another reads as the surviving contact.
- `expected_revision` (body, number, required)

### tasks_update

`PATCH /api/v1/tasks/{taskId}`. Scope: `tasks:write`. Member: `action`. Action (`x-iris-action`): `task.edit`. Changes: `tasks`.

Update a task

- `taskId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `expected_revision` (body, number, required): The task revision from the last read.
- `title` (body, string)
- `description` (body, string)
- `due_at` (body, string date-time)
- `due_all_day` (body, boolean)
- `location_id` (body, string uuid)
- `parent_task_id` (body, string uuid)

## Tax rates

### tax_rates_archive

`POST /api/v1/tax-rates/{taxRateId}/archive`. Scope: `tax_rates:write`. Member: `action`. Action (`x-iris-action`): `tax_rates.manage`. Confirm: required. Changes: `tax_rates`.

Archive a tax rate

- `taxRateId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.

### tax_rates_create

`POST /api/v1/tax-rates`. Scope: `tax_rates:write`. Member: `action`. Action (`x-iris-action`): `tax_rates.manage`. Changes: `tax_rates`. Idempotent: send `idempotency_key`.

Create a tax rate

- `idempotency_key` (body, string): Your own key for this call. A retry with the same key and the same details within 24 hours returns the first answer and does not run the call again. The same key with other details is a 409 `idempotency_key_reused`.
- `label` (body, string, required)
- `rate_ppm` (body, integer, required): The rate in parts per million, a whole number: 8.875% is 88750, 20% is 200000. No currency.

### tax_rates_get

`GET /api/v1/tax-rates/{taxRateId}`. Scope: `tax_rates:read`. Member: `action`. Action (`x-iris-action`): `tax_rates.view`.

Read one tax rate

- `taxRateId` (path, string uuid, required)

### tax_rates_list

`GET /api/v1/tax-rates`. Scope: `tax_rates:read`. Member: `action`. Action (`x-iris-action`): `tax_rates.view`.

List the tax rates

- `include_archived` (query, boolean): Include archived rates.

### tax_rates_set_default

`POST /api/v1/tax-rates/{taxRateId}/default`. Scope: `tax_rates:write`. Member: `action`. Action (`x-iris-action`): `tax_rates.manage`. Changes: `tax_rates`.

Make a tax rate the default of an offering, add-on, plan or booking policy

- `taxRateId` (path, string uuid, required)
- `subject_kind` (body, string, required, one of `offering`, `add_on`, `allowance_plan`, `subscription_plan`, `policy_set`): The kind of record the default is for.
- `subject_id` (body, string uuid, required): The offering, add-on, plan or booking policy. It must exist in this organization.

### tax_rates_update

`PATCH /api/v1/tax-rates/{taxRateId}`. Scope: `tax_rates:write`. Member: `action`. Action (`x-iris-action`): `tax_rates.manage`. Changes: `tax_rates`.

Change a tax rate’s label or rate

- `taxRateId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `label` (body, string)
- `rate_ppm` (body, integer): The rate in parts per million, a whole number: 8.875% is 88750, 20% is 200000. No currency.

## Terms versions

### terms_versions_get

`GET /api/v1/terms-versions/{id}`. Scope: `offerings:read`. Member: `open`.

Read one immutable terms version

- `id` (path, string uuid, required)

## Territories

### territories_list

`GET /api/v1/territories`. Scope: `appointments:read`. Member: `action`. Action (`x-iris-action`): `territories.view`.

List the service territories, their postal codes and their priority

## Work records

### work_records_add_attachment

`POST /api/v1/work-records/{workRecordId}/attachments`. Scope: `work_records:write`. Member: `action`. Action (`x-iris-action`): `work_record.edit`. Changes: `work_records`.

Create a work record attachment upload URL with work_record.edit permission

- `workRecordId` (path, string, required)
- `file_name` (body, string, required)
- `content_type` (body, string, required)
- `size_bytes` (body, number, required)

### work_records_add_comment

`POST /api/v1/work-records/{workRecordId}/comments`. Scope: `work_records:write`. Member: `action`. Action (`x-iris-action`): `work_record.edit`. Changes: `work_records`.

Add a work record comment with work_record.edit permission

- `workRecordId` (path, string, required)
- `body` (body, string, required)
- `restricted` (body, boolean)

### work_records_archive

`POST /api/v1/work-records/{workRecordId}/archive`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.archive`. Changes: `work_records`.

Archive a work record

- `workRecordId` (path, string uuid, required)
- `expected_revision` (body, number, required)

### work_records_create

`POST /api/v1/work-records`. Scope: `work_records:write`. Member: `action`. Action (`x-iris-action`): `work_record.create`. Changes: `work_records`.

Create a work record

- `title` (body, string, required)
- `description` (body, string)
- `work_type_id` (body, string uuid)
- `status_id` (body, string uuid)
- `location_id` (body, string uuid)
- `customer_contact_id` (body, string uuid)
- `customer_group_id` (body, string uuid)
- `links` (body, array of WorkRecordLinkDto)
  - `record_kind` (body, string, required, one of `task`, `appointment`, `asset`, `document`)
  - `record_id` (body, string uuid, required)

### work_records_get

`GET /api/v1/work-records/{workRecordId}`. Scope: `work_records:read`. Member: `action`. Action (`x-iris-action`): `work_record.view`.

Get one work record with readiness and links

- `workRecordId` (path, string uuid, required)

### work_records_link

`POST /api/v1/work-records/{workRecordId}/links`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.edit`. Changes: `work_records`.

Link a record to a work record

- `workRecordId` (path, string uuid, required)
- `record_kind` (body, string, required, one of `task`, `appointment`, `asset`, `document`)
- `record_id` (body, string uuid, required)
- `expected_revision` (body, number, required)

### work_records_list

`GET /api/v1/work-records`. Scope: `work_records:read`. Member: `action`. Action (`x-iris-action`): `work_record.list`.

List work records with readiness and links

- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)
- `work_type_id` (query, string uuid)
- `status_id` (query, string uuid)
- `category` (query, string, one of `not_started`, `in_progress`, `completed`, `cancelled`)
- `location_id` (query, string uuid)
- `ready_to_close` (query, boolean)
- `include_archived` (query, boolean)

### work_records_list_attachments

`GET /api/v1/work-records/{workRecordId}/attachments`. Scope: `work_records:read`. Member: `scoped`. Action (`x-iris-action`): `work_record.view`.

List attachments on a work record

- `workRecordId` (path, string, required)

### work_records_list_comments

`GET /api/v1/work-records/{workRecordId}/comments`. Scope: `work_records:read`. Member: `scoped`. Action (`x-iris-action`): `work_record.view`.

List comments on a work record

- `workRecordId` (path, string, required)

### work_records_list_history

`GET /api/v1/work-records/{workRecordId}/history`. Scope: `work_records:read`. Member: `scoped`. Action (`x-iris-action`): `work_record.view`.

List work record history using the returned sequence cursor

- `workRecordId` (path, string uuid, required)
- `cursor` (query, string): The `next_cursor` of the page before. Leave out for the first page.
- `limit` (query, number)

### work_records_restore

`POST /api/v1/work-records/{workRecordId}/restore`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.archive`. Changes: `work_records`.

Restore an archived work record

- `workRecordId` (path, string uuid, required)
- `expected_revision` (body, number, required)

### work_records_transition

`POST /api/v1/work-records/{workRecordId}/transition`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.transition`. Changes: `work_records`.

Move a work record to another status

- `workRecordId` (path, string uuid, required)
- `to_status_id` (body, string uuid, required)
- `expected_revision` (body, number, required)
- `reason` (body, string)

### work_records_unlink

`POST /api/v1/work-records/{workRecordId}/links/remove`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.edit`. Changes: `work_records`.

Remove a link from a work record

- `workRecordId` (path, string uuid, required)
- `record_kind` (body, string, required, one of `task`, `appointment`, `asset`, `document`)
- `record_id` (body, string uuid, required)
- `expected_revision` (body, number, required)

### work_records_update

`PATCH /api/v1/work-records/{workRecordId}`. Scope: `work_records:write`. Member: `scoped`. Action (`x-iris-action`): `work_record.edit`. Changes: `work_records`.

Update work record details

- `workRecordId` (path, string uuid, required)
- `expected_revision` (body, number, required)
- `title` (body, string)
- `description` (body, string)
- `location_id` (body, string uuid)
- `customer_contact_id` (body, string uuid)
- `customer_group_id` (body, string uuid)

## Work types

### work_types_archive

`POST /api/v1/work-types/{workTypeId}/archive`. Scope: `work_types:write`. Member: `deny`. Action (`x-iris-action`): `work_type.manage`. Changes: `work_types`.

Archive a work type

- `workTypeId` (path, string uuid, required)

### work_types_create

`POST /api/v1/work-types`. Scope: `work_types:write`. Member: `deny`. Action (`x-iris-action`): `work_type.manage`. Changes: `work_types`.

Create a work type from a template or full workflow

- `template_key` (body, string, one of `job`, `project`, `pipeline`)
- `key` (body, string)
- `label` (body, string)
- `description` (body, string)
- `assignment_field_id` (body, string uuid)
- `transition_rule` (body, string, one of `listed`, `any`)
- `statuses` (body, array of object)
- `transitions` (body, array of object)

### work_types_get

`GET /api/v1/work-types/{workTypeId}`. Scope: `work_types:read`. Member: `action`. Action (`x-iris-action`): `work_type.view`.

Get one work type with its statuses and moves

- `workTypeId` (path, string uuid, required)

### work_types_list

`GET /api/v1/work-types`. Scope: `work_types:read`. Member: `action`. Action (`x-iris-action`): `work_type.list`.

List work types with their statuses and moves

- `include_archived` (query, boolean)

### work_types_restore

`POST /api/v1/work-types/{workTypeId}/restore`. Scope: `work_types:write`. Member: `deny`. Action (`x-iris-action`): `work_type.manage`. Changes: `work_types`.

Restore a work type

- `workTypeId` (path, string uuid, required)

### work_types_set_workflow

`PUT /api/v1/work-types/{workTypeId}/workflow`. Scope: `work_types:write`. Member: `deny`. Action (`x-iris-action`): `work_type.manage`. Changes: `work_types`.

Replace a work type workflow

- `workTypeId` (path, string uuid, required)
- `expected_revision` (body, number, required)
- `statuses` (body, array of object, required)
- `transitions` (body, array of object, required)
- `replacements` (body, object)
- `allow_category_change` (body, boolean)

### work_types_update

`PATCH /api/v1/work-types/{workTypeId}`. Scope: `work_types:write`. Member: `deny`. Action (`x-iris-action`): `work_type.manage`. Changes: `work_types`.

Update work type details or clear its assignment field with null

- `workTypeId` (path, string uuid, required)
- `expected_revision` (body, number, required)
- `label` (body, string)
- `description` (body, string)
- `assignment_field_id` (body, string uuid)
