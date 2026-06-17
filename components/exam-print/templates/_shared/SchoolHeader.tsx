"use client";

import { Box, Typography } from "@mui/material";
import type { ExamForPrint, PrintHeaderOverrides } from "@/lib/exam-print/types";

interface SchoolHeaderProps {
  exam: ExamForPrint;
  header?: PrintHeaderOverrides;
  showBismillah?: boolean;
  borderStyle?: "solid" | "double" | "dashed";
}

export default function SchoolHeader({
  exam,
  header,
  showBismillah = true,
  borderStyle = "solid",
}: SchoolHeaderProps) {
  const border = borderStyle === "double" ? "4px double #000" : borderStyle === "dashed" ? "2px dashed #000" : "2px solid #000";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 3,
        border,
        p: 2,
      }}
    >
      <Box sx={{ width: "30%", borderRight: "1px solid #000", pl: 1.25 }}>
        <Box sx={{ fontSize: "10pt", mb: 1 }}>نام: {header?.studentFirstName ?? ""}</Box>
        <Box sx={{ fontSize: "10pt", mb: 1 }}>نام خانوادگی: {header?.studentLastName ?? ""}</Box>
        <Box sx={{ fontSize: "10pt", mb: 1 }}>کلاس: {header?.className ?? ""}</Box>
        {header?.studentCode ? (
          <Box sx={{ fontSize: "10pt" }}>کد: {header.studentCode}</Box>
        ) : null}
      </Box>

      <Box sx={{ width: "40%", textAlign: "center", px: 1.25 }}>
        {showBismillah ? (
          <Typography sx={{ fontSize: "13pt", fontWeight: 700, mb: 1.5 }}>باسمه تعالی</Typography>
        ) : null}
        <Box sx={{ fontSize: "11pt", fontWeight: 700, mb: 1 }}>
          {header?.schoolName || exam.partner?.name || "نام مدرسه"}
        </Box>
        <Box sx={{ fontSize: "10pt" }}>{header?.courseName || exam.title}</Box>
        {header?.grade ? <Box sx={{ fontSize: "10pt", mt: 0.5 }}>پایه: {header.grade}</Box> : null}
      </Box>

      <Box sx={{ width: "30%", borderLeft: "1px solid #000", pr: 1.25 }}>
        {header?.examDate ? <Box sx={{ fontSize: "10pt", mb: 1 }}>تاریخ: {header.examDate}</Box> : null}
        {header?.examTime ? <Box sx={{ fontSize: "10pt", mb: 1 }}>ساعت: {header.examTime}</Box> : null}
        {header?.teacherName ? <Box sx={{ fontSize: "10pt" }}>دبیر: {header.teacherName}</Box> : null}
      </Box>
    </Box>
  );
}
