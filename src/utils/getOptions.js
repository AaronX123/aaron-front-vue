export function getLevelOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    tmp[n] = []
    tmp[n].label = item.level
    tmp[n].value = item.level
  }
  return tmp
}
export function getRoleOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    tmp[n] = []
    tmp[n].label = item.roleName
    tmp[n].value = item.roleId
    tmp[n].parentId = item.companyId
  }
  return tmp
}

export function getComOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    tmp[n] = []
    tmp[n].label = item.companyName
    tmp[n].value = item.companyId
  }
  return tmp
}

export function getPositionOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    tmp[n] = []
    tmp[n].label = item.positionName
    tmp[n].value = item.positionId
    tmp[n].parentId = item.companyId
  }
  return tmp
}

export function getOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    tmp[n] = []
    tmp[n].label = item.name
    tmp[n].value = item.id
  }
  return tmp
}
export function getParentOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    if (item.parentId === null) {
      tmp[n] = []
      tmp[n].label = item.name
      tmp[n].value = item.id
    }
  }
  return tmp
}
export function getDeptOptions(source) {
  const tmp = {}
  let n
  for (n in source) {
    const item = source[n]
    if (item.parentId != null) {
      tmp[n] = []
      tmp[n].label = item.name
      tmp[n].value = item.id
      tmp[n].parentId = item.rootId
    }
  }
  return tmp
}

