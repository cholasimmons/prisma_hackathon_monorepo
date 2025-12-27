<script lang="ts">
	import { hexToColorName } from "$lib/color/colors";

    let { color }: { color: string } = $props();
</script>

<div class="h-5 w-5 aspect-square rounded-md" title={hexToColorName(color)}
    style="background-color: {color ?? '#000'};"></div>