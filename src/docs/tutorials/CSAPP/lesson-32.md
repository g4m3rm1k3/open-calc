# Lesson 32: Sockets — Network Communication with the BSD Socket API

What you will build:
The reader will understand the BSD socket API for TCP/IP networking: how sockets are created, how servers bind and listen, how clients connect, and how to build a minimal TCP server and client. The transferable insight: a socket is just a file descriptor — once connected, you read() and write() to it exactly like a file. The complexity is in setup; the I/O is identical to everything we've already learned.

What you need to know first:
Lessons 00-31.

Terms used in this lesson:
**IP addresses** — A numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication. Identifies machines.
**Port numbers** — A communication endpoint identifying a specific process or network service on a machine.
**TCP/IP** — Transmission Control Protocol / Internet Protocol; the foundational communication protocols of the internet. Uses (IP, port) pairs as endpoints.
**Socket** — A software structure within a network node of a computer network that serves as an endpoint for sending and receiving data across the network.
**Network byte order** — Big-endian byte ordering used universally across the network, requiring conversion from little-endian host formats.

Objects and methods used:

**inet_aton**
- What it is: A function to convert string IP addresses to binary network byte order.
- Implementation: `int inet_aton(const char *cp, struct in_addr *inp);`
- Its use: To convert "127.0.0.1" into a machine-usable binary format for socket setup.
- Type: C standard library function.
- Responsibility: Parses human-readable IP strings into numeric values.
- Depends on: A valid null-terminated string and a pointer to an `in_addr` struct.
- Connects to: Application code setting up address structures.
- Shape: Utility function inside `<arpa/inet.h>`.

**socket**
- What it is: Creates an endpoint for communication.
- Implementation: `int socket(int domain, int type, int protocol);`
- Its use: To obtain a file descriptor representing a new socket.
- Type: System call.
- Responsibility: Allocates resources for network communication in the OS kernel.
- Depends on: Domain (e.g., AF_INET), type (e.g., SOCK_STREAM), and protocol.
- Connects to: Subsequent network calls like `bind` or `connect`.
- Shape: Kernel API boundary.

**bind**
- What it is: Assigns a local protocol address to a socket.
- Implementation: `int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);`
- Its use: To associate a server socket with a specific IP and port.
- Type: System call.
- Responsibility: Claims an endpoint so others can connect to it.
- Depends on: A valid socket descriptor and an initialized `sockaddr` struct.
- Connects to: Followed by `listen` in servers.
- Shape: Kernel API boundary.

**listen**
- What it is: Marks the socket as a passive socket that will be used to accept incoming connection requests.
- Implementation: `int listen(int sockfd, int backlog);`
- Its use: To transition a socket into a listening state for servers.
- Type: System call.
- Responsibility: Sets up the connection queue for incoming TCP connections.
- Depends on: A bound socket descriptor and a backlog queue size.
- Connects to: `accept`.
- Shape: Kernel API boundary.

**accept**
- What it is: Extracts the first connection request on the queue of pending connections.
- Implementation: `int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);`
- Its use: To retrieve a connected client socket for reading and writing.
- Type: System call.
- Responsibility: Blocks until a client connects, returning a new file descriptor for that connection.
- Depends on: A listening socket descriptor.
- Connects to: Application code that processes the connection via `read`/`write`.
- Shape: Kernel API boundary.

**connect**
- What it is: Initiates a connection on a socket.
- Implementation: `int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);`
- Its use: For a client to establish a TCP 3-way handshake with a server.
- Type: System call.
- Responsibility: Reaches out across the network to connect to a waiting server.
- Depends on: A valid client socket descriptor and the server's address.
- Connects to: Server's `accept` queue.
- Shape: Kernel API boundary.

**htons / htonl**
- What it is: Host to network byte order conversion functions.
- Implementation: `uint16_t htons(uint16_t hostshort); uint32_t htonl(uint32_t hostlong);`
- Its use: To ensure multi-byte integers (like ports and IPs) are formatted correctly for the network.
- Type: Utility macros/functions.
- Responsibility: Swaps bytes on little-endian architectures; does nothing on big-endian.
- Depends on: A 16-bit or 32-bit integer in host byte order.
- Connects to: `sockaddr` field assignments.
- Shape: Library utilities in `<arpa/inet.h>`.

## Concept Unit: IP addresses and ports — the network address space

### The Problem
How do we uniquely identify a recipient over a global network, and once we reach their machine, how do we know which program should receive our data? If you were sending a letter, what would be the equivalent of the building address versus the apartment number?

### Introduce the concept in isolation
This throwaway code proves how addresses are resolved and transformed into network formats. This introduces **network byte order conversion**.

