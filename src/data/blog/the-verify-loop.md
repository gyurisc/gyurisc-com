---
title: The Verify Loop
pubDatetime: 2026-09-06T09:00:00Z
description: An agent can write your code in a loop. The thing you cannot delegate is the definition of done — building a Klondike solitaire game from an empty directory, one exit 0 at a time.
draft: true
tags:
  - agents
  - claude-code
  - testing
  - indiehacking
---

An agent can write your code in a loop. The thing you cannot delegate is the
definition of done.

Building a [Klondike solitaire game](https://github.com/gyurisc/klondike-solitaire-game)
from an empty directory, one `exit 0` at a time.

| Metric          | Value | Detail                       |
| --------------- | ----- | ---------------------------- |
| Goals shipped   | 2     | engine + UI, then undo/redo  |
| Iterations used | 1     | per goal, of 40 allowed      |
| Tests at green  | 49    | 35 unit, 14 browser          |
| Grader edits    | 0     | agent never touched `tests/` |

The setup is four files and a `for` loop. A shell script runs your test suite;
if it fails, it hands the failures to a coding agent and asks it to fix them;
repeat until the script exits `0`. That is the entire method. It works better
than it has any right to — but only if you get one thing right, and the failure
is silent when you get it wrong.

Here is what the loop looks like in practice, and how to build one that does not
lie to you.

## Table of contents

## The one rule

Everything else is plumbing.

An agent loop is a search. The agent proposes changes; something has to say
whether they are good. That something is your oracle — in this case a script
called `verify.sh` that exits `0` or doesn't.

The rule is: **the oracle must predate the agent, and the agent must never be
able to edit it.**

This sounds obvious and is violated constantly, because the natural way to start
is to write a goal file, write a loop, and let the agent bootstrap the project
including its tests. The moment that happens, the agent is writing its own
grading criteria. It will not do this maliciously. It will do it by convergence:
it writes tests it already knows how to pass, the suite goes green, the loop
announces victory, and you have a directory full of code that satisfies a
specification written by the thing being specified.

> A loop whose oracle is written by the agent is not a development loop. It is
> an expensive way to generate a self-congratulatory test suite.

My first version of this project had exactly that hole, in an even more
embarrassing form: `verify.sh` existed but was an empty file. An empty
executable exits `0`. The loop ran, immediately declared `GOAL REACHED after 1
iterations`, and exited — before the agent ran even once.

## The four files

Each has exactly one job.

| File        | Job                                                | Notes                                                                                          |
| ----------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `GOAL.md`   | What you want, and the rules of engagement         | Read fresh by the agent every iteration. Includes "never modify `tests/` or `verify.sh`".      |
| `verify.sh` | The oracle. Exit `0` means done                    | Runs the suite, manages the dev server, prints readable failures. The agent may never edit it. |
| `tests/`    | The actual specification, as executable assertions | You write these first. They are the expensive part and they are not delegable.                 |
| `agent.sh`  | The loop itself                                    | Run oracle → feed failures to the agent → repeat. Plus the safety rails.                       |

### How one turn of the loop runs

1. **Run the oracle, capture its output.** Not just its exit code. The failure
   text is the prompt.
2. **Hand the failures to the agent.** Interpolated directly into the prompt,
   alongside a pointer to `GOAL.md`.
3. **The agent edits and commits.** A commit per working increment, so every
   iteration is a rollback point.
4. **Check for progress.** Did `HEAD` move? Three iterations without a commit
   means it is spinning.

`exit 1` sends you back to stage 1. `exit 0` means done — stop the loop.

## Building it

### 1. Write the oracle first

`verify.sh` is a shell script with one contract: exit `0` when the work is
finished, non-zero otherwise. Everything else about it is in service of making
failures legible, because its output is going to be read by an agent, not by
you.

Four things matter more than they look:

- **Stage it, and label the stages.** Sanity checks, then unit tests, then the
  server, then browser tests. An agent that sees `0/4 Sanity checks: index.html
missing` knows exactly what to do next. One that sees a 400-line stack trace
  does not.
- **Poll for the dev server, never `sleep`.** A blind sleep is the single most
  common source of a flaky loop, and flakiness is poison here — the agent will
  try to fix tests that were never broken.
- **Kill stale servers on the way in.** A crashed run leaves a process holding
  the port, which poisons every subsequent iteration. Reap it at startup and
  trap the cleanup on exit.
- **No retries.** Flakiness must be fixed, not hidden. A test that passes on the
  second try is telling you something.

```bash file="verify.sh"
# the shape that matters
say "2/4 Starting dev server on :$PORT"
npx vite dev --port $PORT --strictPort >/tmp/vite.log 2>&1 &
SERVER_PID=$!

UP=0
for _ in $(seq 1 30); do
  curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && { UP=1; break; }
  kill -0 "$SERVER_PID" 2>/dev/null || break   # [!code highlight]
  sleep 1
done
```

### 2. Write the tests as a contract, not just assertions

This is the part that determines whether the loop converges in one iteration or
thrashes for twenty. The agent has to implement an interface it cannot see. If
your tests only assert behaviour, the agent has to guess the shape — function
names, argument order, state shape, return conventions — and every wrong guess
is a wasted round.

So put the contract in the test file, as a header comment. The agent reads the
failing test; the specification is right there:

```js file="tests/engine.test.js"
// ENGINE CONTRACT — src/engine.js, pure ESM, no DOM access whatsoever.
//
//   Card   { rank: 1..13, suit: 'hearts'|..., faceUp: boolean }
//   State  { seed, stock, waste, foundations, tableau }
//
//   applyMove(state, move) -> State on success, null if illegal.
//
// PURITY: no exported function may mutate its arguments. Ever. Callers
// rely on the previous state staying byte-identical.
```

The header is load-bearing. It is why the agent got the interface right on the
first attempt.

Two further habits pay for themselves. Assert the properties, not just the
examples — "illegal moves leave the board byte-identical" caught more than any
individual rule check. And give the browser tests deterministic hooks: a
`?seed=N` URL parameter for reproducible deals, and a `?state=won` parameter so
the win screen is testable without playing a full game. Test hooks in the
product are a cost; opaque end-to-end tests are a bigger one.

### 3. Write the loop, with two rails

The naive loop has two bugs that are easy to miss and expensive to keep.

The first: `./verify.sh && { ... }` runs the oracle and throws its output at your
terminal. The agent never sees it. If your prompt says "run verify.sh and read
the failures", every iteration runs the full suite twice — once uselessly.

The second: nothing notices when the agent stops making progress. Forty
iterations that each fail identically will cost you forty full agent runs.
Compare `HEAD` before and after; if it hasn't moved in three rounds, stop.

```bash file="agent.sh"
last_head=$(git rev-parse HEAD); stalls=0

for i in $(seq 1 $MAX_ITERATIONS); do
  out=$(./verify.sh 2>&1); rc=$?          # [!code highlight]
  echo "$out"
  [ $rc -eq 0 ] && { echo "GOAL REACHED after $i iterations"; exit 0; }

  claude -p "Read GOAL.md. Here is the output of ./verify.sh:

$out

Fix these failures and commit your progress. Do not modify tests/ or verify.sh." \
    --dangerously-skip-permissions

  head=$(git rev-parse HEAD)
  if [ "$head" = "$last_head" ]; then
    stalls=$((stalls + 1))
    [ $stalls -ge 3 ] && { echo "STALLED — inspect run.log"; exit 1; }
  else stalls=0; last_head=$head; fi
done
```

### 4. Run one iteration before you run forty

The first round tells you the only thing you actually need to know: does the
agent work against the contract, or does it start editing `tests/`? That is a
two-minute question, and it is much cheaper to answer at iteration 1 than at
iteration 40.

## What it actually did

Iteration 1 opened on an empty project. The oracle handed it a list:

```console
== 0/4 Sanity checks ==
   PASS: package.json exists
   FAIL: index.html missing
   FAIL: src/engine.js missing

Sanity checks failed — fix these first.
```

One iteration later: a seeded Fisher–Yates shuffle over a mulberry32 PRNG, a
pure rules engine, a render layer, and 44 passing tests. Then I moved the
goalposts — added undo/redo to `GOAL.md` and five failing browser tests — and it
did that in one iteration too, without breaking any of the 44.

```console
  ✓  1 the deal renders › shows seven tableau piles holding 1..7 cards
  ✓  6 playing › clicking the stock turns a card onto the waste
  ✓ 12 undo and redo › undo unwinds several moves in order
  ✓ 14 undo and redo › making a fresh move clears the redo stack

  14 passed (1.9s)
== 4/4 Verdict ==
ALL CHECKS PASSED — goal reached.
```

The tell that it understood the feature rather than pattern-matching my
assertions: it implemented undo as a stack of previous states — which falls out
of the engine's enforced purity — and then guarded an edge case no test covered,
so that clicking an exhausted stock doesn't push a junk entry onto the undo
history. It also cleared the history on "restart", so you can't undo into a
board that no longer exists. Nothing asked for either.

## Five ways the loop lies to you

All five of these happened here.

### The empty oracle

An empty or missing `verify.sh` exits `0`, and the loop reports success without
running the agent at all. Any oracle that can pass vacuously will. Before you
trust a green, confirm you have seen it go red.

### The agent grades itself

If `tests/` doesn't exist when the loop starts, the agent must create it — and
"never modify `tests/`" does not read as "never create `tests/`". Write the suite
first. This is the whole ballgame.

### The failure output goes nowhere

Capture the oracle's stdout and interpolate it into the prompt. Otherwise the
agent is working from a description of the problem instead of the problem.

### The false-negative test

The subtlest one. I wrote a test asserting that picking up a card must not
highlight its legal destinations — a real bug I had just found by playing the
game. It passed against the known-bad build. My test sampled the DOM mid-drag;
the app highlighted on click, so nothing had lit up yet at the moment I looked.

> A test written against a bug you can see should fail before you hand it to the
> loop. Run it red first, every time. A green test you have never seen fail is
> not evidence of anything.

### The lost executable bit

Rewriting `verify.sh` in an editor dropped its `+x`. `./verify.sh` then fails
with `permission denied`, which the loop reads as an ordinary non-zero exit, and
the agent burns iterations chasing a phantom. Mundane, and it will happen to
you.

## What the loop cannot see

Once the tests were green I played the game. Two things were wrong with it, and
the loop had no way to know about either.

The cards moved by clicking rather than dragging — clumsy, but not incorrect.
And picking up a card lit up every pile it could legally move to. The agent had
added that helpfully, unprompted, and it quietly ruins solitaire: the search is
the game. A perfect solver that plays for you passes every test I wrote.

Neither is a bug the oracle could catch, because neither is a property I had
thought to assert. The loop optimises exactly what you measure, with the
fidelity of a machine and none of the taste. So the honest division of labour
looks like this:

- **You:** decide what the thing should be, encode it as tests, play the result,
  notice what feels wrong, and turn that into the next failing test.
- **The loop:** everything between "here is a failing test" and "it passes
  without breaking the others".

Which is to say the loop does not remove the expensive work. It relocates it —
out of writing implementations and into specifying behaviour precisely enough
that a machine can check it. That is a genuinely good trade, and it is a
different job from the one you had.

## Honest limits

Two goals, one iteration each, is a real result but a small sample, and both
goals were unusually well specified — I had written tests that pinned the
interface down to individual `data-testid` attributes. What that demonstrates is
that a sharp oracle plus a contract-carrying test suite is enough for an agent
to converge in one round. It does not demonstrate that the loop survives a vague
goal, and I would not assume it does.

It is also worth knowing what your tests genuinely cover. I fuzzed the finished
engine with 120,000 random operations across 300 deals: every invariant held,
and 89,737 illegal moves were rejected without altering the board by a single
byte. Encouraging — but only 332 of those ~90,000 attempted moves were legal,
because random pile pairs rarely form a valid move. The fuzz proved robustness
against garbage; it never reached a won board. Deep-state correctness is still
only as good as the tests I wrote by hand.

And the loop is only as safe as its blast radius. It runs with permissions
disabled, on your working tree, committing as it goes. Commit before you start,
keep the SHA, and know that `git reset --hard` is the undo button.

---

_Written from a working session that built a browser Klondike from an empty
directory. The loop is four files: `GOAL.md`, `verify.sh`, `tests/`, `agent.sh`.
The hard one is `tests/`, and it is the one you have to write yourself._
