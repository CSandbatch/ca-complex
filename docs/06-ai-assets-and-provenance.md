---
title: AI assets and provenance
description: Structure-aware generation, job behavior, rights, and safety.
status: proposal
version: 0.1.0
---

# AI assets and provenance

## Position

AI is a card-materialization engine, not the product's source of truth.

It may propose semantic fields, illustrations, backgrounds, symbols, card
backs, social previews, style variants, or batches. The canonical card remains
structured and user-controlled. A generated surface cannot silently replace
field values, rules, attribution, or accessibility data.

## Context-aware generation

Generation requests SHOULD derive context from explicit selections:

- card kind and selected fields;
- classification and game role;
- target surface, slot, and dimensions;
- collection style guide;
- approved reference assets;
- requested output type; and
- constraints such as transparency, contrast, print safety, or forbidden
  elements.

The interface shows which context will be sent. Private or unrelated workspace
content is excluded by default.

## Job model

Generation is asynchronous. A job records actor, workspace, type, status,
prompt, structured context, provider, model, settings, source assets, outputs,
timestamps, policy results, and failure information.

State transitions:

```text
queued → running → complete
                 ↘ failed
queued/running → cancelled
```

Cancellation is best-effort and does not imply a provider erased submitted
data. Retries create a new attempt linked to the original idempotency key.

## Acceptance

Completed output enters a review state. A user may accept, reject, or request a
variant. Acceptance:

1. creates an asset record;
2. stores provenance and rights state;
3. attaches or binds it only in a new card revision; and
4. preserves the previous revision and source assets.

Batch operations present a diff and allow partial acceptance. Text generation
must not create executable rules or publish content automatically.

## Provenance

Every asset declares:

- source: uploaded, imported, AI-generated, AI-edited, or system;
- creator or generating actor when known;
- provider and model when generated;
- prompt and settings, subject to privacy policy;
- source asset IDs and transformation lineage;
- rights or license status;
- safety review status; and
- cards and surfaces using the asset.

Unknown rights are represented as `unknown`, never inferred as unrestricted.
Providers may have different retention and training policies; deployments must
disclose them before submission.

## Safety and integrity

- Uploaded and generated files undergo type validation and malware scanning.
- User-provided references require asserted rights or a documented exception.
- Identity-sensitive generation receives additional consent and misuse checks.
- Prompts and outputs are treated as potentially hostile data.
- Provider output cannot inject HTML, URLs, or executable behavior into a
  renderer without sanitization.
- Generation cost and rate limits are workspace-scoped and observable.
- Failed or rejected outputs are retained only according to explicit policy.

## Accessibility

Generated images require user-reviewed alternative text before publication.
Generated text must pass the same kind-specific validation as authored text.
Style generation must preserve minimum contrast, readable type, safe areas,
and reduced-motion behavior. “AI-generated” is provenance, not adequate alt
text.

## Evaluation

Evaluate generation by task success rather than aesthetic novelty:

- attachment to the correct semantic slot;
- consistency across a collection;
- editability and regeneration;
- adherence to rights and safety constraints;
- accessibility completeness;
- user acceptance rate; and
- cost and latency.

