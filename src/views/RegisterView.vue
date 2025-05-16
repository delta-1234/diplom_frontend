<template>
  <div class="container mt-5" style="max-width: 400px">
    <h2 class="mb-4">用户注册</h2>
    <form @submit.prevent="handleRegister">
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
        <label class="form-label">邮箱</label>
        <input
          v-model="form.email"
          type="email"
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

      <button type="submit" class="btn btn-primary w-100">注册</button>
      
      <div class="mt-3 text-center">
        <router-link to="/login">已有账号？立即登录</router-link>
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
  email: '',
  password: ''
})

const handleRegister = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/user/register', {
      user_name: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    if (response.data.code === 200) {
      router.push('/login')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.msg || '注册失败'
  }
}
</script>