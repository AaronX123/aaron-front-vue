<template>
  <div class="loading">
    <img src="@/assets/loading.gif" width="24" height="24">
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '正在载入'
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  top: 88px;
  bottom: 0;
  opacity: 0.3;
  right: 0;
  left: 0;
  z-index: 1000;
}
img { width: 50px; height: 50px}

</style>
