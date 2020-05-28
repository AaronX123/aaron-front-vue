<template>
  <el-row>
    <label>试卷详情：</label>
    <br />
    <el-card>
      <h3>{{currentPaperVO.name}}</h3>
      <div v-for="(subject,index) in currentPaperVO.currentPaperSubjectVOList">
        <!-- 单选绘制 -->
        <div v-if="subject.subjectTypeName === '选择题'">
          <div>{{index+1}}:{{subject.subject}}</div>
          <div style="float: right">
            <el-button
              v-show="showBtnDelete"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleSubjectDelete(subject.id)"
            />
            <el-button
              v-show="showBtnAdd"
              type="success"
              icon="el-icon-plus"
              size="mini"
              circle
              @click="handleSubjectAdd()"
            />
          </div>
          <div v-for="(answer,index) in subject.subjectAnswerVoList">
            <el-radio :disabled="true" value>{{answer.option}}:{{answer.answer}}</el-radio>
          </div>
        </div>
        <!-- 不定项选择绘制 -->
        <div v-if="subject.subjectTypeName === '不定项选择'">
          <div>{{index+1}}:{{subject.subject}}</div>
          <div style="float: right">
            <el-button
              v-show="showBtnDelete"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleSubjectDelete(subject.id)"
            />
            <el-button
              v-show="showBtnAdd"
              type="success"
              icon="el-icon-plus"
              size="mini"
              circle
              @click="handleSubjectAdd()"
            />
          </div>
          <div v-for="(answer,index) in subject.subjectAnswerVOList">
            <el-checkbox :disabled="true" value>{{answer.option}}:{{answer.answer}}</el-checkbox>
          </div>
        </div>
        <!-- 判断题绘制 -->
        <div v-if="subject.subjectTypeName === '判断题'">
          <div>{{index+1}}:{{subject.subject}}</div>
          <div style="float: right">
            <el-button
              v-show="showBtnDelete"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleSubjectDelete(subject.id)"
            />
            <el-button
              v-show="showBtnAdd"
              type="success"
              icon="el-icon-plus"
              size="mini"
              circle
              @click="handleSubjectAdd()"
            />
          </div>
          <div v-for="answer in subject.subjectAnswerVOList">
            <el-radio disabled="true" value>{{answer.answer}}</el-radio>
          </div>
        </div>
        <!-- 填空题绘制 -->
        <div v-if="subject.subjectTypeName === '填空题'">
          <div>{{index+1}}:{{subject.subject}}</div>
          <div style="float: right">
            <el-button
              v-show="showBtnDelete"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleSubjectDelete(subject.id)"
            />
            <el-button
              v-show="showBtnAdd"
              type="success"
              icon="el-icon-plus"
              size="mini"
              circle
              @click="handleSubjectAdd()"
            />
          </div>
          <div>
            <el-input size="mini" style="width: 50%" :disabled="true"></el-input>
          </div>
        </div>
        <!-- 编程题绘制 -->
        <div v-if="subject.subjectTypeName === '编程题'">
          <div>{{index+1}}:{{subject.subject}}</div>
          <div style="float: right">
            <el-button
              v-show="showBtnDelete"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleSubjectDelete(subject.id)"
            />
            <el-button
              v-show="showBtnAdd"
              type="success"
              icon="el-icon-plus"
              size="mini"
              circle
              @click="handleSubjectAdd()"
            />
          </div>
          <div>
            <el-input size="mini" style="width: 50%" :disabled="true"></el-input>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 添加试题 -->

    <el-dialog title="选择题目" :visible.sync="showAddSubject">
      <el-row>
        题目名称
        <el-input size="mini" v-model="condition.name" auto-complete="off"></el-input>
        题目难度
        <el-select v-model="condition.difficulty" size="mini" clearable placeholder="请选择" style="width: 130px">
          <el-option
                  v-for="item in difficultyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
          />
        </el-select>
        题目类型
        <el-select size="mini" v-model="condition.subjectTypeId" placeholder="请选择">
          <el-option
                  v-for="item in subjectTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
          </el-option>
        </el-select>
        题目类别
        <el-select size="mini" v-model="condition.categoryId" placeholder="请选择">
          <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleQuerySubject()">搜索</el-button>
      </el-row>
      <el-table
              v-loading="loading"
              :data="subjectList"
              style="width: 100%"
              :height="tableHeight"
              :row-key="getRowKeys"
              @selection-change="handleSubjectSelectionChange"
      >
        <el-table-column type="selection" :reserve-selection="true" width="45px" />
        <el-table-column property="name" label="题目" width="150"></el-table-column>
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
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="danger" @click="showAddSubject = false">返回</el-button>
    </el-dialog>
  </el-row>

