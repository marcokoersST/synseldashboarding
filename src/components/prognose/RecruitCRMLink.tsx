import logo from "@/assets/recruitcrm-logo.png";
import { cn } from "@/lib/utils";

const URL = "https://app.recruitcrm.io/v1/candidates";

interface Props {
  size?: number;
  className?: string;
  title?: string;
}

export function RecruitCRMLink({ size = 18, className, title = "Open in Recruit CRM" }: Props) {
  return (
    <a
      href={URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center justify-center rounded-md overflow-hidden hover:opacity-80 transition-opacity shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
      title={title}
    >
      <img src={logo} alt="RecruitCRM" className="w-full h-full object-contain" />
    </a>
  );
}

export const RECRUITCRM_URL = URL;
