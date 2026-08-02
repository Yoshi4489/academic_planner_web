import {afterEach,describe,expect,it,vi} from "vitest";
import {allowedProxyPath,refreshCookieOptions,safePayload,sameOrigin} from "./security";

describe("BFF security boundaries",()=>{
  afterEach(()=>vi.unstubAllEnvs());
  it("uses hardened refresh-cookie flags in production",()=>{expect(refreshCookieOptions("production")).toMatchObject({httpOnly:true,secure:true,sameSite:"lax",path:"/api/bff/auth"});});
  it("removes refresh tokens from upstream payloads",()=>{expect(safePayload({access_token:"access",refresh_token:"secret"})).toEqual({access_token:"access"});});
  it("allows only declared domains and simple path segments",()=>{expect(allowedProxyPath("planner",["tasks","id-1"])).toBe(true);expect(allowedProxyPath("auth",["me"])).toBe(false);expect(allowedProxyPath("planner",[".."])).toBe(false);});
  it("rejects cross-origin mutations",()=>{vi.stubEnv("NODE_ENV","production");expect(sameOrigin(new Request("https://planner.example/api",{headers:{origin:"https://evil.example"}}))).toBe(false);expect(sameOrigin(new Request("https://planner.example/api",{headers:{origin:"https://planner.example"}}))).toBe(true);});
});
