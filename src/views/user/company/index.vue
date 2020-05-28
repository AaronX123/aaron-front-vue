<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
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
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="公司名：">
                <el-input v-model="queryForm.name" size="mini" style="width: 130px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="组织机构：">
                <el-select v-model="queryForm.orgId" size="mini" placeholder="请选择" style="width: 130px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <perms-button perms="saveCompany" label="查询" @click="queryCompany()" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" label="增加" perms="saveCompany" icon="el-icon-circle-plus-outline" @click="saveCompany()" />
            <perms-button type="danger" label="删除" perms="deleteCompany" icon="el-icon-delete" @click="delSelectCompany()" />
            <perms-button type="warning" label="修改" perms="updateCompany" icon="el-icon-edit" @click="updateSelectCompany()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="companyData"
            border
            style="width: 100%"
            stripe
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" label="公司名" align="center" />
            <el-table-column prop="code" label="公司编号" align="center" />
            <el-table-column prop="mnemonicCode" label="助记码" align="center" />
            <el-table-column prop="master" label="法人" align="center" />
            <el-table-column prop="tax" label="税号" align="center" />
            <el-table-column prop="fax" label="传真" align="center" />
            <el-table-column prop="address" width="80px" sortable label="地址" align="center" />
            <el-table-column prop="orgName" label="所属机构" align="center" />
            <el-table-column prop="email" label="邮箱" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="website" label="网址" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="status" label="是否启用" align="center" :formatter="statusFormatter" />
            <el-table-column label="操作" width="140" align="center">
              <template slot-scope="scope">
                <perms-button type="success" perms="saveCompany" icon="el-icon-plus" circle @click="saveCompany()" />
                <perms-button type="danger" perms="deleteCompany" icon="el-icon-delete" circle @click="deleteCompany(scope.row)" />
                <perms-button type="warning" perms="updateCompany" icon="el-icon-edit" circle @click="updateCompany(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :total="total"
            :current-page="queryForm.currentPage"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
          />
        </el-main>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="saveDialogVisible" title="新增公司的基本信息" :close-on-click-modal="false" center width="750px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">公司基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="公司名：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="公司编号：" prop="code">
          <el-input v-model="saveForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="助记码：" prop="mnemonicCode">
          <el-input v-model="saveForm.mnemonicCode" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="法人：" prop="master">
          <el-input v-model="saveForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="税号：" prop="tax">
          <el-input v-model="saveForm.tax" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="传真：" prop="fax">
          <el-input v-model="saveForm.fax" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="saveForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input v-model="saveForm.address" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所属机构：" prop="orgId">
          <el-select v-model="saveForm.orgId" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="saveForm.email" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="网址：" prop="website">
          <el-input v-model="saveForm.website" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveCompany" label="确 定" @click="savecompanyData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改公司的基本信息" :close-on-click-modal="false" center width="750px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">公司基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="公司名：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="公司编号：" prop="code">
          <el-input v-model="updateForm.code" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="助记码：" prop="mnemonicCode">
          <el-input v-model="updateForm.mnemonicCode" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="法人：" prop="master">
          <el-input v-model="updateForm.master" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="税号：" prop="tax">
          <el-input v-model="updateForm.tax" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="传真：" prop="fax">
          <el-input v-model="updateForm.fax" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="电话：" prop="tel">
          <el-input v-model="updateForm.tel" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input v-model="updateForm.address" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所属机构：" prop="orgId">
          <el-select v-model="updateForm.orgId" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="updateForm.email" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="网址：" prop="website">
          <el-input v-model="updateForm.website" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateCompany" label="确 定" @click="updatecompanyData(updateForm)" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, getUpdateForm, query, getList } from '@/api/user/userCommon.js'
import { getTreeList } from '@/utils/treeList.js'
import { getParentOptions } from '@/utils/getOptions.js'
import { validatePhoneTwo, validateEMail } from '@/utils/validate'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Company',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      DATA: null,
      NODE: null,
      isLoadingTree: true, // 是否加载节点树
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      setTree: [],
      treeName: '',
      menuVisible: false,
      objectID: null,
      options: [],
      companyData: [],
      parentData: [],
      show: true,
      FormRules: {
        name: [{ required: true, message: '请输入公司名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入公司编号', trigger: 'blur' }],
        mnemonicCode: [{ required: true, message: '请输入助记码', trigger: 'blur' }],
        master: [{ required: true, message: '请输入法人', trigger: 'blur' }],
        tax: [{ required: true, message: '请输入税号', trigger: 'blur' }],
        fax: [{ required: true, message: '请输入传真', trigger: 'blur' }],
        tel: [{ validator: validatePhoneTwo, trigger: 'blur' }],
        orgId: [{ required: true, message: '请输入所属机构名', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: validateEMail, trigger: 'blur' }],
        website: [{ required: true, message: '请输入网址', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        code: '',
        mnemonicCode: '',
        master: '',
        tax: '',
        fax: '',
        tel: '',
        address: '',
        orgId: '',
        email: '',
        website: '',
        status: 1
      },
      deleteForm: [],
      updateForm: {
        id: '',
        name: '',
        code: '',
        mnemonicCode: '',
        master: '',
        tax: '',
        fax: '',
        tel: '',
        address: '',
        orgId: '',
        email: '',
        website: '',
        status: ''
      },
      queryForm: {
        name: '',
        orgId: '',
        currentPage: 1,
        pageSize: 10
      },
      loading: true,
      total: 0,
      pageSize: 10,
      type: 'Company',
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
  created() {
    this.getCompany()
  },
  methods: {
    getCompany() {
      query(this.type, this.queryForm).then(res => {
        this.companyData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      this.loading = true
      getList(this.type).then(res => {
        this.parentData = res
        console.log(this.parentData);
        this.setTree = getTreeList(this.parentData)
        console.log(this.setTree);
        this.treeName = '组织机构'
        this.options = getParentOptions(this.parentData)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    queryCompany() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.companyData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    saveCompany() {
      this.saveDialogVisible = true
    },
    savecompanyData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.loading = false
            this.getCompany()
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
    deleteCompany(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getCompany()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectCompany(row) {
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
            this.getCompany()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    updateCompany(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    updateSelectCompany(row) {
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
    updatecompanyData(updateForm) {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, updateForm).then(res => {
            this.updateDialogVisible = false
            this.loading = false
            this.getCompany()
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
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateCompany(row)
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.companyData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 编辑节点
    NodeUpdate(treeData) {
      if (treeData.NODE.level === 1) {
        this.$message.error('公司管理无法修改组织机构！')
        return false
      } else {
        this.loading = true
        getUpdateForm(this.type, treeData.DATA.id).then(res => {
          this.updateDialogVisible = true
          this.updateForm = res
          this.updateForm.parentId = [res.parentId]
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },
    // 删除节点
    NodeDel(treeData) {
      if (treeData.DATA.children && treeData.DATA.children.length !== 0) {
        this.$message.error('公司管理无法删除组织机构！')
        return false
      } else {
        this.deleteForm[0] = treeData.DATA
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
          del(this.type, this.deleteForm).then(res => {
            this.getCompany()
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 新增节点
    NodeAdd(treeData) {
      // 判断层级
      if (treeData.NODE.level >= 3) {
        this.$message.error('最多只支持三级！')
        return false
      } else if (treeData.NODE.level === 1) {
        this.saveForm.orgId = treeData.DATA.id
        this.saveDialogVisible = true
      } else {
        this.$message.error('请在组织机构下添加公司！')
        return false
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
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
