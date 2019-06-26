<template>
  <div class="guidance-remote--warpper">
    <view-title title="线路管理" icon="icon-xianlu"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="线路名称">
          <el-input size="mini" v-model="condition.patrol_root_name" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <!-- <el-form-item label="类型">
          <el-select size="mini" v-model="condition.route_type" placeholder="请选择">
            <el-option
              v-for="item in optionsLine"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>-->

        <el-form-item prop="code" label="片区">
          <QcCascder v-model="cascaderValue" @changeCode="changeCodeFilter"/>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="filter" :loading="loading">查询</el-button>
          <el-button size="mini" type="primary" @click="addClick">添加</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :loading="tableLoading"
        :tableData="tableData"
        :columnData="columnData"
        :total="total"
        :page-index="condition.pageIndex"
        @edit="edit"
        @disable="disable"
        @enable="enable"
        @changePage="changePage"
        @export="exportData"
      />
    </div>
    <el-dialog
      :close-on-click-modal="false"
      title="基本信息"
      width="800px"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item prop="patrol_name" label="线路名称" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.patrol_name"></el-input>
        </el-form-item>
        <el-form-item prop="status" label="状态" :label-width="formLabelWidth">
          <el-select size="mini" v-model="ruleForm.status" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="input-box" prop="code" label="片区" :label-width="formLabelWidth">
          <QcCascder v-if="updata" v-model="cascaderValueModel" @changeCode="changeCode"/>
        </el-form-item>
        <el-form-item label="上传图片" :label-width="formLabelWidth">
          <el-upload
            v-if="dialogFormVisible"
            :action="url"
            list-type="picture-card"
            :limit="1"
            :headers="head"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
      </el-form>
      <hr style="margin-bottom:20px;">
      <div class="line-manage-layout--box" style="padding:20px">
        <div class="left-box">
          <div class="line-manage-leftnav">
            <div class="title">巡检点</div>
            <ul class="point-nav-box">
              <li
                class="point-nav--item"
                v-for="(item) in list"
                :key="item.id"
                :class="{myActive:item.active}"
                @click="handleClick(item)"
              >{{item.patrol_point_name}}</li>
            </ul>
          </div>
          <div class="line-manage-left-table">
            <el-transfer
              @change="changeTransfer"
              v-model="value1"
              :titles="transferTitle"
              :data="data"
            ></el-transfer>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="formData[formType].title " :visible.sync="dialogVisibleForm" width="500px">
      <span>
        <!-- <el-date-picker
          v-if="formType=='day'"
          size="mini"
          type="dates"
          v-model="dayDate"
          placeholder="选择一个或多个日期"
          format="yyyy-MM-dd "
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="changeDate"
        ></el-date-picker>-->
        <el-date-picker
          v-if="formType=='week'"
          size="mini"
          value-format="yyyy-MM-dd HH:mm:ss"
          v-model="weekDate"
          :picker-options="pickerOptions"
          type="week"
          format="yyyy 第 WW 周"
          placeholder="选择周"
        ></el-date-picker>
        <el-date-picker
          v-if="formType=='month' || formType=='day'"
          size="mini"
          value-format="yyyy-MM"
          v-model="monthDate"
          type="month"
          placeholder="选择月"
        ></el-date-picker>
        <el-date-picker
          v-if="formType=='TRT'"
          v-model="TRTDate"
          value-format="yyyy-MM-dd HH:mm:ss"
          :unlink-panels="true"
          size="mini"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </span>

      <div
        style="height: 30px;line-height:30px;padding-left:10px;font-size:12px;color:#E6A23C"
      >提示:{{formData[formType].tips}}</div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleForm = false">取 消</el-button>
        <el-button type="primary" @click="submitExportForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import { getCookie } from "@/utils/cookie";
