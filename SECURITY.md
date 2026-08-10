# Security

A GitHub personal access token (PAT) was previously committed in client source (legacy Angular path `app/home/down-git.js`). That secret has been removed from the working tree. Operators and contributors should treat the following as mandatory.

## 1. Rotate any previously exposed tokens

Assume any token that ever appeared in this repository (working tree or git history) is compromised. Revoke and rotate it in GitHub settings immediately. Do not reuse the old credential.

## 2. Never commit PATs

Do not commit GitHub PATs, API keys, or other secrets into this repository. Prefer the unauthenticated public GitHub API with clear rate-limit UX, or an optional user-supplied token stored only in memory / `localStorage` — never in source control. There is no TheGitDown backend that receives tokens.

## 3. History scrub is out-of-band

Rewriting git history to purge leaked secrets (for example with `git filter-repo` or BFG Repo-Cleaner) is an **out-of-band** operator responsibility. It is **not** performed by the modernization saga. Coordinate force-pushes, mirror updates, and collaborator re-clones separately if you choose to scrub history.
