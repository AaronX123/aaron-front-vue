<template>
  <div class="dashboard-container">
    <div v-show="loading" class="loading-content">
      <loading />
    </div>
    <h3 style="margin: 0px">
      为 {{ title }} 分配用户
    </h3>
    <el-container>
      <!--el-main为表格主体的部分，下面都可以直接抄-->
      <el-main>
        <el-header style="height:20% width: 100%">
          <el-row>
            <el-form inline style="float: left">
              <el-form-item label="工号：">
                <el-input v-model="queryForm.code" size="mini" style="width: 120px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="姓名：">
                <el-input v-model="queryForm.name" size="mini" style="width: 120px" placeholder="请输入" />
              </el-form-item>
              <el-form-item>
                <perms-button perms="queryUserManagement" label="查询" @click="queryUserData" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="display: inline">
            <perms-button perms="userAllocation" label="用户分配" icon="el-icon-user" @click="selectUserAllocation()" />
            <el-button size="mini" type="info" icon="el-icon-info" @click="close">返回上级页面</el-button>
          </el-row>
        </el-header>
        <el-main>
          <el-table
            ref="multipleTable"
            :data="userData"
            border
            stripe
            style="width: 100%"
            @selection-change="userSelectionChange"
          >
            <el-table-column type="selection" width="35" />
            <el-table-column prop="code" label="工号" align="center" />
            <el-table-column prop="name" label="姓名" align="center" />
            <el-table-column prop="roleName" label="角色" align="center" />
            <el-table-column prop="departmentName" label="部门" align="center" />
            <el-table-column prop="positionName" label="职位" align="center" />
          </el-table>
          <pagination
            :total="total"
            :current-page="queryForm.currentPage"
            :page-size="pageSize"
            @handleCurrentChange="handleCurrentChange"
          />
        </el-main>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import PermsButton from '@/components/PermsButton/index'
import Pagination from '@/components/Pagination/index'
import loading from '@/components/Loading/index'
import { closePage } from '@/utils/pageUtils'
import { getUserForRoleForm, allocationRole } from '@/api/user/role'
export default {
  name: 'UserAllocation',
  components: { PermsButton, loading, Pagination },
  data() {
    return {
      updateUserAllocstion: this.$route.params.updateUserAllocstion,
      loading: false,
      queryForm: {
        id: '',
        name: '',
        code: '',
        companyId: '',
        orgId: '',
        currentPage: 1,
        pageSize: 10
      },
      title: '',
      total: 1,
      userData: [],
      userSelection: [],
      updateRoleForUserForm: []
    }
  },
  mounted() {
    this.getUserData()
  },
  methods: {
    getUserData() {
      this.queryForm.id = this.updateUserAllocstion.id
      this.queryForm.companyId = this.updateUserAllocstion.companyId
      this.queryForm.orgId = this.updateUserAllocstion.orgId
      this.title = this.updateUserAllocstion.name
      getUserForRoleForm(this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        this.total = res.total
        for (const n in this.userData) {
          if (this.userData[n].flag !== null) {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(this.userData[n])
            })
          }
        }
      }).catch(() => {
        this.loading = false
      })
    },
    queryUserData() {
      this.loading = true
      getUserForRoleForm(this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        for (const n in this.userData) {
          if (this.userData[n].flag !== null) {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(this.userData[n])
            })
          }
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    userSelectionChange(val) {
      this.userSelection = val
      console.log(this.userSelection)
    },
    handleCurrentChange(currentPage) {
      this.queryForm.currentPage = currentPage
      this.loading = true
      getUserForRoleForm(this.queryForm).then(res => {
        this.userData = res.pageInfo.list
        for (const n in this.userData) {
          if (this.userData[n].flag !== null) {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(this.userData[n])
            })
          }
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    selectUserAllocation() {
      if (this.userSelection.length < 1) {
        this.$message({
          message: '请选择一个用户进行分配',
          type: 'faile'
        })
      } else {
        this.$confirm('确认将角色分配给该用户吗？', '提示', {}).then(() => {
          this.loading = true
          for (const n in this.userSelection) {
            this.updateRoleForUserForm[n] = {}
            this.updateRoleForUserForm[n].userId = this.userSelection[n].id
            this.updateRoleForUserForm[n].roleId = this.updateUserAllocstion.id
            this.updateRoleForUserForm[n].companyId = this.updateUserAllocstion.companyId
          }
          console.log(this.updateRoleForUserForm)
          allocationRole(this.updateRoleForUserForm).then(res => {
            this.getUserData()
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        })
      }
    },
    close() {
      closePage(this.$route)
    }

  }
}
</script>
<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 10px;
  }
}
</style>
