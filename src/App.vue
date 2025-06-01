<template>
  <!-- 应用根容器 -->
  <div id="app">
    <!-- 全局导航栏 -->
    <nav v-if="showNav" class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">我的测试结果</router-link>
        
        <!-- 移动端汉堡菜单 -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 导航链接 -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <!-- <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/">首页</router-link>
            </li> -->
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/login">登录</router-link>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/register">注册</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <a class="nav-link" href="#" @click.prevent="logout">退出</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="container mt-4">
      <router-view/>
    </main>

    <!-- 全局页脚（可选） -->
    <footer v-if="showFooter" class="bg-light mt-5 py-4">
      <div class="container text-center">
        <span class="text-muted">© 2023 我的应用</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 计算认证状态
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// 控制导航栏显示的逻辑（例如登录页不显示导航）
const showNav = computed(() => {
  return !['login', 'register'].includes(route.name)
})

// 控制页脚显示
const showFooter = computed(() => {
  return route.name !== 'login' && route.name !== 'register'
})

// 退出登录逻辑
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

main.container.mt-4 {
  max-width: 1600px;
  margin: auto;
}

/* 全局链接样式 */
a {
  text-decoration: none;
}

/* 路由过渡动画（可选） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>