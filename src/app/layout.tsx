import type {Metadata, Viewport} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {default: "Academic Planner", template: "%s · Academic Planner"},
  description: "วางแผนการเรียน เกรด เป้าหมาย ตารางเรียน และกำหนดส่งในที่เดียว",
  applicationName: "Academic Planner",
  manifest: "/manifest.webmanifest",
  robots: {index: false, follow: false}
};

export const viewport: Viewport = {themeColor: "#123c34", colorScheme: "light dark"};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="th" suppressHydrationWarning><body>{children}</body></html>;
}
