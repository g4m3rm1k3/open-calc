# Lesson 45: Capstone — A Concurrent HTTP Web Server in C

What you will build: A concurrent HTTP/1.0 web server in C that handles multiple simultaneous clients using POSIX threads. Each request is served in a separate thread. The server parses HTTP GET requests, serves static files, and returns proper HTTP responses including error codes. The transferable insight: this server uses the same architecture as early Apache — one thread per connection. Modern servers (nginx) use I/O multiplexing instead, but the HTTP protocol handling is identical.

What you need to know first: Lessons 00-44 (especially 28, 29, 32, 33, 34, 35).

**Terms used in this lesson**
- **HTTP/1.0** — A text-based protocol for exchanging documents on the web, where a client sends a request and a server returns a response, then closes the connection.
- **Concurrent Server** — A server architecture that can handle multiple clients simultaneously without one blocking another.
- **Thread** — An independent execution context within a single process.
- **MIME type** — A standard for indicating the nature and format of a document.

**Objects and methods used**
- **`sscanf`**
  - *What it is:* A C standard library function for reading formatted input from a string.
  - *Implementation:* `int sscanf(const char *str, const char *format, ...);`
  - *Its use:* To parse the first line of an HTTP request into method, URI, and version strings.
  - *Type:* Standard C Library function.
  - *Responsibility:* Parses text from a string according to a specified format.
  - *Depends on:* An input string and a format string.
  - *Connects to:* Called by `parse_request`, modifies passed string buffers.
  - *Shape:* Internal implementation detail for parsing text.
- **`snprintf`**
  - *What it is:* A C standard library function for formatting output to a string buffer with bounds checking.
  - *Implementation:* `int snprintf(char *str, size_t size, const char *format, ...);`
  - *Its use:* To safely format file paths and HTTP response headers without buffer overflows.
  - *Type:* Standard C Library function.
  - *Responsibility:* Writes formatted data to a string buffer up to a specified size.
  - *Depends on:* A destination buffer, maximum size, and format arguments.
  - *Connects to:* Called by `uri_to_path`, `send_error`, and `serve_static`.
  - *Shape:* Internal implementation detail for string construction.
- **`stat`**
  - *What it is:* A POSIX function for retrieving file attributes.
  - *Implementation:* `int stat(const char *pathname, struct stat *statbuf);`
  - *Its use:* To check if a requested file exists, is a regular file, and get its size.
  - *Type:* POSIX system call wrapper.
  - *Responsibility:* Retrieves filesystem metadata for a specified path.
  - *Depends on:* A valid file path and a pointer to a `struct stat` to populate.
  - *Connects to:* Called by `serve_static`.
  - *Shape:* System interface for accessing the filesystem.
- **`open`**
  - *What it is:* A POSIX function to open and possibly create a file.
  - *Implementation:* `int open(const char *pathname, int flags, ...);`
  - *Its use:* To obtain a file descriptor for reading the requested file.
  - *Type:* POSIX system call wrapper.
  - *Responsibility:* Opens a file and returns a file descriptor.
  - *Depends on:* A valid file path and access flags.
  - *Connects to:* Called by `serve_static`.
  - *Shape:* System interface for file I/O.
- **`read` / `write`**
  - *What it is:* POSIX functions for reading from and writing to file descriptors (including sockets).
  - *Implementation:* `ssize_t read(int fd, void *buf, size_t count);`, `ssize_t write(int fd, const void *buf, size_t count);`
  - *Its use:* To receive data from the client socket and send file contents to the client socket.
  - *Type:* POSIX system call wrappers.
  - *Responsibility:* Transfers raw bytes between file descriptors and memory buffers.
  - *Depends on:* An open file descriptor, a memory buffer, and a byte count.
  - *Connects to:* Used throughout `handle_client` and `serve_static`.
  - *Shape:* System interface for I/O.
- **`pthread_create`**
  - *What it is:* A POSIX thread function to create a new thread.
  - *Implementation:* `int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);`
  - *Its use:* To spawn a new independent thread for each incoming client connection.
  - *Type:* POSIX threads library function.
  - *Responsibility:* Creates a new execution context running the specified function.
  - *Depends on:* A thread identifier pointer, attributes, a start function, and an argument pointer.
  - *Connects to:* Called by the main loop, starts `client_thread`.
  - *Shape:* System interface for concurrency.
- **`pthread_detach`**
  - *What it is:* A POSIX thread function to detach a thread.
  - *Implementation:* `int pthread_detach(pthread_t thread);`
  - *Its use:* To allow a spawned thread to release its resources automatically when it terminates.
  - *Type:* POSIX threads library function.
  - *Responsibility:* Marks a thread as detached so its resources are freed without requiring a join.
  - *Depends on:* A valid thread identifier.
  - *Connects to:* Called by the main loop immediately after thread creation.
  - *Shape:* System interface for concurrency management.

