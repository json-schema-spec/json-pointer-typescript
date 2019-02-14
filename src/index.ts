/**
 * Ptr represents a [RFC6901](https://tools.ietf.org/html/rfc6901) JSON Pointer.
 */
export default class Ptr {
  /**
   * Parse an inputted string as a JSON Pointer. This function will handle
   * un-escaping the special sequences "~0" and "~1", as per [RFC 6901, Section
   * 3](https://tools.ietf.org/html/rfc6901#section-3).
   *
   * @param s The string to parse as a JSON Pointer.
   * @throws [[InvalidPtrError]] If the input does not correspond to a valid
   * JSON Pointer.
   */
  public static parse(s: string): Ptr {
    // From the ABNF syntax of JSON Pointer, the only valid initial character
    // for a JSON Pointer is "/". Empty strings are acceptable.
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
      return token.replace(/~1/g, "/").replace(/~0/g, "~");
    }));
  }

  /**
   * The set of tokens that make up a JSON Pointer. These tokens are already
   * "un-escaped" -- that is, the special sequences "~0" and "~1" have already
   * been convered to "~" and "/", respectively.
   */
  public tokens: string[];

  /**
   * Constructs a Ptr directly from a sequence of pre-escaped tokens.
   *
   * @param tokens The tokens making up the JSON Pointer.
   */
  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  /**
   * Converts a JSON Pointer back into its string representation. This function
   * will handle converting any "~" or "/" in its tokens back into their escaped
   * forms, as per [RFC 6901, Section
   * 3](https://tools.ietf.org/html/rfc6901#section-3).
   */
  public toString(): string {
    if (this.tokens.length === 0) {
      return "";
    }

    const tokens = this.tokens.map((token) => {
      return token.replace(/~/g, "~0").replace(/\//g, "~1");
    });

    return `/${tokens.join("/")}`;
  }

  /**
   * Evaluates this JSON Pointer against an object, following the mechanism
   * described in [RFC 6901, Section
   * 4](https://tools.ietf.org/html/rfc6901#section-4).
   *
   * @param instance The object to dereference the JSON Pointer against.
   * @throws [[EvalError]] If the instance, or one of its descendants, doesn't
   * have a property being referred to.
   */
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

/**
 * InvalidPtrError represents a string which was passed to [[Ptr.parse]], but
 * which was not a valid JSON Pointer representation.
 */
export class InvalidPtrError extends Error {
  /**
   * The inputted, invalid, string.
   */
  public ptr: string;

  constructor(ptr: string) {
    super(`Invalid JSON Pointer: ${ptr}`);
    this.ptr = ptr;
  }
}

/**
 * EvalError indicates that a JSON Pointer referred to a property which didn't
 * exist in the instance.
 */
export class EvalError extends Error {
  /**
   * The value being accessed.
   */
  public instance: any;

  /**
   * The property that [[instance]] is missing.
   */
  public token: string;

  constructor(instance: any, token: string) {
    super(`Error evaluating JSON Pointer: no attribute ${token} on ${instance}`);
    this.instance = instance;
    this.token = token;
  }
}
