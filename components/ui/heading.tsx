import * as React from "react";
import { cn } from "@/lib/utils";
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingProps = Omit< React.HTMLAttributes<HTMLHeadingElement>, "children"
> & { title?: React.ReactNode; children?: React.ReactNode; as?: HeadingLevel;
};
const headingSizeClasses: Record<HeadingLevel, string> = { h1: "text-4xl", h2: "text-2xl", h3: "text-xl", h4: "text-lg", h5: "text-base", h6: "text-sm",
}; function HeadingComponent({ title, children, as: Component = "h2", className, ...props
}: HeadingProps) { return ( <Component className={cn( "font-semibold tracking-tight text-slate-900", headingSizeClasses[Component], className )} {...props} > {children ?? title} </Component> );
}
export const Heading = React.memo(HeadingComponent);
export default Heading;
