<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="职位名称：" style="margin-right: 50px">
                <el-input v-model="queryForm.name" size="mini" style="width: 160px" placeholder="请输入" />
              </el-form-item>
              <el-form-item>
                <perms-button label="查询" perms="queryPosition" @click="queryPosition()" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" label="增加" perms="savePosition" icon="el-icon-circle-plus-outline" @click="savePosition()" />
            <perms-button type="danger" label="删除" perms="deletePosition" icon="el-icon-delete" @click="delSelectPosition()" />
            <perms-button type="warning" label="修改" perms="updatePosition" icon="el-icon-edit" @click="updateSelectPosition()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="positionData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="companyName" label="公司" />
            <el-table-column prop="name" sortable label="职位名称" />
            <el-table-column prop="remark" label="备注" />
            <el-table-column prop="status" sortable label="是否启用" :formatter="statusFormatter" />
            <el-table-column label="操作" width="210">
              <template slot-scope="scope">
                <perms-button type="success" icon="el-icon-plus" perms="savePosition" circle @click="savePosition()" />
                <perms-button type="danger" icon="el-icon-delete" perms="deletePosition" circle @click="delPosition(scope.row)" />
                <perms-button type="warning" icon="el-icon-edit" perms="updatePosition" circle @click="updatePosition(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :total="total"
            :current-page="queryForm.currentPage"
            :page-size="pageSize"
            @handleCurrentChange="handleCurrentChange"
          />
        </el-main>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="saveDialogVisible" title="新增职位" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">职位基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="公司：" prop="companyId">
          <el-select v-model="saveForm.companyId" size="mini" :disabled="isCompany" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位名称：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model="saveForm.remark" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="savePosition" label="确 定" @click="savePositionData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改职位" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">职位基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="公司：" prop="companyId">
          <el-select v-model="updateForm.companyId" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位名称：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model="updateForm.remark" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updatePosition" label="确 定" @click="updatePositionData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, getUpdateForm, query } from '@/api/user/userCommon'
import { queryOptions } from '@/api/user/position'
import { getComOptions } from '@/utils/getOptions'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Position',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      companyOptions: [],
      positionData: [],
      queryForm: {
        name: '',
        currentPage: 1,
        pageSize: 10
      },
      show: true,
      FormRules: {
        companyId: [{ required: true, message: '请选择公司', trigger: 'blur' }],
        name: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        companyId: '',
        remark: '',
        status: 1
      },
      updateForm: {
        id: '',
        name: '',
        companyId: '',
        remark: '',
        status: ''
      },
      loading: false,
      isCompany: this.$store.state.user.companyId !== null,
      total: 0,
      pageSize: 10,
      deleteForm: [],
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      type: 'Position',
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false
    }
  },
  mounted() {
    this.getPosition()
  },
  methods: {
    getPosition() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.positionData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      queryOptions(this.type).then(res => {
        this.companyOptions = getComOptions(res)
      })
    },
    queryPosition() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.positionData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    savePosition() {
      this.saveDialogVisible = true
      this.saveForm.companyId = this.$store.state.user.companyId
    },
    savePositionData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getPosition()
            this.loading = false
            this.$nextTick(() => {
              this.$refs['saveForm'].resetFields()
            }).catch(() => {
              this.loading = false
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    delPosition(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getPosition()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectPosition(row) {
      if (this.multipleSelection.length < 1) {
        this.$message({
          message: '最少选择一项删除',
          type: 'faile'
        })
      } else {
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
          this.deleteForm = this.multipleSelection
          this.loading = true
          del(this.type, this.deleteForm).then(res => {
            this.getPosition()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updatePosition(row)
    },
    updatePosition(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    updateSelectPosition(row) {
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
        this.updateForm = this.multipleSelection[0]
        this.updateDialogVisible = true
      }
    },
    updatePositionData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.getPosition()
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
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.positionData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
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
  &-text {
    font-size: 20px;
    line-height: 10px;
  }
}
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
