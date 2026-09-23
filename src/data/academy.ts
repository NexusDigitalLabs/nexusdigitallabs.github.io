/**
 * AI Engineer Academy — course content and progression data.
 *
 * Free, client-side, no paywall (matches site-wide "Free forever" policy in
 * the root README). Gamification is completion-gated, not payment-gated:
 * lessons unlock in order as the learner finishes the previous one.
 *
 * Lessons ship progressively as they're written. A lesson with
 * `status: 'coming-soon'` has no `content` yet and renders as a locked,
 * unlinked card in the lobby — never a broken route.
 */

export type PhaseColor = 'blue' | 'violet' | 'emerald' | 'amber';

export type Phase = {
  id: string;
  title: string;
  description: string;
  color: PhaseColor;
};

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'list'; items: string[] };

export type QuizQuestion = {
  question: string;
  /** Exactly 4 options; options[correctIndex] is graded as correct. */
  options: string[];
  correctIndex: number;
};

export type LessonContent = {
  blocks: ContentBlock[];
  exercise: string;
  quiz: QuizQuestion[];
};

export type Lesson = {
  id: string;
  slug: string;
  order: number;
  phaseId: string;
  title: string;
  xp: number;
  status: 'ready' | 'coming-soon';
  content?: LessonContent;
};

export const PHASES: readonly Phase[] = [
  {
    id: 'foundations',
    title: 'Phase 1 — Foundations',
    description: 'Python, tooling, HTTP, testing, databases, deployment, and the math you actually need.',
    color: 'blue',
  },
  {
    id: 'llms',
    title: 'Phase 2 — Working with LLMs',
    description: 'Calling model APIs directly: streaming, structured output, tool use, prompting, and cost.',
    color: 'violet',
  },
  {
    id: 'core-ai-engineering',
    title: 'Phase 3 — Core AI Engineering',
    description: 'RAG, agents, evals, observability, guardrails, and fine-tuning — what employers actually screen for.',
    color: 'emerald',
  },
  {
    id: 'production',
    title: 'Phase 4 — Production & Depth',
    description: 'Reliability, durable workflows, open-weights models, multimodal, and a deployed capstone.',
    color: 'amber',
  },
] as const;

function readyLesson(
  order: number,
  phaseId: string,
  title: string,
  xp: number,
  content: LessonContent
): Lesson {
  return {
    id: `lesson-${order}`,
    // Slugify the FULL title, not just the text before a colon — several
    // lessons share a "Project: ..." prefix, and truncating at the colon
    // collapsed them all onto the same slug (a real collision, caught by
    // the uniqueness check below).
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    order,
    phaseId,
    title,
    xp,
    status: 'ready',
    content,
  };
}

// All 46 lessons currently ship with real content, so nothing in LESSONS calls
// this right now — kept for the next lesson the course adds (see
// docs/academy/academy.md: change a comingSoon(...) call to readyLesson(...)
// once its content is written).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function comingSoon(order: number, phaseId: string, title: string, xp: number): Lesson {
  return {
    id: `lesson-${order}`,
    slug: `lesson-${order}`,
    order,
    phaseId,
    title,
    xp,
    status: 'coming-soon',
  };
}

