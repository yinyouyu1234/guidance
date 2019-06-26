<template>
  <div v-if="updata" class="work-order-detail">
    <view-title title="工单详情" icon="icon-suoyougongdan"/>
    <el-form size class="form" :model="ruleForm" :rules="rules" ref="ruleForm">
      <el-form-item prop="projectName" label="项目名称" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input
            size="mini"
            width="300"
            placeholder="输入项目名称"
            v-model="ruleForm.projectName"
            autocomplete="off"
            :readonly="readonly"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item :inline="true" label="片区" :label-width="formLabelWidth">
        <QcCascder v-if="updataQcCascder" v-model="cascaderValue"/>
      </el-form-item>
      <el-form-item :inline="true" label="省/市" :label-width="formLabelWidth">
        <QcCascder v-if="updataQcCascder" v-model="cityValue" status="province"/>
      </el-form-item>
      <el-form-item prop="executorUserId" label="现场人员" :label-width="formLabelWidth">
        <el-col>
          <el-select
            :readonly="readonly"
            size="mini"
            v-model="ruleForm.executorUserId"
            placeholder="选择现场人员"
            @change="selectWorker"
          >
            <el-option
              v-for="item in optionsWorker"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="工号" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input
            :readonly="true"
            placeholder="输入工号"
            size="mini"
            width="300"
            v-model="ruleForm.executorUserCode"
            autocomplete="off"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="managerUserId" label="片区经理" :label-width="formLabelWidth">
        <el-col>
          <el-select
            :readonly="readonly"
            size="mini"
            v-model="ruleForm.managerUserId"
            placeholder="选择片区经理"
            @change="selectManage"
          >
            <el-option
              v-for="item in optionsManage"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="发起人员" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input
            :readonly="true"
            placeholder="输入发起人员姓名"
            size="mini"
            width="300"
            v-model="username"
            autocomplete="off"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="现场服务任务单" :label-width="formLabelWidth">
        <el-upload
          :action="urlUpload"
          :headers="head"
          :on-remove="handleRemove"
          :on-success="handleAvatarSuccess"
          :on-preview="handlePreviewImg"
          :file-list="upLoadFileList"
          multiple
        >
          <el-button size="mini" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item
        v-if="status == 'notbegin' || status == undefined"
        label="增加任务"
        :label-width="formLabelWidth"
      >
        <el-col :span="8">
          <el-select
            :readonly="readonly"
            size="mini"
            v-model="taskType"
            placeholder="请选择要增加的任务"
            @change="handleAddTask"
          >
            <el-option
              v-for="item in optionsStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
      </el-form-item>
    </el-form>
    <transition-group name="list" tag="p">
      <div
        style="border-bottom:1px solid #0277bd;border-top:1px solid #0277bd"
        v-for="(item,index) in ruleForm.taskList"
        v-if="ruleForm.taskList && (item.del ? false: true)"
        :key="index"
      >
        <!-- 巡检任务 -->
        <div v-if="item.taskType == 'inspecting'" inspecting>
          <div class="form-title">{{item.taskTypeName}}</div>
          <el-form label-width="150px" class="form">
            <el-form-item
              v-if="status == 'notbegin' || status == undefined"
              :inline="true"
              label="删除该项"
              :label-width="formLabelWidth"
            >
              <el-button size="mini" type="danger" @click="deleteItem(item,index)">删除</el-button>
              <el-button size="mini" type="danger" @click="over(item,index)">结束</el-button>
            </el-form-item>
            <el-form-item label="眼镜编号" :label-width="formLabelWidth">
              <el-col :span="8">
                <el-input
                  :readonly="readonly"
                  size="mini"
                  width="300"
                  placeholder="请输入眼镜编号"
                  v-model="item.toolNumber"
                  autocomplete="off"
                ></el-input>
              </el-col>
            </el-form-item>
            <el-form-item label="班次名称" prop="flights_name">
              <el-autocomplete
                :readonly="readonly"
                class="inline-input"
                size="mini"
                v-model="item.scheduleName"
                :fetch-suggestions="querySearch"
                placeholder="请输入内容"
                @select="handleSelectFlight"
                @focus="handleFocusFligt(item)"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="班次时间" prop="task_time">
              <el-col :span="8">
                <el-input
                  :readonly="readonly"
                  disabled
                  size="mini"
                  placeholder="自动匹配"
                  v-model="item.scheduleTime"
                ></el-input>
              </el-col>
            </el-form-item>
            <el-form-item label="线路选择" prop="patrol_route_name">
              <el-col :span="8">
                <el-input
                  :readonly="readonly"
                  disabled
                  size="mini"
                  placeholder="自动匹配"
                  v-model="item.patrolRouteName"
                ></el-input>
              </el-col>
            </el-form-item>
            <el-form-item label="日期">
              <el-date-picker
                :readonly="readonly"
                size="mini"
                type="dates"
                v-model="item.inspectionTime"
                @focus="focus(item)"
                placeholder="选择一个或多个日期"
                :picker-options="pickerOptions1"
                format="yyyy-MM-dd "
                value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
              <br>
              <!-- <div class="allot-tasks--time">{{ item.inspectionTime}}</div> -->
            </el-form-item>
          </el-form>
        </div>
        <!-- 安装 -->
        <div v-else>
          <div class="form-title">{{item.taskTypeName}}</div>
          <el-form size class="form">
            <el-form-item
              v-if="status == 'notbegin' || status == undefined"
              :inline="true"
              label="删除该项"
              :label-width="formLabelWidth"
            >
              <el-button size="mini" type="danger" @click="deleteItem(item,index)">删除</el-button>
              <el-button size="mini" type="danger" @click="over(item,index)">结束</el-button>
            </el-form-item>
            <el-form-item label="眼镜编号" :label-width="formLabelWidth">
              <el-col :span="8">
                <el-input
                  :readonly="readonly"
                  size="mini"
                  width="300"
                  placeholder="请输入眼镜编号"
                  v-model="item.toolNumber"
                  autocomplete="off"
                ></el-input>
              </el-col>
            </el-form-item>
            <el-form-item :inline="true" label="设备类型" :label-width="formLabelWidth">
              <el-form-item prop="date1">
                <el-select
                  :readonly="readonly"
                  size="mini"
                  v-model="item.equipmentTypeId"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in equipmentTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-form-item>
            <el-form-item
              v-if="item.taskType != 'GUIDE_INSTALL'"
              label="KKS"
              :label-width="formLabelWidth"
            >
              <el-col :span="8">
                <el-input
                  :readonly="readonly"
                  size="mini"
                  width="300"
                  placeholder="请输入KKS码"
                  v-model="item.kks"
                  autocomplete="off"
                ></el-input>
              </el-col>
            </el-form-item>
            <el-form-item :inline="true" label="时间" :label-width="formLabelWidth">
              <el-date-picker
                :readonly="readonly"
                size="mini"
                v-model="item.startTimeOld"
                type="datetime"
                placeholder="选择日期时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
            <el-form-item :inline="true" label="任务描述" :label-width="formLabelWidth">
              <el-col :span="12">
                <el-input
                  :readonly="readonly"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入内容"
                  v-model="item.taskDescription"
                ></el-input>
              </el-col>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="id" class="form-title">状态</div>
        <el-form v-if="id" size class="form">
          <el-form-item :inline="true" label="状态" :label-width="formLabelWidth">
            <el-form-item prop="date1">
              <el-select disabled size="mini" v-model="item.taskStatus" placeholder="请选择">
                <el-option
                  v-for="item in taskStatusOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form-item>
          <el-form-item
            :inline="true"
            label="任务开始时间"
            :label-width="formLabelWidth"
          >{{item.inspectionTimeCopy}}</el-form-item>
          <el-form-item :inline="true" label="任务结束时间" :label-width="formLabelWidth">{{item.endTime}}</el-form-item>
        </el-form>
      </div>
    </transition-group>
    <el-dialog
      :title="dialogStatus == 'video' ? '视频知识库' : '问题反馈'"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form :inline="true">
        <el-form-item class="work-order-detail--input" label="筛选条件">
          <el-input size="mini" v-model="searchContent" clearable placeholder="请输入标签名或者项目名称"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button size="mini" class="scene-guidance-search" @click="filter">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        border
        ref="multipleTable"
        :data="dialogStatus == 'video' ? knowledgeTableData : tableData"
        height="500px"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55">
          <template slot-scope="scope">
            <div>
              <el-checkbox v-model="scope.row.checked" @change="hangleChange(scope.row)"></el-checkbox>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="视频名称"></el-table-column>
        <el-table-column label="预览">
          <template slot-scope="scope">
            <div v-if="scope.row.url" class="table-image--warpper">
              <video @click="playVideo(scope.row.url)" :src="scope.row.url" alt/>
            </div>
            <div
              style="color:#409EFF;cursor:pointer"
              v-if="scope.row.button"
              @click="goDetail(scope.row)"
            >
              <a :href="`/#/SceneGuidance?${queryList}`" target="_blank">{{scope.row.button}}</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog width="800px" title="详情" :visible.sync="innerVisible" append-to-body>
      <video controls autoplay :src="bigImgUrl"/>
    </el-dialog>
    <div v-if="status == 'notbegin' || status == undefined" style="padding:30px 100px 150px">
      <el-button
        type="primary"
        @click="handleChoice('video')"
      >视频知识库（{{ruleForm.knowledgeBaseIds && ruleForm.knowledgeBaseIds.length > 0 ? '已配置' : '未配置'}}）</el-button>
      <el-button
        type="primary"
        @click="handleChoice('question')"
      >问题反馈（{{ruleForm.problemFeedbackIds && ruleForm.problemFeedbackIds.length > 0 ? '已配置' : '未配置'}}）</el-button>
      <el-button type="danger" v-loading="loading" @click="save('ruleForm')">保 存</el-button>
    </div>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
