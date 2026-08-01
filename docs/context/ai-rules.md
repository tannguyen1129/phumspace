# PhumSpace — AI Rules

> Quy tắc triển khai bắt buộc từ [AI Specification v1.0](../markdown/PhumSpace_AI_Specification_v1.0.md). SRS có hiệu lực cao hơn khi có mâu thuẫn.

## 1. Hard rules

1. **PhumData published version là nguồn sự thật.** Model output chỉ là observation, candidate proposal hoặc cách diễn đạt.
2. **Không có evidence thì không có cultural claim.** Mọi claim hiển thị phải map tới citation/evidence ID hợp lệ.
3. **UNKNOWN là kết quả tốt.** Không tối ưu theo tỷ lệ “có câu trả lời”.
4. **Candidate-constrained generation.** Model không được tạo entity/name/source ngoài candidate/evidence bundle.
5. **Restricted/withdrawn/no-AI data bị loại trước context construction.** Không gửi rồi mới che output.
6. **Không face recognition hoặc suy đoán danh tính, dân tộc, tôn giáo, sức khỏe hay thuộc tính cá nhân từ ảnh.**
7. **Model, prompt, schema, retrieval index và threshold đều version hóa.** Mọi release cần regression test.
8. **Không auto-publish.** AI không tự tạo/sửa/công bố tri thức văn hóa.
9. **Input là untrusted.** Text trong ảnh/user prompt không được override system policy hoặc tool contract.

## 2. Ranh giới tự động hóa

| Use case | Được phép | Không được phép |
|---|---|---|
| Cultural Scanner | Trích xuất đặc điểm nhìn thấy, tìm candidate, tổng hợp từ evidence | Bịa tên/lịch sử, công bố entity mới |
| Grounded Q&A | Trả lời từ published context, kèm nguồn | Tìm web tự do hoặc suy đoán ngoài context |
| Journey suggestion | Rule-first ranking, diễn giải lý do/preferences | Quyết định route safety khi thiếu dữ liệu bản đồ |
| Question drafting | Tạo draft từ entity/evidence | Auto-publish question/answer |
| Translation/simplification | Tạo draft, giữ source language | Ghi đè bản đã reviewer duyệt |
| Contribution moderation assist | Flag missing field, duplicate, risk | Tự approve/reject cultural content |

## 3. Scanner pipeline

```text
1. Intake       image + locale + optional place
2. Sanitize     validate MIME/size, malware/unsafe checks, remove EXIF
3. Observe      structured observable visual attributes only
4. Retrieve     published permitted candidates
5. Rerank       visual/text/location/category/evidence signals
6. Build        evidence bundle with stable IDs and rights/access policy
7. Synthesize   grounded structured response
8. Validate     JSON schema + semantic rules + citation coverage + policy
9. Decide       MATCH | SUGGEST | UNKNOWN | HUMAN_REVIEW
10. Persist     result + model/prompt/schema/index/threshold versions
11. Notify      completion/review event
```

Pipeline phải bất đồng bộ, idempotent và hỗ trợ bounded retry/circuit breaker.

## 4. Input, preprocessing và privacy

- Accept only configured MIME/size/dimension limits.
- Verify actual MIME; do not trust extension/client header.
- Remove EXIF/GPS/device metadata unless product flow explicitly needs and user consents.
- Generate safe derivative; do not send unnecessarily large original to provider.
- Treat people in image as non-identification context; redact/ignore person attributes.
- Raw images private, TTL-controlled, not used for training/evaluation without explicit scope.
- Duplicate/checksum policy may prevent repeated provider cost but must respect access/consent boundaries.

## 5. Vision observation contract

Observation stage may output only visible, non-historical features, for example:

- object/structure/material/shape/color/pattern;
- visible symbols or text with uncertainty;
- scene/place cues without asserting exact identity;
- image quality/occlusion/angle;
- candidate-relevant features.

It must not output origin story, religious meaning, exact entity name or historical claim unless those are only carried later through evidence-grounded synthesis.

## 6. Retrieval and evidence bundle

Retrieval may combine normalized text, taxonomy, place/location, keyword/full-text and evaluated embeddings. Policy filter occurs before candidate ranking/context construction.

Evidence bundle fields include:

- `entity_id`, `entity_version_id`;
- preferred/localized names;
- approved claims with `claim_id` and `field_path`;
- citations with source metadata and safe locator;
- verification level;
- sensitivity/access flags;
- allowed response scope.

Only published versions visible to the caller are valid candidates.

## 7. Prompt architecture

| Layer | Content |
|---|---|
| System policy | source of truth, prohibitions, uncertainty, sensitive rules |
| Task instruction | observe, select candidate, synthesize, draft quiz, etc. |
| Response schema | JSON schema, required fields, enums, lengths |
| Evidence context | approved claims/sources with stable IDs |
| User context | sanitized locale/accessibility/optional place |
| Generation config | model alias, temperature, max output, safety settings |

Prompt registry fields: `prompt_id`, semantic version, status, owner, checksum, schema version, change note. Production uses RELEASED versions only.

## 8. Structured result contract

Required concepts:

- `decision_hint`: MATCH_CANDIDATE / NEED_MORE_CONTEXT / NO_MATCH;
- primary candidate ID or null;
- at most 2 alternatives;
- observed features;
- title/summary grounded in evidence;
- optional cultural meaning only when evidence allows;
- citation IDs;
- verification label not higher than entity version;
- uncertainty note;
- next actions.

Application must validate both JSON schema and semantic rules. Structured output alone does not prove factual correctness.

## 9. Decision policy

```text
final_score =
    w_r * retrieval_score
  + w_v * visual_alignment_score
  + w_l * location_context_score
  + w_q * image_quality_score
  + w_e * evidence_coverage_score
  - policy_penalties
```

