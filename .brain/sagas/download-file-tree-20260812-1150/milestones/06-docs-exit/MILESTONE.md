# Milestone 6: Docs + exit verification
- Saga: download-file-tree-20260812-1150
- Depends on: 05-tailwind-shell-restyle

## Goal
Document browse-first + Tailwind stack + deep-link breaking change; run saga-level exit criteria checklist.

## Milestone validation criteria
1. README and PRODUCT.md describe Browse → tree → download actions; deep links no longer auto-zip.
2. AGENTS.md / CLAUDE.md stack table mentions Tailwind/shadcn and tree browse behavior at high level.
3. Orchestrator (or worker) records evidence against each saga exit criterion in `PROGRESS.md`.

## Tasks
- 01-update-product-docs — README/PRODUCT/agent context; depends on: none
- 02-saga-exit-verification — run and log exit criteria; depends on: 01
