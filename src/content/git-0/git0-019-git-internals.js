const lesson = {
  id: "git-0-019",
  slug: "git-internals",
  chapter: "git-0",
  order: 19,
  title: "Git Internals",
  subtitle: "What's actually happening inside .git/",
  tags: ["git", "internals", "objects", "SHA", "blob", "tree", "commit", "reflog"],
  aliases: ["git objects", "SHA hash", "git internals", "how git works", "reflog"],

  hook: `Everything you do in Git ultimately creates a small file in \`.git/objects/\`. Understanding those four file types explains why Git is so fast, why history is immutable, and how to recover from things that seem unrecoverable.`,

  mentalModel: [
    "Git stores four object types: blob (file content), tree (directory), commit (snapshot + metadata), tag (annotated tag). Every object is identified by its SHA-1 hash.",
    "Objects are content-addressed — the hash IS the content. The same content always produces the same hash. Identical files share one blob.",
    "The reflog is a local-only log of every position HEAD has been — your safety net for recovering 'lost' commits.",
  ],

  intuition: {
    prose: [
      "**The four object types.** A **blob** is the raw content of a file — no filename, no permissions. A **tree** is a directory: it lists filenames, permissions, and the hash of each file's blob (or subtree). A **commit** points to a tree (the project snapshot), has a parent commit hash, and stores author, committer, timestamp, and message. An **annotated tag** object stores a reference to a commit plus tagger info and a message.",
      "**Content addressing.** Every object's name IS its content, hashed with SHA-1. If you store the same file twice, there's one blob — both entries point to the same hash. Change one byte in a file, you get a completely different hash. This is why Git can detect corruption and why identical files don't waste space.",
      "**What a commit really is.** When you run `git commit`, Git: (1) creates a blob for each changed file, (2) creates a tree object representing the full directory structure, (3) creates a commit object pointing to that tree + the previous HEAD commit. The branch pointer is simply updated to the new commit hash. Branches are just files containing a 40-character hash.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Inspect objects with git cat-file",
        body: "`git cat-file -t <hash>` — shows the type of a Git object (blob, tree, commit, tag)\n`git cat-file -p <hash>` — pretty-prints the content\nTry: `git cat-file -p HEAD` — shows your last commit object\nThen copy the tree hash from the output and: `git cat-file -p <tree-hash>` — shows the directory listing",
      },
    ],
  },

  rigor: {
    prose: [
      "**Pack files.** Git's object store starts as loose objects (one file per object in `.git/objects/`). Over time Git packs them into a `.pack` file with delta compression — storing only the differences between similar objects. This is why `.git/` is much smaller than the full history would suggest. `git gc` triggers packing manually, but Git does it automatically.",
      "**The reflog.** `git reflog` shows a local-only history of every position HEAD has pointed to: commits, merges, rebases, branch switches, resets. Each entry has a short notation: `HEAD@{0}` (current), `HEAD@{1}` (previous), `HEAD@{5}` (five moves ago). If you reset or rebased and 'lost' commits, they're still in the object store (until GC). Find them with `git reflog`, then `git checkout <hash>` or `git branch recovery <hash>` to bring them back.",
      "**Refs and branches.** `.git/refs/heads/main` is a file containing the hash of the latest commit on main. `.git/refs/tags/v1.0.0` contains the commit (or tag object) hash. `.git/HEAD` contains either a ref (`ref: refs/heads/main`) or a raw hash (detached HEAD). This entire branch system is just text files. Branches are cheap because creating one just writes a 40-byte file.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The Four Git Object Types",
        body: "**blob** — raw file content (no filename)\n**tree** — directory listing: filenames, permissions, child hashes\n**commit** — tree hash + parent commit hash + author + message\n**tag** — annotated tag: points to commit + tagger info + message\n\nAll objects are immutable. Changing anything creates a new object with a new hash.",
      },
    ],
  },

  examples: [
    {
      title: "Inspect your last commit's object chain",
      body: "`git cat-file -p HEAD` — view the commit object (shows tree hash, parent, author)\n`git cat-file -p <tree-hash>` — view the tree (directory listing)\n`git cat-file -p <blob-hash>` — view a file's raw content\nThis is reading the exact data Git stores on disk.",
    },
    {
      title: "Recover a 'lost' commit with reflog",
      body: "`git reset --hard HEAD~3` — you just threw away 3 commits\n`git reflog` — find the hash before the reset (e.g. `abc1234 HEAD@{1}: commit: your lost commit`)\n`git branch recovery abc1234` — create a branch pointing to the lost commit\nThe commits were never deleted — just unreferenced.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-019-q1",
        type: "choice",
        text: "A Git blob stores:",
        options: [
          "A filename and its contents",
          "Raw file content only — no filename or permissions",
          "A directory listing",
          "A commit message and timestamp",
        ],
        answer: "Raw file content only — no filename or permissions",
      },
      {
        id: "git0-019-q2",
        type: "choice",
        text: "You ran `git reset --hard` and lost some commits. How do you recover them?",
        options: [
          "They are gone forever — hard reset is permanent",
          "Use `git revert` on the reset commit",
          "Use `git reflog` to find the commit hash, then create a branch pointing to it",
          "Use `git stash pop` to restore them",
        ],
        answer: "Use `git reflog` to find the commit hash, then create a branch pointing to it",
      },
      {
        id: "git0-019-q3",
        type: "choice",
        text: "Two different files with identical content will have:",
        options: [
          "Two different blob objects",
          "One shared blob object (same hash, same content)",
          "One tree object containing both",
          "Two commits pointing to different trees",
        ],
        answer: "One shared blob object (same hash, same content)",
      },
    ],
  },
};

export default lesson;
