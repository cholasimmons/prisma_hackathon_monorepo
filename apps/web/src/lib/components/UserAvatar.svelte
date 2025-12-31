<script lang="ts">
    let { src, className = 'w-12 h-12 rounded-full', alt }: { src?: string | null, className: string, alt?: string } = $props();

    const d = $derived.by(() => (`https://minio-prisma.vps.simmons.studio/prismabucket/${src}`) || '/images/default-avatar.png');
    // const src = `${S3_ENDPOINT}/${S3_BUCKET}/${avatarUrl}`;
</script>

<img
    src={d}
    {alt}
    class={className}
    loading="lazy"
/>

<style>
    .avatar {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f8f9fa;
    }
</style>