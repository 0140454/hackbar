var Hash = {}

Hash.MD5 = class {
  static digest (value) {
    return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex)
  }
}

Hash.SHA1 = class {
  static digest (value) {
    return CryptoJS.SHA1(value).toString(CryptoJS.enc.Hex)
  }
}

Hash.SHA256 = class {
  static digest (value) {
    return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex)
  }
}

Hash.SHA512 = class {
  static digest (value) {
    return CryptoJS.SHA512(value).toString(CryptoJS.enc.Hex)
  }
}
