import { ThemeProvider } from "@/components/providers/theme-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <ThemeProvider>
      {children}
      </ThemeProvider>
    </div>
  );
}
