<template>
  <div class="dashboard-container">
    <el-container>
      <el-header style="height:40px; width: 100%">
        <el-row v-if="showSelectBar" style="height:40px">
          <el-form inline style="float: left">
            <el-form-item label="试卷名：">
              <el-input v-model="condition.name" size="mini" style="width: 130px" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="组卷人：">
              <el-input v-model="condition.createdBy" size="mini" style="width: 130px" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="难度：">
              <el-select v-model="condition.difficulty" size="mini" clearable placeholder="请选择" style="width: 130px">
                <el-option
                  v-for="item in difficultyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="组卷时间">
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
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
            </el-form-item>
          </el-form>
        </el-row>
      </el-header>
      <br>
      <el-row v-if="showNav" style="display: inline">
        <el-button type="success" size="mini" icon="el-icon-document" @click="handleFastGen">快速组卷</el-button>
        <el-button type="primary" size="mini" icon="el-icon-document" @click="normalGen">标准组卷</el-button>
        <el-button type="warning" size="mini" icon="el-icon-document" @click="handleTemplateGen">模版组卷</el-button>
        <el-button v-if="showPaperInf2" type="info" size="mini" icon="el-icon-info" @click="showPaperInfo(1)">试卷详情</el-button>
        <el-button v-if="showReturn" type="info" size="mini" icon="el-icon-info" @click="returnParent">返回上级</el-button>
      </el-row>
      <!-- 默认显示试卷列表 -->
      <el-main v-if="show">
        <br>
        <el-card>
          <el-table v-loading="loading" :data="paperVos" style="height: 300px" @selection-change="handlePaperSelectionChange">
            <el-table-column type="selection" width="30%" />
            <el-table-column prop="name" label="试卷名" />
            <el-table-column prop="paperCreator" label="组卷人" />
            <el-table-column prop="paperTypeValue" label="试卷类型" />
            <el-table-column prop="difficultyValue" label="试卷难度" />
            <el-table-column prop="combExamTime" label="组卷时间" :show-overflow-tooltip="true" />
            <el-table-column prop="score" label="试卷总分" />
            <el-table-column prop="description" label="试卷描述" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="180%">
              <template slot-scope="scope">
                <el-button type="success" icon="el-icon-document" size="mini" circle @click="handleFastGen" />
                <el-button type="primary" icon="el-icon-document" size="mini" circle @click="normalGen" />
                <el-button type="warning" icon="el-icon-document" size="mini" circle @click="handleTemplateGen" />
                <el-button type="danger" icon="el-icon-info" size="mini" circle @click="showPaperInfo(scope.row.id)" />
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
      <paper-info v-if="showPaperInf" :current-paper="currentPaperVO" />
      <!-- 点击快速组卷后显示此部分  组卷配置 -->
      <el-main v-if="showFastGen">
          <br>
          <el-card>
            <el-table :v-loading="loading" :data="combExamConfigVos">
              <el-table-column type="selection" width="30%" />
              <el-table-column label="配置项" prop="name"/>
              <el-table-column prop="difficultyName" label="难度" />
              <el-table-column prop="updatedByName" label="修改人" />
              <el-table-column prop="updatedTime" label="修改时间" sortable=""/>
              <el-table-column prop="company" label="公司" />
              <el-table-column prop="remark" label="备注" />
              <el-table-column label="操作" width="150%">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-document" size="mini" circle @click="selectCreateFastGen(scope.row)" />
                  <el-button type="warning" icon="el-icon-edit" size="mini" circle @click="handleEditConfig(scope.row)" />
                  <el-button type="info" icon="el-icon-info" size="mini" circle @click="handleInfo(scope.row.id)" />
                  <!--<el-button type="success" icon="el-icon-edit" size="mini" circle @click="handleEditConfig(scope.row.id)"></el-button>-->
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next"
              :total="fastGenQueryForm.total"
              :current-page="fastGenQueryForm.currentPage"
              :page-size="fastGenQueryForm.pageSize"
              @current-change="handleCurrentChange2"
            />
          </el-card>
          <el-dialog
            title="确认试卷信息"
            :visible.sync="paperTypeDialog"
            width="30%"
            >
            <span class="demonstration">试卷名称:</span>
            <el-input style="width: 20%" v-model="selectedCombExamConfigVO.name"></el-input>
            <span class="demonstration">试卷类型:</span>
            <el-select v-model="selectedCombExamConfigVO.paperType" placeholder="请选择试卷类型">
              <el-option
                v-for="item in paperTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <span slot="footer" class="dialog-footer">
              <el-button @click="paperTypeDialog = false">取 消</el-button>
              <el-button type="primary" @click="createFastGen()">确 定</el-button>
            </span>
          </el-dialog>
      </el-main>
      <!-- 组卷配置明细 -->
      <el-main v-if="showConfigDetail">
        <el-card>
          <el-table :v-loading="loading" :data="combExamConfigDetailVos" style="width: 100%" height="240px" element-loading-text="Loading">
            <el-table-column prop="category" label="题目类别" />
            <el-table-column prop="subjectType" label="题型" />
            <el-table-column prop="num" label="题目数量" />
            <el-table-column prop="difficultyName" label="题目难度" />
            <el-table-column prop="score" label="题目分值" />
          </el-table>
          <div class="block">
            <span class="demonstration" />
            <el-pagination
              background
              layout="prev, pager, next"
              :total="queryExamConfigForm.total"
              :current-page="queryExamConfigForm.currentPage"
              :page-size="queryExamConfigForm.pageSize"
              @current-change="handleCurrentChange3"
            />
          </div>
        </el-card>
      </el-main>
      <!-- 模版组卷 -->
      <el-main v-if="showTemplate">
        <br>
        <el-card>
          <el-table ref="multipleTable" v-loading="templateLoading" :data="templateVOs" style="width: 100%" @selection-change="handlePaperSelectionChange">
            <el-table-column type="selection" width="30%" />
            <el-table-column prop="name" label="试卷名" />
            <el-table-column prop="paperCreator" label="组卷人" />
            <el-table-column prop="paperTypeValue" label="试卷类型" />
            <el-table-column prop="difficultyValue" label="试卷难度" />
            <el-table-column prop="creatdTime" label="组卷时间" />
            <el-table-column prop="score" label="试卷总分" />
            <el-table-column prop="description" label="试卷描述" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="180%">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="selectCreateTemplateGen(scope.row)" />
                <el-button type="info" icon="el-icon-info" size="mini" circle @click="handleInfo(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <span class="demonstration" />
            <el-pagination
              background
              layout="prev, pager, next"
              :total="queryTemplateForm.total"
              :current-page="queryTemplateForm.currentPage"
              :page-size="queryTemplateForm.pageSize"
              @current-change="handleCurrentChange4"
            />
          </div>
          <el-dialog
            title="确认试卷信息"
            :visible.sync="templateDialog"
            width="30%"
          >
            <span class="demonstration">试卷名称:</span>
            <el-input v-model="templateInfo.name" style="width: 20%" />
            <span class="demonstration">试卷类型:</span>
            <el-select v-model="templateInfo.type" placeholder="请选择试卷类型">
              <el-option
                v-for="item in paperTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span slot="footer" class="dialog-footer">
              <el-button @click="templateDialog = false">取 消</el-button>
              <el-button type="primary" @click="createTemplateGen(temp)">确 定</el-button>
            </span>
          </el-dialog>
        </el-card>
      </el-main>
      <el-dialog
        :visible.sync="genDialog"
        width="10%"
        >
        正在组卷中。。。
      </el-dialog>
      <el-dialog
              :visible.sync="showInfoLoading"
              width="10%"
      >
        正在加载中。。。
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import { query } from '@/api/basedata/combExamConfig'
import { queryPaperWithCondition, paperDetail } from '@/api/paper/maintain.js'
import loading from '@/components/Loading/index'
import PaperInfo from '@/components/paperInfo/index'
import { queryConfigItem } from '@/api/basedata/combExamConfig'
import { queryPaper } from '@/api/paper/template.js'
import { fastGen, templateGen } from '@/api/paper/generatePaper'
import { queryDictionary } from '@/api/basedata/dictionary'
import { querySubjectType } from '@/api/basedata/subjectType'
export default {
  name: 'Position',
  components: { loading, PaperInfo },
  data() {
    return {
      genDialog: false,
      templateDialog: false,
      difficultyOptions: [],
      // 组卷时间
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      templateVOs: [],
      // 查询属性
      combExamTimeSelect: '',
      condition: {
        name: '',
        createdBy: '',
        difficulty: '',
        //  组卷查询日期区间,实际上是一个数组
        start: '',
        end: '',
        currentPage: 1,
        pageSize: 5,
        total: 1
      },
      loading: true,
      paperTypeDataSearch: {
        name: '试卷类型'
      },
      subjectDifficultyDataSearch: {
        name: '题目难度'
      },
      paperVos: [],
      combExamConfigVos: [],
      queryForm: {
        id: ''
      },
      fastGenQueryForm: {
        name: '',
        currentPage: 1,
        pageSize: 5,
        total: 1
      },
      queryExamConfigForm: {
        id: '',
        pageSize: 4,
        currentPage: 1,
        total: 1
      },
      queryTemplateForm: {
        pageSize: 4,
        currentPage: 1,
        total: 1
      },
      combExamConfigDetailVos: [],
      // 组卷参数
      subjectTypeOptions: [],
      // 快速组卷中选中的组卷配置,生成时发送此VO给后端
      selectedCombExamConfigVO: {
        id: '',
        name: '',
        paperType: '',
        difficulty: '',
        status: '',
        remark: ''
      },
      templateInfo: {
          name:'',
          type:'',
      },
      // 试卷类型
      paperTypeOptions: [],
      // 标准组卷中用户自定义的配置明细,生成时将newCombExamConfig传给后端
      combExamConfigItem: {
        categoryId: '',
        subjectTypeId: '',
        num: '',
        difficulty: '',
        score: ''
      },
      newCombExamConfig: {
        configName: '',
        radio: '',
        combExamConfigDetailInsertArray: []
      },
      currentPaperVO: {

      },
      currentPaper: {

      },
      templateLoading: false,
      // 显示试卷表
      show: true,
      // 显示配置表
      showFastGen: false,
      // 显示配置细节
      showConfigDetail: false,
      // 显示标准组卷
      showNormalGen: false,
      // 显示模版组卷
      showTemplate: false,
      // 搜索栏
      showSelectBar: true,
      // 选择框
      selected: '',
      // 试卷详情按钮
      showPaperInf2: false,
      // 试卷详情页
      showPaperInf: false,
      // 返回上级
      showReturn: false,
      // 标准组卷添加组卷明细
      showCombExamConfigDetail: false,
      // 输入试卷类型
      paperTypeDialog: false,
      // 顶部的四个按钮
      showNav: true,
      temp:{},
      showInfoLoading: false,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    //  初始化页面
    init() {
      this.initPaper()
      this.initDifficulty()
    },
    //  初始化难度
    initDifficulty() {
      queryDictionary(this.subjectDifficultyDataSearch).then(res => {
        for (let i = 0; i < res.length; i++) {
          this.difficultyOptions[i] = {}
          this.difficultyOptions[i].label = res[i].value
          this.difficultyOptions[i].value = res[i].id
        }
      })
    },
    //  刚进入时需要加载第一页
    initPaper() {
      this.show = true
      this.loading = true
      this.genDialog = false
      this.templateDialog = false
      this.templateLoading = false
      this.showFastGen = false
      this.showConfigDetail = false
      this.showNormalGen = false
      this.showTemplate = false
      this.showSelectBar = true
      this.selected = ''
      this.showPaperInf2 = false
      this.showPaperInf = false
      this.showReturn = false
      this.showCombExamConfigDetail = false
      this.paperTypeDialog = false
      this.showNav = true
      this.showInfoLoading = false
      this.getPaperVo(this.condition)
      this.$refs.multipleTable.clearSelection();
    },
    getCombExamConfigList() {
      query(this.fastGenQueryForm).then(res => {
        this.combExamConfigVos = res.pageInfo.list
        this.fastGenQueryForm.total = res.total
      })
    },
    handleCurrentChange(currentPage) {
      this.condition.currentPage = currentPage
      this.loading = true
      queryPaperWithCondition(this.condition).then(res => {
        this.paperVos = res.paperVO

        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCurrentChange2(currentPage) {
      this.fastGenQueryForm.currentPage = currentPage
      this.loading = true
      query(this.fastGenQueryForm).then(res => {
        this.combExamConfigVos = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCurrentChange3(currentPage) {
      this.queryExamConfigForm.currentPage = currentPage
      this.loading = true
      queryConfigItem(this.queryExamConfigForm).then(res => {
        this.combExamConfigDetailVos = res.paperVO
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCurrentChange4(currentPage) {
      this.queryTemplateForm.currentPage = currentPage
      this.loading = true
      queryPaper(this.fastGenQueryForm).then(res => {
        this.templateVOs = res.paperVO
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleFastGen() {
      this.show = false
      this.showFastGen = true
      this.showConfigDetail = false
      this.showNormalGen = false
      this.showSelectBar = false
      this.showPaperInf = false
      this.showReturn = true
      this.showCombExamConfigDetail = false
      this.showTemplate = false
      this.getCombExamConfigList()
    },
    normalGen() {
      this.$router.push({
        name: '标准组卷'
      })
    },
    handleEditConfig(e){
        this.$router.push({
            name: '修改快速组卷',
            params: {
                combExamConfig: e
            }
        })
    },

    handleInfo(e) {
      this.queryCombExamConfigDetailByCombExamConfigId(e)
      this.show = false
      this.showFastGen = true
      this.showConfigDetail = true
      this.showNormalGen = false
      this.showSelectBar = false
      this.showPaperInf = false
      this.showReturn = true
      this.showCombExamConfigDetail = false
      this.showTemplate = false
    },
    selectCreateFastGen(row) {
      console.log(row)
      queryDictionary(this.paperTypeDataSearch).then(res => {
          for (let i = 0; i < res.length; i++) {
              this.paperTypeOptions[i] = {}
              this.paperTypeOptions[i].label = res[i].value
              this.paperTypeOptions[i].value = res[i].id
          }
      })
      console.log(this.paperTypeOptions)
      this.paperTypeDialog = true
      this.selectedCombExamConfigVO.id = row.id
      this.selectedCombExamConfigVO.difficulty = row.difficulty
    },

    selectCreateTemplateGen(row) {
      if (this.selected.length !== 1){
          alert("请选择一项进行模板组卷")
          return
      }
      queryDictionary(this.paperTypeDataSearch).then(res => {
        for (let i = 0; i < res.length; i++) {
          this.paperTypeOptions[i] = {}
          this.paperTypeOptions[i].label = res[i].value
          this.paperTypeOptions[i].value = res[i].id
        }
      })
      console.log(this.paperTypeOptions)
      this.temp = row
      this.templateDialog = true
    },
    createFastGen() {
        if (this.selectedCombExamConfigVO.name === ''){
            alert("请输入试卷名")
            return
        } else if (this.selectedCombExamConfigVO.paperType === ''){
            alert("请选择试卷类型")
            return
        }
      this.genDialog = true
      this.paperTypeDialog = false
      fastGen(this.selectedCombExamConfigVO).then(res => {
        console.log(res)
        this.genDialog = false
      }).catch(() => {
        this.genDialog = false
      })
    },
    createTemplateGen(e) {
      if(this.templateInfo.name === ''){
          alert("请输入试卷名称")
          return
      }else if (this.templateInfo.type === ''){
          alert("请选择试卷类型")
          return
      }
      this.genDialog = true
      e.name = this.templateInfo.name
      e.paperType = this.templateInfo.type
      templateGen(e).then(res=>{
        alert(res)
        this.initPaper()
      }).catch(e=>{
        alert(e)
        this.initPaper()
      })
    },
    queryCombExamConfigDetailByCombExamConfigId(id) {
      this.queryExamConfigForm.id = id
      console.log(id)
      queryConfigItem(this.queryExamConfigForm).then(res => {
        this.combExamConfigDetailVos = res.pageInfo.list
        this.queryExamConfigForm.total = res.total
      })
    },
    returnParent() {
      this.show = true
      this.showFastGen = false
      this.showConfigDetail = false
      this.showNormalGen = false
      this.showSelectBar = true
      this.showPaperInf = false
      this.showReturn = false
      this.showCombExamConfigDetail = false
      this.showTemplate = false
      this.initPaper()
    },
    handleTemplateGen() {
      //如果已经是模板组卷页面了
      if (this.showTemplate === true){
          this.selectCreateTemplateGen()
      } else {
          this.show = false
          this.showFastGen = false
          this.showConfigDetail = false
          this.showNormalGen = false
          this.showSelectBar = true
          this.showPaperInf = false
          this.showReturn = true
          this.showCombExamConfigDetail = false
          this.showTemplate = true
          this.templateLoading = true
          queryPaper(this.condition).then(res => {
              this.templateVOs = res.paperVO
              this.condition.total = res.total
              this.templateLoading = false
          }).catch(e=>{
              this.templateLoading = false
          })
      }
    },

    /**
     * 显示试卷详情
     * @param e
     */
    showPaperInfo(e) {
      if (e === 1) {
        if (this.selected === '' || this.selected === null || this.selected.length !== 1) {
          alert('必须且仅选择一份试卷')
        } else {
          this.showInfoLoading = true
          paperDetail(this.selected[0].id).then(res => {
            // 获取到试卷详情
            this.currentPaperVO = res
            this.showInfoLoading = false
          })
        }
      } else {
        this.showInfoLoading = true
        paperDetail(e).then(res => {
          this.currentPaperVO = res
          this.showInfoLoading = false
        })
      }
      this.showPaperInf = true
    },
    handlePaperSelectionChange(selection) {
      this.selected = selection
    },
    handleQuery() {
      // 小小的处理下时间
      if (this.combExamTimeSelect !== '' || this.combExamTimeSelect != null) {
        this.condition.start = this.combExamTimeSelect[0]
        this.condition.end = this.combExamTimeSelect[1]
      }
      this.getPaperVo(this.condition)
    },
    getPaperVo(e) {
      this.loading = true
      queryPaperWithCondition(e).then(res => {
        this.paperVos = res.paperVO
        this.condition.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.dashboard {
  &-container {
    margin: 10px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
el-main {
  padding: 0px;
}
</style>
