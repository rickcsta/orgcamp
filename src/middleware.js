import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Se o token existe, o usuário está autenticado
    // Pode adicionar lógica adicional aqui se necessário
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Rotas públicas
        if (
          pathname === "/login" ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/api") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // Rotas protegidas
        if (pathname.startsWith("/admin")) {
          return !!token; // Retorna true se token existe
        }

        // Para outras rotas, permitir acesso
        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};