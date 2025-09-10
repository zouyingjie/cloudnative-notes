import { defineClientConfig } from '@vuepress/client'
import Layout from './layouts/layout.vue'



export default defineClientConfig({
  enhance ({ app }) {
    // app.component('TOCWithWords', TOCWithWords) 
  },
  layouts: {
    Layout
  }
})
