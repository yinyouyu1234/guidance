import request from '@/utils/request'

export const channel = (session, call, commit, state, problemFeedbackId) => {
  let channel = session.channelJoin(call.channelName)
  commit('SET_CHANNEL', channel)

  call.onInviteAcceptedByPeer = function () {
    console.log('专家已经加入房间')
  }
  call.onInviteFailed = function () {
    console.log('邀请失败')
    window.vm.$notify({
      title: '',
      message: '邀请失败',
      type: 'success'
    })
  }
  call.onInviteReceivedByPeer = function () {
    console.log(1111111)
  }
  call.onInviteRefusedByPeer = function () {
    console.log('专家已拒绝')
  }

  channel.onMessageChannelReceive = function (account, uid, msg) {
    // 接收频道消息回调设置
    console.log(account, uid, msg)
    window.vm.$EventBus.$emit('onMessageChannelReceive', account, uid, msg)
    window.vm.$notify({
      title: '消息',
      message: JSON.parse(msg).content,
      type: 'success'
    })
  }
  // 当加入频道成功后，本人会收到此回调。
  channel.onChannelUserList = function (users) {
    console.log(users)
  }
  // 当有其他用户离开频道触发该回调。
  channel.onChannelUserLeaved = function (account, uid) {
    console.log('有人离开了', account, uid)
    state.exportLeaveServeCallBackFun && state.exportLeaveServeCallBackFun(account, uid)
  }
  // 当有其他用户加入频道触发该回调
  channel.onChannelUserJoined = function (account, uid) {
    console.log('有人加入了', 1111111111111111111, account, uid)
    state.exportAddServeCallBackFun && state.exportAddServeCallBackFun(account, uid)
    if (window.sessionStorage.getItem('exportId')) {
      request
        .post(`${window.vm.api}/onSiteService/addExpert`, {
          expertUserId: window.sessionStorage.getItem('exportId'),
          roomId: call.channelName,
          serviceId: problemFeedbackId
        })
        .then(res => {
          if (res.data.retCode === 10000) {
            console.log('邀请成功1111111111111111111111')
          }
        })
    }
  }
}
