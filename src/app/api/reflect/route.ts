import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const raw = String(body.raw || "").trim();
    const title = String(body.title || "").trim();

    if (!raw) {
      return NextResponse.json({ error: "raw is required" }, { status: 400 });
    }

    const parts = raw
      .split(/[\n\u3002\uFF01\uFF1F!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const p1 = parts[0] || "记录了今天发生的事情";
    const p2 = parts[1] || "意识到自己有一个新的模式";
    const p3 = parts[2] || "决定明天先做一个更小的动作";

    const result = {
      id: `insight_${Date.now()}`,
      title: title || "今天我重新理解了自己一点",
      date: new Date().toISOString().slice(0, 10),
      mood: "grounded",
      visibility: "private",
      raw,
      coverTitle: (title || "今天我重新理解了自己一点").slice(0, 18),
      coverSubtitle: p2,
      structured: {
        done: [p1, "提炼出一条值得保留的事实", "把记录变成可回顾内容"],
        insight: p2,
        tomorrow: [p3, "把明天的行动缩小到第一步", "避免给自己过大的起点压力"],
        tags: ["insight", "journal", "growth"],
      },
      slides: [
        {
          type: "done",
          title: "今天发生了什么",
          subtitle: "先确认事实，再理解自己。",
          bullets: [p1, "保留真实进展", "停止被模糊感裹挟"],
        },
        {
          type: "insight",
          title: "我想记住的洞察",
          subtitle: "把今天最重要的理解留下来。",
          quote: p2,
        },
        {
          type: "tomorrow",
          title: "明日最小方向",
          subtitle: "不是做更多，而是先做得更小。",
          bullets: [p3, "只选一个起点", "先推进最小闭环"],
        },
        {
          type: "easter",
          title: "给今天的一个小结尾",
          subtitle: "哪怕只是多理解自己一点，也值得纪念。",
          emoji: "🎁",
        },
      ],
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}