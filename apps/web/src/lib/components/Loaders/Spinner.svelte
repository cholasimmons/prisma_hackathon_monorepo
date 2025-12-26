<script lang="ts">
  const {
    size = 16,        // px
    stroke = 3.5,
    speed = 800       // ms per rotation
  } = $props<{
    size?: number;
    stroke?: number;
    speed?: number;
  }>();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  class="animate-spin text-current"
  style={`animation-duration:${speed}ms`}
  aria-hidden="true"
>
  <circle
    cx="12"
    cy="12"
    r="10"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-dasharray="60"
    stroke-dashoffset="20"
    opacity="0.65"
  />
  <circle
    cx="12"
    cy="12"
    r="10"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-dasharray="60"
    stroke-dashoffset="45"
  />
</svg>
