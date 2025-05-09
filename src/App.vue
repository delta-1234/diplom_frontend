<template>
  <div class="metrics-container">
    <h1>多模态大模型基准测试系统</h1>

    <div class="mode-selector">
      <div>
        <label>测试模式：</label>
        <select v-model="selectedMode" @change="updateCharts">
          <option v-for="mode in modes" :key="mode" :value="mode">{{ mode }}</option>
        </select>
      </div>

      <div>
        <label>模型名称：</label>
        <select v-model="selectedModel" @change="updateCharts">
          <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
        </select>
      </div>
      <div>
        <label>硬件参数：</label>
        <select v-model="selectedHardware" @change="updateCharts">
          <option v-for="hardware in hardwares" :key="hardware" :value="hardware">{{ hardware }}</option>
        </select>
      </div>
    </div>
    <!-- 模式选择 -->



    <!-- 动态表格 -->
    <div class="dynamic-table" ref="modeTable">
      <h2>{{ selectedMode }} 模式性能指标</h2>
      <table>
        <thead>
          <tr>
            <th v-for="header in modeTableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in modeTableData" :key="index">
            <td v-for="(value, key) in item" :key="key">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="dynamic-table">
      <h2>模型性能指标</h2>
      <table>
        <thead>
          <tr>
            <th v-for="header in modelHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in modelTableData" :key="index">
            <td v-for="(value, key) in item" :key="key">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="dynamic-table">
      <h2>硬件性能指标</h2>
      <table>
        <thead>
          <tr>
            <th v-for="header in hardwareHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in hardwareTableData" :key="index">
            <td v-for="(value, key) in item" :key="key">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div ref="radarChart" style="width: 600px; height: 400px;"></div>

    <!-- 图表容器保持不变 -->
    <div class="chart-row">
      <!-- 原有图表布局... -->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios, { Axios } from 'axios';
