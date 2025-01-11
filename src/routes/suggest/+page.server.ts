import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createCouponSchema } from '$lib/schemas/create_coupon';
import { type Actions, fail } from '@sveltejs/kit';
import { suggestCoupon } from '$lib/coupons';

export const load = async () => {
	return {
		form: await superValidate(zod(createCouponSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(createCouponSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			console.log(form.data);

			const res = await suggestCoupon({
				code: form.data.code,
				title: form.data.title,
				description: form.data.description,
				merchant_name: form.data.merchant_name,
				merchant_url: form.data.merchant_url,
				discount_value: form.data.discount_value,
				discount_type: form.data.discount_type,
				// parse date from ISO string
				start_date: form.data.start_date,
				end_date: form.data.end_date,
				terms_conditions: form.data.terms_conditions,
				minimum_purchase_amount: form.data.minimum_purchase_amount,
				maximum_discount_amount: form.data.maximum_discount_amount,
				categories: form.data.categories,
				tags: form.data.tags,
				regions: form.data.regions,
				store_type: form.data.store_type
			});
			return {
				form,
				id: res.id
			};
		} catch (e) {
			return fail(500, {
				form,
				error: e
			});
		}
	}
};
