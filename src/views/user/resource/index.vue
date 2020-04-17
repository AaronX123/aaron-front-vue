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
              <el-form-item label="节点名称：">
                <el-cascader
                  v-model="queryForm.id"
                  :options="parentOptions"
                  clearable
                  size="mini"
                  :show-all-levels="false"
                  :props="{ checkStrictly: true }"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <perms-button label="查询" perms="queryResource" @click="queryResource" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveResource" label="增加" icon="el-icon-circle-plus-outline" @click="saveResource()" />
            <perms-button type="danger" perms="deleteResource" label="删除" icon="el-icon-delete" @click="delSelectResource()" />
            <perms-button type="warning" perms="updateResource" label="修改" icon="el-icon-edit" @click="updateSelectResource()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            stripe
            :data="resourceData"
            border
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="name" label="节点名称" width="150%" align="center" />
            <el-table-column prop="code" label="编号" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="parentName" label="父亲节点" width="163%" align="center" />
            <el-table-column prop="url" label="URL" :show-overflow-tooltip="true" align="center" />
            <el-table-column prop="resourceType" width="120px" sortable label="资源类型" align="center" />
            <el-table-column prop="orderIndex" width="100px" sortable label="顺序号" align="center" />
            <el-table-column prop="openImg" label="图标" width="70px" align="center" />
            <el-table-column prop="leaf" label="是否叶子节点" width="120%" align="center" />
            <el-table-column label="操作" width="150%" align="center">
              <template slot-scope="scope">
                <perms-button type="success" icon="el-icon-plus" perms="saveResource" circle @click="saveResource()" />
                <perms-button type="danger" icon="el-icon-delete" perms="deleteResource" circle @click="delResource(scope.row)" />
                <perms-button type="warning" icon="el-icon-edit" perms="updateResource" circle @click="updateResource(scope.row)" />
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
    <el-dialog :visible.sync="saveDialogVisible" title="新增资源基本信息" :close-on-click-modal="false" center width="750px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">资源基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="120px" size="mini" inline :rules="FormRules">
        <el-form-item label="节点名称：" prop="name">
          <el-input v-model="saveForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="节点编号：" prop="code">
          <el-input v-model="saveForm.code" style="width: 200px" />
        </el-form-item>
        <el-form-item label="父亲节点：" prop="parentId">
          <el-cascader
            v-model="saveForm.parentId"
            :options="parentOptions"
            clearable
            size="mini"
            placeholder="请选择父亲节点"
            :show-all-levels="false"
            :props="{ checkStrictly: true }"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="URL：" prop="url">
          <el-input v-model="saveForm.url" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="资源类型：" prop="resourceType">
          <el-input v-model="saveForm.resourceType" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="顺序号：" prop="orderIndex">
          <el-input v-model="saveForm.orderIndex" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="关闭图标：" prop="closeImg">
          <el-input v-model="saveForm.closeImg" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="打开图标：" prop="openImg">
          <el-input v-model="saveForm.openImg" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否叶子节点：" prop="leaf">
          <el-radio-group v-model="saveForm.leaf">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveResource" label="确 定" @click="saveResourceData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改资源基本信息" :close-on-click-modal="false" center width="750px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">资源基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form
        ref="updateForm"
        :model="updateForm"
        label-width="120px"
        size="mini"
        inline
        :rules="FormRules"
      >
        <el-form-item label="节点名称：" prop="name">
          <el-input v-model="updateForm.name" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="节点编号：" prop="code">
          <el-input v-model="updateForm.code" style="width: 200px" />
        </el-form-item>
        <el-form-item label="父亲节点：" prop="parentId">
          <el-cascader
            v-model="updateForm.parentId"
            :options="parentOptions"
            clearable
            disabled
            size="mini"
            placeholder="请选择父亲节点"
            :show-all-levels="false"
            :props="{ checkStrictly: true }"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="URL：" prop="url">
          <el-input v-model="updateForm.url" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="资源类型：" prop="resourceType">
          <el-input v-model="updateForm.resourceType" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="顺序号：" prop="orderIndex">
          <el-input v-model="updateForm.orderIndex" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="关闭图标：" prop="closeImg">
          <el-input v-model="updateForm.closeImg" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="打开图标：" prop="openImg">
          <el-input v-model="updateForm.openImg" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否叶子节点：" prop="leaf">
          <el-radio-group v-model="updateForm.leaf">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateResource" label="确 定" @click="updateResourceData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { save, del, update, query, getUpdateForm, getList } from '@/api/user/userCommon'
