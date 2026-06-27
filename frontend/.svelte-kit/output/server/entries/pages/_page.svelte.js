import { e as ensure_array_like, a as attr_class, b as store_get, c as attr, u as unsubscribe_stores } from "../../chunks/index2.js";
import { r as rankings, t as topCombined, e as events } from "../../chunks/liveRankings.js";
import { V as escape_html } from "../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const tierOrder = ["minute", "hourly", "daily", "weekly"];
    let selectedTier = "minute";
    const tierLabels = {
      minute: "1 Minute Movers",
      hourly: "Hourly Momentum",
      daily: "Daily Leaders",
      weekly: "Weekly Watch"
    };
    $$renderer2.push(`<div class="min-h-screen bg-slate-100"><div class="mx-auto max-w-6xl px-6 py-10"><header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 class="text-3xl font-semibold text-slate-900">StockPulse Monitor</h1> <p class="text-sm text-slate-500">Live rankings flowing from the local Deno engine.</p></div> <nav class="flex flex-wrap gap-2"><!--[-->`);
    const each_array = ensure_array_like(tierOrder);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tier = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`rounded-full px-4 py-2 text-sm font-medium transition capitalize ${selectedTier === tier ? "bg-blue-600 text-white shadow-md hover:bg-blue-500" : "border border-blue-200 text-blue-700 hover:bg-blue-50"}`)}>${escape_html(tierLabels[tier])}</button>`);
    }
    $$renderer2.push(`<!--]--></nav></header> <section class="grid gap-6 lg:grid-cols-[2fr_1fr]"><div class="rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 class="text-lg font-semibold text-slate-900">${escape_html(tierLabels[selectedTier])}</h2></div> <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-200 text-sm"><thead class="bg-slate-50 text-slate-600"><tr><th class="px-4 py-3 text-left font-semibold tracking-wide">Symbol</th><th class="px-4 py-3 text-right font-semibold tracking-wide">Score</th><th class="px-4 py-3 text-right font-semibold tracking-wide">Interest</th><th class="px-4 py-3 text-right font-semibold tracking-wide">Price</th><th class="px-4 py-3 text-right font-semibold tracking-wide">Change %</th></tr></thead><tbody class="divide-y divide-slate-100">`);
    if (store_get($$store_subs ??= {}, "$rankings", rankings)[selectedTier]?.length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$rankings", rankings)[selectedTier]);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let row = each_array_1[$$index_1];
        $$renderer2.push(`<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-semibold text-slate-800"><a class="text-blue-600 hover:underline"${attr("href", `/stocks/${row.symbol}`)}>${escape_html(row.symbol)}</a></td><td class="px-4 py-3 text-right font-mono text-slate-700">${escape_html(row.score.toFixed(2))}</td><td class="px-4 py-3 text-right"><span${attr_class(`inline-flex min-w-[3.5rem] justify-center rounded-full px-2 py-1 text-xs font-semibold ${row.interest >= 75 ? "bg-emerald-100 text-emerald-700" : row.interest >= 50 ? "bg-amber-100 text-amber-700" : row.interest >= 25 ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`)}>${escape_html(row.interest.toFixed(0))}</span></td><td class="px-4 py-3 text-right font-mono text-slate-700">$${escape_html(row.price.toFixed(2))}</td><td${attr_class(`px-4 py-3 text-right font-mono ${row.changePct >= 0 ? "text-emerald-600" : "text-rose-600"}`)}>${escape_html(row.changePct.toFixed(2))}%</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<tr><td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">Waiting for live data… ensure backend is running.</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div> <aside class="space-y-6"><div class="rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 class="text-base font-semibold text-slate-900">Blended Highlights</h3></div> <ul class="flex max-h-72 flex-col gap-2 overflow-auto px-5 py-4"><!--[-->`);
    const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$topCombined", topCombined));
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let item = each_array_2[$$index_2];
      $$renderer2.push(`<li class="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2 text-sm"><div class="flex flex-col"><span class="font-semibold text-slate-800">${escape_html(item.symbol)}</span> <span class="text-xs text-slate-500">Score ${escape_html(item.score.toFixed(1))}</span></div> <span${attr_class(`inline-flex min-w-[3rem] justify-center rounded-full px-2 py-1 text-xs font-semibold ${item.interest >= 75 ? "bg-emerald-100 text-emerald-700" : item.interest >= 50 ? "bg-amber-100 text-amber-700" : item.interest >= 25 ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-600"}`)}>${escape_html(item.interest.toFixed(0))}</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div> <div class="rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 class="text-base font-semibold text-slate-900">System Events</h3></div> <ul class="flex max-h-64 flex-col gap-3 overflow-auto px-5 py-4 text-sm"><!--[-->`);
    const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$events", events));
    for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
      let event = each_array_3[index];
      $$renderer2.push(`<li class="rounded-lg border border-slate-200 bg-slate-50 p-3"><div class="flex items-center justify-between text-xs text-slate-500"><span class="font-semibold uppercase tracking-wide">${escape_html(event.tier)}</span> <time>${escape_html(new Date(event.createdAt).toLocaleTimeString())}</time></div> <p class="mt-1 text-slate-700">${escape_html(event.message)}</p></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></aside></section></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
