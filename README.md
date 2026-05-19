# Kamma GitHub global config

GitHub configuration for Kamma.

## Conventional Commits release flow

Kamma application repos use conventional commits to drive automated versioning and release-note generation. See [`docs/CONVENTIONAL_COMMITS.md`](docs/CONVENTIONAL_COMMITS.md) for the full guide and quickstart.

- **Local hook:** [`templates/commit-msg`](templates/commit-msg) — bash script, copy into each repo's `.githooks/` and set `core.hooksPath`. No Node tooling required.
- **Workflow template:** [`workflow-templates/kamma-conventional-release.yml`](workflow-templates/kamma-conventional-release.yml) — commit-lint + PR-title-lint + auto-release + hotfix back-merge (same bash regex as the local hook).
- **Canonical docs:** [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy).

## Workflow Templates (GitHub Actions)

Following the [GitHub docs](https://docs.github.com/en/actions/learn-github-actions/sharing-workflows-with-your-organization#creating-a-workflow-template) this repo contains several useful templates for actions we use across all repos at Kamma. For things such as; PHPUnit, Pushing to ECR, etc.

Check out the `./workflow-templates` directory for all of the available templates. GitHub should recommend their usage if the `filePatterns` are set correctly.