## Concept Unit: HTTP/1.0 request/response format
### The Problem
How does a web server know what a client wants, and how does it send it back? 
What happens if we receive a request string like `GET /index.html HTTP/1.0`? How do we break it down into usable pieces? 
If you had to read this string from a socket, what standard C function might you use to extract the three parts?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main() {
    char method[16], uri[256], version[16];
    const char *line = "GET /index.html HTTP/1.0\r\n";
    int matched = sscanf(line, "%15s %255s %15s", method, uri, version);
    printf("Matched: %d\n", matched);
    printf("Method: %s\n", method);
    printf("URI: %s\n", uri);
    printf("Version: %s\n", version);
    return 0;
}
```
Output:
```
Matched: 3
Method: GET
URI: /index.html
Version: HTTP/1.0
```
This proves that `sscanf` can read space-separated tokens from a string. It stops at `\r` (not a space) so `version` cleanly gets "HTTP/1.0". This introduces the **HTTP Parser** concept.

### Discard the throwaway
This isolated parsing test is discarded and will not appear in the real project code.

### Project Change
- **Reference Source**: None - this is a from-scratch addition.
- **Files affected**: `server.c` (created)
- **Change type**: Add
- **Location**: Top of the file.
- **Dependencies**: None.

### The New Code
```c
/* server.c - concurrent HTTP/1.0 server */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <pthread.h>

#define PORT      8080
#define BUFSIZE   8192
#define MAXPATH   256
#define DOCROOT   "/tmp/www"   /* serve files from here */

/* Parse first line of HTTP request: "METHOD URI VERSION\r\n" */
/* Returns 1 on success, 0 on parse error */
int parse_request(char *line, char *method, char *uri, char *version) {
    return sscanf(line, "%15s %255s %15s", method, uri, version) == 3;
}
```

### The Updated Project
```c
1: /* server.c - concurrent HTTP/1.0 server */ // ← new
2: #include <stdio.h> // ← new
3: #include <stdlib.h> // ← new
4: #include <string.h> // ← new
5: #include <unistd.h> // ← new
6: #include <sys/socket.h> // ← new
7: #include <netinet/in.h> // ← new
8: #include <arpa/inet.h> // ← new
9: #include <sys/stat.h> // ← new
10: #include <fcntl.h> // ← new
11: #include <pthread.h> // ← new
12: 
13: #define PORT      8080 // ← new
14: #define BUFSIZE   8192 // ← new
15: #define MAXPATH   256 // ← new
16: #define DOCROOT   "/tmp/www"   /* serve files from here */ // ← new
17: 
18: /* Parse first line of HTTP request: "METHOD URI VERSION\r\n" */ // ← new
19: /* Returns 1 on success, 0 on parse error */ // ← new
20: int parse_request(char *line, char *method, char *uri, char *version) { // ← new
21:     return sscanf(line, "%15s %255s %15s", method, uri, version) == 3; // ← new
22: } // ← new
```
This sets up the foundations of the file and provides a utility function to parse the incoming HTTP request line.

### Mechanical walkthrough
- `#include` directives load necessary C standard library and POSIX headers.
- `#define PORT 8080` defines the network port the server will listen on.
- `#define BUFSIZE 8192` specifies the size for read/write buffers.
- `#define MAXPATH 256` defines the maximum allowed length for file paths.
- `#define DOCROOT "/tmp/www"` sets the base directory from which static files are served.
- `int parse_request(char *line, char *method, char *uri, char *version)` declares a function returning an integer, taking four char pointers.
- `return sscanf(line, "%15s %255s %15s", method, uri, version) == 3;` calls `sscanf` to extract the method, uri, and version up to a maximum number of characters to prevent buffer overflows. The return value is compared against `3` to return a 1 (true) if all three were successfully read, or 0 (false) otherwise.

### CS lens
The concept here is **Parsing and Protocol Standards**. Protocols are fundamentally string formats that must be consistently structured. This appears in:
- Web browsers reading HTML.
- Compilers parsing source code.
- Email clients interpreting IMAP headers.
- Network routers inspecting packet headers.

### SE lens
The design principle here is **Separation of Concerns**. We isolate parsing the HTTP request line into its own `parse_request` function rather than mixing the string manipulation directly into the network reading loop. The alternative is inline parsing. The real tradeoff is a marginal cost of a function call overhead for much better readability and the ability to unit-test the parsing logic independently.

### Commands needed
None

### Run it
The parser confidently evaluates to returning 1 for valid HTTP GET strings, and 0 for malformed strings. Output is predicted without a run.

### One sentence connecting to previous unit
With the ability to parse the incoming request, we now need to map that request to actual files on disk and format HTTP responses.

## Concept Unit: Connection handling — read request, send response
### The Problem
How do we convert a URL requested by a browser (like `/about.html`) into a file path on our local server?
If a user just visits `/`, how do we serve `index.html`?
How do we tell a browser what type of file it is receiving, or format an error message if the file doesn't exist?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <string.h>

void uri_to_path(char *uri, char *path) {
    snprintf(path, 256, "/tmp/www%s", uri);
    if (path[strlen(path)-1] == '/')
        strncat(path, "index.html", 256 - strlen(path) - 1);
}

