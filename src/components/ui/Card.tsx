import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

type CardProps = {
  title?: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export const Card = ({ title, eyebrow, icon, subtitle, children, actions, className }: CardProps) => {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6 flex flex-col gap-3 min-w-0 bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500 font-bold">{eyebrow}</span>
      ) : null}
      <div className="flex items-start gap-3 min-w-0">
        {icon ? <div className="mt-1 text-primary">{icon}</div> : null}
        <div className="space-y-1.5 min-w-0 flex-1">
          {title ? <h3 className="text-lg font-semibold text-gray-900 leading-snug break-words">{title}</h3> : null}
          {subtitle ? <p className="text-sm text-gray-600 break-words leading-relaxed">{subtitle}</p> : null}
          {children ? <div className="text-sm text-gray-600 break-words leading-relaxed">{children}</div> : null}
        </div>
      </div>
      {actions ? <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2 mt-auto">{actions}</div> : null}
    </div>
  );
};
