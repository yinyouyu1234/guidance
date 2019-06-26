<template>
  <div>
    <view-title title="巡检人员报表" icon="icon-renyuan"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="KKS">
          <el-input size="mini" v-model="condition.kks" clearable placeholder="请输入KKS码"></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input size="mini" v-model="condition.equipment_name" clearable placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="巡检人员">
          <el-input size="mini" v-model="condition.user_name" clearable placeholder="请输入巡检人员"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="daterange"
            @change="changeData"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="filter" :loading="loading">查询</el-button>
          <el-button
            size="mini"
            :disabled="tableData.length == 0"
            @click="downLoad"
            type="primary"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :tableData="tableData"
        :columnData="columnData"
        :loading="tableLoading"
        :total="total"
        :page-index="condition.pageIndex"
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
import ImageList from "@/components/ImageList.vue";
import VideoDialog from "@/components/VideoDialog.vue";
import { formartTime } from "@/utils/formateTime.js";
export default {
  name: "PatrolPersonnel",
  components: {
    ViewTitle,
    Search,
    PcTable,
    ImageList,
    VideoDialog
  },
  data() {
    return {
      total: 0,
      loading: false,
      tableLoading: false,
      dialogFormVisible: false,
      innerVisible: false,
      formLabelWidth: "120px",
      dataTime: "",
      condition: {
        pageIndex: 1,
        pageSize: 10,
        kks: "",
        equipment_name: "",
        start_time: null,
        end_time: null,
        state: "",
        user_name: ""
      },
      form: [
        {
          label: "KKS",
          prop: "number",
          value: "",
          password: false
        },
        {
          label: "设备类型",
          prop: "name",
          value: "",
          password: false
        },
        {
          label: "设备名称",
          prop: "password",
          value: "",
          password: true
        },
        {
          label: "巡检部位",
          prop: "phoneNumber",
          value: "",
          password: false
        },
        {
          label: "巡检项",
          prop: "department",
          value: "",
          password: false
        },
        {
          label: "标准",
          prop: "post",
          value: "",
          password: false
        },
        {
          label: "状态",
          prop: "post",
          value: "",
          password: false
        },
        {
          label: "巡检值",
          prop: "post",
          value: "",
          password: false
        },
        {
          label: "描述",
          prop: "post",
          value: "",
          password: false
        }
      ],
      tableData: [],
      columnData: [
        {
          prop: "index",
          width: 70,
          label: "编号"
        },
        {
          prop: "kks",
          label: "KKS"
        },
        {
          prop: "equipment_type_name",
          label: "设备类型"
        },
        {
          prop: "equipment_name",
          label: "设备名称"
        },
        {
          prop: "user_name",
          label: "巡检人员"
        },
        {
          prop: "flights_type",
          label: "巡检类型"
        },
        {
          prop: "start_time",
          label: "时间"
        }
      ],
      options: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "1",
          label: "启用"
        },
        {
          value: "0",
          label: "禁用"
        }
      ]
    };
  },
  watch: {
    dialogFormVisible() {
      if (this.dialogFormVisible) {
        setTimeout(() => {
          this.mapInit();
        }, 1000);
      }
    }
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    downLoad() {
      let url = `${
        this.api
      }/report/getUserReport?pageSize=-1&kks=${encodeURIComponent(
        this.condition.kks
      )}&equipment_name=${this.condition.equipment_name}&user_name=${
        this.condition.user_name
      }`;

      if (this.condition.start_time) {
        url += `&start_time=${this.condition.start_time}`;
      }
      if (this.condition.end_time) {
        url += `&end_time=${this.condition.end_time}`;
      }
      window.open(url);
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getList();
    },
    changeData(time) {
      if (time) {
        this.condition.start_time = time[0].getTime();
        this.condition.end_time = time[1].getTime();
      } else {
        this.condition.start_time = "";
        this.condition.end_time = "";
      }
    },
    filter() {
      this.condition.pageIndex = 1;
      this.getList(true);
    },
    getList(filter) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .post(`${this.api}/report/getUserReportList`, this.condition)
        .then(res => {
          this.tableLoading = false;
          this.loading = false;
          if (res.data.retCode == 10000) {
            const data = res.data.data.items;
            this.total = res.data.data.total;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.start_time = formartTime(
                new Date(item.start_time),
                "yyyy-MM-dd hh:mm:ss"
              );
              item.buttonInfo = [
                {
                  name: "getInfo",
                  type: "primary",
                  label: "查看"
                }
              ];
            });
            this.tableData = data;
            if (filter) {
              this.$message({
                type: "success",
                message: "搜索成功"
              });
            }
          }
        });
    },
    getInfo(row) {
      this.$router.push({
        path: "/CheckLine",
        query: {
          id: row.task_id
        }
      });
    }
  }
};
</script>

