<template>
  <div>
    <el-cascader
      size="mini"
      :options="rootData"
      @change="changeValue"
      :props="props"
      clearable
      v-model="myData"
    ></el-cascader>
  </div>
</template>
<script>
export default {
  name: "QcCascder",
  data() {
    return {
      myData: [],
      rootData: [],
      options2: [],
      props: {
        value: "label",
        children: "children"
      },
      list: []
    };
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: "area"
    }
  },
  watch: {
    data() {
      this.myData = this.value;
    }
  },
  created() {
    let url = "";
    if (this.status == "area") {
      url = this.status;
    } else {
      url = this.status;
    }
    this.myData = this.value;
    this.$axios
      .get(`${this.commonApi}/dataDictionary/list/${url}`)
      .then(res => {
        if (res.data.retCode == 10000) {
          res.data.data.forEach(item => {
            item.label = item.name;
          });
          this.list = res.data.data;
          this.rootData = this.toTree([...res.data.data], url);
        }
      });
  },
  methods: {
    changeValue(e) {
      console.log(e);
      this.$emit("input", e);
      const arr = [];
      e.forEach(ele => {
        this.list.forEach(item => {
          if (ele == item.name) {
            console.log(ele);
            arr.push(item.code);
          }
        });
      });
      this.$emit("changeCode", arr);
    },
    toTree(data, parentCode) {
      var tree = [];
      var temp;
      for (var i = 0; i < data.length; i++) {
        if (data[i].parentCode == parentCode) {
          var obj = data[i];
          temp = this.toTree(data, data[i].code);

          if (temp.length > 0) {
            obj.children = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    }
  }
};
</script>