export default {
  name: 'BenchmarkMetrics',
  data() {
    return {
      data: [
        {
          name: '方案A',
          values: {
            time: 2.5,   // 时间（秒），越小越好
            samples: 800 // 样本数，越大越好
          }
        },
        {
          name: '方案B',
          values: {
            time: 3.8,
            samples: 1200
          }
        }
      ],
      id: '',
      base_id: '',
      selectedMode: 'Offline',
      selectedHardware: '全部',
      selectedModel: '全部',
      modes: ['Offline', 'Server', 'SingleStream', 'MultiStream'],
      hardwares: ['全部', 'NVIDIA GeForce RTX 3090', 'NVIDIA A800 80GB PCIe'],
      models: ['全部', 'llava-v1.5-7b', 'llava-1.5-7b-hf', 'llava-1.5-13b-hf'],
      modeHeaders: {
        Offline: ['模型名称', '硬件参数', '精准度 (%)', '每秒处理的样本数', '每秒处理的token数'],
        Server: ['模型名称', '硬件参数', '精准度 (%)', '每秒处理的样本数', '每秒处理的token数', '首次令牌时间(ns)'],
        SingleStream: ['模型名称', '硬件参数', '精准度 (%)', '90百分位延迟(ns)'],
        MultiStream: ['模型名称', '硬件参数', '精准度 (%)', '90百分位延迟(ns)', '流的数量']
      },
      modelHeaders: ['模型名称', '硬件参数', '平均视觉处理时间 (ns)', '平均模态对齐时间 (ns)', '平均文本生成时间 (ns)'],
      hardwareHeaders: ['模型名称', '硬件参数', '平均利用率 (%)', '平均显存占用 (MB)', '每查询的能耗 (J)'],
      modeTable: {
        "Offline": [
          {
            "id": 1,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "accuracy": 54.91,
            "samples_per_second": 1.49669,
            "tokens_per_second": 510.862
          },
          {
            "id": 5,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "samples_per_second": 0.849646,
            "tokens_per_second": 290
          },
          {
            "id": 9,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "samples_per_second": 1.43487,
            "tokens_per_second": 483.888
          }
        ],
        "Server": [
          {
            "id": 2,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "accuracy": 54.91,
            "samples_per_second": 0.3,
            "tokens_per_second": 11.6,
            "avg_first_token_latency": 7850259876
          },
          {
            "id": 6,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "samples_per_second": 1,
            "tokens_per_second": 18.41,
            "avg_first_token_latency": 8314285135
          },
          {
            "id": 10,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "samples_per_second": 1,
            "tokens_per_second": 9.97,
            "avg_first_token_latency": 551397255
          }
        ],
        "SingleStream": [
          {
            "id": 3,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "accuracy": 54.91,
            "ninety_percent_latency": 1506076541
          },
          {
            "id": 7,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "ninety_percent_latency": 1398916789
          },
          {
            "id": 11,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "ninety_percent_latency": 845965286
          }
        ],
        "MultiStream": [
          {
            "id": 4,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "accuracy": 54.91,
            "ninety_percent_latency": 7209950408,
            "stream_num": 8
          },
          {
            "id": 8,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "ninety_percent_latency": 21458588336,
            "stream_num": 32
          },
          {
            "id": 12,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "accuracy": 64.91,
            "ninety_percent_latency": 11990504217,
            "stream_num": 32
          }
        ]
      },
      modelTable: {
        Offline: [
          {
            "id": 1,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "avg_vision_tim": 21118459.04,
            "avg_align_time": 20267100.86,
            "avg_text_gen_time": 559229313.61
          },
          {
            "id": 5,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_vision_tim": 15024164.9,
            "avg_align_time": 14162721.29,
            "avg_text_gen_time": 643391775.39
          },
          {
            "id": 9,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_vision_tim": 11816056.88,
            "avg_align_time": 11110528.34,
            "avg_text_gen_time": 623770157.37
          }
        ],
        Server: [
          {
            "id": 2,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "avg_vision_tim": 21118459.04,
            "avg_align_time": 20267100.86,
            "avg_text_gen_time": 559229313.61
          },
          {
            "id": 6,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_vision_tim": 15024164.9,
            "avg_align_time": 14162721.29,
            "avg_text_gen_time": 643391775.39
          },
          {
            "id": 10,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_vision_tim": 11816056.88,
            "avg_align_time": 11110528.34,
            "avg_text_gen_time": 623770157.37
          }
        ],
      },
      hardwareTable: {
        Offline: [
          {
            id: 1,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA GeForce RTX 3090",
            "avg_utilization": 87.1,
            "avg_memory": 24419,
            "energy_per_query": 49.499394583333334
          },
          {
            id: 5,
            "model_name": "llava-1.5-13b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_utilization": 94.8,
            "avg_memory": 81130,
            "energy_per_query": 84.67920583333333
          },
          {
            id: 9,
            "model_name": "llava-1.5-7b-hf",
            "hardware_name": "NVIDIA A800 80GB PCIe",
            "avg_utilization": 91.4,
            "avg_memory": 75685,
            "energy_per_query": 41.17389625
          }
        ],

      },


      // 原有图表数据保持不变...
    };
  },
  computed: {
    modeTableHeaders() {
      return this.modeHeaders[this.selectedMode];
    },
    modeTableData() {
      return (this.modeTable[this.selectedMode] ?? [])
        .filter(item =>
          (this.selectedHardware === '全部' || item.hardware_name === this.selectedHardware) &&
          (this.selectedModel === '全部' || item.model_name === this.selectedModel)
        )
        .map(({ id, ...rest }) => rest);
    },
    // 模型表格
    modelTableData() {
      return (this.modelTable[this.selectedMode] ?? [])
        .filter(item =>
          (this.selectedHardware === '全部' || item.hardware_name === this.selectedHardware) &&
          (this.selectedModel === '全部' || item.model_name === this.selectedModel)
        )
        .map(({ id, ...rest }) => rest);
    },
    // 硬件表格
    hardwareTableData() {
      return (this.hardwareTable[this.selectedMode] ?? [])
        .filter(item =>
          (this.selectedHardware === '全部' || item.hardware_name === this.selectedHardware) &&
          (this.selectedModel === '全部' || item.model_name === this.selectedModel)
        )
        .map(({ id, ...rest }) => rest);
    }
  },
  methods: {
    fetchData() {
      // 这里可以添加从后端获取数据的逻辑
      axios.get('/api/metrics')
        .then(response => {
          // 假设返回的数据结构与 modeTableHeaders 相同
          this.modeTable = response.data.modeTable;
          this.modelTable = response.data.modelTable;
          this.hardwareTable = response.data.hardwareTable;
        })
        .catch(error => {
          console.error('获取数据失败:', error);
        });
      axios.get('/api/metrics')
        .then(response => {
          // 假设返回的数据结构与 modeTableHeaders 相同
          this.modeTable = response.data.modeTable;
          this.modelTable = response.data.modelTable;
          this.hardwareTable = response.data.hardwareTable;
        })
      axios.get('/api/metrics')
        .then(response => {
          // 假设返回的数据结构与 modeTableHeaders 相同
          this.modeTable = response.data.modeTable;
          this.modelTable = response.data.modelTable;
          this.hardwareTable = response.data.hardwareTable;
        })
    },
    fetchBase() {
      axios.post('/api/metrics', {
        id: this.id,
        base_id: this.base_id
      })
        .then(response => {
          // 处理响应数据
          console.log(response.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    },
    initChart() {
      const chart = echarts.init(this.$refs.radarChart);

      // 对时间指标进行逆向处理
      const maxTime = Math.max(...this.data.map(d => d.values.time)) * 1.2;

      const option = {
        title: { text: '性能对比雷达图' },
        legend: {
          data: this.data.map(d => d.name)
        },
        radar: {
          indicator: [
            {
              name: '处理时间',
              max: maxTime,
              // 逆向显示轴标签
              axisLabel: {
                formatter: value => (maxTime - value).toFixed(1) + 's'
              }
            },
            { name: '样本容量', max: 1500 } // 样本数保持正向
          ],
          shape: 'circle',
          axisName: {
            color: '#666'
          }
        },
        series: [{
          type: 'radar',
          data: this.data.map(item => ({
            value: [
              maxTime - item.values.time, // 时间逆向计算
              item.values.samples         // 样本数保持原值
            ],
            name: item.name
          })),
          areaStyle: {
            opacity: 0.2
          }
        }],
        tooltip: {
          formatter: params => {
            const rawData = this.data.find(d => d.name === params.name);
            return `
              ${params.name}<br/>
              处理时间: ${rawData.values.time.toFixed(1)}s<br/>
              样本容量: ${rawData.values.samples}
            `;
          }
        }
      };

      chart.setOption(option);
    }
  },
  mounted() {
    // this.initCharts();
    // this.fetchData();
    this.initChart();
  },
  watch: {
    selectedHardware(newHardware) {
      if (newHardware !== '全部' && this.selectedModel !== '全部') {
        this.triggerEvent();
      }
    },
    selectedModel(newModel) {
      if (newModel !== '全部' && this.selectedHardware !== '全部') {
        this.triggerEvent();
      }
    }
  }

};
</script>

<style scoped>
.metrics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.mode-selector {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

select {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.dynamic-table {
  margin: 2rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

tr:hover {
  background-color: #f8f9fa;
}

.chart-row {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.chart {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>