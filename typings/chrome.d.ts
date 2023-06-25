/// <reference types="chrome-types" />

declare namespace chrome.webRequest {
  export const OnBeforeRequestOptions: CamelToSnakeEnum<chrome.webRequest.OnBeforeSendHeadersOptions>
  export const OnBeforeSendHeadersOptions: CamelToSnakeEnum<chrome.webRequest.OnBeforeSendHeadersOptions>
  export const OnBeforeRedirectOptions: CamelToSnakeEnum<chrome.webRequest.OnBeforeRedirectOptions>
  export const OnCompletedOptions: CamelToSnakeEnum<chrome.webRequest.OnCompletedOptions>
}
