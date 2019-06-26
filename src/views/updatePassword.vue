<template>
  <div>
    <view-title title="修改密码" icon="icon-xiugaimima"/>
    <div class="update-password">
      <el-form
        :model="ruleForm2"
        status-icon
        :rules="rules2"
        ref="ruleForm2"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="旧密码:" prop="old_password">
          <el-input size="mini" v-model.number="ruleForm2.old_password"></el-input>
        </el-form-item>
        <el-form-item label="新密码:" prop="pass">
          <el-input size="mini" type="password" v-model="pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码:" prop="new_password">
          <el-input size="mini" type="password" v-model="ruleForm2.new_password" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm2')">提交</el-button>
          <el-button @click="resetForm('ruleForm2')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
export default {
  name: "updatePassword",
  components: {
    ViewTitle
  },
  data() {
    var checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入旧密码"));
      }
      setTimeout(() => {
        if (value.lendth == 0) {
          callback(new Error("请输入旧密码"));
        } else {
          callback();
        }
      }, 1000);
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.ruleForm2.new_password !== "") {
          this.$refs.ruleForm2.validateField("new_password");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      ruleForm2: {
        old_password: "",
        new_password: ""
      },
      pass: "",
      rules2: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        new_password: [
          { validator: validatePass2, trigger: "blur" },
          { min: 6, message: "至少6位", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios
            .post(`${this.api}/user/editPassword`, this.ruleForm2)
            .then(res => {
              console.log(res);
              if (res.data.retCode == 10000) {
                this.$message({
                  type: "success",
                  message: "修改成功"
                });
              }
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.pass = "";
    }
  }
};
</script>
<style lang="less">
.update-password {
  width: 600px;
  // margin: 200px auto;
  position: absolute;
  top: 200px;
  left: 30%;
}
</style>
