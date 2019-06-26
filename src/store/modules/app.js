import request from '@/utils/request'
import { setCookie, getCookie, removeCookie } from '@/utils/cookie'
import { channel } from './channel.js'
const n = {
  path: '*',
  component: resolve => require(['@/views/layout/Layout.vue'], resolve),
  children: [
    {
      path: '',
      component: resolve => require(['@/views/404/404.vue'], resolve),
      meta: {
        title: '专家管理',
        id: ''
      }
    }
  ]
}
const app = {
  state: {
    user_id: getCookie('user_info') ? JSON.parse(getCookie('user_info')).id : '',
    user_info: getCookie('user_info') ? JSON.parse(getCookie('user_info')) : {},
    nav_list: window.localStorage.getItem('menu') ? JSON.parse(window.localStorage.getItem('menu')) : [],
    channel: '',
    session: '',
    xinlingName: '',
    channelName: '',
    sceneRegister: '',
    exportAddServeCallBackFun: null,
    exportLeaveServeCallBackFun: null,
    singout: null
  },
  mutations: {
    GET_USER_INFO: (state, data) => {
      state.user_info = data.user_info
      state.user_id = data.user_info.id
      setCookie('user_info', JSON.stringify(data.user_info), 1)
    },
    SET_MENU: (state, data) => {
      const { menu } = data
      const navList = []
      menu.forEach(item => {
        const navItem = {}
        navItem.title = item.name
        navItem.icon = item.current.icon
        if (item.children instanceof Array && item.children.length > 0) {
          const arr = []
          item.children.forEach(ele => {
            arr.push({
              title: ele.name,
              id: ele.current.id.toString(),
              path: `/${item.value}/${ele.value}`
            })
          })
          navItem.children = arr
        }
        navList.push(navItem)
      })
      navList.unshift({
        title: '首页',
        path: '/index',
        icon: 'icon-shouye',
        id: '-1'
      })
      window.localStorage.setItem('menu', JSON.stringify(navList))
    },
    SET_ROUTER: (state, menu) => {
      window.localStorage.setItem('routerList', JSON.stringify(menu))
      menu.forEach(item => {
        const routeItem = {
          path: `/${item.value}`,
          component: resolve => require(['@/views/layout/Layout.vue'], resolve),
          children: []
        }

        if (item.children instanceof Array && item.children.length > 0) {
          routeItem.children = item.children.map(ele => {
            return {
              path: ele.value,
              component: resolve => require([`@/views/${item.value}/${ele.value}.vue`], resolve)
            }
          })
        }
        window.vm.$router.options.routes.push(routeItem)
      })
      window.vm.$router.options.routes.push(n)
      window.vm.$router.addRoutes(window.vm.$router.options.routes)
    },
    SET_SIGVAL: (state) => {

    },
    SET_CHANNEL: (state, data) => {
      state.channel = data
      console.log(data, '--------------')
    },
    SET_SESSION: (state, data) => {
      state.session = data
      window.sessionStorage.setItem('session', JSON.stringify(data))
      console.log(data)
    },
    SET_SINLING_NAME: (state, data) => {
      state.xinlingName = data
    },
    SET_CHANNEL_NAME: (state, data) => {
      state.channelName = data
    }
  },
  actions: {
    get_user_info: ({ dispatch, commit }, data) => {
      new Promise((resolve, reject) => {
        request
          .post(`${window.vm.api}/user/login`, data)
          .then(res => {
            const { data } = res.data
            commit('GET_USER_INFO', data)
            commit('SET_MENU', data)
            commit('SET_ROUTER', data.menu)
            resolve()
          })
      }).then(() => {
        dispatch('set_sigval')
        setTimeout(() => {
          window.vm.$router.push('index')
        })
      })
    },
    set_sigval: ({ state, dispatch, commit }) => {
      const appId = '10007fd8f0184459a83d7400af8f69f5'
      const token = '_no_need_token'
      // eslint-disable-next-line no-undef
      const signal = Signal(appId)
      commit('SET_SINLING_NAME', '1')
      var session = signal.login(JSON.parse(getCookie('user_info')).id.toString(), token, 10, 30)
      session.onLoginSuccess = function () {
        console.log('login')
        commit('SET_SESSION', session)
        state.sceneRegister && state.sceneRegister(session)
      }
      session.onLogout = function (reson) {
        console.log(reson, '退出  登出')
        if (reson === 103) {
          window.vm.$alert('这个账号已经在其他地方登陆了!', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          removeCookie('user_info')
          window.vm.$router.push('/login')
          session.logout()
        }
      }
      session.onInviteReceived = function (call) {
        // 加入频道，设置加入频道成功和失败回调
        // 加入信令频道
        window.vm.$router.push({
          path: '/Index'

        })
        console.log(call.channelName, call)
        const { problemFeedbackId, problemFeedbackTaskId, problemFeedbackTaskCode } = JSON.parse(call.extra)
        window.vm.$confirm('是否接受远程指导?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          window.sessionStorage.setItem('problemFeedbackId', problemFeedbackId)
          window.sessionStorage.setItem('problemFeedbackTaskId', problemFeedbackTaskId)
          window.sessionStorage.setItem('problemFeedbackTaskCode', problemFeedbackTaskCode)
          call.channelInviteAccept()
          channel(session, call, commit, state, problemFeedbackId)
          window.vm.$router.push({
            path: '/SceneGuidance',
            query: {
              name: call.channelName,
              peerId: call.peer,
              taskCode: '',
              taskId: ''
            }
          })
          window.vm.$notify({
            title: '',
            message: '加入远程指导',
            type: 'success'
          })
        }).catch(() => {
          call.channelInviteRefuse()
          window.vm.$message({
            type: 'info',
            message: '已拒接'
          })
        })
      }
    }
  }
}

export default app
