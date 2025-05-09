<template>
  <div class="metrics-container">
    <h1>多模态大模型基准测试系统</h1>

    <!-- 模式选择 -->
    <div class="mode-selector">
      <label>测试模式：</label>
      <select v-model="selectedMode" @change="updateCharts">
        <option v-for="mode in modes" :key="mode" :value="mode">{{ mode }}</option>
      </select>
    </div>

    <!-- 动态表格 -->
    <div class="dynamic-table">
      <h2>{{ selectedMode }} 模式性能指标</h2>
      <table>
        <thead>
          <tr>
            <th v-for="header in currentTableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in currentTableData" :key="index">
            <td v-for="(value, key) in item" :key="key">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 图表容器保持不变 -->
    <div class="chart-row">
      <!-- 原有图表布局... -->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'BenchmarkMetrics',
  data() {
    return {
      selectedMode: 'Offline',
      modes: ['Offline', 'Server', 'SingleStream', 'MultiStream'],
      
      // 表格数据结构
      tableConfig: {
        Offline: {
          headers: ['模型名称', '吞吐量 (req/s)', '延迟 (ms)', 'CPU使用率 (%)'],
          data: [
            { model: 'ResNet-50', throughput: 1200, latency: 150, cpu: 75 },
            { model: 'ViT-Large', throughput: 980, latency: 210, cpu: 82 }
          ]
        },
        Server: {
          headers: ['模型名称', '并发连接数', 'QPS', '内存占用 (GB)'],
          data: [
            { model: 'BERT-Server', connections: 500, qps: 120, memory: 8.2 },
            { model: 'GPT-3-Serving', connections: 800, qps: 95, memory: 11.5 }
          ]
        },
        SingleStream: {
          headers: ['模型名称', '处理时间 (ms)', '视频帧率 (FPS)', '文本准确率 (%)'],
          data: [
            { model: 'CLIP-Video', time: 450, fps: 30, accuracy: 98.2 },
            { model: 'Whisper-Audio', time: 380, fps: 44, accuracy: 97.5 }
          ]
        },
        MultiStream: {
          headers: ['模型名称', '并行任务数', '吞吐量 (req/s)', 'GPU利用率 (%)'],
          data: [
            { model: 'Multi-Modal-8', streams: 8, throughput: 650, gpu: 85 },
            { model: 'Cross-Modal-12', streams: 12, throughput: 920, gpu: 92 }
          ]
        }
      },

      // 原有图表数据保持不变...
    };
  },
  computed: {
    currentTableHeaders() {
      return this.tableConfig[this.selectedMode].headers;
    },
    currentTableData() {
      return this.tableConfig[this.selectedMode].data;
    }
  },
  methods: {
    updateCharts() {
      // 这里可以添加根据模式更新图表的逻辑
      console.log('当前模式:', this.selectedMode);
      
      // 示例：更新第一个图表
      const chart = echarts.init(this.$refs.throughputLatencyChart);
      chart.setOption(this.getUpdatedChartOptions());
    },
    
    getUpdatedChartOptions() {
      // 根据模式返回不同的图表配置
      const baseOption = {
        title: { text: '性能指标' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category' },
        yAxis: { type: 'value' }
      };

      switch(this.selectedMode) {
        case 'Offline':
          return {
            ...baseOption,
            legend: { data: ['吞吐量', '延迟'] },
            series: [
              { data: this.throughputData },
              { data: this.latencyData }
            ]
          };
        case 'Server':
          return {
            ...baseOption,
            legend: { data: ['QPS', '连接数'] },
            series: [
              { data: [120, 95] },
              { data: [500, 800] }
            ]
          };
        // 其他模式配置...
      }
    }
  },
  mounted() {
    this.initCharts();
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>