<template>
  <div class="guidance-remote--warpper">
    <view-title title="录像回放" icon="icon-video"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="巡检人">
          <el-input size="mini" v-model="condition.searchStr" clearable placeholder="请输入巡检人"></el-input>
        </el-form-item>

        <el-form-item label="线路">
          <!-- <el-input size="mini" v-model="condition.route_name" clearable placeholder="请输入线路名称"></el-input> -->
          <el-select size="mini" clearable v-model="condition.patrol_route_id " placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini" clearable v-model="condition.task_status" placeholder="请选择">
            <el-option
              v-for="item in optionsStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="设备类型">
          <el-input
            size="mini"
            v-model="condition.equipment_type_name"
            clearable
            placeholder="请输入设备类型"
          ></el-input>
        </el-form-item>-->

        <el-form-item label="日期">
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="hangleChange"
          ></el-date-picker>
        </el-form-item>
        <!-- <el-form-item prop="code" label="片区">
          <QcCascder v-model="cascaderValue" @changeCode="changeCodeFilter"/>
        </el-form-item>-->
        <el-form-item>
          <el-button size="mini" :loading="loading" @click="filter">查询</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :tableData="tableData"
        :columnData="columnData"
        :loading="loading"
        :total="total"
        :page-index="condition.pageIndex"
        @getInfo="getInfo"
        @changePage="changePage"
      />
    </div>
    <el-dialog title="录像回放详情" width="920px" :visible.sync="dialogFormVisible">
      <el-table v-if="dialogFormVisible" border :data="tableDataDialog" style="width: 100%">
        <el-table-column width="60" label="编号" prop="index"></el-table-column>
        <el-table-column
          width="150px"
          :show-overflow-tooltip="true"
          label="设备名称"
          prop="equipment_name"
        ></el-table-column>
        <el-table-column width="150px" :show-overflow-tooltip="true" label="KKS" prop="kks"></el-table-column>
        <el-table-column
          width="150px"
          :show-overflow-tooltip="true"
          label="巡检时间"
          prop="record_time"
        ></el-table-column>
        <el-table-column label="图像">
          <template slot-scope="scope">
            <div v-if="scope.row.img" class="table-images--warpper">
              <div
                v-for="(item, index) in scope.row.img"
                :key="index"
                @click="handleImage(item)"
                class="img-inner--warpper"
              >
                <video :src="item"/>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div style="padding:20px 0 0 300px">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next, jumper"
          :total="dialogTotal"
        ></el-pagination>
      </div>
      <el-dialog width="50%" title="详情" :visible.sync="innerVisible" append-to-body>
        <video-dialog v-if="innerVisible" :url="dialogUrl"/>
      </el-dialog>
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
import VideoList from "@/components/VideoList.vue";
import VideoDialog from "@/components/VideoDialog.vue";
import QcCascder from "@/components/QcCascder.vue";
export default {
  name: "VideoPlayback",
  components: {
    ViewTitle,
    Search,
    PcTable,
    VideoList,
    VideoDialog,
    QcCascder
  },
  data() {
    return {
      dialogPageIndex: 1,
      dialogTotal: 100,
      tableDataDialog: [],
      optionsStatus: [
        {
          value: -1,
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
          label: "完成"
        }
      ],
      options: [],
      cascaderArrayStaitc: ["area", "group", "factory", "branch_factory"],
      cascaderValue: [],
      loading: false,
      dialogUrl: "",
      total: 0,
      loading: false,
      tableLoading: false,
      dialogFormVisible: false,
      innerVisible: false,
      dataTime: "",
      condition: {
        pageIndex: 1,
        pageSize: 10,
        searchStr: "",
        patrol_route_id: "",
        start_time: "",
        end_time: "",
        task_status: -1
      },
      imgList: [],
      ruleForm: {
        name: ""
      },
      rules: {
        name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ]
      },
      tableData: [],
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
          prop: "patrol_route_name",
          label: "线路名称"
        },
        {
          prop: "user_name",
          label: "巡检人"
        },
        {
          prop: "begin_time",
          label: "巡检开始时间"
        },
        {
          prop: "end_time",
          label: "巡检结束时间"
        },
        {
          prop: "status",
          label: "巡检状态"
        }
      ],
      rowId: ""
    };
  },
  watch: {},
  created() {
    this.getList();
    this.getLineAll();
  },
  mounted() {},
  methods: {
    handleCurrentChange(val) {
      this.dialogPageIndex = val;
      this.getReplyDetailList();
    },
    handleImage(url) {
      this.innerVisible = true;
      this.dialogUrl = url;
    },
    getLineAll() {
      this.$axios.get(`${this.api}/patrolRoute/getAll`).then(res => {
        if (res.data.retCode == 10000) {
          this.options = res.data.data;
        }
      });
    },
    updata(item) {
      this.$axios
        .post(`${this.api}/patrolRecord/editRecordImgDescription`, {
          id: item.id,
          description: item.description
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            this.$message({
              message: "更新成功",
              type: "success"
            });
          }
        });
    },
    hangleChange() {
      if (this.dataTime) {
        this.condition.start_time = this.dataTime[0].getTime();
        this.condition.end_time = this.dataTime[1].getTime();
      } else {
        this.condition.start_time = "";
        this.condition.end_time = "";
      }
    },
    getList(filter = false) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .post(`${this.appUrl}/patrolRoute/replyList`, this.condition)
        .then(res => {
          this.loading = false;
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            this.tableData = res.data.data.items;
            this.total = res.data.data.total;
            this.tableData.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.buttonInfo = [
                {
                  type: "primary",
                  name: "getInfo",
                  label: "回放"
                }
              ];
              item.task_type = item.task_type == 1 ? "常规巡检" : "随机巡检";
              item.status =
                item.status == 0
                  ? "未开始"
                  : item.status == 1
                  ? "进行中"
                  : "完成";
            });
            filter &&
              this.$message({
                message: "搜索成功",
                type: "success"
              });
          }
        });
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getList();
    },
    filter() {
      this.condition.pageIndex = 1;

      this.getList(true);
    },
    getReplyDetailList(rowId) {
      this.$axios
        .post(`${this.appUrl}/patrolRoute/getReplyDetailList`, {
          id: rowId ? rowId : this.rowId,
          pageIndex: this.dialogPageIndex,
          pageSize: 10
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            console.log(res.data.data.items);
            this.dialogTotal = res.data.data.total;
            const datas = res.data.data.items;
            datas.forEach((item, index) => {
              item.index = index + 1;
            });

            this.tableDataDialog = datas;
          }
        });
    },
    getInfo(row) {
      this.dialogFormVisible = true;
      this.rowId = row.id;
      this.getReplyDetailList(this.rowId);
    }
  }
};
</script>
<style lang="less">
.table-images--warpper {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  .img-inner--warpper {
    width: 40px;
    height: 40px;
    margin-left: 10px;
    cursor: pointer;
    video {
      width: 40px;
      height: 40px;
    }
  }
}
.guidance-remote--warpper {
  .down-item {
    height: 30px;
    cursor: pointer;
  }
  .dialog-videolist--warpper {
    overflow: hidden;
    .dialog-videolist--item {
      padding: 6px;
      float: left;
    }
  }
}
</style>

