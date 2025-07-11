import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error || !admin) {
            return null;
          }

          const passwordMatch = await compare(
            credentials.password as string,
            admin.password_hash
          );

          if (passwordMatch) {
            let restaurantName = null;
            if (admin.restaurant_id) {
              const { data: restaurant } = await supabaseAdmin
                .from('restaurants')
                .select('name')
                .eq('id', admin.restaurant_id)
                .single();
              
              if (restaurant) {
                restaurantName = restaurant.name;
              }
            }

            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              restaurant_id: admin.restaurant_id,
              restaurant_name: restaurantName,
              onboarding_completed: admin.onboarding_completed,
              admin_id: admin.id,
              telegram_chat_id: admin.telegram_chat_id,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Database query error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: `/auth/${process.env.ADMIN_LOGIN_HASH}`,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "update") {
        // Fetch fresh user data from database on session update
        try {
          const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('id', token.id)
            .single();

          if (!error && admin) {
            token.restaurant_id = admin.restaurant_id;
            token.onboarding_completed = admin.onboarding_completed;
            token.telegram_chat_id = admin.telegram_chat_id;
            
            // Fetch restaurant name if restaurant_id exists
            if (admin.restaurant_id) {
              const { data: restaurant } = await supabaseAdmin
                .from('restaurants')
                .select('name')
                .eq('id', admin.restaurant_id)
                .single();
              
              if (restaurant) {
                token.restaurant_name = restaurant.name;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
        }
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurant_id = user.restaurant_id;
        token.restaurant_name = user.restaurant_name;
        token.onboarding_completed = user.onboarding_completed;
        token.admin_id = user.admin_id;
        token.telegram_chat_id = user.telegram_chat_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.restaurant_id = token.restaurant_id as string | null;
        session.user.restaurant_name = token.restaurant_name as string | null;
        session.user.onboarding_completed = token.onboarding_completed as boolean;
        session.user.admin_id = token.admin_id as string | null;
        session.user.telegram_chat_id = token.telegram_chat_id as number | null;
      }
      return session;
    },
  },
});
