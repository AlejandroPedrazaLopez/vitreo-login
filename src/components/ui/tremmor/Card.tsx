// Tremor Card [v1.0.0]

import React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cx } from "../../../lib/utils";

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

interface CardHeaderProps extends React.ComponentPropsWithoutRef<"div"> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div";
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          // base
          "relative w-full rounded-lg border p-6 text-left shadow-xs",
          // background color
          "bg-white dark:bg-[#090E1A]",
          // border color
          "border-gray-200 dark:border-gray-900",
          className
        )}
        tremor-id="tremor-raw"
        {...props}
      />
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cx("flex flex-col gap-2", className)}
        {...props}
      />
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cx("flex flex-col gap-2", className)}
        {...props}
      />
    );
  }
);

interface CardContentProps extends React.ComponentPropsWithoutRef<"div"> {}

interface CardDescriptionProps extends React.ComponentPropsWithoutRef<"div"> {}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <p
        ref={forwardedRef}
        className={cx("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cx("text-lg font-semibold", className)}
        {...props}
      />
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div ref={forwardedRef} className={cx("flex flex-col gap-2", className)} {...props} />
    );
  }
);

interface CardFooterProps extends React.ComponentPropsWithoutRef<"div"> {}

Card.displayName = "Card";

interface CardTitleProps extends React.ComponentPropsWithoutRef<"div"> {}

export {
  Card,
  type CardProps,
  CardHeader,
  type CardHeaderProps,
  CardContent,
  type CardContentProps,
  CardDescription,
  type CardDescriptionProps,
  CardTitle,
  type CardTitleProps,
  CardFooter,
  type CardFooterProps,
};
