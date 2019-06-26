export const formart = (t, type) => {
  const time = new Date(t)
  if (type === 'hh:mm') {
    return `${time.getHours() < 10 ? ('0' + time.getHours()) : time.getHours()}:${time.getMinutes() < 10 ? ('0' + time.getMinutes()) : time.getMinutes()}`
  }
}

export const formartTime = (time, fmt) => {
  var o = {
    'M+': time.getMonth() + 1,
    'h+': time.getHours(),
    'd+': time.getDate(),
    'm+': time.getMinutes(),
    's+': time.getSeconds(),
    'q+': Math.floor((time.getMonth() + 3) / 3),
    'S': time.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