int main() {
    char path[256];
    uri_to_path("/test/", path);
    printf("Path is: %s\n", path);
    return 0;
}
```
Output:
```
Path is: /tmp/www/test/index.html
```
This proves that we can concatenate a base document root with a requested URI, and intelligently append an index file if the requested URI is a directory. This introduces the **URI Mapping** concept.

### Discard the throwaway
This throwaway test is discarded and will not appear in the real project code.

### Project Change
- **Reference Source**: None - this is a from-scratch addition.
- **Files affected**: `server.c` (modified)
- **Change type**: Add
- **Location**: After `parse_request`.
- **Dependencies**: None.

### The New Code
```c
/* Map a URI to a file path */
void uri_to_path(char *uri, char *path) {
    snprintf(path, MAXPATH, "%s%s", DOCROOT, uri);
    /* If URI ends in '/', serve index.html */
    if (path[strlen(path)-1] == '/')
        strncat(path, "index.html", MAXPATH - strlen(path) - 1);
}

/* Determine MIME type from file extension */
const char *mime_type(const char *path) {
    const char *ext = strrchr(path, '.');
    if (!ext) return "application/octet-stream";
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".css")  == 0) return "text/css";
    if (strcmp(ext, ".js")   == 0) return "application/javascript";
    if (strcmp(ext, ".png")  == 0) return "image/png";
    if (strcmp(ext, ".txt")  == 0) return "text/plain";
    return "application/octet-stream";
}

/* Send an HTTP error response */
void send_error(int connfd, int code, const char *msg) {
    char buf[BUFSIZE];
    int n = snprintf(buf, sizeof(buf),
        "HTTP/1.0 %d %s\r\n"
        "Content-Type: text/html\r\n"
        "Content-Length: %zu\r\n"
        "\r\n"
        "<html><body><h1>%d %s</h1></body></html>",
        code, msg, strlen(msg) + 36, code, msg);
    write(connfd, buf, n);
}
```

### The Updated Project
```c
1: /* server.c - concurrent HTTP/1.0 server */ 
2: #include <stdio.h> 
3: #include <stdlib.h> 
4: #include <string.h> 
5: #include <unistd.h> 
6: #include <sys/socket.h> 
7: #include <netinet/in.h> 
8: #include <arpa/inet.h> 
9: #include <sys/stat.h> 
10: #include <fcntl.h> 
11: #include <pthread.h> 
12: 
13: #define PORT      8080 
14: #define BUFSIZE   8192 
15: #define MAXPATH   256 
16: #define DOCROOT   "/tmp/www"   /* serve files from here */ 
17: 
18: /* Parse first line of HTTP request: "METHOD URI VERSION\r\n" */ 
19: /* Returns 1 on success, 0 on parse error */ 
20: int parse_request(char *line, char *method, char *uri, char *version) { 
21:     return sscanf(line, "%15s %255s %15s", method, uri, version) == 3; 
22: } 
23: 
24: /* Map a URI to a file path */ // ← new
25: void uri_to_path(char *uri, char *path) { // ← new
26:     snprintf(path, MAXPATH, "%s%s", DOCROOT, uri); // ← new
27:     /* If URI ends in '/', serve index.html */ // ← new
28:     if (path[strlen(path)-1] == '/') // ← new
29:         strncat(path, "index.html", MAXPATH - strlen(path) - 1); // ← new
30: } // ← new
31: 
32: /* Determine MIME type from file extension */ // ← new
33: const char *mime_type(const char *path) { // ← new
34:     const char *ext = strrchr(path, '.'); // ← new
35:     if (!ext) return "application/octet-stream"; // ← new
36:     if (strcmp(ext, ".html") == 0) return "text/html"; // ← new
37:     if (strcmp(ext, ".css")  == 0) return "text/css"; // ← new
38:     if (strcmp(ext, ".js")   == 0) return "application/javascript"; // ← new
39:     if (strcmp(ext, ".png")  == 0) return "image/png"; // ← new
40:     if (strcmp(ext, ".txt")  == 0) return "text/plain"; // ← new
41:     return "application/octet-stream"; // ← new
42: } // ← new
43: 
44: /* Send an HTTP error response */ // ← new
45: void send_error(int connfd, int code, const char *msg) { // ← new
46:     char buf[BUFSIZE]; // ← new
47:     int n = snprintf(buf, sizeof(buf), // ← new
48:         "HTTP/1.0 %d %s\r\n" // ← new
49:         "Content-Type: text/html\r\n" // ← new
50:         "Content-Length: %zu\r\n" // ← new
51:         "\r\n" // ← new
52:         "<html><body><h1>%d %s</h1></body></html>", // ← new
53:         code, msg, strlen(msg) + 36, code, msg); // ← new
54:     write(connfd, buf, n); // ← new
55: } // ← new
```
This adds utility functions that prepare the server to map network resources to local paths and appropriately format responses and errors.

### Mechanical walkthrough
- `void uri_to_path(char *uri, char *path)` takes an incoming URI string and an output path buffer.
- `snprintf(path, MAXPATH, "%s%s", DOCROOT, uri);` formats the document root and URI into the `path` buffer, ensuring it doesn't exceed `MAXPATH`.
- `if (path[strlen(path)-1] == '/')` checks if the last character of the resulting path is a slash.
- `strncat(path, "index.html", MAXPATH - strlen(path) - 1);` safely appends "index.html" to the path if it was a directory.
- `const char *mime_type(const char *path)` returns a constant string denoting the MIME type based on file extension.
- `const char *ext = strrchr(path, '.');` searches for the last occurrence of a period in the path string to find the extension.
- `if (!ext) return "application/octet-stream";` returns a default binary type if there is no extension.
- `if (strcmp(ext, ".html") == 0) return "text/html";` and subsequent lines map explicit text strings to explicit MIME type strings.
- `void send_error(int connfd, int code, const char *msg)` takes a socket descriptor, a numeric HTTP status code, and a text message.
- `char buf[BUFSIZE];` creates a local buffer to hold the response text.
- `int n = snprintf(...)` formats the HTTP error response header and HTML body payload into the buffer, utilizing `strlen(msg) + 36` to dynamically set the `Content-Length`.
- `write(connfd, buf, n);` transmits the error text back out over the socket.

### CS lens
The concept here is **Content Negotiation and Error Handling**. This appears in:
- REST API frameworks converting objects to JSON or XML based on headers.
- File managers determining which icon to show for a file.
- Operating systems associating default apps with file extensions.

### SE lens
The design principle here is **Fail-Safe Defaults**. `mime_type` falls back to returning `application/octet-stream` (a generic, downloadable byte array). The alternative is crashing or serving arbitrary bytes as HTML. The tradeoff is that an unknown plain-text file might prompt a download dialog rather than rendering in the browser, but it is vastly more secure than tricking the browser into running unknown files as scripts.

### Commands needed
None

### Run it
Calling `uri_to_path("/index.html", path)` confidently modifies `path` to `"/tmp/www/index.html"`. `send_error(connfd, 404, "Not Found")` accurately formats an HTTP 404 response with HTML and writes it to the socket.

### One sentence connecting to previous unit
With resource paths resolved, we need to read the actual file from disk and stream its contents back to the client socket.

## Concept Unit: Serving a static file
### The Problem
How do we verify a file actually exists and read its size before attempting to open it?
How do we send a large file without reading the entire thing into memory at once?
What if the client does not have permissions to read a specific file on our server?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <sys/stat.h>

int main() {
    struct stat st;
    if (stat("/etc/hosts", &st) == 0 && S_ISREG(st.st_mode)) {
        printf("Size: %lld bytes\n", (long long)st.st_size);
    }
    return 0;
}
```
Output:
```
Size: 153 bytes
```
This proves that the `stat` system call successfully retrieves filesystem metadata (like file size and mode) without opening the file for reading. This introduces the **File Metadata** concept.

