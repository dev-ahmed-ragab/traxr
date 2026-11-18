import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Traxr", template: "%s · Traxr" },
  description:
    "Traxr is a keyboard-first, high-velocity issue tracker for modern software teams: issues, boards, cycles, projects, real-time sync, and command palette.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Traxr — High-velocity issue tracking at the speed of thought",
    description: "Keyboard-first, real-time issue tracking and execution for agile engineering teams.",
    type: "website",
  },
};

/* Apply the saved theme before first paint (no flash), including the browser chrome color.
   The theme-color tag is ours, not Next's (no `viewport.themeColor`): lib/ui applyTheme() keeps it in
   sync with the in-app theme, and React never re-mounts or removes it. Colors match --canvas. */
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem('traxr:theme')||'"system"');var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;if(d)e.classList.add('dark');e.style.colorScheme=d?'dark':'light';var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}m.setAttribute('content',d?'#0c1a2c':'#f9f7f7');}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
