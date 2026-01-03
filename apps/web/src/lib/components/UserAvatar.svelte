<script lang="ts">
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from "$env/static/public";
	import mono_config from "@config";

    let { src, className = 'w-12 h-12', alt }: { src?: string | null, className?: string, alt?: string } = $props();

    const d = $derived.by(() => {
      if(src){
        return (`${PUBLIC_S3_ENDPOINT}/${PUBLIC_S3_BUCKET}/${src}`);
      }
      return mono_config.defaultAvatar || '/images/default-avatar.png';
    });
</script>

<img
    src={d}
    {alt}
    class={className + ` w-full h-full aspect-square object-cover rounded-full ${src ? 'border-3' : ''} border-gray-400 dark:border-gray-600`}
    loading="lazy"
/>