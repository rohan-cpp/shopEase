import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

type Body = {
  mode?: "login" | "register";
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (body.mode === "register") {
      if (existing) {
        return NextResponse.json(
          { ok: false, error: "An account with that email already exists." },
          { status: 409 },
        );
      }
      const name = (body.name ?? "").trim();
      if (name.length < 2) {
        return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
      }
      const [created] = await db
        .insert(users)
        .values({ name, email, passwordHash: hashPassword(password), role: "customer" })
        .returning();
      await createSession(created.id);
      return NextResponse.json(
        { ok: true, user: { id: created.id, name: created.name, email: created.email, role: created.role } },
        { status: 201 },
      );
    }

    if (!existing || !verifyPassword(password, existing.passwordHash)) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(existing.id);
    return NextResponse.json({
      ok: true,
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
      },
    });
  } catch (error) {
    console.error("[auth POST]", error);
    return NextResponse.json({ ok: false, error: "Authentication failed." }, { status: 500 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
