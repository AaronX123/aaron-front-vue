<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <el-header style="height:10%; width: 100%">
        <!-- 表头 -->
        <el-row>
          <el-form :inline="true" style="float: left">
            <el-form-item label="字典名称：">
              <el-input v-model="queryForm.name" size="mini" placeholder="请输入" style="width: 200px" />
            </el-form-item>
            <el-form-item label="字典类型：">
              <el-input v-model="queryForm.category" size="mini" placeholder="请输入" style="width: 200px" />
            </el-form-item>
            <el-form-item>
              <perms-button perms="queryDictionary" type="primary" label="查询" @click="getDictionaryList" />
            </el-form-item>
          </el-form>
        </el-row>
        <!-- 按钮 -->
        <el-row style="display: inline">
          <perms-button perms="saveDictionary" type="success" icon="el-icon-plus" label="增加" @click="addDictionary" />
          <perms-button perms="deleteDictionary" type="danger" icon="el-icon-delete" label="删除" @click="delSelectDictionary()" />
          <perms-button perms="updateDictionary" type="warning" icon="el-icon-edit" label="修改" @click="updateSelectDictionary()" />
          <perms-button perms="importDictionary" type="primary" icon="el-icon-upload" label="导入" @click="handleImport" />
          <perms-button perms="exportDictionary" type="primary" icon="el-icon-download" label="导出" @click="exportDictionary()" />
        </el-row>
      </el-header>
      <!-- 表格 -->
      <el-main v-if="show">
        <el-table
          :data="dictionaryDataList"
          border
          stripe
          style="width: 100%"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          @row-dblclick="dblclick"
        >
          <el-table-column type="selection" :reserve-selection="true" width="40" />
          <el-table-column prop="name" label="字典名" />
          <el-table-column prop="category" label="字典类型" />
          <el-table-column prop="value" label="字典值" />
          <el-table-column prop="updatedTime" label="更新时间" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="status" label="启用标记" :formatter="statusFormatter" />
          <!-- 操作按钮 -->
          <el-table-column fixed="right" label="操作" width="150%">
            <template slot-scope="scope">
              <perms-button perms="saveDictionary" type="success" icon="el-icon-plus" circle @click="addDictionary" />
              <perms-button perms="deleteDictionary" type="danger" icon="el-icon-delete" circle @click="delDictionary(scope.row)" />
              <perms-button perms="updateDictionary" type="warning" icon="el-icon-edit" circle @click="updateDictionary(scope.row)" />
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
      <!-- 导出专用table -->
      <el-main v-show="false">
        <el-table id="table" :data="allDictionaryDataList" style="width: 100%">
          <el-table-column v-model="editRow" type="selection" width="40%" />
          <el-table-column prop="name" label="字典名" />
          <el-table-column prop="category" label="字典类型" />
          <el-table-column prop="value" label="字典值" />
          <el-table-column prop="updatedTime" label="更新时间" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="status" label="启用标记" :formatter="statusFormatter" />
        </el-table>
      </el-main>
    </el-container>
    <!-- 增加窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form ref="addForm" :model="addForm" label-width="100px" :rules="FormRules">
        <el-form-item label="字典名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="字典类型" prop="category">
          <el-input v-model="addForm.category" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="addForm.value" auto-complete="off" style="width: 300px" />
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
        <perms-button perms="saveDictionary" type="primary" label="提交" @click="addSubmit(addForm)" />
        <el-button size="mini" @click="addFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- 修改窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="updateDialogVisible" :close-on-click-modal="false">
      <el-form ref="updateForm" :model="updateForm" label-width="100px" :rules="FormRules">
        <el-form-item label="字典名" prop="name">
          <el-input v-model="updateForm.name" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="字典类型" prop="category">
          <el-input v-model="updateForm.category" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="updateForm.value" auto-complete="off" style="width: 300px" />
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
        <perms-button perms="updateDictionary" type="primary" label="提交" @click="updateDictionaryData(updateForm)" />
        <el-button size="mini" @click="updateDialogVisible = false">取消</el-button>
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
    <!--导出窗口-->
    <el-dialog
      title="导出窗口"
      :visible.sync="exportDialogVisible"
      width="30%"
    >
      <span>确认导出为excel格式吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportExcel">确 定</el-button>
        <el-button @click="exportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { del, update, save, query, queryDictionary } from '@/api/basedata/dictionary'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