### Discard the throwaway
This throwaway test code is discarded and will not be used in the real project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `server.c` (modified)
- **Change type**: Add
- **Location**: After `send_error`.
- **Dependencies**: None.

### The New Code
```c
void serve_static(int connfd, char *path) {
    /* Get file size */
    struct stat st;
    if (stat(path, &st) < 0 || !S_ISREG(st.st_mode)) {
        send_error(connfd, 404, "Not Found");
        return;
    }

    /* Open the file */
    int filefd = open(path, O_RDONLY);
    if (filefd < 0) {
        send_error(connfd, 403, "Forbidden");
        return;
    }

    /* Send HTTP response headers */
    char headers[BUFSIZE];
    int hlen = snprintf(headers, sizeof(headers),
        "HTTP/1.0 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %lld\r\n"
        "\r\n",
        mime_type(path), (long long)st.st_size);
    write(connfd, headers, hlen);

    /* Send file contents */
    char buf[BUFSIZE];
    ssize_t n;
    while ((n = read(filefd, buf, sizeof(buf))) > 0)
        write(connfd, buf, n);  /* Note: should use rio_writen for robustness */
    close(filefd);
}
```

### The Updated Project
```c
1: /* server.c - concurrent HTTP/1.0 server */ 
...
44: /* Send an HTTP error response */ 
45: void send_error(int connfd, int code, const char *msg) { 
46:     char buf[BUFSIZE]; 
47:     int n = snprintf(buf, sizeof(buf), 
48:         "HTTP/1.0 %d %s\r\n" 
49:         "Content-Type: text/html\r\n" 
50:         "Content-Length: %zu\r\n" 
51:         "\r\n" 
52:         "<html><body><h1>%d %s</h1></body></html>", 
53:         code, msg, strlen(msg) + 36, code, msg); 
54:     write(connfd, buf, n); 
55: } 
56: 
57: void serve_static(int connfd, char *path) { // ← new
58:     /* Get file size */ // ← new
59:     struct stat st; // ← new
60:     if (stat(path, &st) < 0 || !S_ISREG(st.st_mode)) { // ← new
61:         send_error(connfd, 404, "Not Found"); // ← new
62:         return; // ← new
63:     } // ← new
64: 
65:     /* Open the file */ // ← new
66:     int filefd = open(path, O_RDONLY); // ← new
67:     if (filefd < 0) { // ← new
68:         send_error(connfd, 403, "Forbidden"); // ← new
69:         return; // ← new
70:     } // ← new
71: 
72:     /* Send HTTP response headers */ // ← new
73:     char headers[BUFSIZE]; // ← new
74:     int hlen = snprintf(headers, sizeof(headers), // ← new
75:         "HTTP/1.0 200 OK\r\n" // ← new
76:         "Content-Type: %s\r\n" // ← new
77:         "Content-Length: %lld\r\n" // ← new
78:         "\r\n", // ← new
79:         mime_type(path), (long long)st.st_size); // ← new
80:     write(connfd, headers, hlen); // ← new
81: 
82:     /* Send file contents */ // ← new
83:     char buf[BUFSIZE]; // ← new
84:     ssize_t n; // ← new
85:     while ((n = read(filefd, buf, sizeof(buf))) > 0) // ← new
86:         write(connfd, buf, n);  /* Note: should use rio_writen for robustness */ // ← new
87:     close(filefd); // ← new
88: } // ← new
```
This is the core function that streams the disk file to the client, handling access checking and file reading in chunks.

