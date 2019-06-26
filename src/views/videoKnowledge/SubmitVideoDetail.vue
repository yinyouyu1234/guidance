<template>
  <div class="submit-video--wrapper">
    <view-title title="提交视频" icon="icon-tijiao"/>
    <div class="content">
      <el-form class="form" :model="ruleForm" ref="ruleForm">
        <el-form-item prop="title" label="项目名称" :label-width="formLabelWidth">
          <el-col :span="14">
            <el-input
              size="mini"
              width="300"
              placeholder="请输入项目名称"
              v-model="ruleForm.projectName"
              autocomplete="off"
            ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item prop="title" :inline="true" label="上传人员" :label-width="formLabelWidth">
          <el-col :span="14">
            <el-input size="mini" placeholder="请输入上传人员" v-model="userName" autocomplete="off"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item prop="title" :inline="true" label="视频长度" :label-width="formLabelWidth">
          <el-col :span="14">
            <el-input
              readonly
              size="mini"
              placeholder="请输入视频长度"
              v-model="ruleForm.timeLength"
              autocomplete="off"
            ></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <div class="content-bottom">
        <div class="content-left">
          <upload-video :list="videoList" @success="handleSuccess" @delete-video="deleteVideo"/>
        </div>
        <div class="content-right">
          <div class="content-right--top">
            <div class="right-title">已有标签</div>
            <el-tag
              :key="tag"
              v-for="tag in tags"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >{{tag.tagName}}</el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            ></el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加一个标签</el-button>
          </div>
          <div class="content-right--bottom">
            <div class="right-title">备注</div>
            <el-input type="textarea" :rows="4" placeholder="请输入备注内容" v-model="ruleForm.remark"></el-input>
          </div>
        </div>
      </div>
      <div class="buttons">
        <el-button
          v-if="ruleForm.reviewStatus === '待审核' && state != 'all' && pageState != 'pending'"
          type="primary"
          @click="save('/knowledgeBase/save','确认保存吗？')"
        >保 存</el-button>
        <el-button
          v-if="ruleForm.reviewStatus === '草稿' && state != 'all' && pageState != 'pending'"
          type="primary"
          @click="submit('/knowledgeBase/submit','确认提交吗？')"
        >提 交</el-button>
        <el-button
          v-if="pageState == 'pending' && state != 'all'"
          type="primary"
          @click="submit('/knowledgeBase/review','确认审核通过吗？')"
        >审核通过</el-button>
        <el-button
          v-if="pageState == 'pending' && state != 'all'"
          type="danger"
          @click="submit('/knowledgeBase/rejected','确认驳回吗？')"
        >驳 回</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import UploadVideo from "@/components/UploadVideo.vue";
import ViewTitle from "@/components/ViewTitle.vue";
import { getCookie } from "@/utils/cookie";
export default {
  components: {
    UploadVideo,
    ViewTitle
  },
  name: "SubmitVideoDetail",
  data() {
    return {
      state: this.$route.query.state,
      pageState: this.$route.query.pageState,
      userName: this.$route.query.name
        ? this.$route.query.name
        : JSON.parse(getCookie("user_info")).user_name,
      inputVisible: false,
      inputValue: "",
      formLabelWidth: "150px",
      tags: [],
      videoList: [],
      ruleForm: {
        id: "",
        projectName: "",
        remark: "",
        tags: [],
        timeLength: "",
        url: ""
      }
    };
  },
  created() {
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.$axios
        .get(`${this.api}/knowledgeBase/${this.$route.query.id}`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            this.ruleForm = data;
            this.tags = JSON.parse(JSON.stringify(this.ruleForm.tags));
            this.videoList = [
              {
                name: "",
                url: this.ruleForm.url
              }
            ];
          }
        });
    },
    deleteVideo() {
      this.ruleForm.url = "";
      this.ruleForm.timeLength = "";
    },
    handleSuccess(time, data) {
      this.ruleForm.timeLength = time;
      this.ruleForm.url = data[0].url;
    },
    submit(url, text) {
      if (this.ruleForm.timeLength == "") {
        this.$message({
          type: "warning",
          message: "请上传视频!"
        });
        return;
      }
      this.$confirm(text, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post(
              `${this.api}${url}?knowledgeBaseId=${Number(
                this.$route.query.id
              )}`
            )
            .then(res => {
              if (res.data.retCode == 10000) {
                this.$message({
                  type: "success",
                  message: "保存成功!"
                });
                this.$router.go(-1);
              }
            });

          this.myList = [];
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    save() {
      if (this.ruleForm.timeLength == "") {
        this.$message({
          type: "warning",
          message: "请上传视频!"
        });
        return;
      }
      this.$confirm("确认提交吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post(`${this.api}/knowledgeBase/save`, this.ruleForm)
            .then(res => {
              if (res.data.retCode == 10000) {
                this.$router.go(-1);
                this.$message({
                  type: "success",
                  message: "提交成功!"
                });
              }
            });

          this.myList = [];
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    handleClose(tag) {
      this.tags.splice(this.tags.indexOf(tag), 1);
      console.log(tag);
      this.ruleForm.tags.forEach(item => {
        if (item.tagName == tag.tagName) {
          item.del = 1;
        } else {
          item.del = 0;
        }
      });
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.tags.push({ id: "", tagName: inputValue });
        this.ruleForm.tags.push({ tagName: inputValue, del: 0 });
      }
      this.inputVisible = false;
      this.inputValue = "";
    }
  }
};
</script>
<style lang="less">
.submit-video--wrapper {
  .content {
    margin-top: 40px;
    // width: 800px;
    position: relative;
  }
  .el-form {
    width: 800px;
  }
  .content-bottom {
    overflow: hidden;
    // width: 800px;
    .content-left {
      float: left;
      padding: 20px 40px;
      height: 302px;
      width: 302px;
      border-right: 1px solid #dcdfe6;
    }
    .content-right {
      float: left;
      padding: 20px 40px;
      width: 500px;
      .content-right--top {
        max-width: 650px;
        border-bottom: 1px solid #dcdce6;
        padding-bottom: 40px;
        margin-bottom: 20px;
      }
      .right-title {
        color: #555;
        font-size: 20px;
        font-weight: bold;
        padding-bottom: 20px;
      }
    }
  }
  .el-tag {
    margin-left: 10px;
    margin-bottom: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    margin-bottom: 10px;
    vertical-align: bottom;
  }
  .buttons {
    text-align: center;
    width: 800px;
    margin-top: 30px;
  }
}
</style>
