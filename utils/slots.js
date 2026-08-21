// Appointments are requested as date "DD-MM-YYYY" + time "HH:mm".
// A slot occupies SLOT_MINUTES; a doctor cannot have two appointments whose
// slots overlap.
const SLOT_MINUTES = 60;

const parseTime = (time) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseSlot = (date, time) => {
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(String(date || "").trim());
  const minutesOfDay = parseTime(time);
  if (!match || minutesOfDay === null) return null;
  const [day, month, year] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const slot = new Date(
    year,
    month - 1,
    day,
    Math.floor(minutesOfDay / 60),
    minutesOfDay % 60,
    0,
    0
  );
  // rejects overflow dates like 31-02-2024, which Date silently rolls over
  if (
    slot.getFullYear() !== year ||
    slot.getMonth() !== month - 1 ||
    slot.getDate() !== day
  ) {
    return null;
  }
  return slot;
};

// the whole slot must fit inside the doctor's working hours
const isWithinTimings = (time, timings) => {
  const requested = parseTime(time);
  const opens = parseTime(timings && timings[0]);
  const closes = parseTime(timings && timings[1]);
  if (requested === null || opens === null || closes === null) return false;
  return requested >= opens && requested + SLOT_MINUTES <= closes;
};

// [slot - SLOT_MINUTES, slot + SLOT_MINUTES] — anything already booked in this
// window overlaps the requested slot
const overlapWindow = (slot) => ({
  $gt: new Date(slot.getTime() - SLOT_MINUTES * 60 * 1000),
  $lt: new Date(slot.getTime() + SLOT_MINUTES * 60 * 1000),
});

module.exports = { SLOT_MINUTES, parseTime, parseSlot, isWithinTimings, overlapWindow };
