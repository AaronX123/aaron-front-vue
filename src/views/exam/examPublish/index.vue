<template>
  <div class="dashboard-container">
    <el-container style="height: 650px">
      <el-header style="height:25%; width: 100%">
        <el-form :model="queryForm" :inline="true">
          <el-form-item label="试卷发布人">
            <el-input
              v-model="queryForm.publisher"
              placeholder="试卷发布人"
              size="mini"
              @keyup.enter.native="queryExamPublishRecord"
            />
          </el-form-item>
          <el-form-item label="发布时间段">
            <el-date-picker
              v-model="queryForm.publishTimeRange"
              size="mini"
              type="datetimerange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @keyup.enter.native="queryExamPublishRecord"
            />
          </el-form-item>
          <el-row>
            <el-form-item label="考试标题">
              <el-input
                v-model="queryForm.title"
                placeholder="考试标题"
                size="mini"
                @keyup.enter.native="queryExamPublishRecord"
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
                @keyup.enter.native="queryExamPublishRecord"
              />
            </el-form-item>
            <el-button
              style="margin-top: 5px"
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="queryExamPublishRecord"
            >查询</el-button>
          </el-row>
        </el-form>
        <div>
          <el-row style="display: inline">
            <el-button
              :disabled="flag"
              type="success"
              size="mini"
              @click="showSelectedEditPublishFormDialog"
            >
              <i class="el-icon-edit" />修改
            </el-button>
            <el-button :disabled="delFlag" type="danger" size="mini" @click="deleteSelected">
              <i class="el-icon-delete" />删除
            </el-button>
            <el-button type="primary" size="mini" @click="showPublishFormDialog('publishForm')">
              <i class="el-icon-circle-plus" />发布
            </el-button>
          </el-row>
        </div>
      </el-header>
      <el-main>
        <el-table
          ref="multipleTable"
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
          height="90%"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="35" />
          <el-table-column prop="publisher" label="试卷发布人" width="70" />
          <el-table-column prop="createdTime" label="发布时间" />
          <el-table-column prop="endTime" label="考试结束时间" />
          <el-table-column prop="planPepoleNum" label="计划人数" width="80" />
          <el-table-column prop="limitTime" label="考试时长(分钟)" width="80" />
          <el-table-column prop="examiners" label="评卷官" />
          <el-table-column prop="title" label="考试标题" />
          <el-table-column prop="descript" label="考试说明" show-overflow-tooltip width="100" />
          <el-table-column prop="status" label="状态列" width="50" />
          <el-table-column prop="publishTimes" label="发布次数" width="50" />
          <el-table-column label="操作" width="150px">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="showEditPublishFormDialog(scope.$index,tableData)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="deleteSingle(scope.$index,tableData)"
              />
              <el-button
                :disabled="new Date().getTime()<tableData[scope.$index].createdTime"
                type="warning"
                icon="el-icon-share"
                size="mini"
                circle
                @click="showQrCode(scope.$index,tableData)"
              />
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
    </el-container>

    <!-- QRCode -->
    <el-dialog title="请扫描下方二维码" :visible.sync="qrCodeDialogVisible" width="250px">
      <vue-qr :text="url" :size="200" :margin="0" />
    </el-dialog>

    <!-- add publishForm -->
    <el-dialog title="发布信息" :visible.sync="dialogFormVisible" center>
      <el-form ref="publishForm" :model="publishForm" :rules="rules" label-width="270px">
        <el-form-item label="试卷" prop="paper">
          <el-tag
            v-for="(tag,key) in publishForm.paper"
            :key="key"
            closable
            @close="closePaperTag(tag)"
          >{{ tag }}</el-tag>
          <el-button
            type="primary"
            :disabled="publishForm.paper.length >= 1"
            @click="queryPaper();paperInnerVisible = true"
          >选择试卷</el-button>
        </el-form-item>
        <el-form-item label="考试场次">
          <el-input v-model="publishForm.examSession" disabled style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试标题" prop="title">
          <el-input v-model="publishForm.title" style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试开始时间" prop="startTime">
          <el-date-picker
            v-model="publishForm.startTime"
            type="datetime"
            placeholder="选择时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="考试截止时间" prop="endTime">
          <el-date-picker
            v-model="publishForm.endTime"
            type="datetime"
            placeholder="选择时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="计划参与人数" prop="planPepoleNum">
          <el-input v-model.number="publishForm.planPepoleNum" style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="limitTime">
          <el-input v-model.number="publishForm.limitTime" style="width: 50%" />
        </el-form-item>
        <el-form-item label="阅卷官" prop="examiners">
          <el-tag
            v-for="tag in publishForm.examiners"
            :key="tag"
            closable
            @close="closeExaminersTag(tag)"
          >{{ tag }}</el-tag>
          <el-button type="primary" @click="queryExaminers();examinerInnerVisible = true">添加阅卷官</el-button>
        </el-form-item>
        <el-form-item label="阅卷方式" prop="markingMode">
          <el-select v-model="publishForm.markingMode" placeholder="请选择阅卷方式">
            <el-option
              v-for="item in markingModes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择阅卷截止时间" prop="markingStopTime">
          <el-date-picker
            v-model="publishForm.markingStopTime"
            type="datetime"
            placeholder="选择日期时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="publishForm.descript" style="width: 300px" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submitPublishForm('publishForm');dialogFormVisible = false"
        >确 定</el-button>
      </div>

      <!-- 试卷dialog -->
      <el-dialog width="30%" title="选择试卷" :visible.sync="paperInnerVisible" append-to-body>
        <el-form :model="paperDialogQueryForm" :inline="true">
          <el-form-item label="试卷名称">
            <el-input v-model="paperDialogQueryForm.paper" placeholder="试卷名称" />
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryPaper">查询</el-button>
        </el-form>
        <el-table
          v-loading="loading"
          :data="paperTableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
          border
          style="width: 100%"
          height="500px"
        >
          <el-table-column prop="name" label="试卷名称" width="280px" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="choosePaper(scope.$index,paperTableData);paperInnerVisible = false"
              >选择</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="paperTotal"
          :current-page="paperDialogQueryForm.currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </el-dialog>

      <!-- 阅卷官dialog -->
      <el-dialog width="30%" title="选择阅卷官" :visible.sync="examinerInnerVisible" append-to-body>
        <el-form :model="examinersDialogQueryForm" :inline="true">
          <el-form-item label="阅卷官">
            <el-input v-model="examinersDialogQueryForm.examiner" placeholder="阅卷官" />
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryExaminers">查询</el-button>
        </el-form>
        <el-table
          v-loading="loading"
          :data="examinersTableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
          border
          style="width: 100%"
          height="500px"
        >
          <el-table-column prop="name" label="阅卷官" width="280px" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="chooseExaminer(scope.$index,examinersTableData);examinerInnerVisible = false"
              >选择</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="examinerTotal"
          :current-page="examinersDialogQueryForm.currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </el-dialog>
    </el-dialog>

    <!-- edit publishForm -->
    <el-dialog title="修改发布信息" :visible.sync="editDialogFormVisible" center>
      <el-form ref="publishForm" :model="publishForm" :rules="rules" label-width="270px">
        <el-form-item label="试卷" prop="paper">
          <el-tag
            v-for="(tag,key) in publishForm.paper"
            :key="key"
            closable
            @close="closePaperTag(tag)"
          >{{ tag }}</el-tag>
          <el-button
            type="primary"
            :disabled="publishForm.paper.length >= 1"
            @click="queryPaper();paperInnerVisible = true"
          >选择试卷</el-button>
        </el-form-item>
        <el-form-item label="考试场次">
          <el-input v-model="publishForm.examSession" disabled style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试标题" prop="title">
          <el-input v-model="publishForm.title" style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试开始时间" prop="startTime">
          <el-date-picker
            v-model="publishForm.startTime"
            type="datetime"
            placeholder="选择时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="考试截止时间" prop="endTime">
          <el-date-picker
            v-model="publishForm.endTime"
            type="datetime"
            placeholder="选择时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="计划参与人数" prop="planPepoleNum">
          <el-input v-model.number="publishForm.planPepoleNum" style="width: 50%" />
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="limitTime">
          <el-input v-model.number="publishForm.limitTime" style="width: 50%" />
        </el-form-item>
        <el-form-item label="阅卷官" prop="examiners">
          <el-tag
            v-for="tag in publishForm.examiners"
            :key="tag"
            closable
            @close="closeExaminersTag(tag)"
          >{{ tag }}</el-tag>
          <el-button type="primary" @click="queryExaminers(); examinerInnerVisible = true">添加阅卷官</el-button>
        </el-form-item>
        <el-form-item label="阅卷方式" prop="markingMode">
          <el-select v-model="publishForm.markingMode" placeholder="请选择阅卷方式">
            <el-option
              v-for="item in markingModes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择阅卷截止时间" prop="markingStopTime">
          <el-date-picker
            v-model="publishForm.markingStopTime"
            type="datetime"
            placeholder="选择日期时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="publishForm.descript" style="width: 300px" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submitEditPublishForm('publishForm');editDialogFormVisible = false"
        >确 定</el-button>
      </div>

      <!-- 试卷dialog -->
      <el-dialog width="30%" title="选择试卷" :visible.sync="paperInnerVisible" append-to-body>
        <el-form :model="paperDialogQueryForm" :inline="true">
          <el-form-item label="试卷名称">
            <el-input v-model="paperDialogQueryForm.paper" placeholder="试卷名称" />
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryPaper">查询</el-button>
        </el-form>
        <el-table
          v-loading="loading"
          :data="paperTableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
          border
          style="width: 100%"
          height="500px"
        >
          <el-table-column prop="name" label="试卷名称" width="280px" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="choosePaper(scope.$index,paperTableData);paperInnerVisible = false"
              >选择</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="paperTotal"
          :current-page="paperDialogQueryForm.currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </el-dialog>

      <!-- 阅卷官dialog -->
      <el-dialog width="30%" title="选择阅卷官" :visible.sync="examinerInnerVisible" append-to-body>
        <el-form :model="examinersDialogQueryForm" :inline="true">
          <el-form-item label="阅卷官">
            <el-input v-model="examinersDialogQueryForm.examiner" placeholder="阅卷官" />
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryExaminers()">查询</el-button>
        </el-form>
        <el-table
          v-loading="loading"
          :data="examinersTableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
          border
          style="width: 100%"
          height="500px"
        >
          <el-table-column prop="name" label="阅卷官" width="280px" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="chooseExaminer(scope.$index,examinersTableData);examinerInnerVisible = false"
              >选择</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="examinerTotal"
          :current-page="examinersDialogQueryForm.currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import VueQr from 'vue-qr'
