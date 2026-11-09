import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "cn";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      aria-label="Color del tema"
      className={cn(
        "flex h-8 w-44 items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 text-sm outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Value />
      <SelectPrimitive.Icon>
        <ChevronDown className="text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectPopup({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="z-50" sideOffset={4}>
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            "min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md",
            className,
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none data-[highlighted]:bg-muted",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectTrigger, SelectPopup, SelectItem };
