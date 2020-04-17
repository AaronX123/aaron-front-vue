<template>
  <div class="block">
    <span class="demonstration" />
    <el-pagination
      background
      layout="prev, pager, next"
      :total="Total"
      :current-page="CurrentPage"
      :page-size="PageSize"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
export default {
  name: 'Tree',
  props: {
    total: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: false,
      default: 1
    },
    pageSize: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data() {
    return {
      Total: this.total,
      CurrentPage: this.currentPage,
      PageSize: this.pageSize
    }
  },
  watch: {
    total(val) {
      this.Total = val
    },
    currentPage(val) {
      this.CurrentPage = val
    },
    pageSize(val) {
      this.PageSize = val
    }
  },
  methods: {
    handleCurrentChange(currentPage) {
      this.$emit('handleCurrentChange', currentPage)
    }
  }
}

</script>
