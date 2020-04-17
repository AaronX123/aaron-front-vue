<template>
  <div class="dashboard-container">
    <el-container style="height: 700px,width: 100%">
      <el-header style="height:9900px; width: 100%">
        <div>
          <label>试卷详情：</label>
          <br>
          <el-card>
            <h3>{{ currentPaperVO.name }}</h3>
            <div v-for="(subject,index) in currentPaperVO.currentPaperSubjectDTOList" :key="index">
              <div>
                <el-row>
                  <hr>
                  {{ index+1 }}.{{ subject.subject }}
                  <br>
                  <br>
                  <div v-if="subject.subjectTypeId!=617015418787340288">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;考生答案：{{ myAnswerVO[index].myAnswer }}</div>
                  <div v-else>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;考生答案：<img :src="myAnswerVO[index].myAnswer" alt="考生答案图片"></div>
                  <br>
                  <br>
                </el-row>
              </div>
            </div>
          </el-card>
          <el-card>
            <el-form display>
              <el-button type="danger" @click="handleBack()">返回</el-button>
            </el-form>
          </el-card>
        </div>
      </el-header>
    </el-container>
  </div>
</template>

<script>
import { getPaper, getPaperAnswer } from '@/api/exam/grade.js'
export default {
  name: 'Position',
  data() {
    return {
      // imgUrl: 'http://boss-bes-image.oss-cn-hangzhou.aliyuncs.com/images/aaaaaa1569553330926_95f7aacb',
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
      currentPaperVO: {}
    }
  },
  mounted() {
    this.getThePaperAnswer()
    this.getThePaper()
  },
  created() {

  },
  methods: {
    // 获取答卷详情
    getThePaper() {
      getPaper(this.paperId).then(res => {
        this.currentPaperVO = res
      })
    },
    getThePaperAnswer() {
      getPaperAnswer(this.markingPaperVO.examRecordId).then(res => {
        this.myAnswerVO = res
      })
    },
    handleBack() {
      this.$router.push('answer')
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
