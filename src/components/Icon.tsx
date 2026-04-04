interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export function Icon({ name, className = "", filled = false, size = 24 }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontFamily: "'Material Symbols Outlined Variable', 'Material Symbols Outlined'",
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "normal",
        textTransform: "none" as const,
        display: "inline-block",
        whiteSpace: "nowrap" as const,
        direction: "ltr" as const,
        WebkitFontSmoothing: "antialiased",
        fontFeatureSettings: "'liga'",
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
