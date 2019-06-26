<template>
  <div class="file-list--warpper">
    <ul class="el-upload-list el-upload-list--text">
      <li
        v-for="(item, index) in myList"
        :key="index"
        @click="handleClick(item)"
        tabindex="0"
        class="el-upload-list__item is-success"
      >
        <a class="el-upload-list__item-name">
          <i class="el-icon-document"></i>
          {{item.fileName}}
        </a>
        <label class="el-upload-list__item-status-label">
          <i class="el-icon-upload-success el-icon-circle-check"></i>
        </label>
        <i class="el-icon-close-tip">按 delete 键可删除</i>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "FileList",
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
  },
  methods: {
    handleClick(item) {
      window.open(item.url);
    }
  }
};
</script>
<style lang="less">
.file-list--warpper {
  width: 400px;
  padding: 0 10px;
}
</style>
