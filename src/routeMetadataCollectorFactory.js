const path = require('path');

module.exports = function({onMetadataGathered}) {
  const metadatas = []

  function gatherMetadata(parentPath, router) {
    for (const stack of router.stack) {
      if (stack.route) {
        metadatas.push({
          path: path.join(parentPath, stack.route.path),
          methods: stack.route.methods,
          metadata: stack.route.metadata,
        })
      } else {
        let currentPath = stack.regexp.toString()
        currentPath = currentPath.substr(3, currentPath.length - 16)
        gatherMetadata(path.join(parentPath, currentPath), stack.handle)
      }
    }
  }

  return function (path, ...rest) {
    const router = rest.pop()
    gatherMetadata(path, router)
    onMetadataGathered(metadatas)
    return [path, ...rest, router]
  }
}
