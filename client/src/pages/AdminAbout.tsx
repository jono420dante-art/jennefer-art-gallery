import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminAbout() {
  const aboutQuery = trpc.about.get.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ title: "", content: "" });
  useEffect(() => { if (aboutQuery.data) setForm({ title: aboutQuery.data.title || "About the Artist", content: aboutQuery.data.content || "" }); }, [aboutQuery.data]);
  const save = trpc.about.update.useMutation({ onSuccess: () => { utils.about.get.invalidate(); toast.success("About page saved. The public page now shows this update."); }, onError: (error) => toast.error(error.message) });
  return <div className="min-h-screen bg-[#042d31] pb-14 text-teal-50"><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link href="/admin" className="inline-flex items-center text-xs font-bold text-cyan-100 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back to Artwork Studio</Link><Card className="mt-5 rounded-2xl border border-cyan-100/15 bg-[#075257]/80 p-5 shadow-xl sm:p-7"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-200/10"><ShieldCheck className="h-5 w-5 text-cyan-200" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">Administrator-only content management</p><h1 className="mt-1 text-2xl font-black text-white">Edit the About page</h1><p className="mt-2 text-sm leading-6 text-teal-50/70">Public visitors can read the About page but cannot see this editor or access this route without a valid Administrator session.</p></div></div><form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); if (!form.content.trim()) return toast.error("About content cannot be empty."); save.mutate(form); }}><label className="block text-xs font-bold text-teal-50/80">Page title<Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 border-cyan-100/15 bg-[#063b3f] text-white" /></label><label className="block text-xs font-bold text-teal-50/80">Public biography<Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="mt-2 min-h-96 border-cyan-100/15 bg-[#063b3f] text-white" /></label><div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-100/10 pt-4"><p className="text-xs text-teal-50/60">Separate paragraphs with a blank line. Saving updates the public About page.</p><Button type="submit" className="bg-cyan-300 text-[#063437] hover:bg-cyan-200" disabled={save.isPending}><Save className="mr-2 h-4 w-4" />{save.isPending ? "Saving…" : "Save public About page"}</Button></div></form></Card></main></div>;
}
