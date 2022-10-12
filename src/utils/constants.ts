import { InjectionKey } from 'vue'

export const CommonRequestHeaders = [
  'Accept',
  'Accept-Charset',
  'Accept-Datetime',
  'Accept-Encoding',
  'Accept-Language',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'A-IM',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Disposition',
  'Content-Encoding',
  'Content-Language',
  'Content-Length',
  'Content-Location',
  'Content-MD5',
  'Content-Range',
  'Content-Type',
  'Cookie',
  'Date',
  'Device-Memory',
  'Digest',
  'DNT',
  'Downlink',
  'DPR',
  'Early-Data',
  'ECT',
  'Expect',
  'Forwarded',
  'From',
  'Front-End-Https',
  'Host',
  'HTTP2-Settings',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Keep-Alive',
  'Last-Modified',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Prefer',
  'Proxy-Authorization',
  'Proxy-Connection',
  'Range',
  'Referer',
  'RTT',
  'Save-Data',
  'Sec-CH-UA',
  'Sec-CH-UA-Arch',
  'Sec-CH-UA-Bitness',
  'Sec-CH-UA-Full-Version',
  'Sec-CH-UA-Full-Version-List',
  'Sec-CH-UA-Mobile',
  'Sec-CH-UA-Model',
  'Sec-CH-UA-Platform',
  'Sec-CH-UA-Platform-Version',
  'Service-Worker-Navigation-Preload',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Upgrade-Insecure-Requests',
  'User-Agent',
  'Via',
  'Viewport-Width',
  'Want-Digest',
  'Warning',
  'Width',
  'X-ATT-DeviceId',
  'X-Correlation-ID',
  'X-Csrf-Token',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'X-Http-Method-Override',
  'X-Requested-With',
  'X-Request-ID',
  'X-UIDH',
  'X-Wap-Profile',
]

export const BodyAvailableMethods = ['POST', 'PUT', 'PATCH']

export const LoadFromKey: InjectionKey<
  (source: BrowseRequest, overwriteHeaders?: boolean) => void
> = Symbol('loadFrom')

export const ApplyFunctionKey: InjectionKey<
  (
    func: string,
    insertWhenNoSelection?: boolean,
    argument?: any,
  ) => Promise<void>
> = Symbol('applyFunction')

export const OpenSqlInjectionPromptKey: InjectionKey<
  (func: string, positionRequired?: boolean) => void
> = Symbol('openSqlInjectionPrompt')

export const OpenReverseShellPromptKey: InjectionKey<(func: string) => void> =
  Symbol('openReverseShellPrompt')

export const ControlTestKey: InjectionKey<
  (action: string, script?: string, argument?: any) => void
> = Symbol('controlTest')
