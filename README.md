# HackBar

A browser extension for Penetration Testing.

Available on [Chrome Web Store](https://chrome.google.com/webstore/detail/hackbar/ginpbkfigcoaokgflihfhhmglmbchinc) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/firefox-hackbar).

## Requested Permissions

- storage

  - Save theme preferences

- scripting

  - Perform POST request
  - Run test function

- webRequest

  - Remember request information
  - Listen finish event to clean up

- declarativeNetRequest
  - Set HTTP header value based on settings

## Features

- Load

  - From tab (default)
  - From cURL command

- Supported

  - HTTP methods
    - GET
    - POST
      - application/x-www-form-urlencoded
      - [multipart/form-data](#multipartform-data)
      - [application/json](#applicationjson)
  - Request editing mode
    - Basic
    - Raw
  - Custom payload

- Auto Test

  - Common paths (Wordlist from [dirsearch](https://github.com/maurosoria/dirsearch/blob/master/db/dicc.txt) included)

- SQLi

  - Dump all database names (MySQL, PostgreSQL, MSSQL)
  - Dump tables from database (MySQL, PostgreSQL, SQLite, MSSQL)
  - Dump columns from database (MySQL, PostgreSQL, SQLite, MSSQL)
  - Union select statement (MySQL, PostgreSQL, SQLite, MSSQL)
  - Error-based injection statement (MySQL, PostgreSQL, MSSQL)
  - [Dump in one shot payload](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/SQL%20Injection/MySQL%20Injection.md#mysql-dios---dump-in-one-shot) (MySQL)
  - [Dump current query payload](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/SQL%20Injection/MySQL%20Injection.md#mysql-current-queries) (MySQL)
  - Space to Inline comment

- XSS

  - Vue.js XSS payloads
  - Angular.js XSS payloads for strict CSP
  - Some snippets for CTF
  - Html encode/decode with hex/dec/entity name
  - String.fromCharCode encode/decode
  - Helper function for converting payload with `atob`

- LFI

  - PHP wrapper - Base64

- SSRF

  - AWS - IAM role name

- SSTI

  - Jinja2 SSTI
    - ["From Flask config to RCE" Reference](https://twitter.com/realgam3/status/1184747565415358469)
  - Java SSTI

- Shell

  - Python reverse shell cheatsheet
  - sh(bash) reverse shell cheatsheet
  - nc(ncat) reverse shell cheatsheet
  - PHP webshell/reverse shell cheatsheet

- Encoding

  - URL encode/decode
  - Base64 encode/decode
  - Hexadecimal encode/decode
  - Unicode encode/decode
  - Escape ASCII with hex/oct

- Hashing
  - MD5
  - SHA1
  - SHA256
  - SHA384
  - SHA512

## Usage

### How to open it?

1. Open **Developer tools** (Press `F12` or `Ctrl + Shift + I`)
2. Switch to **HackBar** tab
3. Enjoy it

### Shortcuts

| Description | Shortcut  |
| ----------- | --------- |
| Load        | `Alt + A` |
| Split       | `Alt + S` |
| Execute     | `Alt + X` |
| Mode        | `Alt + M` |

## Request Editing

### Basic mode

#### multipart/form-data

After changing **enctype** field to `multipart/form-data`, you can put your payload into **Body** field such as the following:

```text
------WebKitFormBoundarydbJBATDXCC6CL0lZ
Content-Disposition: form-data; name="user"

user
------WebKitFormBoundarydbJBATDXCC6CL0lZ
Content-Disposition: form-data; name="file"; filename="shell.php"
Content-Type: application/x-httpd-php

<?php passthru($_GET['c']); ?>
------WebKitFormBoundarydbJBATDXCC6CL0lZ--
```

We will consider the first line as boundary, and reconstruct a form element to send your request.

Therefore, sent boundary will not be the same as you typed.

#### application/json

After changing **enctype** field to `application/json`, you can put your payload into **Body** field such as the following:

```json
{
  "username": "admin",
  "password": "admin"
}
```

If your payload doesn't contain `=`:

In order to post JSON data, we will insert a dummy field or object to your JSON such as the following:

```json
{ "username": "admin", "password": "admin", "4dxnzjzd5mi": "=" }
```

For more details, please visit "[Posting JSON with an HTML Form](https://systemoverlord.com/2016/08/24/posting-json-with-an-html-form.html)".

### Raw mode

This mode is implemented via `fetch` API. It will try the best to send a request as same as you typed.

However, there are some limitations:

**Request**

- It is unable to use a specified HTTP protocol version.
  > The protocol version is fixed to `HTTP/1.1` in the editor, but what version used in a request is up to `fetch` behavior.
- Some HTTP headers may appear in a sent request even if you don't add them in the editor.<br/>
  e.g. `Connection`, `Cache-Control`, `Pragma`, etc.
  > These headers will be assigned a default value. For example, `Connection: keep-alive`, `Cache-Control: no-cache`.

**Response**

- [Chrome] It always shows `HTTP/1.1` if used protocol version is higher than or equal to HTTP/2.
  > See also [Chromium Code Search](https://source.chromium.org/chromium/chromium/src/+/main:net/spdy/spdy_http_utils.cc;l=61;drc=30a7c30387dfa7d2d6529f8eebde7904624bf790;bpv=1;bpt=0)

## Third-party Libraries

See `package.json` for details.

## Build Steps

Assume that we are in a clean ubuntu:22.04 container

```bash
# Update apt
apt update
# Install basic tools
apt install -y curl python3 make gcc g++ patch jq
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# Restart shell
exec "$SHELL"
# Install Node.js 22
nvm install 22
# Install yarn
npm install -g yarn
# Go to the source code directory
cd hackbar
# Install hackbar dependencies
yarn install
# Build hackbar for Firefox and Chrome
yarn build:firefox
yarn build:chrome
```

## Contributor

- [lebr0nli](https://github.com/lebr0nli)
- [boylin0](https://github.com/boylin0)
- [HSwift](https://github.com/HSwift)
