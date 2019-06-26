<template>
  <div>
    <view-title title="报警配置" icon="icon-peizhi"/>
    <div style="padding:20px">
      <el-tag>异常报警配置</el-tag>
    </div>
    <div style="padding:20px 80px">
      <el-checkbox v-model="form.checked">是否启用报警</el-checkbox>
    </div>
    <div v-if="form.checked">
      <div style="padding:20px 80px">
        <el-checkbox v-model="form.checkedMessage">是否启用系统推送</el-checkbox>
        <div v-if="form.checkedMessage" class="textarea-box">
          <el-input
            maxlength="500"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
            placeholder="请输入员工号，每个以逗号分隔。例如：xxxxxxx,xxxxxxx（注意逗号用英文符号）"
            v-model="form.message"
          ></el-input>
        </div>
      </div>
      <div style="padding:20px 80px">
        <el-checkbox v-model="form.checkedEmail">是否启用邮件报警</el-checkbox>
        <div class="textarea-box">
          <el-input
            v-if="form.checkedEmail"
            maxlength="500"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
            placeholder="请输入邮件地址，每个以逗号分隔。例如：5061xxxxx@qq.com,5s4d5s@163.com（注意逗号用英文符号）"
            v-model="form.emailMessage"
          ></el-input>
        </div>
      </div>
    </div>
    <div style="padding:20px 80px">
      <el-checkbox v-model="form.checkedGPS">是否启用GPS验证</el-checkbox>
    </div>
    <!-- <el-form size class="form">
      <el-form-item prop="projectName" label="专家支持率" label-width="110px">
        <el-col :span="4">
          <el-input width="100px" size="mini" type="number" placeholder="输入专家支持率"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="projectName" label="知识库满意度" label-width="110px">
        <el-col :span="4">
          <el-input size="mini" type="number" placeholder="输入知识满意度"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="projectName" label="问题答复率" label-width="110px">
        <el-col :span="4">
          <el-input size="mini" type="number" placeholder="输入问题答复率"></el-input>
        </el-col>
      </el-form-item>
    </el-form>-->
    <div style="padding:20px 80px">
      <div class="textarea-box" style="text-align:right">
        <el-button type="primary" @click="submit">保存</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
export default {
  components: {
    ViewTitle
  },
  name: "Setcaution",
  data() {
    return {
      form: {
        checked: false,
        checkedGPS: false,
        checkedMessage: false,
        message: "",
        checkedEmail: false,
        emailMessage: "",
        id: ""
      },
      initData: {}
    };
  },
  computed: {},
  created() {
    this.getData();
  },
  methods: {
    getData() {
      this.$axios.get(`${this.api}/warning/get`).then(res => {
        if (res.data.retCode === 10000) {
          const { data } = res.data;
          this.form.checkedGPS = data.use_gps;
          this.form.id = data.id;
          if (data.phone_number || data.email) {
            this.form.checked = true;
            if (data.phone_number) {
              this.form.checkedMessage = true;
              this.form.message = data.phone_number;
            }
            if (data.email) {
              this.form.checkedEmail = true;
              this.form.emailMessage = data.email;
            }
            this.initData = JSON.parse(JSON.stringify(this.form));
          } else {
            this.form.emailMessage = "";
            this.form.message = "";
          }
        }
      });
    },
    submit() {
      if (this.isSame()) {
        this.$message({
          message: "未发生改变",
          type: "warning"
        });
        return;
      }
      const messageArray = this.form.message.split(",");
      const v = messageArray.every(item => /^1[34578]\d{9}$/.test(item));
      if (this.form.checkedMessage && this.form.message.trim().length == 0) {
        this.$message({
          message: "请输入手机号码",
          type: "warning"
        });
        return;
      }
      if (this.form.checkedMessage && !v) {
        this.$message({
          message: "输入手机格式有误",
          type: "warning"
        });
        return;
      }
      const emailMessageArray = this.form.emailMessage.split(",");
      if (this.form.checkedEmail && this.form.emailMessage.trim().length == 0) {
        this.$message({
          message: "请输入邮箱",
          type: "warning"
        });
        return;
      }
      this.$axios
        .post(`${this.api}/warning/put`, {
          id: this.form.id,
          phone_number: !this.form.checked
            ? ""
            : this.form.checkedMessage
            ? this.form.message
            : "",
          email: !this.form.checked
            ? ""
            : this.form.checkedEmail
            ? this.form.emailMessage
            : "",
          use_gps: this.form.checkedGPS
        })
        .then(res => {
          if (res.data.retCode === 10000) {
            this.$message({
              message: "保存成功",
              type: "success"
            });
            this.getData();
          }
        });
    },
    isSame() {
      return Object.keys(this.initData).every(
        key => this.initData[key] === this.form[key]
      );
    }
  }
};
</script>
<style lang="less">
.textarea-box {
  padding-top: 10px;
  max-width: 500px;
  min-width: 300px;
}
</style>
