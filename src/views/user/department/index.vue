<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <tree
        :tree-data="setTree"
        :tree-name="treeName"
        @NodeAdd="NodeAdd"
        @NodeUpdate="NodeUpdate"
        @NodeDel="NodeDel"
      />
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form style="float: left" inline>
              <el-form-item label="部门名称：">
                <!-- <el-cascader
                  v-model="queryForm.name"
                  size="mini"
                  style="width: 130px"
                  :options="options"
                  :props="{ expandTrigger: 'hover' }"
                  @change="handleChange"
                /> -->
                <el-input v-model="queryForm.name" size="mini" style="width: 130px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="部门等级：">
                <el-select v-model="queryForm.level" size="mini" clearable placeholder="请选择" style="width: 130px">
                  <el-option
                    v-for="item in levelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryDepartment" label="查询" @click="queryDepartment" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveDepartment" label="增加" icon="el-icon-circle-plus-outline" @click="saveDepartment()" />
            <perms-button type="danger" perms="deleteDepartment" label="删除" icon="el-icon-delete" @click="delSelectDepartment()" />
            <perms-button type="warning" perms="updateDepartment" label="修改" icon="el-icon-edit" @click="updateSelectDepartment()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="departmentData"
            border
            style="width: 100%"
            stripe
            :default-sort="{prop: 'parentDepartment', order: 'ascending'}"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" label="部门名称" align="center" />
            <el-table-column prop="parentDepartment" sortable="" label="上级部门" align="center" />
            <el-table-column prop="code" label="部门编号" align="center" />
            <el-table-column prop="mnemonicCode" label="助记码" align="center" />
            <el-table-column prop="master" label="负责人" align="center" />
            <el-table-column prop="level" label="部门等级" sortable="" align="center" />
            <el-table-column prop="status" label="是否启用" align="center" :formatter="statusFormatter" />
            <el-table-column label="操作" width="140" align="center">
              <template slot-scope="scope">
                <perms-button type="success" icon="el-icon-plus" perms="saveDepartment" circle @click="saveDepartment()" />
                <perms-button type="danger" icon="el-icon-delete" perms="deleteDepartment" circle @click="delDepartment(scope.row)" />
                <perms-button type="warning" icon="el-icon-edit" perms="updateDepartment" circle @click="updateDepartment(scope.row)" />
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
    <el-dialog :visible.sync="saveDialogVisible" title="新增部门基本信息" :close-on-click-modal="false" center width="700px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">公司部门的基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="所属公司：" prop="companyId">
          <el-select v-model="saveForm.companyId" size="mini" :disabled="isCompany" placeholder="请选择" style="width: 200px" @change="getParentDepartment">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="上级部门：" prop="parentId">
          <el-cascader
            v-model="saveForm.parentId"
            :options="parentOption"
            clearable
            size="mini"
            placeholder="请选择"
            :show-all-levels="false"
            :props="{ checkStrictly: true }"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="部门编号：" prop="code">
          <el-input v-model="saveForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="助记码：" prop="mnemonicCode">
          <el-input v-model="saveForm.mnemonicCode" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="部门等级：" prop="level">
          <el-input v-model="saveForm.level" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="负责人：" prop="master">
          <el-input v-model="saveForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveDepartment" label="确 定" @click="saveDepartmentData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改部门基本信息" :close-on-click-modal="false" center width="700px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">公司部门的基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="所属公司：" prop="companyId">
          <el-select v-model="updateForm.companyId" size="mini" placeholder="请选择" disabled style="width: 200px" @change="getParentDepartment">
            <el-option
              v-for="item in companyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="上级部门：" prop="parentId">
          <el-cascader
            v-model="updateForm.parentId"
            :options="parentOption"
            clearable
            disabled
            size="mini"
            placeholder="请选择"
            :show-all-levels="false"
            :props="{ checkStrictly: true }"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="部门编号：" prop="code">
          <el-input v-model="updateForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="助记码：" prop="mnemonicCode">
          <el-input v-model="updateForm.mnemonicCode" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="部门等级：" prop="level">
          <el-select v-model="updateForm.level" size="mini" disabled placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" prop="master">
          <el-input v-model="updateForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateDepartment" label="确 定" @click="updateDepartmentData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, getUpdateForm, query, getList } from '@/api/user/userCommon.js'
