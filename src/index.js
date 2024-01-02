const express = require("express")
const methods = require("methods")

module.exports = function(options) {
  const router = express.Router(options)
  return new Proxy(router, {
    get(target, p) {
      if (methods.includes(p)) {
        return function(pattern, metadata, ...args) {
          if (metadata && typeof metadata == 'object') {
            if (options && options.yup) {
              async function validateInputMiddleware(req, res, next) {
                try {
                  await metadata.schema.validate({
                    body: req.body,
                    query: req.query,
                    params: req.params
                  }, { abortEarly: false })
                  next()
                } catch (err) {
                  next(err)
                }
              }
              target[p](pattern, validateInputMiddleware, ...args)
            } else {
              target[p](pattern, ...args)
            }
            const layer = router.stack[router.stack.length - 1]
            layer.route.metadata = metadata || {}
          } else {
            target[p](pattern, metadata, ...args)
            const layer = router.stack[router.stack.length - 1]
            layer.route.metadata = {}
          }
        }
      } else {
        return Reflect.get(...arguments)
      }
    }
  })
}