import { query, save, del, update, getPaperInfo, getUserInfo } from '@/api/exam/examPublishRecord.js'
import Pagination from '@/components/Pagination/index'
import { Message } from 'element-ui'

export default {
  components: { VueQr, Pagination },
  data() {
    return {
      url: '',
      flag: true,
      delFlag: true,
      tableData: [],
      paperTableData: [],
      currentPage: 1,
      examinersTableData: [],
      dialogFormVisible: false,
      editDialogFormVisible: false,
      qrCodeDialogVisible: false,
      visible: false,
      paperInnerVisible: false,
      examinerInnerVisible: false,
      // page
      pageSize: 8,
      total: 0,
      paperTotal: 0,
      examinerTotal: 0,
      // page
      loading: true,
      queryForm: {
        publisher: '',
        publishTimeRange: [],
        title: '',
        examTimeRange: [],
        currentPage: 1
      },
      paperDialogQueryForm: {
        paper: ''
      },
      examinersDialogQueryForm: {
        examiner: ''
      },
      publishForm: {
        paper: [],
        examSession: '',
        title: '',
        startTime: '',
        endTime: '',
        planPepoleNum: '',
        limitTime: '',
        markingStopTime: '',
        markingMode: null,
        examiners: [],
        descript: '',
        paperId: null,
        examinersId: []
      },
      markingModes: [{
        value: '1',
        label: '阅卷方式1'
      },
      {
        value: '2',
        label: '阅卷方式2'
      }],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      rules: {
        paper: [
          { required: true, message: '请选择一张试卷', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入考试标题', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择时间', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请选择时间', trigger: 'blur' }
        ],
        planPepoleNum: [
          { required: true, message: '请输入计划参与人数', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        limitTime: [
          { required: true, message: '请输入考试时长', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        examiners: [
          { required: true, message: '至少选择一名阅卷官', trigger: 'blur' }
        ],
        markingMode: [
          { required: true, message: '请选择阅卷方式', trigger: 'blur' }
        ],
        markingStopTime: [
          { required: true, message: '请选择时间', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getExamPublishRecord()
  },
  methods: {
    getExamPublishRecord() {
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
    },
    handleCurrentChange: function(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.loading = false
      })
    },
    // 发送查询请求
    queryExamPublishRecord() {
      this.queryForm.currentPage = 1
      query(this.queryForm).then(res => {
        this.tableData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      })
    },
    // 展示发布记录窗口
    showPublishFormDialog(publishForm) {
      this.clearForm()
      this.$nextTick(() => {
        this.$refs['publishForm'].resetFields()
      })
      this.dialogFormVisible = true
    },
    // 新增发布记录
    submitPublishForm(publishForm) {
      this.$refs[publishForm].validate((valid) => {
        if (valid) {
          save(this.publishForm).then(res => {
            this.getExamPublishRecord()
          })
        } else {
          Message({
            message: '信息填写不完整',
            type: 'error',
            duration: 3 * 1000
          })
          return false
        }
      })
    },
    // 展示修改发布记录窗口
    showEditPublishFormDialog(index, tableData) {
      if (tableData[index].status !== '0') {
        this.open()
      } else {
        this.clearForm
        this.editDialogFormVisible = true
        const item = tableData[index]

        this.publishForm.id = item.id
        this.publishForm.paperId = item.paperId
        this.publishForm.title = item.title
        this.publishForm.examSession = item.examSession
        this.publishForm.planPepoleNum = item.planPepoleNum
        this.publishForm.limitTime = item.limitTime
        this.publishForm.descript = item.descript
        console.log(this.publishForm)
        console.log(item)
      }
    },
    showSelectedEditPublishFormDialog() {
      this.clearForm()
      const selection = this.$refs.multipleTable.selection
      this.editDialogFormVisible = true
      const item = selection[0]
      this.publishForm.id = item.id
      this.publishForm.title = item.title
      this.publishForm.examSession = item.examSession
      this.publishForm.planPepoleNum = item.planPepoleNum
      this.publishForm.limitTime = item.limitTime
      this.publishForm.descript = item.descript
    },
    // 提交修改发布记录
    submitEditPublishForm() {
      update(this.publishForm).then(res => {
        this.getExamPublishRecord()
      })
    },
    // 选择试卷
    choosePaper(index, tableData) {
      this.publishForm.paper.push(tableData[index].name)
      this.publishForm.paperId = tableData[index].id
    },
    // 选择阅卷官
    chooseExaminer(index, tableData) {
      this.publishForm.examiners.push(tableData[index].name)
      this.publishForm.examinersId.push(tableData[index].id)
    },
    // 获取试卷列表
    queryPaper() {
      this.loading = true
      getPaperInfo(this.paperDialogQueryForm.paper).then(res => {
        this.paperTableData = res
        this.paperTotal = res.length
        this.loading = false
      })
    },
    // 获取阅卷官列表
    queryExaminers() {
      this.loading = true
      getUserInfo(this.examinersDialogQueryForm.examiner).then(res => {
        this.examinersTableData = res
        this.examinerTotal = res.length
        this.loading = false
      })
    },
    closePaperTag(tag) {
      this.publishForm.paper.splice(this.publishForm.paper.indexOf(tag), 1)
    },
    closeExaminersTag(tag) {
      this.publishForm.examiners.splice(this.publishForm.examiners.indexOf(tag), 1)
      this.publishForm.examinersId.splice(this.publishForm.examinersId.indexOf(tag), 1)
    },
    // 删除多条选中
    deleteSelected() {
      this.$confirm('此操作将永久删除记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        const deleteForm = []
        const selection = this.$refs.multipleTable.selection
        selection.forEach(element => {
          deleteForm.push({ id: element.id, version: element.version })
        })
        del(deleteForm).then(res => {
          if (res === 'success') {
            this.queryForm.currentPage = 1
            this.getExamPublishRecord()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 删除一条
    deleteSingle(index, tableData) {
      this.$confirm('此操作将永久删除记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        const deleteForm = []
        deleteForm.push({ id: tableData[index].id, version: tableData[index].version })
        del(deleteForm).then(res => {
          if (res === 'success') {
            this.queryForm.currentPage = 1
            this.getExamPublishRecord()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(rows) {
      if (rows.length !== 1) {
        this.flag = true
      } else {
        this.flag = false
      }
      if (rows.length >= 1) {
        this.delFlag = false
      } else {
        this.delFlag = true
      }
    },
    showQrCode(index, tableData) {
      console.log(tableData[index].createdTime)
      // 如果已经开始则不予开放二维码
      if (new Date(this.changeTime(tableData[index].endTime)).getTime() < new Date().getTime()) {
        this.$message({
          type: 'info',
          message: '考试已经结束，不再生成二维码'
        })
      }else {
        this.qrCodeDialogVisible = true
        // 此处配置手机端web路径
        this.url = 'http://localhost:8888/#/' + '?examPublishRecordId=' + tableData[index].id + '&paperId=' + tableData[index].paperId
        console.log(this.url)
      }
    },

    changeTime(option){
      // currentTime当前时间，假设是 2019-7-2 19:03
      var currentTime = option;
      var reg = new RegExp("年","g");//去掉时间里面的-
      var a = currentTime.replace(reg,"-");
      var regs = new RegExp("月","g");//去掉时间里面的空格
      var b = a.replace(regs,"-");
      var regss = new RegExp("日","g");//去掉时间里面的:冒号
      var c = b.replace(regss,"");
      return c;
    },

    dateFormat(time) {
      var date=new Date(time);
      var year=date.getFullYear();
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
      var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
      var hours=date.getHours()<10 ? "0"+date.getHours() : date.getHours();
      var minutes=date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
      var seconds=date.getSeconds()<10 ? "0"+date.getSeconds() : date.getSeconds();
      // 拼接
      return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
    },

    clearForm() {
      const startTime = new Date()
      const endTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + 1, 12, 0, 0)
      const markingStopTime = new Date(startTime.getFullYear(), startTime.getMonth() + 1, startTime.getDate(), 12, 0, 0)
      this.publishForm = {
        id: '',
        paper: [],
        examSession: Math.round(Math.random() * 10000),
        title: '',
        startTime: startTime,
        endTime: endTime,
        planPepoleNum: 0,
        limitTime: 120,
        markingStopTime: markingStopTime,
        markingMode: null,
        examiners: [],
        examinersId: [],
        descript: ''
      }
    },
    handleExaminerCurrentChange(currentPage) {
      this.currentPage = currentPage
    },
    handlePaperCurrentChange(currentPage) {
      this.currentPage = currentPage
    },
    open() {
      this.$alert('该记录正在被使用无法修改', '提示', {
        confirmButtonText: '确定'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  margin: 30px;
}
</style>
