export const proxyDomains=new Set(["semesters","courses","goals","gpa","planner","data","notifications"]);
const safeSegment=/^[a-zA-Z0-9_-]+$/;
export function allowedProxyPath(domain:string,path:string[]){return proxyDomains.has(domain)&&path.length>0&&path.every((part)=>safeSegment.test(part));}
export function refreshCookieOptions(nodeEnv:string|undefined){return {httpOnly:true,secure:nodeEnv==="production",sameSite:"lax" as const,path:"/api/bff/auth",maxAge:60*60*24*30,priority:"high" as const};}
export function safePayload(payload:unknown){if(!payload||typeof payload!=="object")return payload;const copy={...(payload as Record<string,unknown>)};delete copy.refresh_token;return copy;}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");if(!origin)return process.env.NODE_ENV!=="production";return origin===new URL(request.url).origin;}
