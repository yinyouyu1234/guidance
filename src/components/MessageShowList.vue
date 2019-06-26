<template>
  <div class="message-show-list">
    <ul>
      <li v-for="(item, index) in myList" :key="index">{{item}}</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "MessageShowList",
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      myList: []
    };
  },
  watch: {
    list() {
      this.myList = this.list;
    }
  },
  created() {
    this.myList = this.list;
  }
};
</script>
<style lang="less">
.message-show-list {
  display: inline-block;
  width: 316px;
  height: 156px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px 15px;
  overflow: auto;
  li {
    // height: 24px;
    // line-height: 24px;
  }
}
</style>
