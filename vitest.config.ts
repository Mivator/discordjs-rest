import { defineProject, mergeConfig } from 'vitest/config';

import configShared from './basevitetest.config.js';

export default mergeConfig(configShared, {
	defineProject: defineProject({
		test: {
			setupFiles: ['./__tests__/setup.ts'],
		},
	}),
});
