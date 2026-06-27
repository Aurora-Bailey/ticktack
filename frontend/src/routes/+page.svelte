<script lang="ts">
  import { onMount } from 'svelte';
  import { connect } from '$lib/websocket';
  import { rankings, events, type Tier, topCombined } from '$stores/liveRankings';

  const tierOrder: Tier[] = ['minute', 'hourly', 'daily', 'weekly'];

  let selectedTier: Tier = 'minute';

  const tierLabels: Record<Tier, string> = {
    minute: '1 Minute Movers',
    hourly: 'Hourly Momentum',
    daily: 'Daily Leaders',
    weekly: 'Weekly Watch'
  };

  onMount(() => {
    connect();
  });
</script>

<div class="min-h-screen bg-slate-100">
  <div class="mx-auto max-w-6xl px-6 py-10">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">StockPulse Monitor</h1>
        <p class="text-sm text-slate-500">Live rankings flowing from the local Deno engine.</p>
      </div>
      <nav class="flex flex-wrap gap-2">
        {#each tierOrder as tier}
          <button
            class={`rounded-full px-4 py-2 text-sm font-medium transition capitalize ${
              selectedTier === tier
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-500'
                : 'border border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
            on:click={() => (selectedTier = tier)}
          >
            {tierLabels[tier]}
          </button>
        {/each}
      </nav>
    </header>

    <section class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">{tierLabels[selectedTier]}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="px-4 py-3 text-left font-semibold tracking-wide">Symbol</th>
                <th class="px-4 py-3 text-right font-semibold tracking-wide">Score</th>
                <th class="px-4 py-3 text-right font-semibold tracking-wide">Interest</th>
                <th class="px-4 py-3 text-right font-semibold tracking-wide">Price</th>
                <th class="px-4 py-3 text-right font-semibold tracking-wide">Change %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#if $rankings[selectedTier]?.length}
                {#each $rankings[selectedTier] as row (row.symbol)}
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-semibold text-slate-800">
                      <a class="text-blue-600 hover:underline" href={`/stocks/${row.symbol}`}>{row.symbol}</a>
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-slate-700">{row.score.toFixed(2)}</td>
                    <td class="px-4 py-3 text-right">
                      <span
                        class={`inline-flex min-w-[3.5rem] justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                          row.interest >= 75
                            ? 'bg-emerald-100 text-emerald-700'
                            : row.interest >= 50
                              ? 'bg-amber-100 text-amber-700'
                              : row.interest >= 25
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.interest.toFixed(0)}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-slate-700">${row.price.toFixed(2)}</td>
                    <td
                      class={`px-4 py-3 text-right font-mono ${
                        row.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.changePct.toFixed(2)}%
                    </td>
                  </tr>
                {/each}
              {:else}
                <tr>
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
                    Waiting for live data… ensure backend is running.
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 class="text-base font-semibold text-slate-900">Blended Highlights</h3>
          </div>
          <ul class="flex max-h-72 flex-col gap-2 overflow-auto px-5 py-4">
            {#each $topCombined as item (item.symbol)}
              <li class="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2 text-sm">
                <div class="flex flex-col">
                  <span class="font-semibold text-slate-800">{item.symbol}</span>
                  <span class="text-xs text-slate-500">Score {item.score.toFixed(1)}</span>
                </div>
                <span
                  class={`inline-flex min-w-[3rem] justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                    item.interest >= 75
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.interest >= 50
                        ? 'bg-amber-100 text-amber-700'
                        : item.interest >= 25
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.interest.toFixed(0)}
                </span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 class="text-base font-semibold text-slate-900">System Events</h3>
          </div>
          <ul class="flex max-h-64 flex-col gap-3 overflow-auto px-5 py-4 text-sm">
            {#each $events as event, index (index)}
              <li class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span class="font-semibold uppercase tracking-wide">{event.tier}</span>
                  <time>{new Date(event.createdAt).toLocaleTimeString()}</time>
                </div>
                <p class="mt-1 text-slate-700">{event.message}</p>
              </li>
            {/each}
          </ul>
        </div>
      </aside>
    </section>
  </div>
</div>
