import { FC } from "react";
import { PortfolioDashboard } from "../components/PortfolioDashboard";
import { YieldPanel } from "../components/YieldPanel";

interface PortfolioPageProps {
  onNavigate: (page: string) => void;
}

export const PortfolioPage: FC<PortfolioPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E1F5EE] mb-2">Portofolio</h1>
          <p className="text-[#9FE1CB]">
            Pantau investasi dan yield dari properti yang Anda miliki
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main portfolio */}
          <div className="lg:col-span-2">
            <PortfolioDashboard onNavigateToProperties={() => onNavigate("properties")} />
          </div>

          {/* Yield panel (admin demo) */}
          <div className="lg:col-span-1">
            <YieldPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
