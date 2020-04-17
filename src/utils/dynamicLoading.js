// parentOptions为原始树的数据，value为选择的树头，
// parentOption为新生成的树的数据
export function getDynamicOptions(value, parentOptions) {
  let n
  let parentOption
  for (n in parentOptions) {
    if (parentOptions[n].value === value) {
      parentOption = parentOptions[n].children
    }
  }
  return parentOption
}

export function getDynamicOption(value, parentOptions) {
  let n
  const parentOption = []
  for (n in parentOptions) {
    if (parentOptions[n].parentId === value) {
      parentOption.push(parentOptions[n])
    }
  }
  return parentOption
}
