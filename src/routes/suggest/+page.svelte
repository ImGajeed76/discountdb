<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		type SuperValidated,
		type Infer,
		superForm
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type CreateCouponSchema, createCouponSchema } from '$lib/schemas/create_coupon';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DiscountTypeEnum, getMerchants, type MerchantList } from '$lib/coupons';
	import { writable } from 'svelte/store';
	import { Toggle } from '$lib/components/ui/toggle';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import { CalendarIcon } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let data: SuperValidated<Infer<CreateCouponSchema>> = page.data.form;
	const merchants = writable<MerchantList>({
		data: [],
		total: 0
	});

	const discountTypes: {
		value: DiscountTypeEnum;
		label: string;
	}[] = [
		{ value: DiscountTypeEnum.PERCENTAGE_OFF, label: 'Percentage' },
		{ value: DiscountTypeEnum.FIXED_AMOUNT, label: 'Fixed' },
		{ value: DiscountTypeEnum.BOGO, label: 'Buy One Get One' },
		{ value: DiscountTypeEnum.FREE_SHIPPING, label: 'Free Shipping' }
	];

	const merchantNames = writable<{
		value: string;
		label: string;
	}[]>([{
		value: '',
		label: 'Loading...'
	}]);

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

	onMount(async () => {
		const merchantsResponse = await getMerchants();
		if (merchantsResponse.data) {
			merchants.set(merchantsResponse);
			merchantNames.set(merchantsResponse.data.map(merchant => ({
				value: merchant.merchant_name,
				label: merchant.merchant_name
			})));
		}
	});

	function updateMerchantUrl() {
		const merchant = $merchants.data.find(m => m.merchant_name === $formData.merchant_name);
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
		validators: zodClient(createCouponSchema),
		onResult: async ({ result }) => {
			if (result.type === 'success') {
				toast.success(`Coupon suggested successfully! ID: ${result.data?.id}`, {
					description: 'Thank you for helping! 🎉'
				});
			} else {
				toast.error('Failed to suggest coupon!', {
					description: 'Double check your information and try again.'
				});
			}
		}
	});

	const { form: formData, enhance } = form;

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let startDate = $state<DateValue | undefined>();
	let startDatePlaceholder = $state<DateValue>(today(getLocalTimeZone()));

	$effect(() => {
		startDate = $formData.start_date ? parseDate($formData.start_date) : undefined;
	});

	let endDate = $state<DateValue | undefined>();
	let endDatePlaceholder = $state<DateValue>(today(getLocalTimeZone()));

	$effect(() => {
		endDate = $formData.end_date ? parseDate($formData.end_date) : undefined;
	});

	$effect(() => {
		if (startDate && endDate && startDate > endDate) {
			endDate = startDate;
		}
	});

	const categoryInput = writable<string>('');
	const tagInput = writable<string>('');
	const regionInput = writable<string>('');

	const store_type_options = [
		{ value: "online", label: "Online" },
		{ value: "in_store", label: "In Store" },
		{ value: "both", label: "Both" }
	]
</script>


