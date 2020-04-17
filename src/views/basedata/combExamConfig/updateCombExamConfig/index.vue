<template>
  <div class="dashboard-container">
    <!-- 增加窗口 -->
    <el-form ref="combExamConfigItemDataList" :inline="true" :model="combExamConfigItemDataList" :rules="formRules">
      <el-row>
        <el-form-item label="组卷配置信息:" />
      </el-row>
      <el-row>
        <el-form-item label="配置项名称" prop="name">
          <el-input v-model="combExamConfigItemDataList.name" auto-complete="off" style="width: 300px" />
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-select v-model="combExamConfigItemDataList.difficulty" placeholder="请选择" style="width: 100px">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="是否启用" prop="status">
          <el-radio-group v-model="combExamConfigItemDataList.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="combExamConfigItemDataList.remark" type="textarea" :rows="4" auto-complete="off" style="width: 500px" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="修改组卷明细:" />
      </el-row>
      <!-- 按钮 -->
      <el-row style="display: inline">
        <el-button type="success" size="mini" icon="el-icon-plus" @click="handleSave">增加</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="delSelectCombExamConfigItem()">删除</el-button>
        <el-button type="warning" size="mini" icon="el-icon-edit" @click="updateSelectCombExamConfigItem()">修改</el-button>
      </el-row>
      <el-main v-if="show">
        <el-table
          v-loading="listLoading"
          :data="combExamConfigItemDataList.combExamConfigItemVOs"
          border
          style="width: 100%"
          height="427px"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          @row-dblclick="dblclick"
        >
          <el-table-column type="selection" :reserve-selection="true" width="40" />
          <el-table-column prop="category" label="题目类别" />
          <el-table-column prop="subjectType" label="类型" />
          <el-table-column prop="num" label="题目数量" />
          <el-table-column prop="difficultyName" label="题目难度" />
          <el-table-column prop="score" label="题的分值" />
          <!-- 操作按钮 -->
          <el-table-column fixed="right" label="操作" width="150%">
            <template slot-scope="scope">
              <el-button type="success" icon="el-icon-plus" size="mini" circle @click="handleSave" />
              <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="delCombExamConfigItem(scope.row)" />
              <el-button type="warning" icon="el-icon-edit" size="mini" circle @click="updateCombExamConfigItem(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-form>
    <div slot="footer" class="dialog-footer" style="algin: center">
      <el-button type="primary" :loading="addLoading" @click="saveSubmit">提交</el-button>
      <el-button @click.prevent.stop="closeSelectedTag()">取消</el-button>
    </div>
    <!-- 新增配置窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form ref="saveForm" :inline="true" :model="saveForm" label-width="100px" :rules="formRules">
        <el-form-item label="题目类别：" prop="categorySelectOption">
          <el-cascader v-model="saveForm.categorySelectOption" :options="categoryOptions" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 350px" />
        </el-form-item>
        <el-form-item label="题型：" prop="subjectTypeId">
          <el-select v-model="saveForm.subjectTypeId" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in subjectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量" prop="num">
          <el-input v-model="saveForm.num" auto-complete="off" style="width: 350px" />
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-select v-model="saveForm.difficulty" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in difficultyOptions1"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题的分值" prop="score">
          <el-input v-model="saveForm.score" auto-complete="off" style="width: 350px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="saveLoading" @click="saveFormSubmit('saveForm')">提交</el-button>
        <el-button @click="saveFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- 修改配置窗口 -->
    <el-dialog title="基本信息" width="500px" :visible.sync="updateFormVisible" :close-on-click-modal="false">
      <el-form ref="updateForm" :inline="true" :model="updateForm" label-width="100px" :rules="formRules">
        <el-form-item label="题目类别：" prop="categorySelectOption">
          <el-cascader v-model="updateForm.categorySelectOption" :options="categoryOptions" :props="{ checkStrictly: true }" :show-all-levels="false" clearable style="width: 350px" />
        </el-form-item>
        <el-form-item label="题型：" prop="subjectTypeId">
          <el-select v-model="updateForm.subjectTypeId" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in subjectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量" prop="num">
          <el-input v-model="updateForm.num" auto-complete="off" style="width: 350px" />
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-select v-model="updateForm.difficulty" placeholder="请选择" style="width: 350px">
            <el-option
              v-for="item in difficultyOptions1"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题的分值" prop="score">
          <el-input v-model="updateForm.score" auto-complete="off" style="width: 350px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="updateFormLoading" @click="updateFormSubmit(updateForm)">提交</el-button>
        <el-button @click="updateFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { update, queryConfigItem } from '@/api/basedata/combExamConfig'
