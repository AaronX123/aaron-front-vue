<template>
  <div class="sidebar-avator-container" :class="{'collapse':collapse}">
    <div class="profilePicture">
      <div class="profilePicture-wrapper">
        <img :src="profilePicture" class="user-profilePicture">
      </div>
      <div class="user-info">
        <span class="name">{{ name }}</span>
        <div class="status"><div class="dot" /><span class="value">在线</span></div>
      </div>
    </div>
    <div class="search">
      <el-input v-model="keyword" size="small" placeholder="搜索">
        <i slot="suffix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'UserInfo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      keyword: '',
      name: this.$store.state.user.name
    }
  },
  computed: {
    ...mapGetters([
      'profilePicture'
    ])
  }
}
</script>

<style lang="scss" scoped>

</style>