export default {
  name: 'Position',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      // 导入数据
      importForm: {},
      // 总页数
      total: 1,
      // 导入窗口显示
      importFormVisible: false,
      // 文件上传List
      fileList: [],
      loading: true,
      //  搜索区域参数
      queryForm: {
        name: '',
        category: '',
        pageSize: 7,
        currentPage: 1
      },
      //  列表数据来源
      dictionaryDataList: [],
      allDictionaryDataList: [],
      show: true,
      //  新增界面是否显示
      addFormVisible: false,
      //  新增界面数据
      addForm: {
        name: '',
        category: '',
        value: '',
        status: '',
        remark: ''
      },
      FormRules: {
        name: [{ required: true, message: '请输入字典名', trigger: 'blur' }],
        category: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
        value: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      //  编辑界面是否显示
      updateDialogVisible: false,
      //  编辑界面row
      editRow: '',
      //  编辑界面数据
      updateForm: {
        id: '',
        name: '',
        category: '',
        value: '',
        status: '',
        remark: ''
      },
      //  删除数据
      deleteForm: [],
      exportDialogVisible: false,
      multipleSelection: [],
      select_order_number: '', // 表格select选中的条数
      select_orderId: []// 表格select复选框选中的id
    }
  },
  mounted() {
    //  初始加载
    this.getDictionaryList()
  },
  methods: {
    // 获取数据字典列表
    getDictionaryList() {
      query(this.queryForm).then(res => {
        this.dictionaryDataList = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    //  显示新增界面
    addDictionary: function() {
      this.addForm.name = ''
      this.addForm.category = ''
      this.addForm.value = ''
      this.addForm.status = 1
      this.addForm.remark = ''
      this.addFormVisible = true
    },
    addSubmit: function(addForm) {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          save(addForm).then(res => {
            // this.$nextTick(() => {
            //   this.$refs['saveForm'].resetFields()
            // })
            this.addFormVisible = false
            this.queryForm.currentPage = 1
            this.getDictionaryList()
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
    delDictionary(row) {
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.deleteDialogVisible = false
          this.getDictionaryList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 删除多条
    delSelectDictionary(row) {
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
          this.deleteDialogVisible = false
          this.getDictionaryList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 双击显示详情
    dblclick(row, column, event) {
      this.updateDictionary(row)
    },
    // 更新当前行
    updateDictionary(row) {
      this.loading = true
      queryDictionary(row).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res[0]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 更新多条
    updateSelectDictionary() {
      if (this.multipleSelection.length > 1) {
        this.$message({
          message: '不可多条修改',
          type: 'warning'
        })
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行修改',
          type: 'warning'
        })
      } else {
        this.loading = true
        queryDictionary(this.multipleSelection[0]).then(res => {
          this.updateDialogVisible = true
          this.updateForm = res[0]
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },

    updateDictionaryData(updateForm) {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          update(updateForm).then(res => {
            this.updateDialogVisible = false
            this.getDictionaryList()
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
    // 分页
    handleCurrentChange(currentPage) {
      console.log(currentPage)
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.dictionaryDataList = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格的状态列转化成是否
    statusFormatter: function(row) {
      return row.status === 1 ? '是' : '否'
    },
    importSubmit() {},
    exportDictionary() {
      this.exportDialogVisible = true
      this.loading = true
      queryDictionary(this.queryForm).then(res => {
        this.allDictionaryDataList = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    exportExcel() {
      /* generate workbook object from table */
      console.log(document.querySelector('#table'))
      const wb = XLSX.utils.table_to_book(document.querySelector('#table'))
      /* get binary string as output */
      const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      try {
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据字典.xlsx')
        this.exportDialogVisible = false
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.log(e, wbout)
        }
      }
      return wbout
    }
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