import { querySubjectType } from '@/api/basedata/subjectType'
import { queryCategory } from '@/api/basedata/category'
import { getQueryList } from '@/utils/treeList'
import { queryDictionary } from '@/api/basedata/dictionary'
import { idToName } from '@/utils/convert'
import { isOneToNinetyNine } from '@/utils/validate'
// import { type } from 'os'
export default {
  name: 'Position',
  data() {
    return {
      // 接收页面参数
      combExamConfig: this.$route.params.updateForm,
      updateForm: {
        subjectTypeId: '',
        subjectType: '',
        categoryId: '',
        category: '',
        difficulty: '',
        difficultyName: '',
        num: '',
        score: '',
        id: '',
        save: false,
        categorySelectOption: ''
      },
      difficultyOptions1: [],
      queryItemForm: {
        id: '',
        currentPage: 1,
        pageSize: 10000
      },
      tags: this.$refs.tag,
      //  返回数据
      combExamConfigItemDataList: {
        name: '',
        status: '',
        version: '',
        remark: '',
        id: '',
        combExamConfigItemVOs: [],
        deleteIds: []
      },

      //  列表Loading加载
      listLoading: false,
      //  添加按钮Loading加载
      saveLoading: false,
      // 多选框
      multipleSelection: [],
      // 表格select选中的条数
      select_order_number: '',
      // 表格select复选框选中的id
      select_orderId: [],
      show: true,
      //  新增界面是否显示
      saveFormVisible: false,
      // 题目类别下拉框的选项
      categoryOptions: [],
      // 题目类别数据
      categoryDataList: [],
      // 获得题目类别传入页面参数（不需要的）
      categoryDataSearch: {
        id: ''
      },

      // 题型下拉框的选项
      subjectTypeOptions: [],
      // 题目类型数据
      subjectTypeDataList: [],
      // 获得题目类型传入页面参数（不需要的）
      subjectTypeDataSearch: {
        id: ''
      },

      // 题目难度下拉框的选项
      difficultyOptions: [],
      // 题目难度数据
      difficultyDataList: [],
      // 获得题目类型传入页面参数
      difficultyDataSearch: {
        name: '题目难度'
      },
      //  新增界面组卷配置明细数据
      combExamConfigItemList: [],
      saveForm: {
        subjectTypeId: '',
        subjectType: '',
        categoryId: '',
        category: '',
        difficulty: '',
        difficultyName: '',
        num: '',
        score: '',
        save: true,
        categorySelectOption: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入配置项名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
        categorySelectOption: [{ required: true, message: '请输入题目类别', trigger: 'blur' }],
        subjectTypeId: [{ required: true, message: '请输入题目类型', trigger: 'blur' }],
        num: [{ required: true, message: '请输入题目数量', trigger: 'blur' },
          { validator: isOneToNinetyNine, trigger: 'blur' }],
        difficulty: [{ required: true, message: '请选择难度', trigger: 'blur' }],
        score: [{ required: true, message: '请输入题的分数', trigger: 'blur' },
        { validator: isOneToNinetyNine, message: "请输0-99之内的数", trigger: 'blur' }]
      },
      //  编辑界面是否显示
      updateFormVisible: false
    }
  },
  mounted() {
    //  初始加载
    this.getCombExamConfigItemList(this.combExamConfig)
  },
  created() {
    this.getSubjectTypeOptions()
    this.getCategoryOptions()
    this.getDifficultyOptions()
  },
  methods: {
    getCombExamConfigItemList(row) {
      this.combExamConfigItemDataList.name = row.name
      this.combExamConfigItemDataList.status = row.status
      this.combExamConfigItemDataList.difficulty = row.difficulty
      this.combExamConfigItemDataList.version = row.version
      this.combExamConfigItemDataList.remark = row.remark
      this.combExamConfigItemDataList.id = row.id
      this.queryItemForm.id = row.id
      queryConfigItem(this.queryItemForm).then(res => {
        this.combExamConfigItemDataList.combExamConfigItemVOs = res.pageInfo.list
        this.total = res.total
        let n
        for (n in this.combExamConfigItemDataList.combExamConfigItemVOs) {
          this.combExamConfigItemDataList.combExamConfigItemVOs[n].save = false
        }
      })
    },
    // 多选方法
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
    //  显示新增界面
    handleSave: function() {
      this.saveFormVisible = true
    },
    // 双击显示详情
    dblclick(row, column, event) {
      this.updateCombExamConfigItem(row)
    },
    // 更新当前行
    updateCombExamConfigItem(row) {
      this.updateForm = row
      this.updateForm.categorySelectOption = this.updateForm.categoryId
      this.updateFormVisible = true
    },
    // 更新多条
    updateSelectCombExamConfigItem() {
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
        this.updateFormVisible = true
      }
    },
    // 更新方法
    updateFormSubmit(updateForm) {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          if (updateForm.categorySelectOption != null && updateForm.categorySelectOption[updateForm.categorySelectOption.length - 1] * 1 < 10) {
            updateForm.categoryId = updateForm.categorySelectOption
          } else {
            updateForm.categoryId = updateForm.categorySelectOption[updateForm.categorySelectOption.length - 1]
          }

          updateForm.category = idToName(this.categoryOptions, updateForm.categoryId)
          updateForm.subjectType = idToName(this.subjectTypeOptions, updateForm.subjectTypeId)
          updateForm.difficultyName = idToName(this.difficultyOptions, updateForm.difficulty)

          // this.combExamConfigItemDataList.combExamConfigItemVOs[this.updateItemForm.column] = this.updateItemForm
          this.updateFormVisible = false
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 删除 答案 信息
    delCombExamConfigItem(row) {
      var index = this.combExamConfigItemDataList.combExamConfigItemVOs.indexOf(row)
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.combExamConfigItemDataList.deleteIds.push(row.id)
        if (index !== -1) {
          this.combExamConfigItemDataList.combExamConfigItemVOs.splice(index, 1)
        }
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      })
    },

    // 批量删除答案信息
    delSelectCombExamConfigItem() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选中一条进行删除',
          type: 'faile'
        })
        return
      }
      this.$confirm('确认删除吗？', '提示', {}).then(() => {
        this.multipleSelection.forEach((row, index) => {
          index = this.combExamConfigItemDataList.combExamConfigItemVOs.indexOf(row)
          this.combExamConfigItemDataList.deleteIds.push(row.id)
          if (index !== -1) {
            this.combExamConfigItemDataList.combExamConfigItemVOs.splice(index, 1)
          }
        })
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      })
    },

    // 添加按钮确认键
    saveSubmit: function() {
      update(this.combExamConfigItemDataList).then(res => {
        this.$router.push({
          name: '组卷配置管理'
        })
      })
    },

    saveFormSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveForm.categoryId = this.saveForm.categorySelectOption[this.saveForm.categorySelectOption.length - 1]
          this.saveForm.category = idToName(this.categoryOptions, this.saveForm.categoryId)
          this.saveForm.subjectType = idToName(this.subjectTypeOptions, this.saveForm.subjectTypeId)
          this.saveForm.difficultyName = idToName(this.difficultyOptions, this.saveForm.difficulty)
          const params = JSON.parse(JSON.stringify(this.saveForm))
          this.combExamConfigItemDataList.combExamConfigItemVOs.push(params)
          this.saveFormVisible = false
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    closeSelectedTag() {
      this.$router.push({
        name: '组卷配置管理'
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
    // 获取 题目难度 选项信息
    getDifficultyOptions() {
      queryDictionary(this.difficultyDataSearch).then(result => {
        for (let i = 0; i < result.length; i++) {
          this.difficultyOptions[i] = {}
          this.difficultyOptions[i].label = result[i].value
          this.difficultyOptions[i].value = result[i].id
        }
      })
      this.difficultyOptions1 = this.difficultyOptions
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
