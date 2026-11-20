---
name: iris-api
description: Work an Iris organization through the Iris public API or the Iris MCP server. Use when asked to find or update a contact, check which sequences a contact is in, enroll or cancel a contact in a sequence, pause or resume a sequence, read a send log or sequence totals, build a draft sequence, schedule, start or pause a broadcast send, change an appointment’s title, notes or attendee details, reserve, confirm or release booking holds, or read appointments, conversations and calls in Iris.
required_environment_variables:
  - name: IRIS_API_KEY
    prompt: Iris API key (starts with iris_sk_)
    help: In the Iris dashboard, open Settings > My agent access and create a personal key with the scopes you need. An owner or admin can create an organization key under Organization > API keys instead. The key is shown once.
metadata:
  {
    "openclaw":
      { "requires": { "env": ["IRIS_API_KEY"] }, "primaryEnv": "IRIS_API_KEY" },
  }
---

# Iris API

## Field access

Contact, interaction, appointment, task and work-record responses apply the field grants of the
credential. A denied scalar field remains in the response as `null`, and its catalog key appears
in `restricted_fields`. Denied endpoint and address lists return an empty `items` array and name
their catalog key in `restricted_fields`. Writes that include a denied field return 403
`field_not_editable` before any record changes. Search predicates on a denied field answer 422
`field_not_searchable`; free-text search and export columns include only fields the credential
may view. Add `include=values` to `changes_list` for visible before and after values; withheld
values are named in `redacted_keys`.

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

## Request a payment link with a copied link

1. Use `payment_links_create` with `subject_kind: package` or `subscription_signup`, plus `plan_kind`, `plan_id`, `currency` and `bill_to_contact_id`. For a hold, pass the live hold ID as `subject_id`.
   Omit amount. Iris derives it from the plan or hold.
2. Send a unique body `idempotency_key` through MCP, or an `Idempotency-Key` header through REST.
3. Copy `link.url` from the response. `document_id` is null for a hold.
4. Use `payment_links_get` or `payment_links_list` to read the verified payment state.
5. Use `payment_links_send` to deliver the link through the billing communication gate.
6. Use `payment_links_cancel` to revoke the link if collection should stop.

An ended hold, one without a positive deposit, or one with mixed currencies answers 422 `hold_not_payable`.
A missing payer answers 422 `payer_missing`.
A second live link answers 409 `payment_link_exists`. The id requires `payment_links:read` and current access. Reuse a sendable link. Revocation alone does not release a completed unpaid session.
Hold reads use the hold location and the customer contact for own-client access. Writes need the same billing gate as invoice links.
Checkout offers card only and saves no payment method. The short hold deadline does not cap Stripe's provider expiry.
The minute sweep closes sessions when the hold ends. A redirect proves no payment.
The done page confirms a booking only after a confirmed or rebooked deposit outcome.
A slot-lost deposit remains recorded, triggers no automatic refund, and tells the customer the business will contact them.

## Request a document payment with a copied link

1. Use `payment_links_create` with `subject_kind: document` and the issued invoice ID as `subject_id`.
   The current invoice version needs a `bill_to` contact. Otherwise create answers 400 `payer_contact_required`.
2. Send a unique body `idempotency_key` through MCP, or an `Idempotency-Key` header through REST.
3. Copy `link.url` from the create response. A retry with the same fields and key returns the same URL.
4. Use `payment_links_list` with `limit`, then pass `next_cursor` as `cursor` until null, or use `payment_links_get`.
   Reads take no row locks and write nothing. Pages can be short or empty because inaccessible scanned rows are filtered.
5. Use `payment_links_cancel` to revoke the link. Send its `updated_at` as query `expected_updated_at` for a conditional cancellation.

Scopes are `payment_links:read` and `payment_links:write`. Every operation checks subject location and own-client access.
Create and cancel require OWNER, ADMIN or a MANAGER with `billing`. Member credentials may list and read reachable links.
New links require enabled Stripe, otherwise create answers 409 `connected_account_unavailable`. A keyed replay of an existing link answers 200 before this account check.
Another collecting invoice or hold link answers 409 `payment_link_exists`.
For disconnected-account ACH settlement, `details.blocking_reason` is `payment_settling_account_disconnected` with `details.payment_started_at`, only with `details.existing_link_id`, after `payment_links:read` and organization, location and own-client access checks.
Processing evidence from a receipt counts as session completion, even when checkout_completed_at is absent.
Completed sessions release only after recorded verified payment, attempt failure, session expiry or Stripe-confirmed intent cancellation.
ConnectPaymentHandler records Stripe-confirmed cancellation from payment_intent.canceled. A local sweep cancellation does not release collection.
`details.existing_link_id` requires `payment_links:read` and organization, location and own-client access.
A missing or inaccessible hold answers 404 `payment_link_not_found`.
A lost-access replay answers 404. A changed request under the same organization key answers 409 `idempotency_conflict`.
Read and cancel responses omit the URL. Processing means pending until a verified receipt records success.
After a deposit void, newer live links without a recorded, unvoided deposit block older links unless they have their own created, open or processing attempts. Other collecting links block them.
Copied links support issued invoices and hold deposits. Sending rechecks that the invoice or hold is available, then returns `sent`, or `blocked` with permitted alternatives; a held collection answers `collection_held`. Send `Idempotency-Key` through REST to reuse the same conversation key on retries. A link created without that key answers 422 `payment_link_send_requires_idempotency_key` because Iris stores only its token hash.
Create answers 400 `checkout_currency_not_supported` for BTN, CUP, ERN, IQD, IRR, ISK, KPW, LYD, MGA, MRU,
SDG, SSP, STN, SVC, SYP, TMT, UGX, VED, VES, XCG and ZWG.
BHD, JOD, KWD, OMR and TND amounts must be divisible by 10 minor units.
Other amounts in these currencies answer 400 `checkout_amount_not_supported`.
Opening existing links and applying receipts enforce the same encoding rules. Iris performs no currency conversion.

## File approval requests and payment claims

Use `approvals_create` to file a request with `approvals.file`.
Use `approvals_withdraw` to withdraw your request with `approvals.withdraw`.
If either operation answers 409 `approval_execution_conflict`, retry the request.
For `approvals_create`, keep the same body and idempotency key.
Use `payments_create_claim` to report a payment claim with `payments.claim`.
The claim checks document and contact locations without requiring record access. Omit an optional ID or send null when absent.
A claim that answers 404 `record_not_accessible` did not file. Check the supplied IDs and the credential's organization and location scope.
These actions require no contact, amount or machine approval. Decisions and payment verification keep their existing checks.

Every starter role holds these actions and both draft-write actions below.
Managers without billing can grant `approvals:write`, `payments:write`, `invoices:write` and `proposals:write` through these actions.
Other operations under these scopes keep their separate checks.

## Draft and issue invoices and proposals

Use `invoices_list` or `proposals_list` to find drafts. Use `invoices_get` or `proposals_get` to read one draft.
Create drafts with `invoices_create` or `proposals_create`, and change them with `invoices_update` or `proposals_update`.
Invoice draft writes require `invoices.draft_write`. Proposal draft writes, including revision, require `proposals.draft_write`.
These actions prepare or change drafts only, with no contact, amount or machine-approval gate.
Pass `source: { kind: 'work_record', id }` to create a draft from a work record in the same organization. For invoice policy fees, pass `source: { kind: 'appointment', id }`; the appointment must be visible and have a due no-show or late-cancellation fee.
Fee lines are server-owned. A supplied or changed fee line answers 409 `fee_line_not_editable`, a deposit refund refusal answers 409 `deposit_refund_refused`, and an appointment with no due fee answers 422 `fee_not_due`.
Document line writes accept `unit_label` as a string of at most 100 characters or null.
Send a non-null `fee_kind` only on a fee line. The values are `no_show` and `late_cancellation`.
Send a non-null `reduces_line_id` only on a credit line. It must be a UUID.
Invalid fields answer 400. Null is allowed for all three fields on any line.
An Iris invoice has one version, so a draft invoice cannot carry a credit link.
Any credit link on an invoice answers 409 `credit_link_not_editable`.
Credit links are carry-back only on proposal revisions.
For proposal revision draft replacement, send the latest stored credit line `id` and its unchanged `reduces_line_id`.
The linked line must belong to the same organization and another version of the same document.
New, changed, foreign or unmatched links answer 409 `credit_link_not_editable` and write nothing.
Create and revise with caller lines refuse links. Omit revision lines to copy their existing links.
Null drops a link, and removing a credit line is allowed. Each replacement assigns new line ids.
Read the latest draft after each save and use those ids for the next replacement.
These operations return document lines, parties, sources and totals. Use `invoices_replace_draft` or
`proposals_replace_draft` to replace lines, parties, discounts and prices-include-tax. For a draft document, send its
`updated_at` as `expected_updated_at`. For an issued or accepted proposal, read the version with `state: draft` from
`proposals_get.versions` and send that version's `updated_at` as `expected_updated_at`. On an issued or accepted proposal,
replace and acknowledge return `draft_version.updated_at` for the next draft write. To acknowledge an estimate line before issuing, call
`invoices_acknowledge_line` or `proposals_acknowledge_line` with a unique `idempotency_key`. They require an OWNER
or ADMIN, or a MANAGER with the `billing` power at their locations. Organization keys may also call them.
Other members get 403 `insufficient_role`. To issue a draft, call `invoices_issue` or `proposals_issue`.
For draft issue, send the document `updated_at` as `expected_updated_at`.
For proposal revision issue, send the revision draft version `updated_at` from `proposals_get.versions` or the last response `draft_version`.
A stale token answers 409 `stale_revision` and changes nothing. A token read before another caller issues the draft differs.
A missing revision draft also answers `stale_revision`. A current token keeps the usual `document_not_draft` or `proposal_not_revisable` state refusal.
After `stale_revision`, read the document again and send a new `idempotency_key`.
The failed call keeps its receipt, so a same-key retry answers 409 `idempotency_outcome_unknown`.
Omitting the token keeps the current behaviour. After success, a retry with the same idempotency key returns the stored result.
For `proposals_replace_draft`, send optional `milestone_plan` entries with `milestone_no`, `share_ppm` and `final`.
Invoice milestone replacements can answer 409 `milestone_lines_locked` or `milestone_out_of_plan`.

Include the issuer snapshot when needed and send a unique `idempotency_key`. Issue assigns the next number, freezes
rounded minor-unit figures and snapshots, and returns a SHA-256 content hash. A confirmed organization currency and
acknowledged prices are required. Issuing is irreversible, never calls a payment provider, and a repeat with the same
key returns the first result. A changed request with that key returns `idempotency_conflict`. An invoice issue needs
the `billing` manager power. A proposal issue needs the `proposals.issue` action. Read the issued document again before
you report its number or total. On HTTP 202 `approval_requested`, the draft remains unissued and staff approval is pending.
The response contains `approval_request_id` and the decision `reason`, such as `machine_actor` or `amount_limit`, with no amounts.
Ask staff to approve it in Iris. Retry with the same idempotency key.
The server rechecks authority and `approval_valid_for` in the same transaction, issues once, and answers HTTP 200 with the normal result.
A second retry replays that result. A rejected or expired request answers HTTP 403 `approval_denied`.
A new key files a new request.
Call `approvals_get` with that id as `approvalId` and `approvals:read`, or ask staff to review it in Iris.
Check the approval outcome and read the document before reporting execution. A pending approval is not an issued document.
For an invoice, an approved retry also applies eligible linked deposits before storing the result.
After HTTP 409 `deposit_set_changed`, retry the same request with the same idempotency key.

With financial access, `invoices_get` also returns `deposit_applied_minor` and `deposits`.
Each deposit has `payment_id`, `hold_id` and live `amount_minor`, ordered by payment id.
Amounts use integer minor units, net of releases and active return reservations.
An invoice without deposits returns zero and an empty array.
Only `invoices_get` (`GET /api/v1/invoices/{id}`) and the staff detail read
`GET /api/documents/invoices/{id}` return these fields. Proposals, lists and mutation responses omit them.
Each detail response reads the document and deposit figures in one database snapshot.
To apply a verified appointment deposit at issue, `appointment_id` alone on the matching invoice line is enough.
With only `appointment_line_id`, the draft writer resolves and stores its appointment ID.
The appointment must be in the key's location scope. A supplied booking line must belong to that appointment.
Invalid links answer 404.

Read an invoice's `issuer` before discussing corrections. For `stripe`, make credit notes and voids in Stripe.
Financial readers receive `due` and `provider_amount_remaining` as money objects beside totals and settlements.
Use `due` for the Iris balance: total minus credited minus settled, for either issuer.
`provider_amount_remaining` shows Stripe's last reported balance and is null for Iris-issued invoices.
These money fields are omitted without financial access. Iris copies Stripe figures without rounding.
Newly mirrored Stripe lines return `line_kind: "provider"` and signed `unit_price.amount_minor`, negative for proration credits.
Earlier lines keep `custom` and an absolute price, so one invoice history can contain both shapes.
A paid Stripe invoice with zero Iris due returns `paid_at` and moves `closed_unpaid` collection back to `active`.

