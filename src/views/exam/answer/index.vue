<template>
  <div class="dashboard-container">
    <el-container style="height: 650px">
      <el-header style="height:13%; width: 100%">
        <el-form :model="queryForm" :inline="true">
          <el-form-item label="考试名">
            <el-input
              v-model="queryForm.title"
              placeholder="考试名"
              size="mini"
              @keyup.enter.native="queryAnswerRecord"
            />
          </el-form-item>
          <el-form-item label="场次编号">
            <el-input
              v-model="queryForm.examSession"
              placeholder="场次编号"
              size="mini"
              @keyup.enter.native="queryAnswerRecord"
            />
          </el-form-item>
          <el-form-item label="考试时间段">
            <el-date-picker
              v-model="queryForm.examTimeRange"
              size="mini"
              type="datetimerange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @keyup.enter.native="queryAnswerRecord"
            />
          </el-form-item>
          <el-form-item label="试卷发布人">
            <el-input
              v-model="queryForm.publisher"
              placeholder="试卷发布人"
              size="mini"
              @keyup.enter.native="queryAnswerRecord"
            />
          </el-form-item>
          <el-button
            style="margin-top: 5px"
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="queryAnswerRecord"
          >查询</el-button>
        </el-form>
      </el-header>
      <el-main v-if="show">
        <el-table
          v-loading="loading "
          :data="tableData"
          style="width: 100%"
          height="90%"
          border
          @row-click="showPaper"
        >
          <el-table-column prop="title" label="考试名" show-overflow-tooltip width="150" />
          <el-table-column prop="examSession" label="场次" show-overflow-tooltip width="100" />
          <el-table-column prop="publisher" label="发布人" show-overflow-tooltip width="100" />
          <el-table-column prop="endTime" label="考试截止时间" show-overflow-tooltip />
          <el-table-column prop="tel" label="答卷人手机号" show-overflow-tooltip />
          <el-table-column prop="examiner" label="姓名" show-overflow-tooltip width="100" />
          <el-table-column prop="actualStartTime" label="开始考试时间" show-overflow-tooltip />
          <el-table-column prop="actualEndTime" label="交卷时间" show-overflow-tooltip />
          <el-table-column prop="objectiveSubjectScore" label="客观题得分" show-overflow-tooltip width="70" />
          <el-table-column prop="subjectvieSubjectScore" label="主观题得分" show-overflow-tooltip width="70" />
        </el-table>
        <pagination
          :total="total"
          :current-page="queryForm.currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { query } from '@/api/exam/answerSheet.js'
import Pagination from '@/components/Pagination/index'
export default {
  components: { Pagination },
  data() {
    return {
      tableData: [],
      queryForm: {
        title: '',
        examSession: '',
        examTimeRange: [],
        publisher: '',
        currentPage: 1
      },
      show: true,
      pageSize: 8,
      total: 0,
      loading: true
    }
  },
  created() {
    this.getAnswerSheet()
  },
  methods: {
    // 点击查询获取数据
    queryAnswerRecord() {
      this.queryForm.currentPage = 1
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
    },
    // 加载时获取数据
    getAnswerSheet() {
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
    },
    // 翻页获取数据
    handleCurrentChange: function(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.loading = false
      })
    },
    showPaper(row) {
      console.log(row)
      this.$router.push({ name: '查看答卷', params: {
        examRecordId: row.id,
        paperId: row.paperId,
        status: row.status
      }})
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
