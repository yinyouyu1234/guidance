<template>
  <div class="guidance-remote--warpper">
    <view-title title="7天内未巡检设备" icon="icon-shebei"/>
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
        @changePage="changePage"
        @getInfo="getInfo"
      />
    </div>
    <el-dialog title="文件列表" :visible.sync="dialogFormVisible">
      <div v-for="o in 4" :key="o" class="down-item" @click="fileClick">
        <u>{{'列表内容 ' + o }} 点击下载</u>
      </div>
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
export default {
  name: "GuidanceRemote",
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
      dataTime: "",
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
          prop: "last_check_time",
          label: "最后一次巡检时间"
        }
      ],
      options: [
        {
          value: "选项1",
          label: "启用"
        },
        {
          value: "选项2",
          label: "禁用"
        }
      ]
    };
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    downLoad() {
      let url = `${
        this.api
      }/report/getUnCheckIn7DaysEquipmentReport?pageSize=-1&kks=${encodeURIComponent(
        this.condition.kks
      )}&equipment_name=${this.condition.equipment_name}`;
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
    getList(filter = false) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .post(
          `${this.api}/report/getUnCheckIn7DaysEquipmentList`,
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
      this.dialogFormVisible = true;
    },
    bigImg() {
      this.innerVisible = true;
    },
    fileClick() {
      const link = document.createElement("a");
      const body = document.querySelector("body");
      const blob = new Blob([content]);
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      // fix Firefox
      link.style.display = "none";
      body.appendChild(link);
      link.click();
      body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
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

