<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container style="height: 800px">
      <!--el-aside为树的部分，不用可以删去-->
      <tree
        :tree-data="setTree"
        :tree-name="treeName"
        @NodeAdd="NodeAdd"
        @NodeUpdate="NodeUpdate"
        @NodeDel="NodeDel"
      />
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height:10%; width: 100%">
          <!-- 表头 -->
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="题目类别：">
                <el-input v-model="queryForm.name" size="mini" placeholder="请输入" style="width: 200px" />
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryCategory" type="primary" size="mini" label="查询" @click="getCategory" />
              </el-form-item>
            </el-form>
          </el-row>
          <!-- 按钮 -->
          <el-row style="display: inline">
            <perms-button perms="saveCategory" type="success" icon="el-icon-plus" label="增加" @click="saveCategory" />
            <perms-button perms="deleteCategory" type="danger" icon="el-icon-delete" label="删除" @click="delSelectCategory()" />
            <perms-button perms="updateCategory" type="warning" icon="el-icon-edit" label="修改" @click="updateSelectCategory()" />
            <perms-button perms="importCategory" type="primary" icon="el-icon-upload" label="导入" @click="handleImport" />
            <perms-button perms="exportCategory" type="primary" label="导出" icon="el-icon-download" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="categoryData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" label="题目类型" align="center" />
            <el-table-column prop="remark" label="备注" align="center" />
            <el-table-column prop="updatedTime" label="更新时间" align="center" />
            <el-table-column prop="status" label="启用标记" align="center" :formatter="statusFormatter" />
            <el-table-column label="操作" width="140px" align="center">
              <template slot-scope="scope">
                <perms-button perms="saveCategory" type="success" icon="el-icon-plus" circle @click="saveCategory()" />
                <perms-button perms="deleteCategory" type="danger" icon="el-icon-delete" circle @click="delCategory(scope.row)" />
                <perms-button perms="updateCategory" type="warning" icon="el-icon-edit" circle @click="updateCategory(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :total="total"
            :current-page="queryForm.currentPage"
            :page-size="queryForm.pageSize"
            @handleCurrentChange="handleCurrentChange"
          />
        </el-main>
      </el-main>
    </el-container>

    <el-dialog :visible.sync="saveDialogVisible" title="新增题目类别基本信息" center width="500px" :close-on-click-modal="false">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">题目类别基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="题目类别：" prop="name">
          <el-input v-model="saveForm.name" style="width: 300px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="父类别：" prop="categoryId">
          <el-cascader v-model="saveForm.parentId" :options="setQuery" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 130px" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="saveForm.remark" type="textarea" :rows="4" auto-complete="off" style="width: 300px" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveCategory" type="primary" label="确 定" @click="saveCategoryData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改题目类别基本信息" center width="500px" :close-on-click-modal="false">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">题目类别基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="题目类别：" prop="name">
          <el-input v-model="updateForm.name" style="width: 300px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="父类别：" prop="categoryId">
          <el-cascader v-model="updateForm.parentId" disabled placeholder="无" :options="setQuery" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 130px" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="updateForm.remark" type="textarea" :rows="4" auto-complete="off" style="width: 300px" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="deleteCategory" type="primary" label="确 定" @click="updateCategoryData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, query, getList, queryCategory } from '@/api/basedata/category'
