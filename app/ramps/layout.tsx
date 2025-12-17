import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "On/Off Ramps • CELO Mexico",
  description: "Gestiona tus on/off ramps en CELO Mexico",
};

export default function RampsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ramps-layout">
      {children}
    </div>
  );
}
