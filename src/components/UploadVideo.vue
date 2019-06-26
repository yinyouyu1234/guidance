<template>
  <div class="qingce-upload--video">
    <div v-if="upLoading" class="percent--warpper">
      <el-progress type="circle" :percentage="percentage"></el-progress>
    </div>

    <el-upload
      v-loading="upLoading"
      v-if="myList.length == 0"
      class="upload-demo"
      :action="url"
      :headers="head"
      :on-preview="handlePreview"
      :on-progress="handleProgress"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
      :on-success="handleAvatarSuccess"
      :limit="1"
      :on-exceed="handleExceed"
      :file-list="fileList"
    >
      <div class="el-upload--picture-card">
        <i class="el-icon-plus"></i>
      </div>
      <div slot="tip" class="el-upload__tip">只能上传视频文件（mp4格式）</div>
    </el-upload>
    <div
      v-if="myList.length == 1"
      @mouseenter="handleEnter"
      @mouseleave="handleLeave"
      class="video-active"
    >
      <video :src="myList[0].url" @click="playVideo"></video>

      <transition name="fade">
        <div v-show="active" class="delete-button">
          <i @click="deleteVideo" class="el-icon-delete"></i>
        </div>
      </transition>
    </div>

    <el-dialog title :visible.sync="dialogVisible">
      <video-dialog v-if="dialogVisible" :url="dialogImageUrl"/>
    </el-dialog>
  </div>
</template>
<script>
import VideoDialog from "@/components/VideoDialog.vue";
export default {
  components: {
    VideoDialog
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const token = this.token;
    return {
      upLoading: false,
      percentage: 0,
      loading: false,
      dialogImageUrl: "",
      dialogVisible: false,
      head: { token },
      url: `${this.upload}/upload/uploadimg`,
      active: false,
      uploadShow: true,
      fileList: [],
      myList: []
    };
  },
  watch: {
    list() {
      this.myList = this.list;
    }
  },
  mounted() {},
  created() {
    this.myList = this.list;
  },
  methods: {
    handleProgress(event, file, fileList) {
      this.percentage = parseInt(event.percent);
      if (this.percentage < 100) {
        this.upLoading = true;
      } else {
        this.upLoading = false;
      }
    },
    handleAvatarSuccess(res, file) {
      this.myList.push({
        name: file.name,
        url: res.data
      });
      this.$message({
        type: "success",
        message: "上传成功!"
      });
      setTimeout(() => {
        const seconds = parseInt(document.querySelector("video").duration);
        const time =
          seconds > 60
            ? `${
                parseInt(seconds / 60) < 10
                  ? "0" + parseInt(seconds / 60)
                  : parseInt(seconds / 60)
              }:${seconds % 60 < 10 ? "0" + (seconds % 60) : seconds % 60}`
            : `00:${seconds > 9 ? seconds : "0" + seconds}`;
        this.$emit("success", time, this.myList);
      }, 500);
    },
    playVideo() {
      this.dialogVisible = true;
      this.dialogImageUrl = this.myList[0].url;
    },
    deleteVideo() {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.myList = [];
          this.$emit("deleteVideo");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleLeave() {
      this.active = false;
    },
    handleEnter() {
      this.active = true;
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    }
  }
};
</script>
<style lang="less">
.qingce-upload--video {
  .percent--warpper {
    position: absolute;
    top: 200px;
    left: 130px;
    z-index: 9999;
  }
  .el-upload--picture-card {
    width: 300px;
    height: 300px;
    line-height: 300px;
  }
  .video-active {
    width: 300px;
    height: 300px;
    border: 1px dashed #c0ccda;
    border-radius: 6px;
    position: relative;
    .delete-button {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 36px;
      background: rgba(255, 255, 255, 0.4);
      text-align: center;
      line-height: 36px;
      i {
        font-size: 20px;
        cursor: pointer;
      }
    }
    video {
      width: 100%;
      height: 100%;
      cursor: pointer;
      border-radius: 6px;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
</style>