</template>

<script>
import { query } from '@/api/basedata/subject'
import { querySubjectType } from '@/api/basedata/subjectType'
import { queryCategory } from '@/api/basedata/category'
import { getQueryList } from '@/utils/treeList'
    export default {
        name: 'PaperInfo',
        props: {

            currentPaper: {
                type: Object,
                required: true
            },
            showDelete: {
                type: Boolean,
                required: false,
                default: false
            },
            showAdd: {
                type: Boolean,
                required: false,
                default: false
            },
            difficultyOptions:{
                type: Array,
                required: false,
                default: false,
            },
            subjectTypeOptions:{
                type: Array,
                required: false,
                default: false,
            },
            categoryOptions:{
                type: Array,
                required: false,
                default: false,
            }
        },
        data() {
            return {
                //父组件里save被点击时此vo传给父组件
                currentPaperVO: this.currentPaper,
                showBtnAdd: this.showAdd,
                showBtnDelete: this.showDelete,
                removedDataId:[],
                showAddSubject: false,
                subject:[],
                condition:{
                    currentPage: 1,
                    pageSize: 3,
                    name:'',
                    difficulty:'',
                    subjectTypeId:'',
                    categoryId:'',
                    total: 1
                },
                formLabelWidth:'40px',
                subjectList:[],
                selected:'',
                loading: false,
                deletedId:[],
                tableHeight: '400px',
            }
        },
        watch: {
            currentPaper(val) {
                this.currentPaperVO = val
                console.log(this.currentPaper)
            },
            showAdd(val) {
                this.showBtnAdd = val
            },
            showDelete(val) {
                this.showDelete = val
            },
        },
        created() {

        },
        methods: {
            handleSubjectDelete(e) {
                this.deletedId.push(e)
                console.log(this.deletedId)
              console.log(this.currentPaperVO)
                this.currentPaperVO.currentPaperSubjectVOList.forEach(function(item, index, arr) {
                    if (item.id === e) {
                        arr.splice(index, 1)
                    }
                })
                this.currentPaperVO.deletedId = this.deletedId
                console.log(this.currentPaperVO)
                // // 这里把id传出去
                // this.$emit('handleSubjectDelete', e)
            },
            handleSubjectAdd(e) {
                this.showAddSubject = true
                this.$emit('handleSubjectAdd', e)
            },
            handleQuerySubject(){
                this.loading = true
                query(this.condition).then(res=>{
                    this.subjectList = res.pageInfo.list
                    this.condition.total = res.total
                    this.loading = false
                    this.tableHeight = 300 + this.calcTableHeight(this.subjectList.length) + 'px';
                }).catch(e=>{this.loading = false})
            },

            calcTableHeight(count){
                return count * 30;
            },
            handleSubjectSelectionChange(selection){
                this.selected = selection
            },
            getRowKeys(row) {
                return row.id
            },
            handleSave(){
                if (this.selected!==null&&this.selected.length!==0){
                    console.log(this.selected[i])
                    let i = 0;
                    for (;i<this.selected.length;i++){
                        console.log(this.selected[i])
                        this.selected[i].subject = this.selected[i].name
                        this.currentPaperVO.currentPaperSubjectVOList.push(this.selected[i]);
                    }
                }
                this.showAddSubject = false
            },
            handleCurrentChange(currentPage) {
                this.condition.currentPage = currentPage
                this.loading = true
                query(this.condition).then(res => {
                    this.subjectList = res.pageInfo.list
                    this.condition.total = res.total
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            },
    }
}
</script>
