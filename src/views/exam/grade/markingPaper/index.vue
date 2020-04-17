<template>
  <div class="dashboard-container">
    <el-container style="height: 700px,width: 100%">
      <el-header style="height:9900px; width: 100%">
        <div>
          <label>试卷详情：</label>
          <br />
          <el-form ref="markingPaperVO" :model="markingPaperVO" :rules="rules" display>
            <el-card>
              <h3>{{ currentPaperVO.name }}</h3>
              <div
                v-for="(subject,index) in currentPaperVO.currentPaperSubjectDTOList"
                :key="index"
              >
                <div>
                  <!-- 客观题 -->
                  <div v-if="subject.objectiveSubject==true">
                    <el-row>
                      <hr />
                      {{ index+1 }}.{{ subject.subject }}
                      <el-input
                        v-model="markingPaperVO.markingAnswerVOList[index].score"
                        disabled
                        placeholder="分数"
                        style="width: 80px; float: right"
                      />
                      <p style="float: right; color: red">该题分值:{{ subject.score }}</p>
                      <br />
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;考生答案：{{ myAnswerVO[index].myAnswer }}
                      <br />
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;标准答案：{{ myAnswerVO[index].standardAnswer }}
                      <br />
                      <br />
                    </el-row>
                  </div>
                  <!-- 主观题 -->
                  <div v-else>
                    <el-row>
                      <hr />
                      <el-form-item>
                        {{ index+1 }}.{{ subject.subject }}
                        <el-input
                          v-model="markingPaperVO.markingAnswerVOList[index].score"
                          placeholder="分数"
                          style="width: 80px; float: right"
                          @blur="check(markingPaperVO.markingAnswerVOList[index].score,subject.score)"
                        />
                        <p style="float: right; color: red">该题分值:{{ subject.score }}</p>
                      </el-form-item>
                      <br />
                      <br />
                      <div
                        v-if="subject.subjectTypeId!=617015418787340288"
                      >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;考生答案：{{ myAnswerVO[index].myAnswer }}</div>
                      <div v-else>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;考生答案：
                        <img
                          :src="myAnswerVO[index].myAnswer"
                          alt="考生答案图片"
                          width="400px"
                          height="400px"
                        />
                      </div>
                      <br />
                      <el-input
                        v-model="markingPaperVO.markingAnswerVOList[index].evaluate"
                        placeholder="评价"
                        type="textarea"
                        style="width: 150px; float: right"
                      />
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;标准答案：{{ myAnswerVO[index].standardAnswer }}
                      <br />
                      <br />
                    </el-row>
                  </div>
                </div>
              </div>
            </el-card>
            <el-card>
              <el-form-item label="总得分:" prop="score">
                <el-input
                  v-model="markingPaperVO.score"
                  disabled
                  placeholder="分数"
                  style="width: 100px"
                />
                <p v-show="false">{{ sum }}</p>
              </el-form-item>
              <el-form-item label="评语:" prop="systemEvaluate">
                <el-input v-model="markingPaperVO.systemEvaluate" type="textarea" />
              </el-form-item>
              <el-button type="primary" @click="submitMarkingPaper">保存</el-button>
              <el-button type="danger" @click="backDialog = true">返回</el-button>
            </el-card>
          </el-form>
        </div>
        <el-dialog title="提示" :visible.sync="backDialog" width="30%">
          <span>离开后填写内容将不会被保存，确认离开？</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="backDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleBack();backDialog = false">确 定</el-button>
          </span>
        </el-dialog>
      </el-header>
    </el-container>
  </div>
</template>

<script>
import { save, getPaper, getPaperAnswer } from '@/api/exam/grade.js'
export default {
  name: 'Position',
  data() {
    return {
      status: this.$route.params.status,
      paperId: this.$route.params.paperId,
      backDialog: false,
      myAnswerVO: [],
      markingAnswerVO: {},
      markingPaperVO: {
        // score,evaluate,examRecordId,paperSubjectId
        markingAnswerVOList: [],
        examRecordId: this.$route.params.examRecordId,
        systemEvaluate: null,
        score: null
      },
      // 试卷
      currentPaperVO: {},
      rules: {
        score: [
          { required: true, message: '还有主观题未评分', trigger: 'blur' }
        ],
        systemEvaluate: [
          { required: true, message: '请输入评价', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    sum() {
      let total = 0
      for (let index = 0; index < this.markingPaperVO.markingAnswerVOList.length; index++) {
        total += parseFloat(this.markingPaperVO.markingAnswerVOList[index].score)
      }
      if (total > 0) {
        this.markingPaperVO.score = total
      }
      return total
    }
    // sum: {
    //   get() {
    //     return this.total
    //   },
    //   set() {
    //     let total = 0
    //     for (let index = 0; index < this.markingPaperVO.markingAnswerVOList.length; index++) {
    //       total += parseFloat(this.markingPaperVO.markingAnswerVOList[index].score)
    //     }
    //     if (total > 0) {
    //       this.markingPaperVO.score = total
    //     }
    //     return total
    //   }
    // }
  },
  mounted() {
    this.getThePaperAnswer()
    this.getThePaper()
  },
  methods: {
    // todo
    check(markScore, score) {
      return "hhhh"
    },
    // 获取答卷详情
    getThePaper() {
      getPaper(this.paperId).then(res => {
        this.currentPaperVO = res
        this.currentPaperVO.currentPaperSubjectDTOList.forEach((item, index) => {
          const params = JSON.parse(JSON.stringify(this.markingAnswerVO))
          if (item.objectiveSubject === true) {
            if (this.myAnswerVO[index].myAnswer === this.myAnswerVO[index].standardAnswer) {
              params.score = item.score
            } else {
              params.score = 0
            }
          } else {
            params.score = null
          }
          params.evaluate = ''
          params.objectiveSubject = item.objectiveSubject
          params.paperSubjectId = item.id
          this.markingPaperVO.markingAnswerVOList.push(params)
        })
      })
    },
    getThePaperAnswer() {
      getPaperAnswer(this.markingPaperVO.examRecordId).then(res => {
        this.myAnswerVO = res
      })
    },
    // 提交试卷批改 所有题和总分评语
    submitMarkingPaper() {
      console.log(this.markingPaperVO)
      this.$refs[ 'markingPaperVO' ].validate((valid) => {
        if (valid) {
          save(this.markingPaperVO)
          this.clear()
          this.$router.push('grade')
        } else {
          alert('信息填写不完整')
          return false
        }
      })
    },
    clear() {
      this.paperId = null
      this.markingPaperVO = {
        // score,evaluate,examRecordId,paperSubjectId
        markingAnswerVOList: [],
        examRecordId: null,
        systemEvaluate: null,
        score: null
      }
    },
    handleBack() {
      this.$router.push('grade')
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
