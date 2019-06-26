<template>
  <div class="all-workorder--warpper">
    <view-title title="我发起的工单" icon="icon-news"/>
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
        @getLine="getLine"
      />
    </div>
    <el-dialog title="轨迹详情" :visible.sync="dialogVisible" width="800px">
      <el-table v-if="dialogVisible" border :data="tableDataDialog" style="width: 100%">
        <el-table-column label="编号" prop="index" width="60"></el-table-column>
        <el-table-column
          width="140px"
          :show-overflow-tooltip="true"
          label="操作内容"
          prop="step_detail_content"
        ></el-table-column>
        <el-table-column
          width="140px"
          :show-overflow-tooltip="true"
          label="操作标准"
          prop="step_detail_standard"
        ></el-table-column>
        <el-table-column label="图片">
          <template slot-scope="scope">
            <div v-if="scope.row.img" class="table-image--warpper">
              <div
                v-for="(item, index) in scope.row.img.split(',')"
                :key="index"
                @click="handleImage(item)"
                class="img-inner--warpper"
              >
                <img :src="item" alt>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog width="800px" title="大图" :visible.sync="innerVisible" append-to-body>
      <img :src="bigImgUrl" alt>
    </el-dialog>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import PcTable from "@/components/Table.vue";
import QcCascder from "@/components/QcCascder.vue";
import { formartTime } from "@/utils/formateTime";
import { getCookie } from "@/utils/cookie";
import qs from "qs";
export default {
  name: "MineSubmitWorkOrder",
  components: {
    ViewTitle,
    Search,
    PcTable,
    QcCascder
  },
  data() {
    return {
      bigImgUrl: "",
      innerVisible: false,
      tableDataDialog: [],
      dialogVisible: false,
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
        originatorUserId: JSON.parse(getCookie("user_info")).id,
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
      optionsUserName: [],
      options: [],
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
          prop: "taskType",
          label: "任务类型"
        },
        {
          prop: "areaType",
          label: "片区"
        },
        {
          prop: "taskStatus",
          label: "状态"
        },
        {
          prop: "starTime",
          label: "任务开始时间"
        },
        {
          prop: "endTime",
          label: "任务结束时间"
        },
        {
          prop: "createTime",
          label: "创建时间"
        }
      ]
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
    this.getOptionData();
    this.getUserType();
  },
  mounted() {},
  methods: {
    handleImage(url) {
      this.innerVisible = true;
      this.bigImgUrl = url;
    },
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
    changePage(page) {
      this.condition.page = page;
      this.getWorkList();
    },
    filter() {
      this.condition.page = 1;
      this.getWorkList(true);
    },
    getInfo(row) {
      this.$router.push({
        path: "/workOrderManage/WorkOrderDetail",
        query: {
          id: row.id
        }
      });
    },
    getLine(row) {
      if (row.taskId == null) {
        this.$message({
          type: "warning",
          message: "未指定任务"
        });
        return;
      }
      if (row.taskType == "巡检") {
        this.$router.push({
          path: "/CheckLine",
          query: {
            id: row.id
          }
        });
      } else {
        this.dialogVisible = true;
        this.$axios
          .get(`${this.api}/workorder/getGuideTaskPath/${row.taskId}`)
          .then(res => {
            if (res.data.retCode == 10000) {
              const { data } = res.data;
              data.forEach((item, index) => {
                item.index = index + 1;
              });
              this.tableDataDialog = data;
            }
          });
      }
    },
    getWorkList(filter = false) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .get(`${this.api}/workorder/list?${qs.stringify(this.condition)}`)
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
                },
                {
                  name: "getLine",
                  type: "primary",
                  label: "轨迹"
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
.table-image--warpper {
  display: flex;
  .img-inner--warpper {
    width: 40px;
    height: 40px;
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>

