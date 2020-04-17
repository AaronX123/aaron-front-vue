<template>
  <el-button
    :size="size"
    :type="type"
    :circle="circle"
    :icon="icon"
    :disabled="!hasPerms(perms)"
    @click="handleClick"
  >
    <span v-if="label!=null">{{ label }}</span>
  </el-button>
</template>

<script>
import { hasPermission } from '@/utils/permission.js'
export default {
  name: 'PermsButton',
  props: {
    label: {// 按钮显示文本
      type: String,
      default: null
    },
    size: {// 按钮尺寸
      type: String,
      default: 'mini'
    },
    type: {// 按钮类型
      type: String,
      default: 'primary'
    },
    disabled: {// 按钮是否禁用
      type: Boolean,
      default: false
    },
    perms: {// 按钮权限标识，外部使用者传入
      type: String,
      default: null
    },
    circle: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    }
  },
  data() {
    return {
    }
  },
  methods: {
    handleClick() {
      // 按钮操作处理函数
      this.$emit('click', {})
    },
    hasPerms(perms) {
      // 根据权限标识和外部指示状态进行权限判断
      return hasPermission(perms) & !this.disabled
    }
  }
}
</script>

<style scoped>
</style>
