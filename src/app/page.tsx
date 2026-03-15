"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Sparkles, ChevronLeft, ChevronRight, Wand2, Compass, Brain, CheckCircle2, Stars, Library, Globe2, Lock, Loader2, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * 产品级 MVP 方向：
 * - 更像真实 AI 产品，而不是 demo
 * - 增加品牌感、loading、insight library、explore 入口
 * - 统一四张卡片视觉系统
 * - 保留当前代码结构，便于后续接到 Next.js + Supabase 项目里
 */
type Slide = {
  type: "done" | "insight" | "tomorrow" | "easter";
  title: string;
  subtitle: string;
  bullets?: string[];
  quote?: string;
  emoji?: string;
};

type Entry = {
  id: string;
  title: string;
  date: string;
  mood: string;
  visibility: "public" | "private";
  raw: string;
  coverTitle: string;
  coverSubtitle: string;
  structured: {
    done: string[];
    insight: string;
    tomorrow: string[];
    tags: string[];
  };
  slides: Slide[];
};

const slideMeta = {
  done: {
    label: "Today I did",
    icon: CheckCircle2,
    tone: "from-sky-50 via-cyan-50 to-white",
    accent: "bg-sky-100 text-sky-700 border-sky-200",
    emoji: "✅",
  },
  insight: {
    label: "Today's Insight",
    icon: Brain,
    tone: "from-violet-50 via-fuchsia-50 to-white",
    accent: "bg-violet-100 text-violet-700 border-violet-200",
    emoji: "🧠",
  },
  tomorrow: {
    label: "Next Direction",
    icon: Compass,
    tone: "from-emerald-50 via-lime-50 to-white",
    accent: "bg-emerald-100 text-emerald-700 border-emerald-200",
    emoji: "🧭",
  },
  easter: {
    label: "Little Easter Egg",
    icon: Stars,
    tone: "from-amber-50 via-yellow-50 to-white",
    accent: "bg-amber-100 text-amber-700 border-amber-200",
    emoji: "✨",
  },
};

const demoEntries: Entry[] = [
  {
    id: "insight_1001",
    title: "焦虑不是事情太多，而是没有起点",
    date: "2026-03-15",
    mood: "clarity",
    visibility: "private",
    raw: "今天任务很多，但真正让我焦虑的不是数量，而是没有清晰起点。晚上散步突然意识到，如果把任务拆到可以立刻开始的粒度，焦虑就会消失。明天我想先做一个最小闭环，而不是想着一次性做完。",
    coverTitle: "我终于发现\n焦虑不是事情太多",
    coverSubtitle: "而是任务没有被拆到可以开始的程度",
    structured: {
      done: ["识别今天真正的压力来源", "复盘任务为什么难以下手", "形成明日最小闭环思路"],
      insight: "焦虑经常不是因为任务太多，而是因为入口太大，导致自己找不到第一步。",
      tomorrow: ["把任务拆到 30 分钟粒度", "只启动一个最小闭环", "避免同时推进太多线"],
      tags: ["clarity", "growth", "focus"]
    },
    slides: [
      { type: "done", title: "我今天真正完成了什么？", subtitle: "不是忙碌感，而是可确认的推进。", bullets: ["找到焦虑触发点", "完成任务复盘", "明确明日最小起点"] },
      { type: "insight", title: "今天最重要的洞察", subtitle: "很多压力，来自任务没有起点。", quote: "当事情大到无法开始，大脑会把它翻译成焦虑。" },
      { type: "tomorrow", title: "明天不追求做很多", subtitle: "只追求先启动一个最小闭环。", bullets: ["拆小任务", "单线程推进", "先完成再扩展"] },
      { type: "easter", title: "今晚的彩蛋", subtitle: "散步的时候，我终于把压力翻译成了理解。", emoji: "🌙" }
    ]
  },
  {
    id: "insight_1002",
    title: "拖延有时候是在推迟被评价",
    date: "2026-03-14",
    mood: "honest",
    visibility: "public",
    raw: "今天本来要发一个方案，但我一直拖到晚上。后来我发现自己不是不会做，而是在害怕别人觉得我还不够成熟。最后我先发了一个不完美版本，结果反馈比想象中温和。",
    coverTitle: "原来我不是不会做\n我是在怕被评价",
    coverSubtitle: "很多拖延，不是懒，而是对暴露自己的防御",
    structured: {
      done: ["识别拖延背后的真实原因", "发出了一个不完美版本", "获得比预期更温和的反馈"],
      insight: "拖延并不总是执行力问题，它也可能是对评价和暴露自己的防御反应。",
      tomorrow: ["继续先发小版本", "减少对首次表达的要求", "用真实反馈替代想象中的批评"],
      tags: ["courage", "reflection", "feedback"]
    },
    slides: [
      { type: "done", title: "今天我做了什么", subtitle: "不是完美交付，而是真实出现。", bullets: ["识别评价焦虑", "提交初稿", "接受外部反馈"] },
      { type: "insight", title: "今天的认知", subtitle: "拖延，有时是在推迟被看见。", quote: "比起任务本身，我们更怕的是自己的不成熟被别人看见。" },
      { type: "tomorrow", title: "明日方向", subtitle: "先交付，再迭代。", bullets: ["先发 60 分版本", "降低首次表达门槛", "继续练习被看见"] },
      { type: "easter", title: "彩蛋页", subtitle: "勇敢不是不怕，而是带着怕也继续出现。", emoji: "🌟" }
    ]
  }
];

