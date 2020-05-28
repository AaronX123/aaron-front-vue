<template>
  <div class="dashboard-container">
    <el-container>
      <el-header v-if="showHeader" style="height:20%; width: 100%">
        <el-row>
          试卷名：
          <el-input v-model="condition.name" size="mini" style="width: 10%" />&nbsp;
          组卷人：
          <el-input v-model="condition.createdBy" size="mini" style="width: 10%" />&nbsp;
          难度：
          <el-select v-model="condition.difficulty" size="mini" clearable placeholder="请选择" style="width: 130px">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- <el-select
            v-model="condition.difficulty"
            placeholder="可选项"
            size="mini"
            style="width: 10%"
            value
          >
            &nbsp;
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>组卷时间: -->
          <el-date-picker
            v-model="combExamTimeSelect"
            size="mini"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions2"
          />&nbsp;
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        </el-row>
        <br>
        <el-row style="display: inline">
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(1)">删除</el-button>
          <el-button type="success" size="mini" icon="el-icon-edit" @click="handleModify(1)">修改</el-button>
          <el-button type="info" size="mini" icon="el-icon-info" @click="handleInfo(1)">详情</el-button>
        </el-row>
      </el-header>
      <!-- 默认显示试卷列表 -->
      <el-main v-if="show">
        <br>
        <el-card>
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="paperVos"
            style="width: 100%; height: 300px"
            :row-key="getRowKeys"
            @selection-change="handlePaperSelectionChange"
          >
            <el-table-column type="selection" :reserve-selection="true" width="45px" />
            <el-table-column prop="name" label="题目" />
            <el-table-column prop="paperCreator" label="组卷人" />
            <el-table-column prop="paperTypeValue" label="试卷类型" />
            <el-table-column prop="difficultyValue" label="试卷难度" />
            <el-table-column prop="combExamTime" label="组卷时间" :show-overflow-tooltip="true" />
            <el-table-column prop="score" label="试卷总分" />
            <el-table-column prop="description" label="试卷描述" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="150%">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="handleDelete(scope.row.id)"
                />
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  @click="handleModify(scope.row.id)"
                />
                <el-button
                  type="info"
                  icon="el-icon-info"
                  size="mini"
                  circle
                  @click="handleInfo(scope.row.id)"
                />
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <span class="demonstration" />
            <el-pagination
              background
              layout="prev, pager, next"
              :total="condition.total"
              :current-page="condition.currentPage"
              :page-size="condition.pageSize"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-main>
      <!-- 点击修改出现 -->
      <el-main v-if="showEdit">
        <el-row>
          <el-col :span="3">&nbsp;</el-col>
          <el-col :span="8">
            <el-row>
              试卷名：
              <el-input v-model="currentPaperVO.name" size="mini" />
            </el-row>
            <el-row>
              <span class="demonstration">试卷类型:</span>
              <el-select v-model="currentPaperVO.category" aria-required="true" size="mini" placeholder="请选择试卷类型">
                <el-option
                        v-for="item in paperTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                </el-option>
              </el-select>
            </el-row>
            组卷时间：
            <el-input v-model="currentPaperVO.combExamTime" size="mini" :disabled="true" />
            试卷描述：
            <el-input v-model="currentPaperVO.description" size="mini" />
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="8">
            组卷人：
            <el-input v-model="currentPaperVO.paperCreator" size="mini" :disabled="true" />
            难度：
            <el-select v-model="currentPaperVO.difficulty" size="mini" placeholder="请选择" style="width: 130px">
              <el-option
                      v-for="item in difficultyOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
              />
            </el-select>
            <br>
            试卷总分：
            <el-input v-model="currentPaperVO.score" size="mini" :disabled="true" />
          </el-col>
          <el-col :span="4">&nbsp;</el-col>
        </el-row>
        <el-row>
          <!-- 试卷详情 -->
          <paper-info :show-delete="true" :show-add="true"  :current-paper="currentPaperVO" :difficulty-options="difficultyOptions"
                      :subject-type-options="subjectTypeOptions" :category-options="categoryOptions"/>
          <!-- 添加试题 -->
          <el-dialog title="试题列表" :visible.sync="addDialog" width="30%">
            <el-table
              :data="subjectData"
              :row-key="getRowKeys"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" :reserve-selection="true" width="40" />
              <el-table-column property="subject" label="试题内容" width="150" />
            </el-table>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialog = false">取 消</el-button>
              <el-button type="primary" @click="handleSubjectAdded">确 定</el-button>
            </span>
          </el-dialog>
        </el-row>
        <br>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button type="danger" @click="backDialog = true">返回</el-button>
        <el-dialog title="提示" :visible.sync="backDialog" width="30%">
          <span>离开后填写内容将不会被保存，确认离开？</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="backDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleBack">确 定</el-button>
          </span>
        </el-dialog>
      </el-main>
      <!-- 试卷详情 -->
      <paper-info v-show="showPaper"  :current-paper="currentPaperVO" />

      <!-- <el-button type="text" @click="dialogTableVisible = true">打开嵌套表格的 Dialog</el-button>
      <el-dialog title="新增题目" :visible.sync="saveSubjectDialogVisible">
        <el-table :data="gridData">
          <el-table-column property="date" label="日期" width="150"></el-table-column>
          <el-table-column property="name" label="姓名" width="200"></el-table-column>
          <el-table-column property="address" label="地址"></el-table-column>
        </el-table>
      </el-dialog> -->
      <el-dialog
              :visible.sync="paperInfoLoading"
              width="10%"
      >
        正在加载中。。。
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
// import { queryDifficulty } from '@/api/basedata/dictionary.js'
// import { queryPaper } from '../../../api/paper/template'
import { getQueryList } from '@/utils/treeList'
import { querySubjectType } from '@/api/basedata/subjectType'
import { queryCategory } from '@/api/basedata/category'
import { queryDictionary } from '../../../api/basedata/dictionary'
import { deletePaper, modifyPaper, paperDetail, queryPaperWithCondition } from '../../../api/paper/maintain'
import PaperInfo from '@/components/paperInfo/index'
import { MessageBox, Message } from 'element-ui'
export default {
  name: 'Position',
  components: { PaperInfo },
  data() {
    return {
      addFormVisible: false,
      // 题目难度数据
      difficultyDataList: [],
      dictionaryDataSearch: {
        name: '题目难度'
      },
      saveSubjectDialogVisible: false,
      difficultyOptions: [],
      pickerOptions2: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      // 组卷查询日期区间,实际上是一个数组
      combExamTimeSelect: '',
      // 公司的试卷
      paperVos: [],
      showPaper: false,
      // 修改试卷
      currentPaperVO: {},
      subjectData: [
        {
          id: '92192152515',
          subject: 'String'
        },
        {
          id: '987823412',
          subject: 'Integer'
        }
      ],
      // 显示试卷表
      show: true,
      // 头部
      showHeader: true,
      // 选择框
      multipleSelection: [],
      select_order_number: '', // 表格select选中的条数
      select_orderId: [], // 表格select复选框选中的id
      // 显示修改区域
      showEdit: false,
      queryBody: {
        start: '',
        end: ''
      },
      backDialog: false,
      addDialog: false,

      // 查询属性
      condition: {
        name: '',
        createdBy: '',
        difficulty: '',
        start: '',
        end: '',
        currentPage: 1,
        pageSize: 5,
        total: 1
      },
        paperTypeDataSearch: {
            name: '试卷类型'
        },
        paperTypeOptions: [],
      loading: true,
      selected: '',
      subjectTypeOptions:[],
      subjectTypeDataSearch:{
        name:''
      },
      categoryOptions: [],
      categoryDataSearch:{
        name:''
      },
      paperInfoLoading: false
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    addSubject() {
        this.saveSubjectDialogVisible = true
    },
    // 获取 题目难度 选项信息
    getDifficultyOptions() {
      queryDictionary(this.dictionaryDataSearch).then(result => {
        this.difficultyDataList = result
        for (let i = 0; i < this.difficultyDataList.length; i++) {
          this.difficultyOptions[i] = {}
          this.difficultyOptions[i].label = this.difficultyDataList[i].value
          this.difficultyOptions[i].value = this.difficultyDataList[i].id
        }
      })
    },
    // 初始化页面
    init() {
      this.initPaper()
      this.initDifficulty()
      this.initPaperType()
      this.getCategoryOptions()
      this.getSubjectTypeOptions()
      //this.initCateogry()
    },
    initPaperType(){
      queryDictionary(this.paperTypeDataSearch).then(res => {
          for (let i = 0; i < res.length; i++) {
              this.paperTypeOptions[i] = {}
              this.paperTypeOptions[i].label = res[i].value
              this.paperTypeOptions[i].value = res[i].id
          }
      })
    },
    // initCateogry(){
    //     this.categoryIdOptions =
    // },
    // 初始化难度
    initDifficulty() {
      queryDictionary(this.dictionaryDataSearch).then(res => {
        for (let i = 0; i < res.length; i++) {
          this.difficultyOptions[i] = {}
          this.difficultyOptions[i].label = res[i].value
          this.difficultyOptions[i].value = res[i].id
        }
      })
    },
    // 获取 题目类别 选项信息
    getCategoryOptions() {
      queryCategory(this.categoryDataSearch).then(result => {
        this.categoryOptions = getQueryList(result)
      })
    },
    // 获取 题型 选项信息
    getSubjectTypeOptions() {
      querySubjectType(this.subjectTypeDataSearch).then(result => {
        for (let i = 0; i < result.length; i++) {
          this.subjectTypeOptions[i] = {}
          this.subjectTypeOptions[i].label = result[i].name
          this.subjectTypeOptions[i].value = result[i].id
        }
      })
    },
    // 刚进入时需要加载第一页
    initPaper() {
      this.show = true
      this.showHeader = true
      this.getPaperVo2(this.condition)
    },
    // 删除，从选择数组中取出id，将此id传给后端
    handleDelete(e) {
      console.log(this.selected)
      if (e === 1) {
        if (this.selected.length < 1) {
          Message({
            message: '请选择一项进行删除',
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.$confirm('确认删除吗？', '提示', {}).then(() => {
              this.loading = true
              const ids = []
              for (let i = 0; i < this.selected.length; i++) {
                  ids.push(this.selected[i].id)
              }
              deletePaper(ids).then(res => {
                  Message({
                    message: res,
                    type: 'error',
                    duration: 3 * 1000
                  })
                  //清空选项，项目中：请求接口后，重新请求数据渲染页面的时候，使用此方式，清空选中勾选状态。
                  this.$refs.multipleTable.clearSelection();
                  this.initPaper()
              }).catch(e=>{
                  Message({
                    message: e,
                    type: 'error',
                    duration: 3 * 1000
                  })
                  //清空选项，项目中：请求接口后，重新请求数据渲染页面的时候，使用此方式，清空选中勾选状态。
                  this.$refs.multipleTable.clearSelection();
                  this.initPaper()
                  this.loading = false
              })
          }).catch(() => {
              this.loading = false
          })

      }
      } else {
        this.$confirm('确认删除吗？', '提示', {}).then(() => {
            this.loading = true
            const ids = []
            ids.push(e)
            deletePaper(ids).then(res => {
                this.initPaper()
                this.loading = false
            }).catch(e=>{
                this.initPaper()
                this.loading = false
            })
        }).catch(() => {
            this.loading = false
        })
      }

    },
    handleModify(e) {
      if (e === 1) {
        if (this.selected.length !== 1) {
          Message({
            message: '必须且仅只能选择一条',
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.show = false
          this.showHeader = false
          this.addDialog = false
          this.showPaper = false
          this.paperInfoLoading = true
          this.showPaper = false
          paperDetail(this.selected[0].id).then(res => {
            this.currentPaperVO = res
            this.showEdit = true
            this.paperInfoLoading = false
          }).catch(e=>{
            this.paperInfoLoading = false
          })
        }
      } else {
        this.show = false
        this.showHeader = false
        this.addDialog = false
        this.showPaper = false
        this.paperInfoLoading = true
        paperDetail(e).then(res => {
          console.log(res)
          this.currentPaperVO = res
          this.showEdit = true
          this.paperInfoLoading = false
        }).catch(e=>{
            this.paperInfoLoading = false
        })
      }
    },
    handleInfo(e) {
      if (e === 1) {
        if (this.selected.length !== 1) {
          Message({
            message: '必须且仅选择一份试卷',
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.paperInfoLoading = true
          paperDetail(this.selected[0].id).then(res => {
            this.currentPaperVO = res
            this.paperInfoLoading = false
            this.showPaper = true
          }).catch(e=>{
            this.paperInfoLoading = false
          })
        }
      } else {
        this.paperInfoLoading = true
        paperDetail(e).then(res => {
          this.currentPaperVO = res
          this.showPaper = true
          this.paperInfoLoading = false
        })
      }
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
    // handleSubjectDelete(e) {
    //     //这里删除id为**的数据 这不是同步的码？？？自己写自己写！
    //   this.currentPaperVO.currentPaperSubjectVO.forEach(function(item, index, arr) {
    //     if (item.id === e) {
    //       alert(item)
    //       console.info(item)
    //       arr.splice(index, 1)
    //     }
    //   })
    // },
    handleSubjectAdd() {
      this.addDialog = true
    },
    handleSave() {
        if (this.currentPaperVO.name === ''){
          Message({
            message: '请输入试卷名称',
            type: 'error',
            duration: 3 * 1000
          })
        }
      // 将currentPaperVO发送给试卷服务
      modifyPaper(this.currentPaperVO).then(res=>{
          this.showEdit = false
          this.initPaper()
      }).catch(res=>{
          this.showEdit = false
          this.initPaper()
      })
    },
    handleBack() {
      this.backDialog = false
      this.showEdit = false
      this.show = true
      this.showHeader = true
      this.selected = ''
    },
    handleSubjectAdded() {
      console.log(this.multipleSelection)
      // 从基础数据服务中获取这些id所对应的数据然后添加到currentPaperSubjectVO
    },
    handleQueryPaper() {
      if (this.combExamTimeSelect !== '' || this.combExamTimeSelect !== null) {
        this.condition.start = this.combExamTimeSelect[0]
        this.condition.end = this.combExamTimeSelect[1]
      }
      this.getPaperVo2(this.condition)
    },
    handleQuery() {
        this.loading = true
      if (this.combExamTimeSelect !== '' || this.combExamTimeSelect !== null) {
        this.condition.start = this.combExamTimeSelect[0]
        this.condition.end = this.combExamTimeSelect[1]
      }
      this.getPaperVo2(this.condition)
    },
    getPaperVo2(e) {
      queryPaperWithCondition(e).then(res => {
        this.paperVos = res.paperVO
        this.condition.total = res.total
        this.loading = false
      })
    },
    handleCurrentChange(currentPage) {
      this.condition.currentPage = currentPage
      this.loading = true
      queryPaperWithCondition(this.condition).then(res => {
        this.paperVos = res.paperVO
        this.condition.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handlePaperSelectionChange(selection) {
      this.selected = selection
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
