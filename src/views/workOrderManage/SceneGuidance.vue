<template>
  <div class="scene-guidance-wrapper">
    <div v-show="false" id="div_device" class="panel panel-default">
      <div class="select">
        <label for="audioSource">Audio source:</label>
        <select id="audioSource"></select>
      </div>
      <div class="select">
        <label for="videoSource">Video source:</label>
        <select id="videoSource"></select>
      </div>
    </div>
    <div v-show="false" id="video" style="margin:0 auto;">
      <div id="agora_local" style="float:right;width:210px;height:147px;display:inline-block;"></div>
    </div>

    <view-title title="现场服务登记表" icon="icon-fuwu"/>
    <div class="scen-guidance-box">
      <div class="top-info">
        <div class="top-info--left">
          <el-form :label-position="'right'" label-width="150px" :model="ruleForm">
            <el-form-item label="项目名称">
              <el-input size="mini" readonly v-model="ruleForm.projectName"></el-input>
            </el-form-item>
            <el-form-item label="眼镜编号">
              <el-input size="mini" readonly v-model="ruleForm.toolNumber"></el-input>
            </el-form-item>
            <el-form-item label="设备编号">
              <el-input readonly size="mini" v-model="ruleForm.kks"></el-input>
            </el-form-item>
            <el-form-item label="任务编号">
              <el-input readonly size="mini" v-model="formTaskId"></el-input>
            </el-form-item>
            <el-form-item label="现场人员">
              <el-input readonly size="mini" v-model="ruleForm.executorUserName"></el-input>
            </el-form-item>
            <el-form-item label="工号">
              <el-input readonly size="mini" v-model="ruleForm.executorUserCode"></el-input>
            </el-form-item>
            <el-form-item label="时间">
              <el-input readonly size="mini" v-model="ruleForm.startTime"></el-input>
            </el-form-item>
            <el-form-item prop="customer_name" label="客户名称">
              <el-input size="mini" readonly v-model="ruleFormOther.customer_name"></el-input>
            </el-form-item>
            <el-form-item prop="product_code" label="产品编号">
              <el-input size="mini" readonly v-model="ruleFormOther.product_code"></el-input>
            </el-form-item>
            <el-form-item prop="model_code" label="型号">
              <el-input size="mini" readonly v-model="ruleFormOther.model_code"></el-input>
            </el-form-item>
            <el-form-item prop="map_code" label="产品图号">
              <el-input size="mini" readonly v-model="ruleFormOther.map_code"></el-input>
            </el-form-item>
            <el-form-item prop="assembly_code" label="总成号">
              <el-input size="mini" readonly v-model="ruleFormOther.assembly_code"></el-input>
            </el-form-item>
            <el-form-item label="支持类型">
              <el-input readonly size="mini" v-model="ruleForm.supportType"></el-input>
            </el-form-item>
            <el-form-item label="项目描述">
              <el-input
                type="textarea"
                :rows="5"
                size="mini"
                v-model="ruleForm.taskDescription"
                resize="none"
                readonly
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="top-info--right">
          <div id="video" style="margin:0 auto;">
            <div
              v-if="status"
              id="agora_remote"
              style="margin:0 10px 10px;width:800px;height:650px;display:inline-block;background:	#F0FFFF;overflow:hidden"
            ></div>
            <div
              v-if="type == 'hasSupport' || type == 'hasSupportCom'"
              style="margin:0 10px 10px;width:800px;height:650px;display:inline-block;background:	#F0FFFF;overflow:hidden"
            >
              <video
                v-if="ruleForm.remoteGuideList && ruleForm.remoteGuideList[0]"
                controls
                autoplay
                :src="ruleForm.remoteGuideList[0].url"
              ></video>
            </div>
            <div
              v-if="type == 'notProblemBack' || type == 'exportAnwser' || type =='hasProblemBack' || type == 'hasComplete' "
              style="margin:0 10px 10px;width:800px;height:650px;text-align:center;font-size:40px;line-height:500px;display:inline-block;background:	#F0FFFF"
            >见问题描述</div>
          </div>

          <div v-if="status" class="tool">
            <el-input
              style="width:400px"
              size="mini"
              v-model="sendMessageText"
              placeholder="请输入要发送的内容"
            ></el-input>
            <el-button size="mini" type="primary" @click="sendMessage">发送信息</el-button>
            <div style="padding: 10px 0">
              <el-button size="mini" @click="addExpert">添加专家</el-button>
              <el-upload
                class="upload-demo"
                :headers="head"
                :action="appurl"
                :on-success="handleAvatarSuccess"
                :show-file-list="false"
                :file-list="fileList"
              >
                <el-button size="mini" type="primary">发送文件</el-button>
              </el-upload>
            </div>
            <div style="padding:0 0 10px 0">
              <el-tag v-for="(tag, index) in tags" :key="index" type="success">{{tag.expert_name}}</el-tag>
            </div>
          </div>
          <div
            v-if="(!status && type != 'notProblemBack') && type != 'exportAnwser' && type != 'hasProblemBack' && type != 'hasComplete'"
            style="padding:10px;"
          >
            <el-button type="primary" @click="goKnolegeVideo">添加到知识库</el-button>
          </div>
        </div>
      </div>
      <div class="middle-info">
        <el-form :label-position="'right'" label-width="150px" :model="ruleForm">
          <el-container class="container-border">
            <el-aside width="500px">
              <el-form-item label="问题描述">
                <el-input
                  type="textarea"
                  :rows="8"
                  size="mini"
                  v-model="ruleForm.problemDescription"
                  resize="none"
                  readonly
                ></el-input>
              </el-form-item>
            </el-aside>
            <el-main>
              <file-list :list="ruleForm.problemAttachments"/>
            </el-main>
          </el-container>
          <el-container v-if="!status" class="container-border">
            <el-aside width="500px">
              <el-form-item label="片区经理(回复)">
                <el-input
                  class="manage-message-back--container"
                  type="textarea"
                  :rows="8"
                  size="mini"
                  v-model="ruleForm.managerReply"
                  resize="none"
                  :readonly="status"
                ></el-input>
              </el-form-item>
            </el-aside>
            <el-main>
              <div class="upload-wrapper">
                <el-upload
                  v-if="type == 'notProblemBack' || type == 'hasProblemBack'"
                  :action="url"
                  :headers="head"
                  :on-preview="handlePreviewManage"
                  :on-remove="handleRemoveManage"
                  :before-remove="beforeRemoveManage"
                  multiple
                  :file-list="fileList"
                  :data="upLoadData"
                >
                  <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
                <div v-else>
                  <file-list
                    v-if="type == 'hasComplete' || type == 'exportAnwser'"
                    :list="ruleForm.managerReplyAttachments"
                  />
                  <file-list
                    v-if="ruleForm.remoteGuideList && ruleForm.remoteGuideList[0]"
                    :list="ruleForm.remoteGuideList[0].filelist"
                  />
                </div>
              </div>
            </el-main>
          </el-container>
          <el-container
            v-if="type =='notProblemBack' || type == 'hasProblemBack'"
            class="container-border"
          >
            <el-form-item label="移交给专家">
              <el-button size="mini" @click="addExpert">选择专家</el-button>
              <el-tag
                closable
                v-for="(item, index) in addExportList"
                @close="handleClose(item, index)"
                type="success"
                :key="item.id"
              >{{item.expert_name}}</el-tag>
              <el-button
                style="margin-left:0px"
                size="mini"
                type="primary"
                @click="transferExpert"
              >移交专家</el-button>
              <el-button size="mini" @click="complete" type="primary">已完成</el-button>
            </el-form-item>
          </el-container>
          <el-container
            class="container-border"
            v-for="(item,index) in ruleForm.expertList"
            :key="index"
            v-if="!status || type == 'hasSupportCom'"
          >
            <el-aside width="500px">
              <el-form-item :label="item.expertUserName + '(专家回复)'">
                <!-- <message-show-list/> -->
                <el-input
                  type="textarea"
                  resize="none"
                  :rows="8"
                  size="mini"
                  v-model="item.expertReply"
                ></el-input>
              </el-form-item>
            </el-aside>
            <el-main>
              <file-list :list="item.expertReplyAttachments"/>
            </el-main>
          </el-container>
        </el-form>
      </div>
    </div>
    <el-dialog
      :close-on-click-modal="false"
      title="添加专家"
      width="750px"
      :visible.sync="dialogFormVisible"
    >
      <el-form :inline="true">
        <el-form-item label="专家姓名">
          <el-input size="mini" clearable placeholder="请输入姓名" v-model="condition.expert_name"></el-input>
        </el-form-item>
        <el-form-item label="擅长领域">
          <el-input
            size="mini"
            clearable
            placeholder="请输入擅长领域"
            v-model="condition.equipment_type_name "
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" class="scene-guidance-search" @click="filter">查询</el-button>
        </el-form-item>
      </el-form>

      <div style="padding:20px">
        <pc-table
          :tableData="tableData"
          :columnData="columnData"
          :page-index="condition.pageIndex"
          :total="total"
          @changePage="changePage"
          @choice="choice"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
    <el-dialog width="50%" title :visible.sync="innerVisible" append-to-body>
      <video-dialog v-if="innerVisible" :url="dialogUrl"/>
    </el-dialog>
  </div>
