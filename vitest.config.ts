import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: 'test/vitest/setup-file.ts',
    testTimeout: 50000,
    hookTimeout: 50000,
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
      // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}',
    ],
    coverage: {
      reporter: ['text', 'lcov', 'json-summary', 'json'],
    },
    // https://vitest.dev/guide/browser.html
    browser: {
      enabled: false,
      name: 'chrome', // browser name is required
    }
  },
  resolve: {
    conditions: process.env.VITEST ? ['node'] : []
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls
      },
    }),
    quasar({
      sassVariables: 'src/quasar-variables.scss',
    }),
    tsconfigPaths(),
  ],
});
