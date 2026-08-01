import {NextRequest,NextResponse} from "next/server";
import {callBackend,responsePayload,sameOrigin} from "@/lib/server/backend";

const domains=new Set(["semesters","courses","goals","gpa","planner","data","notifications"]);
const safeSegment=/^[a-zA-Z0-9_-]+$/;

async function proxy(request:NextRequest,context:{params:Promise<{domain:string;path:string[]}>}){
  const {domain,path}=await context.params;
  if(!domains.has(domain)||!path.length||path.some((part)=>!safeSegment.test(part)))return NextResponse.json({message:"Unsupported API path"},{status:404});
  if(!["GET","HEAD"].includes(request.method)&&!sameOrigin(request))return NextResponse.json({message:"Invalid request origin"},{status:403});
  const authorization=request.headers.get("authorization");
  if(!authorization?.startsWith("Bearer "))return NextResponse.json({message:"Authentication required"},{status:401});
  const query=new URL(request.url).search;
  const body=["GET","HEAD"].includes(request.method)?undefined:await request.text();
  const upstream=await callBackend(`/${domain}/${path.join("/")}${query}`,{method:request.method,body:body||undefined,headers:{authorization}});
  const payload=await responsePayload(upstream);
  return NextResponse.json(payload,{status:upstream.status||500,headers:{"cache-control":"no-store"}});
}

export const GET=proxy; export const POST=proxy; export const PATCH=proxy; export const PUT=proxy; export const DELETE=proxy;
