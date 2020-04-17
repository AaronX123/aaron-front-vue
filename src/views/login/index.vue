<template>
  <div id="login">
    <div id="bgd">
      <canvas
        id="myCanvas"
        :width="width"
        :height="height"
      />
    </div>
    <div id="loginBox">
      <h4>登录</h4>
      <el-form
        v-show="showLogin"
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-width="0px"
      >
        <el-form-item
          label=""
          prop="code"
          style="margin-top:40px;"
        >
          <el-row>
            <el-col :span="3">
              <span class="svg-container">
                <svg-icon icon-class="user" />
              </span>
            </el-col>
            <el-col :span="18">
              <el-input
                v-model="loginForm.code"
                class="inps"
                placeholder="工号"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label=""
          prop="passWord"
        >
          <el-row>
            <el-col :span="3">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
            </el-col>
            <el-col :span="19">
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                class="inps"
                placeholder="密码"
                :type="passwordType"
                name="password"
                tabindex="2"
                auto-complete="on"
                @keyup.enter.native="login"
              />
            </el-col>
            <el-col :span="2">
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item style="margin-top:55px;">
          <el-button
            :loading="loading"
            type="primary"
            round
            class="submitBtn"
            @click.native.prevent="login"
          >登录</el-button>
        </el-form-item>
      </el-form>
      <slide-verify
        v-show="showSlide"
        class="slide"
        :l="42"
        :r="10"
        :w="310"
        :h="155"
        :slider-text="text"
        @success="onSuccess"
        @fail="onFail"
        @refresh="onRefresh"
      />
      <div class="tips">
        <span>欢迎登陆后台管理系统</span>
      </div>
    </div>
  </div>
</template>
<script>
import { getIp } from '@/utils/getIp'
import Vue from 'vue'
import SlideVerify from 'vue-monoplasty-slide-verify'

Vue.use(SlideVerify)

