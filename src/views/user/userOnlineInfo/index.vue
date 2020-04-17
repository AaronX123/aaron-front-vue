<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <el-main>
        <el-header style="height: 100px;width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="工号" style="margin-right: 30px">
                <el-input v-model="queryForm.code" size="mini" style="width: 160px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="用户名" style="margin-right: 30px">
                <el-input v-model="queryForm.name" size="mini" style="width: 160px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="在线时段" style="margin-right: 30px">
                <el-date-picker
                  v-model="onlineInterval"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="mini"
                />
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryUserOnline" label="查询" @click="queryOnlineInfo" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button type="danger" perms="mandatoryOffline" icon="el-icon-lock" label="强制下线" @click="selectMandatoryOffline()" />
            <perms-button type="primary" perms="exportUserOnline" icon="el-icon-download" label="导出" @click="exportUserOnline()" />
          </el-row>
        </el-header>
        <el-main v-if="show">
          <el-table
            :data="userOnlineInfoData"
            border
            stripe
            style="width: 100%"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" :reserve-selection="true" width="40" />
            <el-table-column prop="code" label="工号" />
            <el-table-column prop="name" label="用户" />
            <el-table-column prop="ip" label="IP" />
            <el-table-column prop="onlineTime" label="上线时间" />
            <el-table-column prop="offlineTime" label="下线时间" />
            <el-table-column prop="status" label="状态" :formatter="statusFormatter" />
            <el-table-column label="操作" width="100%" align="center">
              <template slot-scope="scope">
                <perms-button perms="mandatoryOffline" type="danger" icon="el-icon-lock" circle @click="mandatoryOffline(scope.row)" />
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
      <!-- 导出专用table -->
      <el-main v-show="false">
        <el-table
          id="table"
          :data="allUserOnlineDataList"
          style="width: 100%"
        >
          <el-table-column type="selection" width="35" />
          <el-table-column prop="code" label="工号" />
          <el-table-column prop="name" label="用户" />
          <el-table-column prop="ip" label="IP" />
          <el-table-column prop="onlineTime" label="上线时间" />
          <el-table-column prop="offlineTime" label="下线时间" />
          <el-table-column prop="status" label="状态" :formatter="statusFormatter" />
        </el-table>
      </el-main>
      <!--导出窗口-->
      <el-dialog
        title="导出窗口"
        :visible.sync="exportDialogVisible"
        width="20%"
      >
        <span>确认导出为excel格式吗</span><br>
        导出文件名为：<el-input v-model="exportExcelName" size="mini" style="width: 120px" placeholder="请输入" />.xlsx
        <span slot="footer" class="dialog-footer">
          <perms-button perms="exportUserOnline" label="确 定" @click="exportExcel" />
          <el-button size="mini" @click="exportDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import { query } from '@/api/user/userCommon'
import { queryAllUserOnlineData, mandatoryOffline } from '@/api/user/userOnlineInfo'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'UserOnlineInfo',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      options: [{
        value: 1,
        label: '正常'
      }, {
        value: 0,
        label: '禁用'
      }],
      userOnlineInfoData: [],
      allUserOnlineDataList: [],
      queryForm: {
        name: '',
        code: '',
        onlineTime: '',
        offlineTime: '',
        pageSize: 10,
        currentPage: 1
      },
      onlineInterval: '',
      show: true,
      loading: false,
      total: 0,
      pageSize: 10,
      multipleSelection: [],
      mandatoryOfflineData: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      exportExcelName: '',
      type: 'UserOnline',
      saveDialogVisible: false,
      deleteDialogVisible: false,
      updateDialogVisible: false,
      exportDialogVisible: false
    }
  },
  mounted() {
    this.getOnlineInfo()
  },
  methods: {
    getOnlineInfo() {
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.userOnlineInfoData = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    queryOnlineInfo() {
      if (this.onlineInterval) {
        this.queryForm.onlineTime = this.onlineInterval[0]
        this.queryForm.offlineTime = this.onlineInterval[1]
      }
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.userOnlineInfoData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      query(this.type, this.queryForm).then(res => {
        this.userOnlineInfoData = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格的状态列转化成是否在线
    statusFormatter: function(row) {
      return row.status === 1 ? '在线' : '离线'
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
    mandatoryOffline(row) {
      this.mandatoryOfflineData = []
      this.mandatoryOfflineData[0] = row.userId
      this.$confirm('确认让其强制下线吗？', '提示', {}).then(() => {
        this.loading = true
        mandatoryOffline(this.mandatoryOfflineData).then(res => {
          this.getOnlineInfo()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    selectMandatoryOffline(row) {
      if (this.multipleSelection.length < 1) {
        this.$message({
          message: '最少选择一位用户让其下线',
          type: 'faile'
        })
      } else {
        this.$confirm('确认让其强制下线吗？', '提示', {}).then(() => {
          for (const n in this.multipleSelection) {
            this.mandatoryOfflineData[n] = this.multipleSelection[n].userId
          }
          this.loading = true
          mandatoryOffline(this.mandatoryOfflineData).then(res => {
            this.getOnlineInfo()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    exportUserOnline() {
      this.exportDialogVisible = true
      this.loading = true
      queryAllUserOnlineData(this.queryForm).then(res => {
        this.allUserOnlineDataList = res
      }).catch(() => {
        this.loading = false
      })
    },
    exportExcel() {
      /* generate workbook object from table */
      console.log(document.querySelector('#table'))
      const wb = XLSX.utils.table_to_book(document.querySelector('#table'))
      /* get binary string as output */
      const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      try {
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据字典.xlsx')
        this.exportDialogVisible = false
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.log(e, wbout)
        }
      }
      return wbout
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 10px;
  }
  &-text {
    font-size: 20px;
    line-height: 10px;
  }
}
</style>
