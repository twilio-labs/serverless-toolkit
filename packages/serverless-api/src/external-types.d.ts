declare module 'fast-redact' {
  function createRedactor(options: {}): <T>(val: T) => string;

  export = createRedactor;
}
