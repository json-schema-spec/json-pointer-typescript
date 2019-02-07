export default class Ptr {
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
    return new Ptr(tokens.map((token) => {
      return token.replace("~1", "/").replace("~0", "~");
    }));
  }

  public tokens: string[];

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  public toString(): string {
    if (this.tokens.length === 0) {
      return "";
    }

    const tokens = this.tokens.map((token) => {
      return token.replace("~", "~0").replace("/", "~1");
    });

    return `/${tokens.join("/")}`;
  }

  public eval(instance: any): any {
    for (const token of this.tokens) {
      if (instance.hasOwnProperty(token)) {
        instance = instance[token];
      } else {
        throw new EvalError(instance, token);
      }
    }

    return instance;
  }
}

export class InvalidPtrError extends Error {
  public ptr: string;

  constructor(ptr: string) {
    super(`Invalid JSON Pointer: ${ptr}`);
    this.ptr = ptr;
  }
}

export class EvalError extends Error {
  public instance: any;
  public token: string;

  constructor(instance: any, token: string) {
    super(`Error evaluating JSON Pointer: no attribute ${token} on ${instance}`);
    this.instance = instance;
    this.token = token;
  }
}
