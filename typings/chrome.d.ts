/// <reference types="chrome-types" />

declare namespace chrome.webRequest {
  export const OnBeforeRequestOptions: Record<
    Uppercase<CamelToSnake<chrome.webRequest.OnBeforeRequestOptions>>,
    chrome.webRequest.OnBeforeRequestOptions
  >
  export const OnBeforeSendHeadersOptions: Record<
    Uppercase<CamelToSnake<chrome.webRequest.OnBeforeSendHeadersOptions>>,
    chrome.webRequest.OnBeforeSendHeadersOptions
  >
}
