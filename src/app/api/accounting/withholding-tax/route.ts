import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();

  // RBAC 검증
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  try {
    const records = await prisma.payrollRecord.findMany({
      where: { year },
      select: {
        year: true,
        month: true,
        totalGross: true,
        totalTaxable: true,
        incomeTax: true,
        localIncomeTax: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Failed to fetch payroll records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
