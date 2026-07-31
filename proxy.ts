import authProxy from "@/auth";

export default authProxy;

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/dashboard/:path*", "/account/:path*", "/checkout/:path*"],
};
