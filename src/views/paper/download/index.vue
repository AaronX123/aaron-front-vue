<template>
  <div class="dashboard-container">
    <el-container style="height: 800px">
      <el-header style="height:10%; width: 100%">
        <el-row style="height:50%">
          试卷名：
          <el-input v-model="condition.name" size="mini" style="width: 10%" />&nbsp;
          组卷人：
          <el-input v-model="condition.createdBy" size="mini" style="width: 10%" />&nbsp;
          难度：
          <el-select
            v-model="condition.difficulty"
            placeholder="可选项"
            size="mini"
            style="width: 10%"
            value
          >
            &nbsp;
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>组卷时间:
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
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQueryPaper">查询</el-button>
        </el-row>
        <el-row style="display: inline">
          <el-button
            type="success"
            size="mini"
            icon="el-icon-download"
            @click="handleDownloadClick(1)"
          >从机构库中下载进公司库</el-button>
        </el-row>
      </el-header>
      <!-- 默认显示试卷列表 -->
      <el-main v-if="show">
        <el-card>
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="paperVos"
            style="width: 100%"
            @selection-change="handlePaperSelectionChange"
          >
            <el-table-column type="selection" width="30%" />
            <el-table-column prop="name" label="试卷名" />
            <el-table-column prop="paperCreator" label="组卷人" />
            <el-table-column prop="paperTypeValue" label="试卷类型" />
            <el-table-column prop="difficultyValue" label="试卷难度" />
            <el-table-column prop="combExamTime" label="组卷时间" :show-overflow-tooltip="true" />
            <el-table-column prop="score" label="试卷总分" />
            <el-table-column prop="description" label="试卷描述" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="100%">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-download" size="mini" circle @click="handleDownloadClick(scope.row)" />
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
      <el-dialog title="试卷属性设置" :visible.sync="showDownload">
        <el-form :model="form">
          <el-form-item label="试卷名" :label-width="formLabelWidth">
            <el-input v-model="modifiedPaper.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="试卷类型" :label-width="formLabelWidth">
            <el-select v-model="modifiedPaper.paperType" placeholder="选择试卷类型">
              <el-option
                      v-for="item in paperTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input v-model="modifiedPaper.description" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showDownload = false">取 消</el-button>
          <el-button type="primary" @click="downloadPaper(temp)">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog
              :visible.sync="showDownloading"
              width="10%"
      >
        正在下载中。。。
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import { downloadPaper } from '@/api/paper/template.js'
import { queryPaper } from '../../../api/paper/template'
import { queryDictionary } from '@/api/basedata/dictionary.js'
export default {
  name: 'Position',
  data() {
    return {
      formLabelWidth:'120px',
      paperTypeDataSearch: {
        name: '试卷类型'
      },
      subjectDifficultyDataSearch: {
        name: '题目难度'
      },
      difficultyOptions: [],
      paperTypeOptions:[],
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
      modifiedPaper:{
          name:'',
          paperType:'',
          description:'',
      },
      combExamTimeSelect: '',
      condition: {
        name: '',
        createdBy: '',
        difficulty: '',
        //  组卷查询日期区间,实际上是一个数组
        start: '',
        end: '',
        currentPage: 1,
        pageSize: 7,
        total: 1
      },
      // 机构的试卷
      paperVos: [],
      // 显示试卷表
      show: true,
      // 选择框
      selected: '',
      // 加载中
      loading: true,
      showDownload: false,
      showDownloading: false,
      temp:{}
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化页面和难度
    init() {
      this.initPaper()
      this.initDifficulty()
    },
    // 初始化难度
    initDifficulty() {
      queryDictionary(this.subjectDifficultyDataSearch).then(res => {
        for (let i = 0; i < res.length; i++) {
          this.difficultyOptions[i] = []
          this.difficultyOptions[i].label = res[i].value
          this.difficultyOptions[i].value = res[i].id
        }
      })
    },
    // 刚进入时需要加载第一页
    initPaper() {
      this.getPaperVo(this.condition)
      this.queryPaperType()
    },
    queryPaperType(){
        queryDictionary(this.paperTypeDataSearch).then(res => {
            for (let i = 0; i < res.length; i++) {
                this.paperTypeOptions[i] = {}
                this.paperTypeOptions[i].label = res[i].value
                this.paperTypeOptions[i].value = res[i].id
            }
        })
    },
    handleDownloadClick(e){
        if (e === 1) {
            if (this.selected.length !== 1) {
                alert('请选择一项进行下载')
            }else {
                this.showDownload = true
                //临时存下当前选中的数据
                this.temp = this.selected[0]
            }
        }else {
            this.showDownload = true
            //临时存下当前选中的数据
            this.temp = e;
        }
    },
    downloadPaper(e){
        if (this.modifiedPaper.name===''){
            alert("试卷名不能为空")
            return
        } else if (this.modifiedPaper.paperType===''){
            alert("试卷类型不能为空")
            return
        }
        this.showDownloading = true
        //e是一个PaperVO,设置更新的数据
        e.name = this.modifiedPaper.name
        e.description = this.modifiedPaper.description
        e.paperType = this.modifiedPaper.paperType
        downloadPaper(e).then(res => {
            this.showDownloading = false
            this.showDownload = false
            this.$refs.multipleTable.clearSelection();
        }).catch(reason => {
            this.showDownloading = false
            this.$refs.multipleTable.clearSelection();
            this.showDownload = false
        })
    },
    handlePaperSelectionChange(selection) {
      this.selected = selection
    },
    handleQueryPaper() {
      this.loading = true
      if (this.combExamTimeSelect !== '' || this.combExamTimeSelect != null) {
        this.condition.start = this.combExamTimeSelect[0]
        this.condition.end = this.combExamTimeSelect[1]
      }
      this.getPaperVo(this.condition)
    },
    getPaperVo(e) {
      queryPaper(e).then(res => {
        this.paperVos = res.paperVO
        this.condition.total = res.total
        this.loading = false
      }).catch(e=>{
          this.loading = false
      })
    },
    handleCurrentChange(currentPage) {
      this.condition.currentPage = currentPage
      this.loading = true
      query(this.condition).then(res => {
        this.combExamConfigVos = res.pageInfo.list
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px
  }
  &-text {
    font-size: 30px;
    line-height: 46px
  }
}
</style>
