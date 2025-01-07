<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		type SuperValidated,
		type Infer,
		superForm
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type CreateCouponSchema, createCouponSchema } from '$lib/schemas/create_coupon';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DiscountTypeEnum, type MerchantList } from '$lib/coupons';
	import { writable } from 'svelte/store';
	import { Toggle } from '$lib/components/ui/toggle';

	export let data: SuperValidated<Infer<CreateCouponSchema>>;
	export let merchants: MerchantList;

	const discountTypes: {
		value: DiscountTypeEnum;
		label: string;
	}[] = [
		{ value: DiscountTypeEnum.PERCENTAGE_OFF, label: 'Percentage' },
		{ value: DiscountTypeEnum.FIXED_AMOUNT, label: 'Fixed' },
		{ value: DiscountTypeEnum.BOGO, label: 'Buy One Get One' },
		{ value: DiscountTypeEnum.FREE_SHIPPING, label: 'Free Shipping' }
	];

	const merchantNames = merchants.data.map(merchants => {
		return {
			value: merchants.merchant_name,
			label: merchants.merchant_name
		};
	});

	const customMerchant = writable(false);

	const merchantUrls = writable<{
		value: string;
		label: string;
	}[]>([]);

	const customMerchantUrl = writable(false);

	customMerchant.subscribe(value => {
		if (value) {
			customMerchantUrl.set(true);
		}
	});

	function updateMerchantUrl() {
		const merchant = merchants.data.find(m => m.merchant_name === $formData.merchant_name);
		if (merchant) {
			$formData.merchant_url = `https://${merchant.merchant_url[0]}`;
			merchantUrls.set(merchant.merchant_url.map(url => ({
				value: `https://${url}`,
				label: `https://${url}`
			})));
		} else {
			$formData.merchant_url = '';
			merchantUrls.set([]);
		}
	}

	const form = superForm(data, {
		validators: zodClient(createCouponSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="code">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Coupon Code</Form.Label>
				<Input {...props} bind:value={$formData.code} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title</Form.Label>
				<Input {...props} bind:value={$formData.title} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea {...props} bind:value={$formData.description} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="discount_type">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Discount Type</Form.Label>
				<Select.Root
					type="single"
					bind:value={$formData.discount_type}
					name={props.name}
				>
					<Select.Trigger {...props}>
						{$formData.discount_type
							? discountTypes.find(t => t.value === $formData.discount_type)?.label
							: "Select discount type"}
					</Select.Trigger>
					<Select.Content>
						{#each discountTypes as type}
							<Select.Item
								value={type.value}
								label={type.label}
							>
								{type.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="discount_value">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Discount Value</Form.Label>
				<Input {...props} bind:value={$formData.discount_value} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="merchant_name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Merchant Name</Form.Label>
				<div class="w-full grid grid-cols-[1fr_auto] space-x-2">
					{#if $customMerchant}
						<Input {...props} bind:value={$formData.merchant_name} oninput={updateMerchantUrl}/>
					{:else}
						<Select.Root
							type="single"
							bind:value={$formData.merchant_name}
							name={props.name}
							onValueChange={updateMerchantUrl}
						>
							<Select.Trigger {...props}>
								{$formData.merchant_name
									? merchantNames.find(t => t.value === $formData.merchant_name)?.label
									: "Select merchant name"}
							</Select.Trigger>
							<Select.Content>
								{#each merchantNames as type}
									<Select.Item
										value={type.value}
										label={type.label}
									>
										{type.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/if}
					<Toggle variant="outline" bind:pressed={$customMerchant}>
						Custom Merchant
					</Toggle>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="merchant_url">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Merchant Url</Form.Label>
				<div class="w-full grid grid-cols-[1fr_auto] space-x-2">
					{#if $customMerchantUrl}
						<Input {...props} bind:value={$formData.merchant_url} />
					{:else}
						<Select.Root
							type="single"
							bind:value={$formData.merchant_url}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.merchant_url
									? $merchantUrls.find(t => t.value === $formData.merchant_url)?.label
									: "Select merchant name"}
							</Select.Trigger>
							<Select.Content>
								{#each $merchantUrls as type}
									<Select.Item
										value={type.value}
										label={type.label}
									>
										{type.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/if}
					<Toggle variant="outline" bind:pressed={$customMerchantUrl} disabled={$customMerchant}>
						Custom URL
					</Toggle>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Submit</Form.Button>
</form>