<template>
  <div class="edit-equipment-type">
    <div style="padding:20px;font-size:18px;">
      设备添加编辑
      <div style="float:right">
        <el-button size="mini" @click="back">返 回</el-button>
        <el-button v-if="this.$route.query.id" size="mini" type="primary" @click="copy">复 制</el-button>
        <el-button size="mini" type="primary" @click="submit('ruleForm')">确 定</el-button>
      </div>
    </div>
    <div style="width:600px">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item prop="name" label="设备名称" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.equipment_type_name"></el-input>
        </el-form-item>
        <el-form-item prop="factoryName" label="厂家" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.manufacturer"></el-input>
        </el-form-item>
        <el-form-item prop="code" label="编码" :label-width="formLabelWidth">
          <el-input size="mini" v-model="ruleForm.equipment_type_code"></el-input>
        </el-form-item>
        <el-form-item prop="code" label="片区" :label-width="formLabelWidth">
          <QcCascder v-if="updataQcCascder" v-model="cascaderValue" @changeCode="changeCode"/>
        </el-form-item>
        <el-form-item prop="code" label="扫码巡检" :label-width="formLabelWidth">
          <el-checkbox v-model="ruleForm.need_scan"></el-checkbox>
        </el-form-item>
        <el-form-item label="类型图片" :label-width="formLabelWidth">
          <el-upload
            :action="url"
            :headers="head"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :file-list="fileList"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
        <el-form-item prop="remark" label="备注" :label-width="formLabelWidth">
          <el-input type="textarea" size="small" v-model="ruleForm.remark"></el-input>
        </el-form-item>
        <el-form-item prop="remark" label="常见问题" :label-width="formLabelWidth">
          <div>
            <el-tag
              :key="tag"
              v-for="tag in ruleForm.tags"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >{{tag}}</el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            ></el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加一个标签</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div style="border-top:1px solid #dcdfe6">
      <span
        :class="{active:activeIndex ==0}"
        :key="-1"
        class="dialog-title"
        @click="handleClick(0)"
      >巡检项目</span>
      <span
        v-for="(item, index) in guides"
        :key="item.guideCode"
        :class="{active:activeIndex == index +1}"
        class="dialog-title"
        @click="handleClick(index + 1, item)"
      >{{item.guideName}}</span>
    </div>
    <div v-show="activeIndex == 0">
      <div class="table-box">
        <div class="left-table">
          <div class="item-title">
            巡检部位
            <i class="el-icon-circle-plus-outline" @click="addPosition(1)"></i>
          </div>
          <pc-table
            :pagination="false"
            :columnData="positionColumnData"
            :tableData="positionTableData"
            :button-info-icon="positionButtonInfoUpDown"
            @edit="editPosition"
            @delete="deletePosition"
            @rowClick="rowClick"
            @up="handleUp"
            @down="handleDown"
          />
        </div>
        <div class="right-table">
          <div class="item-title">
            {{equipment_part_name}}
            <i
              class="el-icon-circle-plus-outline"
              v-if="hasCheckedTable"
              @click="addPosition(2, 'addItemState')"
            ></i>
          </div>
          <pc-table
            v-if="updata"
            :pagination="false"
            :tableData="activeTableData"
            :columnData="DLQColumnData"
            :button-info-icon="positionButtonInfo"
            @edit="editItem"
            @delete="deleteItem"
            @solve="solveItem"
            @up="handleUpItem"
            @down="handleDownItem"
          />
        </div>
      </div>
      <div class="empty"></div>
    </div>
    <el-dialog title="操作" :visible.sync="treeDialogVisible" width="400px">
      <el-form>
        <el-form-item prop="factoryName" label="节点名称" :label-width="'70px'">
          <el-input size="mini" v-model="treeNodeText"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="treeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTreeEdit">确 定</el-button>
      </span>
    </el-dialog>
    <div style="padding-bottom:50px;overflow:hidden" v-show="activeIndex != 0">
      <div style="float: left">
        <el-aside class="left-aside">
          <div style="text-align:right;padding:0 0 10px;">
            <el-button type="primary" size="mini" @click="addTreeRoot">添加根节点</el-button>
          </div>
          <el-tree
            v-if="treeUpdata"
            :data="treeNode"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :render-content="renderContent"
            @node-click="treeNodeClick"
            draggable
          ></el-tree>
        </el-aside>
      </div>

      <div style="padding-left:300px">
        <el-header v-if="step_detail.length > 0" height="20px">{{treeTitle}}</el-header>
        <div class="right-section">
          <el-main v-for="(item, index) in step_detail" :key="index">
            <el-row :gutter="20">
              <el-col :span="12">
                <div style="padding-bottom:10px">操作内容：</div>
                <el-input
                  resize="none"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入内容"
                  v-model="item.step_detail_content"
                ></el-input>
              </el-col>
              <el-col :span="12">
                <div style="padding-bottom:10px">操作标准：</div>
                <el-input
                  resize="none"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入内容"
                  v-model="item.step_detail_standard"
                ></el-input>
              </el-col>
            </el-row>
            <div style="height:20px"></div>
            <el-tabs v-model="item.acitveTap" type="card" @tab-click="tabClick(item, index)">
              <el-tab-pane key="0" label="拍照上传" name="second">
                <el-checkbox v-model="item.need_img">是否需要拍照上传</el-checkbox>
              </el-tab-pane>
              <el-tab-pane key="1" label="图片" name="fourthw">
                <el-upload
                  v-if="updata_upload"
                  :action="url"
                  :headers="head"
                  :on-preview="handlePreviewImg"
                  :on-remove="handleRemoveImg"
                  :before-remove="beforeRemoveImg"
                  :on-success="uploadImgSuccess"
                  multiple
                  :on-exceed="handleExceedImg"
                  :file-list="item.imgsList.length > 0 ? item.imgsList : item.imgs"
                >
                  <el-button
                    size="small"
                    type="primary"
                    @click="hangleClickUpload(item, index)"
                  >点击上传</el-button>
                </el-upload>
              </el-tab-pane>
              <el-tab-pane key="2" label="视频" name="fourthe">
                <el-upload
                  v-if="updata_upload"
                  :action="url"
                  :headers="head"
                  :on-preview="handlePreviewVideo"
                  :on-remove="handleRemoveVideo"
                  :before-remove="beforeRemoveVideo"
                  :on-success="uploadVideoSuccess"
                  multiple
                  :on-exceed="handleExceedVideo"
                  :file-list="item.videosList.length > 0 ? item.videosList : item.videos"
                  :on-error="error"
                >
                  <el-button
                    size="small"
                    type="primary"
                    @click="hangleClickUpload(item, index)"
                  >点击上传</el-button>
                </el-upload>
              </el-tab-pane>
            </el-tabs>
            <div style="text-align:right;padding-top:20px;">
              <el-button size="mini" type="primary" @click="inserBeforetTreeData(index)">在前面插入操作</el-button>
              <el-button size="mini" type="primary" @click="inserAfterTreeData(index)">在后面插入操作</el-button>
              <el-button size="mini" type="danger" @click="deleteTreeData(index)">删除</el-button>
            </div>
          </el-main>
        </div>
      </div>
    </div>
    <el-dialog width="600px" title="人员专家" :visible.sync="addPersonDialogVisible">
      <pc-table
        :pagination="false"
        :tableData="[]"
        :columnData="expertColumnData"
        :button-info-icon="positionButtonInfo"
        @edit="editItem"
        @delete="deleteItem"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="addPersonDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDialog">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog width="600px" title="编辑" :close-on-click-modal="false" :visible.sync="innerVisible">
      <el-form
        v-if="innerVisibleState == 1"
        :model="ruleFormPosition"
        ref="ruleFormPosition"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="巡检部位" prop="name">
          <el-input
            size="mini"
            placeholder="请输入部位名称"
            v-model="ruleFormPosition.equipment_part_name"
          ></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="name">
          <el-input size="mini" placeholder="请输入编码" v-model="ruleFormPosition.equipment_part_code"></el-input>
        </el-form-item>
      </el-form>
      <el-form
        v-if="innerVisibleState == 2"
        :model="ruleFormItem"
        ref="ruleFormItem"
        label-width="150px"
      >
        <el-form-item label="巡检项目" prop="name">
          <el-input
            size="mini"
            placeholder="请输入项目名称"
            v-model="ruleFormItem.equipment_part_item_name"
          ></el-input>
        </el-form-item>
        <el-form-item label="巡检类别" prop="name">
          <el-select size="mini" v-model="ruleFormItem.inspecting_type" placeholder="请选择">
            <el-option
              v-for="item in inspecting_type_option"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="判断方式" prop="name">
          <el-select
            size="mini"
            v-model="ruleFormItem.check_type"
            @change="handleChange"
            placeholder="请选择"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <div v-if="ruleFormItem.check_type == '1'">
          <el-form-item prop="latitude" label="主动巡检">
            <el-checkbox @change="changeInitiative" v-model="ruleFormItem.initiative"></el-checkbox>
          </el-form-item>
          <el-form-item label="巡检标准" prop="name">
            <el-input size="mini" placeholder="请输入巡检标准" v-model="ruleFormItem.check_value"></el-input>
          </el-form-item>
          <el-form-item label="巡检方法" prop="name">
            <el-checkbox
              v-for="(item, index) in directList"
              :key="index"
              v-model="item.check"
              @change="changeCheck(item)"
            >{{item.name}}</el-checkbox>
          </el-form-item>
        </div>
        <div v-if="ruleFormItem.check_type == '2'">
          <el-form-item prop="latitude" label="主动巡检">
            <el-checkbox @change="changeInitiative" v-model="ruleFormItem.initiative"></el-checkbox>
          </el-form-item>
          <el-form-item :inline="true" label="最大值" prop="name" style="width:320px">
            <el-input size="mini" type="number" placeholder="请输入最大值" v-model="ruleFormItem.max"></el-input>
          </el-form-item>
          <el-form-item label="最小值" prop="name" style="width:320px">
            <el-input
              size="mini"
              type="number"
              @change="changeMin"
              placeholder="请输入最小值"
              v-model="ruleFormItem.min"
            ></el-input>
          </el-form-item>
          <el-form-item label="巡检方法" prop="name">
            <el-checkbox
              v-for="(item, index) in rangeList"
              :key="index"
              @change="changeCheck(item)"
              v-model="item.check"
            >
              {{item.name}}
              <input
                v-if="(item.check_type == 4)&& item.check"
                class="dialog-item-input"
                v-model="item.param"
                type="text"
              >
              <input
                v-if="(item.check_type == 5)&& item.check"
                readonly
                class="dialog-item-input"
                value="绿色"
                type="text"
              >
            </el-checkbox>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDialog">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog width="600px" title="解决方案" :visible.sync="solveVisible">
      <div v-if="solutionupdata" class="solve-warpper">
        <div class="solve-item">
          <div v-if="isRange" style="width:180px;height:40px;line-height:40px;">范围</div>
          <div style="width:340px;height:40px;line-height:40px;">推荐原因</div>
          <div style="width:80px;height:40px;line-height:40px;">操作</div>
        </div>
        <div v-for="(item, index) in solutionsList" :key="index" class="solve-item">
          <div v-if="isRange" style="width:180px;height:40px;line-height:40px;">
            <el-col :span="12">
              <el-input size="mini" v-model="item.min" placeholder="小"></el-input>
            </el-col>
            <el-col :span="12">
              <el-input size="mini" v-model="item.max" placeholder="大"></el-input>
            </el-col>
          </div>
          <div v-if="isRange" style="width:340px;height:40px;line-height:40px;">
            <el-input size="mini" v-model="item.description" placeholder="请输入内容"></el-input>
          </div>
          <div v-else style="width:340px;height:80px;line-height:40px;">
            <el-input
              style="position:relative;top:6px;"
              size="mini"
              rows="3"
              type="textarea"
              v-model="item.description"
              placeholder="请输入内容"
            ></el-input>
          </div>
          <div style="width:80px;height:40px;line-height:40px;">
            <i
              style="cursor:pointer;color:#0277bd;font-size:18px"
              class="el-icon-delete"
              @click="deleteSolve(index)"
            ></i>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="solveVisible = false">取 消</el-button>
        <el-button type="primary" v-if="isRange" @click="addSolve">增 加</el-button>
        <el-button type="primary" @click="submitSolve">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import QcCascder from "@/components/QcCascder.vue";
