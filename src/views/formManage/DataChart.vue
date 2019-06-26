<template>
  <div class="guidance-remote--warpper">
    <view-title title="数据走势图" icon="icon-weibiaoti--"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="KKS">
          <el-input size="mini" v-model="condition.kks" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input size="mini" v-model="condition.equipment_name" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" :loading="loading" @click="filter">查询</el-button>
          <el-button
            size="mini"
            :disabled="tableData.length == 0"
            @click="downLoadAll"
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
    <el-dialog title width="750px" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="16">
          时间：
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-col>

        <el-col :span="7">
          <el-button size="mini" @click="filteData">查询</el-button>
          <el-button size="mini" type="primary" @click="downLoadChart">导出</el-button>
        </el-col>
      </el-row>
      <div id="myChart" :style="{width: '100%', height: '300px', marginTop: '10px'}"></div>
      <!-- <div v-else>暂无数据</div> -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import PcTable from "@/components/Table.vue";
import { formartTime } from "@/utils/formateTime.js";
export default {
  name: "DataChart",
  components: {
    ViewTitle,
    Search,
    PcTable
  },
  data() {
    return {
      total: 0,
      loading: false,
      tableLoading: false,
      dialogFormVisible: false,
      innerVisible: false,
      formLabelWidth: "120px",
      dataTime: [
        new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
        new Date()
      ],
      condition: {
        pageIndex: "1",
        pageSize: "10",
        kks: "",
        equipment_name: ""
      },
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
          prop: "data",
          label: "最新数据"
        },
        {
          prop: "collected_time",
          label: "最新采集时间"
        }
      ],
      equipment_id: ""
    };
  },
  watch: {
    dialogFormVisible() {
      if (this.dialogFormVisible) {
      } else {
        this.dataTime = [
          new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
          new Date()
        ];
      }
    },
    dataTime() {
      const day = new Date().getDate();
      const now = new Date();
      if (this.dataTime) {
      } else {
        this.dataTime = [
          new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
          new Date()
        ];
      }
    }
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    filteData() {
      this.getInfo(false, true);
    },
    downLoadAll() {
      let url = `${
        this.api
      }/report/getEquipmentCollectionDataReport?pageSize=-1&kks=${encodeURIComponent(
        this.condition.kks
      )}&equipment_name=${this.condition.equipment_name}`;
      window.open(url);
    },
    downLoadChart() {
      let url = `${
        this.api
      }/report/getEquipmentDiagramReport?start_time=${this.dataTime[0].getTime()}&equipment_id=${encodeURIComponent(
        this.equipment_id
      )}&end_time=${this.dataTime[1].getTime()}`;
      window.open(url);
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getList();
    },
    filter() {
      this.condition.pageIndex = 1;
      this.getList(true);
    },
    getList(fiter) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .post(
          `${this.api}/report/getEquipmentCollectionDataList`,
          this.condition
        )
        .then(res => {
          this.tableLoading = false;
          this.loading = false;
          if (res.data.retCode == 10000) {
            const data = res.data.data.items;
            this.total = res.data.data.total;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.collected_time = formartTime(
                new Date(item.collected_time),
                "yyyy-MM-dd hh:mm:ss"
              );
              item.buttonInfo = [
                {
                  name: "getInfo",
                  type: "primary",
                  label: "曲线图"
                }
              ];
            });
            this.tableData = data;
            if (fiter) {
              this.$message({
                type: "success",
                message: "搜索成功"
              });
            }
          }
        });
    },
    chartInit(chartData) {
      let myChart = this.$echarts.init(document.getElementById("myChart"));
      var data = [];
      let temp = this.dataTime[0].getTime();
      const end_time = this.dataTime[1];
      let arr = [];
      while (temp < end_time.getTime()) {
        temp += 1000 * 60 * 5;
        arr.push(formartTime(new Date(temp), "MM-dd hh:mm"));
      }

      arr.unshift("product");
      const temperatureList = [];
      temperatureList.push(arr);
      const seriesLIst = chartData.map(item => {
        let arr = item.data.split(",");
        arr.unshift(item.name);
        temperatureList.push(arr);
        return {
          type: "line",
          smooth: true,
          seriesLayoutBy: "row"
        };
      });
      myChart.setOption({
        tooltip: {
          trigger: "axis"
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        // dataZoom: [
        //   {
        //     type: "slider",
        //     show: true,
        //     xAxisIndex: [0],
        //     start: 1,
        //     end: 100
        //   },
        //   {
        //     type: "inside",
        //     xAxisIndex: [0],
        //     start: 1,
        //     end: 35
        //   }
        // ],
        xAxis: {
          type: "category",
          axisPointer: {
            label: {
              formatter: function(params) {
                return params.value;
              }
            }
          }
        },
        yAxis: {
          type: "value",
          name: "温度℃",
          max: function(value) {
            return value.max + 5;
          },
          min: function(value) {
            return value.max - 5;
          }
        },
        series: seriesLIst,
        dataset: {
          // 提供一份数据。
          source: temperatureList
        }
      });
    },
    getInfo(row, filter = false) {
      if (row) {
        this.equipment_id = row.id;
      }
      const obj = {
        start_time: this.dataTime[0].getTime(),
        end_time: this.dataTime[1].getTime(),
        equipment_id: this.equipment_id
      };
      this.$axios
        .post(`${this.api}/report/getEquipmentDiagram`, obj)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.chartInit(res.data.data);
            if (filter) {
              this.$message({
                type: "success",
                message: "搜索成功"
              });
            }
          }
        });
      this.dialogFormVisible = true;
    }
  }
};
</script>
<style lang="less">
.guidance-remote--warpper {
  .down-item {
    height: 30px;
    cursor: pointer;
  }
}
</style>

