<script lang="ts">
  import Sparkline from '$components/Sparkline.svelte';
  import { onMount } from 'svelte';
  import { connect } from '$lib/websocket';
  import { rankings } from '$stores/liveRankings';
  import type { PageData } from './$types';

  export let data: PageData;

  let history = data.history ?? [];
  let latest = history[0];

  const priceSeries = history.map((item) => item.price).reverse();

  onMount(() => {
    connect();
    const unsubscribe = rankings.subscribe(($rankings) => {
      for (const tier of Object.values($rankings)) {
        const found = tier.find((row) => row.symbol === data.symbol);
        if (found) {
          latest = { ...found, scrapedAt: new Date().toISOString() } as typeof latest;
        }
      }
    });

    return () => unsubscribe();
  });
</script>

<div class="min-h-screen bg-slate-100">
  <div class="mx-auto max-w-5xl px-6 py-10">
    <a class="text-sm font-medium text-blue-600 hover:text-blue-500" href="/">← Back to dashboard</a>
    <div class="mt-6 grid gap-6 md:grid-cols-[2fr_1fr]">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h1 class="text-2xl font-semibold text-slate-900">{data.symbol}</h1>
            <p class="text-sm text-slate-500">Live snapshot sourced locally.</p>
          </div>
        </div>
        <section class="space-y-4 px-6 py-5">
          <div class="rounded-2xl bg-slate-100 p-5">
            <div class="text-3xl font-semibold text-slate-900">${latest?.price?.toFixed?.(2) ?? '—'}</div>
            <div class={`text-sm ${latest?.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {latest?.changePct?.toFixed?.(2) ?? '0.00'}%
              </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
            <Sparkline values={priceSeries} />
          </div>
        </section>
      </div>

      <aside class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Recent Snapshots</h2>
        </div>
        <ul class="mt-4 flex max-h-96 flex-col gap-2 overflow-auto px-6 pb-6 text-sm">
          {#each history.slice(0, 40) as item (item.scrapedAt)}
            <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span class="text-xs font-medium text-slate-600">{new Date(item.scrapedAt).toLocaleTimeString()}</span>
              <span class={`font-mono ${item.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.price.toFixed(2)} ({item.changePct.toFixed(2)}%)
              </span>
            </li>
          {/each}
        </ul>
      </aside>
    </div>
  </div>
</div>
