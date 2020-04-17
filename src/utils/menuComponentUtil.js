export default {
  welcome: () => import('@/views/welcome'),
  dictionary: () => import('@/views/basedata/dictionary/index'),
  category: () => import('@/views/basedata/category/index'),
  subjectType: () => import('@/views/basedata/subjectType/index'),
  subject: () => import('@/views/basedata/subject/index'),
  combExamConfig: () => import('@/views/basedata/combExamConfig/index'),
  saveCombExamConfig: () =>
    import('@/views/basedata/combExamConfig/saveCombExamConfig/index'),
  updateCombExamConfig: () =>
    import('@/views/basedata/combExamConfig/updateCombExamConfig/index'),
  organization: () => import('@/views/user/organization/index'),
  company: () => import('@/views/user/company/index'),
  department: () => import('@/views/user/department/index'),
  resource: () => import('@/views/user/resource/index'),
  role: () => import('@/views/user/role/index'),
  position: () => import('@/views/user/position/index'),
  user: () => import('@/views/user/user/index'),
  systemParam: () => import('@/views/user/systemParam/index'),
  userOnlineInfo: () => import('@/views/user/userOnlineInfo/index'),
  composition: () => import('@/views/paper/composition/index'),
  normalGen: () => import('@/views/paper/composition/normalGen/index'),
  fastGen: () => import('@/views/paper/composition/fastGen/index'),
  upload: () => import('@/views/paper/upload/index'),
  download: () => import('@/views/paper/download/index'),
  maintenance: () => import('@/views/paper/maintenance/index'),
  template: () => import('@/views/paper/template/index'),
  examPublish: () => import('@/views/exam/examPublish/index'),
  markingPaper: () => import('@/views/exam/grade/markingPaper/index'),
  answer: () => import('@/views/exam/answer/index'),
  grade: () => import('@/views/exam/grade/index'),
  report: () => import('@/views/exam/report/index'),
  checkPaper: () => import('@/views/exam/answer/checkPaper/index'),
  userAllocation: () => import('@/views/user/role/userAllocation/index')
}