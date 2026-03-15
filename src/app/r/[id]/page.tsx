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

export default async function SharedReflectionPage({ params }: PageProps) {
  const { id } = await params;

  const { data } = await supabase
    .from("reflections")
    .select("*")
    .eq("id", id)
    .single();

  const reflection = data as ReflectionRow | null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f4f4f5_42%,_#fafafa_100%)] px-6 py-16">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[36px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-zinc-200/70 backdrop-blur">
        <div className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-xs text-white shadow-sm">
          分享卡片
        </div>

        <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-zinc-900 md:text-5xl">
          {reflection?.cover_title || reflection?.title || id}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
          {reflection?.cover_subtitle || "这是来自 Clarity Journal 的一张反思卡片。"}
        </p>

        <div className="mt-8 rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white p-7 shadow-sm">
          <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm">
            核心洞察
          </div>
          <p className="mt-5 text-2xl font-semibold leading-10 tracking-tight text-zinc-900 md:text-3xl">
            {reflection?.structured?.insight || "这张卡片暂时没有可展示的洞察内容。"}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-3 py-1 shadow-sm">
            {reflection?.mood || "shared"}
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Clarity Journal
          </span>
          <span className="text-xs text-zinc-400">{id}</span>
        </div>
      </div>
    </main>
  );
}