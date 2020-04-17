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
              <el-form-item label="组织机构：" style="margin-right: 50px">
                <el-input v-model="queryForm.name" size="mini" style="width: 160px" placeholder="请输入" />
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryOrg" label="查询" @click="queryOrganization" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveOrg" label="增加" icon="el-icon-circle-plus-outline" @click="saveOrganization()" />
            <perms-button type="danger" perms="deleteOrg" label="删除" icon="el-icon-delete" @click="delSelectOrganization()" />
            <perms-button type="warning" perms="updateOrg" label="修改" icon="el-icon-edit" @click="updateSelectOrganization()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="organizationData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" label="组织机构" />
            <el-table-column prop="code" label="机构代码" />
            <el-table-column prop="master" label="负责人" />
            <el-table-column prop="tel" label="电话" />
            <el-table-column prop="address" label="地址" />
            <el-table-column prop="status" label="是否启用" :formatter="statusFormatter" />
            <el-table-column label="操作" width="140">
              <template slot-scope="scope">
                <perms-button type="success" perms="saveOrg" icon="el-icon-plus" circle @click="saveOrganization()" />
                <perms-button type="danger" perms="deleteOrg" icon="el-icon-delete" circle @click="delOrganization(scope.row)" />
                <perms-button type="warning" perms="updateOrg" icon="el-icon-edit" circle @click="updateOrganization(scope.row)" />
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
    <el-dialog :visible.sync="saveDialogVisible" title="新增组织机构" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">组织机构基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="组织机构名：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="机构代码：" prop="code">
          <el-input v-model="saveForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="负责人：" prop="master">
          <el-input v-model="saveForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="saveForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input v-model="saveForm.address" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveOrg" label="确 定" @click="saveOrganizationData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改组织机构" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">组织机构基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="组织机构名：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="机构代码：" prop="code">
          <el-input v-model="updateForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="负责人：" prop="master">
          <el-input v-model="updateForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="updateForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input v-model="updateForm.address" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateOrg" label="确 定" @click="updateOrganizationData(updateForm)" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, getUpdateForm, query } from '@/api/user/userCommon.js'
import { validatePhoneTwo } from '@/utils/validate'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Position',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      organizationData: [],
      queryForm: {
        name: '',
        currentPage: 1,
        pageSize: 10
      },
      show: true,
      FormRules: {
        name: [{ required: true, message: '请输入组织机构名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入机构代码', trigger: 'blur' }],
        tel: [{ validator: validatePhoneTwo, trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        code: '',
        master: '',
        tel: '',
        address: '',
        status: 1
      },
      updateForm: {
        id: '',
        name: '',
        code: '',
        master: '',
        tel: '',
        address: '',
        status: ''
      },
      loading: false,
      total: 0,
      pageSize: 10,
      deleteForm: [],
      type: 'Org',
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false
    }
  },
  mounted() {
    this.getOrganization()
  },
  methods: {
    getOrganization() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.organizationData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
      this.loading = false
    },
    queryOrganization() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.organizationData = res.pageInfo.list
        this.loading = false
      })
      this.loading = false
    },
    saveOrganization() {
      this.saveDialogVisible = true
    },
    saveOrganizationData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getOrganization()
            this.loading = false
            this.$nextTick(() => {
              this.$refs['saveForm'].resetFields()
            })
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    delOrganization(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getOrganization()
          this.loading = false
        })
        this.loading = false
      })
    },
    delSelectOrganization(row) {
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
            this.getOrganization()
            this.loading = false
          })
          this.loading = false
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateOrganization(row)
    },
    updateOrganization(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.loading = false
      })
      this.loading = false
    },
    updateSelectOrganization(row) {
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
        getUpdateForm(this.type, this.multipleSelection[0].id).then(res => {
          this.updateDialogVisible = true
          this.updateForm = res
          this.loading = false
        })
        this.loading = false
      }
    },
    updateOrganizationData(updateForm) {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, updateForm).then(res => {
            this.updateDialogVisible = false
            this.getOrganization()
            this.loading = false
          })
          this.loading = false
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
        this.organizationData = res.pageInfo.list
        this.loading = false
      })
      this.loading = false
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
