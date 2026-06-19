// Turns a lesson/viz built in-app into a real GitHub pull request against the
// upstream repo — fork, branch, commit, PR — using plain fetch() against the
// GitHub REST API. The caller supplies a short-lived OAuth token obtained via
// AuthContext's signInWithGithubForContribution(); nothing here persists it.

const GITHUB_API = 'https://api.github.com'
export const UPSTREAM_OWNER = 'g4m3rm1k3'
export const UPSTREAM_REPO = 'upskillos'
const DEFAULT_BRANCH = 'main'

async function gh(token, path, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`GitHub API ${options.method ?? 'GET'} ${path} failed (${response.status}): ${detail}`)
  }
  if (response.status === 204) return null
  return response.json()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Forking an already-forked repo just returns the existing fork, so this is
// safe to call every time. Fresh forks take a few seconds to become usable,
// so poll briefly until the fork's default branch ref actually resolves.
export async function ensureFork(token, owner = UPSTREAM_OWNER, repo = UPSTREAM_REPO) {
  const fork = await gh(token, `/repos/${owner}/${repo}/forks`, { method: 'POST' })
  const forkOwner = fork.owner.login

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await gh(token, `/repos/${forkOwner}/${repo}/git/ref/heads/${DEFAULT_BRANCH}`)
      return forkOwner
    } catch {
      await sleep(1000)
    }
  }
  throw new Error('Fork did not become ready in time — try submitting again in a moment.')
}

// Course chapter folders are named "{N}-{slug}" but the builder only knows N,
// not the slug, so look up the real folder name before computing a file path.
// Falls back to a freshly-slugified name when the chapter doesn't exist yet.
export async function resolveChapterFolder(token, forkOwner, repo, courseId, chapterNumber, fallbackSlug) {
  let entries
  try {
    entries = await gh(token, `/repos/${forkOwner}/${repo}/contents/src/courses/${courseId}?ref=${DEFAULT_BRANCH}`)
  } catch {
    entries = []
  }
  const match = (Array.isArray(entries) ? entries : []).find(
    entry => entry.type === 'dir' && entry.name.startsWith(`${chapterNumber}-`)
  )
  return match?.name ?? `${chapterNumber}-${fallbackSlug || 'new-chapter'}`
}

async function getDefaultBranchSha(token, owner, repo) {
  const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${DEFAULT_BRANCH}`)
  return ref.object.sha
}

export async function createContributionBranch(token, forkOwner, repo, slug) {
  const baseSha = await getDefaultBranchSha(token, forkOwner, repo)
  const branch = `contribute/${slug}-${Date.now()}`
  await gh(token, `/repos/${forkOwner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })
  return { branch, baseSha }
}

// Commits one or more files to `branch` in a single commit via the Git Data
// API (tree + commit), rather than the simpler Contents API, so a lesson and
// its companion viz component land together atomically instead of as two
// separate commits.
export async function commitFiles(token, forkOwner, repo, branch, baseSha, files) {
  const blobs = await Promise.all(
    files.map(file =>
      gh(token, `/repos/${forkOwner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
      }).then(blob => ({ path: file.path, sha: blob.sha }))
    )
  )

  const tree = await gh(token, `/repos/${forkOwner}/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseSha,
      tree: blobs.map(({ path, sha }) => ({ path, mode: '100644', type: 'blob', sha })),
    }),
  })

  const commit = await gh(token, `/repos/${forkOwner}/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: `Add lesson: ${files[0]?.path ?? 'contribution'}`,
      tree: tree.sha,
      parents: [baseSha],
    }),
  })

  await gh(token, `/repos/${forkOwner}/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })

  return commit.sha
}

export async function openContributionPR(token, { forkOwner, branch, title, body }) {
  return gh(token, `/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body,
      head: `${forkOwner}:${branch}`,
      base: DEFAULT_BRANCH,
      maintainer_can_modify: true,
    }),
  })
}

// lessonSerializer.getFilePath() returns a path with a literal "[N-chapter-folder]"
// segment because the builder only knows the chapter number, not its slug. Resolve
// that placeholder against the contributor's fork before committing anything.
export async function resolveLessonFilePath(token, forkOwner, courseId, chapterNumber, chapterSlugFallback, placeholderPath) {
  const chapterFolder = await resolveChapterFolder(token, forkOwner, UPSTREAM_REPO, courseId, chapterNumber, chapterSlugFallback)
  return placeholderPath.replace(/\[[^/]*chapter-folder\]/, chapterFolder)
}

/**
 * End-to-end: fork (if needed) -> branch -> commit file(s) -> open PR.
 * `files` must already have real, final repo-relative paths (see resolveLessonFilePath).
 *
 * @param {object} args
 * @param {string} args.token - GitHub access token from signInWithGithubForContribution
 * @param {string} [args.forkOwner] - pass this if you already called ensureFork() yourself
 *   (e.g. to resolve a chapter folder first); otherwise it's resolved here.
 * @param {{path: string, content: string}[]} args.files
 * @param {string} args.title - PR title
 * @param {string} args.body - PR body (should include the GPL-3.0 licensing acknowledgment)
 */
export async function submitContribution({ token, forkOwner, files, title, body }) {
  forkOwner = forkOwner ?? (await ensureFork(token))
  const slugForBranch = files[0]?.path.split('/').pop()?.replace(/\.\w+$/, '') ?? 'contribution'
  const { branch, baseSha } = await createContributionBranch(token, forkOwner, UPSTREAM_REPO, slugForBranch)
  await commitFiles(token, forkOwner, UPSTREAM_REPO, branch, baseSha, files)
  return openContributionPR(token, { forkOwner, branch, title, body })
}
