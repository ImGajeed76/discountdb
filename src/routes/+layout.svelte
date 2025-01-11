<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	let { children } = $props();
</script>

<Toaster theme="dark"/>

<ModeWatcher />

<div
	class="absolute inset-0 w-full h-full"
	style="background-image: radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.1) 1px, transparent 0); background-size: 30px 30px;"
></div>

<div class="grid grid-rows-[auto_1fr] absolute top-0 left-0 w-screen h-screen">
	<div class="w-full h-20 p-2">
		<div class="w-full">
			<div class="h-20 w-full flex justify-between items-center p-5 max-w-6xl mx-auto">
				<div class="flex items-end">
					<h1 class="text-2xl font-semibold">DiscountDB</h1>
					<div class="pl-10">
						<a href="https://api.discountdb.ch/api/v1/docs">Docs</a>
					</div>
				</div>
				<div>
					<Button href="https://github.com/ImGajeed76/discountdb" target="_blank"
									class="fill-white bg-transparent border hover:bg-transparent size-10">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
							<path
								d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
						</svg>
					</Button>
				</div>
			</div>
		</div>
	</div>
	<div class="p-5 h-full w-full overflow-auto">
		{@render children()}
	</div>
</div>