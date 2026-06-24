// Turns a lesson/viz built in-app into a real GitHub pull request against the
// upstream repo — fork, branch, commit, PR — using plain fetch() against the
// GitHub REST API. No Firebase involved; caller supplies a personal access token.

const GITHUB_API = 'https://api.github.com'
export const UPSTREAM_OWNER = 'g4m3rm1k3'
export const UPSTREAM_REPO = 'upskillos'

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
// safe to call every time. Uses the fork response's own default_branch rather
// than assuming 'main', then polls until that ref resolves in the new fork.
// Find an existing fork of owner/repo accessible to this token — checks the
// authenticated user's personal account and all their org memberships.
async function findExistingFork(token, repo) {
  const namespaces = []
  try {
    const user = await gh(token, '/user')
    if (user.login) namespaces.push(user.login)
  } catch { /* ignore */ }
  try {
    const orgs = await gh(token, '/user/orgs')
    if (Array.isArray(orgs)) orgs.forEach(o => namespaces.push(o.login))
  } catch { /* ignore */ }

  for (const ns of namespaces) {
    try {
      const info = await gh(token, `/repos/${ns}/${repo}`)
      if (info.fork) return info   // confirm it's actually a fork, not an unrelated repo
    } catch { /* not found under this namespace */ }
  }
  return null
}

export async function ensureFork(token, owner = UPSTREAM_OWNER, repo = UPSTREAM_REPO) {
  // First look for an existing fork across personal account + all orgs
  let forkInfo = await findExistingFork(token, repo)

  if (!forkInfo) {
    // No fork found anywhere — create one under the personal account
    await gh(token, `/repos/${owner}/${repo}/forks`, { method: 'POST' })
    let lastError = 'fork not yet accessible'
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(2000)
      forkInfo = await findExistingFork(token, repo)
      if (forkInfo) break
      lastError = 'still not found'
    }
    if (!forkInfo) throw new Error(`Fork creation timed out after 60s. Make sure your token has the public_repo scope.`)
  }

  return { forkOwner: forkInfo.owner.login, defaultBranch: forkInfo.default_branch }
}

// Course chapter folders are named "{N}-{slug}" but the builder only knows N,
// not the slug, so look up the real folder name before computing a file path.
export async function resolveChapterFolder(token, forkOwner, repo, courseId, chapterNumber, fallbackSlug, defaultBranch) {
  let entries
  try {
    entries = await gh(token, `/repos/${forkOwner}/${repo}/contents/src/courses/${courseId}?ref=${defaultBranch}`)
  } catch {
    entries = []
  }
  const match = (Array.isArray(entries) ? entries : []).find(
    entry => entry.type === 'dir' && entry.name.startsWith(`${chapterNumber}-`)
  )
  return match?.name ?? `${chapterNumber}-${fallbackSlug || 'new-chapter'}`
}

async function getDefaultBranchSha(token, owner, repo) {
  const repoInfo = await gh(token, `/repos/${owner}/${repo}`)
  const branch = repoInfo.default_branch
  const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
  return { sha: ref.object.sha, branch }
}

export async function createContributionBranch(token, forkOwner, repo, slug) {
  const { sha: baseSha, branch: baseBranch } = await getDefaultBranchSha(token, forkOwner, repo)
  const branch = `contribute/${slug}-${Date.now()}`
  await gh(token, `/repos/${forkOwner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })
  return { branch, baseSha, baseBranch }
}

// Commits one or more files atomically via the Git Data API (blob → tree → commit).
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

export async function openContributionPR(token, { forkOwner, branch, baseBranch, title, body }) {
  return gh(token, `/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body,
      head: `${forkOwner}:${branch}`,
      base: baseBranch,
      maintainer_can_modify: true,
    }),
  })
}

// lessonSerializer.getFilePath() returns a path with a literal "[N-chapter-folder]"
// segment. Resolve that against the contributor's fork before committing.
export async function resolveLessonFilePath(token, forkOwner, defaultBranch, courseId, chapterNumber, chapterSlugFallback, placeholderPath) {
  const chapterFolder = await resolveChapterFolder(token, forkOwner, UPSTREAM_REPO, courseId, chapterNumber, chapterSlugFallback, defaultBranch)
  return placeholderPath.replace(/\[[^/]*chapter-folder\]/, chapterFolder)
}

// Check whether the token has push access to the upstream repo.
// GitHub includes a `permissions` object on the repo response for the
// authenticated user, so this is the most reliable single-call check.
async function hasWriteAccess(token) {
  try {
    const repo = await gh(token, `/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`)
    return repo.permissions?.push === true
  } catch {
    return false
  }
}

/**
 * End-to-end: push → PR.
 * Collaborators push a branch directly to the upstream; everyone else forks first.
 * `files` must have real repo-relative paths (see resolveLessonFilePath).
 */
export async function submitContribution({ token, files, title, body }) {
  const slugForBranch = files[0]?.path.split('/').pop()?.replace(/\.\w+$/, '') ?? 'contribution'
  const canPushDirect = await hasWriteAccess(token)

  if (canPushDirect) {
    // Collaborator: branch directly on upstream, no fork needed
    const { branch, baseSha, baseBranch } = await createContributionBranch(token, UPSTREAM_OWNER, UPSTREAM_REPO, slugForBranch)
    await commitFiles(token, UPSTREAM_OWNER, UPSTREAM_REPO, branch, baseSha, files)
    return openContributionPR(token, { forkOwner: UPSTREAM_OWNER, branch, baseBranch, title, body })
  } else {
    // External contributor: fork → branch on fork → PR
    const { forkOwner, defaultBranch } = await ensureFork(token)
    const { branch, baseSha, baseBranch } = await createContributionBranch(token, forkOwner, UPSTREAM_REPO, slugForBranch)
    await commitFiles(token, forkOwner, UPSTREAM_REPO, branch, baseSha, files)
    return openContributionPR(token, { forkOwner, branch, baseBranch, title, body })
  }
}
