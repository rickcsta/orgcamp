import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import pool from "@/lib/db";

async function getUserByEmail(email) {
  const client = await pool.connect();
  const res = await client.query(
    "SELECT id, email, senha FROM usuario_admin WHERE email = $1",
    [email]
  );
  client.release();
  return res.rows[0] || null;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, senha } = credentials;
          
          if (!email || !senha) {
            throw new Error("Email e senha são obrigatórios");
          }

          const user = await getUserByEmail(email);
          if (!user) return null;

          const isValid = await compare(senha, user.senha);
          if (!isValid) return null;

          return {
            id: user.id.toString(),
            email: user.email
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, 
  },

  jwt: {
    maxAge: 4 * 60 * 60, 
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === "development"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions };