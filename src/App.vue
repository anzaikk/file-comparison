<!--
 * @Author: anzaikk 599957546@qq.com
 * @Date: 2023-03-12 08:14:37
 * @LastEditors: anzaikk 599957546@qq.com
 * @LastEditTime: 2023-03-23 00:22:38
 * @FilePath: /vue_learn/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<template>
  <small>临时界面功能不完善，样式很丑</small>
  <h2>匹配完之后点击下面的下载，下载成Excel文件。上传有G.Unit的文件的时候G.Unit这个列名一定要写对，不要有空格符号</h2>
  <el-button round class="download" type="success" size="medium" @click="exportData">下载匹配好的数据</el-button>
  <el-button round class="downloadForce" type="warning" size="mini" @click="exportData('force')">强制下载数据</el-button>
  <el-button round class="downloadForce" type="success" size="mini" @click="exportNotData()">下载完全不匹配的数据</el-button>
  <br>
  <br>
  <div class="upload-file">

    <el-upload class="upload-import-file" drag :on-change="uploadImportFile" :show-file-list="false" :auto-upload="false">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        <em>上传进口文件</em>
      </div>
    </el-upload>

    <el-upload class="upload-standard" drag :on-change="standardFile" :show-file-list="false" :auto-upload="false">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        <em>上传税则文件</em>
      </div>
    </el-upload>

  </div>

  <div>
    <el-dialog v-model="dialogTableVisible" width="80%" title="以下展示本条信息相关的税则">
      <h4>原数据:</h4>
      <el-table :data="originData['data']" style="width: 100%" stripe>
        <el-table-column v-for="(tableData, k, index) in originData['data'][0]" :prop="k" :label="k"
          :key="index"></el-table-column>
      </el-table>
      <h4>相似数据:</h4>
      <el-table :data="resembleData['data']" style="width: 100%" stripe>
        <el-table-column v-for="(tableData, k, index) in resembleData['data'][0]" :min-width="resembleDataWidth[index]"
          :prop="k" :label="k" :key="index"></el-table-column>
        <el-table-column fixed="right" label="Operations" width="120" v-if="isShowEdit">
          <template #default="scope">
            <el-button type="primary" @click="bestData(scope)">选它为最佳</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>


  <div class="import-file-data">
    <el-table :key="itemKey" height="1000" :data="importTableData['tableData']" style="width: 100%"
      :row-class-name="tableRowClassName">
      <el-table-column v-for="(tableData, index) in showImportDataColumn['tableColumn']" :prop="tableData.prop"
        :label="tableData.label" :key="index" />
      <el-table-column fixed="right" label="匹配最佳" width="120" v-if="isShowEdit">
        <template #default="scope">
          <el-button type="primary" @click="searchStandrdFile(scope)">去匹配最佳</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-skeleton :rows="5" v-if="loading" />
  </div>
</template>

<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
import { ElNotification } from 'element-plus'
import * as dfd from "danfojs/dist/danfojs-browser/src"

let importTableData = reactive({ "tableData": [] })
let standardFileData = reactive({ "tableData": [] })
let showImportDataColumn = reactive({ "tableColumn": [] })
let itemKey = ref(false)
let loading = ref(false)
let dialogTableVisible = ref(false)
let resembleData = reactive({ "data": [] })
let originData = reactive({ "data": [] })
let allCatagotry = ref([])
let resembleDataWidth = reactive(["6%", "40%", "8%", "4%", "4%", "18%", "10%"])
let curChangeIndex = ref(0)
let isShowEdit = ref(false)

const exportData = (exportType) => {
  if (importTableData["tableData"].length == 0 || standardFileData["tableData"].length == 0) {
    fileTypeError("download_error", "经过究极检测，没有上传数据，不能匹配到完全不同的数据")
    return
  }
  if (exportType == "force") {
    let df = new dfd.DataFrame(importTableData["tableData"])
    dfd.toExcel(df, { fileName: "force_export_data.xlsx", download: true });
  } else {
    let i = 1
    let flag = 1
    for (let data of importTableData["tableData"]) {
      if (data["G.Unit"] == "") {
        flag = 0
        break
      }
      i++
    }
    if (flag == 1) {
      let df = new dfd.DataFrame(importTableData["tableData"])
      dfd.toExcel(df, { fileName: "force_export_data.xlsx", download: true });
    } else {
      let message = "经过究极检测，发现第" + i + "条数据的税还没填，加油"
      fileTypeError("download_error", message)
    }
  }
}

const tableRowClassName = (row, rowIndex) => {
  if (row.row["G.Unit"] != "" && row.row["G.Unit"] != "-") {
    return 'success-row'
  } else {
    return ""
  }
}

const bestData = (rowData) => {
  importTableData["tableData"][curChangeIndex]["G.Unit"] = rowData.row["G.Unit"]
}

