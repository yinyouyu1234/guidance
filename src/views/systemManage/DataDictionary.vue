<template>
  <div class="data-dictionary--warper">
    <view-title title="数据字典" icon="icon-zaixianzhidao"/>
    <div class="dictionary-box">
      <div class="dictionart-left">
        <el-tree
          :default-expanded-keys="arr"
          node-key="name"
          :expand-on-click-node="false"
          :data="data"
          :props="defaultProps"
          @node-click="handleNodeClick"
          @node-expand="expand"
          @node-collapse="collapse"
        ></el-tree>
      </div>
      <div v-if="editFormVisible" class="dictionart-right">
        <!-- <div class="title">操作类型</div> -->
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
          <el-tab-pane
            v-for="(item, index) in navList"
            :key="index"
            :label="item.label"
            :name="item.name"
          >
            <el-form :model="ruleForm" ref="ruleForm" label-width="150px" class="demo-ruleForm">
              <el-form-item label="节点名称" prop="application_name">
                <el-input
                  :readonly="activeName == 'addChild'"
                  v-if="activeName == 'addRoot'"
                  size="mini"
                  placeholder="请输入节点名称"
                  v-model="ruleForm.rootName"
                ></el-input>
                <el-input
                  v-else
                  :readonly="activeName == 'addChild'"
                  size="mini"
                  placeholder="请输入节点名称"
                  v-model="ruleForm.name"
                ></el-input>
              </el-form-item>
              <el-form-item label="应用节点编码" prop="application_code">
                <el-input
                  v-if="activeName == 'addRoot'"
                  :readonly="activeName == 'addChild'"
                  size="mini"
                  placeholder="请输入程序编码"
                  v-model="ruleForm.rootCode"
                ></el-input>
                <el-input
                  v-else
                  :readonly="activeName == 'addChild'"
                  size="mini"
                  placeholder="请输入程序编码"
                  v-model="ruleForm.code"
                ></el-input>
              </el-form-item>
              <el-form-item v-show="item.name == 'addChild'" label="子节点名称" prop="application_code">
                <el-input size="mini" placeholder="子节点名称" v-model="ruleForm.childrenName"></el-input>
              </el-form-item>
              <el-form-item v-show="item.name == 'addChild'" label="子节点编码" prop="application_code">
                <el-input size="mini" placeholder="子节点编码" v-model="ruleForm.childrenCode"></el-input>
              </el-form-item>
              <el-form-item label="排序" prop="application_code">
                <el-input
                  v-if="activeName == 'edit'"
                  size="mini"
                  type="number"
                  placeholder="请输入程序编码"
                  v-model="ruleForm.sort"
                ></el-input>
                <el-input
                  v-if="activeName == 'addChild'"
                  size="mini"
                  type="number"
                  placeholder="请输入程序编码"
                  v-model="ruleForm.childrenSort"
                ></el-input>
                <el-input
                  v-if="activeName == 'addRoot'"
                  size="mini"
                  type="number"
                  placeholder="请输入程序编码"
                  v-model="ruleForm.rootSort"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">保 存</el-button>
                <el-button type="danger" :disabled="!disable" @click="onDelete">删 除</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
export default {
  name: "DataDictionary",
  components: {
    ViewTitle
  },
  data() {
    return {
      disable: false,
      arr: [],
      activeTreeData: {},
      ruleForm: {
        code: "",
        id: "",
        name: "",
        childrenName: "",
        childrenCode: "",
        sort: "",
        rootSort: "",
        childrenSort: "",
        rootName: "",
        rootCode: ""
      },
      editFormVisible: false,
      navList: [
        {
          label: "编辑当前节点",
          name: "edit"
        },
        {
          label: "添加子节点",
          name: "addChild"
        },
        {
          label: "添加一级节点",
          name: "addRoot"
        }
      ],

      activeName: "edit",
      data: [],
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  created() {
    this.getTreeData();
  },
  methods: {
    expand(data) {
      this.arr.push(data.name);
    },
    collapse(data) {
      const index = this.arr.indexOf(data.name);

      this.arr.splice(index, 1);
    },
    getTreeData() {
      this.$axios.get(`${this.api}/ddd/getTree`).then(res => {
        if (res.data.retCode == 10000) {
          const { data } = res.data;
          this.data = this.treeDataFormat(data);
        }
      });
    },
    treeDataFormat(data) {
      data.forEach(item => {
        item.label = item.name;
        if (item.children) {
          this.treeDataFormat(item.children);
        }
      });
      return data;
    },
    onDelete() {
      this.$confirm("确认要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .get(`${this.api}/ddd/deleteNode?id=${this.ruleForm.id}`)
            .then(res => {
              if (res.data.retCode == 10000) {
                this.getTreeData();
                this.editFormVisible = false;
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
              }
            });
        })
        .catch(() => {});
    },
    onSubmit() {
      const obj = {};
      switch (this.activeName) {
        case "edit":
          obj.code = this.ruleForm.code;
          obj.id = this.ruleForm.id;
          obj.name = this.ruleForm.name;
          obj.parent_code = this.ruleForm.parent_code;
          obj.sort = this.ruleForm.sort;
          break;
        case "addChild":
          obj.code = this.ruleForm.childrenCode;
          obj.id = "";
          obj.name = this.ruleForm.childrenName;
          obj.parent_code = this.ruleForm.code;
          obj.sort = this.ruleForm.childrenSort;
          break;
        case "addRoot":
          obj.code = this.ruleForm.rootCode;
          obj.id = "";
          obj.name = this.ruleForm.rootName;
          obj.parent_code = "";
          obj.sort = this.ruleForm.rootSort;
          break;
      }
      this.$axios.post(`${this.api}/ddd/editNode`, obj).then(res => {
        if (res.data.retCode == 10000) {
          this.getTreeData();
          this.$message({
            type: "success",
            message: "保存成功"
          });
        }
      });
    },
    handleClick(tab, event) {},
    handleNodeClick(data) {
      if (data.children && data.children.length > 0) {
        this.disable = false;
      } else {
        this.disable = true;
      }
      const obj = {
        code: "",
        id: "",
        name: "",
        childrenName: "",
        childrenCode: "",
        sort: "",
        rootSort: "",
        childrenSort: "",
        rootName: "",
        rootCode: ""
      };
      this.activeTreeData = data;
      this.editFormVisible = true;
      this.ruleForm = {
        ...obj,
        ...data.current
      };
    }
  }
};
</script>
<style lang="less">
.data-dictionary--warper {
  .dictionary-box {
    overflow: hidden;
    box-sizing: border-box;
    padding: 40px 80px;
    width: 1200px;
    box-sizing: border-box;
  }
  .dictionart-left {
    float: left;
    width: 300px;
  }
  .dictionart-right {
    float: left;
    width: 600px;
  }
  .el-tabs__header {
    margin-bottom: 36px;
  }
  .dictionart-right {
    box-sizing: border-box;
    border-left: 1px solid #e4e7ed;
    position: relative;
    right: 1px;
  }
  .el-tabs__content {
    padding-right: 40px;
  }
}
</style>