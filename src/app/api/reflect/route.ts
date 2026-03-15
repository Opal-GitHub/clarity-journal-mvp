import { NextResponse } from "next/server";
import OpenAI from "openai";
import {supabase} from "@/lib/supabase";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const raw = String(body.raw || "").trim();
    const title = String(body.title || "").trim();

    if (!raw) {
      return NextResponse.json({ error: "raw is required" }, { status: 400 });
    }

    const prompt = `
你是一个擅长把每日反思整理成“成长卡片”的中文 AI 助手。
请根据用户输入，输出一个 JSON 对象，不要输出多余解释。

要求：
1. 使用中文。
2. 不要编造用户没写过的事实。
3. 输出字段必须完整。
4. slides 必须固定 4 张，type 依次为：done / insight / tomorrow / easter。
5. 所有文案都必须紧扣用户原文，不能写空泛套话。
6. 禁止输出这类抽象废话：例如“保留真实进展”“停止被模糊感裹挟”“继续成长”“认真生活”这类没有具体指向的句子。
7. structured.done 和 slides[0].bullets 必须尽量提取用户真实做过的事情，或用户原文中明确表达的行为/事件。
8. structured.tomorrow 和 slides[2].bullets 必须是基于用户原文推导出的下一步方向，不能是万能建议。
9. structured.insight 和 slides[1].quote 必须总结用户原文里的核心认知，不要说空话。
10. coverTitle、coverSubtitle 要像可分享的反思卡片标题，但仍然必须基于原文，不要标题党。
11. 如果用户原文信息不足，也要尽量贴近原文表达，不要为了凑字段写泛泛而谈的话。

JSON 结构如下：
{
  "id": "insight_时间戳",
  "title": "标题",
  "date": "YYYY-MM-DD",
  "mood": "情绪词",
  "visibility": "private",
  "raw": "原文",
  "coverTitle": "首图标题",
  "coverSubtitle": "首图副标题",
  "structured": {
    "done": ["已做事项1", "已做事项2"],
    "insight": "认知总结",
    "tomorrow": ["明日方向1", "明日方向2"],
    "tags": ["标签1", "标签2"]
  },
  "slides": [
    {
      "type": "done",
      "title": "标题",
      "subtitle": "副标题",
      "bullets": ["要点1", "要点2"]
    },
    {
      "type": "insight",
      "title": "标题",
      "subtitle": "副标题",
      "quote": "一句洞察"
    },
    {
      "type": "tomorrow",
      "title": "标题",
      "subtitle": "副标题",
      "bullets": ["要点1", "要点2"]
    },
    {
      "type": "easter",
      "title": "标题",
      "subtitle": "副标题",
      "emoji": "✨"
    }
  ]
}

用户标题：
${title || "无"}

用户原文：
${raw}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "你是一个严格按 JSON 输出结果的助手。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }



    const result = JSON.parse(text);

const { data: inserted, error: insertError } = await supabase
  .from("reflections")
  .insert({
    id: result.id,
    title: result.title,
    raw: result.raw,
    mood: result.mood,
    visibility: result.visibility,
    cover_title: result.coverTitle,
    cover_subtitle: result.coverSubtitle,
    structured: result.structured,
    slides: result.slides,
  })
  .select()
  .single();

if (insertError) {
  console.error("Supabase insert error:", insertError);
  return NextResponse.json(
    { error: `Supabase insert failed: ${insertError.message}` },
    { status: 500 }
  );
}

console.log("Inserted reflection:", inserted.id);

return NextResponse.json(result);




  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}