import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password_hash) return null;
        if (user.status !== 'active') return null;

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
          throw new Error('ACCOUNT_LOCKED');
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValid) {
          await prisma.users.update({
            where: { id: user.id },
            data: {
              login_fail_count: { increment: 1 },
              ...(user.login_fail_count >= 4
                ? { locked_until: new Date(Date.now() + 30 * 60 * 1000) }
                : {}),
            },
          });
          return null;
        }

        await prisma.users.update({
          where: { id: user.id },
          data: { login_fail_count: 0, locked_until: null },
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.display_name,
          image: user.profile_photo_url,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = String(dbUser.id);
          token.role = dbUser.role;
          token.displayName = dbUser.display_name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        if (!user.email) return true;

        const existingUser = await prisma.users.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.users.create({
            data: {
              email: user.email,
              display_name: user.name || user.email.split('@')[0],
              profile_photo_url: user.image || null,
              email_verified: true,
              terms_agreed_at: new Date(),
              privacy_agreed_at: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
