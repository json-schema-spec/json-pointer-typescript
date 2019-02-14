import Ptr, { EvalError, InvalidPtrError } from "./index";

describe("Ptr", () => {
  describe("parse", () => {
    it("handles well-formed JSON Pointer strings correctly", () => {
      // These test cases are lifted from RFC6901, Section 5:
      //
      // https://tools.ietf.org/html/rfc6901#section-5
      const cases = {
        "": [],
        "/": [""],
        "/ ": [" "],
        "/a~1b": ["a/b"],
        "/c%d": ["c%d"],
        "/e^f": ["e^f"],
        "/foo": ["foo"],
        "/foo/0": ["foo", "0"],
        "/g|h": ["g|h"],
        "/i\\j": ["i\\j"],
        "/k\"l": ["k\"l"],
        "/m~0n": ["m~n"],
        "/o~0~1p/q~1~0r": ["o~/p", "q/~r"],
        "/~0~0~0~0~0~1~1~1~1~1": ["~~~~~/////"],
      };

      for (const [input, output] of Object.entries(cases)) {
        const ptr = Ptr.parse(input);
        expect(ptr.tokens).toEqual(output);
        expect(ptr.toString()).toEqual(input);
      }
    });

    it("throws an error for bad input", () => {
      expect(() => {
        Ptr.parse(" ");
      }).toThrowError(new InvalidPtrError(" "));
    });
  });

  describe("eval", () => {
    it("handles evaluating JSON pointers against any input", () => {
      expect(Ptr.parse("").eval(null)).toEqual(null);
      expect(Ptr.parse("").eval(true)).toEqual(true);
      expect(Ptr.parse("").eval(3.14)).toEqual(3.14);
      expect(Ptr.parse("").eval("foo")).toEqual("foo");
      expect(Ptr.parse("").eval([])).toEqual([]);
      expect(Ptr.parse("").eval({})).toEqual({});
      expect(Ptr.parse("/foo").eval({ foo: "bar" })).toEqual("bar");
      expect(Ptr.parse("/0").eval(["bar"])).toEqual("bar");
      expect(Ptr.parse("/foo/1/bar").eval({foo: [null, { bar: "x" }]})).toEqual("x");
    });

    it("returns an error when an instance lacks a property", () => {
      expect(() => { Ptr.parse("/foo").eval(3.14); }).toThrow(new EvalError(3.14, "foo"));
      expect(() => { Ptr.parse("/0").eval([]); }).toThrow(new EvalError([], "0"));
      expect(() => { Ptr.parse("/foo").eval({}); }).toThrow(new EvalError({}, "foo"));
    });
  });
});
