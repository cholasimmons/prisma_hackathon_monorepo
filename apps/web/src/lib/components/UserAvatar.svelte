<script lang="ts">
    let { avatarUrl, size = 128, alt }: { avatarUrl?: string | null, size: number, alt?: string } = $props();

    const src = $derived.by(() => (`https://minio-prisma.vps.simmons.studio/prismabucket/${avatarUrl}`) || '/images/default-avatar.png');
    // const src = `${S3_ENDPOINT}/${S3_BUCKET}/${avatarUrl}`;
</script>

<img
    {src}
    {alt}
    class="avatar"
    width={size}
    height={size}
    loading="lazy"
/>

<style>
    .avatar {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f8f9fa;
    }
</style>