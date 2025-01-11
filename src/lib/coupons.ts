const BASE_URL = "https://api.discountdb.ch/api/v1";

export type DiscountType = "PERCENTAGE_OFF" | "FIXED_AMOUNT" | "BOGO" | "FREE_SHIPPING";
export enum DiscountTypeEnum {
	PERCENTAGE_OFF = "PERCENTAGE_OFF",
	FIXED_AMOUNT = "FIXED_AMOUNT",
	BOGO = "BOGO",
	FREE_SHIPPING = "FREE_SHIPPING",
}

export interface CouponJSON {
	id: number;
	created_at: string;
	code: string;
	title: string;
	description: string;
	discount_value: number;
	discount_type: DiscountType;
	merchant_name: string;
	merchant_url: string;

	start_date?: string;
	end_date?: string;
	terms_conditions?: string;
	minimum_purchase_amount?: number;
	maximum_discount_amount?: number;

	up_votes: string[];
	down_votes: string[];

	categories?: string[];
	tags?: string[];
	regions?: string[];
	store_type?: "online" | "in_store" | "both";

	score: number;
}

export class Coupon {
	id: number;
	createdAt: Date;
	code: string;
	title: string;
	description: string;
	discountValue: number;
	discountType: DiscountType;
	merchantName: string;
	merchantUrl: string;

	startDate?: Date;
	endDate?: Date;
	termsConditions?: string;
	minimumPurchaseAmount?: number;
	maximumDiscountAmount?: number;

	upVotes: Date[];
	downVotes: Date[];

	categories?: string[];
	tags?: string[];
	regions?: string[];
	storeType?: "online" | "in_store" | "both";

	score: number;

	constructor(
		id: number,
		code: string,
		title: string,
		description: string,
		discountValue: number,
		discountType: DiscountType,
		merchantName: string,
		merchantUrl: string
	) {
		this.id = id;
		this.createdAt = new Date();
		this.code = code;
		this.title = title;
		this.description = description;
		this.discountValue = discountValue;
		this.discountType = discountType;
		this.merchantName = merchantName;
		this.merchantUrl = merchantUrl;
		this.upVotes = [];
		this.downVotes = [];
		this.score = 0;
	}

	static importFromJSON(json: CouponJSON): Coupon {
		const coupon = new Coupon(
			json.id,
			json.code,
			json.title,
			json.description,
			json.discount_value,
			json.discount_type,
			json.merchant_name,
			json.merchant_url
		);

		coupon.createdAt = new Date(json.created_at);
		coupon.startDate = json.start_date ? new Date(json.start_date) : undefined;
		coupon.endDate = json.end_date ? new Date(json.end_date) : undefined;
		coupon.termsConditions = json.terms_conditions;
		coupon.minimumPurchaseAmount = json.minimum_purchase_amount;
		coupon.maximumDiscountAmount = json.maximum_discount_amount;

		coupon.upVotes = json.up_votes.map((date) => new Date(date));
		coupon.downVotes = json.down_votes.map((date) => new Date(date));

		coupon.categories = json.categories;
		coupon.tags = json.tags;
		coupon.regions = json.regions;
		coupon.storeType = json.store_type;

		coupon.score = json.score;

		return coupon;
	}

	toJSON(): CouponJSON {
		return {
			id: this.id,
			created_at: this.createdAt.toISOString(),
			code: this.code,
			title: this.title,
			description: this.description,
			discount_value: this.discountValue,
			discount_type: this.discountType,
			merchant_name: this.merchantName,
			merchant_url: this.merchantUrl,

			start_date: this.startDate?.toISOString(),
			end_date: this.endDate?.toISOString(),
			terms_conditions: this.termsConditions,
			minimum_purchase_amount: this.minimumPurchaseAmount,
			maximum_discount_amount: this.maximumDiscountAmount,

			up_votes: this.upVotes.map((date) => date.toISOString()),
			down_votes: this.downVotes.map((date) => date.toISOString()),

			categories: this.categories,
			tags: this.tags,
			regions: this.regions,
			store_type: this.storeType,

			score: this.score
		};
	}
}

export interface CouponsSearchResponse {
	data: Coupon[];
	total: number;
	limit: number;
	offset: number;
}

export type SortOptions = "newest" | "oldest" | "high_score" | "low_score";

export const sortOptionNames: Record<SortOptions, string> = {
	newest: "Newest",
	oldest: "Oldest",
	high_score: "Highest Score",
	low_score: "Lowest Score",
};

