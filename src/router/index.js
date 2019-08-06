import Vue from 'vue'
import Router from 'vue-router'
import pcdviewer from '@/components/pcdviewer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'pcdviewer',
      component: pcdviewer
    }
  ]
})
