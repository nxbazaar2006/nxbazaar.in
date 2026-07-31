import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { cn } from "@/lib/utils";

export type PageHeaderProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  heading: string;
  linkTitle?: string;
  href?: string;
  headingClassName?: string;
  actionClassName?: string;
  actions?: React.ReactNode;
};

function PageHeaderComponent({
  heading,
  linkTitle,
  href,
  className,
  headingClassName,
  actionClassName,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "liquid-card page-header-glass mb-5 flex w-full flex-col gap-5 rounded-[30px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 lg:px-8 lg:py-6",
        className,
      )}
      {...props}
    >
      <Heading
        title={heading}
        className={cn(
          "min-w-0 break-words text-2xl sm:text-3xl lg:text-4xl",
          headingClassName,
        )}
      />
      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:gap-4">
        {actions}
        {href && linkTitle ? (
          <LiquidGlassButton
            asChild
            variant="primary"
            size="sm"
            rightIcon={<Plus className="h-4 w-4" />}
            className={cn(
              "dashboard-glass-button dashboard-create-button !text-white [&_*]:!text-white [&_svg]:!stroke-white",
              actionClassName,
            )}
          >
            <Link
              href={href}
              style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff", fontSize: "0.875rem", fontWeight: 600 }}
            >
              <span
                className="button-white-label"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff", fontSize: "0.875rem", fontWeight: 600 }}
              >
                {linkTitle}
              </span>
            </Link>
          </LiquidGlassButton>
        ) : null}
      </div>
    </header>
  );
}

export const PageHeader = React.memo(PageHeaderComponent);
export default PageHeader;
