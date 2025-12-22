<script lang="ts">
    import { ImagesIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

    type Props = {
        maxImages: number;
        accept: string;
        onChange?: (images: File[]) => void;
        maxSizeMB?: number
      };

  const { maxImages, accept, onChange, maxSizeMB = 3, }: Props= $props();

  let images = $state<File[]>([]);
  let previews = $state<string[]>([]);
  let error = $state<string | null>(null);
  let dragging = $state(false);
  let fileInput: HTMLInputElement | null = null;

  onMount(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);

    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  });

  function triggerFileSelect() {
    fileInput?.click();
  }

    function processFiles(files: File[]) {
        const allowed = files
          .filter((f) => f.type.startsWith('image/'))
          .slice(0, maxImages - images.length);

        if (!allowed.length) return;

        images = [...images, ...allowed];

        allowed.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews = [...previews, e.target?.result as string];
          };
          reader.readAsDataURL(file);
        });

        onChange?.(images);
    }

  function handleFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    processFiles(Array.from(input.files));
    input.value = '';
  }

  function handleDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      dragging = false;

      if (!event.dataTransfer?.files) return;
      processFiles(Array.from(event.dataTransfer.files));
  }

  function removeImage(index: number) {
    images.splice(index, 1);
    previews.splice(index, 1);
    onChange?.(images);
  }
</script>

<div class="my-4">
  <label for="image-uploader" class="block text-sm mb-2">
    Upload Images (max {maxImages})
  </label>

  <input
      id="image-uploader"
    type="file"
    bind:this={fileInput}
    name="photos"
    accept={accept}
    multiple
    onchange={handleFiles}
    style="width: 100%"
    placeholder="Select Images"
    class="hidden"
  />

    <!-- Custom placeholder -->
    <button type="button" class={`flex flex-col cursor-pointer w-full p-12 rounded border-2 border-dashed border-gray-400 dark:border-gray-600 text-center items-center justify-center hover:border-amber-600 min-h-24 transition-colors
        ${dragging ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
              : 'border-gray-400 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-amber-600`}
        onclick={triggerFileSelect}
        ondragover={() => (dragging = true)}
        ondragleave={() => (dragging = false)}
        ondrop={handleDrop}
    >
        <ImagesIcon class="w-6 h-6" />
        {#if images.length === 0}
            <p>{dragging ? 'Drop images here' : 'Click or drag images here'}</p>
        {:else}
            <p>{images.length} image{images.length > 1 ? 's' : ''} selected</p>
        {/if}

        {#if error}
            <p class="text-red-600 text-sm mt-1">{error}</p>
        {/if}
    </button>

    <!-- Previews -->
  <div class="flex gap-2 mt-2 flex-wrap">
    {#each previews as preview, index}
      <div class="relative w-20 h-20 rounded overflow-hidden border border-gray-300 dark:border-gray-600">
        <img src={preview} alt="Preview" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-full"
          onclick={() => removeImage(index)}
        >
          &times;
        </button>
      </div>
    {/each}
  </div>
</div>
