import { getDefaultFetch } from '../src/defaultFetch.js';

const fetchRuntime = getDefaultFetch();

async function bench(amount: number) {
	const totalStart = performance.now(); // Start total timer
	const requestCount = amount; // Limit to 1000 requests for reasonable benchmarking
	let totalResponseTime = 0; // Track total time for each request
	let totalDataTime = 0; // Track total time to get data
	for (let i = 0; i < requestCount; i++) {
		const requestStart = performance.now(); // Start timer for each request
		try {
			const res = await fetchRuntime('https://jsonplaceholder.org/comments/1');
			const responseTime = performance.now() - requestStart;
			totalResponseTime += responseTime;

			console.log(`Request ${i + 1} - Status: ${res.status}, Response Time: ${responseTime}ms`);

			const dataStart = performance.now();
			const data = await res.json();
			const dataTime = performance.now() - dataStart;
			totalDataTime += dataTime;

			console.log(`Data Time: ${dataTime}ms, Data:`, data);
		} catch (err) {
			console.error(`Request ${i + 1} failed:`, err);
		}
	}
	const totalEnd = performance.now();
	const totalTime = totalEnd - totalStart;
	const avgResponseTime = totalResponseTime / requestCount;
	const avgDataTime = totalDataTime / requestCount;
	console.log(`\nTotal Time: ${totalTime.toFixed(2)}ms`);
	console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
	console.log(`Average Data Time: ${avgDataTime.toFixed(2)}ms`);
}

bench(1000);

// # bun run bench/benchFetch.ts (1000 entries) - "bun's fetch"
// url: https://jsonplaceholder.typicode.com/todos/1
//  Total Time: 21420.93ms
//  Average Response Time: 21.04ms
//  Average Data Time: 0.02ms
// url: https://jsonplaceholder.org/comments/1
//  Total Time: 33154.08ms
//  Average Response Time: 32.61ms
//  Average Data Time: 0.03ms

// # deno run --allow-read=. --allow-net .\bench\benchFetch.ts (1000 entries) - "deno's fetch"
// url: https://jsonplaceholder.typicode.com/todos/1
//  Total Time: 23072.87ms
//  Average Response Time: 22.64ms
//  Average Data Time: 0.10ms
// url: https://jsonplaceholder.org/comments/1
//  Total Time: 33717.56ms
//  Average Response Time: 32.97ms
//  Average Data Time: 0.10ms

// # npx tsx ./bench/benchFetch.ts (1000 entries) - "axios" - axios auto-transforms the data, therefore avg. data time is 0.0015ms
// url: https://jsonplaceholder.typicode.com/todos/1
//  Total Time: 24904.56ms
//  Average Response Time: 24.59ms
//  Average Data Time: 0.00ms
// url: https://jsonplaceholder.org/comments/1
//  Total Time: 35734.94ms
//  Average Response Time: 35.20ms
//  Average Data Time: 0.00ms

// # npx tsx ./bench/benchFetch.ts (1000 entries) - "custom Fetch via node:https" - also tried a custom https request handler, which wasn't performant enough compared to axios
// url: https://jsonplaceholder.typicode.com/todos/1
//  Total Time: 58757.87ms
//  Average Response Time: 58.38ms
//  Average Data Time: 0.06ms
// url: https://jsonplaceholder.org/comments/1
//  Total Time: 86930.22ms
//  Average Response Time: 86.24ms
//  Average Data Time: 0.06ms
