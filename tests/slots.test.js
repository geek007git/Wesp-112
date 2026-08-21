const test = require("node:test");
const assert = require("node:assert/strict");
const {
  SLOT_MINUTES,
  parseTime,
  parseSlot,
  isWithinTimings,
  overlapWindow,
} = require("../utils/slots");

test("parseTime accepts HH:mm and returns minutes of day", () => {
  assert.equal(parseTime("00:00"), 0);
  assert.equal(parseTime("09:30"), 570);
  assert.equal(parseTime("23:59"), 1439);
  assert.equal(parseTime("9:05"), 545);
});

test("parseTime rejects malformed or out-of-range times", () => {
  for (const bad of ["24:00", "12:60", "12", "12:5", "", null, undefined, "ab:cd"]) {
    assert.equal(parseTime(bad), null, `expected null for ${bad}`);
  }
});

test("parseSlot builds a Date from DD-MM-YYYY and HH:mm", () => {
  const slot = parseSlot("25-12-2026", "14:30");
  assert.equal(slot.getFullYear(), 2026);
  assert.equal(slot.getMonth(), 11);
  assert.equal(slot.getDate(), 25);
  assert.equal(slot.getHours(), 14);
  assert.equal(slot.getMinutes(), 30);
});

test("parseSlot rejects dates that would silently roll over", () => {
  assert.equal(parseSlot("31-02-2026", "10:00"), null);
  assert.equal(parseSlot("32-01-2026", "10:00"), null);
  assert.equal(parseSlot("01-13-2026", "10:00"), null);
});

test("parseSlot rejects the wrong date format", () => {
  assert.equal(parseSlot("2026-12-25", "10:00"), null);
  assert.equal(parseSlot("25/12/2026", "10:00"), null);
  assert.equal(parseSlot("", "10:00"), null);
  assert.equal(parseSlot("25-12-2026", ""), null);
});

test("parseSlot accepts a leap day and rejects a non-leap one", () => {
  assert.notEqual(parseSlot("29-02-2028", "10:00"), null);
  assert.equal(parseSlot("29-02-2027", "10:00"), null);
});

test("a slot must fit entirely inside the doctor's timings", () => {
  const timings = ["09:00", "17:00"];
  assert.equal(isWithinTimings("09:00", timings), true, "opening time is bookable");
  assert.equal(isWithinTimings("16:00", timings), true, "last slot ends exactly at close");
  assert.equal(isWithinTimings("16:30", timings), false, "would run 30m past close");
  assert.equal(isWithinTimings("17:00", timings), false, "starts at close");
  assert.equal(isWithinTimings("08:59", timings), false, "before opening");
});

test("isWithinTimings rejects malformed input instead of guessing", () => {
  assert.equal(isWithinTimings("10:00", ["nine", "17:00"]), false);
  assert.equal(isWithinTimings("10:00", []), false);
  assert.equal(isWithinTimings("10:00", undefined), false);
  assert.equal(isWithinTimings("bad", ["09:00", "17:00"]), false);
});

test("overlapWindow spans one slot either side, exclusive", () => {
  const slot = parseSlot("25-12-2026", "14:00");
  const window = overlapWindow(slot);
  assert.equal(window.$gt.getTime(), slot.getTime() - SLOT_MINUTES * 60_000);
  assert.equal(window.$lt.getTime(), slot.getTime() + SLOT_MINUTES * 60_000);

  // an appointment exactly one slot earlier ends as this one starts: no clash
  const backToBack = parseSlot("25-12-2026", "13:00");
  assert.equal(backToBack > window.$gt, false, "13:00 must not fall inside the window");

  // half an hour earlier does overlap
  const overlapping = parseSlot("25-12-2026", "13:30");
  assert.equal(
    overlapping > window.$gt && overlapping < window.$lt,
    true,
    "13:30 must fall inside the window"
  );
});
