<template>
  <div>
    <el-row class="tac">
      <el-col :span="24">
        <el-menu
          :default-active="navActive"
          class="el-menu-vertical-demo"
          active-text-color="#fff"
          @open="handleOpen"
          @close="handleClose"
          unique-opened
          :default-openeds="open"
        >
          <template v-for="(item, index) in navList">
            <el-submenu :key="index" :index="index.toString()" v-if="item.children">
              <template slot="title">
                <span class="iconfont" :class="item.icon"></span>
                <span>{{item.title}}</span>
              </template>
              <el-menu-item-group>
                <el-menu-item
                  v-for="(ele, index) in item.children"
                  :index="ele.id.toString()"
                  :key="index"
                  @click="handleNav(ele)"
                >{{ele.title}}</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-menu-item @click="handleNav(item)" :key="index" :index="index + 'a'" v-else>
              <span class="iconfont" :class="item.icon"></span>
              <span slot="title">{{item.title}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "LeftNav",
  data() {
    return {
      navList: [],
      open: ["0"],
      navActive: "a"
    };
  },
  created() {
    this.navList = JSON.parse(window.localStorage.getItem("menu"));
    console.log(this.navList);
    if (sessionStorage.getItem("navOpen")) {
      this.open = JSON.parse(sessionStorage.getItem("navOpen"));
    }
    if (sessionStorage.getItem("navActive")) {
      this.navActive = sessionStorage.getItem("navActive");
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      sessionStorage.setItem("navOpen", JSON.stringify(keyPath));
    },
    handleClose(key, keyPath) {},
    handleNav(item) {
      console.log(item);
      window.sessionStorage.setItem("navActive", item.id);
      this.$router.push({
        path: item.path
      });
    }
  }
};
</script>
<style lang="less">
.tac {
  border-right: solid 1px #e6e6e6;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  .el-menu {
    border: none;
  }
}
</style>
