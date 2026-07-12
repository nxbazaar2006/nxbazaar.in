import { jwtVerify } from "jose";
import { NextResponse, NextRequest } from "next/server";

export const config = {
  matcher: ["/login", "/logout", "/dashboard", "/chat", "/team"],
};

// Defined here because it was not fetching from .env
const JWT_SECRET = "mysecret";

// verify if user is authenticated
const isAuthenticated = async (sessionToken) => {
  try {
    const userSession = await jwtVerify(
      sessionToken,
      new TextEncoder().encode(JWT_SECRET)
    );
    return userSession;
  } catch (e) {
    return false;
  }
};

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  try {
    const sessionToken = request.cookies.get("sessionToken")?.value || null;

    if (request.nextUrl.pathname === "/logout") {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.set({
        name: "sessionToken",
        value: "",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    // If there is no sessionToken, redirect to the login page
    if (!sessionToken) {
      console.log("No sessionToken");
      // If the user is already on the login page, continue
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
      }
      // Redirect the user to login page if not logged in
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
