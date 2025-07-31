import { and, eq } from "drizzle-orm";
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";
import { db } from "./db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  type NewUser,
  type NewAccount,
  type NewSession,
  type NewVerificationToken,
} from "@/db/schema";

export function DrizzleAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const userId = crypto.randomUUID();
      
      await db.insert(users).values({
        id: userId,
        email: data.email,
        emailVerified: data.emailVerified,
        name: data.name,
        image: data.image,
      } as NewUser);

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0]);

      if (!user) throw new Error("User not found");

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUser(id: string) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUserByEmail(email: string) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const account = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        )
        .then((res) => res[0]);

      if (!account) return null;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, account.userId))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      await db
        .update(users)
        .set({
          email: data.email,
          emailVerified: data.emailVerified,
          name: data.name,
          image: data.image,
        })
        .where(eq(users.id, data.id));

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, data.id))
        .then((res) => res[0]);

      if (!user) throw new Error("User not found");

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async deleteUser(userId: string) {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(account: AdapterAccount) {
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      } as NewAccount);
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        );
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      await db.insert(sessions).values({
        id: crypto.randomUUID(),
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as NewSession);

      return session;
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .then((res) => res[0]);

      if (!session) return null;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
        },
      };
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
      await db
        .update(sessions)
        .set({
          userId: session.userId,
          expires: session.expires,
        })
        .where(eq(sessions.sessionToken, session.sessionToken));

      const updatedSession = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, session.sessionToken))
        .then((res) => res[0]);

      if (!updatedSession) return null;

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId,
        expires: updatedSession.expires,
      };
    },

    async deleteSession(sessionToken: string) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(token: { identifier: string; token: string; expires: Date }) {
      await db.insert(verificationTokens).values({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      } as NewVerificationToken);

      return token;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const verificationToken = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .then((res) => res[0]);

      if (!verificationToken) return null;

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        );

      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
  };
}