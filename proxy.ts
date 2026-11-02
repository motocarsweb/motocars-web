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
    const { data: perfil, error } = await supabase
      .from("usuarios_permisos")
      .select("rol, activo, codigo_referido")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !perfil?.activo || !["administrador", "vendedor"].includes(perfil.rol)) {
      if (!esLogin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      return response;
    }

    if (esLogin) {
      const url = request.nextUrl.clone();
      url.pathname = perfil.rol === "administrador" ? "/admin/dashboard" : "/admin/referidos";
      return NextResponse.redirect(url);
    }

    if (perfil.rol === "vendedor" &&
        (pathname !== "/admin/referidos" || !perfil.codigo_referido)) {
      const url = request.nextUrl.clone();
      url.pathname = perfil.codigo_referido ? "/admin/referidos" : "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};