### Mechanical walkthrough
- `void serve_static(int connfd, char *path)` receives the client socket descriptor and the resolved file path.
- `struct stat st;` declares a local variable to hold filesystem attributes.
- `if (stat(path, &st) < 0 || !S_ISREG(st.st_mode))` calls `stat` to fetch the file metadata. If it fails, or if the path is not a regular file (e.g. it is a directory), it proceeds to the error branch.
- `send_error(connfd, 404, "Not Found");` sends a 404 error across the network.
- `return;` exits the function early.
- `int filefd = open(path, O_RDONLY);` opens the path strictly for reading, acquiring a file descriptor.
- `if (filefd < 0)` checks if `open` failed (e.g., due to file permissions).
- `send_error(connfd, 403, "Forbidden");` sends a 403 error across the network.
- `char headers[BUFSIZE];` creates a local buffer for outgoing HTTP headers.
- `int hlen = snprintf(headers, sizeof(headers), "...", mime_type(path), (long long)st.st_size);` formats the HTTP response starting line, `Content-Type`, and `Content-Length`. The length is retrieved from the `stat` struct's `st_size` property.
- `write(connfd, headers, hlen);` transmits the HTTP headers over the socket.
- `char buf[BUFSIZE];` allocates a new chunked buffer for the file payload.
- `ssize_t n;` declares a variable for tracking bytes read.
- `while ((n = read(filefd, buf, sizeof(buf))) > 0)` reads up to `BUFSIZE` bytes from the opened file descriptor into `buf`. It stops when `read` returns 0 (End Of File) or less than 0 (error).
- `write(connfd, buf, n);` transmits the read bytes directly out to the socket descriptor.
- `close(filefd);` closes the local file descriptor after all content is transmitted.

### CS lens
The concept here is **Buffered I/O**. Streaming data in chunks allows a system to process large volumes without exhausting memory. This appears in:
- Audio and video streaming services.
- Database cursor fetching.
- Unix pipes passing output between tools.

### SE lens
The design principle here is **Fail-Fast Early Returns**. By checking file metadata using `stat` and `open` at the top of the function and returning immediately upon error, we avoid nesting the successful file reading logic inside deeply indented `if` statements. The alternative is writing a massive "if success, then all code" block. The tradeoff is managing multiple exit points in a function, but it keeps the "happy path" logic flush against the left margin.

### Commands needed
None

### Run it
The loop confidently reads data from a local file descriptor and writes it sequentially to a socket file descriptor, preserving structure and limiting memory consumption to 8KB per loop. Output is predicted without a run.

### One sentence connecting to previous unit
Now that we can parse a request and stream a static file, we must orchestrate the entire lifecycle of a single HTTP transaction.

## Concept Unit: handle_client — full request handling per connection
### The Problem
How do we orchestrate reading the request string from the network socket in real time? 
What do we do with the extra HTTP header lines that the browser sends after the initial `GET` line?
How do we tie parsing, mapping, and file-serving together?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <string.h>

