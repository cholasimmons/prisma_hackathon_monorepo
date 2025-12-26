<script>
    let { title, value} = $props();
</script>

<div class="card flex flex-col gap-1">
  <span class="text-sm text-gray-500">{title}</span>
  <span class="text-2xl font-semibold">{value}</span>
</div>
