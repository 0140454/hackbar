import { InjectionKey, Ref } from 'vue'
import { VAppBar } from 'vuetify/components'

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

export const DefaultSentRequestHeaders = [
  'Accept-Encoding',
  'Accept-Language',
  'Accept',
  'Cache-Control',
  'Content-Length',
  'Content-Type',
  'Cookie',
  'Host',
  'Origin',
  'Pragma',
  'Referer',
  'Sec-Ch-Ua-Mobile',
  'Sec-Ch-Ua-Platform',
  'Sec-Ch-Ua',
  'Sec-Fetch-Dest',
  'Sec-Fetch-Mode',
  'Sec-Fetch-Site',
  'Sec-Fetch-User',
  'Upgrade-Insecure-Requests',
  'User-Agent',
]

export const BodyAvailableMethods = ['POST', 'PUT', 'PATCH']

export const LoadFromKey: InjectionKey<(source: BrowseRequest) => void> =
  Symbol('loadFrom')

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

export const OpenCustomPayloadManagementKey: InjectionKey<() => void> = Symbol(
  'openCustomPayloadManagement',
)

export const ControlTestKey: InjectionKey<
  (
    action: BackgroundTestMessage['data']['action'],
    script?: string,
    argument?: any,
  ) => void
> = Symbol('controlTest')

export const AppBarKey: InjectionKey<
  Ref<InstanceType<typeof VAppBar> | undefined>
> = Symbol('appBar')
