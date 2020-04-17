export function getIp() {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script')
    script.src = 'http://pv.sohu.com/cityjson?ie=utf-8'
    script.onload = function() {
      resolve(window.returnCitySN)
    }
    document.body.appendChild(script)
  })
}
