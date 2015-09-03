MiniGame Server
===

A simple game server powered by Node.js. It only provides limited support for:

* client connection management
* message broadcasting 
* duplicate username checking

Don't Panic! :)

## Installation

Install Node.js:

Assume you're using `Ubuntu`, fire your favourite terminal and type as follows:

`sudo apt-get install nodejs`

Clone this repository:

`git clone https://github.com/cyanmoon/MiniGameServer.git`

Switch to `node` branch:

`git checkout node`

Run the server:

`node server.js`

Everything is ready, enjoy~

## Protocol

A simple protocol is used to exchanged data between clients and server:

```
     header                body
+-----+-------------+-----------------+
| cmd | body length |      JSON       |
+-----+-------------+-----------------+
1 byte    2 bytes     variable length
```

### JSON format

```
{
    uid    : 42,
    pawnid : 1,
    name   : 'leo',
    x      : 123.4,
    y      : 25.6,
    growth : 10
}
```

### Command Code

* 1: login
* 2: logout
* 3: update
* 4: dead
