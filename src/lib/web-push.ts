import {apiFetch} from "./api-client";

const SUBSCRIPTION_ID="ap_push_subscription_id";
export function base64UrlToUint8Array(value:string){const padding="=".repeat((4-value.length%4)%4);const raw=atob((value+padding).replace(/-/g,"+").replace(/_/g,"/"));const output=new Uint8Array(raw.length);for(let index=0;index<raw.length;index+=1)output[index]=raw.charCodeAt(index);return output;}
export function webPushSupported(){return typeof window!=="undefined"&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;}
function sameKey(current:ArrayBuffer|null,key:Uint8Array){if(!current)return false;const left=new Uint8Array(current);return left.length===key.length&&left.every((value,index)=>value===key[index]);}

export async function syncPushSubscription(requestPermission=false){
  if(!webPushSupported())throw new Error("Web Push is not supported in this browser");
  let permission=Notification.permission;if(permission==="default"&&requestPermission)permission=await Notification.requestPermission();if(permission!=="granted")throw new Error(permission==="denied"?"Notification permission is blocked":"Notification permission was not granted");
  const registration=await navigator.serviceWorker.register("/sw.js",{scope:"/"});await navigator.serviceWorker.ready;
  const {public_key}=await apiFetch<{public_key:string}>("notifications/vapid-public-key");const applicationServerKey=base64UrlToUint8Array(public_key);let subscription=await registration.pushManager.getSubscription();
  if(subscription&&!sameKey(subscription.options.applicationServerKey,applicationServerKey)){await subscription.unsubscribe();subscription=null;}
  subscription??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey});
  const result=await apiFetch<{data:{id:string}}>("notifications/subscriptions",{method:"POST",body:JSON.stringify(subscription.toJSON())});localStorage.setItem(SUBSCRIPTION_ID,result.data.id);return result.data;
}

export async function disablePushSubscription(){if(!webPushSupported())return;const registration=await navigator.serviceWorker.getRegistration("/");const subscription=await registration?.pushManager.getSubscription();const id=localStorage.getItem(SUBSCRIPTION_ID);try{if(id)await apiFetch(`notifications/subscriptions/${id}`,{method:"DELETE"});}finally{await subscription?.unsubscribe();localStorage.removeItem(SUBSCRIPTION_ID);}}
export async function syncPreviouslyGrantedPush(){if(webPushSupported()&&Notification.permission==="granted")await syncPushSubscription(false);}
