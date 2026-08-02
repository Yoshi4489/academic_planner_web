import {describe,expect,it,vi} from "vitest";
import {base64UrlToUint8Array,webPushSupported} from "./web-push";

describe("web push helpers",()=>{
  it("decodes a URL-safe VAPID key",()=>{vi.stubGlobal("atob",(value:string)=>Buffer.from(value,"base64").toString("binary"));expect([...base64UrlToUint8Array("AQIDBA")]).toEqual([1,2,3,4]);vi.unstubAllGlobals();});
  it("reports unsupported server environments",()=>{expect(webPushSupported()).toBe(false);});
});
