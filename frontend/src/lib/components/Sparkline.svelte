<script lang="ts">
  export let values: number[] = [];
</script>

<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="h-16 w-full">
  {#if values.length > 1}
    {#key values.join(',')}
      <polyline
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        points={values
          .map((v, i) => {
            const x = (i / (values.length - 1)) * 100;
            const ymin = Math.min(...values);
            const ymax = Math.max(...values);
            const range = ymax - ymin || 1;
            const y = 30 - ((v - ymin) / range) * 30;
            return `${x},${y}`;
          })
          .join(' ')}
      />
    {/key}
  {/if}
</svg>
