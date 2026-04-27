import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useAppStore } from '@/store/app'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

const appStore = useAppStore(pinia)

appStore.initAuth().finally(() => {
  app.mount('#app')
})
