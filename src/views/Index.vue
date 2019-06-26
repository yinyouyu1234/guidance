<template>
  <div v-loading="loading" class="index-charts--warpper">
    <div class="title">现场项目支持系统</div>
    <div class="top">
      <div class="map--warpper">
        <div id="allmap"></div>
      </div>
      <div class="table--warper">
        <div class="item-title">项目支持统计表</div>
        <pc-table :pagination="false" :tableData="data.table" :columnData="columnData"/>
      </div>
    </div>
    <div class="chart--wrapper">
      <div id="chart"></div>
      <div id="chart1"></div>
      <div id="chart2"></div>
    </div>
  </div>
</template>
<script charset="utf-8" >
import { city } from "./city.js";
import PcTable from "@/components/Table.vue";

export default {
  name: "Index",
  components: {
    PcTable
  },
  data() {
    return {
      data: {},
      tableData: [],
      loading: false,
      columnData: [
        {
          prop: "index",
          width: 70,
          label: "编号"
        },
        {
          prop: "project_name",
          label: "项目名称"
        },
        {
          prop: "executor_user_name",
          label: "现场人员"
        },
        {
          prop: "task_num",
          label: "任务数量"
        }
      ]
    };
  },
  created() {
    this.getData();
  },
  methods: {
    mapInit(points) {
      // 百度地图API功能
      var map = new BMap.Map("allmap");
      var point = new BMap.Point(105, 37);
      map.centerAndZoom(point, 5);
      // 编写自定义函数,创建标注
      function addMarker(point) {
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);
      }
      console.log(points);
      for (var i = 0; i < points.length; i++) {
        const item = points[i];
        console.log(item, 1);
        var point = new BMap.Point(item.latitude, item.longitude);

        addMarker(point);
      }
    },
    getData() {
      this.$axios
        .get(`${this.api}/index/dataStatistics?taskNum=10`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            data.table.forEach((item, index) => {
              item.index = index + 1;
            });
            this.data = data;
            this.chartInit("chart", this.data.expertRate, "专家支持率");
            this.chartInit("chart1", this.data.knowledgeRate, "知识库满意度");
            this.chartInit("chart2", this.data.questionRate, "问题答复率");
            this.mapInit(this.formartCity(this.data.cities));
          }
        });
    },
    formartCity(data) {
      return data.map(item => {
        const obj = {};
        for (let i = 0; i < city.length; i++) {
          if (city[i].city == item) {
            obj.latitude = city[i].latitude;
            obj.longitude = city[i].longitude;
            break;
          }
        }
        return obj;
      });
    },
    chartInit(id, persent, str) {
      let chart = this.$echarts.init(document.getElementById(id));
      chart.setOption({
        tooltip: {
          formatter: "{a} <br/>{b} : {c}%"
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        series: [
          {
            title: {},
            name: "百分比",
            type: "gauge",
            detail: { formatter: "{value}%" },
            data: [{ value: persent, name: str }],
            // startAngle: "225",
            axisLine: {
              lineStyle: {
                color: [[0.2, "#E6A23C"], [0.8, "#409EFF"], [1, "#67C23A"]]
                // width: 50
              }
            },
            axisLabel: {
              show: true,
              formatter: function(value) {}
            }
          }
        ]
      });
    }
  }
};
</script>
<style lang="less">
.index-charts--warpper {
  .title {
    font-size: 30px;
    text-align: center;
    height: 60px;
    line-height: 60px;
  }
  .item-title {
    font-size: 20px;
    text-align: center;
    height: 40px;
    line-height: 40px;
  }
  .top {
    display: flex;
  }
  #allmap {
    height: 600px;
    width: 800px;
  }
  .map--warpper {
    padding: 20px;
  }
  .chart--wrapper {
    display: flex;
  }
  #chart {
    height: 500px;
    width: 500px;
  }
  #chart1 {
    height: 500px;
    width: 500px;
  }
  #chart2 {
    height: 500px;
    width: 500px;
  }
  .table--warper {
    width: 570px;
    padding: 20px;
  }
}
</style>