import { queryLevel, queryParent } from '@/api/user/department.js'
import { getTreeList, getQueryList } from '@/utils/treeList'
import { getDynamicOptions } from '@/utils/dynamicLoading'
import { getParentOptions, getLevelOptions } from '@/utils/getOptions.js'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Department',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      setTree: [], // 节点树数据
      levelOptions: [],
      parentOptions: [],
      parentOption: [],
      departmentData: [],
      companyOptions: [],
      levelData: [],
      parentData: [],
      show: true,
      queryForm: {
        name: '',
        level: '',
        pageSize: 10,
        currentPage: 1
      },
      FormRules: {
        name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入部门编号', trigger: 'blur' }],
        mnemonicCode: [{ required: true, message: '请输入助记码', trigger: 'blur' }],
        master: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        companyId: '',
        name: '',
        code: '',
        mnemonicCode: '',
        master: '',
        level: '',
        parentId: '',
        status: 1
      },
      updateForm: {
        id: '',
        companyId: '',
        name: '',
        code: '',
        mnemonicCode: '',
        master: '',
        level: '',
        parentId: '',
        status: ''
      },
      loading: false,
      isCompany: this.$store.state.user.companyId !== null,
      total: 0,
      pageSize: 10,
      deleteForm: [],
      type: 'Department',
      treeName: '部门机构',
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
    this.getDepartment()
    this.getLevelOptions()
  },
  methods: {
    getDepartment() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.departmentData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      this.loading = true
      getList(this.type).then(res => {
        this.setTree = getTreeList(res)
        this.parentOptions = getQueryList(res)
        this.companyOptions = getParentOptions(res)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getParentDepartment(value) {
      this.parentOption = getDynamicOptions(value, this.parentOptions)
    },
    getLevelOptions() {
      this.loading = true
      queryLevel().then(res => {
        this.levelData = res
        this.levelOptions = getLevelOptions(this.levelData)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getParentOptions() {
      this.loading = true
      queryParent().then(res => {
        this.parentData = res
        this.parentOptions = getParentOptions(this.parentData)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    saveDepartment() {
      this.saveDialogVisible = true
      this.saveForm.companyId = this.$store.state.user.companyId
      this.getParentDepartment(this.$store.state.user.companyId)
    },
    saveDepartmentData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.saveForm.parentId != null && this.saveForm.parentId[this.saveForm.parentId.length - 1] * 1 > 9) {
            this.saveForm.parentId = this.saveForm.parentId[this.saveForm.parentId.length - 1]
          }
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getDepartment()
            this.getLevelOptions()
            this.getParentOptions()
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
    delDepartment(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getDepartment()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectDepartment(row) {
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
            this.loading = false
            this.getDepartment()
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateDepartment(row)
    },
    updateDepartment(row) {
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.getParentDepartment(row.companyId)
        this.updateForm = res
      }).catch(() => {
        this.loading = false
      })
    },
    updateSelectDepartment(row) {
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
        getUpdateForm(this.type, this.multipleSelection[0].id).then(res => {
          this.updateDialogVisible = true
          this.getParentDepartment(this.multipleSelection[0].companyId)
          this.updateForm = res
        }).catch(() => {
          this.loading = false
        })
      }
    },
    updateDepartmentData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.loading = false
            this.getDepartment()
            this.getLevelOptions()
            this.getParentOptions()
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
        this.departmentData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    queryDepartment() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.departmentData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    NodeUpdate(treeData) {
      // 编辑节点
      if (treeData.NODE.level === 1) {
        this.$message.error('部门管理无法修改公司！')
        return false
      } else {
        getUpdateForm(this.type, treeData.DATA.id).then(res => {
          this.updateDialogVisible = true
          this.option = getDynamicOptions(treeData.DATA.id, this.options)
          this.updateForm = res
        }).catch(() => {
          this.loading = false
        })
      }
    },
    NodeDel(treeData) {
      // 删除节点
      if (treeData.DATA.children && treeData.DATA.children.length !== 0) {
        this.$message.error('部门管理无法删除公司！')
        return false
      } else {
        this.deleteForm[0] = treeData.DATA
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
          del(this.type, this.deleteForm).then(res => {
            this.getDepartment()
          })
        }).catch(() => {
          this.loading = false
        })
      }
    },
    NodeAdd(treeData) {
      // 新增节点
      // console.log(n, d)
      // 判断层级
      if (treeData.NODE.level === 1) {
        this.saveForm.companyId = treeData.DATA.rootId
        this.parentOption = getDynamicOptions(this.saveForm.companyId, this.parentOptions)
        this.saveForm.parentId = null
        this.saveDialogVisible = true
      } else {
        this.saveForm.companyId = treeData.DATA.rootId
        this.parentOption = getDynamicOptions(this.saveForm.companyId, this.parentOptions)
        this.saveForm.parentId = treeData.DATA.id
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
