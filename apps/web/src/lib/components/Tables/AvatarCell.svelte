<script lang="ts">
    let { src, width, height, className = 'w-12 h-12' }: { src: string|undefined, width: string, height: string, className: string } = $props();
</script>

<img {src} class={className} {width} {height} alt="Avatar" />