import { getTreeList, getQueryList } from '@/utils/treeList'
import tree from '@/components/Tree/index'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
import { idToName } from '@/utils/convert'
export default {
  name: 'Position',
  components: { tree, PermsButton, loading, Pagination },
  data() {
    return {
      treeData: [],
      setTree: [],
      parentOptions: [],
      resourceData: [],
      show: true,
      queryForm: {
        id: '',
        parentId: '',
        pageSize: 10,
        currentPage: 1
      },
      FormRules: {
        name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        parentId: [{ required: true, message: '请输入父亲节点', trigger: 'blur' }],
        url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
        resourceType: [{ required: true, message: '请输入资源类型', trigger: 'blur' }],
        orderIndex: [{ required: true, message: '请输入顺序号', trigger: 'blur' }],
        closeImg: [{ required: true, message: '请输入关闭图标', trigger: 'blur' }],
        openImg: [{ required: true, message: '请输入打开图标', trigger: 'blur' }],
        leaf: [{ required: true, message: '请选择是否为叶子节点', trigger: 'blur' }]
      },
      saveForm: {
        id: '',
        name: '',
        code: '',
        parentId: '',
        url: '',
        resourceType: '',
        orderIndex: '',
        closeImg: '',
        openImg: '',
        leaf: 0
      },
      updateForm: {
        id: '',
        name: '',
        code: '',
        parentId: '',
        url: '',
        resourceType: '',
        orderIndex: '',
        closeImg: '',
        openImg: '',
        leaf: ''
      },
      loading: false,
      total: 0,
      pageSize: 10,
      type: 'Resource',
      treeName: '资源管理',
      deleteForm: [],
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
    this.getResource()
  },
  methods: {
    getResource() {
      this.loading = true
      getList(this.type).then(res => {
        this.treeData = res
        this.setTree = getTreeList(this.treeData)
        this.parentOptions = getQueryList(this.treeData)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      query(this.type, this.queryForm).then(res => {
        this.resourceData = res.pageInfo.list
        for (const n in this.resourceData) {
          this.resourceData[n].parentName = idToName(this.parentOptions, this.resourceData[n].parentId)
        }
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    queryResource() {
      this.queryForm.id = this.queryForm.id[this.queryForm.id.length - 1]
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.resourceData = res.pageInfo.list
        for (const n in this.resourceData) {
          this.resourceData[n].parentName = idToName(this.parentOptions, this.resourceData[n].parentId)
        }
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
        this.resourceData = res.pageInfo.list
        for (const n in this.resourceData) {
          this.resourceData[n].parentName = idToName(this.parentOptions, this.resourceData[n].parentId)
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    saveResource() {
      this.saveDialogVisible = true
    },
    saveResourceData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.saveForm.parentId[this.saveForm.parentId.length - 1] * 1 >= 10) {
            this.saveForm.parentId = this.saveForm.parentId[this.saveForm.parentId.length - 1]
          }
          this.loading = true
          save(this.type, this.saveForm).then(res => {
            this.saveDialogVisible = false
            this.getResource()
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
    delResource(row) {
      this.deleteForm = []
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.type, this.deleteForm).then(res => {
          this.getResource()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    delSelectResource(row) {
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
            this.getResource()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    // 双击表格查看详情并修改功能
    dblclick(row, column, event) {
      this.updateResource(row)
    },
    updateResource(row) {
      this.loading = true
      getUpdateForm(this.type, row.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    updateSelectResource(row) {
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
        }).catch(() => {
          this.loading = false
        })
      }
    },
    updateResourceData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.type, this.updateForm).then(res => {
            this.updateDialogVisible = false
            this.getResource()
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
    NodeUpdate(treeData) {
      // 编辑节点
      this.loading = true
      getUpdateForm(this.type, treeData.DATA.id).then(res => {
        this.updateDialogVisible = true
        this.updateForm = res
        this.updateForm.parentId = res.parentId
        this.loading = false
      }).catch(() => {
        this.loading = true
      })
    },
    NodeDel(treeData) {
      // 删除节点
      if (treeData.DATA.children && treeData.DATA.children.length !== 0) {
        this.$message.error('303409：此节点有子级，不可删除！')
        return false
      } else {
        // 删除操作
        this.deleteForm[0] = treeData.DATA
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
          this.loading = true
          del(this.type, this.deleteForm).then(res => {
            this.getResource()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    NodeAdd(treeData) {
      // 新增节点
      console.log(treeData.NODE, treeData.DATA)
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
