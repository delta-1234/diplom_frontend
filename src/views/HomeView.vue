<template>
  <div class="metrics-container">
    <h1>多模态大模型推理基准测试系统</h1>

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
    <div v-show="flag" style="display: flex;">
      <div ref="radarChart" style="width: 800px; height: 600px;"></div>
      <div v-show="flag" ref="barChart" style="width: 800px; height: 600px;"></div>
      

    </div>
    <div>
        <p style="font-size: 18px; font-weight: bold;">评分: {{ score }}</p>
        <p style="font-size: 16px; color: gray;">建议: {{ suggestion }}</p>
      </div>

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
      flag: false,
      score: '',
      suggestion: '',
      data: [
        {
          name: '方案A',
          values: {}
        },
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
        Offline: ['模型名称', '硬件参数', '精准度 (%)', '每秒样本数', '每秒token数'],
        Server: ['模型名称', '硬件参数', '精准度 (%)', '每秒样本数', '每秒token数', '首个令牌时间(ns)'],
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
      axios.get('http://127.0.0.1:8000/api/get_hardware_all')
        .then(response => {
          this.hardwareTable = response.data;
        })
        .catch(error => {
          console.error('获取数据失败:', error);
        });
      axios.get('http://127.0.0.1:8000/api/get_model_all')
        .then(response => {
          this.modelTable = response.data;
        })
      axios.get('http://127.0.0.1:8000/api/get_mode_all')
        .then(response => {
          this.modeTable = response.data;
        })
    },
    initChart() {
      const chart = echarts.init(this.$refs.radarChart);
      // Combine all data for radar chart comparison
      const modeIndicators = {
        Offline: [
          { name: '精准度 (%)', max: 100 },
          { name: '每秒样本数', max: 3 },
          { name: '每秒token数', max: 1000 }
        ],
        Server: [
          { name: '精准度 (%)', max: 100 },
          { name: '每秒样本数', max: 3 },
          { name: '每秒token数', max: 1000 },
          { name: '首个令牌时间(ns)', max: 10000000000 }
        ],
        SingleStream: [
          { name: '精准度 (%)', max: 100 },
          { name: '90百分位延迟(ns)', max: 25000000000 }
        ],
        MultiStream: [
          { name: '精准度 (%)', max: 100 },
          { name: '90百分位延迟(ns)', max: 25000000000 },
          { name: '流的数量', max: 40 }
        ]
      };

      const allIndicators = [
        ...(modeIndicators[this.selectedMode] || []),
        { name: '平均视觉处理时间 (ns)', max: 100000000 },
        { name: '平均模态对齐时间 (ns)', max: 100000000 },
        { name: '平均文本生成时间 (ns)', max: 1500000000 },
        { name: '平均利用率 (%)', max: 100 },
        { name: '平均显存占用 (MB)', max: 100000 },
        { name: '每查询的能耗 (J)', max: 500 },
      ];
      const translateKeys = {
        '精准度 (%)': 'accuracy',
        '每秒样本数': 'samples_per_second',
        '每秒token数': 'tokens_per_second',
        '首个令牌时间(ns)': 'avg_first_token_latency',
        '90百分位延迟(ns)': 'ninety_percent_latency',
        '流的数量': 'stream_num',
        '平均视觉处理时间 (ns)': 'avg_vision_tim',
        '平均模态对齐时间 (ns)': 'avg_align_time',
        '平均文本生成时间 (ns)': 'avg_text_gen_time',
        '平均利用率 (%)': 'avg_utilization',
        '平均显存占用 (MB)': 'avg_memory',
        '每查询的能耗 (J)': 'energy_per_query'
      };

      const translatedValues = (values) => {
        const translated = {};
        for (const [key, value] of Object.entries(values)) {
          const translatedKey = Object.keys(translateKeys).find(k => translateKeys[k] === key);
          if (translatedKey) {
            translated[translatedKey] = value;
          }
        }
        return translated;
      };


      const reverseTimeValues = (values) => {
        const reversedValues = { ...values };
        // if ('首个令牌时间(ns)' in reversedValues) {
        //   reversedValues['首个令牌时间(ns)'] = allIndicators.find(ind => ind.name === '首个令牌时间(ns)').max - reversedValues['首个令牌时间(ns)'];
        // }
        // if ('90百分位延迟(ns)' in reversedValues) {
        //   reversedValues['90百分位延迟(ns)'] = allIndicators.find(ind => ind.name === '90百分位延迟(ns)').max - reversedValues['90百分位延迟(ns)'];
        // }
        // if ('平均视觉处理时间 (ns)' in reversedValues) {
        //   reversedValues['平均视觉处理时间 (ns)'] = allIndicators.find(ind => ind.name === '平均视觉处理时间 (ns)').max - reversedValues['平均视觉处理时间 (ns)'];
        // }
        // if ('平均模态对齐时间 (ns)' in reversedValues) {
        //   reversedValues['平均模态对齐时间 (ns)'] = allIndicators.find(ind => ind.name === '平均模态对齐时间 (ns)').max - reversedValues['平均模态对齐时间 (ns)'];
        // }
        // if ('平均文本生成时间 (ns)' in reversedValues) {
        //   reversedValues['平均文本生成时间 (ns)'] = allIndicators.find(ind => ind.name === '平均文本生成时间 (ns)').max - reversedValues['平均文本生成时间 (ns)'];
        // }
        // if ('每秒token数' in reversedValues && reversedValues['每秒token数'] <= 100) {
        //   reversedValues['每秒token数'] = reversedValues['每秒token数']*50;
        // }
        return reversedValues;
      };
      const option = {
        title: { text: '性能对比雷达图' },
        legend: {
          data: this.data.map(d => d.name),
          bottom: 0,       // 距离容器底部 0 像素
          left: 'center',  // 水平居中
          type: 'scroll'   // 如果图例项过多，自动启用滚动（可选）
        },
        radar: {
          indicator: allIndicators,
          shape: 'circle',
          axisName: {
            color: '#666'
          }
        },
        series: [{
          type: 'radar',
          data: this.data.map(item => ({
            value: Object.values(reverseTimeValues(translatedValues(item.values))),
            name: item.name
          })),
          areaStyle: {
            opacity: 0.2
          }
        }],
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const data = params.data.value;
            const indicators = allIndicators.map(indicator => indicator.name);
            let tooltipContent = `<strong>${params.name}</strong><br>`;
            indicators.forEach((indicator, index) => {
              tooltipContent += `${indicator}: ${data[index]}<br>`;
            });
            return tooltipContent;
          }
        }

      };
      chart.setOption(option);
      console.log(allIndicators.map(ind => ind.name))
      const barChart = echarts.init(this.$refs.barChart);
      const barOption = {
        title: { text: '性能对比比例图' },
        xAxis: {
          type: 'category',
          data: allIndicators.map(ind => ind.name),
          axisLabel: { interval: 0, rotate: 30 }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.data[0].values && this.data[1].values
              ? Object.keys(this.data[0].values).map(key => {
                const translatedKey = Object.keys(translateKeys).find(k => translateKeys[k] === key);
                const isTimeMetric = ['首个令牌时间(ns)', '90百分位延迟(ns)', '平均视觉处理时间 (ns)', '平均模态对齐时间 (ns)', '平均文本生成时间 (ns)'].includes(translatedKey);
                const ratio = this.data[1].values[key] !== 0
                  ? isTimeMetric
                    ? this.data[1].values[key] / this.data[0].values[key]
                    : this.data[0].values[key] / this.data[1].values[key]
                  : 0;
                return {
                  value: ratio,
                  itemStyle: {
                    color: ratio > 1 ? 'green' : 'red'
                  }
                };
              })
              : [],
            type: 'bar'
          }
        ]
      };
      barChart.setOption(barOption);

    },
    async triggerEvent() {
      const selectedEntry = this.modeTable[this.selectedMode]?.find(item =>
        item.hardware_name === this.selectedHardware && item.model_name === this.selectedModel
      );
      if (selectedEntry) {
        this.id = selectedEntry.id;
        this.flag = true;
      } else {
        console.log('No matching entry found for the selected combination.');
        this.flag = false;
      }
      const selectedModeData = this.modeTable[this.selectedMode]?.find(item =>
        item.hardware_name === this.selectedHardware && item.model_name === this.selectedModel
      );
      const selectedModelData = this.modelTable[this.selectedMode]?.find(item =>
        item.hardware_name === this.selectedHardware && item.model_name === this.selectedModel
      );
      const selectedHardwareData = this.hardwareTable[this.selectedMode]?.find(item =>
        item.hardware_name === this.selectedHardware && item.model_name === this.selectedModel
      );
      if (selectedModeData || selectedModelData || selectedHardwareData) {
      } else {
        console.log('No matching data found for the selected combination.');
      }
      // console.log('Selected Mode Data:', selectedModeData);
      const mergedData = {
        ...Object.fromEntries(Object.entries(selectedModeData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key))),
        ...Object.fromEntries(Object.entries(selectedModelData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key))),
        ...Object.fromEntries(Object.entries(selectedHardwareData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key)))
      };
      // console.log('Merged Data:', mergedData);
      this.data = [{
        name: `${this.selectedModel} + ${this.selectedHardware}`,
        values: mergedData
      }];
      await axios.post('http://127.0.0.1:8000/api/get_baseline_id', {
        "model_name": this.selectedModel,
        "test_mode": this.selectedMode
      })
        .then(response => {
          // 处理响应数据
          this.base_id = response.data.baseline_id;
          console.log('Base ID:', this.base_id);
          // Find three matching data entries based on the base_id
          const matchingModeData = this.modeTable[this.selectedMode]?.find(item => item.id === this.base_id);
          const matchingModelData = this.modelTable[this.selectedMode]?.find(item => item.id === this.base_id);
          const matchingHardwareData = this.hardwareTable[this.selectedMode]?.find(item => item.id === this.base_id);
          // console.log('Matching Mode Data:', matchingModeData);
          // Combine the matching data into the `data` array with one name and others in values
          this.data = [
            {
              name: `${this.selectedModel} + ${this.selectedHardware}`,
              values: mergedData
            },
            {
              name: 'Baseline',
              values: {
                ...Object.fromEntries(Object.entries(matchingModeData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key))),
                ...Object.fromEntries(Object.entries(matchingModelData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key))),
                ...Object.fromEntries(Object.entries(matchingHardwareData || {}).filter(([key]) => !['id', 'model_name', 'hardware_name'].includes(key)))
              }
            }
          ];
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      await axios.post('http://127.0.0.1:8000/api/get_score_suggestion', {
        "test_result": this.id,
      })
        .then(response => {
          // 处理响应数据
          this.score = response.data.score;
          this.suggestion = response.data.suggestion;
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      this.$nextTick(() => {
        this.initChart();
      });
    },
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    selectedHardware(newHardware) {
      if (newHardware !== '全部' && this.selectedModel !== '全部') {
        this.triggerEvent();
      }
      else {
        this.flag = false;
      }
    },
    selectedModel(newModel) {
      if (newModel !== '全部' && this.selectedHardware !== '全部') {
        this.triggerEvent();
      }
      else {
        this.flag = false;
      }
    },
    selectedMode(newMode) {
      if (this.newHardware !== '全部' && this.selectedModel !== '全部') {
        this.triggerEvent();
      }
      else {
        this.flag = false;
      }
    }
  }

};
</script>

<style scoped>
.metrics-container {
  max-width: 1400px;
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