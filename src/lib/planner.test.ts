import {describe,expect,it} from "vitest";
import {formatMinute,meetingsOverlap,minutes,reminderLabel,toLocalInput} from "./planner";

describe("planner date and time helpers",()=>{
  it("converts schedule time to and from minutes",()=>{
    expect(minutes("09:30")).toBe(570);
    expect(formatMinute(570)).toBe("09:30");
  });

  it("formats an ISO instant for a deterministic timezone offset",()=>{
    expect(toLocalInput("2026-08-02T03:00:00.000Z",-420)).toBe("2026-08-02T10:00");
  });

  it("detects only meetings that overlap on the same weekday",()=>{
    const first={weekday:1,start_minute:540,end_minute:600};
    expect(meetingsOverlap(first,{weekday:1,start_minute:590,end_minute:650})).toBe(true);
    expect(meetingsOverlap(first,{weekday:1,start_minute:600,end_minute:650})).toBe(false);
    expect(meetingsOverlap(first,{weekday:2,start_minute:590,end_minute:650})).toBe(false);
  });

  it("uses concise localized reminder labels",()=>{
    expect(reminderLabel(1440,false)).toBe("1d before");
    expect(reminderLabel(60,true)).toContain("1");
  });
});
