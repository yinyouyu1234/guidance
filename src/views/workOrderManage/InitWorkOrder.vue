<template>
  <div class="init-work-order--wrapper">
    <view-title title="发起工单" icon="icon-news"/>
    <el-form size class="form" :model="ruleForm" ref="ruleForm">
      <el-form-item prop="title" label="项目名称" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input size="mini" width="300" v-model="ruleForm.title" autocomplete="off"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="title" :inline="true" label="片区" :label-width="formLabelWidth">
        <QcCascder/>
      </el-form-item>
      <el-form-item prop="title" label="现场人员" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input size="mini" width="300" v-model="ruleForm.title" autocomplete="off"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="title" label="工号" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input size="mini" width="300" v-model="ruleForm.title" autocomplete="off"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item prop="title" label="任务类型" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-select size="mini" v-model="condition.status" placeholder="请选择">
            <el-option
              v-for="item in optionsStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item prop="title" label="发起人员" :label-width="formLabelWidth">
        <el-col :span="8">
          <el-input size="mini" width="300" v-model="ruleForm.title" autocomplete="off"></el-input>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import ViewTitle from "@/components/ViewTitle.vue";
export default {
  name: "InitWorkOrder",
  components: {
    ViewTitle
  },
  data() {
    return {
      formLabelWidth: "150px",
      optionsStatus: [],
      condition: {},
      ruleForm: {}
    };
  }
};
</script>
<style lang="less">
</style>