int main() {
    char buf[1024];
    strcpy(buf, "GET / HTTP/1.0\r\nHost: localhost\r\n\r\n");
    if (strstr(buf, "\r\n\r\n")) {
        printf("End of HTTP headers found.\n");
    }
    return 0;
}
```
Output:
```
End of HTTP headers found.
```
This demonstrates how `strstr` locates a substring within a larger string, which is crucial for finding the standard empty line (`\r\n\r\n`) that terminates HTTP headers. This introduces the **Protocol Delimiter** concept.

### Discard the throwaway
This throwaway string manipulation code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `server.c` (modified)
- **Change type**: Add
- **Location**: After `serve_static`.
- **Dependencies**: None.

### The New Code
```c
void handle_client(int connfd) {
    char buf[BUFSIZE];
    char method[16], uri[256], version[16], path[MAXPATH];

    /* Read first line of request */
    int total = 0;
    /* Read byte-by-byte until \r\n (simplified) */
    char *p = buf;
    while (total < BUFSIZE - 1) {
        ssize_t n = read(connfd, p, 1);
        if (n <= 0) { close(connfd); return; }
        total++;
        if (total >= 2 && p[-1] == '\r' && p[0] == '\n') break;
        p++;
    }
    *p = '\0';

    if (!parse_request(buf, method, uri, version)) {
        send_error(connfd, 400, "Bad Request");
        close(connfd);
        return;
    }

    /* Drain remaining headers (read until empty line) */
    while (1) {
        ssize_t n = read(connfd, buf, BUFSIZE);
        if (n <= 0) break;
        if (strstr(buf, "\r\n\r\n")) break;  /* end of headers */
    }

    /* Only handle GET */
    if (strcmp(method, "GET") != 0) {
        send_error(connfd, 501, "Not Implemented");
        close(connfd);
        return;
    }

    uri_to_path(uri, path);
    serve_static(connfd, path);
    close(connfd);
}
```

### The Updated Project
```c
1: /* server.c - concurrent HTTP/1.0 server */ 
...
87:     close(filefd); 
88: } 
89: 
90: void handle_client(int connfd) { // ← new
91:     char buf[BUFSIZE]; // ← new
92:     char method[16], uri[256], version[16], path[MAXPATH]; // ← new
93: 
94:     /* Read first line of request */ // ← new
95:     int total = 0; // ← new
96:     /* Read byte-by-byte until \r\n (simplified) */ // ← new
97:     char *p = buf; // ← new
98:     while (total < BUFSIZE - 1) { // ← new
99:         ssize_t n = read(connfd, p, 1); // ← new
100:         if (n <= 0) { close(connfd); return; } // ← new
101:         total++; // ← new
102:         if (total >= 2 && p[-1] == '\r' && p[0] == '\n') break; // ← new
103:         p++; // ← new
104:     } // ← new
105:     *p = '\0'; // ← new
106: 
107:     if (!parse_request(buf, method, uri, version)) { // ← new
108:         send_error(connfd, 400, "Bad Request"); // ← new
109:         close(connfd); // ← new
110:         return; // ← new
111:     } // ← new
112: 
113:     /* Drain remaining headers (read until empty line) */ // ← new
114:     while (1) { // ← new
115:         ssize_t n = read(connfd, buf, BUFSIZE); // ← new
116:         if (n <= 0) break; // ← new
117:         if (strstr(buf, "\r\n\r\n")) break;  /* end of headers */ // ← new
118:     } // ← new
119: 
120:     /* Only handle GET */ // ← new
121:     if (strcmp(method, "GET") != 0) { // ← new
122:         send_error(connfd, 501, "Not Implemented"); // ← new
123:         close(connfd); // ← new
124:         return; // ← new
125:     } // ← new
126: 
127:     uri_to_path(uri, path); // ← new
128:     serve_static(connfd, path); // ← new
129:     close(connfd); // ← new
130: } // ← new
```
This is the connection entry point which orchestrates reading, parsing, and satisfying the HTTP transaction.

### Mechanical walkthrough
- `void handle_client(int connfd)` takes the connected socket file descriptor.
- `char buf[BUFSIZE];` creates a character buffer for network reads.
- `char method[16], uri[256], version[16], path[MAXPATH];` allocates character arrays for the parsed HTTP request pieces.
- `int total = 0;` initializes a counter for bytes read on the first line.
- `char *p = buf;` sets up a pointer to the start of the read buffer.
- `while (total < BUFSIZE - 1)` begins a loop to read bytes, protecting against buffer overflows.
- `ssize_t n = read(connfd, p, 1);` reads a single byte from the socket into the pointer's memory location.
- `if (n <= 0) { close(connfd); return; }` checks for connection drop or error, closing the socket and returning.
- `total++;` increments the total bytes tracked.
- `if (total >= 2 && p[-1] == '\r' && p[0] == '\n') break;` checks if the last two bytes were the Carriage Return (`\r`) and Line Feed (`\n`). If so, we break the loop because we found the end of the first line.
- `p++;` advances the pointer to the next memory address.
- `*p = '\0';` null-terminates the buffer string.
- `if (!parse_request(buf, method, uri, version))` calls the parser logic.
- `send_error(connfd, 400, "Bad Request");` issues a 400 response if the string did not parse correctly.
- `close(connfd);` and `return;` shut down the broken connection.
- `while (1)` opens a loop to ignore the remainder of the HTTP request headers.
- `ssize_t n = read(connfd, buf, BUFSIZE);` reads large blocks of the leftover data.
- `if (n <= 0) break;` halts draining if the stream ends or errors.
- `if (strstr(buf, "\r\n\r\n")) break;` scans the buffer for the HTTP header terminator; breaking out if found.
- `if (strcmp(method, "GET") != 0)` confirms the method is strictly `GET`.
- `send_error(connfd, 501, "Not Implemented");` transmits a 501 error if it's something like `POST`.
- `uri_to_path(uri, path);` transforms the parsed URI into a local path.
- `serve_static(connfd, path);` passes the path along to be fetched and sent over the socket.
- `close(connfd);` fully closes the socket interaction when finished.

### CS lens
The concept here is **State Machine / Orchestration**. This function drives the request through a series of discrete states: reading line, parsing, draining headers, checking methods, and dispatching. This appears in:
- Language interpreters matching AST nodes.
- GUI event loops routing clicks.
- CI/CD pipelines executing deployment steps.

### SE lens
The design principle here is **Delegation of Responsibility**. `handle_client` knows nothing about file access permissions or header formatting. It merely reads enough to coordinate other functions. The alternative is putting all file and HTTP logic in one mega-function. The tradeoff is adding cognitive jumps between functions, but drastically decreasing complexity within any single function.

### Commands needed
None

### Run it
Calling `handle_client` with a valid HTTP GET string will orchestrate reading the first line, extracting the HTTP pieces, validating it's a GET, determining the file location, and streaming the file contents out. Output is predicted without a run.

### One sentence connecting to previous unit
The final piece needed to make this server functional and resilient is to actively listen for incoming connections and handle them concurrently.

## Concept Unit: main — listen loop with pthreads
### The Problem
If a server is handling a slow network connection, how does it process other connections simultaneously?
How do we accept connections and hand them off without getting stuck on one client?
How do we use operating system threads in C to solve this?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

void *worker(void *arg) {
    int id = *(int *)arg;
    printf("Worker %d running in background\n", id);
    return NULL;
}

int main() {
    pthread_t tid;
    int worker_id = 42;
    pthread_create(&tid, NULL, worker, &worker_id);
    pthread_join(tid, NULL);
    printf("Main thread finished\n");
    return 0;
}
```
Output:
```
Worker 42 running in background
Main thread finished
```
This demonstrates starting a concurrent thread with `pthread_create`, passing it a state value (42), and executing code alongside the main program sequence. This introduces the **Concurrency** concept.

