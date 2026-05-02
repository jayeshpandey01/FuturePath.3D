type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeaderProps) => {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow ? (
        <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold">{eyebrow}</span>
      ) : null}
      <h2 className="text-[1.75rem] sm:text-3xl lg:text-[2.5rem] tracking-tight font-semibold text-gray-900 leading-tight">{title}</h2>
      {subtitle ? <p className="text-gray-600 max-w-3xl text-[15px] sm:text-base leading-relaxed">{subtitle}</p> : null}
    </div>
  );
};
