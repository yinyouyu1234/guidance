<template>
  <div class="guidance-remote--warpper">
    <view-title title="巡检点"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="巡检点名称">
          <el-input
            size="mini"
            v-model="condition.patrol_point_name"
            clearable
            placeholder="请输入巡检点名称"
          ></el-input>
        </el-form-item>
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
        :tableData="tableData"
        :columnData="columnData"
        :loading="tableLoading"
        :total="total"
        :page-index="condition.pageIndex"
        @edit="edit"
        @disable="disable"
        @enable="enable"
        @changePage="changePage"
      />
    </div>
    <el-dialog
      :close-on-click-modal="false"
      title="基本信息"
      width="600px"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item prop="patrol_point_name" label="巡检点名称" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.patrol_point_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="longitude" label="经度" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.longitude" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="latitude" label="纬度" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.latitude" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="input-box" prop="code" label="片区" :label-width="formLabelWidth">
          <QcCascder v-if="updata" v-model="cascaderValueModel" @changeCode="changeCode"/>
        </el-form-item>
        <hr style="margin-bottom:20px;">
        <div class="dialog-input--box">
          <div class="label">KKS</div>
          <el-input size="mini" v-model="formAddTable.kks" autocomplete="off"></el-input>
        </div>
        <div class="dialog-input--box">
          <div class="labels">序号</div>
          <el-input size="mini" type="number" v-model="formAddTable.index" autocomplete="off"></el-input>
          <el-button size="mini" type="primary" :disabled="!dis" @click="addTableData">添加</el-button>
        </div>
      </el-form>
      <div style="padding:20px">
        <pc-table
          :pagination="false"
          :columnData="columnDataDialog"
          :tableData="tableDataDialog"
          :button-info-icon="iconButton"
          @delete="deleteItem"
        />
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
import QcCascder from "@/components/QcCascder.vue";
export default {
  name: "PatrolPoint",
  components: {
    ViewTitle,
    Search,
    PcTable,
    QcCascder
  },
  computed: {
    dis() {
      return (
        this.formAddTable.index.length > 0 && this.formAddTable.kks.length > 0
      );
    }
  },
  data() {
    return {
      list: [],
      updata: false,
      cascaderValueModel: [],
      cascaderArrayStaitc: ["area", "group", "factory", "branch_factory"],
      cascaderValue: [],
      total: 0,
      loading: false,
      tableLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      rules: {
        patrol_point_name: [
          { required: true, message: "请输入巡检点名称", trigger: "blur" }
        ],
        longitude: [{ required: true, message: "请输入经度", trigger: "blur" }],
        latitude: [{ required: true, message: "请输入纬度", trigger: "blur" }]
      },
      condition: {
        pageIndex: "1",
        pageSize: "10",
        patrol_point_name: ""
      },
      ruleForm: {
        patrol_point_name: "",
        longitude: "",
        latitude: "",
        equipments: [],
        user_id: this.$store.state.app.user_id
      },
      formAddTable: {
        index: "",
        kks: "",
        id: "",
        equipment_name: ""
      },
      tableDataDialog: [],
      tableData: [],
      columnData: [
        {
          prop: "index",
          width: "70",
          label: "编号"
        },
        {
          prop: "patrol_point_name",
          label: "名称"
        }
      ],
      columnDataDialog: [
        {
          prop: "index",
          width: "70",
          label: "序号"
        },
        {
          prop: "kks",
          label: "KKS"
        },
        {
          prop: "equipment_name",
          label: "名称"
        }
      ],
      iconButton: [
        {
          name: "delete",
          icon: "el-icon-delete",
          label: "删除"
        }
      ]
    };
  },
  created() {
    this.getData();
    this.getList();
  },
  watch: {
    dialogFormVisible() {
      if (!this.dialogFormVisible) {
        this.$refs.ruleForm.resetFields();
        this.tableDataDialog = [];
        this.ruleForm = {
          patrol_point_name: "",
          longitude: "",
          latitude: ""
        };
        this.formAddTable = {
          kks: "",
          id: "",
          equipment_name: "",
          index: ""
        };
        this.cascaderValueModel = [];
        this.updata = false;
      } else {
        this.updata = true;
      }
    }
  },
  methods: {
    getList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/list/area`)
        .then(res => {
          if (res.data.retCode == 10000) {
            res.data.data.forEach(item => {
              item.label = item.name;
            });
            this.list = res.data.data;
          }
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
    changePage(page) {
      this.condition.pageIndex = page;
      this.getData();
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.ruleForm.equipments = this.tableDataDialog.map(item => ({
            equipment_id: item.id,
            sort: item.index
          }));
          this.$axios
            .post(`${this.api}/patrolPoint/put`, this.ruleForm)
            .then(res => {
              if (res.data.retCode == 10000) {
                this.$message({
                  message: "添加成功",
                  type: "success"
                });
                this.getData();
                this.dialogFormVisible = false;
              }
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    addTableData() {
      const isCanAdd = this.tableDataDialog.some(
        item => this.formAddTable.kks == item.kks
      );
      if (isCanAdd) {
        this.$message({
          message: "当前kks码，已经添加过了",
          type: "warning"
        });
        return;
      }

      this.$axios
        .get(
          `${
            this.api
          }/equipment/getByKKSForPatrolPoint?kks=${encodeURIComponent(
            this.formAddTable.kks.toString()
          )}`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            if (data) {
              this.formAddTable.id = data.id.toString();
              this.formAddTable.kks = data.kks;
              this.formAddTable.equipment_name = data.equipment_name;
              this.tableDataDialog.push({ ...this.formAddTable });
              this.tableDataDialog.sort((a, b) => {
                return a.index - b.index;
              });
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.formAddTable = {
                kks: "",
                id: "",
                equipment_name: "",
                index: ""
              };
            } else {
              this.$message({
                message: res.data.retMsg,
                type: "warning"
              });
            }
          }
        });
    },
    getData(filter = false) {
      this.tableLoading = false;
      this.$axios
        .post(`${this.api}/patrolPoint/getList`, this.condition)
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
                  }
                ];
              }
            });
            this.tableData = data;
            if (filter) {
              this.$message({
                message: "搜索成功",
                type: "success"
              });
            }
          }
        })
        .catch(err => {
          this.tableLoading = false;
          this.loading = false;
        });
    },
    enable(row) {
      this.$axios
        .get(
          `${this.api}/patrolPoint/changeState?id=${row.id}&user_id=${
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
    disable(row) {
      this.$axios
        .get(
          `${this.api}/patrolPoint/changeState?id=${row.id}&user_id=${
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
    filter() {
      this.loading = true;

      this.condition.pageIndex = 1;
      this.getData(true);
    },
    addClick() {
      this.dialogFormVisible = true;
    },
    edit(row) {
      this.$axios.get(`${this.api}/patrolPoint/get?id=${row.id}`).then(res => {
        if (res.data.retCode == 10000) {
          const { data } = res.data;
          Object.assign(this.ruleForm, data);
          data.equipment.forEach((item, index) => {
            item.index = index + 1;
          });
          this.cascaderArrayStaitc.forEach(key => {
            if (this.ruleForm[key] == "" || this.ruleForm[key] == undefined) {
            } else {
              this.list.forEach(item => {
                if (item.code == this.ruleForm[key]) {
                  this.cascaderValueModel.push(item.name);
                }
              });
            }
          });
          this.tableDataDialog = data.equipment;
          this.dialogFormVisible = true;
        }
      });
    },
    deleteItem(row) {
      this.$confirm("确认删除此条信息吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.tableDataDialog.forEach((item, index) => {
            if (row.index == item.index) {
              this.tableDataDialog.splice(index, 1);
            }
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="less">
.dialog-input--box {
  display: inline-block;
  width: 45%;
  .el-input {
    width: 50%;
  }
}
.input-box {
  .el-input--mini {
    width: 120%;
  }
}
.labels {
  display: inline-block;
  // width: 120px;
  // text-align: right;
  // padding-right: 12px;
  // box-sizing: border-box;
}
.label {
  display: inline-block;
  width: 120px;
  text-align: right;
  padding-right: 12px;
  box-sizing: border-box;
}
</style>

