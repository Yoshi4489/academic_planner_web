import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest { return {name:"Academic Planner",short_name:"Planner",start_url:"/th",display:"standalone",background_color:"#F8FAFC",theme_color:"#1E3A5F",icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/icon-512.png",sizes:"512x512",type:"image/png"}]}; }
