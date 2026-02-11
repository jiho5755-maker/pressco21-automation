#!/usr/bin/env node
/**
 * 엑셀(xlsx) 파일을 JSON으로 변환하는 스크립트
 * 사용: node scripts/convert-xlsx-to-json.mjs <엑셀파일경로> [출력경로]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const inputPath = process.argv[2] || "근로소득_간이세액표(조견표).xlsx";
const outputPath = process.argv[3] || inputPath.replace(/\.xlsx?$/i, ".json");

// 동적 import (xlsx는 ESM에서 직접 import가 필요할 수 있음)
const XLSX = await import("xlsx").then((m) => m.default);

const buf = readFileSync(resolve(process.cwd(), inputPath));
const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

const result = { sheets: [] };
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: false,
  });
  result.sheets.push({ name, rows });
}

writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
console.log("저장 완료:", outputPath);
console.log("시트:", result.sheets.map((s) => `${s.name}(${s.rows.length}행)`).join(", "));