function buildProductSummary(raw: string, customTitle: string) :Entry {
  const parts = raw
  .split(/[\n\u3002\uFF01\uFF1F!?]+/)
  .map((s: string) => s.trim())
  .filter(Boolean);
  const p1 = parts[0] || "记录了今天发生的事情";
  const p2 = parts[1] || "意识到自己有一个新的模式";
  const p3 = parts[2] || "决定明天先做一个更小的动作";

  return {
    id: `insight_${Date.now()}`,
    title: customTitle || "今天我重新理解了自己一点",
    date: new Date().toISOString().slice(0, 10),
    mood: "grounded",
    visibility: "private",
    raw,
    coverTitle: (customTitle || "今天我重新理解了自己一点").slice(0, 18),
    coverSubtitle: p2,
    structured: {
      done: [p1, "提炼出一条值得保留的事实", "把记录变成可回顾内容"],
      insight: p2,
      tomorrow: [p3, "把明天的行动缩小到第一步", "避免给自己过大的起点压力"],
      tags: ["insight", "journal", "growth"]
    },
    slides: [
      { type: "done", title: "今天发生了什么", subtitle: "先确认事实，再理解自己。", bullets: [p1, "保留真实进展", "停止被模糊感裹挟"] },
      { type: "insight", title: "我想记住的洞察", subtitle: "把今天最重要的理解留下来。", quote: p2 },
      { type: "tomorrow", title: "明日最小方向", subtitle: "不是做更多，而是先做得更小。", bullets: [p3, "只选一个起点", "先推进最小闭环"] },
      { type: "easter", title: "给今天的一个小结尾", subtitle: "哪怕只是多理解自己一点，也值得纪念。", emoji: "🎁" }
    ]
  };
}

function BrandHeader() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">Clarity Journal</div>
          <div className="text-sm text-zinc-500">把每日反思整理成可回顾、可分享的洞察卡片。</div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500">
        <Badge variant="outline" className="rounded-full">AI 反思日志</Badge>
        <Badge variant="secondary" className="rounded-full">Product-style MVP</Badge>
      </div>
    </div>
  );
}

