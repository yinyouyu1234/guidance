<template>
  <div class="pctable-wrapper">
    <el-table
      header-row-class-name="qingce-table--head"
      cell-class-name="qingce-table--cell"
      :data="myTableData"
      v-loading="loading"
      highlight-current-row
      border
      @row-click="rowClick"
      style="width: 100%"
    >
      <el-table-column
        v-for="item in columnData"
        :key="item.prop"
        :show-overflow-tooltip="true"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
      ></el-table-column>
      <template v-if="myTableData.length && myTableData[0].buttonInfo">
        <el-table-column
          v-if="myTableData[0].buttonInfo.length > 0"
          :label="buttonColum"
          :width="80 * myTableData[0].buttonInfo.length"
        >
          <template slot-scope="scope">
            <div
              @click="handleClick(scope.row,scope.row.buttonInfo[0], true)"
              v-if="scope.row.buttonInfo[0].isButton"
              :class="scope.row.buttonInfo[0].type == 'danger' ? 'text-active' : ''"
            >{{scope.row.buttonInfo[0].label}}</div>
            <div v-else>
              <el-button
                v-for="item in scope.row.buttonInfo"
                :key="item.name"
                @click="handleClick(scope.row, item, true)"
                :type="item.type"
                :disabled="item.disabled"
                size="mini"
              >{{item.label}}</el-button>
            </div>
          </template>
        </el-table-column>
      </template>
      <el-table-column
        v-if="buttonInfoIcon.length > 0"
        label="操作"
        :width="buttonInfoIcon.length * 32"
      >
        <template slot-scope="scope">
          <span class="button-icon" v-for="item in buttonInfoIcon" :key="item.name">
            <i :class="item.icon" :title="item.label" @click="handleClick(scope.row, item)"></i>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="pagination" class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage4"
        :page-size="10"
        layout="total, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "PcTable",
  props: {
    buttonColum: {
      type: String,
      default: "操作"
    },
    total: {
      type: Number
    },
    columnData: {
      type: Array
    },
    buttonInfo: {
      type: Array,
      default: () => []
    },
    buttonInfoIcon: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array
    },
    pagination: {
      type: Boolean,
      default: true
    },
    tableData: {
      type: Array
    },
    loading: {
      type: Boolean,
      default: false
    },
    pageIndex: {
      type: [Number, String]
    }
  },
  data() {
    return {
      currentPage4: 1,
      myTableData: []
    };
  },
  watch: {
    pageIndex() {
      this.currentPage4 = this.pageIndex;
    },
    tableData() {
      this.myTableData = this.tableData;
    }
  },
  created() {
    this.myTableData = this.tableData;
  },
  methods: {
    handleSizeChange(val) {},
    handleCurrentChange(val) {
      this.$emit("changePage", val);
    },
    handleClick(row, item, isButton) {
      this.$emit(item.name, row);
      return false;
    },
    rowClick(row, column, event) {
      if (event.target.nodeName != "I") {
        this.$emit("rowClick", row);
      }
    }
  }
};
</script>
<style lang="less">
@import "../styles/basic";

.pctable-wrapper {
  .block {
    padding: 30px 100px 0;
    text-align: center;
  }
  .qingce-table--head {
    color: black;
    div {
      font-weight: bold !important;
      font-size: 15px;
    }
  }
  .qingce-table--cell {
    color: @backgroundColor;
  }
  .button-icon {
    padding-right: 8px;
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  .text-active {
    color: red;
    cursor: pointer;
  }
}
</style>
