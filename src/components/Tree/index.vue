<template>
  <el-aside width="180px">
    <h3 class="el-icon-folder" style="margin: 0px">
      {{ name }}
    </h3>
    <el-tree
      ref="tree"
      :data="setTree"
      :props="defaultProps"
      :show-checkbox="checkBox"
      node-key="id"
      style="margin-top:20px"
      accordion
      @node-contextmenu="rihgtClick"
    >
      <span slot-scope="{ node, data }" class="span-ellipsis">
        <span v-show="!node.isEdit">
          <span v-show="data.children && data.children.length >= 1">
            <span :title="node.label">{{ node.label }}</span>
          </span>
          <span v-show="!data.children || data.children.length == 0">
            <span :title="node.label"> {{ node.label }}</span>
          </span>
        </span>
      </span>
    </el-tree>
    <!--鼠标右键点击出现页面-->
    <div v-show="menuVisible">
      <el-menu
        id="rightClickMenu"
        class="el-menu-vertical"
        text-color="#000000"
        active-text-color="#000000"
        @select="handleRightSelect"
      >
        <el-menu-item index="1" :hidden="showQuery" class="menuItem">
          <span slot="title">查询</span>
        </el-menu-item>
        <el-menu-item index="2" :hidden="showSave" class="menuItem">
          <span slot="title">添加</span>
        </el-menu-item>
        <el-menu-item index="3" :hidden="showUpdate" class="menuItem">
          <span slot="title">修改</span>
        </el-menu-item>
        <el-menu-item index="4" :hidden="showDelete" class="menuItem">
          <span slot="title">删除</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-aside>
</template>
<script>
export default {
  name: 'Tree',
  props: {
    treeData: {
      type: Array,
      required: true
    },
    treeName: {
      type: String,
      required: true,
      default: '树'
    },
    isCheckBox: {
      type: Boolean,
      required: false,
      default: false
    },
    isHiddenQuery: {
      type: Boolean,
      required: false,
      default: true
    },
    isHiddenSave: {
      type: Boolean,
      required: false,
      default: false
    },
    isHiddenUpdate: {
      type: Boolean,
      required: false,
      default: false
    },
    isHiddenDelete: {
      type: Boolean,
      required: false,
      default: false
    },
    checkedData: {
      type: Array,
      required: false,
      default: null
    }
  },
  data() {
    return {
      setTree: this.treeData,
      checkBox: this.isCheckBox,
      showQuery: this.isHiddenQuery,
      showSave: this.isHiddenSave,
      showUpdate: this.isHiddenUpdate,
      showDelete: this.isHiddenDelete,
      setChecked: null,
      name: this.treeName,
      TREEDATA: {
        DATA: null,
        NODE: null
      },
      isLoadingTree: true, // 是否加载节点树
      objectID: null,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      menuVisible: this.menuVisible
    }
  },
  watch: {
    treeData(val) {
      this.setTree = val
    },
    treeName(val) {
      this.name = val
    },
    checkedData(val) {
      this.setChecked = val
      this.setCheckedNodes()
    },
    optionsData(val) {
      this.options = val
    }
  },
  methods: {
    handleRightSelect(key) {
      if (key === '1') {
        this.$emit('NodeQuery', this.TREEDATA)
        this.menuVisible = false
      } else if (key === '2') {
        this.$emit('NodeAdd', this.TREEDATA)
        this.menuVisible = false
      } else if (key === '3') {
        this.$emit('NodeUpdate', this.TREEDATA)
        this.menuVisible = false
      } else if (key === '4') {
        this.$emit('NodeDel', this.TREEDATA)
        this.menuVisible = false
      }
    },
    getCheckedNodes() {
      this.$refs.tree.getCheckedNodes()
    },
    setCheckedNodes() {
      this.$refs.tree.setCheckedNodes(this.setChecked)
    },
    resetChecked() {
      this.$refs.tree.setCheckedKeys([])
    },
    rihgtClick(event, object, value, element) {
      if (this.objectID !== object.id) {
        this.objectID = object.id
        this.menuVisible = true
        this.TREEDATA.DATA = object
        this.TREEDATA.NODE = value
      } else {
        this.menuVisible = !this.menuVisible
      }
      document.addEventListener('click', e => {
        this.menuVisible = false
      })
      const menu = document.querySelector('#rightClickMenu')
      /* 菜单定位基于鼠标点击位置 */
      menu.style.left = event.clientX - 180 + 'px'
      menu.style.top = event.clientY - 100 + 'px'
      menu.style.position = 'absolute' //  为新创建的DIV指定绝对定位
      menu.style.width = 120 + 'px'
    }
  }
}

</script>

<style lang="scss" scoped>
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  margin-left: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
