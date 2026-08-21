# Milestone 1: Security — strip PAT
- Saga: modernize-gitdown-20260810-0858
- Depends on: none

## Goal
Eliminate the embedded GitHub PAT from the shipped source and stop sending a hardcoded Authorization header. Document rotation and that history rewrite is intentionally out of this saga. Unblocks safe modernization.

## Milestone validation criteria
1. No `github_pat_`, `ghp_`, or hardcoded `Authorization: token …` string literals remain in `app/home/down-git.js` (or any tracked app source).
2. Directory walk and Contents probe use the same auth policy: **no** Authorization header unless a future CredentialStore supplies a token (M1 may simply never send Authorization).
3. README (or `SECURITY.md`) states: (a) rotate any previously exposed token, (b) never commit tokens, (c) history scrub is a manual out-of-band step not performed by this saga.
4. App still loads via static server without console ReferenceErrors from the edit (smoke: open `/`).

## Tasks
- 01-strip-hardcoded-pat — Remove secret + unify unauthenticated HTTP; depends on: none
- 02-document-secret-rotation — Security docs; depends on: 01-strip-hardcoded-pat
