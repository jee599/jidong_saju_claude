// GET /api/saju/report/[id] — Fetch a saved report by ID

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "리포트 ID가 필요합니다.", code: "MISSING_ID" },
      { status: 400 }
    );
  }

  try {
    const { getReport } = await import("@/lib/db/queries");
    const report = await getReport(id);

    if (!report) {
      return NextResponse.json(
        { error: "리포트를 찾을 수 없습니다.", code: "REPORT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generate free summary from stored saju result
    const sajuResult = report.saju_result;
    const dm = sajuResult.dayMaster;
    const oheng = sajuResult.oheng;
    const seun = sajuResult.seun;

    const personalitySummary =
      `${dm.nature}의 기운을 타고난 ${dm.yinYang === "양" ? "적극적이고 외향적인" : "섬세하고 내향적인"} 성격입니다. ` +
      `오행 중 ${oheng.strongest} 기운이 가장 강하며, ${oheng.weakest} 기운이 상대적으로 약합니다. ` +
      `${sajuResult.sipseong.dominant}이(가) 두드러져 독립적이고 주체적인 성향을 보입니다. ` +
      `${dm.isStrong ? "신강(身强)한 사주로 자신감이 넘치지만, 때로는 유연함이 필요합니다." : "신약(身弱)한 사주로 섬세한 감수성이 장점이며, 좋은 환경에서 빛납니다."}`;

    const yearKeyword =
      seun.keywords.length > 0
        ? `${seun.year}년 키워드: ${seun.keywords.join(", ")}`
        : `${seun.year}년은 ${seun.element} 에너지가 흐르는 해입니다.`;

    return NextResponse.json({
      reportId: report.id,
      sajuResult: report.saju_result,
      sajuHash: report.saju_hash,
      freeSummary: { personalitySummary, yearKeyword },
      report: report.report_json,
      tier: report.tier,
    });
  } catch (err) {
    console.error("Failed to fetch report:", err);
    return NextResponse.json(
      { error: "리포트를 불러오는 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
