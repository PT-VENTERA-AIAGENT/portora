import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />
      {children}
      <Toaster position="bottom-center" richColors />
    </div>
  );
}
