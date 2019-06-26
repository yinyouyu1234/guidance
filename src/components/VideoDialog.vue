<template>
  <div>
    <div v-if="status == 'picture'">
      <img :src="url" alt>
    </div>
    <div v-if="status == 'video'">
      <video class="myvideo" autoplay controls :src="url"></video>
    </div>
  </div>
</template>
<script>
export default {
  name: "VideoDialog",
  props: {
    backgroundUrl: {
      type: String,
      default: "http://127.0.0.1:7086/aaa/213/stream/1.m3u8"
    },
    url: {
      type: String
    }
  },
  data() {
    return {
      status: ""
    };
  },
  watch: {},
  mounted() {
    const imgType = ["jpg", "jpeg", "png"];
    const videoType = ["mp4", "m3u8"];
    const index = this.url.lastIndexOf(".");
    let filename = this.url.substring(index + 1);
    if (imgType.indexOf(filename.toLowerCase()) != -1) {
      //picture
      this.status = "picture";
    } else if (videoType.indexOf(filename.toLowerCase()) != -1) {
      //video
      this.status = "video";
    } else {
      this.status = "other";
    }
  },
  methods: {}
};
</script>
<style lang="less">
.myvideo {
  width: 100%;
  height: 500px;
}
</style>
