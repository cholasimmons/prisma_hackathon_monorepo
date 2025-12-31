<script lang="ts">
	import { LucideUser } from "@lucide/svelte";

    let { avatarUrl, size = 128, alt }: { avatarUrl: string | null, size: number, alt?: string } = $props();
    const S3_ENDPOINT = import.meta.env.PUBLIC_S3_ENDPOINT;
    const S3_BUCKET = import.meta.env.PUBLIC_S3_BUCKET;

    const src = $derived.by(() => `${S3_ENDPOINT}/${S3_BUCKET}/${avatarUrl}`);
    console.log(src);
    // const src = `${S3_ENDPOINT}/${S3_BUCKET}/${avatarUrl}`;
</script>


{#if avatarUrl}
  <img
    {src}
    {alt}
    class="avatar"
    width={size}
    height={size}
    loading="lazy"
  />
{:else}
  <div class="avatar-fallback" style={`width: ${size}px; height: ${size}px`}>
    <span>
        <LucideUser size={size/3} />
    </span>
  </div>
{/if}

<style>
    .avatar {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f8f9fa;
    }
    .avatar-fallback {
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.5rem;
        font-weight: bold;
    }
</style>