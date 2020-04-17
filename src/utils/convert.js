/**
 * @param {Array} array 数组
 * @param {Long} id
 * id转换成 name
 */
export function idToName(array, id) {
  let n
  for (n in array) {
    const item = array[n]
    if (item.children) {
      const name = idToName(item.children, id)
      if (name) {
        return name
      }
    }
    if (item.value === id) {
      return item.label
    }
  }
  return null
}

