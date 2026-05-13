import './globals.css';

export const metadata = {
  title: 'Property Intake Form',
  description: 'Real estate listing intake form for agents'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