### Discard the throwaway
This threading isolation example is discarded and will not be in the server code.

### Project Change
- **Reference Source**: None.
- **Files affected**: `server.c` (modified)
- **Change type**: Add
- **Location**: Bottom of the file.
- **Dependencies**: The `pthread` library.

### The New Code
```c
void *client_thread(void *arg) {
    int connfd = *(int *)arg;
    free(arg);
    handle_client(connfd);
    return NULL;
}

int main(void) {
    /* Create listen socket */
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(PORT);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));
    listen(listenfd, 10);
    printf("Serving %s on port %d\n", DOCROOT, PORT);
    printf("Test: curl http://localhost:%d/index.html\n", PORT);

    /* Create doc root if needed */
    mkdir(DOCROOT, 0755);

    while (1) {
        struct sockaddr_in cli = {0};
        socklen_t clilen = sizeof(cli);
        int connfd = accept(listenfd, (struct sockaddr*)&cli, &clilen);
        if (connfd < 0) continue;
        printf("Connection from %s\n", inet_ntoa(cli.sin_addr));

        /* Spawn thread to handle this client */
        int *connfd_copy = malloc(sizeof(int));
        *connfd_copy = connfd;
        pthread_t tid;
        pthread_create(&tid, NULL, client_thread, connfd_copy);
        pthread_detach(tid);  /* thread frees itself when done */
    }
    return 0;
}
```

