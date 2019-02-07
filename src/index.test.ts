import Ptr, { InvalidPtrError } from "./index";

describe("Ptr", () => {
  describe("parse", () => {
    it("handles well-formed JSON Pointer strings correctly", () => {
      // These test cases are lifted from RFC6901, Section 5:
      //
      // https://tools.ietf.org/html/rfc6901#section-5
      const cases = {
        "": [],
        "/foo": ["foo"],
        "/foo/0": ["foo", "0"],
        "/": [""],
        "/a~1b": ["a/b"],
        "/c%d": ["c%d"],
        "/e^f": ["e^f"],
        "/g|h": ["g|h"],
        "/i\\j": ["i\\j"],
        "/k\"l": ["k\"l"],
        "/ ": [" "],
        "/m~0n": ["m~n"],
        "/o~0~1p/q~1~0r": ["o~/p", "q/~r"],
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
});
