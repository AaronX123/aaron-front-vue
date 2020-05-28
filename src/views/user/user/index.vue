<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <tree
        :tree-data="setTree"
        :tree-name="treeName"
        :type="type"
        :is-hidden-update="true"
        :is-hidden-delete="true"
        @NodeAdd="NodeAdd"
      />
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="用户名称：">
                <el-input v-model="queryForm.name" size="mini" style="width: 120px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="工号：">
                <el-input v-model="queryForm.code" size="mini" style="width: 120px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="手机号：">
                <el-input v-model="queryForm.tel" size="mini" style="width: 150px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="角色：">
                <el-select v-model="queryForm.roleId" size="mini" clearable placeholder="请选择" style="width: 120px">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryUserManagement" label="查询" @click="queryUser" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveUserManagement" label="增加" icon="el-icon-plus" @click="saveUser()" />
            <perms-button type="danger" perms="deleteUserManagement" label="删除" icon="el-icon-delete" @click="delSelectUser()" />
            <perms-button type="warning" perms="updateUserManagement" label="修改" icon="el-icon-edit" @click="updateSelectUser()" />
            <perms-button perms="allocationUserManagement" label="分配角色" icon="el-icon-user" @click="alloSelectUser()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="userData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="code" label="用户工号" align="center" />
            <el-table-column prop="password" label="初始密码" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="name" label="名字" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="roleName" label="角色" :show-overflow-tooltip="true" sortable width="100px" align="center" />
            <el-table-column prop="companyName" label="公司" align="center" />
            <el-table-column prop="departmentName" label="部门" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="sex" label="性别" :formatter="sexFormatter" align="center" />
            <el-table-column prop="birthday" label="生日" width="100px" align="center" />
            <el-table-column prop="positionName" label="职位" align="center" />
            <el-table-column prop="tel" label="电话" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="email" label="邮箱" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="other" label="其他/微信" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="remark" label="备注" align="center" />
            <el-table-column prop="status" label="是否启用" sortable align="center" :formatter="statusFormatter" />
            <el-table-column label="操作" width="200%" align="center">
              <template slot-scope="scope">
                <perms-button type="success" icon="el-icon-plus" perms="saveUserManagement" circle @click="saveUser()" />
                <perms-button type="danger" icon="el-icon-delete" perms="deleteUserManagement" circle @click="delUser(scope.row)" />
                <perms-button type="warning" icon="el-icon-edit" perms="updateUserManagement" circle @click="updateUser(scope.row)" />
                <perms-button perms="allocationUserManagement" icon="el-icon-user" circle @click="allocationRole(scope.row.id)" />
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
    <el-dialog :visible.sync="roleDialogVisible" title="分配角色" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">角色分配</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="allocationForm" :model="allocationForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="公司：" prop="companyId">
          <el-select v-model="allocationForm.companyId" size="mini" clearable="" placeholder="请选择" style="width: 200px" @change="getParentDepartment">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色：" prop="roleId">
          <el-select v-model="allocationForm.roleId" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="allocationUserManagement" label="确 定" @click="allocationUserData(allocationForm)" />
        <el-button size="mini" @click="roleDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="saveDialogVisible" title="新增用户" width="700px" :close-on-click-modal="false" center>
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">用户基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="用户工号：" prop="code">
          <el-input v-model="saveForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="初始密码：" prop="password">
          <el-input v-model="saveForm.password" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="名字：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="公司：" prop="companyId">
          <el-select v-model="saveForm.companyId" size="mini" clearable :disabled="isCompany" placeholder="请选择" style="width: 200px" @change="getParentDepartment">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门：" prop="departmentId">
          <el-select v-model="saveForm.departmentId" size="mini" clearable="" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in departmentOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色：" prop="roleId">
          <el-select v-model="saveForm.roleId" size="mini" clearable="" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in roleOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位：" prop="positionId">
          <el-select v-model="saveForm.positionId" size="mini" clearable="" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in positionOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别：" prop="sex">
          <el-select v-model="saveForm.sex" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in sexOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生日：" prop="birthday">
          <el-date-picker
            v-model="saveForm.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 200px"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="saveForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="saveForm.email" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="其他/微信：" prop="other">
          <el-input v-model="saveForm.other" style="width: 200px" placeholder="请输入" />
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
        <perms-button perms="saveUserManagement" label="确 定" @click="saveUserData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改用户" width="700px" :close-on-click-modal="false" center>
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">用户基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="用户工号：" prop="code">
          <el-input v-model="updateForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="初始密码：" prop="password">
          <el-input v-model="updateForm.password" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="名字：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="公司：" prop="companyId">
          <el-select v-model="updateForm.companyId" size="mini" disabled clearable placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门：" prop="departmentId">
          <el-select v-model="updateForm.departmentId" size="mini" clearable="" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in departmentOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位：" prop="positionId">
          <el-select v-model="updateForm.positionId" size="mini" clearable="" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in positionOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别：" prop="sex">
          <el-select v-model="updateForm.sex" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in sexOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生日：" prop="birthday">
          <el-date-picker
            v-model="updateForm.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 200px"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="updateForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="updateForm.email" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="其他/微信：" prop="other">
          <el-input v-model="updateForm.other" style="width: 200px" placeholder="请输入" />
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
        <perms-button perms="updateUserManagement" label="确 定" @click="updateUserData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, query, getUpdateForm, getList } from '@/api/user/userCommon'
