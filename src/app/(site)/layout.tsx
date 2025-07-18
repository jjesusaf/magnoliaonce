import FloristNavbar from "@/components/layouts/navbar"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>
    <FloristNavbar />
    {children}
  </div>;
}