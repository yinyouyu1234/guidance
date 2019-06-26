<template>
  <div style="padding:0 20px">
    <div style="padding:20px 0;font-size:18px;">
      巡检轨迹
      <div style="float:right">
        <el-button size="mini" @click="back">返回</el-button>
      </div>
    </div>

    <div style="width:100%;height:400px" id="map_canvas"></div>
    <div style="padding:20px 0;font-size:18px;">巡检值</div>
    <pc-table
      :loading="loading"
      buttonColum="状态"
      :pagination="false"
      :columnData="columnData"
      :table-data="tableData"
      @getInfo="getInfo"
    />
    <el-dialog title="详情" width="600px" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm">
        <el-form-item
          v-for="(item) in form"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label+':'"
          label-width="120px"
          class="defect-manage"
        >{{item.value}}</el-form-item>
        <el-dialog width="50%" title :visible.sync="innerVisible" append-to-body>
          <video-dialog v-if="innerVisible" :url="dialogUrl"/>
        </el-dialog>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
      <image-list :list="imgList" @handleClick="bigImg"/>
    </el-dialog>
  </div>
</template>
<script>
import PcTable from "@/components/Table.vue";
import ImageList from "@/components/ImageList.vue";
import VideoDialog from "@/components/VideoDialog.vue";
export default {
  name: "CheckLine",
  components: {
    ImageList,
    VideoDialog,
    PcTable
  },
  data() {
    return {
      loading: true,
      form: [
        {
          label: "KKS",
          prop: "kks",
          value: ""
        },
        {
          label: "设备类型",
          prop: "equipment_type_name",
          value: ""
        },
        {
          label: "设备名称",
          prop: "equipment_name",
          value: ""
        },
        {
          label: "巡检部位",
          prop: "equipment_part_name",
          value: ""
        },
        {
          label: "巡检项",
          prop: "equipment_part_item_name",
          value: ""
        },
        {
          label: "标准",
          prop: "stand",
          value: ""
        },
        {
          label: "状态",
          prop: "status",
          value: ""
        },
        {
          label: "巡检值",
          prop: "value",
          value: ""
        },
        {
          label: "描述",
          prop: "description",
          value: ""
        }
      ],
      innerVisible: false,
      dialogFormVisible: false,
      dialogUrl: "",
      tableData: [],
      imgList: [],
      condition: {},
      columnData: [
        {
          prop: "index",
          label: "编号",
          width: 70
        },
        {
          prop: "kks",
          label: "KKS"
        },
        {
          prop: "equipment_name",
          label: "设备名称"
        },
        {
          prop: "equipment_part_name",
          label: "部位"
        },
        {
          prop: "equipment_part_item_name",
          label: "项目"
        },
        {
          prop: "stand",
          label: "标准"
        },
        {
          prop: "test_method",
          label: "检测方法"
        },
        {
          prop: "judge_method",
          label: "判断方法"
        },
        {
          prop: "start_time",
          label: "开始时间"
        },
        {
          prop: "value",
          label: "巡检值"
        }
        // {
        //   prop: "status",
        //   label: "状态"
        // }
      ],
      pointList: []
    };
  },
  created() {
    this.getAllByFlightsTask();
    this.getAllPointByFlightsTask();
  },
  mounted() {
    // this.mapInit();
  },
  methods: {
    bigImg(url) {
      this.dialogUrl = url;
      this.innerVisible = true;
    },
    getInfo(row) {
      this.dialogFormVisible = true;
      this.$axios
        .get(`${this.api}/patrolRecord/getExceptionDetail?id=${row.id}`)
        .then(res => {
          if (res.data.retCode === 10000) {
            const { data } = res.data;
            this.form.forEach(item => {
              item.value = data[item.prop];
            });
            this.imgList = data.img;
          }
        });
    },
    getAllPointByFlightsTask() {
      this.$axios
        .get(
          `${this.api}/patrolRecord/getAllPointByFlightsTask?id=${
            this.$route.query.id
          }`
        )
        .then(res => {
          if (res.data.retCode === 10000) {
            this.pointList = res.data.data.map(item => ({
              latitude: item.latitude,
              longitude: item.longitude
            }));

            this.mapInit(this.pointList);
          }
        });
    },
    getAllByFlightsTask() {
      this.$axios
        .get(
          `${this.api}/patrolRecord/getAllByFlightsTask?id=${
            this.$route.query.id
          }`
        )
        .then(res => {
          this.loading = false;
          if (res.data.retCode === 10000) {
            this.tableData = res.data.data;
            this.tableData.forEach((item, index) => {
              item.index = index + 1;
              if (item.status == 1) {
                item.status = "正常";
                item.buttonInfo = [
                  {
                    name: "edit",
                    type: "ss",
                    label: "正常",
                    isButton: true
                  }
                ];
              } else if (item.status == -1) {
                item.status = "异常";
                item.buttonInfo = [
                  {
                    name: "getInfo",
                    type: "danger",
                    label: "查看异常",
                    isButton: true
                  }
                ];
              } else {
                item.status = "未巡检";
                item.buttonInfo = [
                  {
                    name: "edit",
                    type: "ss",
                    label: "未巡检",
                    isButton: true
                  }
                ];
              }
            });
          }
        });
    },
    back() {
      this.$router.go(-1);
    },
    mapInit(pointList) {
      var marker;
      var map = new BMap.Map("map_canvas");
      map.enableScrollWheelZoom();
      map.centerAndZoom();
      var lushu;
      let list = pointList.map(item => {
        return new BMap.Point(item.longitude, item.latitude);
      });
      var convertor = new BMap.Convertor();
      convertor.translate(list, 1, 5, translateCallback);
      function translateCallback(data) {
        var arrPois = data.points;
        map.setViewport(arrPois);
        marker = new BMap.Marker(arrPois[0], {
          icon: new BMap.Icon(
            "https://yuhuantest.oss-cn-shanghai.aliyuncs.com/微信图片_20190413172816-20190413172851.png",
            new BMap.Size(40, 40),
            { anchor: new BMap.Size(30, 13) }
          )
        });
        var label = new BMap.Label("", { offset: new BMap.Size(0, -30) });
        label.setStyle({
          borderRadius: "10px",
          padding: "5px",
          background: "rgb(255, 255, 255)"
        });
        marker.setLabel(label);

        map.addOverlay(marker);
        BMapLib.LuShu.prototype._move = function(initPos, targetPos, effect) {
          var pointsArr = [initPos, targetPos]; //点数组
          var me = this,
            //当前的帧数
            currentCount = 0,
            //步长，米/秒
            timer = 1,
            step = this._opts.speed / (500 / timer),
            //初始坐标
            init_pos = this._projection.lngLatToPoint(initPos),
            //获取结束点的(x,y)坐标
            target_pos = this._projection.lngLatToPoint(targetPos),
            //总的步长
            count = Math.round(me._getDistance(init_pos, target_pos) / step);
          //显示折线 syj201607191107
          this._map.addOverlay(
            new BMap.Polyline(pointsArr, {
              strokeColor: "#111",
              strokeWeight: 5,
              strokeOpacity: 0.5
            })
          ); // 画线
          //如果小于1直接移动到下一点
          if (count < 1) {
            me._moveNext(++me.i);
            return;
          }
          me._intervalFlag = setInterval(function() {
            //两点之间当前帧数大于总帧数的时候，则说明已经完成移动
            if (currentCount >= count) {
              clearInterval(me._intervalFlag);
              //移动的点已经超过总的长度
              if (me.i > me._path.length) {
                return;
              }
              //运行下一个点
              me._moveNext(++me.i);
            } else {
              currentCount++;
              var x = effect(init_pos.x, target_pos.x, currentCount, count),
                y = effect(init_pos.y, target_pos.y, currentCount, count),
                pos = me._projection.pointToLngLat(new BMap.Pixel(x, y));
              //设置marker
              if (currentCount == 1) {
                var proPos = null;
                if (me.i - 1 >= 0) {
                  proPos = me._path[me.i - 1];
                }
                if (me._opts.enableRotation == true) {
                  me.setRotation(proPos, initPos, targetPos);
                }
                if (me._opts.autoView) {
                  if (!me._map.getBounds().containsPoint(pos)) {
                    me._map.setCenter(pos);
                  }
                }
              }
              //正在移动
              me._marker.setPosition(pos);
              //设置自定义overlay的位置
              me._setInfoWin(pos);
            }
          }, timer);
        };
        lushu = new BMapLib.LuShu(map, arrPois, {
          // autoView: true, //是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
          icon: new BMap.Icon(
            "https://yuhuantest.oss-cn-shanghai.aliyuncs.com/微信图片_20190413172816-20190413172851.png",
            new BMap.Size(40, 40),
            { anchor: new BMap.Size(13, 13) }
          ),
          speed: 1000,
          enableRotation: true, //是否设置marker随着道路的走向进行旋转
          landmarkPois: [
            // { lng: 116.306954, lat: 40.05718, html: "加油站", pauseTime: 2 }
          ]
        });
        marker.enableMassClear(); //设置后可以隐藏改点的覆盖物
        marker.hide();
        lushu.start();
      }
    }
  }
};
</script>
<style lang="less">
.BMap_Marker img {
  width: 30px;
  position: relative;
  top: 10px;
  left: 5px;
}
.defect-manage.el-form-item {
  margin-bottom: 0px;
}
</style>
