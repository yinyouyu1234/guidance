<template>
  <div>
    <view-title title="异常查询" icon="icon-yichang"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="KKS">
          <el-input size="mini" v-model="condition.kks" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input size="mini" v-model="condition.equipment_name" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="changeData"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini" v-model="condition.handle_state" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" :loading="loading" @click="filter">查询</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :tableData="tableData"
        :columnData="columnData"
        :total="total"
        :loading="tableLoading"
        :page-index="condition.pageIndex"
        @getInfo="getInfo"
        @changePage="changePage"
      />
    </div>
    <el-dialog title="详情" width="600px" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm">
        <el-form-item
          v-for="(item) in form"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label+':'"
          :label-width="formLabelWidth"
          class="defect-manage"
        >{{item.value}}</el-form-item>
        <el-dialog width="50%" title :visible.sync="innerVisible" append-to-body>
          <video-dialog v-if="innerVisible" :url="dialogUrl"/>
        </el-dialog>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit('ruleForm')">确 定</el-button>
      </div>
      <image-list :list="imgList" @handleClick="bigImg"/>
    </el-dialog>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import PcTable from "@/components/Table.vue";
import ImageList from "@/components/ImageList.vue";
import VideoDialog from "@/components/VideoDialog.vue";
import { form, columnData, options } from "./setAbnormalStatic.js";
export default {
  name: "SetAbnormal",
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
      dialogUrl: "",
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
        start_time: "",
        end_time: "",
        handle_state: ""
      },
      imgList: [],
      form,
      tableData: [],
      columnData: columnData,
      options: options
    };
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    changePage(page) {
      this.condition.pageIndex = page;
      this.getList();
    },
    changeData() {
      if (this.dataTime) {
        this.condition.start_time = this.dataTime[0].getTime();
        this.condition.end_time = this.dataTime[1].getTime();
      } else {
        this.condition.start_time = "";
        this.condition.end_time = "";
      }
    },
    getList(filter = false) {
      this.$axios
        .post(`${this.api}/patrolRecord/getExceptionList`, this.condition)
        .then(res => {
          this.loading = false;
          if (res.data.retCode == 10000) {
            const data = res.data.data.items;
            this.total = res.data.data.total;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.handle_state = item.handle_state ? "已消缺" : "未消缺";
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
                message: "查询成功",
                type: "success"
              });
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    filter() {
      this.loading = true;
      this.condition.pageIndex = 1;
      this.getList(true);
    },
    getInfo(row) {
      this.dialogFormVisible = true;
      this.$axios
        .get(`${this.api}/patrolRecord/getExceptionDetail?id=${row.id}`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            this.form.forEach(item => {
              item.value = data[item.prop];
            });
            this.imgList = data.img;
          }
        });
    },
    bigImg(url) {
      this.dialogUrl = url;
      this.innerVisible = true;
    }
  }
};
</script>

