type DanceMarkProps = {
  variant?: "hero" | "small" | "tilt";
};

export function DanceMark({ variant = "small" }: DanceMarkProps) {
  const source =
    variant === "hero" ? "/images/dancing-5.svg" : "/images/dancing-7.svg";

  return (
    <div className={`dance-mark dance-mark--${variant}`} aria-hidden="true">
      <img src={source} alt="" />
    </div>
  );
}
