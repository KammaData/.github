# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

`KammaData/.github` — GitHub organisation-wide config for Kamma. Holds shared workflow templates, PR templates, profile content (the org's GitHub homepage), and shared baseline configs that individual Kamma repos copy into their own root.

This repo is not deployed — it's pure configuration consumed by other repos and by GitHub itself.

## Repository Structure

- **`.github/pull_request_template.md`** — the default PR template applied to every Kamma repo that doesn't override it.
- **`profile/README.md`** + **`profile/logo.png`** — the public org profile at https://github.com/KammaData.
- **`workflow-templates/`** — GitHub Actions workflow templates. GitHub recommends these via the "New workflow" UI when the `filePatterns` in the matching `.properties.json` file matches a target repo's content. Templates:
  - `kamma-conventional-release.yml` — conventional-commits release flow (commit-lint, PR-title-lint, semver-action release, hotfix back-merge). The canonical reference for new Kamma application repos.
  - `kamma-phpunit.yml` — PHPUnit test runner template.
  - `kamma-php-cs-fixer.yml` — PHP-CS-Fixer template.
  - `kamma-ecr.yml` — ECR push template (legacy; GCR is the current standard).
- **`templates/`** — non-workflow shared baselines that repos copy to their own root:
  - `commitlint.config.cjs` — `@commitlint/config-conventional` + Kamma scope rule (KAM-XXXX required).
  - `lefthook.yml` — commit-msg hook config wiring up `npx commitlint`.
- **`docs/CONVENTIONAL_COMMITS.md`** — quickstart guide for enabling the conventional-commits flow on a Kamma repo.

## Git Commit Message Format

Commits in this repo follow the Kamma org-wide convention: [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0). The canonical reference is at [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy).

```
<type>(KAM-XXXX): <imperative description>
```

- Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `style`, `build`, `ci`, `revert`
- Scope: Jira ticket `KAM-\d+`, required
- Description: imperative, ≤ 72 chars subject

This repo doesn't yet enforce commit-lint locally or in CI (it's small, low-traffic), but emit the right format anyway so the convention holds across the org.

## When Updating Shared Templates

Be careful — `templates/commitlint.config.cjs`, `templates/lefthook.yml`, and `workflow-templates/kamma-conventional-release.yml` are copied into individual repos rather than referenced. Updates here don't propagate automatically; downstream repos need a follow-up PR to pull the new template version. When making a non-trivial change:

1. Update the template here.
2. Open a follow-up commit/PR in each downstream consumer (`kamma-suite`, `kamma-sso`, etc.) to copy the change.
3. Note the cascade in the commit message so the dependency is visible.

## Related repos

- [`KammaData/kamma-docs`](https://github.com/KammaData/kamma-docs) — canonical docs site (commit/branching/release strategy pages live here)
- [`KammaData/kamma-suite`](https://github.com/KammaData/kamma-suite) — primary consumer of these templates
- [`KammaData/kamma-sso`](https://github.com/KammaData/kamma-sso) — primary consumer of these templates