Send an issued document with `invoices_send`, `proposals_send` or `credit_notes_send`. Include a unique
`idempotency_key`. HTTP 200 lists each queued, blocked, sent or failed delivery.
For `credit_notes_send`, pass at least one recipient unless `select_all` is true. An empty resolved
list answers HTTP 400 `recipients_required` and creates no approval or delivery.
HTTP 202 `approval_requested` means staff approval is pending and no delivery was created.
Ask staff to approve it in Iris. Retry with the same send key.
The server rechecks authority and `approval_valid_for` in the same transaction, sends once, and answers HTTP 200 with the normal result.
A second retry replays that result. A rejected or expired request answers HTTP 403 `approval_denied`.
A new send key files a new request.
Follow `approval_request_id` with `approvals_get` and `approvals:read`, or ask staff to review it in Iris.
Read the approval outcome and the document before reporting a send. Do not repeat the send with a new key while approval is pending.
For `invoices_send`, retry with the same caller arguments, including defaults or `select_all`, to replay the stored send result.
It creates no new deliveries. A changed request or resolved recipient list answers 409 `idempotency_conflict`.
With a new key, `invoices_send` answers `409 hosted_invoice_blocked` while the business's Stripe
account lets the hosted invoice page save a payment method. It sends nothing. With `reason`
`hosted_payment_method_save_not_never`, tell the user to set "Save payment method on hosted invoice
page" to never in the Stripe Dashboard. With `hosted_payment_method_save_unverified`, try again later.
While `connected_account_get` shows `hosted_payment_method_save` as null, a send with a new key answers
`hosted_payment_method_save_unverified`. Tell an owner or admin to choose Check status on the payments
settings page, which sets it to never.

## Revise a proposal and record its acceptance

1. Read `proposals_get`. Call `proposals_revise` with the proposal id and its document `updated_at` as `expected_updated_at`. Send changed `lines` or `parties`, or omit a list to copy it. Send a unique `idempotency_key`.
2. Call `proposals_issue` with the revision draft version `updated_at` as `expected_updated_at` to issue it under the same number. On HTTP 200, the old version becomes superseded, and the proposal needs a new acceptance. On HTTP 202, follow the pending approval as above. `proposals_issue` answers 500 for every key until IRIS-6250 lands.
3. When the customer accepts by email or phone, call `proposals_get` and read the current version's `id` and `content_hash`.
4. Call `proposals_record_acceptance` with `document_version_id`, `content_hash`, `method` (`staff_email` or `staff_phone`), `person_name`, an `evidence_note` and a unique `idempotency_key`.
5. When the customer declines, call `proposals_decline` with the same version and person instead.
6. To close an issued proposal with no decision, call `proposals_withdraw`. To change an accepted one, revise it.

For revise and revision issue, a stale token answers 409 `stale_revision` and changes nothing.
A current token keeps `proposal_not_revisable` for a proposal in the wrong state.
An existing revision draft makes a token-bearing revise answer `stale_revision`, even when the proposal token matches.
After `stale_revision`, read the proposal again and send a new `idempotency_key`.
The failed call keeps its receipt, so a same-key retry answers 409 `idempotency_outcome_unknown`.
Omitting the token keeps the current behaviour.
After success, a retry with the same idempotency key returns the stored result.

A decision needs the `proposals.record_acceptance` action, which OWNER, ADMIN and the `sales` role hold. The action is machine-gated: over an API key or OAuth grant, steps 4 and 5 answer 403 with `decision` `needs_approval` and `approvals_required`, and record nothing, so a person records the decision in Iris. Never record an acceptance for an agent or a sequence: the call is refused. A version takes one decision, so a second is 409 `proposal_already_decided`. An acceptance by a method the business does not take (document settings `acceptance_methods`) is 409 `proposal_acceptance_method_disabled`. A decline is not gated.

To learn whether an invoice arrived or was opened, call `invoices_list_events` with the invoice id.
`delivery_confirmed` and `delivery_failed` are provider outcomes of a sent delivery. `link_viewed`
and `pdf_downloaded` are opens of its public link. Read on while `page * limit` is less than `total`.

## Correct invoices and close collection

1. Call `credit_notes_list` or `credit_notes_get` with `invoices:read` to inspect issued and draft credit notes.
2. Call `credit_notes_create` with the invoice id, line amounts in minor units, a reason and a unique `idempotency_key`. API keys and OAuth grants need an enabled `credit_notes.issue` action rule and role limit that cover the note total that Iris calculates from the lines. This route takes no `expected_updated_at`: Iris reads the invoice token itself when it prices the lines. If the invoice changes before the write, for example when another credit note is issued, the call answers 409 `stale_revision` and writes nothing. Read the invoice again and retry with a new `idempotency_key`.
3. Call `credit_notes_issue` to freeze the note. The tax difference is rounded once per rate and the invoice balance is updated atomically. The same `credit_notes.issue` rule must cover the draft note total.
4. Call `credit_notes_send` with the issued note id, recipients and a unique `idempotency_key` to deliver it by email, SMS or PDF.
5. Call `invoices_void` with a reason only for an issued invoice with no settlement or credit. The issued number remains. API keys and OAuth grants need an enabled `invoices.void` action rule and role limit that cover the invoice total. A draft invoice answers 409 `document_not_issued`. Issue it first, or edit the draft instead.
6. Call `invoices_close_unpaid` with a reason to stop collection while keeping the balance. Later payments can still allocate. API keys and OAuth grants need an enabled `invoices.close_unpaid` action rule and role limit that cover the open balance.
7. Call `invoices_reopen` to return a closed invoice to active collection.

Correction writes use `credit_notes.issue`, `credit_notes.send`, `invoices.void`, `invoices.close_unpaid` and `invoices.reopen`; OWNER and ADMIN hold these actions by default. Calls require confirmation and the matching action decision. Without a matching rule, a key gets 403 `machine_actor`. Below the amount, it gets 403 `amount_limit`. They are irreversible except for reopening collection.

## Pause and resume invoice collection

`invoices_pause_collection` cancels live reminder enrollments for an issued invoice.
`invoices_resume_collection` activates collection. It creates one enrollment in the configured reminder sequence when
collections are enabled, the invoice is collectable, and no live enrollment exists. The sequence must be active,
unpaused, an automation for billing, and either organization-wide or at the invoice location.
The enrollment uses the invoice due date, or issue date, at 09:00 in the organization timezone.
Both require `invoices:write`, confirmation and the `invoices.collection` action on the invoice.
OWNER, ADMIN and the `billing` manager power hold it by default. MEMBER and Billing starter roles do not.
A custom role can grant it. Location limits still apply. Missing authority answers 403 `action_not_held`.
This action needs no amount or machine gate. API keys and OAuth grants are checked as their principal.
Agent rules do not apply because no agent path calls these operations.

SQL re-derives the `invoices.collection` action. User actors use request mode. A denial raises its reason.
A user decision of `needs_approval` answers 409 `approval_required`. Non-user actors, including API keys, agents and OAuth grants,
use review mode. This skips the machine gate and still refuses principals without `invoices.collection`.
Internal `system`, `seed` and `migration` actors remain allowed. The routes have no approval flow.

They return the invoice with its collection state. A held invoice answers 409 `collection_held`.
Only staff clear dispute holds through the SQL RPC. No product caller exists until ticket 281.
A win retains `dispute_review` until staff clear it. Collection controls do not change invoice money.
Each operation declares the other as its reverse, with `invoices_get` as the record read.
Optional `expected_updated_at` guards both writes. A stale revision answers 409 `stale_revision` and changes nothing.
A closed unpaid invoice answers 409 `invoice_already_closed` to pause or resume.
Use `invoices_reopen` to reopen collection. A zero-due Stripe paid event also returns closed collection to `active`.

## Record payments and receipts

The payments API records verified money movement and its allocation history. It does not call
Stripe or another payment provider.

1. Call `payments_list` or `payments_get` with `payments:read` to find a recorded payment.
2. Call `payments_record` with `payments:write` to record a verified payment. Send a unique
   `idempotency_key`. A retry with the same details and key returns the first result.
3. Call `payments_allocate` with an issued invoice id and `amount_minor` to allocate payment
   funds. Send `idempotency_key` and confirm the requested allocation before calling.
   Stripe invoice settlements can allocate only to their earmarked invoice. A different invoice
   returns HTTP 409 `payment_earmark_mismatch`.
4. Call `payments_release_allocation` with the allocation id and amount to release funds. Send
   `idempotency_key` and confirm the release before calling.
5. Call `payments_void` only for an unapplied payment. Send `reason` and confirm the void.
   `payments_void` answers 409 `payment_has_returns` while the payment has a refund that is
   requested, approved, pending or succeeded.
6. Call `payments_create_claim` to submit a payment claim for approval. Send the claim details,
   a unique `idempotency_key`, and confirm the submission.
7. Call `receipts_list` or `receipts_get` with `receipts:read` to read receipts after recording
   or allocating a payment.
   Call `receipts_send` with `receipts:write` to send a receipt. Send a unique `idempotency_key`
   and the recipients, and confirm the send. A blocked delivery lists its reason and the
   permitted alternatives. On `409 receipt_payment_voided`, the payment was voided: do not
   send its receipt. On HTTP 202 `approval_requested`, staff approval is pending and no receipt was sent.
   Ask staff to approve it in Iris. Retry with the same idempotency key.
   The server rechecks authority and `approval_valid_for` in the same transaction, sends once, and answers HTTP 200 with the normal result.
   A second retry replays that result. A rejected or expired request answers HTTP 403 `approval_denied`.
   A new send key files a new request.
   Follow `approval_request_id` with `approvals_get` and `approvals:read`, or ask staff to review it in Iris.
   Check the approval outcome before reporting a send. The response has the decision `reason` and no amounts or deliveries.
8. On `409 idempotency_key_reused`, use a new key only when the request details are different.
   On an approval error, read the claim and follow the approval decision before retrying.

## Refund a payment

Refunds use the `payments.refund` action, which OWNER and the finance_manager role hold by default. A refund reserves
its amount at once: unapplied funds first, then the newest invoice allocations, so those invoices
become due again.

1. Call `payments_get` to read the payment's `currency`, `amount_minor`, `returned_minor` and
   `method`. A `bank_debit` payment refunds only in full.
2. Call `payments_request_refund` with `amount_minor`, the payment `currency`, a `reason` and a
   unique `idempotency_key`. Confirm the amount with the user first. Refunds are machine gated, so
   an API call always files an approval: it answers 202 with `outcome: requested` and an
   `approval_request_id`, and the amount is reserved. Tell the user a reviewer must approve it.
3. Once the request is approved (read it with `approvals_get`), call `payments_request_refund`
   again with the same amount and `reason`, the `approval_request_id` and a new `idempotency_key`. `outcome:
   approved` means the refund may go out. Any other `outcome`, such as `payment_disputed`, is a
   refusal: the request is closed and the reservation is released.
4. When the money was already returned outside Iris, such as cash, call `payments_record_refund`
   with the approved `approval_request_id`, and the amount and `reason` it was filed with, instead.
   The reserved return becomes `succeeded`.
   Without an approval it answers 403 with `approvals_required`.
5. Call `payments_list_returns` to show a payment's refunds, their state and failure reason, and
   the allocations they hold. A reservation with `released_at` holds nothing.
6. On `409 refund_exceeds_refundable`, `payment_disputed` or `bank_debit_partial_refund`, do not
   retry with the same amount. On 403 with `approvals_required` from `payments_record_refund`,
   file the refund with `payments_request_refund` first and wait for its approval.

## Manage service plans and allowances

Use `service_plans_list`, `service_plans_get`, `service_plans_create`, `service_plans_update`,
`service_plans_set_price` and `service_plans_set_offerings` for plan configuration. Use
`allowances_list`, `allowances_get`, `allowances_get_balance`, `allowances_list_entries` and
`allowances_grant` for grants and their append-only ledger.
Send an `idempotency_key` when setting a price with `service_plans_set_price`.
The same key and details within 24 hours return the first answer without another price or terms version.
Receipts belong to one credential and operation. Changed details return 409 `idempotency_key_reused`.
Unavailable Redis returns 503 `idempotency_unavailable` before any keyed write. Retry later with the same key.
Without a key, each price call writes again.
`service_plans_set_offerings` returns 400 `duplicate_offering_ids` when the list repeats an offering id,
or another call changed this plan's offerings at the same time.
Remove duplicate ids. Read the plan and send the set again.
All four service-plan writes can return 409 `allowance_conflict` on their allowance-plan path.
Grant, transfer and direct-use writes can return the same code.
It means the allowance write conflicts with an existing record. Read the current state before retrying.
`allowances_record_usage` records units used for work on a work record or task without an appointment.
Send the grant, recipient, quantity, source, reason and your `idempotency_key`.
The key is scoped to your API key or OAuth connection.
A replay with the same details returns the first entry with status `exists`.
Changing any detail, including the reason, answers 409 `idempotency_conflict`.
The action checks access to all three records and refuses units beyond the grant balance. Responses contain units only.
Plan reads use `service_plans:read`, plan writes use `service_plans:write`, allowance reads use
`allowances:read`, and grants and `allowances_record_usage` use `allowances:write`.
Read a plan before changing it, and read its `prices` and `offering_ids` there. Allowance plans list the offerings they cover in sorted order. Subscription plans return an empty `offering_ids` list. Grant calls need
confirmation and an `idempotency_key`. Keep one key for one grant: a retry with it grants nothing
more, and a 409 `idempotency_conflict` means the key already names another grant. Until approval
execution is enabled, `allowances_grant` answers 403 `needs_approval` and does not create a grant.
`allowances_get_balance` needs a `contact_id` or a `group_id`. Read units from `by_unit`.
Grant `funded_minor` appears only for OWNER, ADMIN, or MANAGER with billing.
List, get, balance, entries, grant and transfer responses omit `dedupe_key` for every reader.
Payment and source ids remain visible. Voice and chat caller balances omit funded amounts and stored dedupe keys.

To give available units to another contact or contact group, confirm the transfer with the user.
Call `allowances_transfer` with the source grant id, a positive integer `quantity`, exactly one of `to_contact_id` or `to_group_id`, and an `idempotency_key`.
You may include a `reason`. The caller must reach both the source and destination and pass the `allowances.transfer` action gate under `allowances:write`.
OWNER holds `allowances.transfer` in the starter role catalog. Owners can give it to other roles.
The sold terms must enable transfer. Reserved and consumed units cannot move.
The new grant keeps the original expiry, sold terms and purchase chain. No money row is written.
Retry the same details and key to receive the first grant id. The key is scoped to your API key or OAuth connection.
Changed details return 409 `idempotency_conflict`. Insufficient units return 409 `allowance_insufficient`.
Pending subscription units return 409 `allowance_subscription_pending`. Wait until the subscription is active before retrying.
Disabled transfers and unusable grants return 400. A 403 `needs_approval` or `action_not_held` moves no units.
Read the source and destination balances before reporting a completed transfer.

