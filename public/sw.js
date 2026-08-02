self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",(event)=>event.waitUntil(self.clients.claim()));
self.addEventListener("push",(event)=>{
  let payload={title:"Academic Planner",body:"You have an upcoming academic deadline",icon:"/icon-192.png",badge:"/icon-192.png",tag:"academic-planner",data:{url:"/th/planner"}};
  try{if(event.data)payload={...payload,...event.data.json()};}catch{}
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:payload.icon,badge:payload.badge,tag:payload.tag,data:payload.data,renotify:true}));
});
self.addEventListener("notificationclick",(event)=>{
  event.notification.close();const target=new URL(event.notification.data?.url||"/th/planner",self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then((windows)=>{const existing=windows.find((client)=>client.url===target);if(existing)return existing.focus();return self.clients.openWindow(target);}));
});