export default {
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('Please enter the code'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      canvas: null,
      context: null,
      stars: [], // 星星数组
      shadowColorList: [
        '#39f',
        '#ec5707',
        '#b031d4',
        '#22e6c7',
        '#92d819',
        '#14d7f1',
        '#e23c66'
      ], // 阴影颜色列表
      directionList: ['leftTop', 'leftBottom', 'rightTop', 'rightBottom'], // 星星运行方向
      speed: 50, // 星星运行速度
      last_star_created_time: new Date(), // 上次重绘星星时间
      Ball: class Ball {
        constructor(radius) {
          this.x = 0
          this.y = 0
          this.radius = radius
          this.color = ''
          this.shadowColor = ''
          this.direction = ''
        }
        draw(context) {
          context.save()
          context.translate(this.x, this.y)
          context.lineWidth = this.lineWidth
          const my_gradient = context.createLinearGradient(0, 0, 0, 8)
          my_gradient.addColorStop(0, this.color)
          my_gradient.addColorStop(1, this.shadowColor)
          context.fillStyle = my_gradient
          context.beginPath()
          context.arc(0, 0, this.radius, 0, Math.PI * 2, true)
          context.closePath()
          context.shadowColor = this.shadowColor
          context.shadowOffsetX = 0
          context.shadowOffsetY = 0
          context.shadowBlur = 10
          context.fill()
          context.restore()
        }
      }, // 工厂模式定义Ball类
      width: window.innerWidth,
      height: window.innerHeight,
      loginForm: {
        code: 'admin',
        password: '123456',
        ip: ''
      },
      text: '请向右滑动划框',
      showSlide: false,
      showLogin: true,
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      loginRules: {
        code: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.canvas = document.getElementById('myCanvas')
    this.context = this.canvas.getContext('2d')
    this.createStar(true)
    this.drawFrame()
  },
  methods: {
    // 提交登录
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
      // 验证条，成功后回调onSuccess,失败回调onFail
    login() {
      this.$refs.loginForm.validate(valid => {
        this.showSlide = true
        this.showLogin = false
      })
    },
    onSuccess() {
      this.handleLogin()
    },
    onFail() {
      this.$message.error('验证失败，请重新登录验证')
      if (valid) {
        this.showLogin = true
        this.showSlide = false
      } else {
        console.log('error submit!!')
        return false
      }
    },
      // 刷新验证条
    onRefresh() {
    },
    handleLogin() {
      getIp().then(res => {
        this.loginForm.ip = res.cip
        this.loading = true
        this.showLogin = true
        this.showSlide = false
        this.$store.dispatch('user/login', this.loginForm).then(() => {
          this.$router.push({ path: this.redirect || '/' })
          this.loading = false
          this.$store.dispatch('user/getInfo')
          this.$store.dispatch('user/getMenu')
          this.$router.push({
            name: 'Welcome'
          })
        }).catch(() => {
          this.loading = false
        })
      })
    },
    // 重复动画
    drawFrame() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.createStar(false)
      this.stars.forEach(this.moveStar)
    },
    // 展示所有的星星
    createStar(params) {
      const now = new Date()
      if (params) {
        // 初始化星星
        for (let i = 0; i < 50; i++) {
          const radius = Math.random() * 3 + 2
          const star = new this.Ball(radius)
          star.x = Math.random() * this.canvas.width + 1
          star.y = Math.random() * this.canvas.height + 1
          star.color = '#ffffff'
          star.shadowColor = this.shadowColorList[
            Math.floor(Math.random() * this.shadowColorList.length)
          ]
          star.direction = this.directionList[
            Math.floor(Math.random() * this.directionList.length)
          ]
          this.stars.push(star)
        }
      } else if (!params && now - this.last_star_created_time > 3000) {
        // 每隔3秒重绘修改颜色其中30个球阴影颜色
        for (let i = 0; i < 30; i++) {
          this.stars[i].shadowColor = this.shadowColorList[
            Math.floor(Math.random() * this.shadowColorList.length)
          ]
        }
        this.last_star_created_time = now
      }
    },
    // 移动
    moveStar(star, index) {
      if (star.y - this.canvas.height > 0) {
        // 触底
        if (Math.floor(Math.random() * 2) === 1) {
          star.direction = 'leftTop'
        } else {
          star.direction = 'rightTop'
        }
      } else if (star.y < 2) {
        // 触顶
        if (Math.floor(Math.random() * 2) === 1) {
          star.direction = 'rightBottom'
        } else {
          star.direction = 'leftBottom'
        }
      } else if (star.x < 2) {
        // 左边
        if (Math.floor(Math.random() * 2) === 1) {
          star.direction = 'rightTop'
        } else {
          star.direction = 'rightBottom'
        }
      } else if (star.x - this.canvas.width > 0) {
        // 右边
        if (Math.floor(Math.random() * 2) === 1) {
          star.direction = 'leftBottom'
        } else {
          star.direction = 'leftTop'
        }
      }
      if (star.direction === 'leftTop') {
        star.y -= star.radius / this.speed
        star.x -= star.radius / this.speed
      } else if (star.direction === 'rightBottom') {
        star.y += star.radius / this.speed
        star.x += star.radius / this.speed
      } else if (star.direction === 'leftBottom') {
        star.y += star.radius / this.speed
        star.x -= star.radius / this.speed
      } else if (star.direction === 'rightTop') {
        star.y -= star.radius / this.speed
        star.x += star.radius / this.speed
      }
      star.draw(this.context)
    }
  }
}
</script>
<style lang='scss' scoped>
#login {
  width: 100vw;
  padding: 0;
  margin: 0;
  height: 100vh;
  font-size: 16px;
  background-repeat: no-repeat;
  background-position: left top;
  background-color: #242645;
  color: #fff;
  font-family: "Source Sans Pro";
  background-size: 100%;
  background-image: url("../../assets/login.png");
  position: relative;
  #bgd {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
  #loginBox {
    width: 400px;
    height: 400px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    padding: 50px 40px 40px 40px;
    box-shadow: -15px 15px 15px rgba(6, 17, 47, 0.7);
    opacity: 1;
    background: linear-gradient(
      230deg,
      rgba(53, 57, 74, 0) 0%,
      rgb(0, 0, 0) 100%
    );
    /deep/ .inps input {
      border: none;
      color: #fff;
      background-color: transparent;
      font-size: 12px;
    }
    .tips {
      padding: 20px 0 0 0;
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;
    }
    .slide {
      z-index: 10000;
    }
    .submitBtn {
      background-color: transparent;
      color: #39f;
      width: 200px;
    }
    .iconfont {
      color: #fff;
    }
    .svg-container {
      color: #889aa4;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }
  }
}
</style>
