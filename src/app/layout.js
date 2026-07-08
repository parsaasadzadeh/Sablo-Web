import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import RegisterSW from './register-sw';


export const metadata = {
  metadataBase: new URL('https://sablo.app'), // دامنه واقعی‌تو بذار
  title: {
    default: "Sablo | اپلیکیشن مدیریت مالی",
    template: "%s | Sablo",
  },
  description: "مدیریت هوشمند مالی، بودجه‌بندی و پیگیری هزینه‌ها با Sablo",
  manifest: "/manifest.json",
  applicationName: "Sablo",
  generator: "Next.js",
  keywords: ["مدیریت مالی", "بودجه‌بندی", "حسابداری شخصی", "Sablo"],
  authors: [{ name: "Sablo Team" }],
  icons: {
    icon: "appicon.png",
    apple: "appicon.png",
  },
  openGraph: {
    title: "Sablo | اپلیکیشن مدیریت مالی",
    description: "مدیریت هوشمند مالی",
    url: "https://sablo.app",
    siteName: "Sablo",
    locale: "fa_IR",
    type: "website",
  },
  verification: {
    google: "CGCtTzflYGvFEb0EdXLfG_7stO1VlLMTPethm-ZuCsc",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazir antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
