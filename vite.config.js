import vue from '@vitejs/plugin-vue'

export default {
  publicDir: 'public-assets',
  build: {
    outDir: 'public',
  },
  plugins: [vue()]
}
