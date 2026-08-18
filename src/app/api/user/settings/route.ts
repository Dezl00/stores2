import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderUpdatesEnabled } = await req.json();

    if (typeof orderUpdatesEnabled === "boolean") {
      await prisma.storeUser.update({
        where: { id: session.user.id },
        data: { orderUpdatesEnabled }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

