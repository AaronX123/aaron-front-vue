<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container style="height: 800px">
      <el-header style="height:10%; width: 100%">
        <!-- 表头 -->
        <el-row>
          <el-form :inline="true" style="float: left">
            <el-form-item label="题目类型：">
              <el-input v-model="queryForm.name" size="mini" style="width: 130px" placeholder="请输入" />
            </el-form-item>
            <el-form-item>
              <perms-button perms="querySubjectType" type="primary" label="查询" @click="getSubjectTypeList" />
            </el-form-item>
          </el-form>
        </el-row>
        <!-- 按钮 -->
        <el-row style="display: inline">
          <perms-button perms="saveSubjectType" type="success" label="增加" icon="el-icon-plus" @click="addSubjectType" />
          <perms-button perms="deleteSubjectType" type="danger" label="删除" icon="el-icon-delete" @click="delSelectSubjectType()" />
          <perms-button perms="updateSubjectType" type="warning" label="修改" icon="el-icon-edit" @click="updateSelectSubjectType()" />
          <perms-button perms="importSubjectType" type="primary" icon="el-icon-upload" label="导入" @click="handleImport" />
          <perms-button perms="exportSubjectType" type="primary" icon="el-icon-download" label="导出" />
        </el-row>
      </el-header>
      <el-main v-if="show">
        <el-table
          :data="subjectTypeDataList"
          border
          stripe
          style="width: 100%"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          @row-dblclick="dblclick"
        >
          <el-table-column type="selection" :reserve-selection="true" width="40" />
          <el-table-column prop="name" label="题目类型名" />
          <el-table-column prop="attribute" label="属性列" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="updatedTime" label="更新时间" />
          <el-table-column prop="status" label="启用标记" :formatter="statusFormatter" />
          <!-- 操作按钮 -->
          <el-table-column fixed="right" label="操作" width="150%">
            <template slot-scope="scope">
              <perms-button perms="saveSubjectType" type="success" icon="el-icon-plus" circle @click="addSubjectType" />
              <perms-button perms="deleteSubjectType" type="danger" icon="el-icon-delete" circle @click="delSubjectType(scope.row)" />
              <perms-button perms="updateSubjectType" type="warning" icon="el-icon-edit" circle @click="updateSubjectType(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <pagination
          :total="total"
          :current-page="queryForm.currentPage"
          :page-size="queryForm.pageSize"
          @handleCurrentChange="handleCurrentChange"
        />
      </el-main>
    </el-container>
    <!-- 增加窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form ref="addForm" :model="addForm" label-width="100px" :rules="FormRules">
        <el-form-item label="题目类型名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="属性列" prop="attribute">
          <el-input v-model="addForm.attribute" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="addForm.remark" type="textarea" :rows="4" auto-complete="off" style="width: 300px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <perms-button perms="saveSubjectType" type="primary" label="提交" @click="addSubmit(addForm)" />
        <el-button @click="addFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- 修改窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="updateDialogVisible" :close-on-click-modal="false">
      <el-form ref="updateForm" :model="updateForm" label-width="100px" :rules="FormRules">
        <el-form-item label="题目类型" prop="name">
          <el-input v-model="updateForm.name" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="属性列" prop="attribute">
          <el-input v-model="updateForm.attribute" auto-complete="off" style="width: 300px" />
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
      <div slot="footer" class="dialog-footer">
        <perms-button perms="updateSubjectType" type="primary" label="提交" @click="updateSubjectTypeData(updateForm)" />
        <el-button @click="updateDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!--导入窗口-->
    <el-dialog title="导入窗口" width="400px" :visible.sync="importFormVisible" :close-on-click-modal="false">
      <el-form ref="importForm" :inline="true" :model="importForm" label-width="80px">
        <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          multiple
          :limit="3"
          :on-exceed="handleExceed"
          :file-list="fileList"
        >
          <div style="align:center"><el-button size="small" type="primary" center>点击上传</el-button></div>
          <div slot="tip" class="el-upload__tip">只能上传 xlsx / xls 文件，且不超过1M</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importSubmit">提交</el-button>
        <el-button @click="importFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { del, update, save, query, querySubjectType } from '@/api/basedata/subjectType'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'SubjectType',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      total: 1,
      importForm: '',
      // 导入窗口显示
      importFormVisible: false,
      // 文件上传List
      fileList: [],
      //  搜索区域参数
      queryForm: {
        name: '',
        pageSize: 7,
        currentPage: 1
      },
      subjectTypeDataList: [],
      loading: true,
      show: true,
      //  新增界面是否显示
      addFormVisible: false,
      //  新增界面数据
      addForm: {
        name: '',
        attribute: '',
        status: 1,
        remark: ''
      },
      //  批量选中data
      multipleSelection: [],
      select_order_number: '', // 表格select选中的条数
      select_orderId: [], // 表格select复选框选中的id
      FormRules: {
        name: [{ required: true, message: '请输入题目类型', trigger: 'blur' }],
        attribute: [{ required: true, message: '请输入属性列', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      //  编辑界面是否显示
      updateDialogVisible: false,
      //  编辑按钮Loading加载
      editLoading: false,
      //  编辑界面row
      editRow: '',
      //  编辑界面数据
      updateForm: {
        id: '',
        name: '',
        attribute: '',
        status: '',
        remark: ''
      },
      deleteForm: []
    }
  },
  mounted() {
    //  初始加载
    this.getSubjectTypeList()
  },
  methods: {
    // 获取题目类型列表
    getSubjectTypeList() {
      query(this.queryForm).then(res => {
        this.subjectTypeDataList = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    //  显示新增界面
    addSubjectType() {
      this.addFormVisible = true
    },
    //  新增
    addSubmit(addForm) {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          save(addForm).then(res => {
            this.$nextTick(() => {
              this.$refs['addForm'].resetFields()
            })
            this.addFormVisible = false
            this.queryForm.currentPage = 1
            this.getSubjectTypeList()
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
    delSubjectType(row) {
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getSubjectTypeList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 删除多条
    delSelectSubjectType(row) {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '至少选择一条数据删除！',
          type: 'warning'
        })
        return false
      }
      this.deleteForm = this.multipleSelection
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getSubjectTypeList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 双击显示详情
    dblclick(row, column, event) {
      this.updateSubjectType(row)
    },
    // 更新当前行
    updateSubjectType(row) {
      console.log(111)
      this.loading = true
      querySubjectType(row).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res[0]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 更新多条
    updateSelectSubjectType(row) {
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
        querySubjectType(this.multipleSelection[0]).then(res => {
          this.updateDialogVisible = true
          this.updateForm = res[0]
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },

    updateSubjectTypeData(updateForm) {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          update(updateForm).then(res => {
            this.updateDialogVisible = false
            this.getSubjectTypeList()
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
    // 显示导入页面
    handleImport: function() {
      this.importFormVisible = true
    },
    // 文件相关方法
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.subjectTypeDataList = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格的状态列转化成是否
    statusFormatter: function(row) {
      return row.status === 1 ? '是' : '否'
    },
    importSubmit() {}
  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;
    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>
