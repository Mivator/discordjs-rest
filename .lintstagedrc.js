/** @type {import('lint-staged').Config} */
module.exports = {
	...require('./.baselintstagedrc.json'),
	'src/**.ts': 'vitest related --run --config ./vitest.config.ts',
};
