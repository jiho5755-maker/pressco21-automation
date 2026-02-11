// 근태 자동 생성 테스트 (송미 직원, 2024년 12월)
import { PrismaClient } from "@prisma/client";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addHours,
} from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("송미 직원 근태 자동 생성 테스트...\n");

  // 1. 송미 직원 조회
  const songmi = await prisma.employee.findUnique({
    where: { employeeNo: "EMP999" },
  });

  if (!songmi) {
    throw new Error("송미 직원을 찾을 수 없습니다.");
  }

  console.log(`직원: ${songmi.name} (${songmi.employeeNo})`);

  // 2. 2024년 12월 근무일 계산
  const year = 2024;
  const month = 12;
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const workDays = allDays.filter((day) => {
    const dayOfWeek = getDay(day);
    return dayOfWeek !== 0 && dayOfWeek !== 6; // 주말 제외
  });

  console.log(`대상 기간: ${year}년 ${month}월`);
  console.log(`근무일: ${workDays.length}일 (주말 제외)\n`);

  // 3. 임신기 근로시간 단축 (주당 10시간 단축)
  const shortenedHoursPerWeek = 10;
  const weeklyShortened = shortenedHoursPerWeek / 5; // 일 2시간 단축
  const dailyWorkHours = 8 - weeklyShortened; // 일 6시간 근무

  console.log(`근무 패턴: 임신기 근로시간 단축`);
  console.log(`단축 시간: 주 ${shortenedHoursPerWeek}시간 (일 ${weeklyShortened}시간)`);
  console.log(`실 근무시간: 일 ${dailyWorkHours}시간\n`);

  // 4. 근태 기록 생성
  const records = [];
  for (const day of workDays) {
    const clockInDate = new Date(day);
    clockInDate.setHours(9, 0, 0, 0); // 오전 9시 출근

    const clockOutDate = addHours(clockInDate, dailyWorkHours + 1); // 근무 + 점심 1시간

    records.push({
      employeeId: songmi.id,
      date: day,
      clockIn: clockInDate,
      clockOut: clockOutDate,
      workType: "OFFICE" as const,
      workMinutes: dailyWorkHours * 60,
      overtime: 0,
      nightWork: 0,
      isConfirmed: false,
      note: `임신기 근로시간 단축 (주 ${shortenedHoursPerWeek}시간)`,
    });
  }

  // 5. 중복 체크
  const existing = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: songmi.id,
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  if (existing.length > 0) {
    console.log(`⚠️  이미 ${existing.length}건의 근태 기록이 존재합니다.`);
    console.log("기존 기록을 삭제하고 재생성하시겠습니까? (Y/n)");
    // 실제로는 사용자 입력을 받아야 하지만, 테스트용으로 자동 삭제
    await prisma.attendanceRecord.deleteMany({
      where: {
        employeeId: songmi.id,
        date: { gte: monthStart, lte: monthEnd },
      },
    });
    console.log("✓ 기존 기록 삭제 완료\n");
  }

  // 6. DB 저장
  await prisma.attendanceRecord.createMany({
    data: records,
  });

  console.log(`✅ 근태 기록 ${records.length}건 생성 완료!\n`);
  console.log("생성된 기록 샘플:");
  console.log(
    `  - ${records[0].date.toLocaleDateString("ko-KR")}: ${records[0].clockIn.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} ~ ${records[0].clockOut.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} (${dailyWorkHours}시간)`
  );

  console.log("\n다음 단계:");
  console.log("  1. http://localhost:3000/attendance 에서 확인");
  console.log("  2. 관리자가 기록 확정 (isConfirmed = true)");
  console.log("  3. http://localhost:3000/subsidies 에서 지원금 신청");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
