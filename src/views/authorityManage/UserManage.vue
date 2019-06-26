<template>
  <div class="guidance-remote--warpper">
    <view-title title="用户管理" icon="icon-yonghu"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="姓名">
          <el-input size="mini" v-model="condition.user_name" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input size="mini" v-model="condition.phone_number" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="员工号">
          <el-input size="mini" v-model="condition.user_code" clearable placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini" v-model="condition.status" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="片区">
          <QcCascder v-model="cascaderValue" @changeCode="changeCode"/>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="filter" :loading="loading">查询</el-button>
          <el-button @click="addUser" type="primary" size="mini">添加</el-button>
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
      width="600px"
      title="添加用户"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="员工号" prop="user_code">
          <el-input size="mini" placeholder="请输入员工号" v-model="ruleForm.user_code"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="user_name">
          <el-input size="mini" placeholder="姓名" v-model="ruleForm.user_name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="mini" :type="inputType" placeholder="请输入密码" v-model="ruleForm.password">
            <i slot="prefix" @click="changeInputType" class="el-input__icon el-icon-view"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone_number">
          <el-input size="mini" placeholder="请输入手机号码" v-model="ruleForm.phone_number"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="dept_name">
          <el-input size="mini" placeholder="请输入部门名称" v-model="ruleForm.dept_name"></el-input>
        </el-form-item>
        <el-form-item label="岗位" prop="post_name">
          <el-input size="mini" placeholder="请输入岗位名称" v-model="ruleForm.post_name"></el-input>
        </el-form-item>
        <el-form-item class="userManage-dialog--cascder" prop="code" label="片区">
          <el-select size="mini" v-model="ruleForm.area" placeholder="请选择">
            <el-option
              v-for="item in optionsArea"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传头像">
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
        <el-form-item label="是否为片区经理">
          <el-checkbox v-model="ruleForm.ismanager" name="type"></el-checkbox>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <div v-for="item in ruleForm.roles" :key="item.application_name">
            {{item.application_name}}：
            <el-checkbox
              v-for="ele in item.role"
              :key="ele.id"
              v-model="ele.check"
              @change="changeCheck(ele,ele.check)"
              name="type"
            >{{ele.role_name}}</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
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
import { isImage } from "@/utils/isImage.js";
import { getCookie } from "@/utils/cookie";
export default {
  name: "UserManage",
  components: {
    ViewTitle,
    Search,
    PcTable,
    QcCascder
  },
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      dialogVisible: false,
      dialogImageUrl: "",
      imgList: [],
      fileList: [],
      head: { token },
      url: `${this.upload}/upload/uploadimg`,
      optionsArea: [],
      cascaderArrayStaitc: [
        "area",
        "groupType",
        "factoryType",
        "subFactoryType"
      ],
      cascaderValue: [],
      dictionaryDataList: [],
      inputType: "password",
      total: 0,
      loading: false,
      dialogFormVisible: false,
      tableLoading: false,
      checkBoxList: [],
      condition: {
        pageIndex: 1,
        pageSize: 10,
        user_name: "",
        phone_number: "",
        user_code: "",
        status: ""
      },
      ruleForm: {
        ismanager: false,
        dept_name: "",
        id: "",
        password: "",
        phone_number: "",
        post_name: "",
        roles: [],
        user_code: "",
        user_name: "",
        user_id: this.$store.state.app.user_id,
        cityType: "", //市
        areaType: "", // 片区
        groupType: "", // 集团
        factoryType: "", // 厂
        subFactoryType: "", // 分厂
        password_change: false,
        oldPassword: ""
      },
      rules: {
        user_code: [
          { required: true, message: "请输入员工号", trigger: "blur" }
        ],
        user_name: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        phone_number: [
          { required: true, message: "请输入手机号", trigger: "blur" }
        ],
        dept_name: [
          { required: true, message: "请输入部门名称", trigger: "blur" }
        ],
        post_name: [
          { required: true, message: "请输入岗位名称", trigger: "blur" }
        ]
        // roles: [{ required: true, message: "请输入角色", trigger: "blur" }]
      },
      tableData: [],
      columnData: [
        {
          prop: "index",
          label: "序号",
          width: "70"
        },
        {
          prop: "user_code",
          label: "员工号"
        },
        {
          prop: "user_name",
          label: "姓名"
        },
        {
          prop: "phone_number",
          label: "手机"
        },

        {
          prop: "dept_name",
          label: "部门"
        },
        {
          prop: "area",
          label: "片区"
        },
        {
          prop: "manager",
          label: "是否为片区经理"
        },
        {
          prop: "post_name",
          label: "岗位"
        }
      ],
      options: []
    };
  },
  watch: {
    dialogFormVisible() {
      if (!this.dialogFormVisible) {
        this.$refs.ruleForm.resetFields();
        this.fileList = [];
        this.imgList = [];
        this.ruleForm = {
          ismanager: false,
          dept_name: "",
          id: "",
          password: "",
          phone_number: "",
          post_name: "",
          roles: [],
          user_code: "",
          user_name: "",
          user_id: this.$store.state.app.user_id,
          password_change: false,
          oldPassword: ""
        };
        this.dictionaryDataList.forEach(item => {
          item.select = false;
        });
      } else {
      }
    }
  },
  created() {
    this.getUserList();
    this.getUserStatus();
    this.getDictionaryList();
  },
  mounted() {},
  methods: {
    handleRemove(file, fileList) {
      this.imgList = [];
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleAvatarSuccess(res, file) {
      this.imgList.push({ url: res.data });
    },
    handleExceed(files, fileList) {
      this.$message({
        message: "只可以上传一张照片",
        type: "warning"
      });
    },
    beforeAvatarUpload(file) {
      const imageFlag = isImage(file);
      if (!imageFlag) {
        this.$message.error("只能上传图片");
      }
      return imageFlag;
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
    getDictionaryList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/childrenlist/area`)
        .then(res => {
          if (res.data.retCode == 10000) {
            res.data.data.forEach(item => {
              item.label = item.name;
              item.value = item.code;
            });
            this.optionsArea = res.data.data;
          }
        });
    },
    changeInputType() {
      this.inputType = this.inputType == "password" ? "text" : "password";
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getUserList();
    },
    getAppRoles(resolve) {
      this.$axios
        .get(`${this.api}/user/getAppRoles`)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.ruleForm.roles = res.data.data;
            resolve && resolve();
          }
        })
        .catch(err => {});
    },
    getUserStatus() {
      this.$axios
        .get(`${this.api}/user/getUserStatus`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            data.unshift({
              value: "",
              label: "全部"
            });
            this.options = data;
          }
        })
        .catch(err => {});
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.ruleForm.oldPassword != this.ruleForm.password) {
            this.ruleForm.password_change = true;
          }
          const arr = [];
          let manage_area = [];
          this.ruleForm.roles.forEach(item => {
            item.role.forEach(ele => {
              if (ele.check) {
                arr.push(ele.id);
              }
            });
          });
          this.dictionaryDataList.map(item => {
            if (item.select) {
              manage_area.push(item.code);
            }
          });
          this.ruleForm.manage_area = manage_area;
          let obj;
          console.log(this.imgList);
          if (this.imgList.length > 0) {
            this.ruleForm.icon = this.imgList[0].url;
            obj = {
              ...this.ruleForm,
              roles: arr
            };
          } else {
            this.$message({
              message: "请上传头像！",
              type: "warning"
            });
            return;
          }

          this.$axios
            .post(`${this.api}/user/put`, obj)
            .then(res => {
              if (res.data.retCode == 10000) {
                this.getUserList();
                this.dialogFormVisible = false;
                this.$message({
                  type: "success",
                  message: "保存成功"
                });
              }
            })
            .catch(err => {});
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    changeCheck(item, checked) {
      if (checked) {
        this.checkBoxList.push(item.id);
      } else {
        const index = this.checkBoxList.indexOf(item.id);
        this.checkBoxList.splice(index, 1);
      }
    },
    enable(row) {
      this.tableLoading = true;
      this.$axios
        .get(`${this.api}/user/changeState?id=${row.id}`)
        .then(res => {
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            row.buttonInfo.splice(1, 1, {
              label: "禁用",
              name: "disable",
              type: "danger"
            });
            this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        })
        .catch(err => {});
    },
    disable(row) {
      this.tableLoading = true;
      this.$axios
        .get(`${this.api}/user/changeState?id=${row.id}`)
        .then(res => {
          this.tableLoading = false;
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
        })
        .catch(err => {});
    },
    edit(row) {
      this.dialogFormVisible = true;
      new Promise((resolve, reject) => {
        this.getAppRoles(resolve);
      }).then(() => {
        this.$axios
          .get(`${this.api}/user/get?id=${row.id}`)
          .then(res => {
            if (res.data.retCode == 10000) {
              const { data } = res.data;
              const arr = [...data.roles];
              delete data.roles;
              this.fileList.push({ url: data.icon });
              this.imgList.push({ url: data.icon });
              this.ruleForm = {
                ...this.ruleForm,
                ...data,
                id: row.id
              };

              this.ruleForm.roles.forEach(item => {
                item.role.forEach(ele => {
                  if (arr.indexOf(ele.id) != -1) {
                    ele.check = true;
                  }
                });
              });
              this.ruleForm.oldPassword = this.ruleForm.password;
              this.dictionaryDataList.forEach(item => {
                let flag = this.ruleForm.manage_area.indexOf(item.code) > -1;
                if (flag) {
                  item.select = true;
                }
              });
            }
          })
          .catch(err => {});
      });
    },
    filter() {
      this.loading = true;
      this.condition.pageIndex = 1;
      this.getUserList(true);
    },
    getUserList(filter = false) {
      this.tableLoading = true;
      this.$axios
        .post(`${this.api}/user/getList`, this.condition)
        .then(res => {
          this.tableLoading = false;
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            this.total = data.total;
            data.items.map((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
              item.manager = item.manager ? "是" : "否";
              if (item.status == 1) {
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
            this.loading = false;
            if (filter) {
              this.$message({
                message: "搜索成功",
                type: "success"
              });
            }

            this.tableData = data.items;
          }
        })
        .catch(err => {});
    },
    addUser() {
      this.getAppRoles();
      this.dialogFormVisible = true;
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
.userManage-dialog--cascder {
  .el-input--mini {
    width: 100% !important;
  }
}
.el-icon-view {
  cursor: pointer;
}
</style>