export const sortOptions: SortOptions[] = Object.keys(sortOptionNames) as SortOptions[];

export async function fetchCoupons(
	search: string,
	sortBy: SortOptions,
	limit: number,
	offset: number
): Promise<CouponsSearchResponse> {
	const encodedSearch = encodeURIComponent(search);

	const res = await fetch(
		`${BASE_URL}/coupons/search?q=${encodedSearch}&sort_by=${sortBy}&limit=${limit}&offset=${offset}`
	);

	if (!res.ok) {
		throw new Error(`Failed to fetch coupons: ${res.statusText}`);
	}

	const response = await res.json();

	if (!Array.isArray(response.data)) {
		response.data = [];
	}

	return {
		data: response.data.map(Coupon.importFromJSON),
		total: response.total,
		limit: response.limit,
		offset: response.offset
	};
}

export async function upVoteCoupon(couponId: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/coupons/vote/up/${couponId}`, {
		method: "POST",
	});

	if (!res.ok) {
		throw new Error(`Failed to upvote coupon: ${res.statusText}`);
	}
}

export async function downVoteCoupon(couponId: number): Promise<void> {
	const res = await fetch(`${BASE_URL}/coupons/vote/down/${couponId}`, {
		method: "POST",
	});

	if (!res.ok) {
		throw new Error(`Failed to downvote coupon: ${res.statusText}`);
	}
}

export type Merchant = {
	merchant_name: string;
	merchant_url: string[];
}

export type MerchantList = {
	data: Merchant[];
	total: number;
};

export async function getMerchants(): Promise<MerchantList> {
	const res = await fetch(`${BASE_URL}/coupons/merchants`);

	if (!res.ok) {
		throw new Error(`Failed to fetch merchants: ${res.statusText}`);
	}

	const response = await res.json();

	if (!Array.isArray(response.data)) {
		response.data = [];
	}

	return {
		data: response.data,
		total: response.total
	};
}

export type CategoriesResponse = {
	data: string[];
	total: number;
}

export async function getCategories(): Promise<CategoriesResponse> {
	const res = await fetch(`${BASE_URL}/coupons/categories`);

	if (!res.ok) {
		throw new Error(`Failed to fetch categories: ${res.statusText}`);
	}

	const response = await res.json();

	if (!Array.isArray(response.data)) {
		response.data = [];
	}

	return {
		data: response.data,
		total: response.total
	};
}

export type TagsResponse = {
	tags: string[];
	total: number;
}

export async function getTags(): Promise<TagsResponse> {
	const res = await fetch(`${BASE_URL}/coupons/tags`);

	if (!res.ok) {
		throw new Error(`Failed to fetch tags: ${res.statusText}`);
	}

	const response = await res.json();

	if (!Array.isArray(response.tags)) {
		response.tags = [];
	}

	return {
		tags: response.tags,
		total: response.total
	};
}

export type RegionsResponse = {
	regions: string[];
	total: number;
}

export async function getRegions(): Promise<RegionsResponse> {
	const res = await fetch(`${BASE_URL}/coupons/regions`);

	if (!res.ok) {
		throw new Error(`Failed to fetch regions: ${res.statusText}`);
	}

	const response = await res.json();

	if (!Array.isArray(response.regions)) {
		response.regions = [];
	}

	return {
		regions: response.regions,
		total: response.total
	};
}

export interface CouponSuggestion {
	code: string;
	title: string;
	description: string;
	discount_value: number;
	discount_type: DiscountType;
	merchant_name: string;
	merchant_url: string;

	start_date?: string;
	end_date?: string;
	terms_conditions?: string;
	minimum_purchase_amount?: number;
	maximum_discount_amount?: number;

	categories?: string[];
	tags?: string[];
	regions?: string[];
	store_type?: string;
}

export type SuggestionResponse = {
	id: number;
	score: number;
	created_at: string;
}

export async function suggestCoupon(coupon: CouponSuggestion): Promise<SuggestionResponse> {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	Object.keys(coupon).forEach((key) => coupon[key] === undefined && delete coupon[key]);

	console.log(JSON.stringify(coupon));

	const res = await fetch(`${BASE_URL}/coupons`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(coupon)
	});

	if (!res.ok) {
		throw new Error(`Failed to suggest coupon: ${res.statusText}`);
	}

	return res.json();
}