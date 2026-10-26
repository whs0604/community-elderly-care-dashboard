import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Vite 配置：@ 别名 + Vue 插件 + Github Pages部署base路径
export default defineConfig({
  base: '/community-elderly-care-dashboard/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    // 真实后端联调时，把 /api 代理到后端地址
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    // 把体积最大的 echarts 拆成独立 chunk，避免首屏单包过大
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-wordcloud'],
          vendor: ['vue', 'axios', 'dayjs']
        }
      }
    }
  }
})