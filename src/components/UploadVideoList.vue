<template>
  <div class="upload-video-list">
    <div>
      <image-list :list="imgList" @handleClick="bigImg"/>
    </div>
    <div style="padding-left:10px">
      <el-upload
        :action="url"
        :headers="head"
        list-type="picture-card"
        :on-remove="handleRemove"
        :on-preview="handlePictureCardPreview"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        :on-exceed="handleExceed"
        :show-file-list="false"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </div>

    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt>
    </el-dialog>
  </div>
</template>
<script>
import ImageList from "@/components/ImageList.vue";
import { getCookie } from "@/utils/cookie";
export default {
  components: {
    ImageList
  },
  name: "UploadVideoList",
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      dialogVisible: false,
      dialogImageUrl: "",
      dialogUrl: "",
      imgList: [],
      url: `${this.upload}/upload/uploadimg`,
      head: { token }
    };
  },
  created() {
    console.log(this.url, "--------");
  },
  methods: {
    handleExceed() {},
    bigImg(url) {
      console.log(url);
      this.dialogUrl = url;
      this.innerVisible = true;
    },
    handlePictureCardPreview() {},

    beforeAvatarUpload() {
      console.log(1);
    },
    handleAvatarSuccess(data) {
      console.log("上传成功", data);
      this.imgList.push(data.data);
    },
    handleRemove() {
      console.log("删除");
    }
  }
};
</script>
<style lang="less">
.upload-video-list {
  display: flex;
  padding-left: 10px;
  // display: inline-block;
  .el-upload--picture-card {
    height: 144px;
    width: 144px;
  }
}
</style>
