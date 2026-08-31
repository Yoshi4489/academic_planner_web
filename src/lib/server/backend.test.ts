import {afterEach,describe,expect,it,vi} from "vitest";

vi.mock("server-only",()=>({}));

import {callBackend,responsePayload} from "./backend";

describe("Render backend transport",()=>{
  afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});

  it("turns network failures into a JSON gateway response",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const response=await callBackend("/health");

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({message:"Backend service is temporarily unavailable"});
  });

  it("gives empty Render error responses a useful message",async()=>{
    const payload=await responsePayload(new Response(null,{status:503}));

    expect(payload).toEqual({message:"Backend service is temporarily unavailable"});
  });
});
