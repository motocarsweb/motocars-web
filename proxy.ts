import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const esLogin = pathname === "/admin/login";
  const esAdmin = pathname.startsWith("/admin");

  if (esAdmin && !esLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && esAdmin) {
    const { data: perfil, error: errorPerfil } = await supabase
      .from("usuarios_permisos")
      .select("rol, activo, puede_presupuestos")
      .eq("user_id", user.id)
      .maybeSingle();

    // Ante cualquier error o perfil inactivo, denegar acceso a las páginas protegidas.
    if (errorPerfil || !perfil || !perfil.activo ||
        (perfil.rol !== "administrador" && perfil.rol !== "vendedor")) {
      if (!esLogin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      return response;
    }

    if (esLogin) {
      const url = request.nextUrl.clone();
      url.pathname = perfil.rol === "administrador"
        ? "/admin/dashboard"
        : "/admin/referidos";
      return NextResponse.redirect(url);
    }

    if (perfil.rol === "vendedor" && pathname !== "/admin/referidos" &&
        !(perfil.puede_presupuestos && pathname === "/admin/referidos/presupuestos/nuevo")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/referidos";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};