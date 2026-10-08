import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import { Toaster } from "sonner";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>
      <Navbar />
      {children}
      <Footer />
      <LeadCapturePopup />
      <Toaster position="bottom-center" richColors />
    </div>
  );
}
