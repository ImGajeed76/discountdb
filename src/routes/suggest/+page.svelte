<script lang="ts">
	import type { PageData } from "./$types.js";
	import CreateCouponForm from '$lib/components/ui/create_coupon/CreateCouponForm.svelte';
	export let data: PageData;
</script>

<CreateCouponForm data={data.form} merchants={data.merchants} />