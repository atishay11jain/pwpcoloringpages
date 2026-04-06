/**
 * NextAuth.js Configuration
 *
 * Simple credentials-based authentication for admin panel.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';
import { getAdminUser, createAdminUser } from './db';
import { v4 as uuidv4 } from 'uuid';

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    username: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        console.log('[AUTH] Login attempt for username:', username);

        try {
          // Try to get user from database
          console.log('[AUTH] Checking database for user...');
          let user = await getAdminUser(username);
          console.log('[AUTH] User from DB:', user ? 'Found' : 'Not found');

          // If no users exist and using env credentials, create initial admin
          if (!user && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH) {
            console.log('[AUTH] No user in DB, checking env credentials...');
            console.log('[AUTH] Env username:', process.env.ADMIN_USERNAME);
            console.log('[AUTH] Env password hash:', process.env.ADMIN_PASSWORD_HASH);
            console.log('[AUTH] Username match:', username === process.env.ADMIN_USERNAME);

            if (username === process.env.ADMIN_USERNAME) {
              console.log('[AUTH] Comparing password with env hash...');
              console.log('[AUTH] Password entered:', password);
              const envPasswordMatch = await compare(password, process.env.ADMIN_PASSWORD_HASH);
              console.log('[AUTH] Env password match:', envPasswordMatch);

              if (envPasswordMatch) {
                // Create the admin user in database
                console.log('[AUTH] Creating admin user in database...');
                const newUser = {
                  id: `usr_${uuidv4()}`,
                  username: process.env.ADMIN_USERNAME,
                  password_hash: process.env.ADMIN_PASSWORD_HASH,
                };

                await createAdminUser(newUser);
                console.log('[AUTH] Admin user created successfully');
                user = await getAdminUser(username);
                console.log('[AUTH] Retrieved created user:', user ? 'Success' : 'Failed');
              }
            }
          }

          if (!user) {
            console.log('[AUTH] No user found, authentication failed');
            return null;
          }

          // Verify password
          console.log('[AUTH] Verifying password...');
          const isValid = await compare(password, user.password_hash);
          console.log('[AUTH] Password valid:', isValid);

          if (!isValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          console.log('[AUTH] Authentication successful for user:', user.username);
          return {
            id: user.id,
            username: user.username,
          };
        } catch (error) {
          console.error('[AUTH] Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
      };
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

/**
 * Hash a password for storage
 * Use this to generate ADMIN_PASSWORD_HASH env variable
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Check if the current user is authenticated (admin)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get the current session or throw if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Get the current session or throw if not authenticated (same as requireAuth)
 */
export async function requireAdmin() {
  return await requireAuth();
}
