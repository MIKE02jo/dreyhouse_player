# vendor/

Third-party packages vendored locally because this sandbox's outbound
network policy blocks direct tarball downloads from `codeload.github.com`
(used by pnpm to resolve git-hosted npm dependencies), while `git clone`
against `github.com` itself is allowed.

- `webworkify-webpack/` — mirror of https://github.com/xqq/webworkify-webpack
  at commit `24d1e719b4a6cac37a518b2bb10fe124527ef4ef`, the exact commit
  `mpegts.js` depends on. Referenced via a pnpm override in `package.json`
  (`pnpm.overrides`) instead of the git-tarball URL. MIT licensed
  (see its own `package.json`/`README.md`).

If a future environment can reach `codeload.github.com` directly, this
override and vendored copy can be removed and `pnpm install` will resolve
the dependency from GitHub again.