```c
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <netdb.h>

int main(void) {
    /* Convert dotted-decimal IP to binary */
    struct in_addr addr;
    inet_aton("127.0.0.1", &addr);
    printf("127.0.0.1 in network byte order: 0x%x\n", addr.s_addr);

    /* Convert back */
    printf("back to string: %s\n", inet_ntoa(addr));

    /* Well-known ports: */
    printf("HTTP:  %d\n", 80);
    printf("HTTPS: %d\n", 443);

    /* Resolve hostname to IP */
    struct addrinfo *res;
    getaddrinfo("localhost", NULL, NULL, &res);
    char ipstr[INET6_ADDRSTRLEN];
    struct sockaddr_in *sa = (struct sockaddr_in *)res->ai_addr;
    inet_ntop(AF_INET, &sa->sin_addr, ipstr, sizeof(ipstr));
    printf("localhost -> %s\n", ipstr);
    freeaddrinfo(res);
    return 0;
}
```

### Discard the throwaway
This code is discarded. It is just to demonstrate address manipulation.

### Project Change
Reference Source: None. This is standalone theory.
Files affected: src/network.c
Change type: add
Location: top of file
Dependencies: `<arpa/inet.h>`

### The New Code
```c
struct in_addr addr;
inet_aton("127.0.0.1", &addr);
```

### The Updated Project
```c
1: #include <arpa/inet.h>
2: 
3: void init_network() {
4:     struct in_addr addr; // <- new
5:     inet_aton("127.0.0.1", &addr); // <- new
6: }
```
This structure initializes our baseline address parsing.

### Mechanical walkthrough
- `struct in_addr addr;`: Declares a struct to hold an IP address.
- `inet_aton`: Function to convert ASCII string to network byte order binary.
- `"127.0.0.1"`: The loopback IP address string.
- `&addr`: Pointer to our struct to receive the parsed output.

### CS lens
Addressing and Namespaces. In distributed systems, entities need unique identifiers (IPs) and sub-identifiers (Ports). Similar to memory addresses in RAM, inodes in filesystems, and URLs in web architecture.

### SE lens
Separation of concerns. We use a function (`inet_aton`) rather than manually bit-shifting strings. Tradeoff: Function call overhead vs manual parsing errors. We chose safety.

### Commands needed
`ping 127.0.0.1`

### Run it
Predicted confidently: `127.0.0.1 in network byte order: 0x100007f` followed by `back to string: 127.0.0.1` and `localhost -> 127.0.0.1`.

### One sentence connecting to previous unit
Now that we have network addresses in memory, we can create the actual socket endpoint to use them.

## Concept Unit: socket(), bind(), listen(), accept() — the server side

### The Problem
How does an operating system know that a specific process wants to receive network traffic for a specific port? Without this, how would incoming TCP packets be routed to your application?

### Introduce the concept in isolation
This isolated code demonstrates how to claim a port and wait. This introduces the **passive listening socket**.

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

#define PORT 8080

int main(void) {
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr *)&addr, sizeof(addr));

    listen(listenfd, 10);
    printf("Server listening on port %d\n", PORT);
    return 0;
}
```

### Discard the throwaway
This throwaway snippet is discarded and will not be in the final project.

### Project Change
Reference Source: None.
Files affected: src/server.c
Change type: add
Location: main function
Dependencies: sys/socket.h

### The New Code
```c
int listenfd = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in addr = {0};
addr.sin_family = AF_INET;
addr.sin_port = htons(8080);
addr.sin_addr.s_addr = INADDR_ANY;
bind(listenfd, (struct sockaddr *)&addr, sizeof(addr));
listen(listenfd, 10);
```

### The Updated Project
```c
1: int main(void) {
2:     int listenfd = socket(AF_INET, SOCK_STREAM, 0); // <- new
3:     struct sockaddr_in addr = {0}; // <- new
4:     addr.sin_family = AF_INET; // <- new
5:     addr.sin_port = htons(8080); // <- new
6:     addr.sin_addr.s_addr = INADDR_ANY; // <- new
7:     bind(listenfd, (struct sockaddr *)&addr, sizeof(addr)); // <- new
8:     listen(listenfd, 10); // <- new
9:     return 0;
10: }
```
The application now registers itself with the kernel to receive TCP connections on port 8080.

### Mechanical walkthrough
- `int listenfd`: Variable to hold the listening file descriptor.
- `socket(AF_INET, SOCK_STREAM, 0)`: Creates an IPv4 TCP socket.
- `struct sockaddr_in addr = {0};`: Zero-initializes the address structure.
- `addr.sin_family = AF_INET;`: Specifies IPv4.
- `addr.sin_port = htons(8080);`: Assigns port 8080, converted to network byte order.
- `addr.sin_addr.s_addr = INADDR_ANY;`: Binds to all available network interfaces.
- `bind(...)`: Associates the socket with the defined address and port.
- `listen(listenfd, 10)`: Tells the kernel to queue up to 10 incoming connections.

### CS lens
Resource Allocation and Registration. The OS acts as a multiplexer, handing out endpoints (sockets) and registering routing rules (bind). Seen in Pub/Sub systems, interrupt vectors, and DB listener configurations.

### SE lens
State Machine transitions. Sockets transition from created -> bound -> listening. Alternative not chosen: an API that takes all parameters in one giant call. Tradeoff: Step-by-step setup allows fine-grained error handling and options (like SO_REUSEADDR) vs API verbosity.

### Commands needed
`netstat -tlpn` or `ss -tlpn` to see listening sockets.

### Run it
Predicted confidently: The program will exit immediately after printing "Server listening...", but temporarily, the OS will have held port 8080.

### One sentence connecting to previous unit
With a server socket passively listening, we now need a client to actively connect to it.

## Concept Unit: connect() — the client side

### The Problem
How does an application reach out across the network to initiate a connection with a passive server? What information must the client provide?

### Introduce the concept in isolation
This code shows how a client initiates a TCP handshake. This introduces **active connection initiation**.

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in server;
    memset(&server, 0, sizeof(server));
    server.sin_family = AF_INET;
    server.sin_port = htons(8080);
    inet_aton("127.0.0.1", &server.sin_addr);

    connect(sockfd, (struct sockaddr *)&server, sizeof(server));
    printf("Connected to server\n");
    close(sockfd);
    return 0;
}
```

