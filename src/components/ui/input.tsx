import { cn } from "cn";
import type * as React from "react";

function Input({
  className,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <input
      ref={ref}
      data-slot="input"
      className={cn(
        "h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
