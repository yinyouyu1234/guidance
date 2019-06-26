export const optionsStatus = [
  {
    label: '启用',
    value: 1
  },
  {
    label: '停用',
    value: 0
  }
]

export const rules = {
  customer_name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  equipment_type_id: [
    { required: true, message: '请输入选择设备类型', trigger: 'blur' }
  ],
  kks: [{ required: true, message: '请输入KKS码', trigger: 'blur' }],
  equipment_name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
  assembly_code: [{ required: true, message: '请输入总成号', trigger: 'blur' }],
  map_code: [{ required: true, message: '请输入图号', trigger: 'blur' }],
  model_code: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  product_code: [{ required: true, message: '请产品编号', trigger: 'blur' }]

}

export const columnData = [
  {
    prop: 'index',
    width: 70,
    label: '编号'
  },
  {
    prop: 'kks',
    label: 'KKS'
  },
  {
    prop: 'equipment_name',
    label: '名称'
  },
  {
    prop: 'equipment_type_name',
    label: '设备类型'
  },
  {
    prop: 'gps',
    label: 'GPS'
  },
  // {
  //   prop: 'running_name',
  //   label: '运行状态'
  // },
  {
    prop: 'status',
    label: '状态'
  },
  {
    prop: 'remark',
    label: '备注'
  }
]

export const options = [
  {
    value: '',
    label: '全部'
  },
  {
    value: '1',
    label: '启用'
  },
  {
    value: '0',
    label: '禁用'
  }
]
