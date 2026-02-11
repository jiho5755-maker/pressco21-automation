// 송미 직원 추가 스크립트 (Phase 3-D 테스트용)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("송미 직원 추가 중...");

  // 1. 마케팅팀 조회
  const marketingDept = await prisma.department.findFirst({
    where: { name: "마케팅팀" },
  });

  if (!marketingDept) {
    throw new Error("마케팅팀을 찾을 수 없습니다.");
  }

  // 2. 송미 직원 생성 (임신 중, 출산 예정: 2025.03.10)
  // 기존 직원 삭제 (있을 경우)
  await prisma.employee.deleteMany({
    where: { employeeNo: "EMP999" },
  });

  const songmi = await prisma.employee.create({
    data: {
      employeeNo: "EMP999",
      name: "송미",
      email: "songmi@company.com",
      phone: "010-1234-5678",
      birthDate: new Date("1992-05-15"), // 33세
      address: "서울시 강남구",
      childrenUnder20: 0, // 첫 자녀 임신 중
      departmentId: marketingDept.id,
      position: "주임",
      joinDate: new Date("2022-03-01"), // 입사 3년 차
      contractType: "REGULAR",
      weeklyWorkHours: 40,
      workStartTime: "09:00",
      workEndTime: "18:00",
      breakMinutes: 60,
      workType: "OFFICE",
      salaryType: "MONTHLY",
      baseSalary: 2800000, // 기본급 280만원
      mealAllowance: 200000, // 식대 20만
      transportAllowance: 200000, // 교통비 20만
      positionAllowance: 100000, // 직책수당 10만
      taxFreeMeal: true,
      taxFreeTransport: true,
      useFixedOT: false,
      nationalPension: true,
      healthInsurance: true,
      employmentInsurance: true,
      industrialAccident: true,
      dependents: 2, // 배우자 포함
      status: "ACTIVE", // 현재 재직 중 (임신 중)
      bankName: "국민은행",
      bankAccount: "123-456-789012",
    },
  });

  console.log(`  ✓ 송미 직원 생성 완료: ${songmi.name} (${songmi.employeeNo})`);

  // 3. 근무 스케줄 생성 (월~금, 9:00~18:00)
  const weekDays = [1, 2, 3, 4, 5]; // 월화수목금
  for (const day of weekDays) {
    await prisma.workSchedule.upsert({
      where: {
        employeeId_dayOfWeek_effectiveFrom: {
          employeeId: songmi.id,
          dayOfWeek: day,
          effectiveFrom: new Date("2022-03-01"),
        },
      },
      update: {},
      create: {
        employeeId: songmi.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isRemote: false,
        isWorkDay: true,
        effectiveFrom: new Date("2022-03-01"),
        effectiveTo: null,
      },
    });
  }

  console.log("  ✓ 근무 스케줄 생성 완료 (월~금, 9:00~18:00)");
  console.log("\n송미 직원 정보:");
  console.log(`  - 사번: ${songmi.employeeNo}`);
  console.log(`  - 이름: ${songmi.name}`);
  console.log(`  - 부서: 마케팅팀`);
  console.log(`  - 직급: 주임`);
  console.log(`  - 입사일: 2022-03-01`);
  console.log(`  - 총 급여: ${(songmi.baseSalary + songmi.mealAllowance + songmi.transportAllowance + songmi.positionAllowance).toLocaleString()}원`);
  console.log(`  - 상태: 재직 (임신 중)`);
  console.log("\n다음 단계:");
  console.log("  1. 임신기 근로시간 단축 급여 신청 (2024년 12월)");
  console.log("  2. 근태 자동 생성 (2024년 12월, 단축근무)");
  console.log("  3. http://localhost:3000/subsidies 에서 신청");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
