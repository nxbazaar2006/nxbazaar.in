import LayoutClient from "./LayoutClient";
import React from "react";
export default function Layout({ children,
}: { children: React.ReactNode;
}) { return <LayoutClient>{children}</LayoutClient>;
}
