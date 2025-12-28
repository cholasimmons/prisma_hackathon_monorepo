<script lang="ts">
	import { goto } from "$app/navigation";
	import { api } from "$lib/api/client";
	import Spinner from "$lib/components/Loaders/Spinner.svelte";
	import VehicleModal from "$lib/components/Modals/VehicleModal.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import VehicleDataTable from "$lib/components/Tables/VehicleDataTable.svelte";
	import type { Vehicle } from "$lib/models/vehicle.model";
	import { LucidePlus } from "@lucide/svelte";
	import { onMount } from "svelte";
	import toast from "svelte-french-toast";
	import { fade } from "svelte/transition";

	let selectedVehicle = $state<Vehicle | null>(null);

	const data =[
	  { id: '1', make: 'Toyota', model: 'Camry', year: 2020, color: '#0000FF', plate: 'ABC 123', type: 'sedan', forSale: false, isActive: false, updatedAt: new Date('2023-01-01T00:00:00Z') },
	  { id: '2', make: 'Honda', model: 'Civic', year: 2021, color: '#FF0000', plate: 'DEF 456', type: 'hatchback', forSale: true, isActive: true, updatedAt: new Date('2023-02-01T00:00:00Z') },
	  { id: '3', make: 'Ford', model: 'Mustang', year: 2022, color: '#222222', plate: 'GHI 789', type: 'coupe', forSale: true, isActive: true, updatedAt: new Date('2023-03-01T00:00:00Z') },
	  { id: '4', make: 'Chevrolet', model: 'Silverado', year: 2023, color: '#00FF00', plate: 'JKL 012', type: 'hatchback', forSale: false, isActive: true, updatedAt: new Date('2023-04-01T00:00:00Z') },
	  { id: '5', make: 'Nissan', model: 'Altima', year: 2024, color: '#FFA500', plate: 'MNO 345', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-05-01T00:00:00Z') },
	  { id: '6', make: 'BMW', model: 'X5', year: 2025, color: '#FF00FF', plate: 'PQR 678', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-06-01T00:00:00Z') },
	  { id: '7', make: 'Tesla', model: 'Model S', year: 2026, color: '#00FFFF', plate: 'STU 901', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-07-01T00:00:00Z') },
	  { id: '8', make: 'Mercedes-Benz', model: 'C-Class', year: 2027, color: '#FFFF00', plate: 'VWX 234', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-08-01T00:00:00Z') },
	  { id: '9', make: 'Audi', model: 'A4', year: 2028, color: '#FF00FF', plate: 'YZA 567', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-09-01T00:00:00Z') },
	  { id: '10', make: 'Hyundai', model: 'Elantra', year: 2029, color: '#00FF00', plate: 'BCD 890', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-10-01T00:00:00Z') },
	  { id: '11', make: 'Toyota', model: 'Corolla', year: 2030, color: '#FF00FF', plate: 'EFG 123', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-11-01T00:00:00Z') },
	  { id: '12', make: 'Honda', model: 'Accord', year: 2031, color: '#00FF00', plate: 'HIJ 456', type: 'sedan', forSale: true, isActive: true, updatedAt: new Date('2023-12-01T00:00:00Z') },
	];

	let vehicles = $state<Vehicle[]>(data);
	let loading = $state(true);
	let error = $state<string | null>(null);

	function handleTableClick(vehicle: Vehicle) {
		// User click => opens modal
		selectedVehicle = vehicle;
	}

	function _fetchVehicles() {
	loading = true;
	  try {
			api.get<Vehicle[]>('/vehicles/admin').then(response => {
				vehicles = response.data;
			}).catch(error => {
				error = error.message ?? error;
				toast.error(error);
			}).finally(() => {
				loading = false;
			});
		} catch (error) {
			console.error(error);
		}
	}

	onMount(() => {
	    _fetchVehicles()
	});
</script>


<main
	class="mx-auto px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>

    <PageHeader
		title="Admin | Vehicles"
		description="Manage aggregated vehicles."
		endIcon={LucidePlus}
		endAction={() => { goto('/vehicle/submit') }}
	/>

    <div class="flex flex-col w-full space-y-2 ">

        {#if loading}
            <div class="flex w-full items-center justify-center">
                <Spinner size={32} />
            </div>
        {:else if vehicles.length > 0}
            <div in:fade={{ duration: 500 }} class="w-full">
                <VehicleDataTable data={vehicles} onClick={handleTableClick} />
            </div>
        {:else}
            <div class="flex w-full items-center justify-center">
                <p class="text-gray-600 dark:text-gray-400">No users found.</p>
                {#if error}
                    <small>{error}</small>
                {/if}
                <button onclick={_fetchVehicles} class="txt-btn">
                    Re-fetch
                </button>
            </div>
        {/if}
    </div>
</main>

{#if selectedVehicle}
    <VehicleModal vehicle={selectedVehicle} onClose={() => selectedVehicle = null} />
{/if}