### Discard the throwaway
This client throwaway is discarded; we are building the server, not the client.

### Project Change
Reference Source: None.
Files affected: src/client_test.c
Change type: add
Location: main
Dependencies: None.

### The New Code
```c
int sockfd = socket(AF_INET, SOCK_STREAM, 0);
// ... address setup ...
connect(sockfd, (struct sockaddr *)&server, sizeof(server));
```

### The Updated Project
```c
1: int main(void) {
2:     int sockfd = socket(AF_INET, SOCK_STREAM, 0); // <- new
3:     struct sockaddr_in server = {0}; // <- new
4:     server.sin_family = AF_INET; // <- new
5:     server.sin_port = htons(8080); // <- new
6:     inet_aton("127.0.0.1", &server.sin_addr); // <- new
7:     connect(sockfd, (struct sockaddr *)&server, sizeof(server)); // <- new
8:     close(sockfd);
9:     return 0;
10: }
```
The client constructs a socket and connects it to the target IP and port.

### Mechanical walkthrough
- `int sockfd`: Client socket descriptor.
- `socket(...)`: Creates the active socket.
- `connect(...)`: Triggers the OS to send a SYN packet and complete the TCP 3-way handshake.

### CS lens
Client-Server Architecture. One side waits passively (server); the other initiates actively (client). Seen in RPC, DNS lookups, and web browsers.

### SE lens
Blocking I/O. `connect()` blocks until the handshake completes. Alternative: non-blocking connects with `select()`. Tradeoff: Blocking is vastly simpler to read and write, but halts the thread during network latency.

### Commands needed
`nc -vz 127.0.0.1 8080` (netcat)

### Run it
Predicted confidently: If the server is running, it returns "Connected to server". If not, `connect()` fails with Connection Refused.

### One sentence connecting to previous unit
Before data can flow between connected sockets, we must address how different CPUs represent binary numbers.

## Concept Unit: Network byte order — htons, htonl, ntohs, ntohl

### The Problem
If a little-endian CPU sends a 16-bit integer (like a port number) across the wire, how does a big-endian CPU on the other side interpret it correctly without scrambling the value?

### Introduce the concept in isolation
This code demonstrates the byte-swapping macros. This introduces **Endianness normalization**.

```c
#include <arpa/inet.h>
#include <stdio.h>

int main(void) {
    unsigned short port = 8080;
    printf("port host order:    0x%04x\n", port);
    printf("port network order: 0x%04x\n", htons(port));
    return 0;
}
```

### Discard the throwaway
This snippet is discarded.

### Project Change
Reference Source: None.
Files affected: src/server.c
Change type: modify
Location: port assignment
Dependencies: None.

### The New Code
```c
addr.sin_port = htons(PORT);
```

### The Updated Project
```c
1: #define PORT 8080
2: void setup() {
3:     struct sockaddr_in addr;
4:     addr.sin_port = htons(PORT); // <- new
5: }
```
We enforce that our configuration integers are serialized correctly for the TCP headers.

### Mechanical walkthrough
- `addr.sin_port`: The port field of the structure.
- `htons(PORT)`: Host-To-Network-Short. Swaps bytes if the host is little-endian.

