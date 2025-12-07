import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CustomJwtSessionClaims } from "@repo/types";


const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",     
  "/unauthorize(.*)",  
]);

export default clerkMiddleware(async (auth, req) => {

  if (!isPublicRoute(req)) {

    await auth.protect();

    const { userId, sessionClaims } = await auth();

    if (userId && sessionClaims) {
      const userRole = (sessionClaims as CustomJwtSessionClaims).metadata?.role;

      if (userRole !== "admin") {
        await auth.protect();

      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals & static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Luôn chạy cho API routes
    "/(api|trpc)(.*)",
  ],
};
