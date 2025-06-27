import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      restaurant_id?: string | null;
      restaurant_name?: string | null;
      admin_id?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string | null;
    restaurant_id?: string | null;
    restaurant_name?: string | null;
    onboarding_completed?: boolean;
    admin_id?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    restaurant_id?: string | null;
    restaurant_name?: string | null;
    onboarding_completed?: boolean;
    admin_id?: string | null;
  }
}
