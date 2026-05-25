const lesson = {
  id: "git-0-016",
  slug: "tags-and-releases",
  chapter: "git-0",
  order: 16,
  title: "Tags & Releases",
  subtitle: "Marking milestones permanently",
  tags: ["git", "tag", "release", "versioning", "semver"],
  aliases: ["git tag", "release", "version", "semver", "annotated tag"],

  hook: `Branches move — every commit advances them. Tags don't. A tag is a permanent, immovable marker on a specific commit. Tags are how software versions exist in Git.`,

  mentalModel: [
    "A lightweight tag is a simple pointer to a commit (like a branch that never moves). An annotated tag is a full Git object with a message, author, and GPG signature.",
    "Use annotated tags for releases — they carry metadata. Use lightweight tags for personal temporary markers.",
    "`git push` does NOT push tags automatically — use `git push origin --tags` or `git push origin v1.2.0`.",
  ],

  intuition: {
    prose: [
      "**Creating tags.** `git tag v1.0.0` creates a lightweight tag on the current commit. `git tag -a v1.0.0 -m \"Version 1.0.0 — initial stable release\"` creates an annotated tag with metadata. For real releases, always use annotated tags.",
      "**Tagging a past commit.** You can tag any commit: `git tag -a v1.0.0 abc1234 -m \"Version 1.0.0\"`. Useful when you forgot to tag at the time of release.",
      "**Listing, viewing, and deleting.** `git tag` lists all tags. `git tag -l \"v1.*\"` lists tags matching a pattern. `git show v1.0.0` shows the tag metadata and the tagged commit. `git tag -d v1.0.0` deletes a local tag. To delete a remote tag: `git push origin --delete v1.0.0`.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Push tags explicitly",
        body: "By default, `git push` does NOT push tags. You must explicitly push them. Push one: `git push origin v1.0.0`. Push all new tags: `git push origin --tags`. Push all tags including updates: `git push origin --follow-tags`.",
      },
    ],
  },

  rigor: {
    prose: [
      "**Annotated vs lightweight tags.** A lightweight tag is just a `.git/refs/tags/v1.0.0` file containing a commit hash — exactly like a branch file. An annotated tag creates a tag object in `.git/objects/` with: the tagger name/email/date, the message, the tagged object hash, and optionally a GPG signature. `git show` on an annotated tag shows all this metadata.",
      "**Semantic versioning (SemVer).** Most projects use SemVer: `MAJOR.MINOR.PATCH`. Increment MAJOR for breaking API changes, MINOR for new backward-compatible features, PATCH for bug fixes. Pre-releases: `v1.0.0-alpha.1`, `v1.0.0-rc.2`. Build metadata: `v1.0.0+build.456`. SemVer communicates change scope to users.",
      "**GitHub Releases.** On GitHub, you create a Release by associating a tag with release notes, binaries, and changelogs. `git tag -a v2.0.0 -m \"...\"` then `git push origin v2.0.0` creates the tag on GitHub. Then on GitHub UI (or CLI): create a Release from that tag with a title and description.",
    ],
    callouts: [
      {
        type: "definition",
        title: "SemVer Quick Reference",
        body: "**v1.2.3** — MAJOR=1, MINOR=2, PATCH=3\n**Patch** — bug fixes, security patches (backward compatible)\n**Minor** — new features (backward compatible)\n**Major** — breaking changes (API changes that break existing users)\n**0.x.x** — initial development, anything may change\n**v1.0.0** — first stable public API",
      },
    ],
  },

  examples: [
    {
      title: "Tag and push a release",
      body: "`git switch main`\n`git pull` — make sure you're on latest\n`git tag -a v2.1.0 -m \"Add CSV export and fix auth bug\"`\n`git push origin v2.1.0` — push the tag\n`# Create a Release on GitHub from this tag`",
    },
    {
      title: "Checkout code at a specific version",
      body: "`git checkout v1.5.0` — detaches HEAD at that tag's commit\nYou're now looking at exactly what v1.5.0 contained. Make a branch if you need to do work: `git switch -c patch/v1.5.1`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-016-q1",
        type: "choice",
        text: "What makes an annotated tag different from a lightweight tag?",
        options: [
          "Annotated tags move like branches; lightweight tags don't",
          "Annotated tags store metadata (tagger, date, message); lightweight tags are just commit pointers",
          "Annotated tags are only for GitHub releases; lightweight are for local",
          "Lightweight tags are pushed automatically; annotated tags are not",
        ],
        answer: "Annotated tags store metadata (tagger, date, message); lightweight tags are just commit pointers",
      },
      {
        id: "git0-016-q2",
        type: "choice",
        text: "You run `git push origin main`. Your new tag `v1.0.0` will:",
        options: [
          "Be pushed automatically with the branch",
          "NOT be pushed — tags require an explicit push",
          "Be pushed only if it was an annotated tag",
          "Be pushed only if the tag points to HEAD",
        ],
        answer: "NOT be pushed — tags require an explicit push",
      },
      {
        id: "git0-016-q3",
        type: "choice",
        text: "In SemVer, you introduce a new feature that is backward compatible. You increment:",
        options: ["MAJOR", "MINOR", "PATCH", "PRE-RELEASE"],
        answer: "MINOR",
      },
    ],
  },
};

export default lesson;
