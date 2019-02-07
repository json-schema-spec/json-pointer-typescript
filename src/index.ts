export default class Ptr {
  public tokens: string[];

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  public static parse(s: string): Ptr {
    // From the ABNF syntax of JSON Pointer, the only valid initial character
    // for a JSON Pointer is "/". Empty strings are acceptable.
    //
    // https://tools.ietf.org/html/rfc6901#section-3
    //
    // Other than this limitation, all strings are valid JSON Pointers.
    if (s === "") {
      return new Ptr([]);
    }

    if (!s.startsWith("/")) {
      throw new InvalidPtrError(s);
    }

    const [, ...tokens] = s.split("/");
    return new Ptr(tokens.map(token => {
      return token.replace("~1", "/").replace("~0", "~");
    }));
  }

  public toString(): string {
    if (this.tokens.length === 0) {
      return "";
    }

    const tokens = this.tokens.map(token => {
      return token.replace("~", "~0").replace("/", "~1");
    });

    return `/${tokens.join("/")}`;
  }
}

export class InvalidPtrError extends Error {
  public ptr: string;

  constructor(ptr: string) {
    super(`Invalid JSON Pointer: ${ptr}`);
    this.ptr = ptr;
  }
}