</template>
<script>
import AgoraRTC from "agora-rtc-sdk";
import PcTable from "@/components/Table.vue";
import ImageList from "@/components/ImageList.vue";
import ViewTitle from "@/components/ViewTitle.vue";
import UploadVideoList from "@/components/UploadVideoList.vue";
import MessageShowList from "@/components/MessageShowList.vue";
import FileList from "@/components/FileList.vue";
import { getCookie } from "@/utils/cookie";
import Search from "@/components/Search.vue";
export default {
  name: "SceneGuidance",
  components: {
    ViewTitle,
    PcTable,
    ImageList,
    UploadVideoList,
    MessageShowList,
    FileList,
    Search
  },
  data() {
    const token = getCookie("user_info")
      ? JSON.parse(getCookie("user_info")).token
      : "";
    return {
      ruleFormOther: {},
      formTaskId: window.sessionStorage.getItem("problemFeedbackTaskId")
        ? window.sessionStorage.getItem("problemFeedbackTaskId")
        : this.$route.query.taskId,
      upLoadData: {
        serviceId: window.sessionStorage.getItem("problemFeedbackId")
          ? window.sessionStorage.getItem("problemFeedbackId")
          : this.$route.query.id
      },
      problemFeedbackId: window.sessionStorage.getItem("problemFeedbackId"),
      problemFeedbackTaskCode: window.sessionStorage.getItem(
        "problemFeedbackTaskCode"
      ),
      problemFeedbackTaskId: window.sessionStorage.getItem(
        "problemFeedbackTaskId"
      ),
      type: this.$route.query.type,
      total: 0,
      addExportList: [],
      condition: {
        expert_name: "",
        phone_number: "",
        user_code: "",
        status: -1,
        pageIndex: "1",
        pageSize: "10",
        equipment_type_name: ""
      },
      head: { token },
      url: `${this.api}/onSiteService/uploadAttachment`,
      appurl: `${this.appUrl}/guide/upload`,
      exportMessageList: {},
      exportImgList: {},
      manageMessageList: [],
      sendMessageText: "",
      imgList: [],
      tags: [],
      fileList: [],
      innerVisible: false,
      dialogFormVisible: false,
      tableData: [],
      columnData: [
        {
          prop: "expert_name",
          label: "专家姓名"
        },
        {
          prop: "expert_type",
          label: "类型"
        },
        {
          prop: "equipment_type_name",
          label: "擅长领域"
        }
      ],
      status: this.$route.query.name ? true : false,
      ruleForm: {
        taskCode: "",
        kks: "",
        areaType: "", //片区 ,
        executorUserCode: "", //现场人员工号 ,
        executorUserId: "", // 现场人员id ,
        executorUserName: "", //现场人员名 ,
        expertList: [], //专家 ,
        expertReplyAttachments: [], // 专家答复附件 ,
        managerReply: "", //片区经理答复 ,
        managerReplyAttachments: [], // 片区经理答复附件 ,
        managerUserId: "", // 片区经理id ,
        managerUserName: "", //片区经理名 ,
        problemAttachments: [], // 问题描述附件 ,
        problemDescription: "", // 问题描述 ,
        projectCode: "", //项目编号 ,
        projectName: "", //项目名称 ,
        remoteGuideList: [], // 支持类型是远程指导时使用 ,
        startTime: "", //时间 ,
        supportType: "", //支持类型 ,
        taskDescription: "", //项目描述 ,
        toolNumber: "" //眼镜编号
      },
      client: null,
      localStream: null,
      transferExpertInfo: {
        areaType: this.$route.query.areaType,
        expertList: [],
        managerReply: "",
        serviceId: Number(this.$route.query.id)
      }
    };
  },
  watch: {
    tags() {
      console.log(this.tags);
    },
    dialogFormVisible() {
      if (this.dialogFormVisible) {
      } else {
        this.condition = {
          expert_name: "",
          phone_number: "",
          user_code: "",
          status: -1,
          pageIndex: "1",
          pageSize: "10"
        };
      }
    }
  },
  created() {
    this.getDataInfo();
    this.getExportList();
    this.$store.state.app.exportAddServeCallBackFun = this.exportAddServeCallBack;
    this.$store.state.app.exportLeaveServeCallBackFun = this.exportLeaveServeCallBack;
  },
  mounted() {
    const _this = this;
    var audioSelect = document.querySelector("select#audioSource");
    var videoSelect = document.querySelector("select#videoSource");
    AgoraRTC.getDevices(function(devices) {
      for (var i = 0; i !== devices.length; ++i) {
        var device = devices[i];
        var option = document.createElement("option");
        option.value = device.deviceId;
        if (device.kind === "audioinput") {
          option.text =
            device.label || "microphone " + (audioSelect.length + 1);
          audioSelect.appendChild(option);
        } else if (device.kind === "videoinput") {
          option.text = device.label || "camera " + (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } else {
          console.log("Some other kind of source/device: ", device);
        }
      }
    });
    AgoraRTC.Logger.error("this is error");
    AgoraRTC.Logger.warning("this is warning");
    AgoraRTC.Logger.info("this is info");
    // AgoraRTC.Logger.debug("this is debug");

    if (this.$route.query.name) {
      this.join();
    }
  },
  methods: {
    getIdByKKS(kks) {
      this.$axios
        .post(`${this.api}/equipment/getList`, {
          equipment_name: "",
          kks,
          pageIndex: 1,
          pageSize: 10,
          status: ""
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            console.log(data, 11111111111111);
            if (data.items.length == 1) {
              this.getRuleFormOther(data.items[0].id);
            }
          }
        });
    },
    getRuleFormOther(id) {
      this.$axios.get(`${this.api}/equipment/get?id=${id}`).then(res => {
        const { data } = res.data;
        console.log(data, 22222222222222222222222222222222);
        this.ruleFormOther = data;
      });
    },
    complete() {
      this.$confirm("确认完成吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post(`${this.api}/onSiteService/managerHandle`, {
              areaType: this.ruleForm.areaType,
              managerReply: this.ruleForm.managerReply,
              serviceId: this.$route.query.id
            })
            .then(res => {
              if (res.data.retCode == 10000) {
                this.$message({
                  type: "success",
                  message: "提交成功"
                });
                this.$router.go(-1);
              }
            });
        })
        .catch(() => {});
    },
    goKnolegeVideo() {
      this.$router.push({
        path: "/videoKnowledge/SubmitVideo",
        query: {
          url: this.ruleForm.remoteGuideList[0].url
        }
      });
    },
    publish() {},
    join() {
      const _this = this,
        channel_key = null;

      _this.client = AgoraRTC.createClient({ mode: "live" });
      _this.client.init(
        "10007fd8f0184459a83d7400af8f69f5",
        function() {
          console.log("AgoraRTC _this.client initialized");
          _this.client.setClientRole(
            "host",
            function() {
              console.log("setHost success");
            },
            function(e) {
              console.log("setHost failed", e);
            }
          );

          _this.client.join(
            channel_key,
            _this.$route.query.name,
            Number(JSON.parse(getCookie("user_info")).id),
            function(uid) {
              console.log("User " + uid + " join channel successfully");
              console.log(
                videoSource,
                audioSource,
                "-----------------------------"
              );
              console.log(
                videoSource.value,
                audioSource.value,
                "-----------------------------"
              );
              var camera = videoSource.value;
              var microphone = audioSource.value;
              var localStream = AgoraRTC.createStream({
                streamID: uid,
                audio: true,
                microphoneId: microphone,
                video: false,
                screen: false
              });
              //localStream = AgoraRTC.createStream({streamID: uid, audio: false, cameraId: camera, microphoneId: microphone, video: false, screen: true, extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg'});
              if (document.getElementById("video").checked) {
                // localStream.setVideoProfile("720p_3");
              }

              // The user has granted access to the camera and mic.
              localStream.on("accessAllowed", function() {
                console.log("accessAllowed");
              });

              // The user has denied access to the camera and mic.
              localStream.on("accessDenied", function() {
                console.log("accessDenied");
              });

              localStream.init(
                function() {
                  console.log("getUserMedia successfully");
                  localStream.play("agora_local");

                  _this.client.publish(localStream, function(err) {
                    console.log("Publish local stream error: " + err);
                  });

                  _this.client.on("stream-published", function(evt) {
                    console.log("Publish local stream successfully");
                  });

                  _this.client.publish(localStream, function(err) {
                    console.log("Publish local stream error: " + err);
                  });
                },
                function(err) {
                  console.log("getUserMedia failed", err);
                }
              );
            },
            function(err) {
              console.log("Join channel failed", err);
            }
          );
        },
        function(err) {
          console.log("AgoraRTC _this.client init failed", err);
        }
      );

      var channelKey = "";
      _this.client.on("error", function(err) {
        console.log("Got error msg:", err.reason);
        if (err.reason === "DYNAMIC_KEY_TIMEOUT") {
          _this.client.renewChannelKey(
            channelKey,
            function() {
              console.log("Renew channel key successfully");
            },
            function(err) {
              console.log("Renew channel key failed: ", err);
            }
          );
        }
      });

      _this.client.on("stream-added", function(evt) {
        var stream = evt.stream;
        console.log("New stream added: " + stream.getId());
        console.log("Subscribe ", stream);
        _this.client.subscribe(stream, function(err) {
          console.log("Subscribe stream failed", err);
        });
      });

      _this.client.on("stream-subscribed", function(evt) {
        var stream = evt.stream;
        stream.play("agora_remote");
      });

      _this.client.on("stream-removed", function(evt) {
        var stream = evt.stream;
        stream.stop();
      });

      _this.client.on("peer-leave", function(evt) {
        var stream = evt.stream;
        console.log(stream.streamId);
        if (stream.streamId == _this.$route.query.peerId) {
          _this.$alert("已结束视频", {
            confirmButtonText: "确定"
          });
          stream.stop();
          _this.leave();
        } else {
          let name = "";
          this.tableData.map(item => {
            if (item.id == stream.streamId) {
              name = item.expert_name;
            }
          });
          window.vm.$notify({
            title: "提示",
            message: `${name}离开远程指导`,
            type: "success"
          });
        }
      });
    },
    exportAddServeCallBack(account, uid) {
      console.log(1111111111);
      let name = "";
      this.tableData.map(item => {
        if (item.id == account) {
          name = item.expert_name;
          this.tags.push(item);
        }
      });
      window.vm.$notify({
        title: "提示",
        message: `${name}加入远程指导`,
        type: "success"
      });
    },
    exportLeaveServeCallBack(account, uid) {
      let name = "";
      console.log(this.tableData);
      this.tableData.forEach(item => {
        if (item.id == account) {
          name = item.expert_name;
        }
      });
      console.log(this.tags);
      this.tags.forEach((item, index) => {
        console.log(item);
        if (item.id == account) {
          this.tags.splice(index, 1);
        }
      });
      window.vm.$notify({
        title: "提示",
        message: `${name}离开远程指导`,
        type: "success"
      });
    },
    transferExpert() {
      this.transferExpertInfo.expertList = [];
      this.addExportList.forEach(item => {
        this.transferExpertInfo.expertList.push({
          expertUserId: item.id,
          expertUserName: item.expert_name
        });
      });
      this.transferExpertInfo.managerReply = this.ruleForm.managerReply;
      this.$axios
        .post(
          `${this.api}/onSiteService/handedOverToExpert`,
          this.transferExpertInfo
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            this.$router.go(-1);
          }
        });
    },
    getDataInfo() {
      this.$axios
        .post(
          `${this.api}/onSiteService/${
            this.problemFeedbackId
              ? this.problemFeedbackId
              : this.$route.query.id
          }?taskId=${
            this.problemFeedbackTaskId != "null" &&
            this.problemFeedbackTaskId != null
              ? this.problemFeedbackTaskId
              : this.$route.query.taskId
          }`
        )
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            const list = data.expertReplyAttachments;
            data.expertList.forEach(item => {
              list.forEach(ele => {
                if (item.id == ele.userId) {
                  if (item.list) {
                    item.list = [ele];
                  } else {
                    item.list.push(ele);
                  }
                }
              });
            });
            if (data.remoteGuideList && data.remoteGuideList[0]) {
              data.remoteGuideList[0].filelist.forEach(item => {
                item.fileName = item.filename;
              });
            }
            this.ruleForm = data;
            if (data.kks) {
              this.getIdByKKS(data.kks);
            }
          }
        });
    },
    choice(row) {
      console.log(row.id);
      const data = this.status ? this.tags : this.addExportList;
      let hasSelect = data.some(item => {
        return item.id == row.id;
      });

      if (this.status) {
        // 远程指导
        this.$store.state.app.session.channelInviteUser2(
          this.$route.query.name,
          row.id.toString(),
          JSON.stringify({
            _require_peer_online: 0,
            problemFeedbackId: this.problemFeedbackId || 1
          })
        );
        window.sessionStorage.setItem("exportId", row.id);
        this.$message({
          type: "success",
          message: "发出邀请"
        });
      } else {
        // 问题反馈
        if (hasSelect) {
          this.$message({
            type: "warning",
            message: "已经添加了"
          });
          return;
        }
        this.addExportList.push(row);
        this.$message({
          type: "success",
          message: "添加成功"
        });
      }
    },
    addExportFun() {},
    changePage(page) {
      this.condition.pageIndex = page;
      this.getExportList();
    },
    getExportList() {
      this.$axios
        .post(`${this.api}/expert/getList`, this.condition)
        .then(res => {
          if (res.data.retCode == 10000) {
            const { data } = res.data;
            data.items.forEach(item => {
              item.select = false;
              item.expert_type =
                item.expert_type == 1
                  ? "专家"
                  : item.expert_type == 2
                  ? "专工"
                  : "供应商";
              item.buttonInfo = [
                {
                  name: "choice",
                  type: "primary",
                  label: "选择"
                }
              ];
            });
            this.tableData = data.items;
            this.total = data.total;
          }
        });
    },
    handleRemoveManage(file, fileList) {
      this.$axios.post(
        `${this.api}/onSiteService/deleteAttachment?attachmentId`
      );
    },
    handlePreviewManage(file) {
      window.open(file.response.data.url);
    },
    beforeRemoveManage(file, fileList) {
      console.log(this.$confirm(`确定移除 ${file.name}？`));
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    isImg(msg) {
      const imgType = ["jpg", "jpeg", "png"];
      const index = msg.lastIndexOf(".");
      let filename = msg.substring(index + 1);
      return imgType.indexOf(filename.toLowerCase()) != -1;
    },
    handleAvatarSuccess(response, file) {
      this.$axios
        .post(`${this.appUrl}/guide/send_file`, {
          fileId: response.data.id,
          roomId: this.$route.query.name
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            this.$message({
              type: "success",
              message: "文件发送成功"
            });
            this.$store.state.app.channel.messageChannelSend(
              JSON.stringify({
                content: response.data.url,
                msgType: 2
              })
            );
          }
        });
    },
    sendMessage() {
      if (this.sendMessageText.trim() == "") {
        this.$message({
          type: "warning",
          message: "请输入内容"
        });
        return;
      }
      this.$axios
        .post(`${this.api}/onSiteService/managerHandle`, {
          areaType: this.ruleForm.areaType,
          managerReply: this.sendMessageText,
          serviceId: this.problemFeedbackId
        })
        .then(res => {
          if (res.data.retCode == 10000) {
            this.sendMessageText = "";
          }
        });
      this.$store.state.app.channel.messageChannelSend(
        JSON.stringify({
          content: this.sendMessageText,
          msgType: 1
        })
      );
    },
    filter() {
      this.getExportList();
    },
    bigImg(url) {
      this.dialogUrl = url;
      this.innerVisible = true;
    },
    handleClose(item, index) {
      this.addExportList.splice(index, 1);
    },
    addExpert() {
      this.dialogFormVisible = true;
    },

    unpublish() {
      this.client.unpublish(localStream, function(err) {
        console.log("Unpublish local stream failed" + err);
      });
    },
    leave() {
      window.sessionStorage.removeItem("problemFeedbackId");
      window.sessionStorage.removeItem("problemFeedbackTaskCode");
      window.sessionStorage.removeItem("problemFeedbackTaskId");
      window.sessionStorage.removeItem("exportId");
      const _this = this;
      this.$store.state.app.channel.channelLeave &&
        this.$store.state.app.channel.channelLeave();
      if (this.client) {
        this.client.leave(
          function() {
            console.log("Leavel channel successfully");
            _this.$router.push({
              path: "/workOrderManage/AllSceneRegisterForm"
            });
          },
          function(err) {
            console.log("Leave channel failed");
          }
        );
        this.$axios
          .post(`${this.api}/onSiteService/managerHandle`, {
            areaType: this.ruleForm.areaType,
            managerReply: this.ruleForm.managerReply,
            serviceId: this.upLoadData.serviceId
          })
          .then(res => {
            if (res.data.retCode == 10000) {
            }
          });
      }
    }
  },

  beforeDestroy() {
    this.leave();
  }
};
</script>
<style lang="less">
.scene-guidance-wrapper {
  .manage-message-back--container {
    height: 155px;
  }
  .container-border {
    border-bottom: 1px solid #ebebeb;
    margin-bottom: 10px;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .top-info {
    display: flex;
    border-bottom: 1px solid #ebebeb;
    .top-info--left {
      width: 500px;
      border-right: 1px solid #ebebeb;
      padding-right: 20px;
      padding-top: 10px;
      .el-form-item {
        margin-bottom: 10px;
      }
    }
    .top-info--right {
      width: 500px;
      padding-left: 20px;
    }
  }

  .el-dialog__body .el-input--mini {
    width: 100%;
  }

  .upload-demo {
    display: inline;
  }
  .el-button + .el-button {
    margin-left: 0;
  }

  .image-list--wrapper {
    // height: 90px;
  }

  .middle-info {
    padding-top: 20px;
  }
  .el-main {
    padding: 0;
  }
  .upload-wrapper {
    width: 400px;
    padding: 0 10px;
  }
}
</style>
