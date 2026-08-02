import "server-only";
export {safePayload,sameOrigin} from "./security";

export const BACKEND_API_URL=(process.env.BACKEND_API_URL??"https://academic-planner-backend-vfbf.onrender.com/api/v1").replace(/\/$/,"");
export const REFRESH_COOKIE="ap_refresh";

export async function callBackend(path:string,init:RequestInit={}){
  return fetch(`${BACKEND_API_URL}${path}`,{...init,cache:"no-store",headers:{accept:"application/json",...(init.body?{"content-type":"application/json"}:{}),...init.headers}});
}

export async function responsePayload(response:Response){
  if(response.status===204)return null;
  const text=await response.text();
  if(!text)return null;
  try{return JSON.parse(text) as unknown;}catch{return {message:"Upstream service returned an invalid response"};}
}

export function refreshFrom(payload:unknown){
  return payload&&typeof payload==="object"&&typeof (payload as Record<string,unknown>).refresh_token==="string"?(payload as Record<string,string>).refresh_token:null;
}