## Sell, change, pause and resume customer subscriptions

To preview or change an active subscription:

1. Read `customer_subscriptions_get` for its state and next boundary.
2. Call `customer_subscriptions_preview_change` with a plan or quantity change. Its default timing
   is next period. Immediate and dated previews show a prorated charge or credit. This read requires
   `customer_subscriptions:read` and creates no change, invoice or grant. Amounts follow period financial access.
3. Call `customer_subscriptions_change` if authorized, or ask staff to use `/api/payments/customer-subscriptions/{id}/change`.
   `customer_subscriptions_change` needs `subscriptions.change` for next period or `subscriptions.change_now`
   for immediate and dated changes. A key or OAuth token receives 403 `needs_approval` without execution,
   unless a matching enabled `api_key` or `oauth_grant` rule allows `subscriptions.change_now`.
   Scope, role, record access, amount limits and second-person controls still apply.
   The server authorizes the absolute preview adjustment in the subscription currency. Preview errors retain their status.
   A changed adjustment answers 409 `subscription_change_stale` without a write. Read and preview again before retrying.
   A next-period plan or quantity change replaces only its same-kind schedule and returns
   `withdrawn_change_ids`. An immediate or dated change withdraws overlapping plan and quantity
   schedules and returns their ids. It needs `subscriptions.change_now`.
4. Read the adjustment invoice or credit note through the document tools. An invoice can remain
   draft when automatic issue is disabled or refused. Extra units wait for payment. A downgrade
   removes no granted unit and creates unapplied credit, with no cash return.

To pause and resume:

1. Ask staff to pause through `/api/payments/customer-subscriptions/{id}/pause` on a billing boundary.
   The next boundary is the default. The plan must permit pauses. A maximum pause length supplies
   an omitted resume date. Paused time has no period, invoice or grant.
2. Read the subscription again to see its schedule. A chosen resume date runs in the renewal sweep.
3. Ask staff to resume through `/api/payments/customer-subscriptions/{id}/resume` to open a fresh period.
   Before the scheduled pause starts, resume returns `withdrawn` with no fresh period.
   `customer_subscriptions_pause` and `customer_subscriptions_resume` need `subscriptions.change`.
   Both are machine gated and return 403 `needs_approval` for a key. The resume undo target accepts
   optional `expected_updated_at` from the subscription read. A stale value answers 409 `stale_revision`.

Immediate upgrades through `customer_subscriptions_change` and immediate `customer_subscriptions_resume` draft invoices under the caller, answering 403 `action_not_held` or `second_person` instead of 500.

A refused pause can return 409 `pause_not_allowed`, `subscription_change_pause_conflict`, or
`issuer_conflict`. Invalid change fields, tax rates, allowance owner scope, or dates return 400
`subscription_change_tax_mismatch`, `allowance_owner_scope_invalid`, or their field error code.
A Stripe-issued subscription previews from Stripe, and plan and quantity changes apply and sync to Stripe. Interval changes return 400 `subscription_change_interval_mismatch` for an immediate Stripe change, and plans with live default tax rates return 400 `subscription_issuer_option_invalid`. `next_period` and `on_date` timing, including omitted timing, are refused for it, so use `immediate`. Preview returns 422 `preview_unavailable` when Stripe is not connected. Pause and resume return 409 `issuer_conflict` for it. Cancel returns 409 `issuer_conflict` for a bound or non-pending row, and `subscription_stripe_push_pending` while its create is before the push cursor or its organization is parked.
Pause dates return 422 `pause_not_on_boundary` or `pause_too_long`.
An inaccessible subscription returns 404.

Customer subscriptions are the plans a business sells its own customers, not the business's Iris
plan. Set them up in this order:

1. Create a subscription plan with `service_plans_create`, `plan_type: "subscription"`, a
   `billing_interval` and, to grant units each period, an `allowance_plan_id` with
   `units_per_period`.
2. Price it with `service_plans_set_price` and an `idempotency_key` in each currency you sell it in.
   Retry the same key and details to receive the first answer without another price or terms version.
   A price is at least 1 minor unit. A zero price answers 400 `subscription_price_invalid`.
3. Ask a staff member to sell it in the Iris dashboard. A key's `customer_subscriptions_create`
   answers 403 `needs_approval` and creates nothing, because selling a subscription needs approval.
4. Read `customer_subscriptions_list_periods` to find period 1's `invoice_id`. The subscription
   stays `pending` until that invoice is paid, and then turns `active`. A period shows its
   `unit_amount_minor` only to an OWNER or ADMIN principal, or a MANAGER principal with the billing
   power, as `invoices_get` returns totals. An unrestricted organization key with no owner user
   receives neither.
5. To stop it, ask a staff member to cancel it. A key's `customer_subscriptions_cancel` also answers
   403 `needs_approval` and changes nothing.

A part-paid or credited issued first invoice leaves the subscription pending and answers 409
`invoice_settled` or `invoice_credited`. The cancel succeeds once the money is released or credited.

`customer_subscriptions_create` answers 400 with the documents module's invoice-issue codes.
An Iris-issued create drafts period 1's invoice under the caller: missing `invoices.draft_write` answers 403 `action_not_held`, while second-person control on that action answers 403 `second_person`.
Either refusal creates nothing.

Use `customer_subscriptions_list` for `issuer`, state, plan, quantity and `next_boundary_at`; filter by
`bill_to_contact_id` or `bill_to_group_id`;
`customer_subscriptions_get`
adds `scheduled_changes`. Scheduled changes are ordered by `effective_at` and include the
change kind, timing, target plan, quantity and effective date. `adjustment_minor` appears only with financial access.
Reads use `customer_subscriptions:read`. Create and cancel use `customer_subscriptions:write` and
the machine-gated actions `subscriptions.create` and `subscriptions.cancel`, so `tools/list` does
not list them for a key. A cancel ends the subscription at the end of its period by default, and an
immediate cancel answers 409 `immediate_cancel_not_allowed` unless the business allows it. A cancel
credits nothing. A pending credit-terms cancel closes all unused grant units. A used unit keeps the
invoice collectible and its reminders active. A reserved unit answers 409 `subscription_units_reserved`
and leaves the subscription, grant, invoice and reminders unchanged.
The cancel succeeds once the hold that reserved the unit is released. The unpaid issued first invoice is void only when no grant unit is used. A draft first invoice stays
unchanged. It refuses while that invoice is part-paid or credited. Renewal runs on its own: Iris opens
each next period and its invoice at the boundary.

A subscription's `issuer` is `iris` or `stripe`, including subscription objects returned by create and cancel.
Stripe controls a Stripe-issued subscription's periods. Its grant waits until the provider invoice is paid.
To sell one, pass `issuer: "stripe"` to `customer_subscriptions_create`, which still needs approval for a key. It needs an active Stripe connection (503 `stripe_connect_unavailable` otherwise) and a contact bill-to (400 `subscription_bill_to_contact_required`). It refuses a contact without an email, credit terms, a future `starts_at`, `auto_issue` false, `auto_send` true, a plan with default tax rates, or a plan interval longer than three years (400 `subscription_issuer_option_invalid`). The subscription starts pending with no Iris period or invoice. The first paid Stripe invoice funds period 1.

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

Call `me_get_permissions` (`GET /api/v1/me/permissions`) to read your effective actions and role labels.
It needs no scope. Use `limits` to compare granting holders in the requested currency.
A holder without limit rows is unlimited. A limited holder with no matching currency grants zero.
The highest granting limit wins. Actions still need record access, credential scopes and any required approval.
The `classes` list stays empty until field-class grants are available.

If `me_get` returns 401, the key is missing, wrong or revoked, or an owner or admin turned the
person's agent access off. Stop and ask the user: My agent access says when access is off, and
then the same key works again once it is back on. Do not retry.

## Review approvals

Use `approvals_list` with `approvals:read` to list requests you filed or may review, newest first.
The default limit is 25. Resume with the opaque `next_cursor` from `approvals_list` as `cursor`.
A malformed cursor answers 400. Pass the optional `limit` to change the page size.
Use `approvals_get` with the same scope to read one request by id.
The API applies the credential's member and location scope, and returns 404 when the request is outside that scope.
Requester names appear when available.

