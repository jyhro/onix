import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { parseLinks, resolveLink } from "./links";

describe("links", () => {
  it("parse y resolve de wikilinks", () => {
    assert(parseLinks("ver [[a]] y [[dir/b|B]]").join() === "a,dir/b");
    assert(resolveLink("a", ["a"]).exists === true);
    assert(resolveLink("zzz", ["a"]).exists === false);
  });
});
