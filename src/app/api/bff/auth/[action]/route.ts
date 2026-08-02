import {NextRequest,NextResponse} from "next/server";
import {callBackend,REFRESH_COOKIE,refreshFrom,responsePayload,safePayload,sameOrigin} from "@/lib/server/backend";

const publicActions:Record<string,string>={login:"/auth/login",register:"/auth/register","request-password-reset":"/auth/request-password-reset","verify-otp":"/auth/verify-otp","reset-password":"/auth/reset-password"};
const accountActions:Record<string,{path:string;methods:string[]}>= {profile:{path:"/auth/me",methods:["GET","PATCH"]},"change-password":{path:"/auth/change-password",methods:["POST"]},"delete-account":{path:"/auth/me",methods:["DELETE"]}};
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/api/bff/auth",maxAge:60*60*24*30,priority:"high" as const};

async function handler(request:NextRequest,context:{params:Promise<{action:string}>}){
  if(!["GET","HEAD"].includes(request.method)&&!sameOrigin(request))return NextResponse.json({message:"Invalid request origin"},{status:403});
  const {action}=await context.params;const refresh=request.cookies.get(REFRESH_COOKIE)?.value;const authorization=request.headers.get("authorization")??undefined;
  let path=publicActions[action];let upstreamMethod=request.method;let body:unknown={};
  if(!["GET","HEAD"].includes(request.method)){try{body=await request.json();}catch{body={};}}
  if(action==="refresh"||action==="session"){if(!refresh)return NextResponse.json({message:"No active session"},{status:401});path="/auth/refresh-token";upstreamMethod="POST";}
  else if(action==="logout"){path="/auth/logout";body={refresh_token:refresh};upstreamMethod="POST";}
  else if(action==="logout-all"){path="/auth/logout-all";upstreamMethod="POST";}
  else if(accountActions[action]){const config=accountActions[action];if(!config.methods.includes(request.method))return NextResponse.json({message:"Method not allowed"},{status:405});path=config.path;}
  else if(path&&request.method!=="POST")return NextResponse.json({message:"Method not allowed"},{status:405});
  if(!path)return NextResponse.json({message:"Unsupported auth action"},{status:404});
  if(accountActions[action]&&!authorization?.startsWith("Bearer "))return NextResponse.json({message:"Authentication required"},{status:401});

  const upstream=await callBackend(path,{method:upstreamMethod,body:["GET","HEAD"].includes(upstreamMethod)?undefined:JSON.stringify(body),headers:{...(authorization?{authorization}:{}),...((action==="refresh"||action==="session")&&refresh?{authorization:`Bearer ${refresh}`}:{})}});
  const payload=await responsePayload(upstream);const result=upstream.status===204?new NextResponse(null,{status:204,headers:{"cache-control":"no-store"}}):NextResponse.json(safePayload(payload),{status:upstream.status||500,headers:{"cache-control":"no-store"}});
  const rotated=refreshFrom(payload);if(rotated)result.cookies.set(REFRESH_COOKIE,rotated,cookieOptions);
  if(action==="logout"||action==="logout-all"||action==="delete-account"||(!upstream.ok&&(action==="refresh"||action==="session")))result.cookies.set(REFRESH_COOKIE,"",{...cookieOptions,maxAge:0});
  return result;
}

export const GET=handler;export const POST=handler;export const PATCH=handler;export const DELETE=handler;