Weights/thresholds live in versioned configuration, not prompt/source code. They are calibrated on a rights-approved golden set.

| Decision | Meaning | UI behavior |
|---|---|---|
| MATCH | Top-1 high, margin sufficient, evidence complete, no policy conflict | One primary result + citations + verification label |
| SUGGEST | 2–3 plausible candidates, margin insufficient | Compare/select candidates or provide place/new photo |
| UNKNOWN | No candidate or low score | No assertion; retake/search map/manual discovery |
| HUMAN_REVIEW | Sensitive/conflicting/insufficient evidence or user report | Create review case; show “under review” state |

Do not expose raw numeric confidence as truth; display an understandable band/uncertainty copy.

## 10. Cultural safety controls

- Wrong name/origin/meaning: candidate constraint + citation coverage + UNKNOWN.
- Over-simplification: use reviewer-approved localized content and progressive disclosure.
- Restricted ritual/knowledge: sensitivity/access policy before retrieval.
- Exoticization/stereotype: prohibited tone + cultural review rubric.
- Regional variants: show region/variant and multiple viewpoints when supported.
- Person recognition: prohibited.
- Prompt injection: input treated as data, never as policy/tool instruction.
- Withdrawn/malicious source: publication/rights filter + index/cache invalidation.

## 11. Human review triggers

- User reports incorrect result.
- Sensitive or restricted content.
- Candidate not present in PhumData.
- Conflicting sources/evidence.
- Borderline result or missing evidence.
- Regression after model/prompt/index/threshold change.

Reviewer sees sanitized media, candidate set, evidence, versioned trace and minimum necessary user context. Raw model confidence is not a reviewer conclusion.

## 12. Provider/model strategy

- Access provider through adapter; do not place SDK in domain layer.
- Model names are aliases in config: e.g. `vision_fast`, `grounded_quality`, `embedding_text`.
- Production prefers stable/GA; preview only after offline evaluation + canary + rollback plan.
- Extraction/selection use low temperature.
- Phase 1 uses text retrieval; multimodal/vector only after measured gain.
- Provider outage: bounded retry, circuit breaker, UNKNOWN/cached public fallback; no untested provider switch.

## 13. API, queue and event expectations

- Create scan returns job ID and upload/result polling or subscription contract.
- Idempotency key prevents duplicate job/cost.
- Queue jobs include stable IDs, not raw unrestricted context.
- Worker persists state transitions and attempt/error classification.
- Completion event includes scan/result ID and decision; not full sensitive payload.
- Error classes: invalid input, policy block, provider transient/permanent, schema failure, retrieval empty, review required.

## 14. Evaluation metrics

- Top-1 accuracy on known set.
- Top-3 recall.
- Unknown true rejection.
- False confident rate — critical.
- Citation coverage — 100% for required cultural claims.
- Unsupported claim rate — zero critical.
- Schema validity — operating target ≥99% first-pass.
- P95 latency and cost per completed scan.
- User correction rate by entity/category/version.

Specific accuracy/latency thresholds beyond SRS must be set after prototype and golden dataset; do not invent numbers.

## 15. Required tests

- Unit: score, filters, schema, citations, prompt registry.
- Contract: provider adapter, response/error mapping, embedding/version dimensions.
- Integration: upload → queue → provider mock/sandbox → retrieval → result.
- Regression: full golden set for every model/prompt/index release.
- Load/chaos: concurrent scans, quota, timeout, malformed JSON, Redis restart, duplicate event, DB failover.
- Security: malicious file, oversized input, auth bypass, prompt injection, restricted leakage.
- Cultural review: correctness, respect, variant handling, sensitivity and source quality.

## 16. Monitoring and incident response

Monitor queue depth/job age, success/error/retry, provider latency/quota/cost, decision distribution, user corrections, review backlog, citation failure, policy blocks and slice drift by category/place/device/image quality/version.

| Severity | Example | Response |
|---|---|---|
| SEV-1 | Restricted data leak or widespread false cultural claims | Disable version/feature, invalidate cache, incident process |
| SEV-2 | Error/latency/schema/quota incident | Circuit breaker, scale/tune, rollback |
| SEV-3 | Quality degradation in a slice | Route review, data/threshold/prompt fix |
| SEV-4 | UX/copy issue without correctness impact | Normal backlog |

## 17. Retention and logging

- Raw image: private, TTL, EXIF removed, no training without consent.
- Prompt/context: prefer IDs/versions/redacted snippets; do not log full restricted context.
- Provider response: validated output persisted; raw response TTL short and restricted.
- Trace: model/prompt/index/schema/threshold versions, request ID, cost/token and scores; no secret/PII.
- Feedback/evaluation data must respect consent and be pseudonymized where appropriate.

## 18. Release gates

1. Contract tests and provider mock/timeout pass.
2. Golden set has rights and demo candidate coverage.
3. No critical unsupported claim; false-confident below approved threshold.
4. Restricted/withdrawn data cannot enter context; injection tests pass.
5. Load/quota/retry/circuit/alert/runbook tested.
6. Cultural Lead and Product Owner sign off.

## 19. Acceptance checklist

- Valid image creates idempotent job and unnecessary EXIF is removed.
- Observation schema contains no historical claim.
- Candidate set is published and permitted.
- Every cultural claim has valid citation ID.
- Low/no candidate returns UNKNOWN.
- Borderline returns ≤3 candidates.
- Sensitive/conflicting/insufficient evidence routes HUMAN_REVIEW.
- Result persists all model/prompt/schema/index/threshold versions.
- Consent withdrawal invalidates retrieval within agreed SLA.
- Golden regression runs before release.
- Alerts cover quota, errors, schema failure and quality anomaly.
- UI shows sources, verification and uncertainty consistent with decision.
