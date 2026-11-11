# Audit: iam-security (113 questions, 14 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/iam-security/results/`.

Result: 99 of 113 verified by both workers. No answer key changed; 13 questions were repaired by replacing options and two stems were edited (key letters unchanged, no re-grade).

## Options replaced (keys unchanged, approved by the user)
- Human users and long-term credentials (AWS now recommends temporary credentials through IAM Identity Center or federation): `q_7c443b4d2130` (administrative identity with temporary credentials; root access keys for every developer as the wrong option), `q_718e0fe1aca1`, `q_4e4a0821e5b7` (IAM users for a third-party client that cannot use roles), `q_4a1a05d40368` (require MFA), `q_7061d4ff0c64` (an SSH key pair replaces user name and password, which `aws login` can now use).
- Arguable distractors: `q_476b25b75931` (centralized root access), `q_7f7a634431f6` (closing a member account does not need root; the keyed option became a root-only task), `q_ed68456a547a`, `q_55f0c7b42814`, `q_72bd82422368`, `q_39185e4299a6`.

## Stems edited (Inspector Classic ended 2026-05-20)
- `q_c7cb45dd25db`: "predefined assessment templates" became "automated vulnerability scans". `q_850ab39b7c4f`: "must identify infrastructure deployments that do not meet best practices" became "unintended network exposure".

## Wording (flagged by both workers)
- `q_5ea0307c02be` note E (RDS applies required patches; the customer chooses windows and optional updates), `q_21a81c37f010` note D (update credentials when needed, prefer temporary ones).
- Lessons (EN+VI): 03 IAM users for specific cases and Regional STS endpoints; 05 access keys are the long-term CLI credential, temporary credentials preferred; 12 Macie trial excludes discovery jobs.

## Left unchanged (one worker only)
- `q_920698380b7b` (Macie PII alerting scope), and about 17 minor Codex lesson notes (policy evaluation wording, service-linked roles, AssumeRole duration, SCPs and the management account, ACM pricing and renewal, Shield Response Team plans, Inspector score, Detective wording).
