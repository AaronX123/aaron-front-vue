import Layout from '@/layout'
import menu from '@/utils/menuComponentUtil'

export function getMenuTree(source) {
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
        tmp[item.parentId].children.push(tmp[item.id])
      } else {
        tmp[item.parentId] = { children: [tmp[item.id]] }
      }
    }
  }
  console.log(tmp['null'].children)
  return tmp['null'].children
}

export function getOptionPremission(source) {
  const tmp = []
  for (const n in source) {
    let item = null
    const path = getEndArray(source[n].url.split('/'))
    if (source[n].resourceType === 3 || source[n].resourceType === 2) {
      item = path
      tmp.push(item)
    }
  }
  return tmp
}

export function converter(source) {
  const tmp = []
  for (const n in source) {
    const item = {}
    const path = getEndArray(source[n].url.split('/'))
    if (source[n].resourceType === 0) {
      item.id = source[n].id
      item.parentId = source[n].parentId
      item.path = '/' + path
      item.component = Layout
      item.name = source[n].name
      item.meta = {
        title: source[n].name,
        icon: source[n].openImg
      }
      item.children = []
    } else if (source[n].resourceType === 1) {
      item.id = source[n].id
      item.parentId = source[n].parentId
      item.path = path
      item.component = menu[path]
      item.name = source[n].name
      item.meta = {
        title: source[n].name,
        icon: source[n].openImg
      }
      item.children = []
    } else if (source[n].resourceType === 2) {
      item.id = source[n].id
      item.parentId = source[n].parentId
      item.path = path
      item.component = menu[path]
      item.name = source[n].name
      item.hidden = true
      item.meta = {
        title: source[n].name,
        icon: source[n].openImg
      }
    }
    tmp.push(item)
  }
  return tmp
}

export function getEndArray(Array) {
  return Array[Array.length - 1]
}
