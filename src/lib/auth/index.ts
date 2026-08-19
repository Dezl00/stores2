import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface User {
    id?: string
    role?: string
    permissions?: string[]
    phone?: string
    storeId?: string
    context?: 'platform' | 'store'
  }
  interface Session {
    user: User & {
      id?: string
      role?: string
      permissions?: string[]
      phone?: string
      storeId?: string
      context?: 'platform' | 'store'
    }
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: "Phone/Email", type: "text" },
        password: { label: "Password", type: "password" },
        context: { label: "Context", type: "text" }, // 'platform' or 'store'
        storeId: { label: "Store ID", type: "text" }, // required if context === 'store'
        autoLoginToken: { label: "Auto Login Token", type: "text" }
      },
      async authorize(credentials) {
        const autoLoginToken = credentials?.autoLoginToken as string;
        const context = credentials?.context as string;

        if (autoLoginToken) {
          try {
            const [userId, timestamp, hash] = autoLoginToken.split(":");
            const crypto = await import("crypto");
            const secret = process.env.AUTH_SECRET || "matjark-platform-secret-key-change-me";
            const expectedHash = crypto.createHmac("sha256", secret).update(`${userId}:${timestamp}`).digest("hex");
            
            if (hash !== expectedHash || Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
              return null;
            }

            if (context === "superadmin") {
              const platformUser = await db.platformUser.findUnique({ where: { id: userId } });
              if (!platformUser || !platformUser.isActive) return null;
              return {
                id: platformUser.id,
                email: platformUser.email,
                name: platformUser.name,
                role: platformUser.role,
                context: 'platform',
              }
            }

            const storeUser = await db.storeUser.findUnique({ where: { id: userId } });
            if (!storeUser || !storeUser.isActive) return null;

            return {
              id: storeUser.id,
              email: storeUser.email || undefined,
              phone: storeUser.phone || undefined,
              name: storeUser.name || undefined,
              role: storeUser.role,
              permissions: storeUser.permissions,
              storeId: storeUser.storeId,
              context: 'store',
            }
          } catch (e) {
            return null;
          }
        }

        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const resolvedContext = context || 'store'
        const password = credentials.password as string
        const identifier = credentials.phone as string // can be email or phone

        // ----------------------------------------------------
        // SUPER ADMIN AUTHENTICATION
        // ----------------------------------------------------
        if (resolvedContext === 'superadmin') {
          const platformUser = await db.platformUser.findUnique({
            where: { email: identifier }
          })
          
          if (platformUser && platformUser.passwordHash && platformUser.isActive) {
            const isValid = await bcrypt.compare(password, platformUser.passwordHash)
            if (isValid) {
              return {
                id: platformUser.id,
                email: platformUser.email,
                name: platformUser.name,
                role: platformUser.role,
                context: 'platform',
              }
            }
          }
          return null
        }

        // ----------------------------------------------------
        // PLATFORM CENTRAL LOGIN (MERCHANTS & SUPER ADMINS)
        // ----------------------------------------------------
        if (resolvedContext === 'platform') {
          // 1. Try Platform Admin first, so they don't get trapped if they don't have the app. subdomain
          const platformUser = await db.platformUser.findUnique({
            where: { email: identifier }
          })
          
          if (platformUser && platformUser.passwordHash && platformUser.isActive) {
            const isValid = await bcrypt.compare(password, platformUser.passwordHash)
            if (isValid) {
              return {
                id: platformUser.id,
                email: platformUser.email,
                name: platformUser.name,
                role: platformUser.role,
                context: 'platform',
              }
            }
          }

          // 2. Fallback: Check if they are a Store Owner logging in via the platform
          const storeUser = await db.storeUser.findFirst({
            where: {
              OR: [{ email: identifier }, { phone: identifier }],
              isActive: true,
              role: { in: ['STORE_OWNER', 'MANAGER'] }
            }
          })

          if (storeUser && storeUser.passwordHash) {
            let isValid = false
            if (storeUser.passwordHash.startsWith("$2")) {
              isValid = await bcrypt.compare(password, storeUser.passwordHash)
            } else {
              isValid = password === storeUser.passwordHash
            }

            if (isValid) {
              return {
                id: storeUser.id,
                email: storeUser.email || undefined,
                phone: storeUser.phone || undefined,
                name: storeUser.name || undefined,
                role: storeUser.role,
                permissions: storeUser.permissions,
                storeId: storeUser.storeId,
                context: 'store', // They belong to a store
              }
            }
          }

          return null
        }

        // ----------------------------------------------------
        // STORE AUTHENTICATION (OWNER / MANAGER / CUSTOMER)
        // ----------------------------------------------------
        if (resolvedContext === 'store') {
          const storeId = credentials.storeId as string
          if (!storeId) return null

          // Try finding by phone first, then email (scoped by storeId)
          let storeUser = await db.storeUser.findUnique({
            where: { phone_storeId: { phone: identifier, storeId } }
          })

          if (!storeUser) {
            storeUser = await db.storeUser.findUnique({
              where: { email_storeId: { email: identifier, storeId } }
            })
          }

          if (!storeUser || !storeUser.passwordHash || !storeUser.isActive) return null

          let isValid = false
          if (storeUser.passwordHash.startsWith("$2")) {
            isValid = await bcrypt.compare(password, storeUser.passwordHash)
          } else {
            // Legacy plaintext support during migration
            isValid = password === storeUser.passwordHash
            if (isValid) {
              const hashedPassword = await bcrypt.hash(password, 10)
              await db.storeUser.update({
                where: { id: storeUser.id },
                data: { passwordHash: hashedPassword }
              })
            }
          }

          if (!isValid) return null

          return {
            id: storeUser.id,
            email: storeUser.email || undefined,
            phone: storeUser.phone || undefined,
            name: storeUser.name || undefined,
            role: storeUser.role,
            permissions: storeUser.permissions,
            storeId: storeUser.storeId,
            context: 'store',
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
        token.id = user.id
        token.phone = user.phone
        token.storeId = user.storeId
        token.context = user.context
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as string[]) || []
        session.user.id = token.id as string
        session.user.phone = token.phone as string
        session.user.storeId = token.storeId as string
        session.user.context = token.context as ('platform' | 'store')
      }
      return session
    }
  },
  pages: {
    signIn: '/login', // Store login (Platform login will be at /platform/login)
  },
  session: {
    strategy: "jwt"
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
