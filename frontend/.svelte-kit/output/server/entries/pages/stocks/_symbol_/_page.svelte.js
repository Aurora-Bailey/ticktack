import { c as attr, d as bind_props, a as attr_class, e as ensure_array_like } from "../../../../chunks/index2.js";
import { f as fallback } from "../../../../chunks/utils2.js";
import "../../../../chunks/liveRankings.js";
import { V as escape_html } from "../../../../chunks/context.js";
function Sparkline($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let values = fallback($$props["values"], () => [], true);
    $$renderer2.push(`<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="h-16 w-full">`);
    if (values.length > 1) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!---->`);
      {
        $$renderer2.push(`<polyline fill="none" stroke="currentColor" stroke-width="2"${attr("points", values.map((v, i) => {
          const x = i / (values.length - 1) * 100;
          const ymin = Math.min(...values);
          const ymax = Math.max(...values);
          const range = ymax - ymin || 1;
          const y = 30 - (v - ymin) / range * 30;
          return `${x},${y}`;
        }).join(" "))}></polyline>`);
      }
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, { values });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = $$props["data"];
    let history = data.history ?? [];
    let latest = history[0];
    const priceSeries = history.map((item) => item.price).reverse();
    $$renderer2.push(`<div class="min-h-screen bg-slate-100"><div class="mx-auto max-w-5xl px-6 py-10"><a class="text-sm font-medium text-blue-600 hover:text-blue-500" href="/">← Back to dashboard</a> <div class="mt-6 grid gap-6 md:grid-cols-[2fr_1fr]"><div class="rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h1 class="text-2xl font-semibold text-slate-900">${escape_html(data.symbol)}</h1> <p class="text-sm text-slate-500">Live snapshot sourced locally.</p></div></div> <section class="space-y-4 px-6 py-5"><div class="rounded-2xl bg-slate-100 p-5"><div class="text-3xl font-semibold text-slate-900">$${escape_html(latest?.price?.toFixed?.(2) ?? "—")}</div> <div${attr_class(`text-sm ${latest?.changePct >= 0 ? "text-emerald-600" : "text-rose-600"}`)}>${escape_html(latest?.changePct?.toFixed?.(2) ?? "0.00")}%</div></div> <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">`);
    Sparkline($$renderer2, { values: priceSeries });
    $$renderer2.push(`<!----></div></section></div> <aside class="rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 class="text-lg font-semibold text-slate-900">Recent Snapshots</h2></div> <ul class="mt-4 flex max-h-96 flex-col gap-2 overflow-auto px-6 pb-6 text-sm"><!--[-->`);
    const each_array = ensure_array_like(history.slice(0, 40));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<li class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span class="text-xs font-medium text-slate-600">${escape_html(new Date(item.scrapedAt).toLocaleTimeString())}</span> <span${attr_class(`font-mono ${item.changePct >= 0 ? "text-emerald-600" : "text-rose-600"}`)}>${escape_html(item.price.toFixed(2))} (${escape_html(item.changePct.toFixed(2))}%)</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul></aside></div></div></div>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
