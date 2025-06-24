import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          const { rows } = await pool.query(
            "SELECT * FROM admins WHERE email = $1",
            [credentials.email]
          );

          if (rows.length === 0) {
            return null;
          }

          const admin = rows[0];

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            admin.password_hash
          );

          if (passwordMatch) {
            let restaurantName = null;
            if (admin.restaurant_id) {
              const { rows: restaurantRows } = await pool.query(
                "SELECT name FROM restaurants WHERE id = $1",
                [admin.restaurant_id]
              );
              if (restaurantRows.length > 0) {
                restaurantName = restaurantRows[0].name;
              }
            }

            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              restaurant_id: admin.restaurant_id,
              restaurant_name: restaurantName,
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
    signIn: "/auth/signin",
  },
});
