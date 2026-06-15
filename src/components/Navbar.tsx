import { FC, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Logo } from "./Logo";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: "home", label: "Beranda" },
    { id: "properties", label: "Properti" },
    { id: "portfolio", label: "Portofolio" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1D3A2F] bg-[#0F1923]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate("home")} className="cursor-pointer">
            <Logo size="sm" />
          </button>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === link.id
                    ? "text-[#5DCAA5]"
                    : "text-[#9FE1CB] hover:text-[#E1F5EE]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet + Hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <WalletMultiButton className="!bg-[#1D9E75] hover:!bg-[#5DCAA5] !text-white !font-semibold !text-sm !rounded-lg !h-9 !px-4" />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#9FE1CB] cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1D3A2F] bg-[#0F1923] px-4 py-4 space-y-3">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileOpen(false);
              }}
              className={`block w-full text-left text-sm font-medium py-2 cursor-pointer ${
                currentPage === link.id ? "text-[#5DCAA5]" : "text-[#9FE1CB]"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2">
            <WalletMultiButton className="!bg-[#1D9E75] !text-white !font-semibold !text-sm !rounded-lg !h-9 !w-full" />
          </div>
        </div>
      )}
    </nav>
  );
};