### CS lens
Data Representation and Endianness. Hardware diversity requires a standardized wire protocol. Seen in file formats (like PNG chunks), JVM bytecode, and RPC serialization (Protobuf).

### SE lens
Convention over configuration. The Internet protocol suite strictly mandated big-endian. Alternative: sending a byte-order mark (BOM) per packet. Tradeoff: Mandated format saves bandwidth but requires conversion overhead on x86 machines.

### Commands needed
None specifically.

### Run it
Predicted confidently: `port host order: 0x1f90`, `port network order: 0x901f`.

### One sentence connecting to previous unit
Now that addresses, sockets, connections, and endianness are solved, we can finally build a fully functional server.

## Concept Unit: A complete minimal HTTP server

### The Problem
How do we continually serve data to multiple clients over time, translating network connections into standard read/write operations?

### Introduce the concept in isolation
This is the complete loop. This introduces the **accept loop**.

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

#define PORT 8080

int main(void) {
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenfd, (struct sockaddr *)&addr, sizeof(addr));
    listen(listenfd, 5);

    while (1) {
        int connfd = accept(listenfd, NULL, NULL);
        char req[4096];
        read(connfd, req, sizeof(req) - 1);
        const char *resp = "HTTP/1.0 200 OK\r\n\r\nHello, World!";
        write(connfd, resp, strlen(resp));
        close(connfd);
    }
    return 0;
}
```

### Discard the throwaway
This code is discarded, but conceptually this structure forms our final server.

### Project Change
Reference Source: None.
Files affected: src/server.c
Change type: replace
Location: main loop
Dependencies: listen setup.

### The New Code
```c
while (1) {
    int connfd = accept(listenfd, NULL, NULL);
    char req[4096];
    read(connfd, req, sizeof(req) - 1);
    const char *resp = "HTTP/1.0 200 OK\r\n\r\nHello, World!";
    write(connfd, resp, strlen(resp));
    close(connfd);
}
```

### The Updated Project
```c
1: int main(void) {
2:     // ... listen setup ...
3:     while (1) { // <- new
4:         int connfd = accept(listenfd, NULL, NULL); // <- new
5:         char req[4096]; // <- new
6:         read(connfd, req, sizeof(req) - 1); // <- new
7:         const char *resp = "HTTP/1.0 200 OK\r\n\r\nHello, World!"; // <- new
8:         write(connfd, resp, strlen(resp)); // <- new
9:         close(connfd); // <- new
10:     } // <- new
11:     return 0;
12: }
```
The server now indefinitely waits for clients, reads their requests, sends a fixed HTTP response, and disconnects.

### Mechanical walkthrough
- `while (1)`: Infinite event loop.
- `int connfd = accept(listenfd, NULL, NULL)`: Blocks until a client arrives, returning a new file descriptor (`connfd`) distinct from the listening socket.
- `char req[4096]`: Buffer to hold the incoming HTTP request.
- `read(connfd, req, sizeof(req) - 1)`: Reads bytes from the network into the buffer. Note: treating a socket just like a file.
- `const char *resp = ...`: Hardcoded HTTP payload.
- `write(connfd, resp, strlen(resp))`: Writes bytes to the network.
- `close(connfd)`: Closes this specific client connection (TCP FIN). `listenfd` remains open.

### CS lens
Event Loops and File Descriptors. In Unix, "everything is a file." A connected socket implements the standard VFS (Virtual File System) interface, meaning `read` and `write` work seamlessly on network hardware.

### SE lens
Iterative Server. This server processes one client at a time sequentially. Alternative: concurrent servers using `fork()` or threads. Tradeoff: Iterative is incredibly simple and bug-free for setup, but terrible for throughput if any request blocks.

### Commands needed
`curl http://localhost:8080/`

### Run it
Predicted confidently: curl will output `Hello, World!`.

### One sentence connecting to previous unit
The accept loop unifies listening sockets, accepted connections, and standard Unix I/O into a complete networked application.

## Closing
### Connect the pieces
When `curl` is executed, it resolves `localhost`, creates a socket, and calls `connect()`. Our server, blocked in `accept()`, wakes up and returns a new connected file descriptor. The client writes its HTTP GET request, which the server drains using `read()`. The server formulates an HTTP response string and sends it out over the wire with `write()`, closing the socket descriptor immediately after, which gracefully tears down the TCP connection. Module 4 complete. You can now build networked C programs. Module 5 begins with Lesson 33 — Robust I/O, which handles the short-count problem correctly for sockets. A socket fd after connect()/accept() is read/written identically to a file fd — the entire Unix 'everything is a file' abstraction scales to the network.