import { getTreeList, getQueryList } from '@/utils/treeList'
import { getParentOptions } from '@/utils/getOptions.js'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Category',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      total: 1,
      parentOptions: [],
      treeData: [],
      setTree: [],
      treeName: '',
      setQuery: [],
      show: true,
      loading: true,
      // 多选框
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      // 页面数据
      categoryData: [],
      treeQueryForm: {
        name: ''
      },
      // 查询参数
      queryForm: {
        name: '',
        pageSize: 7,
        currentPage: 1
      },
      // 添加规则
      FormRules: {
        name: [{ required: true, message: '请输入题目类别', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      // 增加数据
      saveForm: {
        name: '',
        status: 1,
        remark: '',
        parentId: ''
      },
      // 更新数据
      updateForm: {
        name: '',
        status: '',
        remark: '',
        parentId: ''
      },
      // 删除数据
      deleteForm: [],
      // 各弹窗初始化
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false
    }
  },
  mounted() {
    this.getCategory()
  },
  methods: {
    getCategory() {
      query(this.queryForm).then(res => {
        this.categoryData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
      getList(this.treeQueryForm).then(res => {
        this.treeData = res
        this.setTree = getTreeList(this.treeData)
        this.treeName = '题目类别'
        this.setQuery = getQueryList(this.treeData)
        this.parentOptions = getParentOptions(this.treeData)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 显示增加题目类别页面
    saveCategory() {
      this.saveForm.name = ''
      this.saveForm.status = 1
      this.saveForm.remark = ''
      this.saveForm.parentId = ''
      this.saveDialogVisible = true
    },

    saveCategoryData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.saveForm.parentId != null && this.saveForm.parentId[this.saveForm.parentId.length - 1] * 1 >= 10) {
            this.saveForm.parentId = this.saveForm.parentId[this.saveForm.parentId.length - 1]
          }
          this.loading = true
          save(this.saveForm).then(res => {
            this.$nextTick(() => {
              this.$refs['saveForm'].resetFields()
            })
            this.saveDialogVisible = false
            this.queryForm.currentPage = 1
            this.getCategory()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    // 删除单条
    delCategory(row) {
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getCategory()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 删除多条
    delSelectCategory(row) {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行修改',
          type: 'faile'
        })
        return
      }
      this.deleteForm = this.multipleSelection
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getCategory()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 双击显示详情
    dblclick(row, column, event) {
      this.updateCategory(row)
    },
    updateCategory(row) {
      this.loading = true
      queryCategory(row).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res[0]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    updateSelectCategory(row) {
      if (this.multipleSelection.length > 1) {
        this.$message({
          message: '不可多条修改',
          type: 'faile'
        })
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行修改',
          type: 'faile'
        })
      } else {
        this.loading = true
        queryCategory(this.multipleSelection[0]).then(res => {
          this.updateDialogVisible = true
          this.updateForm = res[0]
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },
    updateCategoryData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = false
          update(this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.getCategory()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    NodeUpdate(treeData) {
      // 编辑节点
      this.loading = true
      queryCategory(treeData.DATA).then(res => {
        this.updateForm.parentId = treeData.DATA.parentId
        this.updateDialogVisible = true
        this.updateForm = res[0]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    NodeDel(treeData) {
      // 删除节点
      if (treeData.DATA.children && treeData.DATA.children.length !== 0) {
        this.$message.error('此节点有子级，不可删除！')
        return false
      } else {
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
          this.deleteForm[0] = treeData.DATA
          del(this.deleteForm).then(res => {
            this.getCategory()
          })
        })
      }
    },
    NodeAdd(treeData) {
      // 新增节点
      // 判断层级
      if (treeData.NODE.level >= 3) {
        this.$message.error('最多只支持三级！')
        return false
      } else {
        this.saveForm.parentId = treeData.DATA.id
        this.saveDialogVisible = true
      }
      if (!treeData.NODE.expanded) {
        treeData.NODE.expanded = true
      }
    },

    // 显示导入页面
    handleImport() {
      this.importFormVisible = true
    },
    // // 文件相关方法
    // handleRemove(file, fileList) {
    //   console.log(file, fileList)
    // },
    // handlePreview(file) {
    //   console.log(file)
    // },
    // handleExceed(files, fileList) {
    //   this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    // },
    // beforeRemove(file, fileList) {
    //   return this.$confirm(`确定移除 ${file.name}？`)
    // },

    // 多选方法
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.select_order_number = this.multipleSelection.length
      this.select_orderId = []
      if (rows) {
        rows.forEach(row => {
          if (row) {
            this.select_orderId.push(row.id)
          }
        })
      }
    },
    getRowKeys(row) {
      return row.id
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.categoryData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格的状态列转化成是否
    statusFormatter(row) {
      return row.status === 1 ? '是' : '否'
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 10px;
  }
}
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
