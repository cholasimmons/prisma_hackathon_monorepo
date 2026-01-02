<script lang="ts">
    let { src, className = 'w-12 h-12', alt }: { src?: string | null, className: string, alt?: string } = $props();

    const d = $derived.by(() => {
      if(src){
        return (`https://minio-prisma.vps.simmons.studio/prismabucket/${src}`);
      }
      return '/images/default-avatar.png';
    });

</script>

<img
    src={d}
    {alt}
    class={className + ' aspect-square rounded-full object-fill overflow-hidden'}
    loading="lazy"
/>

<style>
    .avatar {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f8f9fa;
    }
</style>