### The Updated Project
```c
1: /* server.c - concurrent HTTP/1.0 server */ 
...
130: } 
131: 
132: void *client_thread(void *arg) { // ← new
133:     int connfd = *(int *)arg; // ← new
134:     free(arg); // ← new
135:     handle_client(connfd); // ← new
136:     return NULL; // ← new
137: } // ← new
138: 
139: int main(void) { // ← new
140:     /* Create listen socket */ // ← new
141:     int listenfd = socket(AF_INET, SOCK_STREAM, 0); // ← new
142:     int opt = 1; // ← new
143:     setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)); // ← new
144: 
145:     struct sockaddr_in addr = {0}; // ← new
146:     addr.sin_family      = AF_INET; // ← new
147:     addr.sin_port        = htons(PORT); // ← new
148:     addr.sin_addr.s_addr = INADDR_ANY; // ← new
149:     bind(listenfd, (struct sockaddr*)&addr, sizeof(addr)); // ← new
150:     listen(listenfd, 10); // ← new
151:     printf("Serving %s on port %d\n", DOCROOT, PORT); // ← new
152:     printf("Test: curl http://localhost:%d/index.html\n", PORT); // ← new
153: 
154:     /* Create doc root if needed */ // ← new
155:     mkdir(DOCROOT, 0755); // ← new
156: 
157:     while (1) { // ← new
158:         struct sockaddr_in cli = {0}; // ← new
159:         socklen_t clilen = sizeof(cli); // ← new
160:         int connfd = accept(listenfd, (struct sockaddr*)&cli, &clilen); // ← new
161:         if (connfd < 0) continue; // ← new
162:         printf("Connection from %s\n", inet_ntoa(cli.sin_addr)); // ← new
163: 
164:         /* Spawn thread to handle this client */ // ← new
165:         int *connfd_copy = malloc(sizeof(int)); // ← new
166:         *connfd_copy = connfd; // ← new
167:         pthread_t tid; // ← new
168:         pthread_create(&tid, NULL, client_thread, connfd_copy); // ← new
169:         pthread_detach(tid);  /* thread frees itself when done */ // ← new
170:     } // ← new
171:     return 0; // ← new
172: } // ← new
```
This is the entry point that initializes the networking stack and runs an infinite loop accepting connections and farming them out to threads.

### Mechanical walkthrough
- `void *client_thread(void *arg)` defines the function pointer shape required by pthreads.
- `int connfd = *(int *)arg;` casts the void pointer to an int pointer, and dereferences it to get the socket descriptor.
- `free(arg);` immediately frees the heap memory allocated by the main thread.
- `handle_client(connfd);` delegates the work to the function we wrote earlier.
- `return NULL;` completes the thread execution cleanly.
- `int main(void)` is the program entry point.
- `int listenfd = socket(AF_INET, SOCK_STREAM, 0);` provisions a TCP socket from the OS.
- `int opt = 1; setsockopt(...)` allows the socket port to be reused immediately if the server is stopped and restarted.
- `struct sockaddr_in addr = {0};` zero-initializes the socket configuration structure.
- `addr.sin_family = AF_INET;` assigns IPv4.
- `addr.sin_port = htons(PORT);` sets the port using network byte order.
- `addr.sin_addr.s_addr = INADDR_ANY;` binds to all local network interfaces.
- `bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));` assigns the address data to the active socket.
- `listen(listenfd, 10);` instructs the OS to queue up to 10 incoming connections.
- `mkdir(DOCROOT, 0755);` attempts to create the document root directory with standard permissions.
- `while (1)` executes an infinite loop to serve indefinitely.
- `int connfd = accept(listenfd, (struct sockaddr*)&cli, &clilen);` blocks until a network connection occurs, handing off a new socket `connfd` specific to this client.
- `if (connfd < 0) continue;` gracefully handles accept failures.
- `int *connfd_copy = malloc(sizeof(int));` allocates memory dynamically to pass the file descriptor safely.
- `*connfd_copy = connfd;` copies the descriptor value.
- `pthread_t tid;` allocates space for a thread handle.
- `pthread_create(&tid, NULL, client_thread, connfd_copy);` launches a new thread passing our `client_thread` function and our allocated integer payload.
- `pthread_detach(tid);` configures the new thread to clean up its own resources without the main thread waiting for it.

### CS lens
The concept here is **Thread-per-Connection Architecture**. This maps a hardware/OS concurrency primitive to a network concurrency problem. This appears in:
- Early Apache web servers.
- Database connection pools.
- Heavyweight request processing workers in application servers.

### SE lens
The design principle here is **Data Ownership across Boundaries**. We must use `malloc` to heap-allocate the integer before passing it to `pthread_create`, rather than passing a pointer to the local `connfd` variable. The alternative is a massive race condition where `main` overwrites `connfd` for the next loop iteration before the thread gets a chance to read it. The tradeoff is remembering to invoke `free(arg)` within the thread.

### Commands needed
`gcc -O2 server.c -lpthread -o server`
`mkdir -p /tmp/www && echo '<h1>Hello</h1>' > /tmp/www/index.html`
`./server &`
`curl http://localhost:8080/index.html`

### Run it
Main initializes the socket. An incoming `curl` connects. Main allocates memory and spawns a thread. The thread parses the GET request, opens `index.html`, and writes out "<h1>Hello</h1>". 

### One sentence connecting to previous unit
The complete system is finally assembled and capable of answering real browser traffic.

## Closing
### Connect the pieces
The web server integrates every concept from Modules 4 and 5: sockets, buffered read/write logic, threads, and HTTP parsing. A full HTTP GET request travels through every function in `server.c`: it hits the `accept` in `main()`, gets passed into a detached `client_thread()`, traverses the reading and parsing bounds in `handle_client()` via `parse_request()`, translates from a network URI to a disk entity in `uri_to_path()`, checks file boundaries using `stat()`, and finally iterates reading from disk and writing to network inside `serve_static()`. This server is Apache 1.0 in miniature — the same one-thread-per-connection model served the early web, replaced only when C10K (10,000 simultaneous connections) made process-per-request too expensive.