function LoadingState() {
  const lines = [
    "Analyzing your reflection...",
    "Finding the core insight...",
    "Building visual cards...",
  ];

  return (
    <Card className="rounded-[28px] border-0 bg-white/90 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-zinc-900">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div className="font-medium">AI is working on your reflection</div>
        </div>
        <div className="mt-4 space-y-3">
          {lines.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0.2, x: -8 }}
              animate={{ opacity: [0.35, 1, 0.35], x: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
              className="rounded-2xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-600"
            >
              {line}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CoverCard({
  entry,
  selected,
  onClick,
}: {
  entry: (typeof demoEntries)[number] | ReturnType<typeof buildProductSummary>;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group text-left"
    >
      <div className={`overflow-hidden rounded-[30px] border bg-white shadow-sm transition-all ${selected ? "ring-2 ring-zinc-900" : "hover:shadow-lg"}`}>
        <div className="aspect-[3/4] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-5">
          <div className="flex h-full flex-col justify-between rounded-[24px] border border-zinc-200 bg-white/90 p-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge className="rounded-full bg-zinc-900 text-white hover:bg-zinc-900">{entry.mood}</Badge>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  {entry.visibility === "public" ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {entry.visibility}
                </div>
              </div>
              <h3 className="mt-5 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-zinc-900">
                {entry.coverTitle}
              </h3>
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-600">
                {entry.coverSubtitle}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {entry.structured.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-xs text-zinc-400">{entry.date}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function InsightLibrary({
  entries,
}: {
  entries: Array<(typeof demoEntries)[number] | ReturnType<typeof buildProductSummary>>;
}) {
  const insights = entries.map((e) => ({ id: e.id, title: e.title, insight: e.structured.insight }));
  return (
    <Card className="rounded-[28px] border-0 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Library className="h-5 w-5" />
          Your Insight Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((item) => (
          <div key={item.id} className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-sm font-medium text-zinc-900">{item.title}</div>
            <div className="mt-2 text-sm leading-6 text-zinc-600">{item.insight}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExplorePreview({
  entries,
}: {
  entries: Array<(typeof demoEntries)[number] | ReturnType<typeof buildProductSummary>>;
}) {
  const publicEntries = entries.filter((e) => e.visibility === "public");
  return (
    <Card className="rounded-[28px] border-0 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Globe2 className="h-5 w-5" />
          Explore Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {publicEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-zinc-50 p-5 text-sm text-zinc-500">
            No public reflections yet.
          </div>
        ) : (
          publicEntries.map((item) => (
            <div key={item.id} className="rounded-2xl border bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-zinc-900">{item.title}</div>
                <Badge variant="secondary" className="rounded-full">public</Badge>
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">{item.structured.insight}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SlideCard({
  slide,
  index,
}: {
  slide: {
    type: keyof typeof slideMeta;
    title: string;
    subtitle: string;
    bullets?: string[];
    quote?: string;
    emoji?: string;
  };
  index: number;
}) {
  const meta = slideMeta[slide.type];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className={`relative min-h-[420px] overflow-hidden rounded-[32px] border bg-gradient-to-br ${meta.tone} shadow-sm`}
    >
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative flex h-full flex-col justify-between p-7 md:p-8">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${meta.accent}`}>
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </div>
            <div className="rounded-full bg-white/80 px-3 py-1 text-xs text-zinc-500 shadow-sm">
              {index + 1} / 4
            </div>
          </div>

          <div className="mt-7 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              {slide.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-600 md:text-lg">
              {slide.subtitle}
            </p>
          </div>

          {slide.bullets && (
            <div className="mt-7 grid gap-3">
              {slide.bullets.map((item, i) => (
                <div key={i} className="rounded-[22px] border bg-white/85 p-4 text-sm leading-6 text-zinc-800 shadow-sm backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          )}

          {slide.quote && (
            <div className="mt-7 rounded-[28px] border-2 border-dashed bg-white/88 p-6 text-lg leading-8 text-zinc-800 shadow-sm md:text-xl">
              “{slide.quote}”
            </div>
          )}
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div className="text-xs tracking-wide text-zinc-400 uppercase">AI visual card</div>
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border bg-white/90 text-3xl shadow-sm">
            {slide.emoji || meta.emoji}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Page() {
  const [entries, setEntries] = useState(demoEntries);
  React.useEffect(() => {
  const loadReflections = async () => {
    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load reflections:", error);
      return;
    }

    if (data && data.length > 0) {
      const mapped = data.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.created_at?.slice(0, 10) || "",
        mood: item.mood || "grounded",
        visibility: item.visibility || "private",
        raw: item.raw,
        coverTitle: item.cover_title || item.title,
        coverSubtitle: item.cover_subtitle || "",
        structured: item.structured,
        slides: item.slides,
      }));

      setEntries(mapped);
      setSelectedId(mapped[0].id);
    }
  };

  loadReflections();
}, []);

  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("今天发生了什么？你意识到了什么？明天准备怎么做？");
  const [selectedId, setSelectedId] = useState(demoEntries[0].id);
  const [view, setView] = useState("write");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const selected = useMemo(() => entries.find((e) => e.id === selectedId) || entries[0], [entries, selectedId]);

  const generate = async () => {
    setIsGenerating(true);

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        raw,
        title,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
      throw new Error(result.error || "生成失败");
      }

      result.visibility = isPublic ? "public" : "private";
      setEntries((prev) => [result, ...prev]);
      setSelectedId(result.id);
      setSlideIndex(0);
      setView("detail");
      } catch (error) {
      console.error(error);
      alert("生成失败，请看控制台报错");
      } finally {
      setIsGenerating(false);
      }
    };

  const prevSlide = () => setSlideIndex((s) => Math.max(0, s - 1));
  const nextSlide = () => setSlideIndex((s) => Math.min(3, s + 1));

  const shareCurrentInsight = async () => {

  const url = `${window.location.origin}/r/${selected.id}`;

  const sharePayload = {
    title: selected.title,
    text: selected.structured.insight,
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(sharePayload);
      return;
    } catch {
      // 用户取消分享时不处理
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("分享链接已复制到剪贴板");
  } catch {
    alert(`请手动复制这个链接：${url}`);
  }
};

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f4f4f5_42%,_#fafafa_100%)] p-4 md:p-8 text-zinc-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <BrandHeader />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-bold tracking-tight">AI Reflection Journal</div>
            <div className="mt-1 text-sm text-zinc-500">Write your reflection. Let AI turn it into insight cards you can revisit or share.</div>
          </div>

          <Tabs value={view} onValueChange={setView}>
            <TabsList className="rounded-2xl bg-white shadow-sm">
              <TabsTrigger value="write">写反思</TabsTrigger>
              <TabsTrigger value="feed">灵感卡片</TabsTrigger>
              <TabsTrigger value="detail">详情</TabsTrigger>
              <TabsTrigger value="library">洞察库</TabsTrigger>
              <TabsTrigger value="explore">发现</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === "write" && (
          <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            <Card className="rounded-[32px] border-0 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Write today&apos;s reflection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium text-zinc-700">Optional title</div>
                  <Input
                    placeholder="例如：今天我终于发现焦虑真正来自哪里"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-zinc-700">Daily reflection</div>
                  <Textarea
                    className="min-h-[260px] rounded-2xl"
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                  />
                </div>

                <label className="flex items-center justify-between rounded-2xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                  <span>Make this reflection public</span>
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                </label>

                <Button onClick={generate} disabled={isGenerating} className="h-12 w-full rounded-2xl text-base">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {isGenerating ? "Generating insight..." : "Generate insight"}
                </Button>

                <div className="rounded-2xl border bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                  The AI will generate: <span className="font-medium text-zinc-900">cover card, 4 insight slides, structured summary, mood tags, and a reusable reflection record.</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {isGenerating ? (
                <LoadingState />
              ) : (
                <Card className="rounded-[32px] border-0 bg-white/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <BookOpen className="h-5 w-5" />
                      Product preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-3xl border bg-zinc-50 p-5">
                        <div className="text-sm font-medium text-zinc-500">Step 1</div>
                        <div className="mt-2 text-lg font-semibold">Write honestly</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-600">Record what happened, what you felt, and what you understood.</div>
                      </div>
                      <div className="rounded-3xl border bg-zinc-50 p-5">
                        <div className="text-sm font-medium text-zinc-500">Step 2</div>
                        <div className="mt-2 text-lg font-semibold">AI finds the insight</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-600">The system extracts action, insight, next step, and mood.</div>
                      </div>
                      <div className="rounded-3xl border bg-zinc-50 p-5">
                        <div className="text-sm font-medium text-zinc-500">Step 3</div>
                        <div className="mt-2 text-lg font-semibold">Build visual cards</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-600">Turn reflections into cards you can revisit or optionally share.</div>
                      </div>
                    </div>

                    <CoverCard entry={selected} selected onClick={() => setView("detail")} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {view === "feed" && (
          <Card className="rounded-[32px] border-0 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Insight Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => (
                  <CoverCard
                    key={entry.id}
                    entry={entry}
                    selected={entry.id === selectedId}
                    onClick={() => {
                      setSelectedId(entry.id);
                      setSlideIndex(0);
                      setView("detail");
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {view === "detail" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="rounded-[32px] border-0 bg-white/90 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-zinc-900 text-white hover:bg-zinc-900">{selected.mood}</Badge>
                      <Badge variant="secondary" className="rounded-full">{selected.visibility}</Badge>
                    </div>
                    <CardTitle className="mt-4 text-3xl tracking-tight">{selected.title}</CardTitle>
                    <div className="mt-2 text-sm text-zinc-500">{selected.date}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl" onClick={shareCurrentInsight}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={prevSlide} disabled={slideIndex === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={nextSlide} disabled={slideIndex === 3}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  <SlideCard key={`${selected.id}-${slideIndex}`} slide={selected.slides[slideIndex]} index={slideIndex} />
                </AnimatePresence>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className={`h-2.5 w-10 rounded-full transition ${slideIndex === i ? "bg-zinc-900" : "bg-zinc-200"}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-0 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Reflection Record</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[700px] pr-4">
                  <div className="space-y-5">
                    <section>
                      <div className="text-sm font-medium text-zinc-500">Original reflection</div>
                      <div className="mt-2 rounded-2xl border bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                        {selected.raw}
                      </div>
                    </section>

                    <Separator />

                    <section className="space-y-4">
                      <div className="text-sm font-medium text-zinc-500">Structured summary</div>
                      <div className="rounded-2xl border p-4">
                        <div className="font-medium text-zinc-900">Done</div>
                        <div className="mt-3 space-y-2">
                          {selected.structured.done.map((item, i) => (
                            <div key={i} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{item}</div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4">
                        <div className="font-medium text-zinc-900">Insight</div>
                        <p className="mt-3 text-sm leading-7 text-zinc-700">{selected.structured.insight}</p>
                      </div>

                      <div className="rounded-2xl border p-4">
                        <div className="font-medium text-zinc-900">Tomorrow</div>
                        <div className="mt-3 space-y-2">
                          {selected.structured.tomorrow.map((item, i) => (
                            <div key={i} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{item}</div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selected.structured.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-white">#{tag}</span>
                        ))}
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {view === "library" && <InsightLibrary entries={entries} />}

        {view === "explore" && <ExplorePreview entries={entries} />}
      </div>
    </div>
  );
}
