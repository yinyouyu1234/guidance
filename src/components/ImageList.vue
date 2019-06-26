<template>
  <div class="image-list--wrapper">
    <div v-for="(item, index) in myList" :key="index" @click="handleClick(item)">
      <video v-if="getName(item) === 'mp4'" :src="item"></video>
      <img v-if="getName(item) === 'jpg' || getName(item) === 'png'" :src="item" alt>
      <img
        :src="item"
        v-if="getName(item) !== 'jpg' && getName(item) !== 'png' && getName(item) !== 'mp4'"
        alt
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "ImageList",
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      myList: [],
      url: require("../assets/images/login-background.png")
    };
  },
  watch: {
    list() {
      this.myList = this.list;
    }
  },
  created() {
    this.myList = this.list;
  },
  methods: {
    getName(url) {
      return url.substring(url.lastIndexOf(".") + 1);
    },
    handleClick(url) {
      console.log();
      this.$emit("handleClick", url);
    }
  }
};
</script>
<style lang="less">
.image-list--wrapper {
  display: flex;
  flex-wrap: wrap;
  div {
    display: inline-block;
    width: 140px;
    height: 140px;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 10px;
    margin-bottom: 10px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
    }
    video {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
