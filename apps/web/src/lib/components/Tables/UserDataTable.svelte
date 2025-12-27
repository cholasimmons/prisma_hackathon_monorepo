<script lang="ts">
    import { createRender, createTable, Render, Subscribe } from '@humanspeak/svelte-headless-table';
	import { addColumnFilters, addColumnOrder, addSortBy, addPagination, addTableFilter } from '@humanspeak/svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import AvatarCell from '$lib/components/AvatarCell.svelte';
	import type { UserProfile } from '$lib/models/user.model';
	import { CircleAlertIcon, CircleCheckIcon, ShieldCheckIcon, User } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

    let { data, onClick }: { data: UserProfile[], onClick: (user: UserProfile) => void } = $props();

	let _avatar = $state('/images/default-avatar.png');

	let tableData = readable(data);

    const table = createTable(tableData, {
      sort: addSortBy(),
      page: addPagination({ initialPageSize: 10, serverSide: false }),
      filter: addColumnFilters(),
      colOrder: addColumnOrder()
    })

   	const tableColumns = table.createColumns([
       	table.column({
              id: 'image',
              header: 'Avatar',
              accessor: row => row.image,
              cell: ({ value }) => createRender(AvatarCell, { src: value ?? _avatar })
        }),
	    table.column({
               header: 'Name',
               accessor: 'name',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               }
           }),
           table.column({
               header: 'Email',
               accessor: 'email',
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               },
               cell: ({ value }) => value
           }),
           table.column({
               header: 'Role',
               accessor: row => row.role,
               plugins: {
                 sort: {},
                 colOrder: {},
                 page: {}
               },
               cell: ({ value }) => value === 'admin' ? createRender(ShieldCheckIcon, { class: 'text-amber-600' }) : createRender(User, { class: 'text-green-600' })
           }),
           table.column({
               header: 'Status',
               accessor: row => row,
               cell: ({ value }) => value.banned ? createRender(CircleAlertIcon, { class: 'text-red-600' }) : createRender(CircleCheckIcon, { class: 'text-green-600' }),
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
                                    <th {...attrs} onclick={props.sort.toggle} class="text-start font-normal">
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
                    <tr {...rowAttrs} class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onclick={() => onClick(row.original)}>
                        {#each row.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <td in:fade={{ duration: 200 * $pageIndex }} {...attrs}>
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
        <button onclick={() => $pageIndex--} disabled={$hasPreviousPage || $pageIndex === 0}>
            Previous
        </button>
        <span>Page {$pageIndex + 1} of {$pageCount}</span>
        <button onclick={() => $pageIndex++} disabled={!$hasNextPage}>
            Next
        </button>
    </div>
</div>