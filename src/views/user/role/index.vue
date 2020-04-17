<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <tree :tree-data="setTree" :tree-name="treeName" :is-hidden-update="true" :is-hidden-delete="true" @NodeAdd="NodeAdd" />
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="角色名称：">
                <el-input
                  v-model="queryForm.name"
                  size="mini"
                  style="width: 160px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryRole" label="查询" @click="queryRole" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveRole" label="增加" icon="el-icon-plus" @click="saveRole()" />
            <perms-button type="danger" perms="deleteRole" label="删除" icon="el-icon-delete" @click="delSelectRole()" />
            <perms-button type="warning" perms="updateRole" label="修改" icon="el-icon-edit" @click="updateSelectRole()" />
            <perms-button perms="updateResourceForRole" label="资源分配" icon="el-icon-circle-plus-outline" @click="updateSelectResourceForRole()" />
            <perms-button perms="userAllocation" label="用户分配" icon="el-icon-user" @click="selectUserAllocation()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            ref="mulTable"
            V-loading="loading"
            :data="roleData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" sortable label="角色名称" align="center" />
            <el-table-column prop="code" label="角色代号" align="center" />
            <el-table-column prop="remark" label="角色备注" align="center" />
            <el-table-column prop="companyName" label="所属公司" align="center" />
            <el-table-column prop="orgName" label="所属机构" disabled align="center" />
            <el-table-column prop="status" label="是否启用" align="center" :formatter="statusFormatter" />>
            <el-table-column label="操作" width="250%" align="center">
              <template slot-scope="scope">
                <perms-button type="success" perms="saveRole" icon="el-icon-plus" circle @click="saveRole()" />
                <perms-button type="danger" perms="deleteRole" icon="el-icon-delete" circle @click="delRole(scope.row)" />
                <perms-button type="warning" perms="updateRole" icon="el-icon-edit" circle @click="updateRole(scope.row)" />
                <perms-button perms="updateResourceForRole" icon="el-icon-circle-plus-outline" circle @click="updateResource(scope.row)" />
                <perms-button perms="userAllocation" icon="el-icon-user" circle @click="userAllocation(scope.row)" />
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
    <el-dialog
      :visible.sync="manageDialogVisible"
      title="资源分配"
      center
      width="400px"
      :close-on-click-modal="false"
    >
      <h3 class="el-icon-folder" style="margin: 0px">
        资源管理
        <i class="el-icon-plus" @click="saveDialogVisible = true" />
        <i class="el-icon-refresh-left" />
      </h3>
      <el-tree
        ref="resourceTree"
        :data="setTree2"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        style="margin-top:10px"
        accordion
      >
        <span slot-scope="{ node, data }" class="span-ellipsis">
          <span v-show="!node.isEdit">
            <span v-show="data.children && data.children.length >= 1">
              <span :title="node.label">{{ node.label }}</span>
            </span>
            <span v-show="!data.children || data.children.length == 0">
              <span :title="node.label">{{ node.label }}</span>
            </span>
          </span>
        </span>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <perms-button
          perms="updateResourceForRole"
          label="确 定"
          @click="updateResourceForRoleData()"
        />
        <el-button size="mini" @click="closeUpdateResourceForRole()">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="saveDialogVisible"
      title="新增角色"
      :close-on-click-modal="false"
      center
      width="600px"
    >
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">角色基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="20%" size="mini" :rules="FormRules">
        <el-form-item label="角色名称：" prop="name">
          <el-input v-model="saveForm.name" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="角色代号：" prop="code">
          <el-input v-model="saveForm.code" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="角色备注：" prop="remark">
          <el-input v-model="saveForm.remark" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所属机构：" prop="orgId">
          <el-select
            v-model="saveForm.orgId"
            size="mini"
            placeholder="请选择"
            style="width: 50%"
            @change="getCompanyOptions"
          >
            <el-option
              v-for="item in orgOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属公司：" prop="companyId">
          <el-select
            v-model="saveForm.companyId"
            size="mini"
            :disabled="isCompany"
            placeholder="请选择"
            style="width: 50%"
          >
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveRole" label="确 定" @click="saveRoleData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="updateDialogVisible"
      title="修改角色"
      :close-on-click-modal="false"
      center
      width="600px"
    >
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">角色基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form
        ref="updateForm"
        :model="updateForm"
        label-width="20%"
        size="mini"
        :rules="FormRules"
      >
        <el-form-item label="角色名称：" prop="name">
          <el-input v-model="updateForm.name" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="角色代号：" prop="code">
          <el-input v-model="updateForm.code" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="角色备注：" prop="remark">
          <el-input v-model="updateForm.remark" style="width: 50%" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所属机构：" prop="orgId">
          <el-select
            v-model="updateForm.orgId"
            size="mini"
            placeholder="请选择"
            style="width: 50%"
            @change="getCompanyOptions"
          >
            <el-option
              v-for="item in orgOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属公司：" prop="companyId">
          <el-select
            v-model="updateForm.companyId"
            size="mini"
            placeholder="请选择"
            style="width: 50%"
          >
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateRole" label="确 定" @click="updateRoleData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, getUpdateForm, query, getList } from '@/api/user/userCommon'
import { allocationRole, updateResourceForRole, getResourceForRoleForm } from '@/api/user/role'
import { getParentOptions, getDeptOptions } from '@/utils/getOptions'
import { getTreeList, getQueryList } from '@/utils/treeList'
import { getDynamicOptions } from '@/utils/dynamicLoading'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Role',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      menuVisible: this.menuVisible,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      parentOptions: [],
      treeData: [],
      setTree: [],
      setTree2: [],
      roleData: [],
      userData: [],
      orgOptions: [],
      companyOptions: [],
      show: true,
      queryForm: {
        name: '',
        currentPage: 1,
        pageSize: 10
      },
      FormRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入角色代号', trigger: 'blur' }],
        orgId: [{ required: true, message: '请选择所属机构', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        code: '',
        remark: '',
        orgId: '',
        companyId: '',
        status: 1
      },
      updateForm: {
        id: '',
        name: '',
        code: '',
        remark: '',
        orgId: '',
        companyId: '',
        status: ''
      },
      resourceForRoleForm: [],
      resourceForUserForm: [],
      loading: false,
      total: 0,
      userTotal: 0,
      currentPage: 1,
      roleId: [],
      pageSize: 10,
      deleteForm: [],
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      userSelection: [],
      isCompany: this.$store.state.user.companyId !== null,
      type: 'Role',
      treeName: '组织结构',
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false,
      manageDialogVisible: false
    }
  },
  mounted() {
    this.getRole()
  },
  methods: {
    getRole() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.roleData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      getList(this.type).then(res => {
        this.setTree = getTreeList(res)
        this.orgOptions = getParentOptions(res)
        this.companyOptions = getDeptOptions(res)
        this.orgOptions = getParentOptions(res)
        this.parentOptions = getQueryList(res)
      })
      getList('Resource').then(res => {
        this.setTree2 = getTreeList(res)
        this.loading = false
      })
    },
    getCompanyOptions(value) {
      this.companyOptions = getDynamicOptions(value, this.parentOptions)
    },
    queryRole() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.roleData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    saveRole() {
      this.saveDialogVisible = true
      this.saveForm.orgId = this.orgOptions[0].value
      this.saveForm.companyId = this.$store.state.user.companyId
    },
    saveRoleData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getRole()
            this.loading = false
            this.$nextTick(() => {
              this.$refs['saveForm'].resetFields()
            })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    delRole(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除该角色吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getRole()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectRole(row) {
      if (this.multipleSelection.length < 1) {
        this.$message({
          message: '最少选择一项删除',
          type: 'faile'
        })
      } else {
        this.$confirm('确认删除该角色吗？', '提示', {}).then(() => {
          this.deleteForm = this.multipleSelection
          this.loading = true
          del(this.type, this.deleteForm).then(res => {
            this.getRole()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateRole(row)
    },
    // 从表单选择的单条更新方法
    updateRole(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        // this.getParentDepartment(row.companyId)
        this.updateForm = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 通过selection选择的单条更新方法，过滤多条更新以及空更新
    updateSelectRole() {
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
    // 更新方法接口的调用
    updateRoleData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.getRole()
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 从表单选择的单条资源分配方法
    updateResource(row) {
      this.loading = true
      getResourceForRoleForm(row.id).then(res => {
        // this.getParentDepartment(row.companyId)
        this.manageDialogVisible = true
        this.loading = false
        if (res) {
          this.$nextTick(() => {
            this.$refs.resourceTree.setCheckedNodes(res)
          })
        }
        this.roleId[0] = row.id
      })
      // this.loading = false
    },
    // 通过selection选择的单条资源分配方法，过滤多条资源分配以及空分配
    updateSelectResourceForRole() {
      if (this.multipleSelection.length > 1) {
        this.manageDialogVisible = true
        for (const n in this.multipleSelection) {
          this.roleId[n] = this.multipleSelection[n].id
        }
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一个角色进行资源分配',
          type: 'faile'
        })
      } else {
        this.loading = true
        getResourceForRoleForm(this.multipleSelection[0].id).then(res => {
          this.manageDialogVisible = true
          this.loading = false
          // this.getParentDepartment(row.companyId)
          this.roleId[0] = this.multipleSelection[0].id
          if (res) {
            this.$nextTick(() => {
              this.$refs.resourceTree.setCheckedNodes(res)
            })
          }
        }).catch(() => {
          this.loading = false
        })
      }
    },
    // 资源分配方法接口的调用
    updateResourceForRoleData() {
      for (const n in this.$refs.resourceTree.getCheckedNodes()) {
        for (const m in this.roleId) {
          const resourceForRole = {}
          resourceForRole.roleId = this.roleId[m]
          resourceForRole.resourceId = this.$refs.resourceTree.getCheckedNodes()[n].id
          resourceForRole.type = 0
          this.resourceForRoleForm.push(resourceForRole)
        }
      }
      for (const n in this.$refs.resourceTree.getHalfCheckedKeys()) {
        for (const m in this.roleId) {
          const resourceForRole = {}
          resourceForRole.roleId = this.roleId[m]
          resourceForRole.resourceId = this.$refs.resourceTree.getHalfCheckedKeys()[n]
          resourceForRole.type = 1
          this.resourceForRoleForm.push(resourceForRole)
        }
      }
      this.loading = true
      updateResourceForRole(this.resourceForRoleForm).then(res => {
        this.manageDialogVisible = false
        this.$nextTick(() => {
          this.$refs.resourceTree.setCheckedKeys([])
        })
        this.resourceForRoleForm = []
        this.$refs.mulTable.clearSelection()
        this.getRole()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    closeUpdateResourceForRole() {
      this.manageDialogVisible = false
      this.$nextTick(() => {
        this.$refs.resourceTree.setCheckedKeys([])
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
        this.roleData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    userAllocation(row) {
      this.$router.push({
        name: '用户分配',
        params: {
          updateUserAllocstion: row
        }
      })
    },
    selectUserAllocation() {
      if (this.multipleSelection.length > 1) {
        this.$message({
          message: '不可多条同时分配用户',
          type: 'faile'
        })
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行分配用户',
          type: 'faile'
        })
      } else {
        this.$router.push({
          name: '用户分配',
          params: {
            updateUserAllocstion: this.multipleSelection[0]
          }
        })
      }
    },
    userAllocationData() {
      for (const n in this.userSelection) {
        const resourceForUser = {}
        resourceForUser.roleId = this.roleId
        resourceForUser.userId = this.userSelection[n].id
        this.resourceForUserForm.push(resourceForUser)
      }
      this.loading = true
      allocationRole(this.resourceForUserForm).then(res => {
        this.userAllocationDialogVisible = false
        this.userSelection = []
        this.getRole()
        this.loading = false
      })
      this.loading = false
      this.resourceForUserForm = []
    },
    closeUserAllocation() {
      this.userAllocationDialogVisible = false
      this.userSelection = []
    },
    NodeAdd(treeData) {
      // 新增节点
      console.log(treeData.NODE, treeData.DATA)
      // 判断层级
      if (treeData.NODE.level >= 3) {
        this.$message.error('最多只支持三级！')
        return false
      } else if (treeData.NODE.level === 1) {
        this.saveForm.orgId = treeData.DATA.id
        this.saveDialogVisible = true
      } else {
        this.saveForm.companyId = treeData.DATA.id
        this.saveForm.orgId = treeData.DATA.parentId
        this.saveDialogVisible = true
      }
      if (!treeData.NODE.expanded) {
        treeData.NODE.expanded = true
      }
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
}
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  margin-left: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