Money requires maySeeFinancials, or a pending request the reader may review.
Otherwise, both operations omit `amount_minor`, `currency`, and monetary fields nested in `params`.
Organization keys without financial access receive the same redaction. The `approvals:read` scope alone grants no access to amounts.
`approvals_create` and `approvals_withdraw` apply the same redaction to their responses.
These approval-specific money grants apply to that request alone.
Approval responses list their fields and params keys by kind and action.
Contact values in params require their contact or appointment field grants.
Linked record ids outside the reader's record reach are hidden.
See the [approval params catalogue](../../../../architecture/public-api.md#approval-params-by-kind) for permitted keys and nested shapes.

Use `approvals_create` with `approvals:write` to file a request for an action that needs approval.
Send a unique `Idempotency-Key` header, or the same value in `idempotency_key`, and retry with the
same request details when a network failure leaves the result unknown. Use `approvals_withdraw`
with `approvals:write` to withdraw a pending request that this credential created. Staff decisions
stay in the dashboard. The public API has no decision operation.
The `off_session_charge` kind is readable through these approval routes, but only staff can file it.

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

| statusCode | error                                                                                               | What to do                                                                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400        | (validation)                                                                                        | Read `message`, fix the request, try once more.                                                                                                                                                                                               |
| 400        | `sequence_activation_blocked`                                                                       | Show the user `blockers`. Fix them or stop.                                                                                                                                                                                                   |
| 401        |                                                                                                     | The key is missing, wrong or revoked, or an owner turned the person's agent access off. Stop and ask the user.                                                                                                                                |
| 403        | `insufficient_scope`                                                                                | The key lacks the scope in `required`. Tell the user to create a key with it under My agent access, or under Organization > API keys for an organization key.                                                                                 |
| 403        | `insufficient_role`                                                                                 | The person behind the credential is a MEMBER, and members cannot call this operation or act for another team member. A key with a role gets it where a person in that role, with its powers, cannot act. Do not retry. Ask an owner or admin. |
| 404        | `not_found`                                                                                         | The id does not exist in this organization. Search again. Do not guess ids.                                                                                                                                                                   |
| 404        | `not_found` from `sequences_get_schedule`, `sequences_start_schedule` or `sequences_pause_schedule` | The broadcast may have no schedule yet. Set one with `sequences_set_schedule`.                                                                                                                                                                |
| 409        | `sequence_inactive`                                                                                 | The sequence is off. Do not enroll. Ask the user.                                                                                                                                                                                             |
| 409        | `sequence_paused`                                                                                   | The sequence is paused. Resume it first, or wait.                                                                                                                                                                                             |
| 409        | `sequence_not_paused`                                                                               | `sequences_resume` on a sequence that is not paused. Nothing changed. Read its `status`.                                                                                                                                                      |
| 409        | `contact_not_at_location`                                                                           | The sequence runs for one location and the contact is not there. Do not retry. Tell the user.                                                                                                                                                 |
| 409        | `sms_not_permitted`                                                                                 | The communication gate blocked the send. Read `reason`, `step` and `alternatives` (permitted endpoints are masked for agents; a PDF document is always offered), then do not send or record consent to bypass it. |
| 409        | `stale_revision`                                                                                    | The record changed after the `expected_updated_at` you sent. Nothing changed. Read it again, then decide.                                                                                                                                     |
| 409        | `deposit_set_changed`                                                                               | A linked deposit changed while an invoice was issuing. Retry the same request with the same idempotency key.                                                                        |
| 429        |                                                                                                     | Too many requests. Wait 60 seconds, then retry.                                                                                                                                                                                               |
| 5xx        |                                                                                                     | For other 5xx responses, retry once after a few seconds. Then stop and report. A read may retry a 503 with backoff. Read the current state before retrying a write whose outcome is unknown.                                                                                                                                                                                         |

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
| `contacts:read` | search and read contacts, export them as CSV (`contacts_export`), list suppressed addresses, and read a contact's company and owner at a location. List their phone numbers, email addresses, postal addresses and merge suggestions |
| `contacts:write` | create and update contacts, notes, tags, suppression and SMS consent, read the stops, opt-ins and opt-outs of a contact's phones and emails, enroll contacts in sequences or cancel them through events, set a contact's locations, company and owner, and suppress or lift an address |
| `sequences:read` | read sequences, their saved versions, enrollments, send logs and totals, and a broadcast's schedule and runs |
| `sequences:write` | create, change, activate, pause, resume, duplicate and revert sequences, enroll and cancel, and set, start and pause a broadcast's schedule and cancel one run, and create and change send windows |
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
| `integrations:read` | read the GoHighLevel connection (location pairs, sync status, conflicts, transfer runs, held work and what each pair syncs), the HubSpot sync, the Zapier settings and the Google Calendar connections. Also read connected provider accounts and their external bindings |
| `integrations:write` | run the GoHighLevel connection (pair a location, start, pause, reconnect or disconnect its sync, change what it syncs, settle conflicts and held work, and run a migration cutover), run the HubSpot sync, change the Zapier settings, and sync or disconnect a Google calendar |
| `phone_lines:read` | read the organization's phone lines and the locations each one answers for |
| `phone_lines:write` | add a Twilio or SIP trunk line, route a line to locations, and disconnect, reconnect, retry or delete a line |
| `call_forwarding:read` | read the numbers the phone agents may transfer a call to |
| `call_forwarding:write` | add, change and delete the numbers the phone agents may transfer a call to |
| `staff:write` | read and change where a staff member hears about their appointments, and your own |
| `assistant:write` | delete your own private Assistant note |
| `feedback:write` | send product feedback to Iris as yourself |
| `context_engine:read` | read the facts Iris knows about the business, one fact at a time or all of them, the links between its records, the archetype, the suggested links and the snapshots |
| `context_engine:write` | write, remove and restore facts and their sharing, set the archetype, add, change and delete links, run and review suggested links, and capture and publish snapshots |
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
| `billing:read` | read the subscription and list the plans it can switch to |
| `billing:write` | switch the subscription's plan and keep a subscription that is set to cancel |
| `organizations:write` | create another organization you own |
| `groups:read` | read groups (containers, teams, territories, assets and contact groups) and their type labels |
| `fields:write` | configure, archive and restore fields, and set object labels and owner fields (OWNER or ADMIN) |
| `fields:read` | read the custom fields of each record kind and the labels of each kind |
| `task_types:read` | read the task types with their statuses and moves, and the task templates |
| `tax_rates:read` | read tax rates and the offerings, add-ons and plans each is the default of |
| `tax_rates:write` | create, change and archive tax rates, and set a subject's default (an owner, an admin or an organization key with no role only) |
| `tasks:read` | read tasks with their type, status, assignees, due date, subtasks and links |
| `tasks:write` | create, update, transition, assign, reclassify, link, unlink, archive and restore tasks (a member's or manager's credential at its own locations or with no location) |
| `changes:read` | read who changed a record, when and why, together with the record's own read scope (`contacts:read` for a contact) |
| `staff:read` | read the staff members, with or without a login, archived ones included, and where each works |
| `staff:write`         | add staff, read and change their notification settings and login, activate, deactivate, and set services, hours, time off                                                                                   |
| `payments:read`       | read recorded payments, their allocations and their refunds and returns                                                                                                                     |
| `payments:write`      | record payments, allocate or release funds, void unapplied payments, create payment claims, and request or record refunds                                                                   |
| `receipts:read`       | read payment receipts                                                                                                                                                                        |
| `connected_account:read` | read the business's Stripe account for customer payments: onboarding state, what Stripe still needs, the hosted invoice setting, and the bank debit switch and capability |
| `disputes:read` | read the Stripe disputes on customer payments, their evidence deadlines and the payment, reversal and invoices each links to |

Each operation in `references/endpoints.md` names its scope. The OpenAPI document at
`/api/v1/docs-json` carries it as `x-iris-scope` on each operation, null when any live key may
call it. Over MCP, the tool list shows only the tools your key's scopes allow.

A credential acts with the role of the person behind it. An organization key and an owner's or
admin's credential reach the whole organization.

For a MEMBER, each operation in `references/endpoints.md` names its member access.
An operation with `x-member-access: action` needs its `x-iris-action` action granted to the caller's role
through the SQL request decision, `principal_can_perform`.
Some operations also publish `x-iris-action-by-body`. On those, `x-iris-action` names only the default
action, and a request body field can select another one. For example, `customer_subscriptions_change`
publishes `subscriptions.change`, but an `immediate` or `on_date` `timing` selects
`subscriptions.change_now`. Read `x-iris-action-by-body` to find the action your request needs.
A policy denial answers 403 with the SQL `reason` and `approvals_required`. The exception is
`record_not_accessible`, which answers the usual 404 `not_found` with no decision details, so the
response does not show whether the record exists. See `references/auth.md` for details.

Operations without action access still use `open` (allowed), `scoped` (allowed, limited
to the member's locations), `sms_setting` (allowed while the member's SMS setting is on, limited to
their own clients at their locations) or `deny` (403 `insufficient_role`).
IRIS-6866's follow-up converts these rules to action access after launch.
Over MCP, a MEMBER does not see
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

The response also includes `booking_priority`, the owner-configured numeric order for the
location. Lower values are tried first when a request can be served by more than one location;
the field is informational and has no public write operation.

A MANAGER with the appointments power books any team member at its own locations, and reschedules
and cancels anyone's appointment there. `locations_booking_options` shows it every team member, so
book the one the user names. A location-wide block still answers 403, and another location 404.

A MEMBER (staff) reads only the calls of its own clients, the contacts on its appointments, at
either access level. `calls_get` on any other call answers 404, so it is out of reach, not missing.
Without a linked staff profile, `calls_list` is empty.

A MEMBER at the own-records level reads only its own records: its appointments (including every
staff member named by an appointment's `staff_ids` set), the contacts on them, and those contacts'
conversations and calls. Any other contact, conversation, call or appointment answers 404, so it is
out of reach, not missing. Do not retry it. It books only itself.
It may book a new client: any contact at its locations whose id it has.

## Operator recipes

### 0. Create and update a draft document

1. Choose `invoices_list` or `proposals_list` and set `include_archived` only when archived drafts are needed.
2. Call `invoices_get` or `proposals_get` with the document id to read its lines, parties, sources and totals.
3. To create a draft, call `invoices_create` or `proposals_create` with `currency` and `lines`.
   For an appointment deposit, set `appointment_id` on the invoice line. `appointment_line_id` is optional.
   Include `parties` when the document needs a requester, bill-to party or service recipient.
4. Send a new `idempotency_key` on each new create request. Retry the same request with the same key after a transport failure.
5. To change a draft, call `invoices_update` or `proposals_update` with the document id.
   Send `due_on` for an invoice and `valid_until` for a proposal when those dates change.
6. For a draft document, keep its `updated_at` from `invoices_get` or `proposals_get`.
   Send it as `expected_updated_at` for updates, replacement or acknowledgement.
7. On an issued or accepted proposal, replacement and acknowledgement use the draft version's `updated_at` as `expected_updated_at`.
   Read the version with `state: draft` from `proposals_get.versions`. On these revision drafts, each write returns `draft_version.updated_at` for the next draft write.
8. On 409 `stale_revision`, read again and review the current document and draft version before retrying with the matching token.
9. On 409 `purchase_lines_immutable` from `invoices_replace_draft`, stop. Purchase lines retain their sold terms and cannot be replaced.

### 1. Find a contact

1. If you have an email, call `contacts_search` with `email`. It returns the exact match only.
2. Otherwise call `contacts_search` with `q` (part of a name, email or phone).
3. If more than one contact matches, show the user the candidates (name, email, phone) and ask.
4. Call `contacts_get` with the `contactId` for the full record: stage, tags, custom fields and `relationships {key: [ids]}`. Contact targets resolve through merges. A
   MEMBER, and a MANAGER without the contacts power, get only `id`, `name`, `email` and `phone`,
   from both `contacts_search` and `contacts_get`. Contact responses may also include `external_sync`
   entries with each provider's status and last sync time; they never include provider ids.
5. To see what happened with the contact, call `contacts_list_interactions` with the `contactId`.
   It lists calls, chats and SMS threads, newest first. Email is in `conversations_list`. Filter with `channel` or `status`. A `page` past the last interaction answers 400.
   To read the contact's notes, call `contacts_list_notes` with the `contactId`. It pages newest first, with `limit` at most 100. A `page` past the last note answers 400. If the `contact.notes` view grant is denied, it returns an empty page and `restricted_fields: ["contact.notes"]`. A denied page always reports `page: 1`.
   A MEMBER, and a MANAGER without the contacts power, get `insufficient_role` there. Notes that belong to one location (dashboard notes and GoHighLevel syncs) are not listed.
   Keep a token-loss entry with `status: disconnected` and its last sync time. Ask the owner to reconnect.
   Retired bindings are omitted. Google integration account health uses calendar bindings, so event bindings cannot hide token loss.

Never create a contact to "find" one. `contacts_upsert` creates or updates by email, or by phone
alone when there is no email, so use it only when the user wants a contact created or changed.

Use `contacts_find_by_endpoint` with exactly one `phone` or `email` to find every reachable contact
holding that value. Whole-record readers include non-primary endpoints. Identity-only readers match
primary endpoints only. Use `contacts_list_groups` to list reachable contact groups for one contact.
Use `contacts_set_communication` with `endpoint_id`, `purpose`, `channel` and `state` to record an
endpoint rule. The response returns the same communication facts as `contacts_get_communication`
when the caller has `contacts.details`; otherwise its `items` is empty because the facts are redacted.

When `contacts_upsert` includes an email and a phone, the email-keyed contact keeps its identity
and the phone is recorded as a non-primary lead endpoint. With a phone and no email, the phone is the
key. Send it with + and a country code. Iris updates the one contact that holds the number, or
creates one when none does. A 409 means more than one contact holds it: call
`contacts_find_by_endpoint` with the phone, ask the user which contact they mean, and change it
with `contacts_update`. A 409 that names `contacts_restore` means an archived contact has the
phone as its main phone: ask the user before you restore it, then retry.
For `contacts_upsert`, a 404 means the match is outside the key's location scope or own-records reach.
It writes nothing. Do not retry with another key or guess another contact.
With no email, a reach-limited key gets 404 if any phone holder is outside its reach. It gets 409 for several holders only when all are reachable.
The holder reach check covers every holder in one database call.
A contact outside the key's reach answers 404 even when this key created it, for example when unlinked at its location or not yet the member's client.
For a location key, a concurrent create of the same contact at the caller's location merges into that contact.
An own-records key gets 404 until the contact is the member's client.
An unknown email or phone still creates a contact. This is the same existence signal Zapier upsert gives.

For `contacts_upsert`, send optional UUID `location_id` within the key scope and organization.
A key with one location links a new contact there. A key with several locations requires this field on creation.
A 400 `location_id_required` writes nothing. Ask which location the user wants, then retry with that location.
A 403 `insufficient_role` with message `Location access denied` means the location is outside the key scope or organization.
A 400 `location_inactive` means an explicit location is inactive on creation. Choose an active location before retrying.
A sole inactive implied location creates unlinked. An organization-wide key without `location_id`, or a key with no locations, creates unlinked.
Only new contacts get the link. Matched contacts keep their links, including when `location_id` is supplied.
A create and its location link are one write. A failed link leaves no contact and answers an error the caller can retry.

For a stage in `contacts_upsert.fields`, read `crm_fields_get_stage_config` for the stage key and
`contacts_list_stages` for valid stage ids. Send a stage id under that key. An unknown non-empty value
or a live enum stage field without options answers 400 before writing. Empty strings and null clear the stage.
Whitespace-only stage strings clear it and are stored as an empty string.
A non-string, non-null stage value answers 400 `Stage must be a string`. Null or non-array enum options count as no options.
Malformed option items are skipped, so a null item no longer causes a 500, and an item whose `value` is not a string drops out of `crm_fields_list` and `contacts_list_stages`.
A changed live stage key returns 409 `stage_config_changed` if `fields` contains the new key.
Read the current stage configuration and retry.
A stale stage key remains an ordinary field. A changed, non-empty stage on an existing contact fires
`stage_changed` automations and `crm.contact.stage_changed`. A new contact fires only lead-created automations.
`skip_automations: true` suppresses these stage-change effects.

A contact can hold several phone numbers, email addresses and postal addresses, each with a label
and a primary flag.

1. Call `contacts_list_endpoints` with the `contactId` for every phone number and email address,
   with its label and primary flag. A MEMBER, and a MANAGER without the contacts power, get the
   primary phone and the primary email only.
2. Call `contacts_list_addresses` with the `contactId` for its postal addresses. A MEMBER gets
   403 `insufficient_role`: do not retry, the address is not theirs to read.
3. To check for duplicates, call `contacts_list_merge_suggestions`, with `contact_id` for one
   contact. Iris never merges contacts on its own. Tell the user, who confirms a merge in the
   dashboard. A contact marked `restricted` is at a location the user cannot reach: do not ask
   for its name.
4. To see whether a phone or email has opted out, call `contacts_get_communication` with the
   `contactId`. It needs `contacts:write`. Each item names an endpoint, a channel and a purpose
   (`service`, `billing` or `marketing`). Report `stopped`, `restricted` with its
   `restriction_reasons`, and `rule_state` with its `rule_source`. These are facts. Do not tell the
   user that Iris will or will not send: when `rule_state` is null, the send rules decide.

### Contact endpoints and addresses

1. Read `contacts_get` first, then use `contacts_add_endpoint` or `contacts_add_address` with the
   contact id. An endpoint value and address lines are immutable after creation.
2. Use `contacts_update_endpoint` or `contacts_update_address` only for `label` and `is_primary`.
   Making one primary demotes the previous one; a value or lines change is an archive followed by
   an add. Use `contacts_archive_endpoint` or `contacts_archive_address` to remove a part without
   promoting a replacement.
3. These writes need `contacts:write` and the same contact reach as `contacts_update`. A MEMBER
   can act only on a contact in reach, and identity-only readers can address only primary parts.

### 2. Check which sequences a contact is in

1. Find the contact (recipe 1).
2. Call `contacts_list_enrollments` with the `contactId`.
3. Report each enrollment: sequence, `status`, current step, and the next send time.
   The next send time is `next_run_at`. On `sequences_list_enrollments` it is
   `next_step_due_at`, or `next_run_at` when that is empty.
   If the enrollment's `next_step_approval_request_id` is non-null, report Waiting for approval and read it with `approvals_get`.
   A held step's `next_step_due_at` is in the past by design. It does not mean the enrollment is stalled.
   A sequence `status` is `active`, `paused` (every enrollment held, shown as `paused`) or `inactive` (off).

To go the other way (who is in one sequence), call `sequences_list` to find the sequence, then
`sequences_list_enrollments` with its `sequenceId`. Filter with `status`, `contact_id` or
`email`. To list who reached one step, pass its `step_key` as `reached_step_key`.

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

5. A pending run with `approval_request_id` waits for staff approval. Read its request with
   `approvals_get`. Staff decide it in the dashboard, and the sequence advances after settlement.
   The ID remains on a settled run for history. Other runs return null.

### 7. Read sequence totals

1. Call `sequences_analytics` with the `sequenceId`.
2. Report the per-step counts and the rollup. To name the step behind each count, read
   `step_counts_by_key` and match its keys to each step's `step_key` from `sequences_get`. A save
   can move a step to another `step_index`, but its key stays.
3. Read `email_delivery_reporting` before you report email numbers:
   - `supported`: delivery and bounce counts are real.
   - `unsupported`: the sending provider does not report delivery. A zero means "unknown", not
     "none". Say so.
   - `not_applicable`: the sequence sends no email.
4. To say where contacts went, read `paths`. `nodes` counts runs per `step_key`, `edges` and
   `exits` count traversals per `edge_key`, and `implied` counts moves to the next step. Pass
   `since` to count only the runs from that instant on in `paths` and `step_counts_by_key`. The
   per-step counts and the rollup ignore it.

### 8. Build a draft sequence and activate it

1. Call `sequences_capabilities`, `sequences_list_triggers`, `sequences_list_variables` and
   `sequences_get_condition_vocabulary`. Use only the step kinds, triggers, variables and
   conditions they return. `sequences_list_variables` lists only the fields your key can view.
   A customer email or SMS may use unclassed fields and the contact's own `contact_details` and
   `contact_profile` fields. Iris refuses a customer send that uses any other classed field and
   marks that step failed, so keep such tokens out of customer copy.
   The follow-up triggers are `invoice_paid`, `customer_payment_verified` and `proposal_accepted`.
   These enroll only when the sequence has a purpose. Set `purpose` to `service`, `billing` or
   `marketing` with `sequences_create` or `sequences_update` before activation.
2. Call `sequences_create` with the name, trigger, steps and delays. It always creates an
   inactive draft. Do not send `is_active: true`: it returns 400. A `wait` step waits
   `delay_minutes` unless its `wait_kind` says otherwise: `until`, `window`, `anchor` (only in a
   sequence triggered by an appointment) or `event`. An `event` wait needs a positive edge on its
   `wait_config.signal` and `params`, plus a timeout edge, and `timeoutMinutes` becomes its
   `delay_minutes`. `stage_reached` and `converted` need `params.stage`.
   To chain sequences, add an `add_to_sequence` step with `target_sequence_id`: the `id` of
   another automation from `sequences_list`. It sends nothing. It enrolls the contact in that
   automation, after its `delay_minutes`. The sequence itself, a broadcast, a team notice or an
   id that is not the organization's returns 400, as does a sequence at another location for a
   key that acts as a member limited to some locations. When the step runs, it skips the contact and moves on while
   the target is off or paused, already holds the contact, or already took the contact from this
   sequence once.
   An invoice reminder sequence refuses `add_to_sequence` with 400 `invoice_reminder_add_to_sequence` because it has no contact to enroll.
   Remove the Add to sequence step to save.
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
   A follow-up without a purpose answers 400 with a message asking the user to choose one.
8. To throw away a draft the user no longer wants, ask first, then call `sequences_delete`. It
   deletes the sequence with its enrollments and send log, and it cannot be restored. To stop a
   sequence and keep it, pause it (recipe 5) instead. A 409 `sequence_in_use` means the document
   settings use it for payment reminders: the owner chooses another reminder sequence first.

### 8b. Add a follow-up task to a sequence

1. Read the available task types with `task_types_list` and choose an active `id`. Read its
   `assignment_field_id` with `fields_get` when you need to understand whether it accepts one or
   several staff members.
2. Read the sequence with `sequences_get` before editing it. Keep every existing `step_key`, and
   send the complete `steps` array to `sequences_update`.
3. Add a step with `channel: "create_task"` and a `task_config` object. Set `task_type_id`, a
   `title` and optional `description`; templates may use tokens from `sequences_list_variables`.
   Choose `assign.source` as `none`, `fixed`, `appointment_staff`, `enrolled_staff` or
   `contact_field`. `fixed` uses `staff_ids`; `contact_field` uses a contact relationship
   `field_key`. Set `due.basis` to `none`, `run` or `anchor`, with an `offset_minutes`; anchor
   due dates require an anchor-timed step. `links.contact` and `links.appointment` control record
   links, and `notify_assignees` controls the assignment notification.
4. Call `sequences_update` and read the returned step. A fixed assignment with more staff than
   the task type allows, an invalid contact field, or an anchor due date on a relative sequence
   answers 400 and leaves the sequence unchanged.
5. Show the saved draft and ask before calling `sequences_activate`. A create-task step is held
   by the server's rollout flag; while that flag is off, save answers 400 with a clear refusal.

### 8a. Reserve a time while the customer decides

1. Find a time with `appointments_availability` and read the location's booking options.
2. Call `holds_create` with `location_id`, `start_time`, `end_time` and a unique `idempotency_key`.
   Include the contact and service when known. Use `staff_preference: "only"` with `team_member_id`
   to require that person, `preferred` to respect the offering's staff-choice policy, or `none` for anyone.
   A disabled choice treats `preferred` as `none` and refuses `only`. A busy named person answers
   `preferred_staff_unavailable`. Never substitute someone silently. `team_id` selects a bookable team.
   For a series, include `recurrence` as an RFC 5545 RRULE when creating the hold.
3. Read `id`, `expires_at` and `resources`. Call `holds_get` to check the current state and keep its `updated_at`.
   When `deposit_required` is true, the hold confirms only on the customer's verified deposit
   payment. `deposit_due_minor` is the deposit still due after recorded deposit payments net of returns.
   It is 0 once those payments cover it. All three are null when the hold asks no deposit, its lines have moved to the appointment, or its lines mix currencies.
   The amount uses minor units of `deposit_currency`
   (divide by ten to the power `deposit_minor_exponent`). Do not call `holds_confirm` for it: it answers 409
   `deposit_required`.
4. Once the customer agrees, call `holds_confirm` with `holdId`. Read the returned `appointment_id`
   with `appointments_get`.
5. If the customer declines, call `holds_release` with `holdId` and `reason: "abandoned"`.
   Send the last read `updated_at` as `expected_updated_at` to refuse a changed hold with 409 `stale_revision`.
6. On `slot_held`, offer another time or retry after the competing hold expires. On `slot_taken`
   or `hold_expired`, check availability and create a new hold with a new idempotency key.

A hold key belongs to the organization across voice, SMS and every API key or OAuth credential.
Send the same raw key on a retry to return the first hold in its current state, subject to current access.
It does not extend expiry or restore a released hold.
Each new hold, including one after expiry or release, needs a new, unique key.
A member can reserve only their own times at a staffed location. Holds use appointment scopes.

### 9. Book an appointment

1. Find the contact (recipe 1).
2. Call `locations_list` and pick the location. Note its `timezone` and `staffed`.
3. Call `locations_booking_options` with the location id. Pick a service from `offerings`, and a
   team member from its `team_member_ids` if the user names one.
4. For a home visit, call `territories_list` to check that the customer's postal code is covered.
   Two territories at one location may share a postal code; the one with the lower `priority`
   ranks ahead at that location, and ties break by id.
5. Call `appointments_availability` with `location_id`, `date`, and `offering_id`,
   `team_member_id` and `postal_code` as needed. Include selected `add_ons` from the booking options;
   their extra minutes extend each returned slot. Offer the user the slots it returns.
6. Call `appointments_create` with `location_id`, `contact_id`, the slot's `start` and `end` as
   `start_time` and `end_time`, `offering_id`, `team_member_id` if chosen, `service_address` for
   a home visit, and an `idempotency_key` of your own. Leave out `team_member_id` to book the
   first team member who is free.
7. On 409, read `error`. `offering_required`: choose from the `booking_options` in the body.
   `preferred_staff_unavailable`: ask before choosing another person, including after `appointments_reschedule`.
   `slot_taken`, `no_team_member_available` or `outside_hours`: check availability again and
   offer another time. `team_member_not_eligible`: offer another team member.
   `address_out_of_area`: tell the user the address is not covered. `duration_mismatch`: make
   the end time match the service's `duration_minutes`. `start_in_past`: the time has passed.
   Check availability again and offer a later time. If you retried a key, call
   `appointments_list` first to see if the first try booked. Another 409 with no code means the
   key was used with other details: use a new key.
8. Tell the user the appointment's time, service and team member.

A location that is not staffed can also be booked with `calendar_id` from `calendars_list`
instead of `location_id`. Send one of the two, never both.

### 9a. Start, complete or reopen an appointment

1. Read the appointment with `appointments_get`. Keep its `updated_at` as `expected_revision`.
2. Call `appointments_transition` with `to_state: "in_progress"` to start work.
   Storage status stays confirmed. Read `state`, `state_label`, `needs_review` and `started_at` for its lifecycle.
   A legacy Iris row with stored `tentative` reads as `state: "confirmed"` and `needs_review: true`;
   confirm or cancel it through the normal lifecycle operation. A Google-owned tentative row reads
   as `state: "external_busy"`.
3. Call `appointments_transition` with `to_state: "completed"` and the measured `actual_minutes`.
   Without minutes, Needs attention shows `minutes_missing`. Never substitute an estimate.
4. To enter minutes later, read the latest revision and call `appointments_record_minutes` with `minutes` and `expected_revision`.
5. To reopen a terminal appointment, use `to_state: "confirmed"` and a reason.
   OWNER, ADMIN or the appointments power is required. A reservation collision answers `slot_taken`.
6. On `stale_revision`, read again and review the current state before retrying.
7. To change a status in the same call as the place or time zone, `appointments_update_details`
   takes `status` too, follows the same lifecycle and changes the status first. A set-back to
   `confirmed` needs `reason` (else 409 `reason_required`) and the step 5 roles (else 403
   `appointment_reopen_forbidden`). `completed` to `no_show` or back answers 409
   `invalid_transition`: reopen to confirmed first. `tentative` answers 400.

Use `appointments_cancel` for ordinary cancellation. `cancelled_by_kind` defaults to business.
The answer includes `policy_outcome`: `outcome` (`none`, `late_cancel` or `no_show`), integer
`fee_minor`, `currency`, `deposit_treatment` and the pinned `terms_version_id`. Business
cancellations, appointments without a policy version and recurring series source rows return
`none` with a zero fee.
Send `customer` when the customer cancelled. Cancel and reschedule refuse started work with `appointment_started`.
An explicit lifecycle transition can close started work as cancelled. It records the actor and reason.
A MEMBER can transition and record minutes only for appointments whose primary staff member is that MEMBER.

### 10. Keep the CRM current after a call

1. Find the contact (recipe 1).
2. Call `contacts_update` to change the name, phone, email, stage, custom fields or `relationships {key: [ids]}`. Relationship keys come from the contact catalog. Each array replaces that field. Send `[]` to clear it. Targets must match its kind, cardinality and organization. An unknown
   custom field key returns 400 naming it. To move the contact to a stage, call `contacts_list_stages`
   first and send one stage `id` as `stage_id`.
3. Call `contacts_add_note` with what you learned. The note is stored with source `api` and, as its
   author, the user you act for (an organization key stores no author).
4. Call `contacts_add_tag` or `contacts_remove_tag` to change tags. Both are safe to repeat. An added
   tag is applied with source `api`, by the user you act for (an organization key records no user).
5. When a person asks to stop email or SMS, call `contacts_suppress` with the channels at once.

### 11. Read the custom fields of a record kind

1. Call `fields_list_objects` with `record_kind`, such as `contact`, to read its business labels,
   such as Client and Clients, and its field counts. A record kind no field may describe answers 404.
2. Call `fields_list` with `subject` set to the record kind, such as `contact`, `offering` or
   `staff`.
3. Read each field's `key`, `label`, `type` and `cardinality`. A choice field lists its options.
   Use an option `key`, never its label. An archived option takes no new value.
4. A field with type `relationship` names records of the kind in `relationship_subject`. A field to
   `staff` names staff members.
5. Call `fields_get` with the `fieldId` for one field. It answers 404 for a field of another
   organization.

Archived fields are excluded unless you send `include_archived=true`. An archived field keeps its
values. Every member may read the catalog. No key can change a field yet.

### 12. Report assessment abandonment

1. Call `contacts_upsert` with the contact, `fields.user_message_count`, and an `assessment_abandoned` event with a stable session key.
   If `fields` includes the configured stage key, send a pipeline stage id. A changed stage on an existing contact fires `stage_changed` automations.
2. Count nonempty user answers in the current session. Send numeric zero for a session with no answers.
3. Read `assessmentAbandonment`. `accepted` confirms a durable receipt. Keep retry eligibility for `no_subscriber` or a request failure.
4. Record `legacy_unverified` for operator reconciliation. Do not invent a new key to bypass an existing receipt.

Counts must be nonnegative safe integers. Missing counts match only triggers without an `assessmentAudience` filter.
The `started` filter requires a positive count. `never_started` requires zero. These filters apply only to `assessment_abandoned`.
Do not activate the never-started campaign before its copy is approved.

### 13. Send a broadcast on a schedule

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

### 14. Build an audience

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
   Both count opted-out contacts: they are left out only when a message is sent. Each member's
   `contactable` says whether its email and phone may get `service`, `billing` and `marketing`
   messages now. Marketing email needs a recorded opt-in, so a contact can be contactable for
   service and not for marketing. A null `contactable` means it could not be read: do not
   treat it as contactable.
7. To retire it, call `audiences_archive`. `audiences_update` with `is_archived: false` restores
   it.

### 14a. Test a step and pick a send window

1. To pick when a sequence may send, call `sequences_list_send_schedules`. It pages with `page` and `limit`, and the windows are in `items`. Pass the `id` you
   choose as `send_schedule_id` on `sequences_create` or `sequences_update`. A sequence with none
   uses the window where `is_default` is true. To add a window, ask the user, then call
   `sequences_create_send_schedule`. To change one, call `sequences_update_send_schedule` with the
   whole window: the change reaches every sequence that uses it. A window cannot be deleted.
2. To test a step, save it first: the test sends what is saved. Call `sequences_test_step` with
   the `sequenceId` and the `step_key` of the step.
3. Send `to_email` (email step) or `to_phone` (SMS step) only to an address or number the user
   owns, never to a customer. Or send `contact_id` to fill variables only from contact fields
   the calling key may view. The message then goes to that contact, so ask the user first.
4. Read `success`. When false, `error` and `reason_code` say why, for example `opted_out`.
5. To choose who an email step comes from, call `sequences_list_sender_addresses`. Pass an
   `email` whose `can_send` is true as the step's `sender_email` on `sequences_create` or
   `sequences_update`. Null sends from `default_from_email`; leaving it out keeps the step's
   sender. An address with `can_send` false cannot be saved: show the user its `blocked_reason`.
   A non-admin credential sees and may pick only its own address, and a 403 means the step names
   someone else's. Adding and checking addresses is done in the dashboard, in Settings › Email.

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
   change here: tell the user to change it in the Context Engine. After an industry change,
   setup is rebuilt: new fields are enabled, unchanged empty generated fields are disabled,
   and untouched scenarios are replaced.
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
   `contacts_upsert` accepts the same stage id in `fields` under the configured stage key.
   Do not change the `value` of a stage contacts are on: they stay on the old id.
3. Call `crm_fields_set` with every field from step 1, in order, and the edited stage field. It
   replaces the whole list: a field you leave out is turned off. Ask the user first. Send the
   list's `updated_at` as `expected_updated_at`. A 409 `stale_revision` means someone changed the
   fields: start again from step 1. A 400 that names a built-in column means a field reuses Name,
   Phone or Email: ask the user, then rename that field or leave it out.
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
   `enabled_weekdays`, and `google_integration_id` (null for none). The optional `redirect_url` sets an HTTPS page after booking. Omit it to keep the stored value. Null keeps the confirmation page.
   The optional positive integers `min_notice_minutes`, `max_bookings_per_day` and `max_days_ahead` set booking limits.
   They mean minimum notice in minutes, bookings per person per day, and how many days ahead a person may book.
   Omit each to keep it. Null means no limit. Limits also apply to bookings Iris takes by phone, chat and text.
   Staff bookings are not limited. Send the `updated_at` from
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
4. To remove a fact that is wrong or no longer true, ask the user first, then call
   `context_engine_remove_fact` with `slot_id` and `entity_id`. The agents stop sharing it. To
   put it back, call `context_engine_restore_fact` with the same body. A 409 means a newer value
   replaced it, or nothing was removed. A field with a `derived_from` answers 400: change it in
   its settings. `context_engine_get_fact` reads one fact with the `updated_at` both take as
   `expected_updated_at`.
5. Call `context_engine_list_relationships`. `entities` lists the records, and
   `relationship_types` the link types with the record kinds each joins.
6. Call `context_engine_create_relationship` with `from_entity_id`, `to_entity_id`, `rel_type` and
   an `idempotency_key`.
7. To change a link, read it with `context_engine_get_relationship`, then call
   `context_engine_update_relationship` with all three fields and its `updated_at` as
   `expected_updated_at`. A 409 `stale_revision` means it changed since you read it.
8. Ask the user before `context_engine_delete_relationship`.
9. To let the AI suggest links, call `context_engine_run_relationship_inference`. When its run is
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

### 41. Go back to an earlier version of a sequence

Every save of a sequence keeps a version: the steps, edges and settings as they were saved.

1. Call `sequences_list_versions` with the `sequenceId`. Each item has a `revision`, when and by
   whom it was saved, a `summary` and a `step_count`. The newest is first.
2. To see one version, call `sequences_get_version` with its `revision`. It answers in the shape of
   `sequences_get`, with the purpose that a revert to it would put back.
3. Show the user the version and ask before you revert.
4. Call `sequences_revert_version` with the `revision` and `confirm: true`. It replaces the steps,
   edges, name, description, triggers, exit conditions and send schedule. It also puts back the
   purpose when the version recorded one. A version kept before versions held the purpose, or kept
   while no purpose was set, keeps the current purpose. The location stays.
5. On 409 `sequence_has_live_enrollments`, people are in the sequence: `active_enrollments` says
   how many. Nothing changed. Tell the user to cancel or finish those enrollments first, and stop.
   Do not cancel them yourself unless the user asks.
6. On 409 `system_managed_revert_unsupported`, Iris manages the sequence from SMS settings and
   platform copy. Nothing changed. Tell the user to change those settings instead, and stop.
7. The answer is the sequence after the revert. To undo the revert, revert to its
   `previous_revision`. When that version recorded no purpose, the undo keeps the purpose the revert
   put back.

### 42. Change the subscription plan

1. Call `billing_get_subscription` for the current plan (`product_id`) and its renewal date.
2. Call `billing_list_plans`. Show the user each plan's `name` and its prices. An `amount` is in
   the smallest unit of the currency, such as cents.
3. Ask the user, and say that Stripe prorates the change at once and can charge the card on file.
   Then call `billing_switch_plan` with the chosen `price_id` and an `idempotency_key`. The answer
   holds the subscription after the switch.
4. When `cancel_at_period_end` is true and the user wants to keep the subscription, ask the user,
   then call `billing_reactivate` with an `idempotency_key`. A 400 means it is not set to cancel.

Only an owner's personal credential changes the subscription. Another role gets 403
`insufficient_role` and an organization key 403 `no_acting_user`: tell the user, and do not
retry. A price that is not in `billing_list_plans` answers 400, and no subscription answers 404.
To start a subscription, enter a card, or cancel, send the user to the dashboard Subscription
page: those stay in Stripe.

### 43. Load existing customers

Use this for a bulk load or an ETL of people who are already customers.

1. Call `contacts_upsert` once per customer with `skip_automations: true`. No "New lead" sequence
   starts and no new-lead integration event goes out.
2. Leave `events` empty unless the user names one.
3. Tell the user that later broadcasts and sequences can still reach these contacts.

With the flag, an existing contact sends no `crm.contact.updated` or `crm.contact.stage_changed` event and starts no `stage_changed` automation.
Stage values in `fields` must still be pipeline stage ids, or empty string or null to clear the stage.
Whitespace-only stage strings clear it and are stored as an empty string.


### 44. Create an organization

1. To start another business, call `organizations_create` with `name`, `industry`,
   `terms_accepted` true and an `idempotency_key`. It needs confirm: the call accepts the Iris
   privacy policy and terms for the user, so the user confirms it first. The user owns the new organization, but this credential cannot reach it: to
   work there, the user signs in to it or makes a credential of it.
2. The API cannot delete an organization. An owner deletes it from Organization settings in the
   dashboard, which asks for their password.

Any role creates. An organization key gets 403 `no_acting_user`.

### 45. Read the business's groups

A group is a container, a team, a territory, an asset or a contact group. A contact group is a
set of contacts, such as a household or a client company.

1. Call `group_type_labels_list` to learn the names the business uses for each type, such as
   Household. Use those names when you talk to the user.
2. Call `groups_list`, with `type` to read one type only, for example `team` for crews. Groups
   come by type, then home location, then priority. A lower `priority` comes first.
3. Call `groups_get` with a `groupId` for one group. `parent_group_id` names the group it sits
   under, and `type_label_id` names its label. It also returns postal codes, served location ids,
   owner contact ids and outgoing links. Each list comes in full, so there is no page to fetch.
4. Call `groups_list_members` for staff or contacts. A membership is current while `until` is null,
   or later than both now and `since`. `include_ended=true` adds the ended ones. A restricted contact has no name or
   role label. The group grants no access to that contact.

A member's or manager's credential reads the groups whose home location it reaches and the groups
granted to it. An own-records member reads only the granted ones, and a location-limited key only
those at a home location in the key. None of them reads a territory group. Any other group answers
404: do not retry, because an owner or admin must grant it. A list holds no archived group unless
you send `include_archived=true`. Nothing writes groups through the API yet.

### 46. Read the task types and their statuses

A task type is a kind of task the business tracks, such as General or Field visit. Each type has
its own statuses, and each status is in one of four categories: `not_started`, `in_progress`,
`completed` or `cancelled`.

1. Call `task_types_list`. Each type lists its `statuses` in order, the initial one with
   `is_initial` true, and its `transitions`, the moves from one status id to another.
2. With `transition_rule` `listed`, a task moves only along a listed transition. With `any`, it
   moves between any two active statuses.
3. Read `assignment_field_id`, the staff field that names who works a task of the type. Call
   `fields_get` with that id, with `fields:read`, to read its label and cardinality.
4. Call `task_types_get` with the `taskTypeId` for one type. It answers 404 for a type of another
   organization.
5. Call `task_types_list_templates` to see the templates a new type copies: `general`,
   `field_visit`, `reviewed_work` and `follow_up`. In `reviewed_work` a task reaches `done` only
   from `needs_manager_review`.

Archived types are excluded unless you send `include_archived=true`. A status with `archived_at`
takes no new task. Every member may read the types. No key can change a type yet, and the list is
empty until tasks are enabled for the organization.

### 47. Set up tax rates

A tax rate is a whole number of parts per million: 8.875% is `88750`, 20% is `200000`. A rate has
no currency. A document line copies its offering's default rate when it is drafted, so a rate
change never alters a line that already has it.

1. Call `tax_rates_list` to see the live rates. Each rate lists `defaults`, the offerings, add-ons
   and plans whose default it is. Send `include_archived=true` to see archived rates too.
2. Call `tax_rates_create` with a `label` and `rate_ppm`. Send an `idempotency_key`, so a retry
   returns the first rate and does not make a second one.
3. Call `tax_rates_set_default` with the rate's `taxRateId`, a `subject_kind` and a `subject_id`.
   A subject has one default, so this replaces its earlier one. A subject the organization does
   not hold answers 404.
4. Call `tax_rates_get` to read the rate back with its `defaults`.
5. To fix a label or a rate, call `tax_rates_update` with only the fields to change.
   Send the last read `updated_at` as `expected_updated_at` to refuse a changed rate.
6. To retire a rate, first give each subject in its `defaults` another rate. Then call
   `tax_rates_archive`, after the user confirms: an archived rate cannot be made live again. While
   the rate is still a default, the call answers 409 `tax_rate_is_default`.
   `tax_rates_archive` also accepts `expected_updated_at`. A stale value on either write answers
   409 `stale_revision` and changes nothing. Read the rate again before deciding.

Any member's credential reads rates. The four writes need an owner's or admin's credential, or an
organization key with no role. Any other credential gets 403 `insufficient_role`. Do not retry it.

### 48. Create a follow-up task for a contact

A task records a piece of work for the business's staff, such as calling a customer back.

1. Call `task_types_list` with `task_types:read`. The type `general` has To do, In progress, Done
   and Cancelled and one assignee. Use another type's `id` as `task_type_id` when it fits better.
2. Call `tasks_create` with a `title`, the contact as a link
   (`links: [{"record_kind": "contact", "record_id": "<contact id>"}]`), a `due_at` and, when you
   know who does it, `assignee_ids` with one staff id. Leave out `status_id`: the task starts in
   the type's initial status.
3. Send a `dedupe_key` of your own. It shares one organization key space across API credentials, voice and SMS. If
   the call times out, send it again with the same key and the same fields: you get the first task
   back and no second one. The same key with other fields answers 409 `idempotency_conflict`; pick
   a new key for a new task.
4. A machine actor may name a `completed` or `cancelled` status only with an enabled
   `agent_action_rules` row for `task.close`. Without that rule, `tasks_create` answers 403
   `action_not_allowed`; do not retry.

A due date writes no calendar entry. A member's or manager's credential, and a key with a role,
create at one of their own locations or with no location, under a parent task and with links to
records they can read. Anything else answers 404 `not_found` and writes nothing: name a record the
credential reaches, or leave `location_id` out. The created task comes back even when the credential
cannot read it later. Such a credential gets 404 `not_found` when it sends the same `dedupe_key`
again for a task it cannot read, such as one it made with no location: the first call created the
task, so do not create it again.

An assignee who cannot access the task location gets 422 `assignee_cannot_access`.
Archived staff also get this refusal. A MEMBER may assign only their own staff record.
A MEMBER-role organization key has no staff record, so it can no longer create a task with any assignee.
This matches `tasks_set_assignees`. Create the task without assignees.
Choose staff who can access that location. The refusal writes no task or assignee row.

### 49. List my open tasks

1. Call `tasks_list` with `assignee=me` and `category=not_started`, then again with
   `category=in_progress`. `me` is the staff member linked to the person the credential acts for.
   An organization key acts for no person and gets 422 `assignee_me_unavailable`: send a staff id
   as `assignee` instead.
2. Read `items`. Each task has its `status` with its `category`, its `due_at` and its `links`.
   Pass `next_cursor` back as `cursor` until it is null.
3. Call `tasks_get` with the `taskId` for one task. A task of another organization answers 404.

A member's or manager's credential lists only the tasks it reaches: the tasks at its locations,
and its own tasks only where the business has turned on assigned access for the role. An
own-records member sees nothing else, so an empty list can mean no task is assigned yet or the
business has not turned it on. A task it cannot reach answers 404, the same as one that does not
exist. A link to a record it cannot reach, such as a contact at another location, comes back with
`restricted: true` and a null `record_id`: say a record is linked that the user cannot see, and do
not look it up. A `record_kind` and `record_id` filter on a record it cannot reach answers 404.

`assignee=unassigned` lists the tasks nobody holds, and `record_kind=contact&record_id=<id>` the
tasks linked to a contact, merged contacts included.
Use `work_record_id=<id>` to list tasks linked to a work record through `work_links`.
Do not combine it with `record_kind` or `record_id`. A malformed UUID or mixed record filters return 400.
`record_kind=work_record` is refused with 400. Use `work_record_id` instead.
A scoped credential gets 404 when it cannot read the work record.

### 50. Change a task

1. Read the task with `tasks_get`; keep its `revision` and `updated_at`.
2. Call `tasks_update` with `expected_revision` and only the fields to change. Send
   `expected_updated_at` when the update must fail if the task changed since the read.
   A location change answers 422 `assignee_cannot_access` if an existing assignee is archived or cannot access the new location.
   The refusal preserves the task and its assignments.
   Remove or replace that assignee with `tasks_set_assignees`, then retry the change with the returned revision.
3. Call `tasks_transition` with `to_status_id` and `expected_revision` to move through the type's
   workflow. A machine actor closing a task needs an enabled `agent_action_rules` row for
   `task.close`. Without that rule, the call files `close_record` and answers 202
   `approval_requested` with `approval_request_id` and `reason`. A disallowed move gets 422
   `transition_not_allowed`; a board drop with no legal status in the target category gets 422
   `no_status_in_category`.
4. Call `tasks_set_assignees` with `staff_ids` and `expected_revision`. Members can assign only
   themselves; a staff member whose login cannot reach the task gets 422 `assignee_cannot_access`.
5. Call `tasks_reclassify` with the new `task_type_id`, `status_id`, optional `staff_ids` and the
   revision. The type must be active and the status must belong to it. A machine actor needs a
   `task.close` rule to reclassify into a closed status, or the call answers 403
   `action_not_allowed`.
   Reclassification checks archived, location and MEMBER assignee rules, including assignments carried from the previous type (IRIS-6871).
   For 422 `assignee_cannot_access`, remove or replace the ineligible assignee with `tasks_set_assignees`, then retry with the returned revision.

### 51. Manage task links and history

1. Call `tasks_link` with `record_kind`, `record_id` and `expected_revision` after confirming the
   caller can read the target. An unreachable target answers 404 and writes nothing.
2. Call `tasks_unlink` with the same link fields and revision. A restricted link is not removable
   through that read and answers 404.
3. Call `tasks_list_history` with the task id and optional `cursor`; follow `next_cursor` for older
   entries. History uses `tasks:read`.
4. Call `tasks_archive` or `tasks_restore` with the current revision. Both accept
   `expected_updated_at`; archive is limited by the task action and restore reverses it.

### 51a. Read and manage task comments and attachments

1. Call `tasks_get` with the task id. A task outside the credential's record access answers 404.
2. Call `tasks_list_comments` to read active comments in creation order. Each item includes its
   body and its `restricted` flag after the task access check. Restricted comments require view access
   to the `restricted` class and are otherwise omitted.
3. Call `tasks_add_comment` with `body` and optional `restricted` when the user wants a comment.
   The response includes the new comment and its author. Do not put secrets or credentials in the
   body.
4. Call `tasks_list_attachments` to read active attachment metadata. Each item includes a short
   lived signed `download_url`. Use it before it expires, and do not store it as a permanent link.
5. Call `tasks_add_attachment` with `file_name`, `content_type` and `size_bytes`. It returns a
   short lived signed `upload_url`. Upload the bytes to that URL, then keep the attachment id
   from the response for later reads.

6. Call `tasks_edit_comment` with `taskId`, `commentId`, the replacement `body` and optional
   `restricted`. Omit `restricted` to keep its current value. To undo an edit, send the previous
   body and restricted flag. The edited timestamp remains changed.
   Setting `restricted: true` on add requires edit access to the `restricted` class.
   On edit, omit `restricted` without that access, including when the intended value is false.
   A denied class write returns 403 `restricted_class_required`.
   Editing or archiving a restricted comment requires edit access to the class.
   Without view access, these operations return 404. View access alone returns 403.
7. Call `tasks_archive_comment` with `taskId` and `commentId`, or `tasks_archive_attachment` with
   `taskId` and `attachmentId`. Confirm the archive with the user first. Neither has a restore route.
   A child belonging to another task or record kind answers 404 and stays unchanged.

Comments and attachments use `tasks:read` for reads and `tasks:write` for writes. Every call checks
the task record access before it reads metadata or issues a signed URL. The bucket is private.
Evidence attachments on documents, payments and proposal acceptances can be archived only by an
OWNER or ADMIN. A failed upload URL is archived automatically, so do not retry the same upload
without creating a new attachment.

### 52. Find who changed this contact

1. Check with `me_get` that the key holds `changes:read` and `contacts:read`.
2. Find the contact with `contacts_search` and take its `id`.
3. Call `changes_list` with `record_kind=contact` and `record_id` set to that id. Add
   `include=values` when you need visible before and after values.
4. Read the newest items first. Each has its `actor` (`kind`, `user_id`, `credential_id`,
   `on_behalf_of`, `conversation_key`), `action`, `changed_keys`, `committed_at` and `reason`.
5. To read older changes, pass `next_cursor` back as `cursor` until it is null. Stop when you have
   the answer.

`changed_keys` names the stored fields, such as `email`, `display_name` or `field_values.plan`.
With `include=values`, visible keys include `before` and `after`; denied keys are omitted from
those objects and listed in `redacted_keys`. Call `contacts_get` for current values.
A contact the key cannot read answers 404. A key without `contacts:read` gets 403
`insufficient_scope` with `required: contacts:read`. A MEMBER, and a MANAGER without the contacts
power, see only the keys `id`, `display_name`, `email` and `phone_number`, and no `reason`. Changes
to other fields are left out for them.

### 53. Read the staff

A staff member is a person who works for the business. A staff member needs no login, and an
archived one stays readable.

1. Call `staff_list`. Each staff member has an `id`, a `name`, a `status` (`active` takes bookings,
   `inactive` does not), `has_login` (true only when an active login is linked), `location_ids`,
   `offering_ids`, `archived_at` and
   `updated_at`. The list is sorted by name and pages with `page` and `limit`.
2. Skip a staff member with `archived_at` set when you pick someone to book: the business archived
   them. Their past appointments still name them.
3. Use a staff member's `id` as the `team_member_id` of `appointments_availability` and
   `appointments_create`.
4. Call `staff_get` with the `staffId` for one staff member. It answers 404 for a staff member of
   another organization.

A member's or manager's credential, and a location-limited key, read only the staff who work at one
of its locations. Any other staff member answers 404: do not retry.

### 53a. Change the staff

Use `staff:write`. Adding, settings, activating, deactivating, services and the login need an
OWNER, ADMIN or organization key with no role. Hours and the "anyone" order also admit a MANAGER
with the `staff` power at its own locations. Time off also admits a MEMBER for its own linked staff
member.
A manager-role key has no person, so `staff_set_schedule`, `staff_move_priority` and the time off
writes answer 403 `insufficient_role`. A location-limited credential sees only its locations in the
schedule and in `affected_appointment_ids`. A location or entry outside them answers 404.

1. Call `staff_create` with `{ "name": "Maya" }`. The new staff member is `inactive`.
2. Call `staff_set_offerings` with every `offering_ids` the person handles, from `offerings_list`.
3. Ask the user, then call `staff_activate` with a `location_id`. It can take a paid seat, and
   rewind cannot undo it: `staff_deactivate` stops new bookings instead.
4. Call `staff_set_schedule` with that `location_id` and the whole week there in `intervals`: each
   a `weekday` (0 is Sunday) and a local `start_time` and `end_time` as `HH:MM`. The person must
   work at the location first, else 404.
5. For time off, call `staff_add_exception` with a `date` and `kind: "unavailable"`. Ask the user
   what to do with the appointments in `affected_appointment_ids`. `staff_remove_exception` takes
   the entry back by its id.

`staff_get_schedule` reads the hours and time off, each entry with its id. `staff_deactivate`
stops new bookings and keeps the history. `staff_move_priority` moves a person one place up or down
the "anyone" order of a location. `staff_update` changes the notification settings that
`staff_get_settings` reads under `staff:write`. `staff_set_login`
links a login and needs a person, so an organization key gets 403. Pass `expected_updated_at` from
`staff_get` to refuse a write when the staff member changed since: 409 `stale_revision`. The hours
and time off writes answer 409 while team scheduling is not available for the organization.

### 54. Create a task type

Use `task_types:write` with an OWNER, ADMIN or unrestricted organization key.
Call `task_types_list_templates`, then `task_types_create` with `{ "template_key": "reviewed_work" }`.
The response includes its statuses, transitions, assignment field and revision.
A custom type instead supplies `key`, `label`, `assignment_field_id`, `statuses` and `transitions`.
A duplicate key returns 409 `workflow_type_key_taken`.

### 55. Change a task type and its assignment field

Read the type with `task_types_get`. Call `task_types_update` with its `taskTypeId` and `expected_revision`.
Supply the new label, description or assignment field ID. The field must be an active task relationship to staff.
Send `assignment_field_id: null` to clear assignment routing. Later non-empty staff writes for the type
answer 422 `task_assignment_field_required`; an empty staff list remains a no-op.
The response includes `task_type`, `moving_in` and `moving_out`, counting open tasks entering or leaving staff members' My Tasks.

### 56. Replace a task workflow

Read the type, then call `task_types_set_workflow` with its `taskTypeId`, `expected_revision`, complete `statuses` and `transitions`.
Statuses use keys, labels, categories and `is_initial`. Transitions name `from` and `to` status keys.
Keep exactly one initial status. Map each dropped, held status to a retained key in `replacements`.
Use `allow_category_change: true` only when the user intends a replacement in another category.
A 409 `revision_conflict` means the workflow changed. Read it again before preparing another update.

### 57. Archive a task type

Call `task_types_archive` with `taskTypeId`. The type leaves active lists and cannot accept new tasks or workflow edits.
Existing tasks and workflow definitions remain. Repeating the call changes nothing.
Send `updated_at` from `task_types_get` as `expected_updated_at` to refuse a changed type.

### 58. Restore a task type

Call `task_types_restore` with `taskTypeId`. The type returns to active lists with its existing workflow and assignment field.
Repeating the call changes nothing.
Send `updated_at` from `task_types_get` as `expected_updated_at` to refuse a changed type.
Both lifecycle calls answer 409 `stale_revision` without a write when the timestamp is stale.
Read the type again before deciding. Omitting the parameter keeps the existing behavior.

### 59. Set up a service

A new service is inactive and has no duration, so customers cannot book it until it is turned on.

1. Call `offerings_create` with a `name`. Send an `idempotency_key`, so a retry returns the first
   service and does not make a second one.
2. Call `offerings_update` with `duration_minutes`, and a `description` or buffers if the user gave
   them. It changes only the fields sent. Null `duration_minutes` clears the duration and turns the
   service off.
3. Call `offerings_update_pricing` with `price_kind`, `price_minor` and `price_currency`.
   `price_minor_exponent` applies to `price_currency`, or to the organization default when `price_currency` is null.
   A price write must send `price_currency`.
4. Call `offerings_set_locations` with every `location_ids` that offers it. It replaces the set.
5. Call `offerings_activate`, after the user confirms: customers can then book it. A service with
   no duration, or one already active, answers 409 and changes nothing.
6. To stop new bookings, call `offerings_deactivate`. It deletes nothing. There is no delete.

Send `updated_at` from `offerings_get` as `expected_updated_at` on the update, activate, deactivate
and locations calls to refuse a changed service. A stale value answers 409 `stale_revision`. Read the
service again before deciding. Name, description and locations do not move `updated_at`. The writes
need an owner's or admin's credential, or an organization key with no role. A member's credential
gets 403 `insufficient_role`.

## Confirm a held appointment

1. Call `appointments_create` with the booking details and optional `hold_id`.
2. Use the hold's location, times, contact, staff and service. Send the same `recurrence` for a recurring hold.
   A mismatch answers 409 `invalid_request`.
3. On `hold_expired` or `hold_not_found`, choose another slot before booking again.
4. Call `appointments_get` to read `resources[]` and `lines[]`. Each resource row names its state and origin. A detached occurrence includes independent booking line snapshots. Recurring sources show their first occurrence with origin `series` and omit template lines.

For `appointments_reschedule`, send `start_time` and `end_time`. Optionally send `hold_id` for a
reschedule hold tied to the same appointment. Omit it to hold and confirm in one call. Keep the
existing appointment ID after success. If Iris returns `appointment_started`, leave the appointment
unchanged. A failed confirmation releases the hold and preserves the original booking terms.

## Configure invoice draft rules

1. Read enabled and disabled rules with `invoices_list_draft_rules`.
2. Create a rule with `invoices_create_draft_rule`, its trigger, share and milestone number, and an `idempotency_key`.
3. For `work_status_entered`, supply `work_status_id`. Other triggers omit it.
4. Use `invoices_update_draft_rule` to enable or disable a rule. Send its last `updated_at` as `expected_updated_at`.
5. On 409 `stale_revision`, read the rules again before changing them.

The read scope is `invoices:read`. Writes use `invoices:write`.
Confirm both create and update with the user before calling.
Their `auto_issue` and `auto_send` switches can authorize later issues and sends.
Every operation also requires `invoices.draft_write`.
Rules default to disabled and a full share. Shares use parts per million.
Automatic issue and send are separate switches. Their setter needs current authority for each action.
A changed rule keeps accepted proposals' issued milestone plans.
An incomplete plan without a final milestone is refused when the proposal issues.
Rule writes cannot undo invoices already created, issued or sent.

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
  `appointments_update_details`. Status follows the lifecycle, and a set-back to `confirmed` needs
  `reason` (step 7). Google-sourced and repeating rows take the status directly. It refuses
  `cancelled`: cancel with `appointments_cancel`. One
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
- Offerings: `offerings_list`, `offerings_get`, `offerings_create`, `offerings_update`, `offerings_activate`,
  `offerings_deactivate`, `offerings_set_locations` (recipe 59), `offerings_update_pricing`, `offerings_confirm_price`, `offerings_set_add_ons`,
  `offerings_set_options`, `offerings_set_requirements`, `offerings_set_bookable_groups`. Read offerings before booking. Configuration writes replace the
  complete requirements or bookable group set and require `offerings:write`.
- Appointments: `appointments_detach_occurrence` detaches one date from a series. It returns the same appointment on a retry. `appointment_series_list` shows each occurrence state, `appointment_series_get` reads the rule, `appointment_series_replace` replaces the rule and template while preserving the source event id, and `appointment_series_end` stops future dates. Send `rule: null` to return the source to a single appointment.
  Series get, occurrence list, end, replace and occurrence detach return `404 series_not_found` for a superseded recurrence series id.
  Call `appointments_get` with the stable source event id to obtain the current `recurrence_series_id` before editing.
  Do not retry a write against an unread replacement.
  A stale `recurrence_series_id` in a replacement body returns `409 series_edit_requires_replace`.
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
  another location. Pass `purpose` to `conversations_send_sms`: `service` for a reminder, an
  update or an answer, `billing` for a payment notice, `marketing` for a promotion. Without it, a
  text into a live thread (the contact texted in the last 24 hours) is `service`, and any other
  text is `marketing`, which needs a marketing opt-in. Do not pass `service` for a promotion.
  Record SMS consent
  with `contacts_record_sms_consent` only when the contact gave it to the user. On 409
  `sms_not_permitted`, do not send, and do not record consent to get past it. A `reason` of
  `no_opt_in` on a text sent without `purpose` means it went as `marketing`: if the text is a
  service text, send it again with `purpose: service`.
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
  audience, follow recipe 14. `audiences_delete` removes an audience for good, for an owner only:
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

## Tag a sequence with its purpose

1. Read the sequence with `sequences_get`.
2. Choose `service`, `billing` or `marketing` from the message's intent.
3. Call `sequences_update` with `{ "purpose": "service" }`, replacing the value as needed.
4. Read it again to confirm the purpose.

`sequences_list` includes purpose. A null value needs the owner's choice. Create derives a
purpose when none is supplied. Broadcasts and any audience-joined trigger derive marketing.
The known service triggers derive service only when no unclassified trigger is present.
An omitted purpose on update stays unchanged. An explicit null clears it.

## Configure a custom field

1. Call `fields_create` with `subject`, `label`, and `type`, using `fields:write` as an OWNER or ADMIN.
2. Read the result with `fields_get`. Keep its id and revision.
3. Call `fields_update` with `fieldId`, `expected_revision`, and the changed properties.
4. Keep every existing option key. Mark a removed option with `archived: true`.
5. Call `fields_archive` to retire the field. Call `fields_restore` to restore it with its stored values.
   Both accept the last read `updated_at` as `expected_updated_at`. A stale value answers
   409 `stale_revision` and changes nothing. Read the field again before deciding.
6. Call `fields_update_object` with `record_kind`, `singular_label`, and `plural_label` to set its business labels.

A designated owner or assignment field cannot be archived. Clear its designation first.
A stale revision answers 409. Read the current field before trying the intended edit again.
A type change or an edit to an archived field answers 422. Restore an archived field before editing it.
Contact edits refresh agent prompts. Raising `access_class` above `contact_details` requires
`settings.sync_to_calendar: false` in the same update. This deletes the synced calendar events.

## Configure booking policies

1. Call `booking_policies_list` to find the default or an offering's override.
2. Call `booking_policies_get` to read its current `terms_version`.
3. As an owner or admin, call `booking_policies_create` or `booking_policies_update` to publish terms.
4. Call `terms_versions_get` with a booking's version ID to read the exact terms it accepted.

Policy writes require `booking_policies:write`. Policy reads require `booking_policies:read`.
Exact version reads require `offerings:read`. Changing a policy affects later holds and never
rewrites an existing booking. `effective_from` can schedule a version. Use integer minor units
for fixed fees and ppm for percentages. The policy's `deposit_treatment` is `apply`, `forfeit`
or `refund`. Archive a non-default policy through `booking_policies_update` with `archived_at`.

## Archive contacts and review duplicates

1. Find the contact with `contacts_search` or read its known ID with `contacts_get`.
2. Call `contacts_archive` to hide it from lists. Its appointments and messages remain unchanged.
3. Call `contacts_restore` to show it again. A returning caller also restores it.
4. Call `contacts_suggest_merge` with the other contact ID and a reason to flag a duplicate.
5. Read `contacts_list_merge_suggestions` to review the pair. A person confirms the merge in the dashboard.
6. Call `contacts_dismiss_merge_suggestion` to close an incorrect suggestion.

These four writes require `contacts:write`. A manager needs the contacts power and access to both contacts. Archive and restore refuse a contact shared outside the manager's locations.

## Configure booking policies

1. Call `booking_policies_list` to find the default or an offering's override.
2. Call `booking_policies_get` to read its current `terms_version`.
3. As an owner or admin, call `booking_policies_create` or `booking_policies_update` to publish terms.
4. Call `terms_versions_get` with a booking's version ID to read the exact terms it accepted.

### Configure groups and labels

1. Read `group_type_labels_list` to choose the business name for the group type.
2. Call `groups_create` with `type`, `label` and the home location where needed. Use `groups_update` to change its label, type label, home location or booking flag.
3. Use `groups_move` with `parent_group_id`, or null for the top level. A cycle returns a client error.
4. Use `groups_add_member` with `member_kind` and `member_id`. Use `groups_end_member` to end the earliest current row. A later renewal row remains.
5. Replace complete lists with `groups_set_postal_codes`, `groups_set_serves`, `groups_set_links` and `groups_set_owners`. An empty list clears that relationship. Each replacement accepts at most 999 rows. Managers cannot replace team links while territory links exist.
6. Use `groups_set_priority_order` with every id of the target group's type and home location, in order.
7. Use `groups_archive` and `groups_restore` to retain or recover the group. An archive keeps its history.
8. Read `groups_get` and `groups_list_members` to verify the result.

Asset availability: use `groups_list_downtime` (action `group.list`) to inspect an asset, `groups_add_downtime` to block
new bookings for a time range, and `groups_end_downtime` with its downtime id to clear the block.

## Name a group type

1. Call `group_type_labels_create` with `type`, `singular_label` and `plural_label`.
2. Call `group_type_labels_update` to rename either label.
3. Call `group_type_labels_archive` to retire a nondefault label. Existing groups retain their label id.

All three calls use `groups:write` and require OWNER or ADMIN.

Policy writes require `booking_policies:write`. Policy reads require `booking_policies:read`.
Exact version reads require `offerings:read`. Changing a policy affects later holds and never
rewrites an existing booking. `effective_from` can schedule a version. Use integer minor units
for fixed fees and ppm for percentages. The policy's `deposit_treatment` is `apply`, `forfeit`
or `refund`. Archive a non-default policy through `booking_policies_update` with `archived_at`.

## Read integration status and linked objects

For update, move, archive, restore or a relationship replacement, pass `expected_updated_at` from `groups_get` to check the current group revision. A stale revision answers 409 `stale_revision` without writing. Read the group again before deciding. Relationship replacements do not move the group timestamp, so this check cannot detect other relationship changes.

1. Check that `me_get` grants `integrations:read`. These two operations return 403 for MANAGER and MEMBER keys.
2. Call `integrations_list` to read account status, masked account labels, mode and sync timestamps. Google Calendar rows include deployment environment, first failure time, and a sanitized error code.
3. Call `integrations_list_bindings` with `provider`, `status`, `record_kind`, `record_id` or `external_type` to narrow the linked objects.
4. Read every page using `page` and `limit`. Compare the result count with `total`.
5. Use `total`, `page` and `limit` from each response to track the current page.
   A temporary Supabase failure answers 503 `Service temporarily unavailable`. Read the current state before retrying a write whose outcome is unknown.

These operations show the current deployment only. Disconnected bindings remain visible.
ElevenLabs and Twilio Verify bindings are private. Error codes contain no raw provider error text.
Connecting a provider and changing field authority remain owner actions in the browser.

Appointment reads (`appointments_list`, `appointments_get`) include `customer_contact_id` and
`customer_link_source`. They also include `external_sync` with provider status and last sync time;
external identifiers are omitted. Use the typed customer link for identity. Its source explains whether
a booking, staff choice, metadata, conversation or attendee endpoint selected the contact.
Ambiguous and unmatched appointments have a null customer ID. `appointments_get` includes
`recurrence_series_id` for recurring source and detached appointments when a live series exists.

## Check the payments account

1. Check that `me_get` grants `connected_account:read`. This operation denies MEMBER access.
2. Call `connected_account_get`. A 404 means the business has not set up payments yet.
3. Read `onboarding_state`. Customer payments work only while it is `enabled`.
   Tell the user what Stripe still needs from `requirements_due`.
4. With a new key, `invoices_send` refuses an invoice when `hosted_payment_method_save` is not `never`. Tell the
   user to set "Save payment method on hosted invoice page" back to never in the Stripe Dashboard.
5. When `paused` is true, Iris cannot onboard or check the account. With `paused_reason`
   `account_unknown`, tell the owner to contact Iris support. `demo_seed` marks the demo account.

The account carries no Stripe id. Setting up payments and Stripe onboarding remain owner actions
on the payments settings page in the browser. Iris creates the Stripe account, so a business
cannot connect a Stripe account it already has.

## Review payment disputes

1. Check that `me_get` grants `disputes:read`. These operations deny MEMBER access.
2. Call `disputes_list`. Pass `review_state: open` for the disputes no staff member has acknowledged yet.
   Pass `next_cursor` back as `cursor` until it is null.
3. For each dispute, tell the user the amount, `reason`, `stripe_status` and `evidence_due_by`.
   An `is_inquiry` dispute moved no money. An `is_bank_return` dispute has no evidence step.
4. Call `disputes_get` with `disputeId` for the records it links: the payment (`payment`), the reversal
   Iris wrote when Stripe withdrew the funds (`payment_return`) and each invoice whose collection it holds
   (`document`). `payment_id` null means Iris has no record of the charge.

The response with evidence goes through the Stripe Dashboard, with `stripe_dispute_id` to find the dispute.
Acknowledging a dispute is an owner and admin action on the payments page in the browser.

## Readiness and work records

1. Call `work_types_list` to find the `job`, `project` or `pipeline` type. Call `work_types_get` when you need one type and its statuses.
2. Call `work_records_create` with a title, type and optional links to tasks or appointments.
3. Call `work_records_get` to read links, completed appointment minutes and computed `ready_to_close`.
4. Call `work_records_list` with `ready_to_close=true` to page open records that have no linked open task or active appointment.

These reads use `work_records:read`. Creation uses `work_records:write`. Work type reads use `work_types:read`.

### 60. Manage work records

1. Call `work_records_list` with filters such as `work_type_id`, `status_id` or `ready_to_close`.
2. Call `work_records_get` with `workRecordId` before any write. Keep its `revision`.
3. Call `work_records_create` with `title` and optional type, status, customer, location and `links`.
   Send `links` as an array. Omit it or send `[]` when there are no links.
4. Call `work_records_update` with the changed fields and `expected_revision`.
5. Call `work_records_transition` with `to_status_id`, `expected_revision` and an optional `reason`.
   A machine close needs an enabled `agent_action_rules` row for `work_record.close`. Without that
   rule, the call files `close_record` and answers 202 `approval_requested` with
   `approval_request_id` and `reason`.
   For a job, the required rule is the `work_record.close` rule on the machine credential.
6. Call `work_records_link` or `work_records_unlink` with the record kind, record id and revision.
7. Call `work_records_archive` or `work_records_restore` with `expected_revision` for lifecycle changes.
8. Call `work_records_list_history`, `work_records_list_comments` or `work_records_list_attachments` to inspect the record.
   Pass history `next_cursor` unchanged as `cursor`. Malformed cursors or values outside the positive signed 64-bit range return 400.
   Comment lists omit restricted comments without view access to the `restricted` class.
9. Call `work_records_add_comment` with `body` and optional `restricted` to add a comment.
   Setting `restricted: true` requires edit access to that class. Otherwise, the call returns 403 `restricted_class_required`.
   An unreachable work record returns 404 before the class check.
10. Call `work_records_add_attachment` with file metadata to create an upload URL.
    Comment and attachment writes require `work_record.edit` and `work_records:write`. A missing action returns 403. An inaccessible record returns 404.
11. On 409 `revision_conflict`, call `work_records_get` again and review the new revision before retrying.

### 60a. Close a job

1. Call `work_records_list` to find the job.
2. Call `work_records_get` with its `workRecordId` and keep its `revision`.
3. Call `work_types_get` for its `work_type_id`.
   Choose a legal target status whose category is `completed` or `cancelled`.
4. Call `work_records_transition` with `workRecordId`, that status as `to_status_id`, and the revision as `expected_revision`.

A machine close needs an enabled `agent_action_rules` row for the caller and `work_record.close`.
An owner sets the rule. For an agent, they use the internal `PUT /api/agents/:id/action-rules` API with
`{"rules":[{"actionKey":"work_record.close","enabled":true}]}`.
A personal key also needs the person's own close right, even with a rule or approval.

With that rule, the call answers HTTP 200 with the closed record.
Without that rule, it files `close_record` and answers HTTP 202 `approval_requested` with `approval_request_id` and `reason`.
Repeating the move with the same target and reason while the request is pending returns the same request.
A different target or reason supersedes it and files a new request.
A person with the close right approves it in the approvals inbox.
Approval rechecks the move and closes the job once.
If the request is rejected or expires, nothing closes. The agent may ask again.

### 61. Manage work types

1. Call `work_types_list` and `work_types_get` to find an active work type and read its workflow.
2. Call `work_types_create` with one template key or a complete workflow. Do not send both.
3. Call `work_types_update` with changed labels or assignment field and `expected_revision`.
   Send `assignment_field_id: null` to clear the assignment field. Omit it to keep the current field.
4. Call `work_types_set_workflow` with the full status and transition arrays and `expected_revision`.
5. Call `work_types_archive` or `work_types_restore` to change the work type lifecycle.
6. These configuration writes require the `work_types:write` scope and an owner or admin role.
