interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-300 border-t-purple-600 ${sizeClass}`}
      aria-label="Loading"
    />
  );
}

export default Spinner;
