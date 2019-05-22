window.Hash = {}

window.Hash.MD5 = {
  digest: (value) => {
    return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex)
  }
}

window.Hash.SHA1 = {
  digest: (value) => {
    return CryptoJS.SHA1(value).toString(CryptoJS.enc.Hex)
  }
}

window.Hash.SHA256 = {
  digest: (value) => {
    return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex)
  }
}

window.Hash.SHA512 = {
  digest: (value) => {
    return CryptoJS.SHA512(value).toString(CryptoJS.enc.Hex)
  }
}
