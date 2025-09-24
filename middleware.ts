export { default } from "next-auth/middleware";

// protect all routes inside /dashboard
export const config = {
  matcher: ["/dashboard/:path*"], 
};