import QcCascder from "@/components/QcCascder.vue";
import { getCookie } from "@/utils/cookie";
import qs from "qs";
export default {
  name: "WorkOrderDetail",
  components: {
    ViewTitle,
    QcCascder
  },
  data() {
    const token = this.token;
    return {
      upLoadFileList: [],
      upLoadFileListId: [],
      urlUpload: `${this.api}/workorder/uploadAttachment`,
      head: { token },
      optionsManage: [],
      updataQcCascder: false,
      queryList: "",
      hostUrl: location.host,
      bigImgUrl: "",
      searchContent: "",
      dialogStatus: "",
      bigImgUrl: "",
      innerVisible: false,
      knowledgeTableData: [],
      tableData: [],
      multipleSelection: [],
      dialogVisible: false,
      status: this.$route.query.taskStatus,
      dataPickerUpdata: true,
      loading: false,
      updata: true,
      optionsWorker: [],
      username: JSON.parse(getCookie("user_info")).user_name,
      cascaderArrayStaitc: [
        "areaType",
        "groupType",
        "factoryType",
        "subFactoryType"
      ],
      cityArrayStaitc: ["provinceType", "cityType"],
      cascaderValue: [],
      cityValue: [],
      id: this.$route.query.id,
      readonly: this.$route.query.id ? false : false,
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 1000 * 60 * 60 * 24;
        }
      },
      textarea: "",
      rules: {
        managerUserId: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        projectName: [{ required: true, message: "不能为空", trigger: "blur" }],
        executorUserName: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        executorUserId: [
          { required: true, message: "不能为空", trigger: "blur" }
        ]
      },
      value1: "",
      formLabelWidth: "150px",
      taskType: "",
      taskStatusOption: [
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
      equipmentTypeList: [],
      optionsStatus: [],
      ruleForm: {
        areaType: "", //片区 ,
        cityType: "", //市 ,
        executorUserCode: "", // 现场人员工号 ,
        executorUserId: "", // 现场人员Id ,
        executorUserName: "", // 现场人员名 ,
        factoryType: "", //厂 ,
        groupType: "", //集团 ,
        id: "", // 工单id(修改操作时需要) ,
        projectName: "", //项目名称 ,
        provinceType: "", //省 ,
        subFactoryType: "", //分厂 ,
        taskList: [],
        problemFeedbackIds: [],
        knowledgeBaseIds: [],
        managerUserId: ""
      },
      taskListForm: {
        fileIdList: [],
        fileList: [],
        endTime: "", //结束时间 ,
        equipmentTypeId: "", // 巡检任务-设备类型id ,
        id: "", // 任务id(修改操作时需要) ,
        kks: "", //其它任务-kks ,
        patrolRouteId: "", // 巡检任务-线路id ,
        patrolRouteName: "",
        scheduleTime: "",
        scheduleId: "", // 巡检任务-班次id ,
        scheduleName: "", //巡检任务-班次名 ,
        scheduleTime: "", //巡检任务-班次时间 ,
        startTimeOld: "", //开始时间 ,
        taskDescription: "", //其它任务-任务描述 ,
        taskType: "", //其它任务-任务类型 ,
        toolNumber: "", //眼镜编号
        inspectionTime: [],
        taskGroupCode: ""
      },
      restaurants: [],
      restaurantsUserName: [],
      checkTaskDataActive: {},
      dictionaryDataList: [],
      dictionaryDataCityList: [],
      inspectingDate: {},
      cache: false,
      problemFeedbackIds: [],
      knowledgeBaseIds: [],
      deleteFileIds: []
    };
  },
  watch: {
    dialogVisible() {
      if (!this.dialogVisible) {
        // this.$refs.multipleTable.clearSelection();
      }
    },
    "$route.query": function(n, o) {
      if (JSON.stringify(n) == "{}") {
        this.updata = false;
        this.$nextTick(() => {
          this.updata = true;
        });
        this.ruleForm = {
          fileList: [],
          fileIdList: "",
          knowledgeBaseIds: [],
          areaType: "", //片区 ,
          cityType: "", //市 ,
          executorUserCode: "", // 现场人员工号 ,
          executorUserId: "", // 现场人员Id ,
          executorUserName: "", // 现场人员名 ,
          factoryType: "", //厂 ,
          groupType: "", //集团 ,
          id: "", // 工单id(修改操作时需要) ,
          projectName: "", //项目名称 ,
          provinceType: "", //省 ,
          subFactoryType: "", //分厂 ,
          taskList: []
        };
        this.cascaderValue = [];
        this.cityValue = [];
        this.deleteFileIds = [];
      }
    }
  },
  created() {
    this.getOptionData();
    this.getEquipmentTypeList();
    this.loadSelectOption();
    this.loadAllUserName();
    this.getUserType();
    this.getDictionaryList();
    this.getDictionaryCityList();
    this.getManage();
    if (this.id) {
      this.loadAll();
    } else {
      this.cache = true;
      this.knowledgeBaseList();
      this.problemFeedbackList();
      this.updataQcCascder = true;
    }
  },
  mounted() {},
  methods: {
    over(item) {
      if (!!this.id) {
        this.$confirm("确认结束任务吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.inspectingDate[item.taskGroupCode].forEach(e => {
              const id = e[Object.keys(e)[0]];
              this.$axios
                .post(`${this.api}/workorder/termination/${id}`)
                .then(res => {
                  if (res.data.retCode == 10000) {
                    this.$message({
                      type: "success",
                      message: "工作任务是否完成！"
                    });
                    this.loadAll();
                  }
                });
            });
          })
          .catch(() => {});
      } else {
        this.$message({
          type: "warning",
          message: "该任务未建立，不能结束！"
        });
      }
    },
    handlePreviewImg(file) {
      window.open(file.response ? file.response.data : file.url);
    },
    handleRemove(res, response) {
      console.log(res);
      const index = this.upLoadFileListId.indexOf(
        res.id ? res.id : res.response.data.id
      );
      const id = this.upLoadFileListId.splice(index, 1);
      this.deleteFileIds = this.deleteFileIds.concat(id);
      console.log(this.deleteFileIds);
    },
    handleAvatarSuccess(res, file) {
      this.upLoadFileListId.push(res.data.id);
    },
    getManage() {
      this.$axios.get(`${this.commonApi}/user/manager`).then(res => {
        if (res.data.retCode == 10000) {
          this.optionsManage = res.data.data;
        }
      });
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        if (this.dialogStatus == "video") {
          const allVal = val.map(item => item.id);
          this.ruleForm.knowledgeBaseIds = allVal;
          this.knowledgeTableData.forEach(item => {
            this.$set(item, "checked", true);
          });
        } else {
          const allVal = val.map(item => item.id);
          this.ruleForm.problemFeedbackIds = allVal;
          this.tableData.forEach(item => {
            this.$set(item, "checked", true);
          });
        }
      } else {
        if (this.dialogStatus == "video") {
          this.ruleForm.knowledgeBaseIds = [];
          this.knowledgeTableData.forEach(item => {
            this.$set(item, "checked", false);
          });
        } else {
          this.ruleForm.problemFeedbackIds = [];
          this.tableData.forEach(item => {
            this.$set(item, "checked", false);
          });
        }
      }
    },
    hangleChange(row) {
      if (row.checked) {
        if (this.dialogStatus == "video") {
          this.ruleForm.knowledgeBaseIds.push(row.id);
        } else {
          this.ruleForm.problemFeedbackIds.push(row.id);
        }
      } else {
        if (this.dialogStatus == "video") {
          // this.ruleForm.knowledgeBaseIds = val.map(item => item.id);
          this.ruleForm.knowledgeBaseIds.forEach((item, index) => {
            if (item == row.id) {
              this.ruleForm.knowledgeBaseIds.splice(index, 1);
            }
          });
        } else {
          this.ruleForm.problemFeedbackIds.forEach((item, index) => {
            if (item == row.id) {
              this.ruleForm.problemFeedbackIds.splice(index, 1);
            }
          });
        }
      }
    },
    goDetail(row) {
      let type;
      if (
        row.supportType == "远程指导" &&
        (row.serviceStatus == "已受理" ||
          row.serviceStatus == "已完成" ||
          row.serviceStatus == "未处理")
      ) {
        type = "hasSupport";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "已受理"
      ) {
        type = "hasProblemBack";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "已完成"
      ) {
        type = "hasComplete";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "未处理"
      ) {
        type = "notProblemBack";
      } else if (
        row.supportType == "问题反馈" &&
        row.serviceStatus == "专家受理"
      ) {
        type = "exportAnwser";
      }

      this.queryList = qs.stringify({
        id: row.id,
        areaType: row.areaType,
        type,
        taskId: row.taskId,
        taskCode: row.taskCode
      });
    },
    problemFeedbackList(filter) {
      return this.$axios
        .get(
          `${this.api}/workorder/problemFeedbackList?searchContent=${
            this.searchContent
          }`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            res.data.data.forEach(item => {
              item.button = "查看";
            });
            this.tableData = res.data.data;
            if (filter) {
              this.tableData.forEach(item => {
                if (this.problemFeedbackIds.indexOf(item.id) != -1) {
                  this.$set(item, "checked", true);
                } else {
                  this.$set(item, "checked", false);
                }
              });
            } else {
              this.tableData.forEach(item => {
                this.$set(item, "checked", false);
              });
            }
          }
        });
    },
    playVideo(url) {
      this.innerVisible = true;
      this.bigImgUrl = url;
    },
    knowledgeBaseList(filter) {
      return this.$axios
        .get(
          `${this.api}/workorder/knowledgeBaseList?searchContent=${
            this.searchContent
          }`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            this.knowledgeTableData = res.data.data;
            if (filter) {
              this.knowledgeTableData.forEach(item => {
                if (this.knowledgeBaseIds.indexOf(item.id) != -1) {
                  this.$set(item, "checked", true);
                } else {
                  this.$set(item, "checked", false);
                }
              });
            } else {
              this.knowledgeTableData.forEach(item => {
                this.$set(item, "checked", false);
              });
            }
          }
        });
    },

    submit() {
      this.dialogVisible = false;
    },
    handleChoice(status) {
      this.dialogStatus = status;
      this.dialogVisible = true;
    },
    handleImage(url) {
      this.innerVisible = true;
      this.bigImgUrl = url;
    },

    focus(e, item) {},
    getDictionaryList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/list/area`)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.dictionaryDataList = res.data.data;
          }
        });
    },
    getDictionaryCityList() {
      this.$axios
        .get(`${this.commonApi}/dataDictionary/list/province`)
        .then(res => {
          if (res.data.retCode == 10000) {
            this.dictionaryDataCityList = res.data.data;
          }
        });
    },
    selectManage() {},
    selectWorker(value) {
      this.optionsWorker.forEach(item => {
        if (item.value == value) {
          this.ruleForm.executorUserCode = item.code;
          this.ruleForm.executorUserId = item.value;
          this.ruleForm.executorUserName = item.label;
        }
      });
    },
    getUserType() {
      this.$axios.get(`${this.commonApi}/user/1`).then(res => {
        if (res.data.retCode == 10000) {
          this.optionsWorker = res.data.data;
        }
      });
    },
    getEquipmentTypeList() {
      this.$axios.get(`${this.api}/equipmentType/getAll`).then(res => {
        if (res.data.retCode == 10000) {
          const { data } = res.data;
          this.equipmentTypeList = data;
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
            this.optionsStatus = this.optionsStatus.concat(arr);
          }
        });
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
            this.optionsStatus = this.optionsStatus.concat(arr);
          }
        });
    },
    save(formName) {
      const obj = JSON.parse(JSON.stringify(this.ruleForm));
      if (obj.taskList.length == 0) {
        this.$message({
          type: "warning",
          message: "请选择增加任务"
        });
        return;
      }
      let flag = false;
      obj.taskList.forEach(item => {
        if (item.del != 1) {
          if (
            item.taskType == "inspecting" &&
            item.inspectionTime.length == 0
          ) {
            flag = true;
          }

          if (item.taskType != "inspecting" && item.startTimeOld.length == 0) {
            flag = true;
          }
        }
      });

      if (flag) {
        this.$message({
          type: "warning",
          message: "请选择时间"
        });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          this.cascaderArrayStaitc.length = this.cascaderValue.length;
          let arr = [];
          this.cascaderValue.forEach(ele => {
            this.dictionaryDataList.forEach(item => {
              if (ele == item.name) {
                arr.push(item.code);
              }
            });
          });

          this.cascaderValue = arr;
          this.cascaderArrayStaitc.forEach((key, index) => {
            obj[key] = this.cascaderValue[index];
          });

          this.cityArrayStaitc.length = this.cityValue.length;
          let arrCity = [];
          this.cityValue.forEach(ele => {
            this.dictionaryDataCityList.forEach(item => {
              if (ele == item.name) {
                arrCity.push(item.code);
              }
            });
          });

          this.cityValue = arrCity;
          this.cityArrayStaitc.forEach((key, index) => {
            obj[key] = this.cityValue[index];
          });

          new Promise((resolve, reject) => {
            for (let i = 0; i < obj.taskList.length; i++) {
              const item = obj.taskList[i];
              if (item.taskType == "inspecting") {
                console.log(item.inspectionTime, item.del);
                if (item.inspectionTime.length > 0 && item.del != 1) {
                  const arr = [];
                  item.inspectionTime.forEach(ele => {
                    console.log(item, 11111);
                    const copy = { ...item };
                    copy.id = "";
                    copy.inspectionTime = ele;
                    arr.push(copy);
                  });
                  obj.taskList.splice(i, 1);
                  i--;
                  setTimeout(() => {
                    obj.taskList = obj.taskList.concat(arr);
                    resolve();
                  });
                } else {
                  resolve();
                }
                console.log(obj.taskList);
              } else {
                item.inspectionTime = item.startTimeOld;
                setTimeout(() => {
                  resolve();
                }, 100);
              }
            }
          }).then(() => {
            const dataList = {};
            obj.taskList.forEach((item, index) => {
              if (item.taskType == "inspecting") {
                if (item.taskGroupCode) {
                  if (dataList[item.taskGroupCode]) {
                    dataList[item.taskGroupCode].push(item.inspectionTime);
                  } else {
                    dataList[item.taskGroupCode] = [item.inspectionTime];
                  }
                }
              }
            });
            let flag = true;
            Object.keys(this.inspectingDate).map(key => {
              this.inspectingDate[key].forEach(itemp => {
                if (
                  dataList[key] &&
                  dataList[key].indexOf(Object.keys(itemp)[0]) == -1
                ) {
                  for (let i = 0; i < obj.taskList.length; i++) {
                    const item = obj.taskList[i];
                    if (item.taskType == "inspecting") {
                      if (item.taskGroupCode == key) {
                        const copy = JSON.parse(JSON.stringify(item));
                        console.log(copy);
                        copy.del = 1;
                        copy.inspectionTime = Object.keys(itemp)[0];
                        obj.taskList.push(copy);
                        if (flag) {
                          obj.taskList.splice(i, 1);
                        }
                        flag = false;

                        break;
                      }
                    }
                  }
                }
              });
            });
            console.log(obj.taskList);

            Object.keys(this.inspectingDate).map(key => {
              obj.taskList.forEach((item, index) => {
                if (item.taskType == "inspecting") {
                  if (item.taskGroupCode == key) {
                    this.inspectingDate[key].forEach(ele => {
                      if (Object.keys(ele)[0] == item.inspectionTime) {
                        item.id = ele[Object.keys(ele)[0]];
                      }
                    });
                  }
                }
              });
            });
            obj.taskList.forEach(item => {
              if (item.inspectionTime.length == 0) {
                item.inspectionTime = "";
              }
              if (item.taskType == "inspecting") {
                // item.scheduleTime = item.scheduleTime.split(" ")[1];
              }
            });
            obj.fileIdList = this.upLoadFileListId;
            console.log(obj);
            this.$axios.post(`${this.api}/workorder/save`, obj).then(res => {
              this.loading = false;
              if (res.data.retCode == 10000) {
                this.$router.push({
                  path: "/workOrderManage/AllWorkOrder"
                });
                this.$message({
                  type: "success",
                  message: "保存成功"
                });
              }
            });
            this.deleteFileIds;
            this.deleteFileFun();
          });
        } else {
          return false;
        }
      });
    },
    async deleteFileFun() {
      for (let i = 0; i < this.deleteFileIds.length; i++) {
        const id = this.deleteFileIds[i];
        await this.$axios
          .post(`${this.api}/workorder/deleteAttachment/${id}`)
          .then(res => {
            console.log(i);
          });
      }
    },
    deleteItem(item, index) {
      this.$confirm("确认删除这条信息吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$set(item, "del", 1);
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {});
    },
    handleAddTask(typeCode) {
      const hasAdd = this.ruleForm.taskList.some(item => {
        return typeCode == item.taskType && item.del != 1;
      });
      if (hasAdd) {
        this.$message({
          type: "warning",
          message: "已经添加过了"
        });
        return;
      }
      let name = "";
      this.optionsStatus.forEach(ele => {
        if (ele.value == typeCode) {
          this.taskListForm.taskTypeName = ele.label;
        }
      });
      this.taskListForm.taskGroupCode = new Date().getTime() + "";
      this.taskListForm.taskType = this.taskType;
      this.ruleForm.taskList.push({ ...this.taskListForm });
      this.taskType = "";
    },
    handleSelect(item) {
      this.ruleForm.user_id = item.id;
    },
    querySearch(queryString, cb) {
      const restaurants = this.restaurants;
      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      cb(results);
    },
    querySearchUserName(queryString, cb) {
      const restaurants = this.restaurantsUserName;
      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      cb(results);
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleFocusFligt(item) {
      console.log(item);
      this.checkTaskDataActive = item;
    },
    handleSelectFlight(item) {
      this.$axios.get(`${this.api}/flights/get?id=${item.id}`).then(res => {
        if (res.data.retCode == 10000) {
          const { data } = res.data;
          this.checkTaskDataActive.addTaskTime = new Date(
            data.flights_time
          ).getTime();
          this.checkTaskDataActive.patrolRouteName = data.patrol_route_name;
          this.checkTaskDataActive.scheduleTime = data.flights_time;
          this.checkTaskDataActive.scheduleTime = data.flights_time.split(
            " "
          )[1];
          this.checkTaskDataActive.patrolRouteId = data.patrol_route_id;
          this.checkTaskDataActive.scheduleName = data.flights_name;
          this.checkTaskDataActive.scheduleId = data.id;
        }
      });
    },
    loadAllUserName() {
      this.$axios.get(`${this.api}/user/getInspectorList`).then(res => {
        if (res.data.retCode == 10000) {
          this.restaurantsUserName = res.data.data.map(item => ({
            id: item.value,
            value: item.label
          }));
        }
      });
    },
    loadSelectOption() {
      this.$axios.get(`${this.api}/flights/getAllSelectList`).then(res => {
        this.restaurants = res.data.data.map(item => ({
          id: item.value,
          value: item.label
        }));
      });
    },
    loadAll() {
      this.$axios.get(`${this.api}/workorder/${this.id}`).then(res => {
        if (res.data.retCode == 10000) {
          const { data } = res.data;
          this.cascaderArrayStaitc.forEach(key => {
            if (data[key] != "" && data[key] != null) {
              this.cascaderValue.push(data[key]);
            }
          });
          this.cityArrayStaitc.forEach(key => {
            if (data[key] != "") {
              this.cityValue.push(data[key]);
            }
          });

          const obj = {};
          const copy = [];
          for (let i = 0; i < data.taskList.length; i++) {
            const item = data.taskList[i];
            if (item.taskType == "inspecting") {
              item.scheduleTime = item.scheduleTime.split(" ")[1];
              copy.push(item.inspectionTime);
              item.inspectionTime =
                item.inspectionTime.split(" ")[0] + " 00:00:00";
            }
            if (!(item.taskGroupCode in obj)) {
              // 没有
              obj[item.taskGroupCode] = [
                {
                  [item.inspectionTime]: item.id
                }
              ];
            } else {
              // 有
              obj[item.taskGroupCode].push({
                [item.inspectionTime]: item.id
              });
              data.taskList.splice(i, 1);
              i--;
            }
          }
          for (let i = 0; i < data.taskList.length; i++) {
            const item = data.taskList[i];
            if (obj[item.taskGroupCode]) {
              let str = "";
              obj[item.taskGroupCode].map(ele => {
                if (str == "") {
                  str += Object.keys(ele)[0];
                } else {
                  str += `,${Object.keys(ele)[0]}`;
                }
              });
              item.inspectionTime = str;
            }
          }
          data.taskList.forEach(item => {
            if (
              item.inspectionTime.length > 0 &&
              item.taskType == "inspecting"
            ) {
              item.inspectionTimeCopy = copy;
              item.inspectionTime = item.inspectionTime.split(",");
            } else {
              item.startTimeOld = item.inspectionTime;
            }

            if (item.taskType == "inspecting") {
              for (let i = 0; i < item.inspectionTime.length; i++) {
                const ele = item.inspectionTime[i];
                item.inspectionTime[i] = ele.split(" ")[0] + " 00:00:00";
              }
            }
          });
          Promise.all([this.knowledgeBaseList(), this.problemFeedbackList()])
            .then(result => {
              if (data.knowledgeBaseIds) {
                this.knowledgeBaseIds = data.knowledgeBaseIds;
                this.knowledgeTableData.forEach(item => {
                  if (data.knowledgeBaseIds.indexOf(item.id) != -1) {
                    this.$set(item, "checked", true);
                  } else {
                    this.$set(item, "checked", false);
                  }
                });
              }

              if (data.problemFeedbackIds) {
                this.problemFeedbackIds = data.problemFeedbackIds;
                this.tableData.forEach(item => {
                  if (data.problemFeedbackIds.indexOf(item.id) != -1) {
                    this.$set(item, "checked", true);
                  } else {
                    this.$set(item, "checked", false);
                  }
                });
              }
            })
            .catch(error => {
              console.log(error);
            });
          data.knowledgeBaseIds = Array.from(new Set(data.knowledgeBaseIds));
          data.problemFeedbackIds = Array.from(
            new Set(data.problemFeedbackIds)
          );
          this.upLoadFileList = data.fileList.map(item => ({
            url: item.url,
            id: item.id,
            name: item.filename
          }));

          this.upLoadFileListId = data.fileList.map(item => item.id);
          this.inspectingDate = obj;
          console.log(this.inspectingDate);
          this.ruleForm = data;
          this.updataQcCascder = true;
        }
      });
    },
    filter() {
      if (this.dialogStatus == "video") {
        this.knowledgeBaseList(true);
      } else {
        this.problemFeedbackList(true);
      }

      this.$message({
        type: "success",
        message: "搜索成功"
      });
    }
  }
};
</script>
<style lang="less">
.el-dialog__body {
  video {
    width: 100%;
  }
}
.table-image--warpper {
  height: 40px;

  video {
    position: relative;
    top: -20px;
    width: 80px;
    height: 80px;
    cursor: pointer;
  }
}
.work-order-detail--input {
  .el-input {
    width: 100% !important;
  }
}
.work-order-detail {
  .el-upload-list.el-upload-list--text {
    width: 270px;
  }
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s;
  }
  .list-enter, .list-leave-to
/* .list-leave-active for below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }

  .el-form-item {
    margin-bottom: 10px;
  }
  .form {
    width: 950px;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;
  }
  .el-select {
    .el-input {
      width: 90%;
    }
  }
  .form-title {
    color: #555;
    font-size: 16px;
    font-weight: bold;
    padding: 20px 0 0 30px;
  }
  .editor {
    margin-top: 16px;
  }
}
</style>
