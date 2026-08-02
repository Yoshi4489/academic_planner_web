import {afterEach,describe,expect,it,vi} from "vitest";

describe("auth refresh concurrency",()=>{
  afterEach(()=>vi.unstubAllGlobals());
  it("shares a single refresh request across concurrent callers",async()=>{vi.resetModules();const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({access_token:"access",user:{id:"u",name:"User",email:"u@example.com"}}),{status:200,headers:{"content-type":"application/json"}}));vi.stubGlobal("fetch",fetchMock);const {refreshSession}=await import("./api-client");const [first,second]=await Promise.all([refreshSession(),refreshSession()]);expect(fetchMock).toHaveBeenCalledTimes(1);expect(first).toEqual(second);});
});
