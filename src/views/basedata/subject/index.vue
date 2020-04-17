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
            <el-form-item label="题目：">
              <el-input v-model="queryForm.name" size="mini" placeholder="请输入" style="width: 130px" />
            </el-form-item>
            <el-form-item label="题目分类：" prop="categorySelectOption">
              <el-cascader v-model="queryForm.categorySelectOption" size="mini" :options="categoryOptions" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 130px" />
            </el-form-item>
            <el-form-item label="选择题型：" prop="subjectTypeId">
              <el-select v-model="queryForm.subjectTypeId" size="mini" clearable placeholder="请选择" style="width: 130px">
                <el-option
                  v-for="item in subjectTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择难度：">
              <el-select v-model="queryForm.difficulty" size="mini" clearable placeholder="请选择" style="width: 130px">
                <el-option
                  v-for="item in difficultyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <perms-button perms="querySubject" type="primary" size="mini" label="查询" @click="querySubjectList" />
            </el-form-item>
          </el-form>
        </el-row>
        <!-- 按钮 -->
        <el-row style="display: inline">
          <perms-button perms="saveSubject" type="success" icon="el-icon-plus" label="增加" @click="addSubject" />
          <perms-button perms="deleteSubjectList" type="danger" icon="el-icon-delete" label="删除" @click="deleteSubjectList" />
          <perms-button perms="updateSubject" type="warning" icon="el-icon-edit" label="修改" @click="editSelectSubject(selectList[0])" />
          <perms-button perms="importSubject" type="primary" icon="el-icon-upload" label="导入" @click="handleImport" />
          <perms-button perms="exportSubject" type="primary" icon="el-icon-download" label="导出" />
        </el-row>
      </el-header>
      <!-- 表格 -->
      <el-main v-if="show">
        <el-table v-loading="loading" :data="subjectDataList" border stripe style="width: 100%" @selection-change="selectChange" @row-dblclick="dblclick">
          <el-table-column v-model="editRow" type="selection" width="40%" />
          <!-- 索引 -->
          <el-table-column prop="name" label="题目" :show-overflow-tooltip="true" />
          <el-table-column prop="subjectTypeName" label="题目类型" />
          <el-table-column prop="categoryName" label="题目分类" />
          <el-table-column prop="difficultyName" label="难度" />
          <el-table-column prop="updatedTime" label="更新时间" />
          <el-table-column prop="status" label="启用标记" :formatter="statusFormatter" />
          <!-- 操作按钮 -->
          <el-table-column fixed="right" label="操作" width="150%">
            <template slot-scope="scope">
              <perms-button perms="saveSubject" type="success" icon="el-icon-plus" circle @click="addSubject" />
              <perms-button perms="deleteSubjectList" type="danger" icon="el-icon-delete" circle @click="deleteSubject(scope.row)" />
              <perms-button perms="updateSubject" type="warning" icon="el-icon-edit" circle @click="editSubject(scope.row)" />
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
    <el-dialog title="增加题目信息" width="550px" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form ref="addForm" :inline="true" :model="addForm" label-width="100px" :rules="FormRules">
        <el-form-item label="题目类别：" prop="categorySelectOption">
          <el-cascader v-model="addForm.categorySelectOption" :options="categoryOptions" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 350px" />
        </el-form-item>
        <el-form-item label="题型：" prop="subjectTypeId">
          <el-select v-model="addForm.subjectTypeId" clearable placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in subjectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-select v-model="addForm.difficulty" clearable placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目：" prop="name">
          <el-input v-model="addForm.name" type="textarea" :rows="3" auto-complete="off" style="width: 350px" />
        </el-form-item>
        <!-- 答案信息添加 -->
        <el-row>
          <el-form-item label="答案：">
            <el-link type="primary" @click="addAnswer">+ 添加答案</el-link>
          </el-form-item>
          <el-form-item
            v-for="(answer, index) in answerList"
            :key="answer.key"
            :label="'答案' + addOption[index]"
            :prop="'answer'"
          >
            <el-input v-model="answer.value" />
            <el-checkbox v-model="answer.rightAnswer">是否正确答案</el-checkbox>&nbsp;&nbsp;&nbsp;
            <perms-button perms="deleteSubject" type="primary" label="删除" @click="removeAnswer(answer)" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="是否启用" prop="status">
            <el-radio v-model="addForm.status" label="1">是</el-radio>
            <el-radio v-model="addForm.status" label="0">否</el-radio>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="addForm.remark" type="textarea" :rows="4" auto-complete="off" style="width: 350px" />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <perms-button perms="saveSubject" type="primary" label="提交" @click="addSubmit('addForm')" />
        <el-button @click="addFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- 修改窗口 -->
    <el-dialog title="修改题目信息" width="550px" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form ref="editForm" :inline="true" :model="editForm" label-width="100px" :rules="FormRules">
        <el-form-item label="题目类别：" prop="categorySelectOption">
          <el-cascader v-model="editForm.categorySelectOption" :options="categoryOptions" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 350px" />
        </el-form-item>
        <el-form-item label="题型：" prop="subjectTypeId">
          <el-select v-model="editForm.subjectTypeId" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in subjectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-select v-model="editForm.difficulty" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目：" prop="name">
          <el-input v-model="editForm.name" type="textarea" :rows="3" auto-complete="off" style="width: 350px" />
        </el-form-item>
        <!-- 修改窗口 答案信息添加 -->
        <el-row>
          <el-form-item label="答案：" prop="answer">
            <el-link type="primary" @click="addAnswer">+ 添加答案</el-link>
          </el-form-item>
          <el-form-item
            v-for="(answer, index) in answerList"
            :key="answer.key"
            :label="'答案' + addOption[index]"
            :rules="{
              required: true, message: '答案不能为空', trigger: 'blur'
            }"
          >
            <el-input v-model="answer.value" />
            <el-checkbox v-model="answer.rightAnswer">是否正确答案</el-checkbox>&nbsp;&nbsp;&nbsp;
            <perms-button perms="deleteSubject" type="primary" label="删除" @click="removeAnswer(answer)" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="是否启用" prop="status">
            <el-radio-group v-model="editForm.status">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="备注信息" prop="comment">
            <el-input v-model="editForm.remark" type="textarea" :rows="4" auto-complete="off" style="width: 350px" />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <perms-button perms="updateSubject" type="primary" label="提交" @click="editSubmit('editForm')" />
        <el-button @click="editFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!--导入窗口-->
    <el-dialog title="导入窗口" width="400px" :visible.sync="importFormVisible" :close-on-click-modal="false">
      <el-form :inline="true" label-width="80px">
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
        <el-button type="primary">提交</el-button>
        <el-button @click="importFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { query, save, update, del, queryAnswer } from '@/api/basedata/subject'
