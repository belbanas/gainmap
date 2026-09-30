# Public performance, protected identity

Workout performance is intentionally permitted to be public: exercise names,
weights, units, sets, reps, dates, trends, volume, frequency, PRs, and estimated
strength. Real updates may contain these sanitized metrics; the separate demo bundle
remains synthetic. Units and source set semantics must be verified before import.

Public GitHub Pages is public. `robots.txt` and `noindex,nofollow` discourage
indexing; they do not provide access control or make the site private.

Never publish names identifying the owner, usernames, contact details, Apple ID,
addresses, precise locations, gym names/addresses, Lyfta account/user/workout IDs,
OAuth information, tokens, keys, passwords, cookies, authentication headers,
device identifiers, internal metadata, or raw API/MCP responses. Do not include
unreviewed external free-text notes. This applies to code, data, documentation,
comments, assets, commit messages, and Git history.

The browser only reads local static assets and sanitized JSON. No authentication,
external API, CDN, analytics, or browser persistence is required. Rendering escapes
all display strings; image paths are restricted to local exercise assets.

The validator recursively rejects suspicious metadata keys and uses explicit schema
allowlists for publication. It cannot prove that otherwise allowed text contains
no identity or secrets. Review all incoming strings and the staged diff before
publishing. Do not paste raw source responses into this repository even temporarily.

If a credential is exposed, revoke it at the source and review the entire Git
history; removing it from the latest JSON does not remove past public copies.
