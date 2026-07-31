"use client";
import { cn } from "@/lib/utils";
import * as React from "react"; const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( ({ className, ...props }, ref) => ( <div ref={ref} role="alert" className={cn("rounded-lg border p-4", className)} {...props} /> )
);
Alert.displayName = "Alert"; const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>( ({ className, ...props }, ref) => ( <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-normal", className)} {...props} /> )
);
AlertTitle.displayName = "AlertTitle"; const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm", className)} {...props} />
);
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertDescription, AlertTitle };
