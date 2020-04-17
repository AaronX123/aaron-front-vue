<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <el-container>
      <el-header style="height:10%; width: 100%">
        <!-- 表头 -->
        <el-row>
          <el-form :inline="true" style="float: left" :model="queryForm">
            <el-form-item label="组卷配置项标题：">
              <el-input v-model="queryForm.name" size="mini" style="width: 130px" placeholder="请输入" />
            </el-form-item>
            <el-form-item>
              <perms-button perms="queryCombExamConfig" type="primary" label="查询" icon="el-icon-search" @click="getCombExamConfigList(queryForm.name)" />
            </el-form-item>
          </el-form>
        </el-row>
        <!-- 按钮 -->
        <el-row style="display: inline">
          <perms-button perms="saveCombExamConfig" label="增加" type="success" icon="el-icon-plus" @click="handleSave" />
          <perms-button perms="deleteCombExamConfig" label="删除" type="danger" icon="el-icon-delete" @click="delSelectCombExamConfig()" />
          <perms-button perms="updateCombExamConfig" label="修改" type="warning" icon="el-icon-edit" @click="updateSelectCombExamConfig()" />
        </el-row>
      </el-header>
      <!-- 表格 -->
      <el-main v-if="show">
        <el-table
          :data="combExamConfigDataList"
          border
          style="width: 100%"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          @row-dblclick="dblclick"
        >
          <el-table-column type="selection" :reserve-selection="true" width="40" />
          <el-table-column prop="name" label="配置项" />
          <el-table-column prop="difficultyName" label="难度" />
          <el-table-column prop="updatedByName" label="修改人" />
          <el-table-column prop="updatedTime" label="更新时间" />
          <el-table-column prop="status" label="状态" />
          <el-table-column prop="company" label="公司" />
          <el-table-column prop="remark" label="备注" />
          <!-- 操作按钮 -->
          <el-table-column fixed="right" label="操作" width="200%">
            <template slot-scope="scope">
              <perms-button perms="saveCombExamConfig" type="success" icon="el-icon-plus" circle @click="handleSave" />
              <perms-button perms="deleteCombExamConfig" type="danger" icon="el-icon-delete" circle @click="delCombExamConfig(scope.row)" />
              <perms-button perms="updateCombExamConfig" type="warning" icon="el-icon-edit" circle @click="updateCombExamConfig(scope.row)" />
              <el-button type="info" icon="el-icon-info" size="mini" circle @click="handleInfo(scope.row)" />
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
      <el-main v-if="combExamConfigItemVisible">
        <el-table :data="combExamConfigItemDataList" border style="width: 100%">
          <el-table-column prop="category" label="题目类别" />
          <el-table-column prop="subjectType" label="类型" />
          <el-table-column prop="num" label="题目数量" />
          <el-table-column prop="difficultyName" label="题目难度" />
          <el-table-column prop="score" label="题的分值" />
        </el-table>
        <!-- 分页 -->
        <pagination
          :total="itemTotal"
          :current-page="queryItemForm.currentPage"
          :page-size="queryItemForm.pageSize"
          @handleCurrentChange="handleCurrentChange"
        />
      </el-main>
    </el-container>
    <el-dialog style="margin-top: 30px" title="消 息" :visible.sync="deleteDialogVisible" width="40%" center>
      <span>确定要删除该组卷配置吗？</span>
      <div slot="footer" class="dialog-footer">
        <perms-button perms="saveCombExamConfig" type="primary" label="确 定" @click="delCombExamConfigData()" />
        <el-button size="mini" @click="deleteDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { del, query, queryConfigItem } from '@/api/basedata/combExamConfig'
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
export default {
  name: 'CombExamConfig',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      total: 1,
      itemTotal: 1,
      //  搜索区域参数
      queryForm: {
        name: '',
        currentPage: 1,
        pageSize: 7
      },
      // 搜索组卷配置明细参数
      queryItemForm: {
        id: '',
        currentPage: 1,
        pageSize: 4
      },
      //  编辑界面row
      editRow: '',
      loading: true,
      // 是否显示组卷配置明细
      combExamConfigItemVisible: false,
      show: true,
      combExamConfigDataList: [], //  当前页显示内容
      // 组卷配置明细
      combExamConfigItemDataList: [],
      // 删除对话框
      deleteDialogVisible: false,
      // 删除表单
      deleteForm: [],
      // 多选框
      multipleSelection: [],
      select_order_number: '', // 表格select选中的条数
      select_orderId: [], // 表格select复选框选中的id
      // 更新
      updateForm: []
    }
  },
  mounted() {
    //  初始加载
    this.getCombExamConfigList()
  },
  methods: {
    // 获取组卷配置列表
    getCombExamConfigList() {
      query(this.queryForm).then(res => {
        this.combExamConfigDataList = res.pageInfo.list
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 删除单条
    delCombExamConfig(row) {
      this.deleteForm[0] = row
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getCombExamConfigList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    //  批量删除
    delSelectCombExamConfig(multipleSelection) {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行删除',
          type: 'faile'
        })
        return
      }
      this.deleteForm = this.multipleSelection
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.loading = true
        del(this.deleteForm).then(res => {
          this.getCombExamConfigList()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 双击显示详情
    dblclick(row, column, event) {
      this.updateCombExamConfig(row)
    },
    // 更新当前行
    updateCombExamConfig(row) {
      this.updateForm = row
      this.handleUpdate()
    },
    // 顶部的编辑按钮
    updateSelectCombExamConfig(row) {
      if (this.multipleSelection.length > 1) {
        this.$message({
          message: '不可多条修改',
          type: 'warning'
        })
      } else if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行修改',
          type: 'warning'
        })
      } else {
        this.updateForm = this.multipleSelection[0]
        this.handleUpdate()
      }
    },

    // 显示组卷配置明细
    handleInfo(row) {
      this.queryItemForm.id = row.id
      this.loading = true
      queryConfigItem(this.queryItemForm).then(res => {
        this.combExamConfigItemDataList = res.pageInfo.list
        this.itemTotal = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      this.combExamConfigItemVisible = true
    },
    //  显示新增界面
    handleSave: function() {
      this.$router.push({
        name: '增加组卷配置'
      })
    },
    //  显示编辑界面
    handleUpdate() {
      this.$router.push({
        name: '修改组卷配置',
        params: {
          updateForm: this.updateForm
        }
      })
    },
    // 多选框
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
      query(this.queryForm).then(res => {
        this.combExamConfigDataList = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleItemCurrentChange(currentPage) {
      this.queryItemForm.currentPage = currentPage
      this.loading = true
      queryConfigItem(this.queryItemForm).then(res => {
        this.combExamConfigItemDataList = res.pageInfo.list
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
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
