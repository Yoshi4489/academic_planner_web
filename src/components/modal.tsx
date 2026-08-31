"use client";
import {X} from "lucide-react";
import {useEffect,useId,useRef} from "react";

export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  const titleId=useId();const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;const dialog=dialogRef.current;const focusable=dialog?.querySelector<HTMLElement>("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]");focusable?.focus();function keydown(event:KeyboardEvent){if(event.key==="Escape"){event.preventDefault();onClose();return;}if(event.key!=="Tab"||!dialog)return;const items=[...dialog.querySelectorAll<HTMLElement>("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]")];if(!items.length)return;const first=items[0];const last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}document.addEventListener("keydown",keydown);return()=>{document.removeEventListener("keydown",keydown);previous?.focus();};},[onClose]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto !rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-overlay)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4"><h2 id={titleId} className="text-xl font-bold">{title}</h2><button type="button" className="button-secondary !min-h-9 !p-2" onClick={onClose} aria-label="Close"><X size={17}/></button></div>
      <div className="mt-6">{children}</div>
    </section>
  </div>;
}
