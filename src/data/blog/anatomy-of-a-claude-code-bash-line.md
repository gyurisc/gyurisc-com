---
title: Anatomy of a Claude Code Bash Line
pubDatetime: 2026-09-06T08:30:00Z
description: One line of shell I type at Claude Code all the time, taken apart piece by piece — the bang prefix, the stderr merge, and the pipe fitting that lets me watch a run and keep it at the same time.
draft: true
tags:
  - claude-code
  - shell
  - notes
---

I type this at Claude Code often enough that I stopped reading it:

```bash
! ./iterate.sh 2>&1 | tee iteration3.log
```

Five pieces, and I could not have explained two of them properly. So here is the
whole thing taken apart, mostly so I stop guessing.

## Table of contents

## The short version

| Piece          | What it does                                         |
| -------------- | ---------------------------------------------------- |
| `!`            | Claude Code prefix — run this line in my shell       |
| `./iterate.sh` | Run the script in the current directory              |
| `2>&1`         | Fold the error stream into the output stream         |
| `\|`           | Pipe that combined stream onward                     |
| `tee file.log` | Write it to a file **and** pass it through to screen |

## `!` — the part that isn't shell at all

This one is not a shell operator. It is a Claude Code input prefix, and it only
works as the first character on the line.

Typing it switches that line into bash mode. The rest runs verbatim in my shell,
in the project directory, and — the part I actually care about — the output is
added to our conversation. I do not have to select the terminal, copy it, and
paste it back.

> The whole reason I use it: the output lands in front of Claude without a
> round trip through my clipboard.

## `./iterate.sh` — why the `./` is not decoration

The `./` is required, and I used to type it as a superstition.

`.` — the current directory — is not on `PATH`. Leaving `./` off means zsh
searches the standard system directories, does not find `iterate.sh` there, and
tells me:

```console
zsh: command not found: iterate.sh
```

There is a second failure that looks similar but isn't. Before I ran
`chmod +x`, the same line got as far as finding the file and then stopped:

```console
zsh: permission denied: ./iterate.sh
```

Worth telling those apart. **Command not found** means the shell never located
the file. **Permission denied** means it found it and wasn't allowed to run it.

## `2>&1` — the one I always half-remembered

A Unix process writes to two separate channels:

- **file descriptor 1** — stdout, normal output
- **file descriptor 2** — stderr, errors and diagnostics

A pipe only carries stdout. So without this, anything the script or `claude`
wrote to stderr would skip `tee` entirely, print straight to my terminal, and
never reach the log file. Which is precisely the output I would want later.

`2>&1` says: _make fd 2 point at whatever fd 1 currently points at._

The `&` is the part I kept dropping, and it changes the meaning completely:

```bash
./iterate.sh 2>1   # [!code --]
./iterate.sh 2>&1  # [!code ++]
```

Without the `&`, `1` is read as a filename — errors get written to a file
literally called `1` sitting in the project directory. With it, `1` means "the
place fd 1 is currently going."

Order matters too, and this one is genuinely counterintuitive:

```bash
./iterate.sh 2>&1 | tee iteration3.log  # [!code highlight]
./iterate.sh | tee iteration3.log 2>&1
```

The shell wires up the pipe **first**, then applies redirections left to right.
On the first line, fd 1 already points at the pipe by the time `2>&1` runs, so
stderr follows it in. On the second, `2>&1` is applied to `tee`, not to the
script — the script's stderr still goes straight to the terminal, unlogged.

## `tee` — named after the plumbing

`tee` is named after a T-shaped pipe fitting, because it splits the stream two
ways: everything goes into `iteration3.log`, and everything also passes through
to my terminal.

Without it I have to pick one. Watch the run live, or keep a record. `tee` is
how I get both, which matters here because the run takes minutes and I want
something to read afterward.

One sharp edge:

```bash
# [!code word:-a]
tee iteration3.log     # truncates the file if it already exists
tee -a iteration3.log  # appends instead
```

I have overwritten a log I wanted more than once.

## What the script does inside

<details>
<summary>The bit that's specific to my setup</summary>

`iterate.sh` runs `./verify.sh` first. If that exits `0`, it stops early without
spending a `claude` call — the cheap check guards the expensive one. Roughly the
shape of it:

```bash file="iterate.sh"
if ./verify.sh; then
  echo "already green, nothing to do"
  exit 0
fi

./verify.sh 2>&1 | claude -p "fix the failing tests"

git log --oneline -5
git diff --stat
```

Right now `verify.sh` exits `1`: commit `2b554f2` moved the goalposts and left
five undo/redo tests failing. So this run will hand those failures to a single
`claude -p` call, then print the last few commits and a diff stat when it is
done.

</details>

## So, the whole line

Run one agent iteration. Capture normal output and errors together. Show it on
screen live while saving a copy to `iteration3.log`. And put all of it in front
of Claude without me pasting anything.

Five pieces, one of which isn't shell, and one of which quietly decides whether
my log is worth reading.
