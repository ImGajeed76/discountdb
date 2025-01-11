import { z } from "zod";
import { DiscountTypeEnum } from '$lib/coupons';

export const createCouponSchema = z.object({
	code: z.string().min(1).max(50),
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	discount_value: z.number().min(0).max(100000),
	discount_type: z.enum(Object.values(DiscountTypeEnum) as [`${DiscountTypeEnum}`]),
	merchant_name: z.string().min(1).max(100),
	merchant_url: z.string().url(),

	start_date: z.string().optional(),
	end_date: z.string().optional(),
	terms_conditions: z.string().min(1).max(500).optional(),
	minimum_purchase_amount: z.number().min(0).optional(),
	maximum_discount_amount: z.number().min(0).optional(),

	categories: z.array(z.string().min(1).max(20)).max(10).optional(),
	tags: z.array(z.string().min(1).max(20)).max(15).optional(),
	regions: z.array(z.string().min(1).max(20)).max(50).optional(),
	store_type: z.enum(["online", "in_store", "both", '']).optional(),
}).refine(
	(data) => {
		// Skip validation if either date is missing
		if (!data.start_date || !data.end_date) return true;

		return data.end_date > data.start_date;
	},
	{
		message: "End date must be after start date",
		path: ["end_date"], // This will show the error on the end_date field
	}
).refine(
	(data) => {
		// For percentage discounts, ensure value is between 0 and 100
		if (data.discount_type === DiscountTypeEnum.PERCENTAGE_OFF) {
			return data.discount_value <= 100;
		}
		return true;
	},
	{
		message: "Percentage discount must be between 0 and 100",
		path: ["discount_value"],
	}
);

export type CreateCouponSchema = typeof createCouponSchema;