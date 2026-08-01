import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest { return {name:"Academic Planner",short_name:"Planner",start_url:"/th",display:"standalone",background_color:"#f5f1e8",theme_color:"#123c34",icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/icon-512.png",sizes:"512x512",type:"image/png"}]}; }
