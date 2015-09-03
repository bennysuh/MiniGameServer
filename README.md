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

`sudo apt-get install nodejs npm`

Clone this repository:

`git clone https://github.com/swpd/MiniGameServer.git`

Change to directory:

`cd MiniGameServer`

Install necessary dependencies:

`npm install`

Run the server:

`nodejs server.js`

Everything is ready, enjoy~

## Configuration

Configuration is done by editing `lib/config.js`, each item is self-explaination.

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
    'uid'    : 42,
    'pawnId' : 1,
    'name'   : 'leo',
    'x'      : 123.4,
    'y'      : 25.6,
    'growth' : 2.5,
    'isDead' : false,
    'error'  : 0
}
```

### Command Code

* 1: login
* 2: logout
* 3: update
* 4: dead
* 5: reborn
