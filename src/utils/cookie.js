export const setCookie = (name, value, iDay) => {
  var oDate = new Date()
  oDate.setDate(oDate.getDate() + iDay)
  document.cookie = name + '=' + value + ';expires=' + oDate
}
export const getCookie = (name) => {
  var arr = document.cookie.split('; ')
  for (var i = 0; i < arr.length; i++) {
    var arr2 = arr[i].split('=')
    if (arr2[0] === name) {
      return arr2[1]
    }
  }
}
export const removeCookie = (name) => {
  setCookie(name, 1, -1)
}
