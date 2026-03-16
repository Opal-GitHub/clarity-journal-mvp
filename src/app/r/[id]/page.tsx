import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ReflectionRow = {
  id: string;
  title: string;
  raw: string;
  mood: string | null;
  visibility: string;
  cover_title: string | null;
  cover_subtitle: string | null;
  structured: {
    done?: string[];
    insight?: string;
    tomorrow?: string[];
    tags?: string[];
  };
  slides: Array<{
    type: "done" | "insight" | "tomorrow" | "easter";
    title: string;
    subtitle: string;
    bullets?: string[];
    quote?: string;
    emoji?: string;
  }>;
};

const slideTypeLabelMap = {
  done: "DONE",
  insight: "INSIGHT",
  tomorrow: "TOMORROW",
  easter: "EASTER",
};

export default async function SharedReflectionPage({ params }: PageProps) {
  const { id } = await params;

  const { data } = await supabase
    .from("reflections")
    .select("*")
    .eq("id", id)
    .single();

  const reflection = data as ReflectionRow | null;

  if (!reflection) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f4f4f5_42%,_#fafafa_100%)] px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/60 bg-white/90 p-10 text-center shadow-xl shadow-zinc-200/70 backdrop-blur">
          <div className="text-sm text-zinc-500">Clarity Journal</div>
          <h1 className="mt-3 text-3xl font-bold text-zinc-900">未找到这条反思</h1>
          <p className="mt-3 text-zinc-600">
            这条分享内容可能不存在，或者链接已失效。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f4f4f5_42%,_#fafafa_100%)] px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="overflow-hidden rounded-[36px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-zinc-200/70 backdrop-blur">
          <div className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-xs text-white shadow-sm">
            分享卡片
          </div>

          <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-zinc-900 md:text-5xl">
            {reflection.cover_title || reflection.title || id}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
            {reflection.cover_subtitle || "这是来自 Clarity Journal 的一张反思卡片。"}
          </p>

          <div className="mt-8 rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white p-7 shadow-sm">
            <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm">
              核心洞察
            </div>
            <p className="mt-5 text-2xl font-semibold leading-10 tracking-tight text-zinc-900 md:text-3xl">
              {reflection.structured?.insight || "这张卡片暂时没有可展示的洞察内容。"}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span className="rounded-full bg-zinc-100 px-3 py-1 shadow-sm">
              {reflection.mood || "shared"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              Clarity Journal
            </span>
            <span className="text-xs text-zinc-400 break-all">{reflection.id}</span>
          </div>
        </div>

        <section className="grid gap-5">
          {reflection.slides?.map((slide, index) => (
            <article
              key={`${slide.type}-${index}`}
              className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-zinc-200/50 backdrop-blur"
            >
              <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                {slideTypeLabelMap[slide.type]}
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
                {slide.title}
              </h2>

              <p className="mt-2 text-zinc-500">
                {slide.subtitle}
              </p>

              {slide.bullets && slide.bullets.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {slide.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={bulletIndex}
                      className="rounded-2xl bg-zinc-50 px-4 py-3 text-zinc-700"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {slide.quote && (
                <blockquote className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-4 text-lg leading-8 text-zinc-800">
                  “{slide.quote}”
                </blockquote>
              )}

              {slide.emoji && (
                <div className="mt-5 text-4xl">
                  {slide.emoji}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}