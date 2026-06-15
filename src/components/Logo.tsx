import { FC } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8",
  md: "h-16",
  lg: "h-24",
};

export const Logo: FC<LogoProps> = ({ size = "sm", className = "" }) => {
  return (
    <img
      src="/logo.png"
      alt="Bhavana"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};
