import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={twMerge("flex justify-center items-center p-4", className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}
