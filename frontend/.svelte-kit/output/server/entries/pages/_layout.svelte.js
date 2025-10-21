import { h as head, s as slot } from "../../chunks/index2.js";
function _layout($$renderer, $$props) {
  head($$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>StockPulse</title>`);
    });
  });
  $$renderer.push(`<!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]-->`);
}
export {
  _layout as default
};
