import './globals.css';
import type { Metadata } from 'next';
const base=process.env.SITE_URL||'https://thuraya-alshamsi.gate-digital.com';
export const metadata: Metadata = { metadataBase:new URL(base), title: 'ثريا الشامسي | معرفة • استدامة • أثر مجتمعي', description: 'منصة ثريا الشامسي الشخصية للمعرفة والاستدامة والابتكار المسؤول وجودة الحياة والأثر المجتمعي.', icons:{icon:'/brand/thuraya-mark.svg'}, openGraph:{images:['/brand/og-default.svg']} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ar" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html> }