import UploadVideoList from "@/components/UploadVideoList.vue";
import { isImage } from "@/utils/isImage.js";
import PcTable from "@/components/Table.vue";
import { getCookie } from "@/utils/cookie";
import {
  rangeList,
  directList,
  positionColumnData,
  DLQColumnData,
  options,
  ruleFormPosition,
  positionButtonInfoUpDown,
  positionButtonInfo,
  expertColumnData
} from "./editEquipmentTypeStatic.js";
let id = 1000;
export default {
  name: "EditEquipmentType",
  components: {
    PcTable,
    UploadVideoList,
    QcCascder
  },
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      updataQcCascder: false,
      inputVisible: false,
      solutionsList: [],
      isRange: false,
      inspecting_type_option: [],
      solveVisible: false,
      solutionupdata: true,
      needScanOptions: [
        {
          value: true,
          label: "是"
        },
        {
          value: false,
          label: "否"
        }
      ],
      updata_upload: true,
      activeName2: "",
      activeRootData: {},
      treeUpdata: true,
      treeTitle: "",
      step_detail: [],
      step_detail_item: {},
      guides: [],
      tags: [],
      expertColumnData,
      addPersonDialogVisible: false,
      dynamicTags: ["温度", "湿度"],
      inputVisible: false,
      inputValue: "",
      treeNodeText: "",
      treeDialogVisible: false,
      activeIndex: 0,
      updata: true,
      fileList: [],
      imageList: "",
      url: `${this.upload}/upload/uploadimg`,
      head: { token },
      addItemState: false,
      rangeList,
      directList,
      innerVisible: false,
      innerVisibleState: "",
      formLabelWidth: "120px",
      dialogImageUrl: "",
      dialogVisible: false,
      positionTableData: [],
      activeTableData: [],
      hasCheckedTable: false,
      rules: {
        equipment_type_name: [
          { required: true, message: "请输入设备名称", trigger: "blur" }
        ],
        manufacturer: [
          { required: true, message: "请输入厂家名称", trigger: "blur" }
        ],
        equipment_type_code: [
          { required: true, message: "请输入编码", trigger: "blur" }
        ]
      },
      rulePositon: {
        name: [
          { required: true, message: "请输入巡检部位名称", trigger: "blur" }
        ]
      },
      options,
      addTreeChildrenData: {},
      treeDetailItem: {
        company_id: "",
        data_item: "",
        h: "",
        // id: "",
        imgs: [],
        imgsList: [],
        need_img: false,
        sort: "",
        status: "",
        step_detail_content: "",
        step_detail_name: "",
        step_detail_standard: "",
        step_index_id: "",
        videos: [],
        videosList: [],
        w: ""
      },
      ruleForm: {
        tags: [],
        area: "", //片区 ,
        branch_factory: "", //分厂 ,
        company_id: "", //公司id ,
        create_by: "", //创建人 ,
        create_time: "", //创建时间 ,
        equipment_type_code: "", //设备类型编码 ,
        equipment_type_name: "", //设备类型名称 ,
        factory: "", //厂 ,
        group: "", //集团 ,
        // guides (Array[PutEquipmentTypeGuide], optional): 指导选项卡 ,
        id: "", //设备类型主键id ,
        img: "", //图片 ,
        manufacturer: "", //厂家 ,
        // parts (Array[EquipmentTypePart], optional): 设备部位 ,
        remark: "", //备注 ,
        status: "", //状态 0禁用 1启用 ,
        update_by: "", //修改人 ,
        update_time: "", //修改时间
        need_scan: false
      },
      ruleFormItem: {
        id: "",
        equipment_part_item_name: "",
        check_type: "",
        check_type_name: "",
        check_value: "",
        max: "",
        min: "",
        remark: "",
        data_type: "",
        initiative: false,
        check_method: [],
        name: "",
        inspecting_type: ""
      },
      ruleFormPosition: {
        equipment_part_name: "",
        equipment_part_code: "",
        index: "",
        items: [],
        id: ""
      },
      positionColumnData,
      positionButtonInfo,
      positionButtonInfoUpDown,
      DLQColumnData,
      type: "",
      isEditPositon: false,
      treeNode: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      cascaderArrayStaitc: ["area", "group", "factory", "branch_factory"],
      cascaderValue: [],
      equipment_part_name: "",
      addItem: false,
      list: []
    };
  },
  watch: {
    solveVisible() {
      if (!this.solveVisible) {
        setTimeout(() => {
          this.init();
        }, 300);
      }
    },
    innerVisible() {
      if (!this.innerVisible) {
        setTimeout(() => {
          this.ruleFormItem = {
            id: "",
            equipment_part_item_name: "",
            check_type: "",
            check_type_name: "",
            check_value: "",
            max: "",
            min: "",
            remark: "",
            data_type: "",
            initiative: false,
            check_method: [],
            name: "",
            inspecting_type: ""
          };
          this.ruleFormPosition = {
            equipment_part_name: "",
            equipment_part_code: "",
            index: "",
            items: [],
            id: ""
          };
          this.rangeList.forEach(item => {
            item.check = false;
            item.param = "";
          });
          this.directList.forEach(item => {
            item.check = false;
            item.param = "";
          });
          this.addItemState = false;
        }, 300);
      }
    },
    treeDialogVisible() {
      if (!this.treeDialogVisible) {
        this.treeNodeText = "";
      }
    }
  },
  created() {
    this.type = this.$route.query.type;
    this.get_inspecting_type_option();
    new Promise((resole, reject) => {
      this.getList(resole);
    }).then(data => {
      if (this.type === "edit") {
        this.getData();
      } else {
        this.getDictionaryList();
        this.updataQcCascder = true;
      }
    });
  },
  methods: {
    handleUpItem(row) {
      this.upFun(row, this.activeTableData);
    },
    handleDownItem(row) {
      this.downFun(row, this.activeTableData);
    },
    upFun(row, data) {
      if (row.index == 1) {
        this.$message({
          type: "warning",
          message: "已经是第一条了！"
        });
        return;
      }

      const item = data.splice(row.index - 1, 1);
      data.splice(row.index - 2, 0, item[0]);
      data.forEach((item, index) => {
        item.index = index + 1;
      });
    },
    downFun(row, data) {
      if (row.index == data.length) {
        this.$message({
          type: "warning",
          message: "已经是最后一条了！"
        });
        return;
      }

      const item = data.splice(row.index - 1, 1);
      data.splice(row.index, 0, item[0]);
      data.forEach((item, index) => {
        item.index = index + 1;
      });
    },
    handleUp(row) {
      this.upFun(row, this.positionTableData);
    },
    handleDown(row) {
      console.log(this.positionTableData);
      this.downFun(row, this.positionTableData);
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.ruleForm.tags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    handleClose(tag) {
      this.ruleForm.tags.splice(this.tags.indexOf(tag), 1);
    },
    getList(resole) {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/list/area`)
        .then(res => {
          if (res.data.retCode == 10000) {
            res.data.data.forEach(item => {
              item.label = item.name;
            });
            this.list = res.data.data;
            resole();
          }
        });
    },
    changeCode(data) {
      try {
        this.cascaderArrayStaitc.forEach(item => {
          this.ruleForm[item] = "";
        });
        const list = [...this.cascaderArrayStaitc];
        list.length = this.cascaderValue.length;
        list.forEach((key, index) => {
          this.ruleForm[key] = data[index];
        });
      } catch (e) {
        console.log(e);
      }
    },
    error(err) {
      this.$message({
        message: "上传失败",
        type: "warning"
      });
    },
    get_inspecting_type_option() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/childrenlist/inspecting_type`)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.inspecting_type_option = res.data.data.map(item => {
              return {
                value: item.code,
                label: item.name
              };
            });
          }
        });
    },
    init() {
      this.ruleFormItem = {
        id: "",
        equipment_part_item_name: "",
        check_type: "",
        check_type_name: "",
        check_value: "",
        max: "",
        min: "",
        remark: "",
        data_type: "",
        initiative: false,
        check_method: [],
        name: "",
        solutions: []
      };
      this.ruleFormPosition = {
        equipment_part_name: "",
        index: "",
        items: [],
        id: ""
      };
      this.rangeList.forEach(item => {
        item.check = false;
        item.param = "";
      });
      this.directList.forEach(item => {
        item.check = false;
        item.param = "";
      });
      this.addItemState = false;
    },
    solveItem(r) {
      const row = JSON.parse(JSON.stringify(r));
      const { solutions } = row;
      this.solutionsList =
        solutions.length > 0
          ? solutions
          : [
              {
                min: "",
                max: "",
                description: ""
              }
            ];

      this.solveVisible = true;
      this.ruleFormItem = row;
      if (this.ruleFormItem.check_type == 2) {
        this.isRange = true;
      } else {
        this.isRange = false;
        this.solutionsList =
          this.solutionsList.length >= 1
            ? [this.solutionsList[0]]
            : [
                {
                  min: "",
                  max: "",
                  description: ""
                }
              ];
      }
      this.solutionupdata = false;
      this.$nextTick(() => {
        this.solutionupdata = true;
      });
    },
    submitSolve() {
      this.ruleFormItem.solutions = this.solutionsList;
      this.activeTableData[this.ruleFormItem.index - 1] = this.ruleFormItem;
      this.solveVisible = false;
      this.$message({
        message: "保存成功",
        type: "success"
      });
    },
    deleteSolve(index) {
      this.solutionsList.splice(index, 1);
    },
    addSolve() {
      this.solutionsList.push({
        min:
          this.solutionsList.length > 0
            ? this.solutionsList[this.solutionsList.length - 1].max
            : "",
        max: "",
        description: ""
      });
    },
    getDictionaryList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/childrenlist/GUIDE`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const arr = res.data.data.map(item => {
              return {
                guideCode: item.code,
                guideName: item.name,
                steps: null
              };
            });
            this.guides = arr;
            this.ruleForm["guides"] = this.guides;
          }
        });
    },
    copy() {
      this.$confirm("确认要复制吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.addItem = true;
          this.$message({
            type: "success",
            message: "复制成功!"
          });
        })
        .catch(() => {});
    },
    hangleClickUpload(item) {
      this.step_detail_item = item;
    },
    tabClick(item) {
      this.step_detail_item = item;
    },
    uploadImgSuccess(response, file, fileList) {
      this.step_detail_item.imgs.push({
        name: file.name,
        url: file.response.data
      });
    },
    handleRemoveImg(file, fileList) {
      this.step_detail_item.imgs.forEach((item, index) => {
        if (item.url === file.url) {
          this.step_detail_item.imgs.splice(index, 1);
        }
      });
    },
    handlePreviewImg(file) {
      window.open(file.response ? file.response.data : file.url);
    },
    handleExceedImg(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemoveImg(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    uploadVideoSuccess(response, file, fileList) {
      if (this.step_detail_item.videos) {
        this.step_detail_item.videos.push({
          name: file.name,
          url: file.response.data
        });
      } else {
        this.step_detail_item.videos = [
          {
            name: file.name,
            url: file.response.data
          }
        ];
      }
    },
    handleRemoveVideo(file, fileList) {
      this.step_detail_item.videos.forEach((item, index) => {
        if (item.url === file.url) {
          this.step_detail_item.videos.splice(index, 1);
        }
      });
    },
    handlePreviewVideo(file) {
      window.open(file.response ? file.response.data : file.url);
    },
    handleExceedVideo(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemoveVideo(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    treeNodeClick(item) {
      this.updata_upload = false;
      this.$nextTick(() => {
        this.updata_upload = true;
      });

      item.current.step_detail.forEach(item => {
        item.acitveTap = "second";
      });

      this.treeTitle = item.current.step_index_name;
      this.step_detail = item.current.step_detail;
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    addTreeRoot() {
      this.treeEditState = "addRoot";
      this.treeDialogVisible = true;
    },

    inserBeforetTreeData(index) {
      this.step_detail.splice(index, 0, { ...this.treeDetailItem });
    },

    inserAfterTreeData(index) {
      this.step_detail.splice(index + 1, 0, { ...this.treeDetailItem });
    },

    deleteTreeData(index) {
      this.step_detail.splice(index, 1);
    },

    submitTreeEdit() {
      const item = {
        children: [],
        label: this.treeNodeText,
        name: this.treeNodeText,
        current: {
          step_index_name: this.treeNodeText,
          name: this.treeNodeText,
          step_detail: [
            {
              company_id: "",
              data_item: "",
              h: "",
              id: "",
              imgs: [],
              imgsList: [],
              need_img: false,
              step_detail_content: " ",
              step_detail_name: "",
              step_detail_standard: "",
              step_index_id: "",
              videos: [],
              videosList: [],
              w: ""
            }
          ]
        }
      };
      if (this.treeEditState == "addRoot") {
        // 增加根节点
        if (this.treeNode && this.treeNode.length != 0) {
          if (this.$route.query.type == "edit") {
            this.treeNode.push(item);
          } else {
            this.treeNode.push(item);
            this.activeRootData.steps.push(item);
          }
        } else {
          this.treeNode = [item];
          this.activeRootData.steps = [item];
        }
      } else if (this.treeEditState == "add") {
        // 添加节点
        const newChild = { id: id++, label: this.treeNodeText, children: [] };
        let data = this.addTreeChildrenData.children
          ? [...this.addTreeChildrenData.children, item]
          : [item];
        this.$set(this.addTreeChildrenData, "children", data);
      } else if (this.treeEditState == "edit") {
        // 编辑节点
        this.treeUpdata = false;
        this.$nextTick(() => {
          this.treeUpdata = true;
        });
        this.addTreeChildrenData.current.step_index_name = this.treeNodeText;
        this.addTreeChildrenData.name = this.treeNodeText;
        this.addTreeChildrenData.label = this.treeNodeText;
      }
      this.treeDialogVisible = false;
    },
    append(data) {
      this.treeEditState = "add";
      this.treeDialogVisible = true;
      this.addTreeChildrenData = data;
    },

    remove(node, data) {
      this.$confirm("确认删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === data.id);
          children.splice(index, 1);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    editTree(data) {
      this.addTreeChildrenData = data;
      this.treeNodeText = data.label;
      this.treeEditState = "edit";
      this.treeDialogVisible = true;
    },

    renderContent(h, { node, data, store }) {
      return (
        <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
          <span>
            <span>{node.label}</span>
          </span>
          <span class="tree-buts">
            <i
              class="el-icon-circle-plus-outline"
              on-click={() => this.append(data)}
            />
            <i class="el-icon-edit" on-click={() => this.editTree(data)} />
            <i
              class="el-icon-delete"
              on-click={() => this.remove(node, data)}
            />
          </span>
        </span>
      );
    },
    handleClick(index, item) {
      if (this.activeIndex != index) {
        this.step_detail = [];
      }
      this.activeIndex = index;
      if (index > 0) {
        if (item.steps) {
          this.treeNode = filter(item.steps);
          this.activeRootData = item;
        } else {
          this.treeNode = [];
          this.activeRootData = item;
        }
      }
      function filter(data) {
        if (data) {
          data.forEach(item => {
            item.label = item.name;
            item.id = item.current.id;
            if (item.children) {
              filter(item.children);
            }
          });
        }
        return data ? data : [{}];
      }
    },
    changeMin() {
      if (this.ruleFormItem.min == 0 && this.ruleFormItem.max == 0) return;
      if (this.ruleFormItem.min >= this.ruleFormItem.max) {
        this.ruleFormItem.min = this.ruleFormItem.max;
        this.$message({
          message: "最大值不能小于最小值",
          type: "warning"
        });
      }
    },
    changeInitiative() {
      if (!this.ruleFormItem.initiative) {
        this.ruleFormItem.data_type = "";
      }
    },
    formatAll(ele, format) {
      format(ele);
      if (ele.children && ele.children.length > 0) {
        ele.children.forEach(item => {
          this.formatAll(item, format);
        });
      }
    },
    getData() {
      this.$axios
        .get(`${this.api}/equipmentType/get?id=${this.$route.query.id}`)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            if (data.img) {
              this.fileList.push({ url: data.img });
              this.imageList = data.img;
            }
            this.cascaderArrayStaitc.forEach(key => {
              if (data[key] == "" || data[key] == undefined) {
              } else {
                this.list.forEach(item => {
                  if (item.code == data[key]) {
                    this.cascaderValue.push(item.name);
                  }
                });
              }
            });
            data.guides.forEach((item, index) => {
              try {
                if (item.steps) {
                  item.steps.forEach(ele => {
                    this.formatAll(ele, ele => {
                      ele.current.step_detail.forEach(e => {
                        e.acitveTap = "second";
                        const arr = [];
                        if (e.imgs == "") {
                          e.imgs = [];
                          e.imgsList = [];
                        } else {
                          e.imgs.split(",").forEach(img => {
                            const i = img.lastIndexOf("/");
                            const name = img.substr(i + 1);
                            arr.push({
                              name,
                              url: img
                            });
                          });
                          e.imgs = arr;
                          e.imgsList = arr;
                        }

                        const arrvideo = [];
                        if (e.videos == "") {
                          e.videos = [];
                          e.videosList = [];
                        } else {
                          e.videos.split(",").forEach(img => {
                            const i = img.lastIndexOf("/");
                            const name = img.substr(i + 1);
                            arrvideo.push({
                              name,
                              url: img
                            });
                          });
                          e.videos = arrvideo;
                          e.videosList = arrvideo;
                        }
                      });
                    });
                  });
                }
              } catch (e) {
                console.log(e);
              }
            });
            Object.keys(this.ruleForm).forEach(key => {
              this.ruleForm[key] = data[key];
            });
            try {
              this.positionTableData = data.parts.map((item, index) => {
                if (item.items) {
                  item.items.forEach((ele, index) => {
                    ele.index = index + 1;
                    ele.name =
                      ele.check_type == 1
                        ? "直接判断"
                        : ele.check_type == 2
                        ? "范围判断"
                        : "文本输入";
                    ele.data_type = Number(ele.data_type);
                    if (ele.check_type == 2) {
                      ele.check_value = `${ele.min}-${ele.max}`;
                    }
                  });
                } else {
                  item.items = [];
                }
                item.index = index + 1;
                return item;
              });
            } catch (e) {
              console.log(e);
            }
            this.guides = data.guides;
            this.updataQcCascder = true;
          }
        })
        .catch(err => {});
    },
    changeCheck(item) {
      if (item.check) {
        //选中
        this.ruleFormItem.check_method.push(item);
      } else {
        //取消
        const list = this.ruleFormItem.check_method.filter(ele => {
          if (item.check_type != ele.check_type) {
            return ele;
          }
        });
        this.ruleFormItem.check_method = list;
      }
    },
    submit(formName) {
      const _this = this;
      const obj = {
        ..._this.ruleForm,
        guides: JSON.parse(JSON.stringify(_this.guides)),
        img: _this.imageList,
        parts: _this.positionTableData,
        id: _this.addItem ? "" : _this.$route.query.id
      };

      obj.guides.forEach(item => {
        if (item.steps) {
          item.steps.forEach(ele => {
            this.formatAll(ele, ele => {
              ele.current.step_detail.forEach(e => {
                var imgurl = "";
                if (e.imgs instanceof Array) {
                  e.imgs.forEach(url => {
                    imgurl += `${url.url},`;
                  });
                  e.imgs = imgurl.substr(0, imgurl.length - 1);
                  var videourl = "";
                  if (e.videos instanceof Array) {
                    e.videos.forEach(url => {
                      videourl += `${url.url},`;
                    });
                    e.videos = videourl.substr(0, videourl.length - 1);
                  }
                }
              });
            });
          });
        }
      });
      obj.parts &&
        obj.parts.forEach(item => {
          if (item.items) {
            item.items.forEach(ele => {
              if (ele.max == "") {
                ele.max = 0;
              }
              if (ele.min == "") {
                ele.min = 0;
              }
            });
          }
        });
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$axios.post(`${this.api}/equipmentType/put`, obj).then(res => {
            if (res.data.retCode == 10000) {
              this.$router.push({
                path: "/equipmentManage/EquipmentType"
              });
              this.$message({
                message: "添加成功",
                type: "success"
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    submitDialog() {
      const arr = [];
      // 深拷贝
      this.rangeList.forEach(item => {
        arr.push({
          ...item
        });
      });
      // 巡检部位
      if (this.innerVisibleState == 1) {
        if (this.isEditPositon) {
          // 编辑
          this.positionTableData.forEach(item => {
            if (item.index == this.ruleFormPosition.index) {
              item.equipment_part_name = this.ruleFormPosition.equipment_part_name;
              item.equipment_part_code = this.ruleFormPosition.equipment_part_code;
            }
          });
        } else {
          // 增加
          let index = this.positionTableData.length + 1;
          this.ruleFormPosition.index = index;
          const obj = {
            ...this.ruleFormPosition,
            index
          };
          this.positionTableData.push(obj);
        }
        this.innerVisible = false;
      } else {
        // 断路器的巡检项目
        // 强制更新
        this.updata = false;
        this.$nextTick(() => {
          this.updata = true;
        });
        // 深拷贝
        const copyArray = this.ruleFormItem.check_method.map(item => ({
          ...item
        }));

        const obj = {
          ...this.ruleFormItem,
          check_method: copyArray
        };

        obj.check_method.forEach(item => {
          if (item.check_type == 4) {
            item.param = arr[3].param;
          }
        });

        obj.name = obj.check_type == 1 ? "直接判断" : "范围判断";
        let str = "";

        this.rangeList.forEach(ele => {
          obj.check_method.forEach(i => {
            if (ele.check_type == i.check_type) {
              str += `${ele.name},`;
            }
          });
        });

        obj.check_type_name = str.substr(0, str.length - 1);

        obj.data_type_name = obj.initiative ? "是" : "否";

        if (this.addItemState) {
          // 增加
          obj.index = this.activeTableData.length + 1;
          if (obj.check_type != 1) {
            obj.check_value = `${obj.min}-${obj.max}`;
          }
          this.activeTableData.push(obj);
        } else {
          // 编辑
          if (obj.check_type != 1) {
            obj.check_value = `${obj.min}-${obj.max}`;
          }
          this.activeTableData[obj.index - 1] = obj;
        }
        this.innerVisible = false;
      }
      this.$message({
        message: "添加成功",
        type: "success"
      });
    },
    rowClick(row) {
      row.items.forEach(item => {
        item.data_type_name = item.initiative ? "是" : "否";
        let str = "";
        this.rangeList.forEach(ele => {
          item.check_method.forEach(i => {
            if (ele.check_type == i.check_type) {
              str += `${ele.name},`;
            }
          });
        });
        item.check_type_name = str.substr(0, str.length - 1);
      });
      this.activeTableData = row.items;
      this.hasCheckedTable = true;
      this.equipment_part_name = row.equipment_part_name;
    },
    handleChange(val) {
      console.log(val, this.ruleFormItem);
      if (val == 3) {
        this.ruleFormItem.max = "";
        this.ruleFormItem.min = "";
      }
    },
    editPosition(row) {
      this.innerVisible = true;
      this.innerVisibleState = 1;
      this.ruleFormPosition.equipment_part_name = row.equipment_part_name;
      this.ruleFormPosition.equipment_part_code = row.equipment_part_code;
      this.ruleFormPosition.id = row.id;
      this.ruleFormPosition.index = row.index;
      this.isEditPositon = true;
    },
    deletePosition(row) {
      this.$confirm("确认删除此条信息吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.positionTableData.splice(row.index - 1, 1);
          this.$message({
            message: "删除成功",
            type: "success"
          });
          this.positionTableData.forEach((item, index) => {
            item.index = index + 1;
          });
        })
        .catch(() => {});
    },
    deleteItem(row) {
      this.$confirm("确认删除此条信息吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.activeTableData.splice(row.index - 1, 1);
          this.activeTableData.forEach((item, index) => {
            item.index = index + 1;
          });
          this.$message({
            message: "删除成功",
            type: "success"
          });
        })
        .catch(() => {});
    },
    editItem(r) {
      const row = { ...r };
      this.innerVisible = true;
      this.innerVisibleState = 2;
      this.ruleFormItem = row;
      this.directList.forEach(item => {
        row.check_method.forEach(ele => {
          if (item.check_type == ele.check_type) {
            item.check = true;
          }
        });
      });
      this.rangeList.forEach(item => {
        row.check_method.forEach(ele => {
          if (item.check_type == ele.check_type) {
            item.check = true;
            item.param = ele.param;
          }
        });
      });
    },
    back() {
      this.$confirm("确定取消吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$router.go(-1);
        })
        .catch(() => {});
    },
    addPosition(state, addItemState = false) {
      this.innerVisible = true;
      this.innerVisibleState = state;
      this.addItemState = addItemState;
      this.isEditPositon = false;
    },
    handleRemove(file, fileList) {
      this.imageList = "";
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeAvatarUpload(file) {
      const imageFlag = isImage(file);
      if (!imageFlag) {
        this.$message.error("只能上传图片");
      }
      return imageFlag;
    },
    handleAvatarSuccess(res, file) {
      this.imageList = res.data;
    }
  }
};
</script>
<style lang="less">
.edit-equipment-type {
  .dialog-title {
    font-size: 18px;
    font-weight: bold;
    padding: 20px;
    display: inline-block;
    cursor: pointer;
  }
  .active {
    color: #0277bd;
  }
  .item-title {
    font-size: 15px;
    padding: 10px 0;
    .el-icon-circle-plus-outline {
      font-size: 15px;
      color: #409eff;
      cursor: pointer;
    }
  }
  .left-table {
    float: left;
    width: 30%;
    padding-right: 30px;
    padding-left: 30px;
    padding-bottom: 30px;
    border-right: 1px solid #dcdfe6;
  }
  .right-table {
    float: left;
    width: 60%;
    padding-left: 30px;
  }
  .empty {
    clear: both;
  }
  .dialog-item-input {
    border-radius: 4px;
    border: 1px solid #c0c4cc;
    color: #606266;
    height: 20px;
    outline: none;
  }
  .table-box {
    min-width: 1260px;
  }
  .tree-buts {
    i {
      font-size: 16px;
      padding-right: 8px;
      color: #606266;
    }
  }
  .left-aside {
    padding: 0 14px;
  }
  .right-section {
    border-left: 1px solid #dcdfe6;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
