<script lang="ts">
    let { src, width, height, className = 'w-12 h-12 rounded-full', alt = 'Avatar' }: { src: string|undefined, width?: string, height?: string, className: string, alt: string } = $props();
</script>

<img {src} class={className} {width} {height} alt={alt} />