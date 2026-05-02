import {
  forwardRef,
  type ElementType,
  type ComponentPropsWithoutRef,
  type Ref,
  type ComponentType,
} from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "ghost" | "outline";

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "color">; // exclude common conflict

export const Button = forwardRef(
  <T extends ElementType = "button">(
    { className, variant = "primary", as, ...props }: PolymorphicProps<T>,
    ref: Ref<Element>,
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-full px-5 py-2.5 min-h-[44px] sm:min-h-[auto] text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md",
      ghost: "text-gray-600 border border-transparent hover:text-gray-900 hover:bg-gray-100/80",
      outline: "border border-gray-300 text-gray-900 hover:bg-gray-50 bg-white hover:border-gray-400",
    };

    const Component = (as || "button") as ComponentType<any>;
    const tone = variant ?? "primary";

    return (
      <Component ref={ref as never} className={cn(base, variants[tone], className)} {...(props as any)} />
    );
  },
);

Button.displayName = "Button";
