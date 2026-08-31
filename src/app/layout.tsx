import type {Metadata, Viewport} from "next";
import {Inter,JetBrains_Mono,Noto_Sans_Thai,Noto_Serif_Thai} from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bodyFont=Inter({subsets:["latin"],variable:"--font-body",display:"swap"});
const thaiBodyFont=Noto_Sans_Thai({subsets:["latin","thai"],variable:"--font-body-thai",display:"swap"});
const headingFont=Noto_Serif_Thai({subsets:["latin","thai"],variable:"--font-heading",display:"swap"});
const monoFont=JetBrains_Mono({subsets:["latin"],variable:"--font-mono",display:"swap"});

const themeScript=`(function(){try{var value=localStorage.getItem("theme");var dark=value==="dark"||(value!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

export const metadata: Metadata = {
  title: {default: "Academic Planner", template: "%s · Academic Planner"},
  description: "วางแผนการเรียน เกรด เป้าหมาย ตารางเรียน และกำหนดส่งในที่เดียว",
  applicationName: "Academic Planner",
  manifest: "/manifest.webmanifest",
  robots: {index: false, follow: false}
};

export const viewport: Viewport = {themeColor:[{media:"(prefers-color-scheme: light)",color:"#1E3A5F"},{media:"(prefers-color-scheme: dark)",color:"#0B1220"}],colorScheme:"light dark"};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="th" suppressHydrationWarning className={`${bodyFont.variable} ${thaiBodyFont.variable} ${headingFont.variable} ${monoFont.variable}`}><body>{children}<Script id="theme-preference" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeScript}}/></body></html>;
}
