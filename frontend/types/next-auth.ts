import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      restaurant_id?: string | null;
      restaurant_name?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string | null;
    restaurant_id?: string | null;
    restaurant_name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    role?: string | null;
    restaurant_id?: string | null;
    restaurant_name?: string | null;
  }
}
