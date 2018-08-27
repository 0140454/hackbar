var Hash = {}

Hash.MD5 = class {
  static digest (value) {
    return new Hashes.MD5().hex(value)
  }
}

Hash.SHA1 = class {
  static digest (value) {
    return new Hashes.SHA1().hex(value)
  }
}

Hash.SHA256 = class {
  static digest (value) {
    return new Hashes.SHA256().hex(value)
  }
}

Hash.SHA512 = class {
  static digest (value) {
    return new Hashes.SHA512().hex(value)
  }
}
