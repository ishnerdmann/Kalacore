import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        commission: resolve(__dirname, 'commission.html'),
      },
    },
  },
});
