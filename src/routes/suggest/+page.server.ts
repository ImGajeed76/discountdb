import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { createCouponSchema } from '$lib/schemas/create_coupon';
import { getMerchants } from '$lib/coupons';

export const load = async () => {

	// fetch merchants
	const merchants = await getMerchants();
	if (!merchants.data) {
		throw new Error("Failed to fetch merchants");
	}


	return {
		form: await superValidate(zod(createCouponSchema)),
		merchants: merchants
	};
};