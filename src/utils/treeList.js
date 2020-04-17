export function getTreeList(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    if (!tmp[item.id]) {
      tmp[item.id] = {}
    }
    tmp[item.id] = item
    if (!('children' in tmp[item.id])) {
      tmp[item.id].children = []
    }
    if (item.id !== item.parentId) {
      if (tmp[item.parentId]) {
        tmp[item.id].parentName = tmp[item.parentId].name
        tmp[item.parentId].children.push(tmp[item.id])
      } else {
        tmp[item.parentId] = { children: [tmp[item.id]] }
      }
    }
  }
  return tmp['null'].children
}

export function getQueryList(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    if (!tmp[item.id]) {
      tmp[item.id] = {}
    }
    tmp[item.id].label = item.name
    tmp[item.id].value = item.id
    // item.parentId = convert(item.parentId)
    tmp[item.id].parentId = item.parentId
    if (!('children' in tmp[item.id]))tmp[item.id].children = []
    if (item.id !== item.parentId) {
      if (tmp[item.parentId]) {
        tmp[item.parentId].children.push(tmp[item.id])
      } else {
        tmp[item.parentId] = { children: [tmp[item.id]] }
      }
    }
  }
  getSelectedNode(tmp, null)
  return tmp['null'].children
}

export function getSelectedNode(source, parent) {
  let n
  for (n in source) {
    const item = source[n]
    if ('children' in item && item.children.length === 0) {
      delete item.children
    } else if ('children' in item && item.children.length) {
      getSelectedNode(item.children, item)
    }
  }
}

