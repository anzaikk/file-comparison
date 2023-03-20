/*
 * @Author: anzaikk 599957546@qq.com
 * @Date: 2023-03-12 08:14:37
 * @LastEditors: anzaikk 599957546@qq.com
 * @LastEditTime: 2023-03-20 23:54:37
 * @FilePath: /vue_learn/vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
