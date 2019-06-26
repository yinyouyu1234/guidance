<template>
  <div class="all-workorder--warpper">
    <view-title title="所有现场服务登记表" icon="icon-news"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="现场人员">
          <el-select size="mini" v-model="condition.executorUserId" placeholder="请输入姓名">
            <el-option
              v-for="item in optionsUserName"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select size="mini" v-model="condition.taskType" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini" v-model="condition.taskStatus" placeholder="请选择">
            <el-option
              v-for="item in taskStatusOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="dataChange"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input size="mini" v-model="condition.projectName" clearable placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="片区">
          <QcCascder v-model="cascaderValue" @changeCode="changeCode"/>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="filter" :loading="loading">查询</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :tableData="tableData"
        :columnData="columnData"
        :loading="tableLoading"
        :total="total"
        :page-index="condition.page"
        @getInfo="getInfo"
        @changePage="changePage"
      />
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import PcTable from "@/components/Table.vue";
import QcCascder from "@/components/QcCascder.vue";
import { formartTime } from "@/utils/formateTime";
import qs from "qs";
export default {
  name: "AllSceneRegisterForm",
  components: {
    ViewTitle,
    Search,
    PcTable,
    QcCascder
  },
  data() {
    return {
      optionsUserName: [],
      cascaderArrayStaitc: [
        "areaType",
        "groupType",
        "factoryType",
        "subFactoryType"
      ],
      cascaderValue: [],
      total: 0,
      loading: false,
      tableLoading: false,
      dataTime: "",
      condition: {
        page: 1,
        size: 10,
        originatorUserId: "",
        provinceType: "", //省
        cityType: "", //市
        areaType: "", // 片区
        groupType: "", // 集团
        factoryType: "", // 厂
        subFactoryType: "", // 分厂
        executorUserId: "",
        taskType: "",
        taskStatus: "",
        startTime: "",
        endTime: "",
        projectName: ""
      },
      taskStatusOption: [
        {
          value: "",
          label: "全部"
        },
        {
          value: 0,
          label: "未开始"
        },
        {
          value: 1,
          label: "进行中"
        },
        {
          value: 2,
          label: "已完成"
        }
      ],
      options: [],
      executorUserId: [],
      tableData: [],
      columnData: [
        {
          prop: "index",
          width: "70",
          label: "编号"
        },
        {
          prop: "projectName",
          label: "项目"
        },
        {
          prop: "executorUserName",
          label: "现场人员"
        },
        {
          prop: "supportType",
          label: "支持类型"
        },
        {
          prop: "areaType",
          label: "片区"
        },
        {
          prop: "serviceStatus",
          label: "服务状态"
        },
        {
          prop: "startTime",
          label: "呼叫时间"
        },
        {
          prop: "endTime",
          label: "完成时间"
        }
      ],
      session: ""
    };
  },
  watch: {
    dialogFormVisible() {
      if (!this.dialogFormVisible) {
        this.fileList = [];
        this.imgList = [];
        this.ruleForm = {
          title: "",
          content: "",
          id: "",
          img: []
        };
      }
    }
  },
  created() {
    this.getWorkList();
    this.getUserType();
    this.getOptionData();
    this.$store.state.app.sceneRegister = this.sessionInit;
  },
  mounted() {
    const { session } = this.$store.state.app;
    this.session = session;
  },
  methods: {
    changeCode(data) {
      const list = [...this.cascaderArrayStaitc];
      this.cascaderArrayStaitc.forEach(key => {
        delete this.condition[key];
      });
      list.length = this.cascaderValue.length;
      list.forEach((key, index) => {
        this.condition[key] = data[index];
      });
    },
    sessionInit(session) {
      this.session = session;
    },
    getOptionData() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/childrenlist/task_type`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const arr = res.data.data.map(item => {
              return {
                value: item.code,
                label: item.name
              };
            });
            this.options = this.options.concat(arr);
            this.$axios
              .get(`${this.commonApi}/dataDictionary/childrenlist/GUIDE`)
              .then(res => {
                if (res.data.retCode == 10000) {
                  const arr = res.data.data.map(item => {
                    return {
                      value: item.code,
                      label: item.name
                    };
                  });
                  this.options = this.options.concat(arr);
                  this.options.unshift({
                    value: "",
                    label: "全部"
                  });
                }
              });
          }
        });
    },
    getUserType() {
      this.$axios.get(`${this.commonApi}/user/1`).then(res => {
        if (res.data.retCode == 10000) {
          this.optionsUserName = res.data.data;
          this.optionsUserName.unshift({
            value: "",
            label: "全部"
          });
        }
      });
    },
    changePage(page) {
      this.condition.page = page;
      this.getWorkList();
    },
    filter() {
      this.condition.page = 1;
      this.getWorkList(true);
    },
    getInfo(row) {
      let type;
      if (
        row.supportType == "远程指导" &&
        (row.serviceStatus == "已受理" || row.serviceStatus == "未处理")
      ) {
        type = "hasSupport";
      } else if (
        row.supportType == "远程指导" &&
        row.serviceStatus == "已完成"
      ) {
        type = "hasSupportCom";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "已受理"
      ) {
        type = "hasProblemBack";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "已完成"
      ) {
        type = "hasComplete";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "未处理"
      ) {
        type = "notProblemBack";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "专家受理"
      ) {
        type = "exportAnwser";
      }
      this.$router.push({
        path: "/SceneGuidance",
        query: {
          id: row.id,
          areaType: row.areaType,
          type,
          taskId: row.taskId,
          taskCode: row.taskCode
        }
      });
    },
    getWorkList(filter = false) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .get(`${this.api}/onSiteService/list?${qs.stringify(this.condition)}`)
        .then(res => {
          this.loading = false;
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            const data = res.data.data.list;
            this.total = res.data.data.total;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.page - 1) * 10;
              item.buttonInfo = [
                {
                  name: "getInfo",
                  type: "primary",
                  label: "查看"
                }
              ];
            });
            this.tableData = data;
            filter &&
              this.$message({
                message: "搜索成功",
                type: "success"
              });
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    dataChange() {
      if (this.dataTime) {
        this.condition.startTime = formartTime(
          this.dataTime[0],
          "yyyy-MM-dd hh:mm:ss"
        );
        this.condition.endTime = formartTime(
          this.dataTime[1],
          "yyyy-MM-dd hh:mm:ss"
        );
      } else {
        this.condition.startTime = "";
        this.condition.endTime = "";
      }
    }
  }
};
</script>
<style lang="less">
</style>