import { querySubjectType } from '@/api/basedata/subjectType'
import { queryCategory } from '@/api/basedata/category'
import { getQueryList } from '@/utils/treeList'
import { queryDictionary } from '@/api/basedata/dictionary'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'Subject',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      // 题目数据
      subjectDataList: [],
      // 题目类型数据
      subjectTypeDataList: [],
      subjectTypeDataSearch: {
        id: ''
      },
      // 题目类别数据
      categoryDataList: [],
      categoryDataSearch: {
        id: ''
      },
      // 题目难度数据
      difficultyDataList: [],
      dictionaryDataSearch: {
        name: '题目难度'
      },
      // 答案添加对应的序号
      addOption: ['A', 'B', 'C', 'D', 'E'],
      // 导入窗口显示
      importFormVisible: false,
      // 文件上传List
      fileList: [],
      //  搜索区域参数
      queryForm: {
        categoryId: '',
        subjectTypeId: '',
        difficulty: '',
        name: '',
        categorySelectOption: '',
        pageSize: 7,
        currentPage: 1
      },
      //  搜索区域参数
      queryAnswerForm: {
        subjectId: ''
      },
      loading: true,
      show: true,
      //  新增界面是否显示
      addFormVisible: false,
      addSubmitForm: [],
      addForm: {
        name: '',
        categoryId: '',
        subjectTypeId: '',
        difficulty: '',
        status: 1,
        remark: '',
        subjectAnswerVOList: [],
        categorySelectOption: ''
      },
      // 答案列表
      answerList: [{
        value: '',
        rightAnswer: false
      }],
      //  批量选中data
      selectList: [],
      //  表单规则
      FormRules: {
        name: [{ required: true, message: '请输入题目', trigger: 'blur' }],
        categorySelectOption: [{ required: true, message: '请选择题目类别', trigger: 'blur' }],
        subjectTypeId: [{ required: true, message: '请选择题目类型', trigger: 'blur' }],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }],
        // answer: [{ required: true, message: '请填写答案', trigger: 'blur' }],
        difficulty: [{ required: true, message: '请选择难度', trigger: 'blur' }]
      },
      //  编辑界面是否显示
      editFormVisible: false,
      //  编辑界面row
      editRow: '',
      editForm: {
        subjectId: '',
        name: '',
        categoryId: '',
        categoryName: '',
        subjectTypeId: '',
        subjectTypeName: '',
        difficulty: '',
        status: '',
        remark: '',
        subjectAnswerVOList: [],
        categorySelectOption: ''
      },
      //  删除所用的数据
      deleteForm: [],
      // 题目类别下拉框的选项
      categoryOptions: [],
      // 题型下拉框的选项
      subjectTypeOptions: [],
      // 题目难度下拉框的选项
      difficultyOptions: [],
      // 分页数据
      total: 1,
      // 修改时获得的答案数据
      answerData: {
        value: '',
        rightAnswer: false
      },
      addAnswerData: {
        answer: '',
        rightAnswer: ''
      }
    }
  },
  mounted() {
    //  初始加载
    this.getSubjectList()
  },
  created() {
    this.getSubjectTypeOptions()
    this.getCategoryOptions()
    this.getDifficultyOptions()
  },
  methods: {
    // 模糊查询
    querySubjectList() {
      if (this.queryForm.categorySelectOption !== null) {
        this.queryForm.categoryId = this.queryForm.categorySelectOption[this.queryForm.categorySelectOption.length - 1]
      }
      query(this.queryForm).then(res => {
        this.loading = false
        this.subjectDataList = res.pageInfo.list
        this.total = res.total
      }).catch(() => {
        this.loading = false
      })
    },
    // 获取题目列表
    getSubjectList() {
      this.loading = true
      query(this.queryForm).then(res => {
        this.subjectDataList = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 获取 题型 选项信息
    getSubjectTypeOptions() {
      this.loading = true
      querySubjectType(this.subjectTypeDataSearch).then(result => {
        this.subjectTypeDataList = result
        for (let i = 0; i < this.subjectTypeDataList.length; i++) {
          this.subjectTypeOptions[i] = {}
          this.subjectTypeOptions[i].label = this.subjectTypeDataList[i].name
          this.subjectTypeOptions[i].value = this.subjectTypeDataList[i].id
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 获取 题目类别 选项信息
    getCategoryOptions() {
      this.loading = true
      queryCategory(this.categoryDataSearch).then(result => {
        this.categoryDataList = result
        this.categoryOptions = getQueryList(this.categoryDataList)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 获取 题目难度 选项信息
    getDifficultyOptions() {
      this.loading = true
      queryDictionary(this.dictionaryDataSearch).then(result => {
        this.difficultyDataList = result
        for (let i = 0; i < this.difficultyDataList.length; i++) {
          this.difficultyOptions[i] = {}
          this.difficultyOptions[i].label = this.difficultyDataList[i].value
          this.difficultyOptions[i].value = this.difficultyDataList[i].id
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    //  清空表单方法
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 添加 答案 信息
    addAnswer() {
      if (this.answerList.length >= 5) {
        this.$message({
          message: '答案不能超过5个！',
          type: 'warning'
        })
        return
      }
      this.answerList.push({
        value: '',
        rightAnswer: false,
        key: Date.now()
      })
    },
    // 删除 答案 信息
    removeAnswer(item) {
      if (this.answerList.length <= 1) {
        this.$message({
          message: '答案不能少于一个！',
          type: 'warning'
        })
        return
      }
      var index = this.answerList.indexOf(item)
      if (index !== -1) {
        this.answerList.splice(index, 1)
      }
    },
    // 显示添加页面
    addSubject() {
      this.answerList = []
      this.addForm.categoryId = ''
      this.addForm.subjectTypeId = ''
      this.addForm.difficulty = ''
      this.addForm.name = ''
      this.addForm.remark = ''
      this.addForm.status = '1'
      this.addForm.categorySelectOption = []
      this.addFormVisible = true
    },

    addSubmit: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 判断是否填写了正确答案
          let hasAnswer = 0
          for (let i = 0; i < this.answerList.length; i++) {
            if (this.answerList[i].rightAnswer === true) {
              hasAnswer = 1
            }
          }
          if (hasAnswer === 0) {
            this.$message({
              message: '必须有一个正确答案！',
              type: 'warning'
            })
            return
          }
          // 将答案列表赋值给提交表
          // this.answerList.forEach((item, index) => {
          //   const params = JSON.parse(JSON.stringify(this.addForm))
          //   // const addAnswerList = []
          //   // addAnswerList.answer = item.value
          //   // if (item.rightAnswer === true) {
          //   //   addAnswerList.rightAnswer = '1'
          //   // } else {
          //   //   addAnswerList.rightAnswer = '0'
          //   // }
          //   // params.subjectAnswerVOList.push(addAnswerList)
          //   params.answer = item.value
          //   if (item.rightAnswer === true) {
          //     params.rightAnswer = '1'
          //   } else {
          //     params.rightAnswer = '0'
          //   }
          //   params.categoryId = this.addCategorySelectOption[this.addCategorySelectOption.length - 1]
          //   this.addSubmitForm.push(params)
          // })
          // 将答案列表赋值给提交表
          this.addForm.categoryId = this.addForm.categorySelectOption[this.addForm.categorySelectOption.length - 1]
          this.addForm.subjectAnswerVOList = []
          this.answerList.forEach((item, index) => {
            const params = JSON.parse(JSON.stringify(this.addAnswerData))
            params.answer = item.value
            if (item.rightAnswer === true) {
              params.rightAnswer = '1'
            } else {
              params.rightAnswer = '0'
            }
            this.addForm.subjectAnswerVOList.push(params)
          })
          this.loading = true
          save(this.addForm).then(res => {
            this.$message({
              message: '添加成功',
              type: 'success'
            })
            this.$nextTick(() => {
              this.$refs['addForm'].resetFields()
            })
            this.queryForm.currentPage = 1
            this.getSubjectList()
            this.addFormVisible = false
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
    // 双击显示详情
    dblclick(row, column, event) {
      this.editSubject(row)
    },
    // 顶部的编辑按钮
    editSelectSubject(row) {
      if (this.selectList.length > 1) {
        this.$message({
          message: '不可多条修改',
          type: 'warning'
        })
      } else if (this.selectList.length === 0) {
        this.$message({
          message: '请选中一条进行修改',
          type: 'warning'
        })
      } else {
        this.editSubject(row)
      }
    },
    //  显示编辑界面
    editSubject: function(row) {
      // this.editForm.difficulty = row.difficulty
      this.editForm = row
      this.editForm.categorySelectOption = this.editForm.categoryId
      this.queryAnswerForm.subjectId = row.id
      this.answerList = []
      this.loading = true
      queryAnswer(this.queryAnswerForm).then(res => {
        res.forEach((item, index) => {
          const params = JSON.parse(JSON.stringify(this.answerData))
          params.value = item.answer
          if (item.rightAnswer === 1) {
            params.rightAnswer = true
          }
          if (item.rightAnswer === 0) {
            params.rightAnswer = false
          }
          this.answerList.push(params)
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
      this.editFormVisible = true
    },

    editSubmit: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 判断是否有一个正确答案
          let hasAnswer = 0
          for (let i = 0; i < this.answerList.length; i++) {
            if (this.answerList[i].rightAnswer === true) {
              hasAnswer = 1
            }
          }
          if (hasAnswer === 0) {
            this.$message({
              message: '必须有一个正确答案！',
              type: 'warning'
            })
            return
          }
          if (this.editForm.categorySelectOption[this.editForm.categorySelectOption.length - 1] * 1 < 10) {
            this.editForm.categoryId = this.editForm.categorySelectOption
          } else {
            this.editForm.categoryId = this.editForm.categorySelectOption[this.editForm.categorySelectOption.length - 1]
          }
          this.editForm.subjectAnswerVOList = []
          this.answerList.forEach((item, index) => {
            const params = JSON.parse(JSON.stringify(this.addAnswerData))
            params.answer = item.value
            if (item.rightAnswer === true) {
              params.rightAnswer = '1'
            } else {
              params.rightAnswer = '0'
            }
            this.editForm.subjectAnswerVOList.push(params)
          })
          // this.editSubmitForm = []
          // this.answerList.forEach((item, index) => {
          //   const params = JSON.parse(JSON.stringify(this.editForm))
          //   params.answer = item.value
          //   if (item.rightAnswer === true) {
          //     params.rightAnswer = '1'
          //   } else {
          //     params.rightAnswer = '0'
          //   }
          //   params.categoryId = this.editCategorySelectOption[this.editCategorySelectOption.length - 1]
          //   this.editSubmitForm.push(params)
          // })
          this.loading = true
          update(this.editForm).then(res => {
            this.getSubjectList()
            this.editFormVisible = false
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

    //  table序号
    indexMethod(index) {
      return index + 1
    },
    //  批量选中
    selectChange: function(val) {
      this.selectList = val
    },
    //  删除单条
    deleteSubject(row) {
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getSubjectList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    //  批量删除
    deleteSubjectList: function() {
      if (this.selectList.length === 0) {
        this.$message({
          message: '至少选择一条数据删除！',
          type: 'warning'
        })
        return false
      }
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.deleteForm = this.selectList
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getSubjectList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
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
    // 分页
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.subjectDataList = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格的状态列转化成是否
    statusFormatter: function(row) {
      return row.status === 1 ? '是' : '否'
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
