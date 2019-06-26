<template>
  <div class="mine-submit-video--warpper">
    <view-title title="我提交的视频" icon="icon-wofaqide"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="项目名称">
          <el-input size="mini" v-model="condition.projectName" clearable placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="审核人员">
          <el-select size="mini" v-model="condition.reviewUserId" placeholder="请选择">
            <el-option
              v-for="item in optionsPersonnel"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select size="mini" v-model="condition.reviewStatus" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
        @edit="edit"
        @changePage="changePage"
      />
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import Search from "@/components/Search.vue";
import PcTable from "@/components/Table.vue";
import { getCookie } from "@/utils/cookie";
import qs from "qs";
export default {
  name: "MineSubmitVideo",
  components: {
    ViewTitle,
    Search,
    PcTable
  },
  data() {
    return {
      optionsPersonnel: [],
      total: 0,
      loading: false,
      tableLoading: false,
      dataTime: "",
      condition: {
        page: 1,
        size: 10,
        projectName: "",
        userId: JSON.parse(getCookie("user_info")).id,
        reviewUserId: "",
        reviewStatus: ""
      },

      options: [
        {
          value: "",
          label: "全部"
        },
        {
          value: 0,
          label: "待审核"
        },
        {
          value: 1,
          label: "已审核"
        },
        {
          value: 2,
          label: "驳回"
        },
        {
          value: 3,
          label: "草稿"
        }
      ],
      tableData: [],
      columnData: [
        {
          prop: "index",
          width: "70",
          label: "编号"
        },
        {
          prop: "projectName",
          label: "项目名称"
        },
        {
          prop: "uploadTime",
          label: "上传时间"
        },
        {
          prop: "reviewStatus",
          label: "审核状态"
        },
        {
          prop: "reviewTime",
          label: "审核时间"
        },
        {
          prop: "timeLength",
          label: "时长"
        },
        {
          prop: "tags",
          label: "标签"
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
    this.getNewsList();
    this.getUserType();
  },
  mounted() {},

  methods: {
    getUserType() {
      this.$axios.get(`${this.commonApi}/user/1`).then(res => {
        if (res.data.retCode == 10000) {
          this.optionsPersonnel = res.data.data;
          this.optionsPersonnel.unshift({
            value: "",
            label: "全部"
          });
        }
      });
    },
    edit(row) {
      this.$router.push({
        path: "/SubmitVideoDetail",
        query: {
          id: row.id
        }
      });
    },
    changePage(page) {
      this.condition.page = page;
      this.getNewsList();
    },
    filter() {
      this.condition.page = 1;
      this.getNewsList(true);
    },
    getNewsList(filter = false) {
      this.loading = true;
      this.tableLoading = true;
      this.$axios
        .get(`${this.api}/knowledgeBase/list?${qs.stringify(this.condition)}`)
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
                  name: "edit",
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
    }
  }
};
</script>
<style lang="less">
</style>

