export const metadata = {
  title: 'Bugable Worker',
  description: 'Job worker for Bugable QA engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
