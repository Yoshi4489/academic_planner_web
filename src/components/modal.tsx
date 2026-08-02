"use client";
import {X} from "lucide-react";

export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#092a25]/55 p-4" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4"><h2 id="dialog-title" className="text-xl font-black">{title}</h2><button type="button" className="button-secondary !min-h-10 !p-2" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
      <div className="mt-6">{children}</div>
    </section>
  </div>;
}