const searchStandrdFile = (rowData) => {
  curChangeIndex = rowData.$index
  dialogTableVisible.value = true
  let temp_data = {
    "Description of goods": rowData.row["Description of goods"],
    "subdivision-unit/ subdivision": rowData.row["subdivision-unit/ subdivision"],
    "subdivision-lower bound": rowData.row["subdivision-lower bound"],
    "subdivision-upper bound": rowData.row["subdivision-upper bound"],
    "Category": rowData.row["Category"],
    "G.Unit": rowData.row["G.Unit"]
  }
  originData["data"] = [temp_data]
  let cur_category = rowData.row["Category"]
  let desOfGoods = rowData.row["Description of goods"]
  let temp = couData(cur_category, desOfGoods)
  resembleData["data"] = temp.slice(0, 6)
}


const couData = (cur_category, desOfGoods) => {
  //比较相似度
  let cur_category_standard = ""
  let max_sample = 0
  for (let catagotry of allCatagotry.value[0]) {
    let cur_sample = new difflib.SequenceMatcher(null, cur_category, catagotry)
    if (max_sample < cur_sample.ratio()) {
      cur_category_standard = catagotry
      max_sample = cur_sample.ratio()
    }
  }

  let temp = []
  if (max_sample > 0.31) {
    //获取当前分类的所有
    let curResembleData = standardFileData["tableData"].query(standardFileData["tableData"]["Category"].eq(cur_category_standard))

    //比较Name of Article与Description of goods
    curResembleData = curResembleData.addColumn("相似度", curResembleData["Name of Article"].apply((x) => {
      return new difflib.SequenceMatcher(null, x, desOfGoods).ratio()
    }))
    //排序
    curResembleData = curResembleData.sortValues("相似度", { ascending: false })

    //装成json渲染出来
    temp = dfd.toJSON(curResembleData, { "format": "records" })
  }


  return temp
}

const exportNotData = () => {
  let resData = []
  if (importTableData["tableData"].length == 0 || standardFileData["tableData"].length == 0) {
    fileTypeError("download_error", "经过究极检测，没有上传数据，不能匹配到完全不同的数据")
  }
  for (let each_data of importTableData["tableData"]) {
    const cur_category = each_data["Category"]
    const desOfGoods = each_data["Description of goods"]
    const data = couData(cur_category, desOfGoods)
    if (data.length == 0) {
      resData.push(each_data)
    }
  }
  if (resData.length != 0) {
    let df = new dfd.DataFrame(resData)
    dfd.toExcel(df, { fileName: "all_no_data.xlsx", download: true });
  } else {
    let message = "没有完全不同的数据"
    fileTypeError("no_data", message)
  }
}

const uploadImportFile = async (file) => {
  if (file.raw.type == "text/csv" || file.raw.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    let df
    if (file.raw.type == "text/csv") {
      loading.value = true
      df = await dfd.readCSV(file.raw)
    } else {
      df = await dfd.readExcel(file.raw)
    }
    importTableData["tableData"] = dfd.toJSON(df, { "format": "records" })
    for (let i in importTableData["tableData"]) {
      if (!("G.Unit" in importTableData["tableData"][i])) {
        importTableData["tableData"][i]["G.Unit"] = ""
      }
    }
    itemKey.value = !itemKey
    //动态显示所有数据
    isShowImportDataFunc()
    //动态显示编辑
    isShowEdit.value = true
    loading.value = false
  } else {
    fileTypeError("file_error", "")
  }
}

const standardFile = async (file) => {
  if (file.raw.type == "text/csv" || file.raw.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    let df
    if (file.raw.type == "text/csv") {
      loading = true
      df = await dfd.readCSV(file.raw)
    } else {
      df = await dfd.readExcel(file.raw)
    }
    standardFileData["tableData"] = df
    allCatagotry.value = dfd.toJSON(df["Category"].unique())
  } else {
    fileTypeError("file_error", "")
  }
}

const fileTypeError = (e, message) => {
  let title, type
  if (e == "file_error") {
    title = "Error"
    message = "不会吧，不会吧，这个上传的文件不是csv和excel?"
    type = "error"
  } else if (e == "download_error") {
    title = 'Error'
    message = message
    type = "error"
  } else if (e == "no_data") {
    title = 'Warning'
    message = message
    type = "warning"
  }
  ElNotification({
    title: title,
    message: message,
    type: type
  })
}

//显示数据
const isShowImportDataFunc = () => {
  showImportDataColumn["tableColumn"] = []
  for (let column in importTableData["tableData"][0]) {
    showImportDataColumn["tableColumn"].push({
      "prop": column,
      "label": column
    })
  }
}

const handleClick = () => {
  console.log('click')
}

const mockRequest = (file) => {
  console.log(file)
}

</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
}

.upload-file {
  display: flex;
  min-height: 200px;
}

.upload-import-file {
  flex-grow: 1;

}

.upload-standard {
  flex-basis: 200px;
}

.el-alert {
  margin: 20px 0 0;
}

.el-alert:first-child {
  margin: 0;
}

.example-showcase .el-loading-mask {
  z-index: 9;
}

.el-button--text {
  margin-right: 15px;
}

.el-select {
  width: 300px;
}

.el-input {
  width: 300px;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: green;
  color: white;
}

.success-row:hover {
  color: black;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>