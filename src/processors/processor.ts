export abstract class BodyProcessor {
  abstract getName(): string

  abstract getFormEnctype(): string

  abstract getHttpContentType(): string

  abstract parse(body: string): PostInfo

  abstract format(body: string): string
}
