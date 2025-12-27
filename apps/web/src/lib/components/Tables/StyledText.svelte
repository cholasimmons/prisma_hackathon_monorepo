<script lang="ts">
    let { html, className="2xl font-semibold" }:{ html: string, className: string } = $props();
</script>

<span class={className}>{html}</span>
<!-- {@html html} -->