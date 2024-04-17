window.addEventListener('message', function (e) {
  var iframe = document.getElementById("ts-contentscript-iframe");
  console.log("got message with styles", e.data['width'], e.data['height'])
  iframe.style.width = e.data['width']
  iframe.style.height = e.data['height']
  iframe.style.right = e.data['right']
  iframe.style.top = e.data['top']
}, false);
