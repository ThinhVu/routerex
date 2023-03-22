const express = require("express")
const methods = require("methods")

module.exports = function(options) {
  const router = express.Router(options)
  return new Proxy(router, {
    get(target, p) {
      if (methods.includes(p)) {
        return function(method, metadata, ...args) {
          if (metadata && typeof metadata == 'object') {
            target[p](method, ...args)
            if (router.stack.length) {
              const layer = router.stack[router.stack.length - 1]
              layer.route.metadata = metadata
            }
          } else {
            target[p](method, metadata, ...args)
          }
        }
      } else {
        return Reflect.get(...arguments)
      }
    }
  })
}
