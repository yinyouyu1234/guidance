<template>
  <div>
    <view-title title="专家列表" icon="icon-zhuanjia"/>
    <search>
      <el-form :inline="true">
        <el-form-item label="姓名">
          <el-input size="mini" v-model="condition.expert_name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input size="mini" v-model="condition.phone_number" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="员工号">
          <el-input size="mini" v-model="condition.user_code" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini" v-model="condition.status" placeholder="请选择">
            <el-option
              v-for="item in optionsStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="fiter" :loading="loading">查询</el-button>
          <el-button type="primary" size="mini" @click="add">添加</el-button>
        </el-form-item>
      </el-form>
    </search>
    <div style="padding:20px">
      <pc-table
        :columnData="columnData"
        :tableData="tableData"
        :total="total"
        @changePage="changePage"
        @edit="edit"
        @disable="disable"
        @enable="enable"
        :page-index="condition.pageIndex"
      />
    </div>
    <el-dialog
      :close-on-click-modal="false"
      title="添加专家"
      width="800px"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item
          v-for="(item) in form"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :label-width="formLabelWidth"
        >
          <el-input
            size="mini"
            :type="item.inputType ? item.inputType : 'text'"
            clearable
            v-model="ruleForm[item.prop]"
            autocomplete="off"
          >
            <i
              slot="prefix"
              v-if="item.inputType"
              @click="changeInputType(item)"
              class="el-input__icon el-icon-view"
            ></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="equipment_type_id" label="设备类型" :label-width="formLabelWidth">
          <el-select size="mini" v-model="ruleForm.equipment_type_id" placeholder="请选择">
            <el-option
              v-for="item in optionsType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="expert_type" label="类别" :label-width="formLabelWidth">
          <el-select size="mini" v-model="ruleForm.expert_type" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传头像" :label-width="formLabelWidth">
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
        <el-form-item :label-width="formLabelWidth" label="角色" prop="roles">
          <div v-for="item in roles" :key="item.application_name">
            {{item.application_name}}：
            <el-checkbox
              v-for="ele in item.role"
              :key="ele.id"
              v-model="ele.check"
              name="type"
            >{{ele.role_name}}</el-checkbox>
          </div>
        </el-form-item>
        <div>
          <div ref="wangeditor" id="editor" class="editor"></div>
        </div>
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
import ImageList from "@/components/ImageList.vue";
import { isImage } from "@/utils/isImage.js";
import { rules, form, columnData, optionsStatus } from "./expertListStatic.js";
import { getCookie } from "@/utils/cookie";
import E from "wangeditor";
import qs from "qs";
export default {
  components: {
    ViewTitle,
    Search,
    PcTable,
    ImageList
  },
  name: "ExpertList",
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      imgList: [],
      fileList: [],
      head: { token },
      url: `${this.upload}/upload/uploadimg`,
      formArticle: "",
      loading: false,
      editorHasInit: false,
      dialogFormVisible: false,
      dialogVisible: false,
      dialogImageUrl: "",
      formLabelWidth: "120px",
      tableData: [],
      total: 0,
      rules,
      condition: {
        expert_name: "",
        phone_number: "",
        user_code: "",
        status: -1,
        pageIndex: "1",
        pageSize: "10"
      },
      ruleForm: {
        user_code: "",
        expert_name: "",
        password: "",
        phone_number: "",
        dept_name: "",
        post_name: "",
        info: "",
        expert_type: "",
        icon: "",
        password_change: false,
        oldPassword: "",
        user_id: this.$store.state.app.user_id,
        equipment_type_name: "",
        equipment_type_id: ""
      },
      form,
      options: [],
      optionsType: [],
      roles: [],
      optionsStatus,
      columnData
    };
  },
  watch: {
    dialogFormVisible() {
      if (this.dialogFormVisible && !this.editorHasInit) {
        this.editorHasInit = true;
      }
      if (!this.dialogFormVisible) {
        this.fileList = [];
        this.imgList = [];
        this.ruleForm = {
          user_code: "",
          expert_name: "",
          password: "",
          phone_number: "",
          dept_name: "",
          post_name: "",
          info: "",
          expert_type: "",
          icon: "",
          password_change: false,
          oldPassword: "",
          user_id: this.$store.state.app.user_id,
          equipment_type_name: "",
          equipment_type_id: ""
        };
        this.$refs["ruleForm"].resetFields();
      } else {
        this.getSelectList();
        this.getSelectTypeList();
      }
    }
  },
  created() {
    this.getData();
  },
  mounted() {},
  methods: {
    getAppRoles(resolve) {
      this.$axios
        .get(`${this.api}/user/getAppRoles`)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.roles = res.data.data;
            resolve && resolve();
          }
        })
        .catch(err => {});
    },
    changeInputType(item) {
      item.inputType = item.inputType == "password" ? "text" : "password";
    },
    getSelectTypeList() {
      this.$axios.get(`${this.api}/equipmentType/getAll`).then(res => {
        const { data } = res.data;
        this.optionsType = data;
      });
    },
    getSelectList() {
      this.$axios
        .get(`${this.api}/expert/getExpertTypeSelectList`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            this.options = data;
          }
        });
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getData();
    },
    getData(filter = false) {
      this.$axios
        .post(`${this.api}/expert/getList`, this.condition)
        .then(res => {
          this.loading = false;
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            data.items.forEach((item, index) => {
              item.index = index + 1 + (this.condition.pageIndex - 1) * 10;
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
            this.tableData = data.items;
            this.total = data.total;
            if (filter) {
              this.$message({
                message: "搜索成功",
                type: "success"
              });
            }
          }
        })
        .catch(err => {});
    },
    fiter() {
      this.loading = true;
      this.condition.pageIndex = 1;
      this.getData(true);
    },
    changePage(page) {
      this.condition.pageIndex = page;
      this.getData();
    },
    editorInit(info = "") {
      const editor = new E("#editor");
      editor.customConfig.onchange = html => {
        this.formArticle = html;
        this.ruleForm.info = html;
      };
      editor.customConfig.uploadImgServer = this.url; //上传URL
      editor.customConfig.uploadImgMaxSize = 3 * 1024 * 1024;
      editor.customConfig.uploadImgMaxLength = 5;
      editor.customConfig.uploadFileName = "file";
      editor.customConfig.uploadImgHeaders = {
        token: getCookie("user_info")
          ? JSON.parse(getCookie("user_info")).token
          : ""
      };
      editor.customConfig.uploadImgHooks = {
        customInsert: function(insertImg, result, editor) {
          var url = result.data;
          insertImg(url);
        }
      };
      editor.create();
      editor.txt.html(info);
    },

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
    submit(formName) {
      const arr = [];
      let obj;
      if (this.imgList.length > 0) {
        this.ruleForm.icon = this.imgList[0].url;
        obj = {
          ...this.ruleForm
        };
      } else {
        this.$message({
          message: "请上传头像！",
          type: "warning"
        });
        return;
      }
      this.roles.forEach(item => {
        item.role.forEach(ele => {
          if (ele.check) {
            arr.push(ele.id);
          }
        });
      });
      obj.roles = arr;
      if (obj.oldPassword != obj.password) {
        obj.password_change = true;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.options.forEach(item => {
            console.log(item);
            if (obj.equipment_type_name == item.value) {
              obj.equipment_type_name = item.label;
            }
          });
          this.$axios.post(`${this.api}/expert/put`, obj).then(res => {
            if (res.data.retCode == 10000) {
              this.dialogFormVisible = false;
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
    add() {
      this.dialogFormVisible = true;
      this.getAppRoles();
      setTimeout(() => {
        this.editorInit();
      }, 300);
    },
    edit(row) {
      new Promise((resolve, reject) => {
        this.getAppRoles(resolve);
      }).then(() => {
        this.$axios
          .get(`${this.api}/expert/get?id=${row.id}`)
          .then(res => {
            if (res.data.retCode == 10000) {
              this.dialogFormVisible = true;
              const { data } = res.data;
              data.equipment_type_id = Number(data.equipment_type_id);
              this.fileList.push({ url: data.icon });
              this.imgList.push({ url: data.icon });
              if (data.equipment_type_id == null) {
                data.equipment_type_id = "";
              }
              Object.assign(this.ruleForm, data);
              this.roles.forEach(item => {
                item.role.forEach(ele => {
                  if (data.roles.indexOf(ele.id) != -1) {
                    ele.check = true;
                  }
                });
              });
              setTimeout(() => {
                this.editorInit(data.info);
              }, 300);
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    },
    enable(row) {
      this.loading = true;
      this.$axios
        .get(
          `${this.api}/expert/changeState?id=${row.id}&user_id=${
            this.$store.state.app.user_id
          }`
        )
        .then(res => {
          this.loading = false;
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
      this.loading = true;
      this.$axios
        .get(
          `${this.api}/expert/changeState?id=${row.id}&user_id=${
            this.$store.state.app.user_id
          }`
        )
        .then(res => {
          this.loading = false;
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
    }
  }
};
</script>
<style lang="less">
</style>

