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

`GET /api/v1/appointments`. Scope: `appointments:read`. Member: `scoped`.

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

### appointments_reschedule

`POST /api/v1/appointments/{appointmentId}/reschedule`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Move an appointment to a new time

- `appointmentId` (path, string uuid, required)
- `start_time` (body, string date-time, required)
- `end_time` (body, string date-time, required)

### appointments_reset_self_service_link

`POST /api/v1/appointments/{appointmentId}/self-service-link/reset`. Scope: `appointments:write`. Member: `deny`. Confirm: required. Changes: `appointments`.

Reset the self-service link of an appointment

- `appointmentId` (path, string uuid, required)

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

### appointments_update_details

`PATCH /api/v1/appointments/{appointmentId}/details`. Scope: `appointments:write`. Member: `scoped`. Changes: `appointments`.

Change an appointment’s status, place, time zone, all-day flag or repeat rule

- `appointmentId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location` (body, string): The free-text place. `null` clears it.
- `all_day` (body, boolean)
- `status` (body, string, one of `tentative`, `confirmed`, `completed`, `no_show`): `completed` and `no_show` can start the matching follow-up sequences.
- `timezone` (body, string): IANA time zone, e.g. America/Denver. The start and end do not move.
- `recurrence_rule` (body, string): An RFC 5545 RRULE, e.g. FREQ=WEEKLY;COUNT=4. `null` stops the repeat.

## Assistant

### assistant_delete_note

`DELETE /api/v1/assistant/note`. Scope: `assistant:write`. Member: `open`. Confirm: required. Changes: `assistant`.

Delete your private Assistant note

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

### audiences_delete

`DELETE /api/v1/audiences/{audienceId}`. Scope: `audiences:write`. Member: `deny`. Confirm: required. Changes: `audiences`.

Delete an audience

- `audienceId` (path, string uuid, required)

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

`GET /api/v1/calendars`. Scope: `appointments:read`. Member: `scoped`.

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

Delete calls

- `call_ids` (body, array of string, required): Call `id`s from `calls_list`
- `location_id` (body, string uuid): Delete only the calls at this location

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

### contacts_assign_location

`POST /api/v1/contacts/locations`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Link several contacts to one location

- `contact_ids` (body, array of string uuid, required)
- `location_id` (body, string uuid, required): An active location from `locations_list`

### contacts_export

`GET /api/v1/contacts/export`. Scope: `contacts:read`. Member: `deny`.

Export contacts as CSV

- `location_id` (query, string uuid): Only the contacts linked to this location
- `q` (query, string): Free text. Only contacts whose name, email or phone contains it.

### contacts_get

`GET /api/v1/contacts/{contactId}`. Scope: `contacts:read`. Member: `scoped`.

Get one contact

- `contactId` (path, string uuid, required)

### contacts_get_affiliation

`GET /api/v1/contacts/{contactId}/locations/{locationId}/affiliation`. Scope: `contacts:read`. Member: `scoped`.

Get a contact’s owner, company and extra addresses at a location

- `contactId` (path, string uuid, required)
- `locationId` (path, string, required): A location the contact is linked to

### contacts_lift_suppression

`POST /api/v1/contacts/suppressions/{suppressionId}/lift`. Scope: `contacts:write`. Member: `deny`. Confirm: required. Changes: `contacts`.

Lift a suppression

- `suppressionId` (path, string uuid, required)
- `channel` (body, string, required, one of `email`, `sms`): The `channel` of the suppression
- `reason` (body, string, required): Why. Stored in the suppression audit log.

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

### contacts_list_suppressions

`GET /api/v1/contacts/suppressions`. Scope: `contacts:read`. Member: `deny`.

List suppressed email addresses and phone numbers

- `page` (query, number): 1-based page number
- `limit` (query, number): Page size (capped at 100)
- `channel` (query, string, one of `email`, `sms`): One channel. Both when left out.
- `q` (query, string): Matches the suppressed email or phone, without regard to case
- `include_lifted` (query, boolean): Also list lifted SMS opt-outs, with `active` false

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

### contacts_set_locations

`PUT /api/v1/contacts/{contactId}/locations`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Set the locations of a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `location_ids` (body, array of string uuid, required): Every location the contact is linked to after the call. Each must be an active location.

### contacts_suppress

`POST /api/v1/contacts/{contactId}/suppress`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Confirm: required. Changes: `contacts`, `sequences`.

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

`PATCH /api/v1/contacts/{contactId}`. Scope: `contacts:write`. Member: `deny`. Manager power: `contacts`. Changes: `contacts`.

Update a contact

- `contactId` (path, string uuid, required)
- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `name` (body, string)
- `phone` (body, string): E.164, e.g. +14155550100
- `email` (body, string email)
- `stage_id` (body, string): A stage `id` from the organization's pipeline
- `custom_fields` (body, object): Custom field values to merge, keyed by field name. An unknown name is a 400 that names it. At most 200 keys.

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
- `skip_automations` (body, boolean): When true, the upsert itself starts nothing. A new contact starts no "New lead" (lead_created) sequence and sends no `crm.lead.created` event to integrations. An updated contact sends no `crm.contact.updated` event. `events` and `cancel_events` still run as named. Use it to load existing customers. Defaults to false.

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

