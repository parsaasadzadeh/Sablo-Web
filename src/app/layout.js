import './globals.css';
import RegisterSW from './register-sw';

export const metadata = {
  title: "Sablo",
  description: "مدیریت هوشمند مالی",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}