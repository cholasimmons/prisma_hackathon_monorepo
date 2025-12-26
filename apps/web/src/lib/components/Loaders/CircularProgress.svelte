<script lang="ts">
  let {
    value = 0,        // 0 → 100
    size = 120,       // px
    stroke = 10,      // px
    duration = 500,   // ms
    label = ''
  } = $props<{
    value?: number;
    size?: number;
    stroke?: number;
    duration?: number;
    label?: string;
  }>();

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  $effect(() => {
    // clamp for safety
    if (value < 0) value = 0;
    if (value > 100) value = 100;
  });

  const offset = circumference * (1 - value / 100);
</script>

<div
  class="relative inline-flex items-center justify-center"
  style={`width:${size}px;height:${size}px`}
>
  <svg
    width={size}
    height={size}
    class="-rotate-90"
  >
    <!-- Background -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="transparent"
      stroke="currentColor"
      class="text-gray-200 dark:text-gray-800"
      stroke-width={stroke}
    />

    <!-- Progress -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="transparent"
      stroke="currentColor"
      class="text-amber-500 transition-[stroke-dashoffset]"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      style={`transition-duration:${duration}ms`}
    />
  </svg>

  <!-- Center label -->
  <div class="absolute text-center">
    <div class="text-xl font-semibold">{value}%</div>
    {#if label}
      <div class="text-xs text-gray-500">{label}</div>
    {/if}
  </div>
</div>
