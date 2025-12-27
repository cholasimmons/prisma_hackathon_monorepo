<script lang="ts">
    import { createRender, createTable, Render, Subscribe } from '@humanspeak/svelte-headless-table';
	import { addColumnFilters, addColumnOrder, addSortBy, addPagination, addTableFilter } from '@humanspeak/svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { hexToColorName } from '$lib/color/colors';
	import ColorNamer from 'color-namer';
	import StyledText from './StyledText.svelte';
	import ColorCircle from './ColorCircle.svelte';

    let { data, onClick }: { data: Vehicle[], onClick: (user: Vehicle) => void } = $props();

	let tableData = readable(data);

    const table = createTable(tableData, {
      sort: addSortBy(),
      page: addPagination({ initialPageSize: 10, serverSide: false }),
      filter: addColumnFilters(),
      colOrder: addColumnOrder()
    })

   	const tableColumns = table.createColumns([
        table.column({
            header: '',
            accessor: row => row.color,
            cell: ({ value }) => value ? createRender(ColorCircle, { color: value }) : 'N/A',
            plugins: {
              sort: {},
              colOrder: {},
              page: {}
            }
        }),
	    table.column({
               header: 'Plate',
               accessor: 'plate',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               },
               cell: ({ value }) => value ? createRender(StyledText, { html: value, className: '2xl font-semibold' }) : 'N/A'
           }),
           table.column({
               header: 'Make',
               accessor: 'make',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               }
           }),
           table.column({
               header: 'Model',
               accessor: 'model',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               },
               cell: ({ value }) => value ? value : 'N/A'
           }),
           table.column({
               header: 'Type',
               accessor: row => row.type,
               cell: ({ value }) => value ? createRender(StyledText, { html: value.toWellFormed(), className: 'text-base font-regular' }) : 'N/A',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               }
           }),
           table.column({
               header: 'Year',
               accessor: row => row.year,
               cell: ({ value }) => value ? Number(value) : 'N/A',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               }
           }),
       ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates: {page} } =
        table.createViewModel(tableColumns)

    const { pageIndex, pageCount,
           hasPreviousPage,
           hasNextPage, } = page;
</script>

<div class="overflow-x-auto">
    <table {...$tableAttrs} class="min-w-full">
        <thead>
            {#each $headerRows as headerRow}
                <Subscribe rowAttrs={headerRow.attrs()}>
                    <tr>
                        {#each headerRow.cells as cell}
                            <Subscribe
                                attrs={cell.attrs()} let:attrs
                                props={cell.props()} let:props>
                                    <th {...attrs} onclick={props.sort.toggle} class="px-2 text-start font-normal text-lg">
                                        <Render of={cell.render()} />
                                        {#if props.sort.order === 'asc'}
                                            ⬇️
                                        {:else if props.sort.order === 'desc'}
                                            ⬆️
                                        {/if}
                                    </th>
                            </Subscribe>
                        {/each}
                    </tr>
                </Subscribe>
            {/each}
        </thead>
        <tbody {...$tableBodyAttrs}>
            {#each $pageRows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                    <tr {...rowAttrs} class="text-lg text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onclick={() => onClick(row.original)}>
                        {#each row.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <td in:fade={{ duration: 200 * $pageIndex }} class="p-2" {...attrs}>
                                    <Render of={cell.render()} />
                                </td>
                            </Subscribe>
                        {/each}
                    </tr>
                </Subscribe>
            {/each}
        </tbody>
    </table>

    <hr class="my-4">

    <!-- Pagination controls -->
    <div class="flex justify-between items-center gap-2 mt-4">
        <button onclick={() => $pageIndex--} disabled={$pageIndex === 0}>
            Previous
        </button>
        <span>Page {$pageIndex + 1} of {$pageCount}</span>
        <button onclick={() => $pageIndex++} disabled={!$hasNextPage}>
            Next
        </button>
    </div>
</div>