import { ReactNode } from "react";

interface ConsultantLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function ConsultantLayout({ children, title, subtitle }: ConsultantLayoutProps) {
  return (
    <>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </>
  );
}
