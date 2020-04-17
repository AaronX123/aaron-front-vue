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
              :is-hidden-update="true"
              :is-hidden-delete="true"
              @NodeAdd="NodeAdd"
      />
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="参数类型：">
                <el-select v-model="queryForm.paramType" size="mini" clearable placeholder="请选择" style="width: 120px">
                  <el-option
                          v-for="item in paramTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="输入参数项：">
                <el-input v-model="queryForm.param" size="mini" style="width: 120px" placeholder="请输入" />
              </el-form-item>
              <el-form-item>
                <perms-button perms="querySystemParam" label="查询" @click="queryParam" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="success" perms="saveSystemParam" label="增加" icon="el-icon-plus" @click="saveParam()" />
            <perms-button type="danger" perms="deleteSystemParam" label="删除" icon="el-icon-delete" @click="delSelectParam()" />
            <perms-button type="warning" perms="updateSystemParam" label="修改" icon="el-icon-edit" @click="updateSelectParam()" />
            <perms-button perms="" icon="el-icon-upload" label="导入" @click="handleImport" />
            <perms-button perms="" icon="el-icon-download" label="导出" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
                  stripe
                  :data="systemParamData"
                  border
                  style="width: 100%"
                  :row-key="getRowKeys"
                  @selection-change="handleSelectionChange"
                  @row-dblclick="dblclick"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="paramTypeName" label="选择参数类型" sortable align="center" />
            <el-table-column prop="param" label="输入参数项" align="center" />
            <el-table-column prop="value" label="参数值" align="center" />
            <el-table-column prop="status" label="是否启用" sortable align="center" />
            <el-table-column label="操作" width="210" align="center">
              <template slot-scope="scope">
                <perms-button type="success" icon="el-icon-plus" perms="saveSystemParam" circle @click="saveParam()" />
                <perms-button type="danger" icon="el-icon-delete" perms="deleteSystemParam" circle @click="delParam(scope.row)" />
                <perms-button type="warning" icon="el-icon-edit" perms="updateSystemParam" circle @click="updateParam(scope.row)" />
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
    <el-dialog :visible.sync="saveDialogVisible" title="新增参数" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">参数基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="saveForm" :model="saveForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="参数类型：" prop="paramType">
          <el-select v-model="saveForm.paramType" size="mini" placeholder="请选择" style="width: 200px">
            <el-option
                    v-for="item in paramTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="参数项：" prop="param">
          <el-input v-model="saveForm.param" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="参数值：" prop="value">
          <el-input v-model="saveForm.value" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="saveForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="saveSystemParam" label="确 定" @click="saveParamData('saveForm')" />
        <el-button size="mini" @click="saveDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="updateDialogVisible" title="修改参数" :close-on-click-modal="false" center width="500px">
      <el-header style="height: 5px">
        <i class="el-icon-user" style="float: left">参数基本信息</i>
      </el-header>
      <el-divider style="margin: 10px 0px" />
      <el-form ref="updateForm" :model="updateForm" label-width="100px" size="mini" inline :rules="FormRules">
        <el-form-item label="参数类型：" prop="paramType">
          <el-select v-model="updateForm.paramType" size="mini" placeholder="请选择" style="width: 120px">
            <el-option
                    v-for="item in paramTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="参数项：" prop="param">
          <el-input v-model="updateForm.param" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="参数值：" prop="value">
          <el-input v-model="updateForm.value" style="width: 200px" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用：" prop="status">
          <el-radio-group v-model="updateForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <perms-button perms="updateSystemParam" label="确 定" @click="updateParamData('updateForm')" />
        <el-button size="mini" @click="updateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <!--导入窗口-->
    <el-dialog title="导入窗口" width="400px" :visible.sync="importFormVisible" :close-on-click-modal="false">
      <el-form ref="importForm" inline :model="importForm" label-width="80px">
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
          <div style="align:center"><perms-button perms="" label="点击上传" center /></div>
          <div slot="tip" class="el-upload__tip">只能上传 xlsx / xls 文件，且不超过1M</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <perms-button perms="" label="提交" @click="importSubmit" />
        <el-button @click="importFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import { save, del, update, getUpdateForm, query } from '@/api/user/userCommon'
    import { getTreeList } from '@/utils/treeList'
    import { queryDictionary } from '@/api/basedata/dictionary'
    import tree from '@/components/Tree/index'
    import PermsButton from '@/components/PermsButton/index'
    import Pagination from '@/components/Pagination/index'
    import loading from '@/components/Loading/index'
    export default {
        name: 'Position',
        components: { tree, PermsButton, loading, Pagination },
        data() {
            return {
                // options之上都为树要用的类，不用树可以删去
                DATA: null,
                NODE: null,
                isLoadingTree: true, // 是否加载节点树
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                dictionaryDataSearch: {
                    name: '参数类型'
                },
                menuVisible: false,
                objectID: null,
                parentOptions: [],
                paramTypeOptions: [],
                treeData: [],
                treeListData: {},
                setTree: [],
                setQuery: [],
                systemParamData: [],
                show: true,
                queryForm: {
                    paramType: '',
                    param: '',
                    pageSize: 10,
                    currentPage: 1
                },
                FormRules: {
                    paramType: [{ required: true, message: '请输入参数类型', trigger: 'blur' }],
                    param: [{ required: true, message: '请输入参数项', trigger: 'blur' }],
                    value: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
                    status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
                },
                saveForm: {
                    id: '',
                    paramType: '',
                    param: '',
                    value: '',
                    status: 1
                },
                updateForm: {
                    id: '',
                    paramType: '',
                    param: '',
                    value: '',
                    status: ''
                },
                loading: false,
                total: 0,
                pageSize: 10,
                type: 'SystemParam',
                treeName: '参数管理',
                deleteForm: [],
                multipleSelection: [],
                // 表格select选中的条数
                select_order_number: '',
                // 表格select复选框选中的id
                select_orderId: [],
                saveDialogVisible: false,
                deleteDialogVisible: false,
                updateDialogVisible: false,
                // 导入窗口显示
                importFormVisible: false,
                // 文件上传List
                fileList: [],
                importForm: []
            }
        },
        mounted() {
            this.getParam()
            this.getParamTypeOptions()
        },
        methods: {
            getParam() {
                this.loading = true
                query(this.type, this.queryForm).then(res => {
                    this.systemParamData = res.pageInfo.list
                    this.total = res.total
                    for (const n in res) {
                        this.treeListData[n] = []
                        this.treeListData[n].id = res.pageInfo.list[n].paramType
                        this.treeListData[n].name = res.pageInfo.list[n].paramTypeName
                    }
                    this.setTree = getTreeList(this.treeListData)
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            },
            querySystemParam() {
                this.loading = true
                query(this.type, this.queryForm).then(res => {
                    this.systemParamData = res.pageInfo.list
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            },
            saveParam() {
                this.saveDialogVisible = true
            },
            saveParamData(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true
                        save(this.type, this.saveForm).then(res => {
                            this.saveDialogVisible = false
                            this.getParam()
                            this.$nextTick(() => {
                                this.$refs['saveForm'].resetFields()
                            })
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
            queryParam() {
                this.loading = true
                query(this.type, this.queryForm).then(res => {
                    this.systemParamData = res.pageInfo.list
                    this.total = res.total
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            },
            delParam(row) {
                this.deleteForm = []
                this.deleteForm[0] = row
                this.$confirm('确认删除吗？', '提示', {}).then(() => {
                    this.loading = true
                    del(this.type, this.deleteForm).then(res => {
                        this.getParam()
                        this.loading = false
                    }).catch(() => {
                        this.loading = false
                    })
                })
            },
            delSelectParam(row) {
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
                            this.getParam()
                            this.loading = false
                        }).catch(() => {
                            this.loading = false
                        })
                    })
                }
            },
            // 双击表格查看详情并修改功能
            dblclick(row, column, event) {
                this.updateParam(row)
            },
            updateParam(row) {
                this.loading = true
                getUpdateForm(this.type, row.id).then(res => {
                    this.updateDialogVisible = true
                    this.updateForm = res
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            },
            updateSelectParam(row) {
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
            updateParamData(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true
                        update(this.type, this.updateForm).then(res => {
                            this.updateDialogVisible = false
                            this.getParam()
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
            // 获取 参数类型信息
            getParamTypeOptions() {
                queryDictionary(this.dictionaryDataSearch).then(result => {
                    this.paramTypeDataList = result
                    this.loading = true
                    for (let i = 0; i < this.paramTypeDataList.length; i++) {
                        this.paramTypeOptions[i] = {}
                        this.paramTypeOptions[i].label = this.paramTypeDataList[i].value
                        this.paramTypeOptions[i].value = this.paramTypeDataList[i].id
                    }
                    this.loading = false
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
            handleCurrentChange(currentPage) {
                this.queryForm.currentPage = currentPage
                this.loading = true
                query(this.type, this.queryForm).then(res => {
                    this.systemParamData = res.pageInfo.list
                    this.loading = false
                }).catch(() => {
                    this.loading = false
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
            NodeDel(treeData) {
                // 删除节点
                if (treeData.DATA.children && treeData.DATA.children.length !== 0) {
                    this.$message.error('此节点有子级，不可删除！')
                    return false
                } else {
                    // 删除操作
                    this.deleteForm[0] = treeData.DATA
                    this.loading = true
                    del(this.type, this.deleteForm).then(res => {
                        this.getParam()
                        this.loading = false
                    }).catch(() => {
                        this.loading = false
                    })
                }
            },
            NodeAdd(treeData) {
                // 新增节点
                // 判断层级
                if (treeData.NODE.level >= 3) {
                    this.$message.error('最多只支持三级！')
                    return false
                }
                // 新增数据
                treeData.DATA.children.push({
                    id: ++this.maxxpandId,
                    name: '新增节点',
                    pid: treeData.DATA.id,
                    children: []
                })
                // 同时展开节点
                if (!treeData.NODE.expanded) {
                    treeData.NODE.expanded = true
                }
            },
            importSubmit() {}
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