import PcTable from "@/components/Table.vue";
import { isImage } from "@/utils/isImage.js";
import QcCascder from "@/components/QcCascder.vue";
import { formartTime } from "@/utils/formateTime.js";
export default {
  name: "LineManage",
  components: {
    ViewTitle,
    Search,
    QcCascder,
    PcTable
  },
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      pickerOptions: {
        firstDayOfWeek: 1
      },
      formType: "day",
      TRTDate: [],
      weekDate: "",
      monthDate: "",
      dayDate: [],
      formData: {
        day: {
          tips: "请选择需要导出数据的月份",
          title: "日报表"
        },
        month: {
          tips: "请选择需要导出数据的月份",
          title: "月报表"
        },
        week: {
          tips: "请选择需要导出数据的周",
          title: "周报表"
        },
        TRT: {
          tips: "请选择需要导出数据的开始时间和结束时间",
          title: "TRT报表"
        }
      },
      dialogVisibleForm: false,
      DectionaryList: [],
      updata: false,
      cascaderValueModel: [],
      cascaderArrayStaitc: ["area", "group", "factory", "branch_factory"],
      cascaderValue: [],
      dialogImageUrl: "",
      dialogVisible: false,
      fileList: [],
      imgList: "",
      head: { token },
      url: `${this.upload}/upload/uploadimg`,
      total: 0,
      hasSelectList: [],
      data: [],
      loading: false,
      tableLoading: false,
      transferTitle: ["巡检点设备", "已选择设备"],
      value1: [],
      imageUrl: "",
      dialogFormVisible: false,
      formLabelWidth: "120px",
      list: [
        {
          label: "巡检点1",
          active: true
        },
        {
          label: "巡检点1",
          active: false
        },
        {
          label: "巡检点1",
          active: false
        }
      ],
      rules: {
        patrol_name: [
          { required: true, message: "请输入线路名称", trigger: "blur" }
        ],
        status: [{ required: true, message: "请选择状态", trigger: "blur" }]
      },
      condition: {
        pageIndex: 1,
        pageSize: 10,
        patrol_root_name: "",
        route_type: 0
      },
      ruleForm: {
        id: "",
        patrol_name: "",
        status: "",
        img: "",
        area: "",
        branch_factory: "",
        factory: "",
        group: ""
      },
      tableData: [],
      columnData: [
        {
          prop: "index",
          label: "编号",
          width: "70"
        },
        {
          prop: "patrol_name",
          width: "200",
          label: "名称"
        },
        {
          prop: "remark",
          label: "备注"
        }
      ],
      optionsLine: [
        {
          value: 0,
          label: "全部"
        },
        {
          value: 1,
          label: "常规巡检"
        },
        {
          value: 2,
          label: "随机巡检"
        }
      ],
      options: [
        {
          value: 1,
          label: "启用"
        },
        {
          value: 0,
          label: "禁用"
        }
      ],
      rowId: "",
      routeName: ""
    };
  },
  watch: {
    dialogVisibleForm() {
      if (!this.dialogVisibleForm) {
        this.TRTDate = [];
        this.weekDate = "";
        this.monthDate = "";
        this.dayDate = [];
      }
    },
    dialogFormVisible() {
      if (this.dialogFormVisible) {
        this.getAllPoint();
        this.tableDataDialog = [];
        this.updata = true;
      } else {
        this.$refs.ruleForm.resetFields();
        this.value1 = [];
        (this.imgList = ""), (this.fileList = []);
        this.ruleForm = {
          id: "",
          patrol_name: "",
          status: "",
          img: ""
        };
        this.data = [];
        this.hasSelectList = [];
        this.cascaderValueModel = [];
        this.updata = false;
      }
    }
  },
  created() {
    this.getData();
    this.getList();
  },
  mounted() {},
  methods: {
    submitExportForm() {
      if (this.formType == "week") {
        if (this.weekDate == "") {
          this.$message({
            type: "warning",
            message: "请选择周"
          });
          return;
        }
        const time = new Date(this.weekDate).getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const m = formartTime(new Date(time - oneDay), "yyyy-MM-dd hh:mm:ss");
        const s = formartTime(
          new Date(time + oneDay * 6),
          "yyyy-MM-dd hh:mm:ss"
        );
        window.open(
          `${this.api}/report/getWeekReport?routeId=${
            this.rowId
          }&startTime=${m}&endTime=${s}`
        );
      } else if (this.formType == "TRT") {
        if (this.TRTDate.length == 0) {
          this.$message({
            type: "warning",
            message: "请选择时间范围"
          });
          return;
        }
        window.open(
          `${this.api}/report/getTRTReport?routeId=${this.rowId}&startTime=${
            this.TRTDate[0]
          }&endTime=${this.TRTDate[1].split(" ")[0] + " 23:59:59"}`
        );
      } else if (this.formType == "month" || this.formType == "day") {
        if (this.monthDate == "") {
          this.$message({
            type: "warning",
            message: "请选择时间"
          });
          return;
        }
        window.open(
          `${this.api}/report/getDailyInspection?routeId=${
            this.rowId
          }&yearMonth=${this.monthDate}&routeName=${this.routeName}`
        );
      }
      this.dialogVisibleForm = false;
    },
    // changeDate(e) {
    //   const m = new Date(e[0]).getMonth();
    //   if (!e.every(item => m == new Date(item).getMonth())) {
    //     this.$message({
    //       type: "warning",
    //       message: "所有日期需在一个月份里"
    //     });
    //   }
    // },
    getList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/list/area`)
        .then(res => {
          if (res.data.retCode == 10000) {
            res.data.data.forEach(item => {
              item.label = item.name;
            });
            this.DectionaryList = res.data.data;
          }
        });
    },
    changeCode(data) {
      this.cascaderArrayStaitc.forEach(item => {
        this.ruleForm[item] = "";
      });
      const list = [...this.cascaderArrayStaitc];
      list.length = this.cascaderValueModel.length;
      list.forEach((key, index) => {
        this.ruleForm[key] = data[index];
      });
    },
    changeCodeFilter(data) {
      const list = [...this.cascaderArrayStaitc];
      this.cascaderArrayStaitc.forEach(key => {
        delete this.condition[key];
      });
      list.length = this.cascaderValue.length;
      list.forEach((key, index) => {
        this.condition[key] = data[index];
      });
    },
    handleRemove(file, fileList) {
      this.imgList = "";
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleAvatarSuccess(res, file) {
      this.imgList = res.data;
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const imageFlag = isImage(file);
      if (!imageFlag) {
        this.$message.error("只能上传图片");
      }
      return imageFlag;
    },
    handleExceed(files, fileList) {
      this.$message({
        message: "只可以上传一张照片",
        type: "warning"
      });
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getData();
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.imgList == "") {
            this.$message({
              message: "请上传图片",
              type: "warning"
            });
            return;
          }
          const arr = this.value1.map((item, index) => {
            return {
              equipment_id: item,
              sort: index
            };
          });
          this.ruleForm.img = this.imgList;
          this.$axios
            .post(`${this.api}/patrolRoute/put`, {
              ...this.ruleForm,
              equipment_route: arr
            })
            .then(res => {
              if (res.data.retCode == 10000) {
                this.dialogFormVisible = false;
                this.getData();
                this.$message({
                  message: "保存成功",
                  type: "success"
                });
              }
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    filter() {
      this.loading = true;

      this.condition.pageIndex = 1;
      this.getData(true);
    },
    getData(filter = false) {
      this.tableLoading = true;
      this.$axios
        .post(`${this.api}/patrolRoute/getList`, this.condition)
        .then(res => {
          this.loading = false;
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            const data = res.data.data.items;
            this.total = res.data.data.total;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.statusCode = item.status;
              item.status = item.status == 1 ? "启用" : "禁用";
              if (item.statusCode == 1) {
                item.buttonInfo = [
                  {
                    name: "edit",
                    type: "primary",
                    label: "编辑"
                  },
                  {
                    name: "disable",
                    type: "danger",
                    label: "禁用"
                  },
                  {
                    name: "export",
                    type: "primmary",
                    label: "导出报表"
                  }
                ];
              } else {
                item.buttonInfo = [
                  {
                    name: "edit",
                    type: "primary",
                    label: "编辑"
                  },
                  {
                    name: "enable",
                    type: "primary",
                    label: "启用"
                  },
                  {
                    name: "export",
                    type: "primmary",
                    label: "导出报表"
                  }
                ];
              }
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
          this.tableLoading = false;
        });
    },
    enable(row) {
      this.$axios
        .get(
          `${this.api}/patrolRoute/changeState?id=${row.id}&user_id=${
            this.$store.state.app.user_id
          }`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            this.$message({
              message: "操作成功",
              type: "success"
            });
            row.buttonInfo.splice(1, 1, {
              label: "禁用",
              name: "disable",
              type: "danger"
            });
          }
        });
    },
    exportData(row) {
      const name = row.patrol_name;
      const lastName = name.substr(name.length - 2);

      if (name.substr(0, 3) == "TRT") {
        this.formType = "TRT";
      } else if (lastName == "月检") {
        this.formType = "month";
      } else if (lastName == "周检") {
        this.formType = "week";
      } else if (lastName == "日检") {
        this.formType = "day";
      }
      this.dialogVisibleForm = true;
      this.rowId = row.id;
      this.routeName = row.patrol_name;
    },
    disable(row) {
      this.$axios
        .get(
          `${this.api}/patrolRoute/changeState?id=${row.id}&user_id=${
            this.$store.state.app.user_id
          }`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            row.buttonInfo.splice(1, 1, {
              label: "启用",
              name: "enable",
              type: "primary"
            });
            this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        });
    },
    getAllPoint() {
      this.$axios
        .post(`${this.api}/patrolPoint/getList`, {
          pageIndex: 1,
          pageSize: 100,
          patrol_point_name: ""
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            const data = res.data.data.items;
            data.forEach((item, index) => {
              item.active = index === 0 ? true : false;
            });
            this.list = data;
            this.handleClick(data[0]);
          }
        })
        .catch(err => {});
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    handleSelect(item) {},
    addClick() {
      this.dialogFormVisible = true;
    },
    edit(row) {
      this.patrolRoute(row.id);
    },
    patrolRoute(id) {
      this.$axios.get(`${this.api}/patrolRoute/get?id=${id}`).then(res => {
        if (res.data.retCode == 10000) {
          this.ruleForm = {
            ...res.data.data,
            id,
            patrol_name: res.data.data.patrol_name,
            status: res.data.data.status,
            img: ""
          };
          if (res.data.data.img) {
            this.fileList.push({
              url: res.data.data.img
            });
            this.imgList = res.data.data.img;
          }
          let data = res.data.data.equipment_route;
          data = data.map(item => {
            this.value1.push(item.id);
            return { key: item.id, label: item.equipment_name };
          });
          const arr = data;
          this.data = data;
          this.hasSelectList = data;
          this.cascaderArrayStaitc.forEach(key => {
            if (res.data.data[key] == "" || res.data.data[key] == undefined) {
            } else {
              this.DectionaryList.forEach(item => {
                if (item.code == res.data.data[key]) {
                  this.cascaderValueModel.push(item.name);
                }
              });
            }
          });
          this.dialogFormVisible = true;
        }
      });
    },
    changeTransfer() {
      this.data.forEach(item => {
        this.value1.forEach(ele => {
          if (item.key == ele) {
            this.hasSelectList.push(item);
          }
        });
      });
    },
    handleClick(item) {
      this.list.forEach(ele => {
        ele.active = false;
      });
      item.active = true;
      this.$axios
        .get(`${this.api}/equipment/getByPatrolPoint?id=${item.id}`)
        .then(res => {
          if (res.data.retCode == 10000) {
            let data = res.data.data;
            data = data.map(item => {
              return { key: item.value, label: item.label };
            });
            const arr = this.hasSelectList.concat(data);
            for (var i = 0; i < arr.length; i++) {
              for (var l = i + 1; l < arr.length; l++) {
                if (arr[i].key == arr[l].key) {
                  arr.splice(l, 1);
                }
              }
            }
            this.data = arr;
          }
        })
        .catch(err => {});
    }
  }
};
</script>
<style lang="less">
@import "../../styles/basic";
.guidance-remote--warpper {
  .line-manage-layout--box {
    overflow: hidden;
    .left-box {
      float: left;
      .line-manage-leftnav {
        float: left;
        padding-right: 30px;
        .title {
          font-size: 18px;
          padding-bottom: 20px;
          font-weight: bold;
        }
        li {
          padding: 10px;
          cursor: pointer;
        }
      }
      .line-manage-left-table {
        float: left;
        margin-top: 40px;
      }
    }
    .right-box {
      float: left;
    }
  }
  .dialog-input--box {
    display: inline-block;
    width: 45%;
    .el-input {
      width: 50%;
    }
  }
  .labels {
    display: inline-block;
  }
  .label {
    display: inline-block;
    width: 120px;
    text-align: right;
    padding-right: 12px;
    box-sizing: border-box;
  }
  .point-nav--item {
    transition: all 0.3s;
  }
  .myActive {
    color: #fff;
    background: @backgroundColor;
  }
  .point-nav-box {
    height: 400px;
    overflow: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>


