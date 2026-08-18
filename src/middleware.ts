import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of aggressive AI bots to block at the Edge
const BLOCKED_BOTS = [
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "anthropic",
  "claude",
  "bytespider",
  "ccbot",
  "amazonbot",
]

export default async function middleware(request: NextRequest) {
  // 1. Block aggressive bots instantly before anything else
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || ""
  if (BLOCKED_BOTS.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Forbidden: Bot Access Denied', { status: 403 })
  }

  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // 2. Identify Context (Platform vs Store)
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000"
  // Remove port for comparison if needed
  const cleanHost = hostname.split(':')[0]
  const cleanPlatform = platformDomain.split(':')[0]

  const isPlatform = (cleanHost === cleanPlatform || cleanHost === 'localhost' || cleanHost.startsWith('app.'))
  
  let storeSlug = ""
  if (!isPlatform) {
    if (cleanHost.endsWith(`.${cleanPlatform}`)) {
      storeSlug = cleanHost.replace(`.${cleanPlatform}`, "")
    }
  }

  // 3. Prepare outgoing headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-hostname", hostname)
  requestHeaders.set("x-platform-context", isPlatform ? "true" : "false")
  if (storeSlug) {
    requestHeaders.set("x-store-slug", storeSlug)
  }

  // 4. Basic routing protections
  // Note: Detailed auth checks (DB level) happen in layouts/server actions to keep Edge fast.
  const isPlatformAdminPath = url.pathname.startsWith('/platform')
  const isStoreAdminPath = url.pathname.startsWith('/admin')

  // Prevent accessing platform routes from a store domain
  if (isPlatformAdminPath && !isPlatform) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // The actual auth session check is done via Auth.js in layouts or via a lightweight JWT check here if needed.
  // For now, we inject headers and proceed. The auth layout will enforce login.

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  // Run middleware on all paths except static assets and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/upload).*)'],
}
