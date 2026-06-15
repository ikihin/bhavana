import { useState, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { BuyModal } from "./components/BuyModal";
import { HomePage } from "./pages/HomePage";
import { PropertiesPage } from "./pages/PropertiesPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { PropertyOnChain } from "./hooks/useProperties";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [buyModalProperty, setBuyModalProperty] = useState<PropertyOnChain | null>(null);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleInvest = useCallback((property: PropertyOnChain) => {
    setBuyModalProperty(property);
  }, []);

  const handleBuySuccess = useCallback(() => {
    setBuyModalProperty(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1923] text-[#E1F5EE] font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#162230",
            color: "#E1F5EE",
            border: "1px solid #1D3A2F",
          },
        }}
      />

      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === "home" && (
        <HomePage onNavigate={handleNavigate} onInvest={handleInvest} />
      )}
      {currentPage === "properties" && (
        <PropertiesPage onInvest={handleInvest} />
      )}
      {currentPage === "portfolio" && (
        <PortfolioPage onNavigate={handleNavigate} />
      )}

      {/* Buy Modal */}
      {buyModalProperty && (
        <BuyModal
          property={buyModalProperty}
          onClose={() => setBuyModalProperty(null)}
          onSuccess={handleBuySuccess}
        />
      )}
    </div>
  );
}

export default App;
