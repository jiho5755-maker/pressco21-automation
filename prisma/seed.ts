// 시드 데이터 — 관리자 + 부서 + 직원11명 + 경비5건 + 근무스케줄 + 휴직이력
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("시드 데이터 생성 시작...");

  // ─── 1. 사용자 계정 (Admin/Manager/Viewer) ───
  const adminEmail = process.env.AUTH_ADMIN_EMAIL || "admin@company.com";
  const adminPassword = process.env.AUTH_ADMIN_PASSWORD || "admin1234";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "관리자",
      email: adminEmail,
      password: hashedAdminPassword,
      role: "admin",
    },
  });
  console.log(`  ✓ Admin 계정 생성: ${admin.email}`);

  // Manager 계정
  const hashedManagerPassword = await bcrypt.hash("manager1234", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@company.com" },
    update: {},
    create: {
      name: "부서장",
      email: "manager@company.com",
      password: hashedManagerPassword,
      role: "manager",
    },
  });
  console.log(`  ✓ Manager 계정 생성: ${manager.email}`);

  // Viewer 계정
  const hashedViewerPassword = await bcrypt.hash("viewer1234", 12);
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@company.com" },
    update: {},
    create: {
      name: "일반직원",
      email: "viewer@company.com",
      password: hashedViewerPassword,
      role: "viewer",
    },
  });
  console.log(`  ✓ Viewer 계정 생성: ${viewer.email}`);

  // ─── 2. 부서 6개 ───
  const departmentNames = [
    { name: "개발팀", sortOrder: 1 },
    { name: "디자인팀", sortOrder: 2 },
    { name: "마케팅팀", sortOrder: 3 },
    { name: "영업팀", sortOrder: 4 },
    { name: "인사팀", sortOrder: 5 },
    { name: "경영지원팀", sortOrder: 6 },
  ];

  const departments: Record<string, string> = {};
  for (const dept of departmentNames) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    departments[dept.name] = d.id;
  }
  console.log(`  부서 ${Object.keys(departments).length}개 생성`);

  // ─── 3. 직원 11명 (대체인력 포함) ───
  const employeesData = [
    {
      employeeNo: "EMP001",
      name: "김민수",
      email: "minsu.kim@company.com",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 테헤란로 123",
      childrenUnder20: 2,
      departmentId: departments["개발팀"],
      position: "과장",
      joinDate: new Date("2019-03-15"),
      contractType: "REGULAR",
      workType: "FLEXIBLE_HOURS",
      flexStartTime: "10:00",
      flexEndTime: "19:00",
      workStartTime: "10:00",
      workEndTime: "19:00",
      baseSalary: 4900000,
      mealAllowance: 200000,
      transportAllowance: 100000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP002",
      name: "이서연",
      email: "seoyeon.lee@company.com",
      phone: "010-2345-6789",
      address: "경기도 성남시 분당구 정자동 456",
      childrenUnder20: 1,
      departmentId: departments["디자인팀"],
      position: "대리",
      joinDate: new Date("2021-07-01"),
      contractType: "REGULAR",
      workType: "REMOTE",
      remoteWorkDays: JSON.stringify(["TUE", "THU"]),
      baseSalary: 3500000,
      mealAllowance: 200000,
      transportAllowance: 150000,
      positionAllowance: 150000,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP003",
      name: "박지훈",
      email: "jihoon.park@company.com",
      phone: "010-3456-7890",
      address: "서울특별시 마포구 상암동 789",
      childrenUnder20: 0,
      departmentId: departments["마케팅팀"],
      position: "사원",
      joinDate: new Date("2023-01-10"),
      contractType: "REGULAR",
      workType: "OFFICE",
      baseSalary: 2800000,
      mealAllowance: 200000,
      transportAllowance: 200000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP004",
      name: "최수진",
      email: "sujin.choi@company.com",
      phone: "010-4567-8901",
      address: "인천광역시 연수구 송도동 1011",
      childrenUnder20: 3,
      departmentId: departments["영업팀"],
      position: "차장",
      joinDate: new Date("2017-11-20"),
      contractType: "REGULAR",
      workType: "FLEXIBLE_HOURS",
      flexStartTime: "08:00",
      flexEndTime: "17:00",
      workStartTime: "08:00",
      workEndTime: "17:00",
      baseSalary: 5200000,
      mealAllowance: 200000,
      transportAllowance: 150000,
      positionAllowance: 250000,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP005",
      name: "정우성",
      email: "woosung.jung@company.com",
      phone: "010-5678-9012",
      address: "경기도 고양시 일산동구 백석동 1213",
      childrenUnder20: 1,
      departmentId: departments["개발팀"],
      position: "부장",
      joinDate: new Date("2015-05-03"),
      contractType: "REGULAR",
      workType: "HYBRID",
      flexStartTime: "10:00",
      flexEndTime: "19:00",
      workStartTime: "10:00",
      workEndTime: "19:00",
      remoteWorkDays: JSON.stringify(["WED"]),
      baseSalary: 5900000,
      mealAllowance: 200000,
      transportAllowance: 100000,
      positionAllowance: 300000,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP006",
      name: "한예슬",
      email: "yeseul.han@company.com",
      phone: "010-6789-0123",
      address: "서울특별시 송파구 잠실동 1415",
      childrenUnder20: 1,
      departmentId: departments["인사팀"],
      position: "대리",
      joinDate: new Date("2020-09-14"),
      contractType: "REGULAR",
      workType: "OFFICE",
      baseSalary: 3300000,
      mealAllowance: 200000,
      transportAllowance: 150000,
      positionAllowance: 150000,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ON_LEAVE",
      leaveType: "MATERNITY",
      leaveStartDate: new Date("2025-11-01"),
      leaveEndDate: new Date("2026-01-29"),
    },
    {
      employeeNo: "EMP007",
      name: "윤도현",
      email: "dohyun.yoon@company.com",
      phone: "010-7890-1234",
      address: "서울특별시 영등포구 여의도동 1617",
      childrenUnder20: 2,
      departmentId: departments["경영지원팀"],
      position: "과장",
      joinDate: new Date("2018-04-22"),
      contractType: "REGULAR",
      workType: "OFFICE",
      baseSalary: 4300000,
      mealAllowance: 200000,
      transportAllowance: 100000,
      positionAllowance: 200000,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP008",
      name: "강하늘",
      email: "haneul.kang@company.com",
      phone: "010-8901-2345",
      address: "경기도 수원시 영통구 매탄동 1819",
      childrenUnder20: 0,
      departmentId: departments["개발팀"],
      position: "사원",
      joinDate: new Date("2024-02-05"),
      contractType: "REGULAR",
      workType: "REMOTE",
      remoteWorkDays: JSON.stringify(["MON", "FRI"]),
      baseSalary: 3000000,
      mealAllowance: 200000,
      transportAllowance: 200000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
    {
      employeeNo: "EMP009",
      name: "송지효",
      email: "jihyo.song@company.com",
      phone: "010-9012-3456",
      address: "서울특별시 서초구 반포동 2021",
      childrenUnder20: 0,
      departmentId: departments["마케팅팀"],
      position: "주임",
      joinDate: new Date("2022-06-30"),
      contractType: "REGULAR",
      workType: "OFFICE",
      baseSalary: 3100000,
      mealAllowance: 200000,
      transportAllowance: 200000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "RESIGNED",
      resignDate: new Date("2025-12-31"),
      resignReason: "개인 사유",
    },
    {
      employeeNo: "EMP010",
      name: "오세훈",
      email: "sehun.oh@company.com",
      phone: "010-0123-4567",
      address: "경기도 용인시 수지구 죽전동 2223",
      childrenUnder20: 0,
      departmentId: departments["디자인팀"],
      position: "사원",
      joinDate: new Date("2024-08-19"),
      contractType: "REGULAR",
      workType: "OFFICE",
      baseSalary: 2800000,
      mealAllowance: 200000,
      transportAllowance: 200000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
  ];

  const employeeMap: Record<string, string> = {};

  for (const emp of employeesData) {
    const created = await prisma.employee.upsert({
      where: { employeeNo: emp.employeeNo },
      update: {},
      create: emp,
    });
    employeeMap[emp.employeeNo] = created.id;
  }

  // EMP011: 대체인력 (한예슬 대체)
  const emp011 = await prisma.employee.upsert({
    where: { employeeNo: "EMP011" },
    update: {},
    create: {
      employeeNo: "EMP011",
      name: "박서준",
      email: "seojun.park@company.com",
      phone: "010-1111-2222",
      address: "서울특별시 강북구 수유동 2425",
      childrenUnder20: 0,
      departmentId: departments["인사팀"],
      position: "사원",
      joinDate: new Date("2025-11-01"),
      contractType: "REPLACEMENT",
      contractEndDate: new Date("2026-02-28"),
      replacementForId: employeeMap["EMP006"],
      replacementReason: "MATERNITY",
      workType: "OFFICE",
      baseSalary: 2600000,
      mealAllowance: 200000,
      transportAllowance: 200000,
      positionAllowance: 0,
      taxFreeMeal: true,
      taxFreeTransport: true,
      status: "ACTIVE",
    },
  });
  employeeMap["EMP011"] = emp011.id;
  console.log(`  직원 ${Object.keys(employeeMap).length}명 생성 (대체인력 포함)`);

  // ─── 4. 한예슬 출산휴가 LeaveRecord ───
  await prisma.leaveRecord.create({
    data: {
      employeeId: employeeMap["EMP006"],
      type: "MATERNITY",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-01-29"),
      days: 90,
      status: "APPROVED",
      childBirthDate: new Date("2025-11-15"),
      reason: "출산전후휴가 (90일)",
    },
  });
  console.log("  한예슬 출산휴가 LeaveRecord 생성");

  // ─── 5. 연차/휴가 LeaveRecord 추가 ───
  const annualLeaves = [
    {
      employeeId: employeeMap["EMP001"],
      type: "ANNUAL",
      startDate: new Date("2026-01-06"),
      endDate: new Date("2026-01-06"),
      days: 1,
      status: "APPROVED",
      reason: "개인 사유",
    },
    {
      employeeId: employeeMap["EMP001"],
      type: "ANNUAL",
      startDate: new Date("2026-01-20"),
      endDate: new Date("2026-01-20"),
      days: 0.5,
      status: "APPROVED",
      reason: "오전 반차 (병원)",
    },
    {
      employeeId: employeeMap["EMP002"],
      type: "ANNUAL",
      startDate: new Date("2026-01-13"),
      endDate: new Date("2026-01-14"),
      days: 2,
      status: "APPROVED",
      reason: "가족 행사",
    },
    {
      employeeId: employeeMap["EMP003"],
      type: "ANNUAL",
      startDate: new Date("2026-02-09"),
      endDate: new Date("2026-02-09"),
      days: 1,
      status: "PENDING",
      reason: "개인 사유",
    },
    {
      employeeId: employeeMap["EMP005"],
      type: "ANNUAL",
      startDate: new Date("2025-12-29"),
      endDate: new Date("2025-12-31"),
      days: 3,
      status: "APPROVED",
      reason: "연말 휴가",
    },
  ];

  for (const leave of annualLeaves) {
    await prisma.leaveRecord.create({ data: leave });
  }
  console.log(`  연차 LeaveRecord ${annualLeaves.length}건 생성`);

  // ─── 6. WorkSchedule (유연근무 직원만) ───
  const effectiveFrom = new Date("2025-01-01");

  // 김민수 EMP001: 시차출퇴근 월~금 10:00-19:00
  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        employeeId: employeeMap["EMP001"],
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "19:00",
        isRemote: false,
        isWorkDay: true,
        effectiveFrom,
      },
    });
  }

  // 이서연 EMP002: 재택(화,목), 사무실(월,수,금)
  for (let day = 1; day <= 5; day++) {
    const isRemote = day === 2 || day === 4;
    await prisma.workSchedule.create({
      data: {
        employeeId: employeeMap["EMP002"],
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isRemote,
        isWorkDay: true,
        effectiveFrom,
      },
    });
  }

  // 최수진 EMP004: 시차출퇴근 월~금 08:00-17:00
  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        employeeId: employeeMap["EMP004"],
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "17:00",
        isRemote: false,
        isWorkDay: true,
        effectiveFrom,
      },
    });
  }

  // 정우성 EMP005: 하이브리드 (시차 10-19 + 재택 수)
  for (let day = 1; day <= 5; day++) {
    const isRemote = day === 3;
    await prisma.workSchedule.create({
      data: {
        employeeId: employeeMap["EMP005"],
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "19:00",
        isRemote,
        isWorkDay: true,
        effectiveFrom,
      },
    });
  }

  // 강하늘 EMP008: 재택(월,금), 사무실(화,수,목)
  for (let day = 1; day <= 5; day++) {
    const isRemote = day === 1 || day === 5;
    await prisma.workSchedule.create({
      data: {
        employeeId: employeeMap["EMP008"],
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isRemote,
        isWorkDay: true,
        effectiveFrom,
      },
    });
  }

  console.log("  유연근무 직원 5명 WorkSchedule 생성");

  // ─── 7. 경비 5건 ───
  const expensesData = [
    {
      title: "출장 택시비",
      amount: 35000,
      category: "교통비",
      date: new Date("2025-01-15"),
      description: "강남역 → 판교 오피스 출장",
      submitterId: admin.id,
      status: "APPROVED",
      approverId: admin.id,
      approvedAt: new Date("2025-01-16"),
    },
    {
      title: "팀 회식비",
      amount: 250000,
      category: "식비",
      date: new Date("2025-01-20"),
      description: "개발팀 신년 회식",
      submitterId: admin.id,
      status: "APPROVED",
      approverId: admin.id,
      approvedAt: new Date("2025-01-21"),
    },
    {
      title: "모니터 구매",
      amount: 450000,
      category: "사무용품",
      date: new Date("2025-02-01"),
      submitterId: admin.id,
      status: "PENDING",
    },
    {
      title: "AWS 교육 수강료",
      amount: 1200000,
      category: "교육비",
      date: new Date("2025-02-05"),
      description: "AWS Solutions Architect 자격증 교육",
      submitterId: admin.id,
      status: "REJECTED",
      approverId: admin.id,
      rejectReason: "예산 초과",
    },
    {
      title: "KTX 왕복 승차권",
      amount: 118000,
      category: "교통비",
      date: new Date("2025-02-08"),
      description: "부산 지사 미팅 출장",
      submitterId: admin.id,
      status: "PENDING",
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }
  console.log("  경비 5건 생성");

  // ─── 6. 휴가 기록 ───
  const leaveRecordsData = [
    {
      employeeId: employees["EMP001"].id,
      type: "ANNUAL",
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-01-12"),
      days: 3,
      status: "APPROVED",
      requestedAt: new Date("2025-01-05"),
      approvedBy: admin.id,
      approvedAt: new Date("2025-01-06"),
      reason: "가족 여행",
    },
    {
      employeeId: employees["EMP002"].id,
      type: "ANNUAL",
      startDate: new Date("2026-02-15"),
      endDate: new Date("2026-02-15"),
      days: 1,
      status: "PENDING",
      requestedAt: new Date("2026-02-10"),
      reason: "개인 사정",
    },
    {
      employeeId: employees["EMP006"].id,
      type: "MATERNITY",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-01-29"),
      days: 90,
      status: "APPROVED",
      requestedAt: new Date("2025-10-15"),
      approvedBy: admin.id,
      approvedAt: new Date("2025-10-16"),
      childBirthDate: new Date("2025-12-15"),
      reason: "출산휴가",
    },
    {
      employeeId: employees["EMP003"].id,
      type: "ANNUAL",
      startDate: new Date("2026-01-20"),
      endDate: new Date("2026-01-20"),
      days: 0.5,
      halfDayType: "AM",
      status: "APPROVED",
      requestedAt: new Date("2026-01-18"),
      approvedBy: admin.id,
      approvedAt: new Date("2026-01-19"),
      reason: "병원 진료",
    },
    {
      employeeId: employees["EMP004"].id,
      type: "SICK",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-03"),
      days: 3,
      status: "REJECTED",
      requestedAt: new Date("2026-01-30"),
      rejectedReason: "증빙 서류 미제출",
    },
  ];

  for (const leave of leaveRecordsData) {
    await prisma.leaveRecord.create({ data: leave });
  }
  console.log("  휴가 기록 5건 생성");

  console.log("시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
