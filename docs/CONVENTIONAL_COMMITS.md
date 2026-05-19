# Conventional Commits at Kamma

This doc shows you how to wire up the [conventional-commits release flow](https://docs.kammadata.com/#/development/release_strategy) on a Kamma repo.

Canonical reference: [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy).

**Design principle:** no Node tooling required. Local enforcement is a single bash hook; CI uses the same regex inline. One source of truth, zero extra dev deps.

## What you get

- **Commit-time validation** — `git commit` fails locally if your message doesn't match `<type>(KAM-XXXX): description`.
- **CI gate on PRs** — every commit in the PR is validated against the same regex; non-conforming commits block merge.
- **PR title gate** — the PR title itself is validated (catches anything that slips past the per-commit check, useful if squash-merging is ever enabled).
- **Auto-versioned releases on merge to main** — `ietf-tools/semver-action` computes the next version from commit types; `requarks/changelog-action` builds categorised release notes; `softprops/action-gh-release` publishes the tag + release.
- **Auto back-merge for hotfixes** — hotfix branches that merge to `main` trigger an automated back-merge PR to `integration`.

## Quickstart: enabling on a new repo

### 1. Add the bash commit-msg hook

Copy the canonical hook into the target repo's `.githooks/` directory:

```bash
mkdir -p .githooks
curl -fsSL https://raw.githubusercontent.com/KammaData/.github/main/templates/commit-msg \
  -o .githooks/commit-msg
chmod +x .githooks/commit-msg
```

Commit `.githooks/commit-msg` into the repo so everyone gets the same validation.

### 2. Tell git to use it

Each developer runs this once per clone:

```bash
git config core.hooksPath .githooks
```

Add that line to the repo's `make setup` target (or equivalent setup script) so it runs automatically on first checkout. Document it in the README under "Setup".

That's it for local enforcement. No `npm install`. No Node prerequisites.

### 3. Add the workflow

Copy the workflow template into `.github/workflows/`:

```bash
mkdir -p .github/workflows
curl -fsSL https://raw.githubusercontent.com/KammaData/.github/main/workflow-templates/kamma-conventional-release.yml \
  -o .github/workflows/00-conventional-release.yml
```

Merge it with the repo's existing build/test/deploy jobs. The template covers commit-lint, PR-title-lint, release, and hotfix back-merge. The repo's existing workflow keeps responsibility for lint, test, image build, and staging/production deploy.

### 4. Update branch protection on `main` and `integration`

In **Settings → Branches → Branch protection rules**, require these status checks:

- `Conventional Commits` (commit-lint job)
- `PR Title` (pr-title-lint job)
- The repo's existing lint/test checks

And tick:

- "Require a pull request before merging"
- "Require status checks to pass before merging"
- "Require branches to be up to date before merging"

Kamma uses **merge commits** — don't enable "Require linear history" or default to squash merges.

### 5. Bootstrap commit

Make the first commit on the repo using the new format:

```
chore(KAM-XXXX): adopt conventional commits release flow
```

Pushing this to `main` triggers the workflow and cuts the first auto-versioned release.

## Commit format reference

```
<type>(KAM-XXXX): <imperative description>

[optional body]

[optional footer(s)]
```

| Type        | Bump     | Example                                                                |
| ---         | ---      | ---                                                                    |
| `feat`      | minor    | `feat(KAM-7050): add bulk-import endpoint for properties`               |
| `fix`       | patch    | `fix(KAM-6697): suppress 404 noise from client preferences lookup`      |
| `perf`      | patch    | `perf(KAM-7100): cache resolved branch hierarchy per request`           |
| `refactor`  | patch    | `refactor(KAM-6699): extract branch-display helper from header`         |
| `test`      | patch    | `test(KAM-7050): cover bulk-import edge cases`                          |
| `docs`      | patch    | `docs(KAM-7012): document conventional-commit release flow`             |
| `chore`     | patch    | `chore(KAM-7001): bump kamma/sso to v8.7.40`                            |
| `build`     | patch    | `build(KAM-7150): switch to multi-stage Dockerfile`                     |
| `ci`        | patch    | `ci(KAM-7160): enable parallel test runs`                               |
| `style`     | patch    | `style(KAM-7170): apply Pint suggestions`                               |

Any commit with `<type>(KAM-XXXX)!:` or a `BREAKING CHANGE:` footer triggers a **major** bump.

## What if I really can't conform?

- **Bot commits** (`[GitHub Action: ...]`, `[Auto-Deploy] ...`, `[Manual Deploy] ...`) — exempt at the regex level.
- **Merge commits** (`Merge pull request #N from ...`, `Merge branch ...`) — exempt.
- **Reverts** (`Revert ...`) — exempt.
- **`helm-charts` repo** — exempt entirely. It's config, not application code.

Everything else must conform.

## Troubleshooting

**Hook isn't running** — run `git config core.hooksPath` to check it's set to `.githooks`. If empty, you forgot step 2. Run `git config core.hooksPath .githooks`.

**"commit-msg hook expects a message file path"** — you ran the script directly; it's invoked by git. Just commit normally.

**PR check fails on a commit you didn't write** — someone in the PR's history has a non-conforming commit. Either:
- Have them amend & force-push, or
- Squash the PR's history with `git rebase -i origin/integration` and rewrite into clean commits.

**Releases aren't auto-cutting on merge to main** — check the workflow run. Common causes: no new commits since last tag (no-op), all commits are bot-ignored (no-op), or the `release` job's permissions are missing `contents: write`.

## See also

- [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy)
- [docs.kammadata.com → Branching Strategy](https://docs.kammadata.com/#/development/branching_strategy)
- [docs.kammadata.com → Release Strategy](https://docs.kammadata.com/#/development/release_strategy)
- [Conventional Commits 1.0.0 spec](https://www.conventionalcommits.org/en/v1.0.0)
