<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { getCookie } from "@/utils/cookie";

export default {
  name: "App",
  created() {},
  mounted() {
    this.$nextTick(() => {
      console.log(JSON.parse(window.localStorage.getItem("routerList")));
      JSON.parse(window.localStorage.getItem("routerList")) &&
        this.$store.commit(
          "SET_ROUTER",
          JSON.parse(window.localStorage.getItem("routerList"))
        );
      setTimeout(() => {
        this.$store.dispatch("set_sigval");
      }, 1000);
      setInterval(() => {
        console.log(
          this.$store.state.app.session &&
            this.$store.state.app.session.getStatus()
        );
        if (
          this.$store.state.app.session &&
          this.$store.state.app.session.getStatus() == 0 &&
          getCookie("user_info")
        ) {
          console.log("重新登录");
          this.$store.dispatch("set_sigval");
        }
      }, 1000 * 60);
    });
  },
  methods: {}
};
</script>


<style lang="less">
.views {
  height: calc(~"100vh - 70px");
  overflow: auto !important;
}
</style>