<ScrollArea class="h-full w-full max-w-4xl mx-auto overflow-hidden">
	<form method="POST" use:enhance class="px-5">
		<h3 class="text-3xl mb-5 font-semibold text-center">Suggest a new coupon!</h3>

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
					<Input type="number" {...props} bind:value={$formData.discount_value} />
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
							<Input {...props} bind:value={$formData.merchant_name} oninput={updateMerchantUrl} />
						{:else}
							<Select.Root
								type="single"
								bind:value={$formData.merchant_name}
								name={props.name}
								onValueChange={updateMerchantUrl}
							>
								<Select.Trigger {...props}>
									{$formData.merchant_name
										? $merchantNames.find(t => t.value === $formData.merchant_name)?.label
										: "Select merchant name"}
								</Select.Trigger>
								<Select.Content>
									{#each $merchantNames as type}
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
						<Toggle variant="outline" class="w-40" bind:pressed={$customMerchant}>
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
						<Toggle variant="outline" class="w-40" bind:pressed={$customMerchantUrl} disabled={$customMerchant}>
							Custom URL
						</Toggle>
					</div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="start_date" class="flex flex-col">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Start of Coupon <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Popover.Root>
						<Popover.Trigger
							{...props}
							class={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-start pl-4 text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
						>
							{startDate
								? df.format(startDate.toDate(getLocalTimeZone()))
								: "Pick a date"}
							<CalendarIcon class="ml-auto size-4 opacity-50" />
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" side="top">
							<Calendar
								type="single"
								value={startDate}
								bind:placeholder={startDatePlaceholder}
								minValue={new CalendarDate(1900, 1, 1)}
								calendarLabel="Start Date"
								onValueChange={(v) => {
                if (v) {
                  $formData.start_date = v.toString();
                } else {
                  $formData.start_date = "";
                }
              }}
							/>
						</Popover.Content>
					</Popover.Root>
					<Form.FieldErrors />
					<input hidden value={$formData.start_date} name={props.name} />
				{/snippet}
			</Form.Control>
		</Form.Field>

		<Form.Field {form} name="end_date" class="flex flex-col">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>End of Coupon <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Popover.Root>
						<Popover.Trigger
							{...props}
							class={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-start pl-4 text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
						>
							{endDate
								? df.format(endDate.toDate(getLocalTimeZone()))
								: "Pick a date"}
							<CalendarIcon class="ml-auto size-4 opacity-50" />
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" side="top">
							<Calendar
								type="single"
								value={endDate}
								bind:placeholder={endDatePlaceholder}
								minValue={startDate || new CalendarDate(1900, 1, 1)}
								calendarLabel="End Date"
								onValueChange={(v) => {
                if (v) {
                  $formData.end_date = v.toString();
                } else {
                  $formData.end_date = "";
                }
              }}
							/>
						</Popover.Content>
					</Popover.Root>
					<Form.FieldErrors />
					<input hidden value={$formData.end_date} name={props.name} />
				{/snippet}
			</Form.Control>
		</Form.Field>

		<Form.Field {form} name="terms_conditions">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Terms and/or Conditions <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Textarea {...props} bind:value={$formData.terms_conditions} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="minimum_purchase_amount">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Minimum purchase amount <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Input type="number" {...props} bind:value={$formData.minimum_purchase_amount} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="maximum_discount_amount">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Maximum discount amount <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Input type="number" {...props} bind:value={$formData.maximum_discount_amount} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="categories">
			<Form.Control>
				{#snippet children()}
					<Form.Label>Categories (type and press comma) <span class="text-xs text-gray-500">(Optional)</span>
					</Form.Label>

					{#if $formData.categories && $formData.categories.length > 0}
						<div class="flex pb-2 space-x-2">
							{#each $formData.categories as category}
								<Badge variant="outline" class="hover:bg-red-500 duration-200 cursor-pointer" onclick={() => {
									if (!$formData.categories) {
										$formData.categories = [];
									}

									$formData.categories = $formData.categories.filter(c => c !== category);
								}}>
									{category}
								</Badge>
							{/each}
						</div>
					{/if}

					<Input bind:value={$categoryInput} oninput={() => {
						if (!$formData.categories) {
							$formData.categories = [];
						}

						if ($categoryInput.length > 1 && $categoryInput[$categoryInput.length - 1] === ',') {
							let input = $categoryInput.slice(0, -1).toLowerCase();
							// check if the category is already in the list
							if ($formData.categories.includes(input)) {
								$categoryInput = '';
								return;
							}

							$formData.categories = [...$formData.categories, input];
							$categoryInput = '';
						}
					}} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="tags">
			<Form.Control>
				{#snippet children()}
					<Form.Label>Tags (type and press comma) <span class="text-xs text-gray-500">(Optional)</span>
					</Form.Label>

					{#if $formData.tags && $formData.tags.length > 0}
						<div class="flex pb-2 space-x-2">
							{#each $formData.tags as tag}
								<Badge variant="outline" class="hover:bg-red-500 duration-200 cursor-pointer" onclick={() => {
									if (!$formData.tags) {
										$formData.tags = [];
									}

									$formData.tags = $formData.tags.filter(t => t !== tag);
								}}>
									{tag}
								</Badge>
							{/each}
						</div>
					{/if}

					<Input bind:value={$tagInput} oninput={() => {
						if (!$formData.tags) {
							$formData.tags = [];
						}

						if ($tagInput.length > 1 && $tagInput[$tagInput.length - 1] === ',') {
							let input = $tagInput.slice(0, -1).toLowerCase();
							// check if the tag is already in the list
							if ($formData.tags.includes(input)) {
								$tagInput = '';
								return;
							}

							$formData.tags = [...$formData.tags, input];
							$tagInput = '';
						}
					}} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="regions">
			<Form.Control>
				{#snippet children()}
					<Form.Label>Regions (type and press comma) <span class="text-xs text-gray-500">(Optional)</span>
					</Form.Label>

					{#if $formData.regions && $formData.regions.length > 0}
						<div class="flex pb-2 space-x-2">
							{#each $formData.regions as region}
								<Badge variant="outline" class="hover:bg-red-500 duration-200 cursor-pointer" onclick={() => {
									if (!$formData.regions) {
										$formData.regions = [];
									}

									$formData.regions = $formData.regions.filter(r => r !== region);
								}}>
									{region}
								</Badge>
							{/each}
						</div>
					{/if}

					<Input bind:value={$regionInput} oninput={() => {
						if (!$formData.regions) {
							$formData.regions = [];
						}

						if ($regionInput.length > 1 && $regionInput[$regionInput.length - 1] === ',') {
							let input = $regionInput.slice(0, -1).toLowerCase();
							// check if the region is already in the list
							if ($formData.regions.includes(input)) {
								$regionInput = '';
								return;
							}

							$formData.regions = [...$formData.regions, input];
							$regionInput = '';
						}
					}} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="store_type">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Store Type <span class="text-xs text-gray-500">(Optional)</span></Form.Label>
					<Select.Root
						type="single"
						allowDeselect={true}
						bind:value={$formData.store_type}
						name={props.name}
					>
						<Select.Trigger {...props}>
							{$formData.store_type
								? store_type_options.find(t => t.value === $formData.store_type)?.label
								: "Select store type"}
						</Select.Trigger>
						<Select.Content>
							{#each store_type_options as type}
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

		<p class="font-semibold text-center">NOTE: You can only suggest 2 coupons per 10 minutes. Please double check your information!</p>

		<Form.Button class="w-full mt-2">Submit</Form.Button>
	</form>
</ScrollArea>