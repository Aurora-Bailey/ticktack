import { d as derived, w as writable } from "./index.js";
const rankings = writable({
  weekly: [],
  daily: [],
  hourly: [],
  minute: []
});
const events = writable([]);
const topCombined = derived(rankings, ($rankings) => {
  return [
    ...$rankings.minute,
    ...$rankings.hourly.filter((row) => !$rankings.minute.find((m) => m.symbol === row.symbol)),
    ...$rankings.daily.filter((row) => !$rankings.minute.find((m) => m.symbol === row.symbol))
  ].sort((a, b) => b.interest - a.interest).slice(0, 50);
});
export {
  events as e,
  rankings as r,
  topCombined as t
};
