<template>
  <div class="container mt-5" style="max-width: 400px">
    <div class="text-center mb-3">
      <h1 class="display-6 text-primary">多模态大模型推理基准测试系统</h1>
    </div>
    <h2 class="mb-4">用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label class="form-label">用户名</label>
        <input 
          v-model="form.username"
          type="text"
          class="form-control"
          required
        >
      </div>
      
      <div class="mb-3">
        <label class="form-label">密码</label>
        <input
          v-model="form.password"
          type="password"
          class="form-control"
          required
        >
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn btn-primary w-100">登录</button>
      
      <div class="mt-3 text-center">
        <router-link to="/register">没有账号？立即注册</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const errorMessage = ref('')

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/user/login', {
      user_name: form.value.username,
      password: form.value.password
    })

    if (response.data.code === 200) {
      localStorage.setItem('token', 'your-auth-token') // 实际使用response中的token
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.msg || '登录失败'
  }
}
</script>