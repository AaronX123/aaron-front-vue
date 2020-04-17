import store from '@/store'
import router from '@/router'

/**
 * 关闭主内容区域中的当前页面
 * 使用代码如下：
 *  closeCurrentPage(this.$route)
 * @param view
 */
export function closePage(view) {
  store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
    const latestView = visitedViews.slice(-1)[0]
    if (latestView) {
      router.push(latestView)
    } else {
      router.push('/')
    }
  })
}