export const LESSONS: readonly Lesson[] = [
  // ── Phase 1: Foundations ──────────────────────────────────────────────
  readyLesson(1, 'foundations', 'Toolchain: uv, virtual environments, project layout', 20, {
    blocks: [
      {
        type: 'p',
        text: 'Every Python project depends on third-party packages. Without isolation, project A needing httpx 0.27 and project B needing 0.28 will conflict the moment you install one on the shared system Python. A virtual environment gives each project its own private set of packages so they can never collide.',
      },
      {
        type: 'p',
        text: 'uv creates and manages that environment for you, and replaces pip + venv + pip-tools with three commands:',
      },
      {
        type: 'list',
        items: [
          'uv init <name> — scaffold a new project with pyproject.toml',
          'uv add <package> — add a dependency and install it into .venv',
          'uv run <command> — run something inside the project’s environment, no manual activation',
        ],
      },
      {
        type: 'p',
        text: 'pyproject.toml declares what your project needs in loose terms (httpx>=0.28). uv.lock pins exact resolved versions for every dependency and sub-dependency. Commit both: the lockfile is what makes an install reproducible for a teammate, CI, or production a month from now.',
      },
      {
        type: 'code',
        lang: 'bash',
        code: 'brew install uv\nuv init lesson-01 && cd lesson-01\nuv add httpx\nuv run lesson-01',
      },
    ],
    exercise:
      'Install uv, scaffold a project with `uv init`, add httpx as a dependency, and write a one-line program that GETs https://httpbin.org/get and prints the status code. Run it with `uv run`.',
    quiz: [
      {
        question: 'What problem does a virtual environment solve?',
        options: [
          'It gives each project its own private set of packages so they can’t conflict with each other',
          'It makes Python code run faster',
          'It automatically formats and lints your code',
          'It compiles Python to a faster binary',
        ],
        correctIndex: 0,
      },
      {
        question: 'What is the difference between pyproject.toml and uv.lock, and why do we commit both?',
        options: [
          'pyproject.toml is for production and uv.lock is only used in tests',
          'pyproject.toml declares loose version requirements; uv.lock pins exact resolved versions for reproducible installs',
          'uv.lock is generated automatically and should never be committed to git',
          'They contain the same information in two different formats, for convenience',
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(2, 'foundations', 'Python core I: types, data structures, comprehensions', 20, {
    blocks: [
      {
        type: 'p',
        text: 'Four collections cover almost everything: list (ordered, mutable, duplicates OK), tuple (ordered, immutable — good for fixed records like (x, y)), dict (lookup by key), and set (unique, unordered, fast membership tests). JSON — which is most of what an LLM API returns — is just nested dicts and lists, so this is the most-used chapter of the whole course.',
      },
      {
        type: 'code',
        lang: 'python',
        code: 'user = {"name": "Dilan", "age": 30}\nuser.get("email", "n/a")   # "n/a" — no KeyError\n\nseen = set()\nseen.add("x")\n"x" in seen                # True, and fast even for huge sets',
      },
      {
        type: 'p',
        text: 'Type hints (def total(prices: list[float]) -> float) are not enforced at runtime — they exist for your editor, for type checkers, and later for libraries like Pydantic and FastAPI that read and do enforce them.',
      },
      {
        type: 'p',
        text: 'A comprehension builds a collection in one expression: [expression for item in iterable if condition]. Read it left to right — "give me `expression` for each `item` in `iterable`, where `condition` is true."',
      },
      {
        type: 'code',
        lang: 'python',
        code: '[n * n for n in nums if n % 2 == 0]      # list comprehension\n{w: len(w) for w in words}                # dict comprehension\n{w.lower() for w in words}                # set comprehension',
      },
    ],
    exercise:
      'Write six small functions: square the even numbers in a list, map words to their lengths, dedupe+lowercase+sort a list of strings, invert a dict, return the first item of a list or None, and group words by length.',
    quiz: [
      {
        question: 'When would you pick a set over a list? Give one example.',
        options: [
          'When you need to preserve the exact order items were added in',
          'When you need to store key-value pairs',
          'When you need to remove duplicates or check membership quickly, e.g. tracking usernames already seen',
          'When you need to access items by their numeric index',
        ],
        correctIndex: 2,
      },
      {
        question: 'If a function is hinted def f(x: int) and you call f("hi"), what happens, and why?',
        options: [
          'Python raises a TypeError immediately when the function is called',
          'The string is automatically converted to an int',
          'The function silently returns None instead of running',
          'The call runs immediately — type hints aren’t enforced at runtime — and fails later only if the code uses x as an int',
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(3, 'foundations', 'Python core II: functions, dataclasses, pathlib, file I/O', 20, {
    blocks: [
      {
        type: 'p',
        text: '@dataclass turns a class into a labeled bundle of fields — Python generates __init__, a readable __repr__, and equality for you, so you stop hand-writing boilerplate constructors.',
      },
      {
        type: 'code',
        lang: 'python',
        code: '@dataclass\nclass Book:\n    title: str\n    author: str\n    year: int\n    pages: int = 0   # optional, has a default\n\nb = Book("Dune", "Frank Herbert", 1965)\nprint(b)   # Book(title=\'Dune\', author=\'Frank Herbert\', year=1965, pages=0)',
      },
      {
        type: 'p',
        text: 'pathlib.Path replaces string paths and os.path. `/` joins paths across platforms; the rest reads naturally:',
      },
      {
        type: 'code',
        lang: 'python',
        code: 'p = Path("data") / "report.txt"\np.exists()\np.read_text()\np.write_text("hello")\np.glob("*.txt")   # iterator of matching files in that folder',
      },
      {
        type: 'p',
        text: 'text.splitlines() splits a string into lines without trailing newlines. "\\n".join(list_of_strings) is the reverse. str.strip() cleans up whitespace on lines you read back in.',
      },
    ],
    exercise:
      'Model a Book with @dataclass, write a describe() formatter, write a report of several books to a file with write_text, read it back with read_text + splitlines, and count words across every .txt file in a folder with glob.',
    quiz: [
      {
        question: 'What three things does @dataclass generate for you automatically?',
        options: [
          'A JSON serializer, a database schema, and a validator',
          '__init__, a readable __repr__, and equality (__eq__)',
          'Getters, setters, and a builder pattern',
          'A comparison operator, a hash function, and a copy method',
        ],
        correctIndex: 1,
      },
      {
        question: 'Why should read_lines check path.exists() before reading — what happens without that check?',
        options: [
          'Without it, Python creates the file automatically with empty content',
          'Without it, the program silently returns garbage data instead of failing',
          'Without it, reading a missing file raises a FileNotFoundError instead of returning an empty list gracefully',
          'It’s only needed on Windows, not macOS or Linux',
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(4, 'foundations', 'Python core III: exceptions, logging, generators, context managers', 20, {
    blocks: [
      {
        type: 'p',
        text: "try/except/else/finally handles failure without crashing the program. Catch specific exceptions (except ZeroDivisionError), never a bare except — a bare except also swallows real bugs like typos in your own code. finally always runs, whether or not an exception happened, which is where cleanup belongs.",
      },
      {
        type: 'p',
        text: "print() has no levels, no timestamps, and no way to turn it off in production without deleting code. The logging module gives you levels (DEBUG/INFO/WARNING/ERROR), timestamps, and configurable output — one line change routes every log call to a file or a log aggregator instead of stdout.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import logging\nlogger = logging.getLogger(__name__)\n\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    logger.error(\"division failed: %s\", e)\nfinally:\n    print(\"cleanup always runs\")",
      },
      {
        type: 'p',
        text: "A generator is a function with yield instead of return. Calling it doesn't run the body — it hands back an iterator that produces one value at a time, on demand. That means you can process a 10 GB log file line by line without ever holding the whole thing in memory.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "def read_big_file(path):\n    with open(path) as f:\n        for line in f:\n            yield line.strip()   # one line in memory at a time",
      },
      {
        type: 'p',
        text: "A context manager (the with statement) guarantees cleanup runs even if the code inside raises — a file handle gets closed, a lock gets released, a connection gets returned to its pool. contextlib.contextmanager turns a generator function into one with a single decorator.",
      },
    ],
    exercise:
      "Write a generator that yields lines from a file lazily. Write a context manager with @contextlib.contextmanager that times a block of code and logs the duration. Wrap a risky operation in try/except/finally using logging instead of print.",
    quiz: [
      {
        question: "Why prefer a generator over building a full list when processing a huge file?",
        options: [
          "A generator makes disk reads faster than a list",
          "A generator yields one item at a time, so the whole file never has to fit in memory at once",
          "A generator automatically closes the file when it's done",
          "A generator lets you access items by index, unlike a list",
        ],
        correctIndex: 1,
      },
      {
        question: "What does a context manager guarantee that a bare try/finally could also give you — so why use with instead?",
        options: [
          "The same guaranteed cleanup, but with is shorter and less error-prone than writing try/finally by hand every time",
          "A context manager runs code faster than try/finally",
          "A context manager catches all exceptions automatically so you don't need except",
          "A context manager works only with files, not locks or connections",
        ],
        correctIndex: 0,
      },
    ],
  }),
  readyLesson(5, 'foundations', 'Standard-library CLI: argparse, json, csv (todo app capstone)', 20, {
    blocks: [
      {
        type: 'p',
        text: "argparse builds real command-line interfaces: positional arguments (required, order-based), optional flags (--title, -t), and subcommands (todo add, todo list, todo done) via add_subparsers. This is the difference between a script and a tool someone else can run without reading the source.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import argparse\n\nparser = argparse.ArgumentParser(prog=\"todo\")\nsub = parser.add_subparsers(dest=\"command\", required=True)\n\nadd_p = sub.add_parser(\"add\")\nadd_p.add_argument(\"title\")\n\nargs = parser.parse_args()\nif args.command == \"add\":\n    print(f\"adding: {args.title}\")",
      },
      {
        type: 'p',
        text: "json.dumps/json.loads persist structured data as text — the natural fit for a list of dataclass-shaped records. The csv module (DictReader/DictWriter) does the same for tabular data with named columns, which is what you already used in Lesson 3.",
      },
      {
        type: 'p',
        text: "This lesson is a capstone: it doesn't teach much new syntax, it asks you to combine dataclasses, pathlib, exceptions, logging, and argparse from Lessons 1-4 into one real command-line tool.",
      },
    ],
    exercise:
      "Build a complete todo CLI with add/list/done subcommands, persisting to a JSON file with pathlib, using a Todo dataclass, and logging (not printing) errors like a missing file or an invalid id.",
    quiz: [
      {
        question: "What's the difference between a positional and an optional (--flag) argparse argument?",
        options: [
          "A positional argument can only be a number; an optional flag can only be a string",
          "There's no real difference, just different syntax",
          "A positional argument is required and identified by order; an optional flag is identified by name and often has a default",
          "Optional flags are required inside subcommands but positional arguments aren't",
        ],
        correctIndex: 2,
      },
      {
        question: "Why does storing todos as JSON make more sense here than a raw line-per-todo text file?",
        options: [
          "JSON files always take up less disk space than text files",
          "JSON naturally represents structured records (title, done status) as objects, round-tripping through json.dumps/loads without custom parsing",
          "JSON is required by argparse to work at all",
          "A text file can't store more than one todo at a time",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(6, 'foundations', 'HTTP fundamentals: requests, status codes, JSON, httpx', 20, {
    blocks: [
      {
        type: 'p',
        text: "HTTP has four verbs you'll use constantly: GET (read), POST (create), PUT (replace), DELETE (remove). Status codes come in families — 2xx succeeded, 3xx redirected, 4xx you made a bad request, 5xx the server broke. Knowing the family tells you where to look before you even read the message.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import httpx\n\nr = httpx.get(\"https://api.example.com/users\", params={\"limit\": 5})\nr.raise_for_status()   # raises on 4xx/5xx instead of silently continuing\ndata = r.json()",
      },
      {
        type: 'p',
        text: "httpx is the modern HTTP client for Python — the same API works for both sync (httpx.get) and async calls, which matters once you get to Lesson 7. raise_for_status() turns a bad response into an exception immediately, instead of your code continuing on with garbage data and failing somewhere confusing three lines later.",
      },
      {
        type: 'p',
        text: "This is exactly the mechanism you'll use to call an LLM provider's API in Phase 2 — headers carry the API key, the body is JSON, and the response is JSON you parse and validate.",
      },
    ],
    exercise:
      "Write a function that GETs a REST API, handles a 404 differently from a 500 (one means \"doesn't exist\", the other means \"retry later\"), and parses the JSON response into a dataclass.",
    quiz: [
      {
        question: "What does raise_for_status() do, and why call it instead of checking response.status_code by hand every time?",
        options: [
          "It retries the request automatically up to three times",
          "It converts the response body into a Python dict",
          "It raises an exception on any 4xx/5xx response, so bad responses fail loudly instead of silently continuing with bad data",
          "It logs the request to the console for debugging",
        ],
        correctIndex: 2,
      },
      {
        question: "What's the difference between a 4xx and a 5xx status code, and whose fault is each one usually?",
        options: [
          "4xx means success with a warning; 5xx means total failure",
          "4xx is for GET requests and 5xx is for POST requests",
          "There's no meaningful difference, both just mean \"error\"",
          "4xx means the client made a bad request; 5xx means the server itself failed",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(7, 'foundations', 'Async Python: asyncio and concurrency', 20, {
    blocks: [
      {
        type: 'p',
        text: "async and await let your program start a slow operation — like waiting for a network response — and let other work run while it waits, instead of blocking. This only helps for I/O-bound work (waiting on the network, disk, or another service). It does nothing for CPU-bound work like a tight math loop, because the CPU is still busy the whole time.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import asyncio, httpx\n\nasync def fetch(client, url):\n    r = await client.get(url)\n    return r.status_code\n\nasync def main():\n    async with httpx.AsyncClient() as client:\n        results = await asyncio.gather(*(fetch(client, u) for u in urls))\n\nasyncio.run(main())",
      },
      {
        type: 'p',
        text: "asyncio.gather runs a batch of coroutines concurrently and waits for all of them — fetching 50 URLs this way takes roughly as long as the slowest one, not the sum of all 50. A plain for loop with await inside it runs them one at a time, sequentially, gaining nothing from async at all.",
      },
    ],
    exercise:
      "Fetch 50 URLs concurrently using httpx.AsyncClient and asyncio.gather, and time it against a plain sequential for loop doing the same requests. Confirm the concurrent version is dramatically faster.",
    quiz: [
      {
        question: "Why does async speed up I/O-bound work like HTTP calls but do nothing for CPU-bound work?",
        options: [
          "Async work runs on multiple CPU cores automatically",
          "Async lets other tasks run while one waits on I/O; a CPU-bound task keeps the CPU busy the whole time, with no idle time to fill",
          "Async makes every function run faster regardless of what it does",
          "Async only works with functions that return None",
        ],
        correctIndex: 1,
      },
      {
        question: "What does asyncio.gather do that a for loop with await inside it doesn't?",
        options: [
          "It runs the coroutines in a guaranteed fixed order",
          "It automatically retries any coroutine that fails",
          "It runs all the coroutines concurrently, so total time is close to the slowest one instead of the sum of all of them",
          "It converts synchronous functions into async ones",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(8, 'foundations', 'Pydantic: validating data', 20, {
    blocks: [
      {
        type: 'p',
        text: "A @dataclass (Lesson 3) accepts whatever you hand it — Book(\"Dune\", \"Frank Herbert\", \"not a year\") constructs happily even though year should be an int. A Pydantic BaseModel validates on construction: bad data raises a clear ValidationError immediately, at the boundary, instead of failing mysteriously three functions later.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "from pydantic import BaseModel, Field\n\nclass User(BaseModel):\n    name: str\n    age: int = Field(ge=0)\n\nUser.model_validate({\"name\": \"Dilan\", \"age\": -1})  # raises ValidationError: age must be >= 0",
      },
      {
        type: 'p',
        text: "This matters enormously for AI engineering: every LLM API response, every piece of \"structured output\" a model returns, and every incoming API request body is untrusted JSON until something checks its shape. Pydantic is that check — model_validate(raw_dict) either gives you a trustworthy object or tells you exactly what's wrong.",
      },
    ],
    exercise:
      "Define a Pydantic model matching an API response shape, then validate a batch of raw dicts — some valid, some deliberately broken — and report which ones failed and why, using the fields on the ValidationError.",
    quiz: [
      {
        question: "How is a Pydantic model different from a plain @dataclass in terms of what happens the moment you construct one?",
        options: [
          "A Pydantic model validates the data on construction and raises a clear error if it doesn't match; a dataclass accepts whatever it's given",
          "A Pydantic model is slower but otherwise identical to a dataclass",
          "A dataclass validates types at runtime, but Pydantic doesn't",
          "There's no real difference — Pydantic just adds JSON serialization",
        ],
        correctIndex: 0,
      },
      {
        question: "Why is Pydantic especially useful for JSON that came from an external API or an LLM, rather than data you generated yourself?",
        options: [
          "Pydantic makes external API calls faster",
          "It's not especially useful there — it matters equally for all data",
          "External JSON is untrusted until checked — Pydantic catches missing fields, wrong types, or malformed structure at the boundary",
          "Pydantic automatically retries a failed API call",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(9, 'foundations', 'Project: concurrent fetcher with retries, timeouts, validation', 40, {
    blocks: [
      {
        type: 'p',
        text: "This is the Phase 1 project from the roadmap — it doesn't introduce new syntax, it combines Lessons 6-8 into one real piece of software: concurrent HTTP calls (async httpx), that don't hang forever (timeouts), that recover from transient failures (retries with backoff), and that never trust what came back without checking (Pydantic validation).",
      },
      {
        type: 'p',
        text: "A timeout caps how long any single request can block — without one, a single unresponsive server can stall your whole batch indefinitely. A retry-with-backoff waits a little longer after each failure (1s, then 2s, then 4s) instead of hammering an already-struggling server immediately, which is more likely to make things worse, not better.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "async def fetch_with_retry(client, url, attempts=3):\n    for attempt in range(attempts):\n        try:\n            r = await client.get(url, timeout=5.0)\n            r.raise_for_status()\n            return r.json()\n        except (httpx.HTTPError, httpx.TimeoutException):\n            if attempt == attempts - 1:\n                raise\n            await asyncio.sleep(2 ** attempt)",
      },
    ],
    exercise:
      "Build the full project: fetch 50 URLs concurrently with httpx.AsyncClient, a 5-second timeout per request, up to 2 retries with exponential backoff on failure, and Pydantic validation of each JSON response — then print a summary of successes, retried-then-succeeded, and hard failures.",
    quiz: [
      {
        question: "Why add a timeout to every request instead of letting httpx wait indefinitely for a response?",
        options: [
          "A timeout makes the response arrive faster",
          "httpx requires a timeout to parse JSON correctly",
          "Without one, a single unresponsive server can stall your entire batch indefinitely",
          "Timeouts are only needed for POST requests, not GET",
        ],
        correctIndex: 2,
      },
      {
        question: "What's the risk of retrying a failed request immediately, with no backoff delay, against a server that's already struggling?",
        options: [
          "There's no risk — immediate retries always succeed faster",
          "It causes the client to run out of memory",
          "It automatically triggers a permanent IP ban from every server",
          "It can hammer an already-struggling server harder, making the outage worse instead of better",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(10, 'foundations', 'Testing with pytest', 20, {
    blocks: [
      {
        type: 'p',
        text: "A pytest test is just a function named test_something that asserts things. Run the whole suite with pytest. No test framework boilerplate, no classes required — plain functions and assert statements are enough for almost everything.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import pytest\n\n@pytest.fixture\ndef sample_todos():\n    return [{\"title\": \"milk\", \"done\": False}]\n\n@pytest.mark.parametrize(\"n,expected\", [(2, 4), (3, 9), (5, 25)])\ndef test_square(n, expected):\n    assert n * n == expected",
      },
      {
        type: 'p',
        text: "A fixture is shared setup that pytest injects into any test that names it as a parameter — no copy-pasted setup code at the top of every test, and pytest handles teardown too if the fixture needs it. @pytest.mark.parametrize runs the same test body against a list of input/expected pairs, so five similar tests become one.",
      },
    ],
    exercise:
      "Write pytest tests for your Lesson 1-3 scripts (the log parser, the CSV summarizer): a fixture providing sample data, and parametrize covering edge cases like an empty file and a malformed line.",
    quiz: [
      {
        question: "What problem does a fixture solve compared to calling a setup function manually at the top of every test?",
        options: [
          "Fixtures make tests run in parallel automatically",
          "pytest injects it automatically into any test that names it, avoiding copy-pasted setup code and handling teardown too",
          "Fixtures are required for assert statements to work",
          "Fixtures replace the need for the pytest command itself",
        ],
        correctIndex: 1,
      },
      {
        question: "Why is parametrize better than five nearly-identical test functions with different hardcoded inputs?",
        options: [
          "parametrize runs tests faster than separate functions",
          "parametrize is required for pytest to detect a function as a test",
          "One test body covers every input/expected pair, so there's no duplicated logic to keep in sync across five functions",
          "It hides failing cases so the suite always shows green",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(11, 'foundations', 'Mocking HTTP, ruff, git workflow', 20, {
    blocks: [
      {
        type: 'p',
        text: "A unit test that makes a real network call to a third-party API is slow, flaky (fails when the network or the API does, not just when your code has a bug), and sometimes costs real money. respx (or pytest-httpx) intercepts httpx calls in a test and returns a canned response instead, so the test is fast, deterministic, and needs no API key.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import respx, httpx\n\n@respx.mock\ndef test_fetch_user():\n    respx.get(\"https://api.example.com/user/1\").mock(\n        return_value=httpx.Response(200, json={\"id\": 1, \"name\": \"Ada\"})\n    )\n    # code under test calls the real client; respx intercepts the request",
      },
      {
        type: 'p',
        text: "ruff is a single fast tool that replaces flake8 (linting), black (formatting), and isort (import sorting): ruff check finds problems, ruff format fixes style. Pair that with a normal git workflow — a feature branch, small commits, a pull request — and you have the same setup used on real engineering teams.",
      },
    ],
    exercise:
      "Add a respx mock to one of your Lesson 9 fetcher tests so it runs with zero network access. Run ruff check and ruff format on your project and fix what's flagged. Create a git branch, commit your work, and open a pull request.",
    quiz: [
      {
        question: "Why should a unit test never make a real network call to a third-party API?",
        options: [
          "Because pytest technically cannot execute HTTP requests",
          "It makes the test slow, flaky (fails when the network/API does, not just your code), and can cost real money",
          "Because it always causes a security vulnerability",
          "Because respx requires disabling internet access globally",
        ],
        correctIndex: 1,
      },
      {
        question: "What's the difference between what ruff check does and what ruff format does?",
        options: [
          "ruff check only works in CI; ruff format only works locally",
          "They do the same thing, format is just the old command name",
          "ruff check finds problems (linting); ruff format rewrites code style (like black)",
          "ruff format finds bugs; ruff check fixes styling",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(12, 'foundations', 'SQL and Postgres', 20, {
    blocks: [
      {
        type: 'p',
        text: "Core SQL covers most needs: SELECT to read, INSERT/UPDATE/DELETE to write, WHERE to filter, JOIN to combine tables through a shared key, GROUP BY to aggregate. A primary key uniquely identifies a row; a foreign key points to another table's primary key, which is how a JOIN connects them.",
      },
      {
        type: 'code',
        lang: 'sql',
        code: "SELECT u.name, COUNT(o.id) AS orders\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.name\nORDER BY orders DESC;",
      },
      {
        type: 'p',
        text: "An index is a separate data structure that lets Postgres find matching rows without scanning the whole table — essential once a table has more than a few thousand rows. It isn't free: every index slows down writes a little and takes disk space, so you index columns you actually filter or join on, not every column.",
      },
    ],
    exercise:
      "Design a small schema (users, todos) in your local Postgres, insert sample rows, and write three queries: a JOIN across both tables, a GROUP BY aggregation, and a query filtered on a column you've indexed.",
    quiz: [
      {
        question: "What does a database index actually do, and why doesn't every column just get one automatically?",
        options: [
          "It automatically deletes duplicate rows",
          "It lets Postgres find matching rows without scanning the whole table, but costs write speed and disk space, so you add them selectively",
          "It encrypts the column's data at rest",
          "It converts the column to a different data type for faster storage",
        ],
        correctIndex: 1,
      },
      {
        question: "What's the difference between an INNER JOIN and a LEFT JOIN?",
        options: [
          "INNER JOIN is faster but functionally identical to LEFT JOIN",
          "LEFT JOIN only works on the leftmost column of a table",
          "INNER JOIN combines three or more tables; LEFT JOIN only combines two",
          "INNER JOIN returns only rows with a match in both tables; LEFT JOIN keeps every row from the left table even without a match",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(13, 'foundations', 'FastAPI basics', 20, {
    blocks: [
      {
        type: 'p',
        text: "FastAPI routes are plain Python functions decorated with the HTTP method and path: @app.get(\"/items\"), @app.post(\"/items\"). Request bodies are Pydantic models straight from Lesson 8 — FastAPI validates the incoming JSON against the model automatically and returns a 422 with a clear error if it doesn't match, before your function body even runs.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Item(BaseModel):\n    name: str\n    price: float\n\n@app.post(\"/items\")\ndef create_item(item: Item):\n    return {\"id\": 1, **item.model_dump()}",
      },
      {
        type: 'p',
        text: "Every FastAPI app gets a free interactive docs page at /docs, generated from your route signatures and Pydantic models — genuinely useful for another engineer (or you, in a week) calling the API without reading the source. This is the framework you'll reach for constantly once you're wrapping an LLM call or an agent behind an endpoint.",
      },
    ],
    exercise:
      "Build a small FastAPI app with two routes — GET a list of items, POST a new item — using Pydantic models for validation. Run it and explore the auto-generated /docs page, including trying a request with a deliberately invalid body.",
    quiz: [
      {
        question: "What does FastAPI do automatically when a request body doesn't match your Pydantic model?",
        options: [
          "It silently fills in missing fields with default values",
          "It crashes the whole server process",
          "It returns a 422 response with a clear validation error, before your route function body even runs",
          "It logs a warning but still runs your function with the bad data",
        ],
        correctIndex: 2,
      },
      {
        question: "Why is an auto-generated interactive docs page useful for an API another engineer will call?",
        options: [
          "It replaces the need to write any tests",
          "It's required for FastAPI to start the server",
          "It automatically generates client SDKs in every language",
          "They can see and try every route and its expected shape without reading the source code",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(14, 'foundations', 'Project: CRUD API with Postgres', 40, {
    blocks: [
      {
        type: 'p',
        text: "This project wires Lesson 12 (SQL/Postgres) into Lesson 13 (FastAPI): a real Create-Read-Update-Delete API backed by a real database, not an in-memory list that resets on every restart.",
      },
      {
        type: 'p',
        text: "Keep the database connection string in an environment variable, read at startup — never hardcoded in source, since that's a credential that would otherwise sit in your git history forever. Return the right status code for each outcome: 201 for a successful create, 200 for a successful read/update, 204 or 200 for delete, 404 when the id doesn't exist.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import os\nDATABASE_URL = os.environ[\"DATABASE_URL\"]\n\n@app.get(\"/todos/{todo_id}\")\ndef get_todo(todo_id: int):\n    row = db.fetch_one(todo_id)\n    if row is None:\n        raise HTTPException(status_code=404, detail=\"not found\")\n    return row",
      },
    ],
    exercise:
      "Build a complete CRUD API for a resource (e.g. todos) backed by your local Postgres: Create, Read (list + single), Update, and Delete endpoints, with Pydantic request/response models and correct status codes throughout.",
    quiz: [
      {
        question: "Why keep the database connection string in an environment variable instead of hardcoding it in the source file?",
        options: [
          "Environment variables make database queries run faster",
          "A hardcoded credential ends up permanently in your git history, even if you remove it later",
          "Hardcoding a connection string is a Python syntax error",
          "It's only a style preference with no real security implication",
        ],
        correctIndex: 1,
      },
      {
        question: "What status code should a DELETE on a nonexistent id return, and why?",
        options: [
          "200, because deleting something that's already gone counts as success",
          "500, because it's a server-side failure",
          "301, because the client should be redirected to the resource list",
          "404, because the resource being deleted doesn't exist",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(15, 'foundations', 'Docker', 20, {
    blocks: [
      {
        type: 'p',
        text: "A container packages your app with everything it needs to run — sharing the host machine's kernel, unlike a full virtual machine, which makes it lightweight and fast to start. A Dockerfile describes how to build the image: FROM a base image, COPY your code in, RUN setup commands, CMD the thing that starts the app.",
      },
      {
        type: 'code',
        lang: 'dockerfile',
        code: "FROM python:3.13-slim\nWORKDIR /app\nCOPY pyproject.toml uv.lock ./\nRUN pip install uv && uv sync --frozen\nCOPY . .\nCMD [\"uv\", \"run\", \"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\"]",
      },
      {
        type: 'p',
        text: "Copying pyproject.toml and uv.lock before the rest of the source (rather than COPY . . first) means Docker can reuse the cached dependency-install layer whenever only your application code changes, not your dependencies — a much faster rebuild loop. docker compose runs multiple containers together, e.g. your API plus a Postgres container, with one command.",
      },
    ],
    exercise:
      "Write a Dockerfile for your Lesson 14 API, and a docker-compose.yml that runs it alongside a Postgres container with a persisted volume. Build and run the whole stack locally with one command.",
    quiz: [
      {
        question: "What's the difference between a Docker image and a Docker container?",
        options: [
          "They're two names for the same thing",
          "An image runs on a VM; a container runs directly on the host with no isolation",
          "An image is the built, static blueprint; a container is a running instance of that image",
          "A container is the source code; an image is the compiled binary",
        ],
        correctIndex: 2,
      },
      {
        question: "Why copy pyproject.toml and uv.lock before the rest of the source code in a Dockerfile?",
        options: [
          "Docker requires dependency files to be copied first or the build fails",
          "So Docker can cache the dependency-install layer and skip reinstalling when only application code changes, speeding up rebuilds",
          "It reduces the final image size significantly",
          "It's required so uv can find the files at all",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(16, 'foundations', 'Deployment', 20, {
    blocks: [
      {
        type: 'p',
        text: "Deploying means getting your container or app running on infrastructure other people can reach — Fly.io, Railway, and Cloud Run are common choices that take a Dockerfile or a git push and handle the servers for you. Production secrets (database passwords, API keys) live in the platform's environment variable/secrets settings, never in a committed .env file.",
      },
      {
        type: 'p',
        text: "A health check is a simple endpoint (often GET /health returning 200) that the deployment platform polls to confirm your app is actually alive before routing traffic to it, and to restart it automatically if it stops responding.",
      },
    ],
    exercise:
      "Deploy your Lesson 14/15 API to Fly.io, Railway, or Cloud Run. Set the database URL as a platform secret, not a committed file. Add a /health endpoint and confirm the live URL responds correctly end to end.",
    quiz: [
      {
        question: "Why should a database password never be committed to git, even in a private repository?",
        options: [
          "Git technically cannot store passwords in plain text",
          "It becomes permanently recoverable from git history, and private repos can still be cloned, leaked, or made public later",
          "It slows down git operations noticeably",
          "Private repositories already encrypt all file contents automatically",
        ],
        correctIndex: 1,
      },
      {
        question: "What is a health check endpoint, and why does a deployment platform rely on one?",
        options: [
          "An endpoint that reports the developer's account balance",
          "A required endpoint for enabling HTTPS",
          "A simple endpoint the platform polls to confirm the app is alive, used to route traffic and restart it if it stops responding",
          "An endpoint that only runs once, at deploy time",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(17, 'foundations', 'Math: vectors, dot products, probability', 20, {
    blocks: [
      {
        type: 'p',
        text: "A vector is just a list of numbers. The dot product of two vectors — multiply matching positions, sum the results — measures how much they point in the same direction. This single operation is the foundation of embeddings and similarity search, which you'll use constantly from Phase 3 onward.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import math\n\ndef dot(a, b):\n    return sum(x * y for x, y in zip(a, b))\n\ndef cosine_similarity(a, b):\n    return dot(a, b) / (math.sqrt(dot(a, a)) * math.sqrt(dot(b, b)))",
      },
      {
        type: 'p',
        text: "Cosine similarity divides the dot product by both vectors' lengths, so it measures direction (meaning) while ignoring magnitude (e.g. text length). A probability distribution assigns a non-negative weight to every possible outcome, summing to 1. Softmax is the function that turns arbitrary scores into exactly that — it's what lets a model turn its raw next-token scores into token probabilities to sample from.",
      },
    ],
    exercise:
      "Implement dot product and cosine similarity from scratch, without numpy. Represent five short sentences as simple word-count vectors and use cosine similarity to find which one is most similar to a query sentence.",
    quiz: [
      {
        question: "What does the dot product of two vectors tell you geometrically?",
        options: [
          "The exact distance between the two vectors' endpoints",
          "How much the two vectors point in the same direction",
          "Whether the vectors have the same number of dimensions",
          "The average of all the vector's values",
        ],
        correctIndex: 1,
      },
      {
        question: "Why does cosine similarity ignore vector magnitude while the raw dot product doesn't?",
        options: [
          "It doesn't ignore magnitude — that's a common misconception",
          "Because it only compares the first element of each vector",
          "Because it divides the dot product by both vectors' lengths, isolating direction (meaning) from size (e.g. text length)",
          "Because it rounds all vector values to 1 or -1 before comparing",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(18, 'foundations', 'Gradient descent and a neural net by hand', 20, {
    blocks: [
      {
        type: 'p',
        text: "A loss function measures how wrong a model's predictions are. Its gradient with respect to a parameter tells you which direction increases the loss — so training moves the parameter the opposite way, a little at a time: param -= learning_rate * gradient. Repeat that over many examples and the loss goes down.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "# fit y = w*x + b by gradient descent, no framework\nw, b, lr = 0.0, 0.0, 0.01\nfor epoch in range(200):\n    dw = sum(2 * (w * x + b - y) * x for x, y in data) / len(data)\n    db = sum(2 * (w * x + b - y) for x, y in data) / len(data)\n    w -= lr * dw\n    b -= lr * db",
      },
      {
        type: 'p',
        text: "This is literally a one-neuron network: it learns a line, y = wx + b, entirely by repeated gradient steps, no ML framework involved. Every larger neural net is the same idea — more parameters, more layers, the same core update rule. If you want to go deeper on this, Andrej Karpathy's \"Neural Networks: Zero to Hero\" builds up from exactly this point.",
      },
    ],
    exercise:
      "Implement gradient descent from scratch in plain Python to fit a line to a small synthetic dataset. Print the loss every 20 epochs and confirm it decreases toward zero.",
    quiz: [
      {
        question: "What does the gradient of the loss with respect to a weight tell you, in plain terms?",
        options: [
          "The exact final value the weight should converge to",
          "Which direction increases the loss — so training moves the weight the opposite way to reduce it",
          "How many training examples are needed",
          "Whether the model has overfit yet",
        ],
        correctIndex: 1,
      },
      {
        question: "What happens to training if the learning rate is set far too high?",
        options: [
          "Training becomes perfectly stable but slow",
          "The model trains in fewer epochs with no downside",
          "Updates overshoot and the loss can bounce around or diverge instead of steadily decreasing",
          "The learning rate has no effect on training stability",
        ],
        correctIndex: 2,
      },
    ],
  }),

  // ── Phase 2: Working with LLMs ────────────────────────────────────────
  readyLesson(19, 'llms', 'How LLMs work: tokens, context windows, sampling', 20, {
    blocks: [
      {
        type: 'p',
        text: "A model doesn't see words or characters — it sees tokens, chunks of text a tokenizer maps to numbers. A short sentence in one language can use more tokens than a similar-length sentence in another, because tokenizers are trained on specific text distributions. Token count is what you pay for and what counts against the context window, not character count.",
      },
      {
        type: 'p',
        text: "The context window is the maximum number of tokens the model can attend to in one request — input and output combined. Go over it and older content gets dropped or the request fails, depending on the API.",
      },
      {
        type: 'p',
        text: "Generation is autoregressive: the model predicts one next token at a time, given everything before it, then repeats. Sampling controls how that prediction turns into an actual token — temperature 0 always picks the single most likely token (deterministic, repeatable), while a higher temperature allows less-likely tokens through for more varied, creative output.",
      },
    ],
    exercise:
      "Use a tokenizer (e.g. tiktoken, or a provider's token-counting endpoint) to count tokens in a few prompts of different lengths and languages. Confirm token count doesn't track character or word count 1:1.",
    quiz: [
      {
        question: "Why can a short sentence in one language use more tokens than a similar-length sentence in another?",
        options: [
          "Because some languages are inherently harder for the model to understand",
          "Because token count is just character count divided by two",
          "Tokenizers are trained on specific text distributions, so some languages/scripts split into more tokens per character",
          "It can't — token count always matches word count exactly",
        ],
        correctIndex: 2,
      },
      {
        question: "What does setting temperature to 0 do to a model's output, and when would you want that?",
        options: [
          "It disables the model's ability to use tools",
          "It makes generation deterministic, always picking the most likely token — useful for repeatable, consistent output",
          "It makes the model respond faster but less accurately",
          "It forces the model to always return the shortest possible answer",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(20, 'llms', 'First API calls: messages and system prompts', 20, {
    blocks: [
      {
        type: 'p',
        text: "Every model provider's chat API takes the same basic shape: a list of messages, each with a role (system, user, or assistant) and content. The system message sets persistent instructions for the whole conversation; user and assistant messages are the back-and-forth.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "import anthropic\nclient = anthropic.Anthropic()\n\nresponse = client.messages.create(\n    model=\"claude-sonnet-5\",\n    max_tokens=200,\n    system=\"You are a concise assistant.\",\n    messages=[{\"role\": \"user\", \"content\": \"Explain recursion in one sentence.\"}],\n)\nprint(response.content[0].text)",
      },
      {
        type: 'p',
        text: "The model is stateless between calls — it has no memory of your last request. \"Conversation memory\" is really just your code resending the entire message history on every call. Forget to include earlier turns, and the model has genuinely never seen them.",
      },
    ],
    exercise:
      "Make your first direct API call to a model. Then build a loop that appends each turn to a messages list and resends the whole history every request — and prove to yourself the model has no memory by omitting history on one call and watching it lose context.",
    quiz: [
      {
        question: "Why does the client have to resend the full conversation history on every single request?",
        options: [
          "To let the provider bill for more tokens",
          "Because the API only accepts one message per request otherwise",
          "It doesn't — the provider stores history automatically for every account",
          "The model is stateless between calls — it has no memory of previous requests unless you include them",
        ],
        correctIndex: 3,
      },
      {
        question: "What's the difference between a system message and a user message?",
        options: [
          "They're processed identically — the labels are just for readability",
          "A system message can only appear after the first user message",
          "The system message sets persistent instructions for the whole conversation; user messages are the actual back-and-forth",
          "User messages are optional; system messages are required",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(21, 'llms', 'Streaming', 20, {
    blocks: [
      {
        type: 'p',
        text: "A non-streaming call waits for the entire response to finish generating before you see anything. Streaming delivers tokens as they're produced, so a user sees text appearing immediately — the total generation time is the same, but the perceived latency is much lower.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "with client.messages.stream(\n    model=\"claude-sonnet-5\", max_tokens=300,\n    messages=[{\"role\": \"user\", \"content\": \"Write a haiku about oceans.\"}],\n) as stream:\n    for text in stream.text_stream:\n        print(text, end=\"\", flush=True)",
      },
      {
        type: 'p',
        text: "Under the hood this is usually server-sent events: a long-lived HTTP connection delivering a sequence of small chunks. Your code has to handle partial output correctly — a chunk isn't guaranteed to be a complete word, sentence, or JSON object, so code that assumes it can immediately parse each chunk as something complete will break.",
      },
    ],
    exercise:
      "Convert your Lesson 20 chatbot loop to stream tokens to the terminal as they arrive instead of printing the full response at once.",
    quiz: [
      {
        question: "What problem does streaming solve for the user, given that the total generation time is the same either way?",
        options: [
          "It reduces the actual total generation time",
          "It lowers perceived latency — text appears immediately instead of staring at a blank screen until everything is ready",
          "It reduces the number of tokens used",
          "It allows the model to change its answer after starting",
        ],
        correctIndex: 1,
      },
      {
        question: "What could go wrong if your code assumes every streamed chunk is one complete word or JSON object?",
        options: [
          "Nothing — chunks are always guaranteed to be complete units",
          "The stream will simply stop early",
          "A chunk can split a word, sentence, or JSON structure mid-way, so parsing each chunk in isolation can break or garble output",
          "It will cause the API key to be rejected",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(22, 'llms', 'Structured output and validation', 20, {
    blocks: [
      {
        type: 'p',
        text: "Asking a model to \"return JSON\" is not the same as guaranteeing valid JSON matching your schema — models occasionally miss a field, use the wrong type, or wrap the JSON in prose. Getting a response back is only step one; you still have to validate it, which is exactly what Pydantic (Lesson 8) is for.",
      },
      {
        type: 'p',
        text: "A robust pattern: define the expected shape as a Pydantic model, ask the model for output matching it (via a JSON schema in the prompt or provider-specific structured output/tool-use features), validate what comes back, and if validation fails, resend the request with the validation error included so the model can self-correct — rather than giving up or blindly retrying the identical request.",
      },
    ],
    exercise:
      "Define a Pydantic model for extracting structured data from unstructured text (e.g. name, date, and amount from an invoice-like paragraph). Get matching JSON from a model, validate it, and retry once with the validation error included if it's malformed.",
    quiz: [
      {
        question: "Why is asking a model for JSON not enough on its own — what still has to happen after you get a response back?",
        options: [
          "Nothing — a model asked for JSON always returns valid JSON",
          "The response needs to be manually translated into XML first",
          "You must always resend the same request a second time to confirm it",
          "The response still has to be validated against the expected schema — models can miss fields, use wrong types, or wrap JSON in prose",
        ],
        correctIndex: 3,
      },
      {
        question: "When validation fails, why is retrying with the error message included usually better than retrying the identical request?",
        options: [
          "It isn't better — an identical retry works just as well",
          "Including the error message is required by the API or the request is rejected",
          "It gives the model the specific error, letting it self-correct, instead of blindly repeating the same mistake",
          "It reduces the number of tokens used in the retry",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(23, 'llms', 'Tool use (function calling)', 20, {
    blocks: [
      {
        type: 'p',
        text: "A tool definition tells the model a function exists: its name, a description, and a JSON schema for its parameters. The model never executes anything itself — when it decides a tool is needed, it returns a structured request to call it, and your code is the one that actually runs it and sends the result back.",
      },
      {
        type: 'p',
        text: "The loop: send messages + tool definitions → model responds, possibly requesting a tool call → your code executes that tool → you append the tool's result as a new message → send again → model continues, now with the tool's output available. This is the exact mechanism that turns into an agent in Phase 3.",
      },
      {
        type: 'p',
        text: "The tool's description matters as much as its implementation — it's the only information the model has to decide when and how to call it. A vague description gets called at the wrong times or with wrong arguments, no matter how correct the underlying code is.",
      },
    ],
    exercise:
      "Define one real tool (e.g. a calculator or a lookup function), wire it into an API call with its schema, and implement the loop that executes it when requested and returns the result to the model.",
    quiz: [
      {
        question: "Who actually executes the tool call — the model, or your code?",
        options: [
          "The model executes it directly through the API provider's servers",
          "Your code — the model only returns a structured request to call it",
          "Both execute it independently and results are compared",
          "Neither — tool calls are simulated, not actually run",
        ],
        correctIndex: 1,
      },
      {
        question: "Why does the tool's description matter as much as its implementation?",
        options: [
          "It doesn't — only the actual code behavior matters",
          "The description is only shown to end users, not the model",
          "It's the only information the model has to decide when and how to call the tool — a vague one leads to wrong or mistimed calls",
          "Descriptions are optional and ignored by most providers",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(24, 'llms', 'Prompting as engineering', 20, {
    blocks: [
      {
        type: 'p',
        text: "Good prompts are specific: clear instructions, a defined output format, and — often more effective than another paragraph of instructions — one or two concrete examples (few-shot). An example shows the model exactly what \"good\" looks like instead of describing it abstractly.",
      },
      {
        type: 'p',
        text: "Common failure modes: ambiguous instructions the model has to guess at, a system prompt that quietly contradicts a later user instruction, and stuffing in unrelated context that dilutes what actually matters. Treat prompts like source code — version them, diff changes, and know what changed when behavior changes.",
      },
    ],
    exercise:
      "Take a vague prompt and identify exactly what's ambiguous about it. Rewrite it three ways — more specific instructions, one added example, and a constrained output format — and compare the three outputs against the original.",
    quiz: [
      {
        question: "Why does adding one good example to a prompt often help more than three extra sentences of instructions?",
        options: [
          "Examples always use fewer tokens than instructions",
          "Instructions are ignored by the model entirely",
          "It doesn't — instructions are always more reliable than examples",
          "An example shows the model exactly what \"good\" looks like, instead of relying on it to interpret an abstract description",
        ],
        correctIndex: 3,
      },
      {
        question: "What does \"prompt versioning\" mean, and why treat prompts like source code instead of throwaway text?",
        options: [
          "Encrypting prompts so competitors can't see them",
          "Tracking changes to prompts over time, the same way you track code changes, so you know what changed when behavior changes",
          "Writing multiple language translations of the same prompt",
          "A feature only available in certain paid API tiers",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(25, 'llms', 'Cost, latency, and prompt caching', 20, {
    blocks: [
      {
        type: 'p',
        text: "API pricing is per token, and input and output tokens are usually priced differently — output tokens cost more, since generating each one requires a full forward pass through the model while input tokens are processed in parallel. A longer system prompt or more retrieved context directly raises cost on every single call.",
      },
      {
        type: 'p',
        text: "Model choice is a real tradeoff: a larger model is more capable but slower and more expensive per token; a smaller model is cheaper and faster but may need better prompting to hit the same quality bar. Prompt caching lets a provider reuse a previously-processed prefix (like a long, unchanging system prompt) across calls, cutting both cost and latency for the cached portion.",
      },
    ],
    exercise:
      "Estimate the cost of 1,000 calls to a prompt with a 2,000-token system prompt and a short user message, with and without prompt caching applied to the system prompt. Compare the totals.",
    quiz: [
      {
        question: "Why are output tokens usually priced higher than input tokens?",
        options: [
          "Output tokens are priced higher purely as a business decision with no technical reason",
          "Input tokens are actually priced higher, not output tokens",
          "Generating each output token requires a full forward pass through the model, while input tokens are processed in parallel",
          "Output tokens include the cost of storage on the provider's servers",
        ],
        correctIndex: 2,
      },
      {
        question: "What part of a prompt is the best candidate for a cached prefix, and why?",
        options: [
          "The very last user message, since it's the most important",
          "Nothing should be cached — caching always makes output less accurate",
          "Only the model's response can be cached, not the prompt",
          "A long, unchanging part like the system prompt, since it's identical across many calls",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(26, 'llms', 'Project: streaming chatbot with tools and memory', 40, {
    blocks: [
      {
        type: 'p',
        text: "The Phase 2 capstone: combine every piece from this phase into one real chatbot — messages and system prompts (Lesson 20), streaming (Lesson 21), at least one working tool (Lesson 23), and conversation memory that survives across turns.",
      },
      {
        type: 'p',
        text: "The trickiest part is usually the interaction between streaming and tool use: a streamed response can itself contain a tool-call request partway through, which means your code has to finish consuming that stream, execute the tool, and then continue the conversation with a fresh request — not just print tokens blindly.",
      },
    ],
    exercise:
      "Build a CLI or simple web chatbot that streams responses token-by-token, has at least one working tool, and keeps conversation memory across turns — the Phase 2 capstone project.",
    quiz: [
      {
        question: "Where does \"memory\" actually live in your chatbot — in the model, or in your code?",
        options: [
          "In the model — it remembers every past conversation automatically",
          "In the API provider's servers, tied to your API key",
          "In your code — it's the stored message history your code resends on every request",
          "Memory doesn't really exist in chatbots; it's a marketing term",
        ],
        correctIndex: 2,
      },
      {
        question: "If the model requests a tool call mid-stream, what has to happen before your code can execute the tool and continue the conversation?",
        options: [
          "Nothing — tool calls execute automatically mid-stream with no code changes",
          "The conversation has to restart from the first message",
          "The stream has to finish being consumed so your code has the complete tool-call request, before executing it and sending a fresh request",
          "The user has to manually approve the tool call in a popup",
        ],
        correctIndex: 2,
      },
    ],
  }),

  // ── Phase 3: Core AI Engineering ──────────────────────────────────────
  readyLesson(27, 'core-ai-engineering', 'Embeddings', 20, {
    blocks: [
      {
        type: 'p',
        text: "An embedding is a vector representing meaning — text with similar meaning maps to vectors that are close together, measured with the cosine similarity from Lesson 17. An embedding model turns text into these vectors; unlike a chat model, it doesn't generate text, it just maps text to a point in a high-dimensional space.",
      },
      {
        type: 'code',
        lang: 'python',
        code: "response = client.embeddings.create(model=\"embedding-model\", input=\"the cat sat on the mat\")\nvector = response.data[0].embedding   # e.g. a list of 1536 floats",
      },
      {
        type: 'p',
        text: "Vectors from two different embedding models are not comparable — they live in different, unrelated spaces, even if both have the same number of dimensions. Always embed your query with the same model you used to embed your documents.",
      },
    ],
    exercise:
      "Embed 10 short sentences covering a few different topics. Compute pairwise cosine similarity between all of them and confirm sentences on the same topic score noticeably higher than sentences on unrelated topics.",
    quiz: [
      {
        question: "Why can't you directly compare embeddings produced by two different embedding models?",
        options: [
          "You can always compare them — dimension count is all that matters",
          "Different models use different programming languages internally",
          "They live in different, unrelated vector spaces, even if they happen to have the same number of dimensions",
          "Embeddings from different models use incompatible file formats only",
        ],
        correctIndex: 2,
      },
      {
        question: "What does it mean, in terms of the vectors themselves, for two pieces of text to be semantically similar?",
        options: [
          "They contain many of the exact same words",
          "They were generated by the same API call",
          "Their vectors have the exact same length in characters",
          "Their embedding vectors are close together, e.g. high cosine similarity",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(28, 'core-ai-engineering', 'Vector search with pgvector', 20, {
    blocks: [
      {
        type: 'p',
        text: "pgvector adds a vector column type to Postgres, so embeddings live right alongside your other data — no separate database to run and keep in sync. Searching means embedding the query the same way you embedded your documents, then ordering by vector distance.",
      },
      {
        type: 'code',
        lang: 'sql',
        code: "CREATE EXTENSION IF NOT EXISTS vector;\nCREATE TABLE docs (id serial PRIMARY KEY, content text, embedding vector(1536));\n\nSELECT content FROM docs ORDER BY embedding <=> $1 LIMIT 5;  -- $1 = the query's embedding",
      },
      {
        type: 'p',
        text: "The <=> operator computes cosine distance between the stored vector and your query vector — smaller means more similar. An approximate index (ivfflat or hnsw) makes this fast on large tables by trading a small amount of accuracy for a large speedup; for search, that tradeoff is almost always worth it, since the difference between the true 5th-best and 6th-best result rarely matters.",
      },
    ],
    exercise:
      "Store embeddings for a handful of documents in a pgvector column, then run a nearest-neighbor query for a new query embedding and confirm the top results are the ones you'd expect.",
    quiz: [
      {
        question: "What does the <=> operator represent in a pgvector query?",
        options: [
          "String equality comparison between two text columns",
          "Cosine distance between the stored vector and the query vector — smaller means more similar",
          "A join condition between two tables",
          "An arithmetic average of two numeric columns",
        ],
        correctIndex: 1,
      },
      {
        question: "Why does an approximate nearest-neighbor index trade some accuracy for speed, and why is that usually fine for search?",
        options: [
          "It doesn't trade anything — approximate indexes are always exact",
          "Because Postgres cannot support exact vector search at all",
          "It skips checking every single vector for a big speedup, and the true best vs. near-best result rarely matters for search",
          "Because vector columns are always stored in a lossy compressed format",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(29, 'core-ai-engineering', 'Chunking and the RAG pipeline', 20, {
    blocks: [
      {
        type: 'p',
        text: "You can't just embed a whole document — it may exceed the embedding model's input limit, and even when it fits, one vector for an entire document is too blunt for retrieval: it can't tell a reader which part is relevant. Chunking splits documents into smaller, focused pieces first.",
      },
      {
        type: 'p',
        text: "A common strategy is fixed-size chunks (e.g. ~500 tokens) with some overlap between consecutive chunks, so a fact sitting right at a chunk boundary doesn't get split apart from the context it needs. The full RAG pipeline: chunk documents → embed each chunk → store in a vector table (Lesson 28) → embed the incoming query → retrieve the closest chunks → include them in the prompt → generate the final answer.",
      },
    ],
    exercise:
      "Write a chunker that splits a long document into overlapping ~500-token chunks. Embed each chunk and build a minimal retrieve-then-generate pipeline over 3-4 source documents.",
    quiz: [
      {
        question: "Why include overlap between chunks instead of splitting on hard, non-overlapping boundaries?",
        options: [
          "Overlap makes embedding cheaper",
          "Overlap is required by the embedding API or it rejects the request",
          "So a fact sitting right at a chunk boundary doesn't get separated from the context it needs",
          "It has no real benefit, it's just a common convention",
        ],
        correctIndex: 2,
      },
      {
        question: "What goes wrong for retrieval if your chunks are too large? What goes wrong if they're too small?",
        options: [
          "Too large speeds up retrieval with no downside; too small has no effect at all",
          "Too large dilutes relevance (mixing too many topics); too small loses the context needed to make sense of the content",
          "Chunk size only affects storage cost, never retrieval quality",
          "Too large causes embedding to fail outright; too small causes duplicate results",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(30, 'core-ai-engineering', 'Hybrid search, reranking, citations', 20, {
    blocks: [
      {
        type: 'p',
        text: "Vector search alone can miss exact matches — a product code, a person's name, an acronym — because embeddings capture meaning, not precise tokens. Hybrid search runs a keyword search (like Postgres full-text search or BM25) alongside vector search and combines both result sets, catching what either one alone would miss.",
      },
      {
        type: 'p',
        text: "Reranking adds a second pass: take the top 20-50 candidates from the first-pass retrieval and score them with a more expensive, more accurate model, keeping only the true top few. It's applied only to the shortlist because reranking every document in a large corpus would be far too slow and costly. Attaching a citation — which chunk or source backed a given claim — makes the final answer verifiable and makes your own debugging much easier.",
      },
    ],
    exercise:
      "Add keyword search alongside your Lesson 29 vector search, combine the two result sets, and attach a source citation to each retrieved chunk so the final answer can reference exactly where it came from.",
    quiz: [
      {
        question: "Give one example of a query where keyword search would beat pure vector search.",
        options: [
          "Searching for the general sentiment of a long review",
          "Searching for documents about a broad topic like \"machine learning\"",
          "Keyword search never beats vector search for any query",
          "Searching for an exact product code or acronym, which embeddings can miss despite capturing meaning well",
        ],
        correctIndex: 3,
      },
      {
        question: "Why rerank only the top-N candidates instead of reranking the entire corpus?",
        options: [
          "Reranking the whole corpus is actually faster than reranking a shortlist",
          "Reranking more than a few documents is technically impossible",
          "Reranking every document in a large corpus would be far too slow and costly; the shortlist already has the likely best matches",
          "Because reranking always makes results worse beyond a few candidates",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(31, 'core-ai-engineering', 'Evals I: test sets and metrics', 20, {
    blocks: [
      {
        type: 'p',
        text: "Without an eval, you're guessing whether a prompt or pipeline change actually helped. An eval set is a collection of representative real inputs paired with an expected output or explicit acceptance criteria — the same idea as a test suite, applied to model behavior instead of code behavior.",
      },
      {
        type: 'p',
        text: "A 3-example eval set can pass 100% by luck; a 30-example set that covers real edge cases gives you actual confidence. Metrics differ by what you're measuring: retrieval precision/recall (did the right chunk get retrieved?) is a different question from answer quality (was the final generated answer actually correct?) — you usually need both.",
      },
    ],
    exercise:
      "Build a 15-20 example test set for your RAG pipeline: a question, plus the expected answer or expected source. Score your current pipeline against it with a simple metric, e.g. whether the correct source landed in the top 3 retrieved chunks.",
    quiz: [
      {
        question: "Why does an eval set of 3 examples give much less confidence than one of 30, even if both pass 100%?",
        options: [
          "It doesn't — 3 examples give exactly the same confidence as 30",
          "Because pytest requires a minimum of 30 test cases to run",
          "A tiny set can pass 100% by luck or narrow coverage; a larger, representative set is far less likely to hide real failures",
          "Because smaller eval sets always run slower than larger ones",
        ],
        correctIndex: 2,
      },
      {
        question: "What's the difference between a metric that checks retrieval quality and one that checks the final generated answer?",
        options: [
          "There's no difference — they always move together",
          "Retrieval metrics only apply to SQL databases, not vector search",
          "Answer-quality metrics are only usable with LLM-as-judge, never automated",
          "Retrieval metrics ask whether the right source was found; answer-quality metrics ask whether the final text was actually correct",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(32, 'core-ai-engineering', 'Evals II: LLM-as-judge and regression testing', 20, {
    blocks: [
      {
        type: 'p',
        text: "Exact-match metrics don't work for open-ended answers — two correct answers can be worded completely differently. LLM-as-judge uses a model, given an explicit rubric, to score another model's output. It's more flexible than exact match, at the cost of being another model call that can itself be wrong or biased.",
      },
      {
        type: 'p',
        text: "Known judge biases include favoring longer, more verbose answers, and favoring whichever answer appears first when comparing two. Mitigate both with a fixed, explicit rubric, a few labeled examples in the judge prompt, and randomizing answer order when comparing two outputs.",
      },
      {
        type: 'p',
        text: "Regression testing means rerunning your full eval set every time you change a prompt, model, or pipeline step — so a change that quietly makes things worse for some inputs gets caught immediately, instead of showing up as a vague complaint weeks later.",
      },
    ],
    exercise:
      "Write an LLM-as-judge prompt with an explicit rubric to score your RAG pipeline's answers on your Lesson 31 test set. Run it before and after a prompt change and see whether the score actually moved in the direction you expected.",
    quiz: [
      {
        question: "Why is an LLM judge more useful than exact string match for grading open-ended answers, and what's the tradeoff?",
        options: [
          "It's more useful because it's always cheaper than exact match",
          "There's no tradeoff — LLM judges are strictly better in every way",
          "Exact match is actually better for all open-ended grading",
          "It recognizes correct answers worded differently, at the cost of being another model call that can itself be biased or wrong",
        ],
        correctIndex: 3,
      },
      {
        question: "Name one concrete way to reduce bias in an LLM-as-judge setup.",
        options: [
          "Always use the largest, most expensive model available with no rubric",
          "Use a fixed, explicit rubric with labeled examples, and randomize answer order when comparing two outputs",
          "Ask the model being graded to also grade itself",
          "Remove the rubric so the judge can decide freely",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(33, 'core-ai-engineering', 'Agents: the tool-use loop', 20, {
    blocks: [
      {
        type: 'p',
        text: "An agent is an LLM run inside a loop: call the model, let it decide whether to call a tool, execute that tool if requested, feed the result back, and repeat — until the model produces a final answer instead of another tool call. This is Lesson 23's single tool call, extended into a loop instead of one round trip.",
      },
      {
        type: 'p',
        text: "Without a stopping condition, a misbehaving loop could call tools forever. Real agent loops need a hard limit — a max number of iterations, or an explicit \"done\" signal the model returns — so a bad run fails safely instead of running (and costing money) indefinitely.",
      },
    ],
    exercise:
      "Extend your Lesson 23 tool-use code into a real loop that keeps calling the model and executing tools until it returns a final text answer, with a max-iteration safety limit that stops the loop and reports failure if it's ever hit.",
    quiz: [
      {
        question: "What stops an agent loop from running forever, and why is that limit necessary?",
        options: [
          "Nothing stops it — agent loops are designed to run until manually killed",
          "The API provider automatically stops any loop after exactly one call",
          "The model always knows when to stop on its own, no limit needed",
          "A hard max-iteration limit (or explicit \"done\" signal) — without it a misbehaving loop could call tools indefinitely, costing money",
        ],
        correctIndex: 3,
      },
      {
        question: "What's the actual difference between a single tool call (Lesson 23) and an agent?",
        options: [
          "An agent uses a completely different API than tool calling",
          "There's no real difference, just different names for the same thing",
          "An agent can only use one tool; tool calling can use many",
          "An agent wraps the tool-call mechanism in a loop, letting the model call tools repeatedly until it produces a final answer",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(34, 'core-ai-engineering', 'Workflows vs agents, planning', 20, {
    blocks: [
      {
        type: 'p',
        text: "A workflow is a fixed sequence of steps you write explicitly in code. An agent lets the model decide the steps dynamically, at runtime. A workflow is more predictable, cheaper (fewer model calls), and far easier to test and debug — reach for it whenever the steps a task needs are actually knowable ahead of time.",
      },
      {
        type: 'p',
        text: "An agent earns its extra complexity and cost only when the steps genuinely can't be known in advance — the task varies too much between runs to hardcode. A middle ground is planning: have the model produce an explicit plan first, then execute it step by step, which is more controllable and inspectable than letting the model improvise the entire way through.",
      },
    ],
    exercise:
      "Take a task you'd naturally reach for an agent to solve, and redesign it as a fixed workflow instead. Write a short argument for which one is actually the better fit for that specific task, and why.",
    quiz: [
      {
        question: "Give one concrete task that's better solved by a fixed workflow than an agent.",
        options: [
          "Any task that involves calling an LLM at all",
          "A task where the required steps genuinely can't be known in advance",
          "A task with a known, fixed sequence of steps, e.g. \"summarize this document then translate it\"",
          "Tasks are never better solved by a fixed workflow than an agent",
        ],
        correctIndex: 2,
      },
      {
        question: "What's one real cost of using an agent for a task where a plain workflow would have worked just as well?",
        options: [
          "There's no real cost — agents are strictly more capable with no downside",
          "Agents always run using less compute than workflows",
          "More model calls than necessary, higher cost and latency, and a harder-to-test, less predictable system",
          "Using an agent unnecessarily is a security vulnerability",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(35, 'core-ai-engineering', 'MCP (Model Context Protocol)', 20, {
    blocks: [
      {
        type: 'p',
        text: "Without a shared standard, every AI app has to write its own bespoke integration for every tool or data source it wants to use. MCP (Model Context Protocol) is an open protocol that standardizes this: an MCP server exposes tools and resources in a consistent way, and any MCP client — Claude Code, or an app you build — can connect to it and use them.",
      },
      {
        type: 'p',
        text: "This is the same tool-definition-and-call pattern from Lesson 23, just delivered over a standard protocol instead of a one-off integration — write a tool once as an MCP server, and any MCP-compatible client can use it without custom glue code.",
      },
    ],
    exercise:
      "Connect an MCP client to a simple MCP server (or stand one up yourself) and call one of its tools, observing the same request/response shape you built by hand in Lesson 23.",
    quiz: [
      {
        question: "What problem does a standard protocol like MCP solve compared to every app writing its own custom tool integration?",
        options: [
          "It makes tool calls execute without needing any code at all",
          "It removes the need for tool descriptions entirely",
          "A tool can be written once, as an MCP server, and used by any MCP-compatible client without custom glue code per app",
          "It only works for one specific AI provider's models",
        ],
        correctIndex: 2,
      },
      {
        question: "In MCP's client/server model, which side actually defines the available tools?",
        options: [
          "The client — it tells the server which tools to create",
          "The server — it exposes the tools and resources that any connecting client can use",
          "Neither — tools are defined by the model itself",
          "Both sides define an identical, duplicated set of tools",
        ],
        correctIndex: 1,
      },
    ],
  }),
  readyLesson(36, 'core-ai-engineering', 'Observability and tracing', 20, {
    blocks: [
      {
        type: 'p',
        text: "A RAG or agent pipeline has many steps — retrieval, one or more tool calls, one or more model calls. When the final answer is wrong, the final output alone doesn't tell you which step broke. Tracing captures each intermediate step's input, output, latency, and token count, so you can see exactly where things went sideways.",
      },
      {
        type: 'p',
        text: "Dedicated tools like Langfuse and LangSmith build this in for LLM pipelines specifically; plain OpenTelemetry spans work too if you'd rather not add a specialized dependency. Either way, log at minimum: what was sent, what came back, how long it took, and how many tokens it used — for every model call.",
      },
    ],
    exercise:
      "Instrument your Phase 3 RAG or agent pipeline with tracing that captures each step's input, output, latency, and token count. Use it to diagnose one deliberately slow or wrong run — find the actual step that caused the problem.",
    quiz: [
      {
        question: "Why is tracing each intermediate step more useful for debugging an agent than only logging the final output?",
        options: [
          "It isn't more useful — the final output always contains enough information",
          "Tracing intermediate steps is only useful for billing purposes",
          "It's required by every LLM provider's terms of service",
          "A pipeline has many steps, and the final output alone doesn't reveal which specific step actually broke",
        ],
        correctIndex: 3,
      },
      {
        question: "What three pieces of information are worth capturing for every model call in a trace?",
        options: [
          "Only the final answer, nothing else",
          "The developer's name, the server's IP address, and the time zone",
          "What was sent, what came back, and how long it took (plus token count)",
          "The model's internal weights and training data",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(37, 'core-ai-engineering', 'Guardrails and prompt injection', 20, {
    blocks: [
      {
        type: 'p',
        text: "Prompt injection is the core security risk of RAG and agents: untrusted content — a retrieved document, a web page, a tool result — contains instructions aimed at the model, trying to override its actual task. A plain chatbot only ever sees what the user typed; a RAG or agent system feeds it content from outside sources it doesn't control.",
      },
      {
        type: 'p',
        text: "Guardrails reduce this risk without eliminating it: explicitly instructing the model to treat retrieved or tool content as data, not instructions; filtering suspicious content before or after the model sees it; and limiting what tools are actually allowed to do, so even a successful injection has a small blast radius. PII handling follows the same logic — decide upfront what should never be logged or sent to a third party.",
      },
    ],
    exercise:
      "Deliberately construct a prompt-injection test case — a fake \"document\" containing hidden instructions — against your Lesson 29-30 RAG pipeline and observe what happens. Add one guardrail (e.g. an explicit system-prompt instruction, or output filtering) and confirm it measurably reduces the effect.",
    quiz: [
      {
        question: "Why is prompt injection especially dangerous in a RAG or tool-using agent, compared to a plain chatbot?",
        options: [
          "It isn't more dangerous — the risk is identical in both cases",
          "Because RAG systems don't support system prompts at all",
          "A RAG/agent system feeds the model content from outside sources it doesn't control, unlike a plain chatbot",
          "Because agents always have access to real money and payment systems",
        ],
        correctIndex: 2,
      },
      {
        question: "Name one concrete guardrail you could add to reduce — not eliminate — that risk.",
        options: [
          "Remove the system prompt entirely so there's nothing to override",
          "Give the agent unrestricted access to every tool so it can self-correct",
          "Disable logging so injected instructions can't be traced",
          "Explicitly instruct the model to treat retrieved/tool content as data, not instructions",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(38, 'core-ai-engineering', 'Fine-tuning: when and how', 20, {
    blocks: [
      {
        type: 'p',
        text: "Prompting and RAG change nothing about the model itself — only what goes into the input. Fine-tuning actually updates the model's weights. That makes it more powerful but also more expensive, slower to iterate on, and easy to reach for before you actually need it.",
      },
      {
        type: 'p',
        text: "Fine-tuning tends to beat prompting only for narrow, high-volume, consistent-format tasks where good prompting has already hit a real ceiling — which is rare early in a project. LoRA fine-tunes a small set of added adapter weights instead of the entire model, which is dramatically cheaper and faster while still capturing most of the benefit for many tasks.",
      },
    ],
    exercise:
      "Before reaching for fine-tuning, try to solve a task with better prompting and a few few-shot examples first. Only if that genuinely plateaus, try a small LoRA fine-tune on a small open model and compare the two approaches directly.",
    quiz: [
      {
        question: "Why does the roadmap say to try fine-tuning rarely, and only after prompting has genuinely been exhausted?",
        options: [
          "Because fine-tuning is technically impossible for most developers",
          "Because fine-tuning always produces worse results than prompting",
          "It's more expensive and slower to iterate on, and prompting alone solves most tasks without touching the model's weights",
          "Because fine-tuned models cannot be deployed to production",
        ],
        correctIndex: 2,
      },
      {
        question: "What does LoRA fine-tune that a full fine-tune doesn't, and why does that make it so much cheaper?",
        options: [
          "LoRA fine-tunes the tokenizer only, not the model weights",
          "LoRA and full fine-tuning train the exact same number of parameters",
          "LoRA is cheaper only because it skips validation data entirely",
          "LoRA trains a small set of added adapter weights instead of the entire model, needing far less compute and memory",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(39, 'core-ai-engineering', 'Project: RAG app with an eval suite', 40, {
    blocks: [
      {
        type: 'p',
        text: "The first Phase 3 capstone: a RAG app over a real set of documents you choose, with an eval suite (Lessons 31-32) that actually measures retrieval quality and answer quality — not just \"it seems to work when I try it.\"",
      },
      {
        type: 'p',
        text: "A useful write-up names a specific metric your eval suite reports and what a low score on it tells you to go fix. If retrieval precision is low, the problem is upstream — chunking or the retrieval query. If retrieval is fine but answers are still wrong, the problem is in generation — the prompt, or the model not using the retrieved context well.",
      },
    ],
    exercise:
      "Build a RAG app over a real set of documents you choose, with an eval suite measuring retrieval quality and answer quality, and a short write-up of the measured results — the first Phase 3 portfolio project.",
    quiz: [
      {
        question: "Name one metric your eval suite reports, and say what a low score on it tells you to go fix — retrieval or generation.",
        options: [
          "Token count — a low score there means your API key is invalid",
          "Uptime — a low score there means your database needs a bigger index",
          "Retrieval precision — a low score there points upstream, to chunking or the retrieval query, not generation",
          "There's no metric that can tell you which part of the pipeline to fix",
        ],
        correctIndex: 2,
      },
      {
        question: "If you doubled your chunk size, what would you expect to happen to your eval scores, and why?",
        options: [
          "Nothing would change — chunk size has no effect on eval scores",
          "Scores would always improve, since more context is always better",
          "Eval scores are unrelated to how documents were chunked",
          "Retrieval could get less precise (larger chunks mix more topics), though each chunk carries more context — worth measuring, not assuming",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(40, 'core-ai-engineering', 'Project: tool-using agent with tracing', 40, {
    blocks: [
      {
        type: 'p',
        text: "The second Phase 3 capstone: a tool-using agent (Lessons 33-34) that does something genuinely useful — research, a coding helper, or a data analyst — instrumented with tracing (Lesson 36), with a real failure-analysis write-up covering at least one run that went wrong and why.",
      },
      {
        type: 'p',
        text: "A good failure write-up distinguishes where the failure actually occurred: bad reasoning by the model, a broken or misused tool, or a bug in your own orchestration code. Tracing is what makes that distinction possible instead of guesswork.",
      },
    ],
    exercise:
      "Build a tool-using agent that does something useful, with tracing instrumented per Lesson 36, and a short failure-analysis write-up covering at least one case where it went wrong — the second Phase 3 portfolio project.",
    quiz: [
      {
        question: "In your failure write-up, was the failure in the model's reasoning, a tool, or your orchestration code? How did tracing help you tell the difference?",
        options: [
          "Tracing can't distinguish between those causes, only guesswork can",
          "The failure is always in the model, never the surrounding code",
          "Tracing shows each step's input/output, letting you see which layer actually produced the wrong result",
          "Tracing only reports final answers, not any intermediate cause",
        ],
        correctIndex: 2,
      },
      {
        question: "What's one guardrail (Lesson 37) this specific agent should have, given what it's allowed to do?",
        options: [
          "None — guardrails are only relevant for RAG systems, not agents",
          "Disabling all tool use entirely, since that removes all risk and all usefulness",
          "Guardrails are automatically applied by the model provider with no setup",
          "Something scoped to its actual capabilities, e.g. treating tool/content inputs as data, or limiting which tools it can call",
        ],
        correctIndex: 3,
      },
    ],
  }),

  // ── Phase 4: Production & Depth ───────────────────────────────────────
  readyLesson(41, 'production', 'Reliability: retries, fallbacks, queues', 20, {
    blocks: [
      {
        type: 'p',
        text: "Providers have outages and rate limits — a retry with backoff (Lesson 9) handles brief blips, but during a provider-wide outage no amount of retrying the same provider helps. A fallback switches to a second model provider when the primary errors out or times out repeatedly, keeping the product working instead of fully down.",
      },
      {
        type: 'p',
        text: "A queue decouples accepting a request from processing it, smoothing out bursty load instead of letting spikes overwhelm your service directly. An operation is idempotent if running it twice has the same effect as running it once — that property is what makes it safe to retry in the first place, since a non-idempotent retry (e.g. \"charge the card again\") can cause real damage.",
      },
    ],
    exercise:
      "Add a fallback to a second model provider in your Lesson 26 or 40 project, triggered when the primary provider errors or times out. Simulate a failure (e.g. point at a bad URL or invalid key) and confirm the fallback actually activates.",
    quiz: [
      {
        question: "Why is a retry alone not enough during a provider-wide outage, and what does a fallback add?",
        options: [
          "A retry is always enough — fallbacks are unnecessary complexity",
          "Fallbacks work by simply waiting longer between retries",
          "Retrying the same failing provider keeps hitting the same outage; a fallback switches to a provider that may still be working",
          "Retries and fallbacks solve completely unrelated problems",
        ],
        correctIndex: 2,
      },
      {
        question: "What does \"idempotent\" mean for an operation, and why does it matter when deciding whether it's safe to retry?",
        options: [
          "It means the operation always completes instantly",
          "It means the operation can never fail",
          "It means the operation only works with GET requests",
          "Running it twice has the same effect as running it once — which is what makes it safe to retry",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(42, 'production', 'Durable workflows for long-running agents', 20, {
    blocks: [
      {
        type: 'p',
        text: "An agent task that runs for minutes or hours can't safely keep all its state only in one process's memory — a crash, a redeploy, or a timeout loses everything and forces a full restart from scratch.",
      },
      {
        type: 'p',
        text: "Durable execution checkpoints state after each step, so a workflow can pause, resume from exactly where it left off, or survive a crash mid-run. Tools built for this (Temporal, the Vercel Workflow DevKit) structure work as explicit steps with automatic retries per step, rather than one long unbroken function.",
      },
    ],
    exercise:
      "Take a multi-step agent task and break it into explicit steps with checkpointed state persisted after each one — so it could genuinely resume from the last completed step instead of restarting from the beginning after a crash.",
    quiz: [
      {
        question: "Why can't a long-running agent safely keep all of its state only in memory?",
        options: [
          "In-memory state is actually always safe for any duration",
          "Memory is too slow to be useful for agent state",
          "It's a licensing restriction from cloud providers, not a technical one",
          "A crash, redeploy, or timeout wipes memory entirely, forcing a full restart from scratch with all progress lost",
        ],
        correctIndex: 3,
      },
      {
        question: "What does \"resume from the last completed step\" actually require your code to persist?",
        options: [
          "Nothing needs to be persisted if the code is written efficiently",
          "Only the very first step needs to be saved",
          "Checkpointed state after each step, so the workflow knows exactly where it left off",
          "The entire conversation history with the end user, and nothing else",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(43, 'production', 'Open-weights models and quantization', 20, {
    blocks: [
      {
        type: 'p',
        text: "Open-weights models (like the Llama or Mistral families) can be downloaded and run yourself, unlike closed models that are only reachable through an API. Ollama makes running one locally simple for experimentation; vLLM is built for higher-throughput serving in production.",
      },
      {
        type: 'p',
        text: "Quantization reduces the numeric precision of a model's weights — e.g. from 16-bit down to 4-bit — which shrinks memory and compute requirements substantially, at some cost to output quality. Teams self-host for reasons like data never leaving their infrastructure, predictable fixed costs at high volume, or needing a model fine-tuned specifically for one narrow task.",
      },
    ],
    exercise:
      "Install Ollama, pull a small open-weights model, and run it locally. Compare its output quality and latency on a few prompts against an API-based model you've used earlier in the course.",
    quiz: [
      {
        question: "What does quantizing a model's weights trade away in exchange for lower memory use?",
        options: [
          "Nothing — quantization has no quality cost, only benefits",
          "It trades away the model's ability to run on a GPU",
          "It trades away support for any language other than English",
          "Some output quality, since reducing numeric precision loses information",
        ],
        correctIndex: 3,
      },
      {
        question: "Give one real reason a team would choose to self-host an open-weights model instead of calling an API.",
        options: [
          "Self-hosting is always cheaper than an API at any scale",
          "APIs cannot be used for any commercial product",
          "Open-weights models cannot be fine-tuned, only closed ones can",
          "Keeping data entirely within their own infrastructure instead of sending it to a third party",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(44, 'production', 'Multimodal: vision, speech, documents', 20, {
    blocks: [
      {
        type: 'p',
        text: "A multimodal model can take images alongside text in the same request — useful for reading a chart, extracting data from a photographed receipt, or interpreting a UI screenshot, without writing custom image-processing code yourself.",
      },
      {
        type: 'p',
        text: "Speech has two separate concerns: transcription (speech-to-text) and synthesis (text-to-speech) — neither is the LLM itself, they're separate models you compose with one. Document parsing has a similar split: a text-based PDF can be read directly, but a scanned PDF is really just an image of text and needs OCR (or a layout-aware parser) before it can be chunked and embedded for RAG at all.",
      },
    ],
    exercise:
      "Send an image — a screenshot or a photo of a receipt — to a multimodal model API and extract structured data from it, validating the result with a Pydantic model (Lesson 8, Lesson 22).",
    quiz: [
      {
        question: "Why might a scanned PDF need OCR before it can be used in a RAG pipeline, while a text-based PDF doesn't?",
        options: [
          "Scanned PDFs are always corrupted and unreadable by any tool",
          "A scanned PDF is really just an image of text — there's no actual text layer to extract until OCR reads it",
          "Text-based PDFs also need OCR, just less of it",
          "OCR is only needed for PDFs longer than 10 pages",
        ],
        correctIndex: 1,
      },
      {
        question: "Name one task where sending an image directly to a multimodal model beats writing custom image-processing code.",
        options: [
          "Compressing an image to a smaller file size",
          "Converting an image from PNG to JPEG format",
          "Extracting structured data from a photographed receipt, without building dedicated computer-vision code yourself",
          "Multimodal models are never better than custom image-processing code",
        ],
        correctIndex: 2,
      },
    ],
  }),
  readyLesson(45, 'production', 'Streaming UIs with the Vercel AI SDK', 20, {
    blocks: [
      {
        type: 'p',
        text: "Handling streaming tokens, tool calls, and multi-turn state correctly in a frontend by hand is fiddly — a plain fetch().then(r => r.json()) call waits for the entire response and can't show partial output at all. The Vercel AI SDK provides hooks (like useChat) purpose-built for this: streaming text into the UI as it arrives, provider-agnostic model calls, and built-in handling for tool-call state.",
      },
      {
        type: 'p',
        text: "This connects Lesson 21's streaming concept to an actual product UI. The API key stays on your server route, never in browser code — the browser calls your route, and your route calls the model provider, so the key is never exposed to anyone inspecting network requests in their browser.",
      },
    ],
    exercise:
      "Build a minimal chat UI (Next.js + Vercel AI SDK, or a frontend stack of your choice) that streams a model's response token-by-token into the page, reusing a backend route from an earlier lesson.",
    quiz: [
      {
        question: "What problem does a streaming-aware frontend hook solve that a plain fetch().then(r => r.json()) call can't?",
        options: [
          "It makes the underlying API call cheaper",
          "It removes the need for a backend route entirely",
          "fetch() can already stream tokens natively with no extra tooling needed",
          "It can render partial output as tokens arrive, instead of waiting for the entire response before showing anything",
        ],
        correctIndex: 3,
      },
      {
        question: "Why keep the API key on the server route instead of calling the model provider directly from the browser?",
        options: [
          "Browser calls are always slower than server calls, regardless of security",
          "It's only a convention with no real security reason",
          "Model providers block all requests that come directly from a browser",
          "So the key is never exposed in browser network requests where anyone inspecting them could see and steal it",
        ],
        correctIndex: 3,
      },
    ],
  }),
  readyLesson(46, 'production', 'Capstone: deployed product and portfolio write-up', 60, {
    blocks: [
      {
        type: 'p',
        text: "The course finale: pick one of your Phase 2-4 projects (or a new idea combining what you've learned) and ship it as a real, deployed product with actual users — even ten of them is enough to prove it holds up outside your own testing.",
      },
      {
        type: 'p',
        text: "A strong write-up states your actual cost per request, your actual latency, what broke along the way, and what you'd do differently. This is the third portfolio project from the original roadmap — the other two, the RAG app and the tool-using agent, are Lessons 39 and 40.",
      },
    ],
    exercise:
      "Deploy a complete AI product for at least a handful of real users. Write a README covering cost per request, latency, and what you learned — the third and final portfolio piece, alongside your Lesson 39 and 40 projects.",
    quiz: [
      {
        question: "Why does a strong capstone write-up need to state cost per request, not just \"it works\"?",
        options: [
          "Cost per request is only relevant for enterprise products, not personal projects",
          "It's a formality with no real bearing on whether a product is viable",
          "So you and anyone reading it can judge whether the product is financially sustainable as usage grows",
          "Cost per request matters only when using open-weights models",
        ],
        correctIndex: 2,
      },
      {
        question: "Which two earlier lessons' projects does this capstone explicitly sit alongside as the roadmap's three portfolio pieces?",
        options: [
          "Lesson 9 (concurrent fetcher) and Lesson 14 (CRUD API)",
          "Lesson 39 (RAG app with an eval suite) and Lesson 40 (tool-using agent with tracing)",
          "Lesson 26 (streaming chatbot) and Lesson 33 (agent tool-use loop)",
          "Lesson 18 (gradient descent) and Lesson 45 (streaming UI)",
        ],
        correctIndex: 1,
      },
    ],
  }),
] as const;

// Fail loudly at load time if two lessons ever generate the same slug or id
// — a silent collision here means one lesson's route shadows another's.
{
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();
  for (const lesson of LESSONS) {
    if (seenSlugs.has(lesson.slug)) {
      throw new Error(`Duplicate academy lesson slug "${lesson.slug}" (lesson ${lesson.order}).`);
    }
    if (seenIds.has(lesson.id)) {
      throw new Error(`Duplicate academy lesson id "${lesson.id}" (lesson ${lesson.order}).`);
    }
    seenSlugs.add(lesson.slug);
    seenIds.add(lesson.id);
  }
}

export const TOTAL_XP: number = LESSONS.reduce((sum, l) => sum + l.xp, 0);

export type Level = { name: string; minXp: number };

export const LEVELS: readonly Level[] = [
  { name: 'Apprentice', minXp: 0 },
  { name: 'Practitioner', minXp: 150 },
  { name: 'Builder', minXp: 350 },
  { name: 'Engineer', minXp: 600 },
  { name: 'Specialist', minXp: 850 },
  { name: 'AI Engineer', minXp: TOTAL_XP },
];

export function levelForXp(xp: number): { level: Level; index: number; next: Level | null } {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null;
  return { level: LEVELS[index], index, next };
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getPhaseLessons(phaseId: string): Lesson[] {
  return LESSONS.filter((l) => l.phaseId === phaseId).sort((a, b) => a.order - b.order);
}

/** Lessons in global order — drives sequential unlocking across the whole course. */
export function orderedLessons(): Lesson[] {
  return [...LESSONS].sort((a, b) => a.order - b.order);
}

export function nextLesson(order: number): Lesson | undefined {
  return LESSONS.find((l) => l.order === order + 1);
}

export function previousLesson(order: number): Lesson | undefined {
  return LESSONS.find((l) => l.order === order - 1);
}

/**
 * A real, specific meta description for search results — pulled from the
 * lesson's own opening paragraph instead of a generic "Lesson N of..."
 * boilerplate, and trimmed to a search-snippet-friendly length at a word
 * boundary (never mid-word).
 */
export function lessonMetaDescription(lesson: Lesson, maxLength = 155): string {
  const firstParagraph = lesson.content?.blocks.find(
    (b): b is Extract<ContentBlock, { type: 'p' }> => b.type === 'p'
  );
  const text = firstParagraph?.text ?? lesson.title;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

/** A small, deliberately curated keyword set — not the whole title split into noise. */
export function lessonKeywords(lesson: Lesson): string[] {
  const phase = PHASES.find((p) => p.id === lesson.phaseId);
  const phaseName = phase?.title.replace(/^Phase \d+ — /, '');
  return [lesson.title, 'AI engineer course', 'learn AI engineering', 'free AI tutorial', phaseName].filter(
    (k): k is string => Boolean(k)
  );
}