`POST /api/v1/crm-imports/review-items/{itemId}/resolve`. Scope: `crm_imports:write`. Member: `deny`. Changes: `crm_imports`, `contacts`.

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

`PUT /api/v1/crm-imports/settings`. Scope: `crm_imports:write`. Member: `deny`. Changes: `crm_imports`.

Set the CRM import merge policy

- `expected_updated_at` (query, string date-time): The record’s `updated_at` exactly as its GET returned it. When the record changed after it, the call answers 409 `stale_revision` and changes nothing. Leave it out to write without the check.
- `merge_policy` (body, string, required, one of `iris_wins`, `source_wins`, `newest_wins`): The organization’s merge policy, for the imports started after it. `iris_wins` keeps what Iris holds and only fills blanks. `source_wins` takes the provider’s value. `newest_wins` takes it only when the provider’s record is newer than the contact. Email and phone are never overwritten.

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

`PUT /api/v1/email-settings`. Scope: `email_settings:write`. Member: `deny`. Changes: `email_settings`.

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

`DELETE /api/v1/integrations/google-calendar/locations/{locationId}`. Scope: `integrations:write`. Member: `scoped`. Confirm: required. Changes: `integrations`.

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
- `event_key` (body, string, required, one of `crm.contact.created`, `crm.lead.created`, `crm.contact.updated`, `crm.contact.stage_changed`, `crm.contact.deleted`, `crm.interaction.completed`, `crm.note.added`, `crm.contact.tag_added`, `crm.contact.tag_removed`, `appointment.created`, `appointment.rescheduled`, `appointment.cancelled`, `sms.message.received`, `sms.message.sent`, `sms.message.delivered`, `sms.message.failed`, `sms.contact.opted_out`, `sms.contact.opted_in`, `call.completed`, `call.transcript_ready`, `phone_line.connected`, `phone_line.disconnected`, `conversation.started`, `conversation.human_takeover_started`, `conversation.human_takeover_ended`, `webchat.session_started`, `agent.went_live`, `sequence.enrollment_created`, `sequence.step_sent`, `sequence.completed`, `sequence.stopped`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`, `audience.member_added`, `audience.member_removed`, `form.submitted`): An event `key` from `zapier_get_event_catalog`
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
- `since` (query, string date-time): Count only the runs created at or after this instant, in paths and step_counts_by_key. The per-step counts and the rollup ignore it

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
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
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

### sequences_get_version

`GET /api/v1/sequences/{sequenceId}/versions/{revision}`. Scope: `sequences:read`. Member: `open`.

Get one saved version of a sequence

- `sequenceId` (path, string uuid, required)
- `revision` (path, integer, required): A `revision` from `sequences_list_versions`

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
- `reached_step_key` (query, string): Only the enrollments that reached this step, by its `step_key`, on any pass of the sequence

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

### sequences_list_versions

`GET /api/v1/sequences/{sequenceId}/versions`. Scope: `sequences:read`. Member: `open`.

List the saved versions of a sequence

- `sequenceId` (path, string uuid, required)
- `page` (query, number): 1-based page number, at most 1000
- `limit` (query, number): Page size (capped at 100)

### sequences_pause

`POST /api/v1/sequences/{sequenceId}/pause`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`.

Pause a sequence

- `sequenceId` (path, string uuid, required)

### sequences_pause_schedule

`POST /api/v1/sequences/{sequenceId}/schedule/pause`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Changes: `sequences`.

Pause a broadcast's schedule

- `sequenceId` (path, string uuid, required)

### sequences_preview_update

`POST /api/v1/sequences/{sequenceId}/changes/preview`. Scope: `sequences:read`. Member: `deny`. Manager power: `sequences`. Changes: none.

Preview what an update would do to enrolled contacts

- `sequenceId` (path, string uuid, required)
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
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
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

`POST /api/v1/sequences/{sequenceId}/resume`. Scope: `sequences:write`. Member: `deny`. Manager power: `sequences`. Confirm: required. Changes: `sequences`.

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
  - `body_document` (body, object): A designed email body (EmailDocument v1), on `email` steps only. At most 60 blocks, counting each block inside columns and sections, 10000 characters, and 40 items in one list. `frame.header` and `frame.footer` set to false hide the header or footer. `frame.headerId` and `frame.footerId` pick a header and a footer the organization made in Settings › Email design; omitted, null or an id that names none of them is the default. An optional `meta.templateName` (at most 120 characters, other `meta` keys dropped) names the template the email was started from. It is informational only and is never rendered. A heading, text block or list item that still reads its new-block placeholder ("Your heading", "Write something…", "First point") is dropped. Omit to keep the stored one. A step that leaves `email` loses it. Null clears it.
  - `ai_enabled` (body, boolean): Let AI write the copy from `ai_prompt` at send time
  - `ai_prompt` (body, string): What the AI should write, when `ai_enabled`
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

## Staff

### staff_get_my_notifications

`GET /api/v1/staff/me/notifications`. Scope: `staff:write`. Member: `open`.

Read where you hear about your own appointments

### staff_get_settings

`GET /api/v1/staff/{staffId}/settings`. Scope: `staff:write`. Member: `deny`.

Read a staff member’s notification settings and linked login

- `staffId` (path, string uuid, required)

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

## Territories

### territories_list

`GET /api/v1/territories`. Scope: `appointments:read`. Member: `deny`.

List the service territories and their postal codes
