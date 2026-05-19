# Conventional Commits at Kamma

This doc shows you how to wire up the [conventional-commits release flow](https://docs.kammadata.com/#/development/release_strategy) on a Kamma repo.

Canonical reference: [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy).

## What you get

- **Commit-time validation** — `git commit` fails locally if your message doesn't match `<type>(KAM-XXXX): description`.
- **CI gate on PRs** — `wagoid/commitlint-github-action` blocks merging if any commit in the PR is non-conforming.
- **PR title gate** — `amannn/action-semantic-pull-request` ensures the PR title is also a valid conventional commit.
- **Auto-versioned releases on merge to main** — `ietf-tools/semver-action` computes the next version from commit types; `requarks/changelog-action` builds categorised release notes; `softprops/action-gh-release` publishes the tag + release.
- **Auto back-merge for hotfixes** — hotfix branches that merge to `main` trigger an automated back-merge PR to `integration`.

## Quickstart: enabling on a new repo

### 1. Add the shared configs

Copy the two template files from this repo into the target repo's root:

```bash
curl -fsSL https://raw.githubusercontent.com/KammaData/.github/main/templates/commitlint.config.cjs \
  -o commitlint.config.cjs
curl -fsSL https://raw.githubusercontent.com/KammaData/.github/main/templates/lefthook.yml \
  -o lefthook.yml
```

### 2. Add Node dev dependencies

```bash
npm install --save-dev \
  @commitlint/cli \
  @commitlint/config-conventional \
  lefthook
```

Even PHP-only repos need a `package.json` with these three dev deps so commitlint can run.

### 3. Install the git hook

```bash
npx lefthook install
```

This wires up `.git/hooks/commit-msg` to run commitlint on every commit. Commits to **this clone** are now validated; teammates need to run the same command after cloning.

Add to the repo's README under "Setup":

> After cloning, run `npx lefthook install` to enable commit-message validation.

### 4. Add the workflow

Copy the workflow template into `.github/workflows/`:

```bash
mkdir -p .github/workflows
curl -fsSL https://raw.githubusercontent.com/KammaData/.github/main/workflow-templates/kamma-conventional-release.yml \
  -o .github/workflows/00-conventional-release.yml
```

You'll need to merge it with the repo's existing build/test/deploy jobs. The shared template covers commit-lint, PR-title-lint, release, and hotfix back-merge. The repo's existing workflow keeps responsibility for lint, test, image build, and staging/production deploy.

### 5. Update branch protection on `main` and `integration`

In **Settings → Branches → Branch protection rules**, require these status checks:

- `Conventional Commits` (commit-lint job)
- `PR Title` (pr-title-lint job)
- The repo's existing lint/test checks

And tick:

- "Require a pull request before merging"
- "Require status checks to pass before merging"
- "Require branches to be up to date before merging"

Do NOT tick "Require linear history" or "Allow squash merging" as the default — Kamma uses merge commits.

### 6. Bootstrap commit

Make the first commit on the repo using the new format:

```
chore(KAM-XXXX): adopt conventional commits release flow
```

Pushing this to `main` will trigger the workflow and cut the first auto-versioned release. If the repo had `v2.1.47` as its last tag, this lands as `v2.1.48`.

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

Any commit with a `BREAKING CHANGE:` footer triggers a **major** bump.

## What if I really can't conform?

- **Bot commits** (`[GitHub Action: ...]`, `[Auto-Deploy] ...`) — already exempt via `commitlint.config.cjs` ignores.
- **`helm-charts` repo** — exempt entirely. It's config, not application code.
- **Manual deploy commits in helm-charts** — use `[Manual Deploy] <service> <env> → <tag>` (the `kamma:deploy-staging` / `kamma:deploy-production` skills handle this).

## Troubleshooting

**"scope must be a Jira ticket reference"** — your commit message is missing `(KAM-XXXX)`. Amend with `git commit --amend` and add the scope.

**"header must not be longer than 72 characters"** — shorten the description. Move detail into the body.

**PR check fails on a commit you didn't write** — someone in the PR's history has a non-conforming commit. Either:
- Have them amend & force-push, or
- Squash the PR's history with `git rebase -i origin/integration` and rewrite into clean commits.

**Releases aren't auto-cutting on merge to main** — check the workflow run. Common causes: no new commits since last tag (no-op), all commits are bot-ignored (no-op), or the `release` job's permissions are missing `contents: write`.

## See also

- [docs.kammadata.com → Commit Strategy](https://docs.kammadata.com/#/development/commit_strategy)
- [docs.kammadata.com → Branching Strategy](https://docs.kammadata.com/#/development/branching_strategy)
- [docs.kammadata.com → Release Strategy](https://docs.kammadata.com/#/development/release_strategy)
- [Conventional Commits 1.0.0 spec](https://www.conventionalcommits.org/en/v1.0.0)