import { queryOptions, allocation, queryRoleOfUser } from '@/api/user/user'
import { getTreeList } from '@/utils/treeList'
import { getRoleOptions, getPositionOptions, getDeptOptions, getParentOptions } from '@/utils/getOptions'
import { getDynamicOption } from '@/utils/dynamicLoading'
import { isPassword, validatePhoneTwo, validateEMail, validateCode } from '@/utils/validate'
import { queryDepartment } from '@/api/user/department.js'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Position',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      companyOptions: [],
      parentOption: [],
      parentOptions: [],
      positionOption: [],
      positionOptions: [],
      roleOption: [],
      roleOptions: [],
      departmentOption: [],
      departmentOptions: [],
      sexOptions: [{
        value: 1,
        label: '男'
      },
      {
        value: 0,
        label: '女'
      }],
      roleOfUser: [],
      setTree: [],
      setQuery: [],
      userData: [],
      roleData: [],
      show: true,
      allocationForm: {
        userId: '',
        companyId: '',
        roleId: []
      },
      queryForm: {
        name: '',
        code: '',
        tel: '',
        roleId: '',
        pageSize: 10,
        currentPage: 1
      },
      FormRules: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入用户工号', trigger: 'blur' }, { validator: validateCode, trigger: 'blur' }],
        password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }, { validator: isPassword, trigger: 'blur' }],
        sex: [{ required: true, message: '请输入性别', trigger: 'blur' }],
        birthday: [{ required: true, message: '请输入生日', trigger: 'blur' }],
        tel: [{ required: true, message: '请输入电话', trigger: 'blur' }, { validator: validatePhoneTwo, trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: validateEMail, trigger: 'blur' }],
        status: [{ required: true, message: '请输入字典名', trigger: 'blur' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        code: '',
        password: '123456',
        companyId: '',
        departmentId: '',
        roleId: '',
        positionId: '',
        sex: 1,
        birthday: '2000-01-01',
        tel: '',
        email: '',
        other: '',
        remark: '',
        status: 1
      },
      updateForm: {
        id: '',
        name: '',
        code: '',
        password: '',
        departmentId: '',
        companyId: '',
        positionId: '',
        sex: '',
        birthday: '',
        tel: '',
        email: '',
        other: '',
        remark: '',
        status: ''
      },
      loading: true,
      total: 0,
      isCompany: this.$store.state.user.companyId !== null,
      pageSize: 10,
      type: 'UserManagement',
      treeName: '组织结构',
      deleteForm: [],
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false,
      roleDialogVisible: false
    }
  },
  mounted() {
    this.getUser()
  },
  methods: {
    getUser() {
      query(this.type, this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      getList(this.type).then(res => {
        this.setTree = getTreeList(res)
        this.companyOptions = getParentOptions(res)
        this.departmentOptions = getDeptOptions(res)
        this.departmentOption = getDeptOptions(res)
      });
      queryDepartment().then(res => {
        this.departmentOptions = getDeptOptions(res)
        this.departmentOption = getDeptOptions(res)
      });
      queryOptions(this.type).then(res => {
        this.roleOptions = getRoleOptions(res.role)
        this.roleOption = getRoleOptions(res.role)
        this.positionOptions = getPositionOptions(res.position)
        this.positionOption = getPositionOptions(res.position)
      })
    },
    queryUser() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    saveUser() {
      queryDepartment().then(res => {
        console.log(res);
        this.departmentOptions = getDeptOptions(res)
        this.departmentOption = getDeptOptions(res)
      });
      queryOptions(this.type).then(res => {
        this.roleOptions = getRoleOptions(res.role);
        this.roleOption = getRoleOptions(res.role);
        this.positionOptions = getPositionOptions(res.position);
        this.positionOption = getPositionOptions(res.position)
      });
      this.saveDialogVisible = true
      this.saveForm.companyId = this.$store.state.user.companyId
    },
    saveUserData(formName) {
      console.log("------------------"+ formName)
      this.$refs[formName].validate((valid) => {
        console.log("------------------"+ valid)
        if (valid) {
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getUser().then(res => {
              this.loading = false
            })
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
    delUser(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getUser().then(res => {
            this.loading = false
          })
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectUser(row) {
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
            this.getUser().then(res => {
              this.loading = false
            })
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateUser(row)
    },
    updateUser(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    allocationRole(id) {
      this.roleDialogVisible = true
      this.allocationForm.userId = id
      this.loading = true
      queryRoleOfUser(this.type, this.allocationForm.userId).then(res => {
        for (const n in res) {
          var tmp = {}
          tmp = res[n].roleId
          this.allocationForm.roleId.push(tmp)
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      this.allocationForm.roleId = []
    },
    updateSelectUser(row) {
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
    alloSelectUser(row) {
      if (this.multipleSelection.length > 1) {
        this.$message({
          message: '不可多条同时分配',
          type: 'faile'
        })
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一用户进行分配角色',
          type: 'faile'
        })
      } else {
        this.roleDialogVisible = true
        this.allocationForm.userId = this.multipleSelection[0].id
        this.loading = true
        queryRoleOfUser(this.type, this.allocationForm.userId).then(res => {
          for (const n in res) {
            var tmp = {}
            tmp = res[n].roleId
            this.allocationForm.roleId.push(tmp)
          }
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
        this.allocationForm.roleId = []
      }
    },
    updateUserData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.getUser().then(res => {
              this.loading = false
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
    allocationUserData(allocationForm) {
      this.loading = true
      allocation(this.type, allocationForm).then(res => {
        this.roleDialogVisible = false
        this.getUser().then(res => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
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
    sexFormatter(row) {
      return row.status === 1 ? '男' : '女'
    },
    getParentDepartment(value) {
      this.roleOption = getDynamicOption(value, this.roleOptions)
      this.departmentOption = getDynamicOption(value, this.departmentOptions)
      this.positionOption = getDynamicOption(value, this.positionOptions)
      this.saveForm.roleId = null
      this.saveForm.departmentId = null
      this.saveForm.positionId = null
    },
    NodeAdd(treeData) {
      // 新增节点
      console.log(treeData.NODE, treeData.DATA)
      // 判断层级
      if (treeData.NODE.level > 1 && treeData.NODE.level < 4) {
        this.getParentDepartment(treeData.DATA.rootId)
        this.saveForm.companyId = treeData.DATA.rootId
        this.saveForm.departmentId = treeData.DATA.id
        this.saveDialogVisible = true
      } else {
        this.saveForm.companyId = treeData.DATA.id
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
</style>
