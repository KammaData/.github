/**
 * Kamma shared commitlint configuration.
 *
 * Copy this file to the root of each Kamma application/library repo so
 * commit messages are validated locally (via lefthook + commit-msg hook)
 * and in CI (via wagoid/commitlint-github-action).
 *
 * Format:   <type>(KAM-XXXX): <imperative description>
 * See:      https://docs.kammadata.com/#/development/commit_strategy
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // Scope must be a Jira ticket of the form KAM-1234.
        'scope-jira-ticket': ({ scope }) => [
          /^KAM-\d+$/.test(scope ?? ''),
          'scope must be a Jira ticket reference, e.g. (KAM-1234)',
        ],
      },
    },
  ],
  rules: {
    // Override standard conventional rules with Kamma-specific tightening.
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'upper-case'],
    'scope-jira-ticket': [2, 'always'],
    'header-max-length': [2, 'always', 72],
    'subject-empty': [2, 'never'],
    'subject-case': [
      2,
      'never',
      ['upper-case', 'pascal-case', 'start-case'],
    ],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'refactor',
        'test',
        'docs',
        'chore',
        'style',
        'build',
        'ci',
        'revert',
      ],
    ],
  },
  ignores: [
    // CI bots and auto-merge commits don't conform; that's intentional.
    (message) => /^\[GitHub Action:/.test(message),
    (message) => /^\[Auto-Deploy\]/.test(message),
    (message) => /^\[Manual Deploy\]/.test(message),
    (message) => /^Merge pull request #\d+/.test(message),
    (message) => /^Merge branch /.test(message),
    (message) => /^Revert /.test(message),
  ],
};
