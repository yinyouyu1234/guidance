<template>
  <div class="guidance-remote--warpper">
    <view-title title="远程指导" icon="icon-zaixianzhidao "/>
    <search>
      <el-form :inline="true">
        <el-form-item label="发起人">
          <el-input size="mini" v-model="condition.user_name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="专家">
          <el-input size="mini" v-model="condition.expert_name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dataTime"
            size="mini"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="changeDate"
          ></el-date-picker>
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
        @getInfo="getInfo"
        :page-index="condition.pageIndex"
        @changePage="changePage"
      />
    </div>
    <el-dialog width="600px" title="文件列表" :visible.sync="dialogFormVisible">
      <div v-for="(o,i) in fileList" :key="o.url" class="down-item">
        <u @click="fileClick(o.url, o.file_name)">{{i+1}} {{ o.file_name }} 文件</u>
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
import VideoDialog from "@/components/VideoDialog.vue";
import PcTable from "@/components/Table.vue";
export default {
  name: "GuidanceRemote",
  components: {
    ViewTitle,
    Search,
    PcTable,
    VideoDialog
  },
  data() {
    return {
      innerVisible: false,
      total: 0,
      loading: false,
      tableLoading: false,
      dialogFormVisible: false,
      innerVisible: false,
      dialogUrl: "",
      dataTime: "",
      condition: {
        pageIndex: 1,
        pageSize: 10,
        user_name: "",
        expert_name: "",
        starttime: "",
        endtime: ""
      },
      fileList: [],
      tableData: [],
      columnData: [
        {
          prop: "index",
          label: "编号",
          width: 70
        },
        {
          prop: "user_name",
          label: "发起人"
        },
        {
          prop: "expert_name",
          label: "专家"
        },
        {
          prop: "begin_time",
          label: "时间"
        },
        {
          prop: "equipment_name",
          label: "巡检设备"
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
    changePage(page) {
      this.condition.pageIndex = page;
      this.getList();
    },
    filter() {
      this.condition.pageIndex = 1;
      this.loading = true;
      this.getList(true);
    },
    changeDate() {
      if (this.dataTime) {
        this.condition.starttime = this.dataTime[0].getTime();
        this.condition.endtime = this.dataTime[1].getTime();
      } else {
        this.condition.starttime = "";
        this.condition.endtime = "";
      }
    },
    getList(filter = false) {
      this.tableLoading = true;
      this.$axios
        .post(`${this.api}/guide/getList`, this.condition)
        .then(res => {
          this.loading = false;
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            this.total = res.data.data.total;
            const data = res.data.data.items;
            data.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
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
    getInfo(row) {
      this.dialogFormVisible = true;
      this.$axios
        .get(`${this.api}/guide/getFileList?id=${row.id}`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            this.fileList = data;
          }
        });
    },
    bigImg() {
      this.innerVisible = true;
    },
    fileClick(content, filename) {
      const imgType = ["jpg", "jpeg", "png"];
      const videoType = ["mp4", "m3u8"];
      const index = content.lastIndexOf(".");
      let name = content.substring(index + 1);
      if (imgType.indexOf(name.toLowerCase()) != -1) {
        //picture
        this.innerVisible = true;
        this.dialogUrl = content;
      } else if (videoType.indexOf(name.toLowerCase()) != -1) {
        //video
        this.innerVisible = true;
        this.dialogUrl = content;
      } else {
        window.open(content);
      }
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

