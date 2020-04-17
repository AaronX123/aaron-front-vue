<template>
  <div class="dashboard-container">
    <el-container v-show="show" style="height: 650px">
      <el-header style="height:15%; width: 100%">
        <el-form :model="queryForm" :inline="true">
          <el-form-item label="场次名">
            <el-input
              v-model="queryForm.examSession"
              placeholder="场次名"
              size="mini"
              @keyup.enter.native="queryRecord"
            />
          </el-form-item>
          <el-form-item label="考试名">
            <el-input
              v-model="queryForm.title"
              placeholder="考试名"
              size="mini"
              @keyup.enter.native="queryRecord"
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
            />
          </el-form-item>
          <el-form-item label="试卷发布人">
            <el-input
              v-model="queryForm.publisher"
              placeholder="试卷发布人"
              size="mini"
              @keyup.enter.native="queryRecord"
            />
          </el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            style="margin-top: 5px"
            @click="queryRecord"
          >查询</el-button>
        </el-form>
      </el-header>
      <div style="margin-left:20px">
        <el-button type="primary" size="mini" :disabled="flag" @click="getDetail">
          <i class="el-icon-question" />查看详情
        </el-button>
      </div>
      <el-main v-if="show">
        <el-table
          ref="multipleTable"
          v-loading="loading"
          :data="examTableData"
          height="90%"
          style="width: 100%"
          border
          @row-click="showDetail"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="35" />
          <el-table-column prop="title" label="考试名" />
          <el-table-column prop="examSession" label="场次" />
          <el-table-column prop="endTime" label="考试截止时间" />
          <el-table-column prop="planPepoleNum" label="计划考试人数" />
          <el-table-column prop="actualPepoleNum" label="实际考试人数" />
          <el-table-column label="操作">
            <i style="color:green;font-size:20px" class="el-icon-question" />
          </el-table-column>
        </el-table>
        <pagination
          :total="exmaTotal"
          :current-page="queryForm.currentPage"
          :page-size="examPageSize"
          @current-change="handleCurrentChange"
        />
      </el-main>
    </el-container>
    <div v-show="!show">
      <el-card>
        <el-table :data="detailTableData" height="550px" stripe style="width: 100%">
          <el-table-column prop="examiner" label="姓名" />
          <el-table-column prop="sex" label="性别" />
          <el-table-column prop="title" label="考试名" />
          <el-table-column prop="objectiveSubjectScore" label="主观题" />
          <el-table-column prop="subjectvieSubjectScore" label="客观题" />
          <el-table-column prop="score" label="总分" />
          <el-table-column prop="ranking" label="排名" />
          <el-table-column prop="examCostTime" label="考试耗时" />
          <el-table-column prop="abilityLabel" label="能力标签" />
        </el-table>
      </el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <pagination
            :total="detailTotal"
            :current-page="queryDetailForm.currentPage"
            :page-size="detailPageSize"
            @current-change="handleDetailCurrentChange"
          />
        </el-col>
        <el-col :span="2" :offset="16">
          <el-button type="primary" size="mini" @click="show=!show">返回</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { query, queryDetail } from '@/api/exam/report.js'
import Pagination from '@/components/Pagination/index'
export default {
  components: { Pagination },
  data() {
    return {
      flag: true,
      exmaTotal: 0,
      examPageSize: 8,
      detailTotal: 0,
      detailPageSize: 10,
      loading: true,
      examTableData: [],
      detailTableData: [],
      show: true,
      queryForm: {
        examSession: '',
        title: '',
        publisher: '',
        examTimeRange: [],
        currentPage: 1
      },
      queryDetailForm: {
        id: null,
        currentPage: 1
      }
    }
  },
  mounted() {
    this.getExamTableData()
  },
  methods: {
    getExamTableData() {
      query(this.queryForm).then(res => {
        this.examTableData = res.pageInfo.list
        this.exmaTotal = res.total
        this.loading = false
      })
    },
    handleCurrentChange: function(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.examTableData = res.pageInfo.list
        this.exmaTotal = res.total
        this.loading = false
      })
    },
    // 点击查询获取数据
    queryRecord() {
      this.queryForm.currentPage = 1
      query(this.queryForm).then(res => {
        this.examTableData = res.pageInfo.list
        this.exmaTotal = res.total
        this.loading = false
      })
    },
    showDetail(row) {
      this.show = !this.show
      this.queryDetailForm.id = row.id
      this.loading = true
      queryDetail(this.queryDetailForm).then(res => {
        this.detailTableData = res.pageInfo.list
        this.detailTotal = res.total
        this.loading = false
      })
    },
    handleDetailCurrentChange: function(currentPage) {
      this.queryDetailForm.currentPage = currentPage
      this.loading = true
      queryDetail(this.queryDetailForm).then(res => {
        this.detailTableData = res.pageInfo.list
        this.loading = false
      })
    },
    getDetail() {
      const selection = this.$refs.multipleTable.selection
      this.showDetail(selection[0])
    },
    handleSelectionChange(rows) {
      if (rows.length !== 1) {
        this.flag = true
      } else {
        this.flag = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  margin: 30px;
}
</style>
