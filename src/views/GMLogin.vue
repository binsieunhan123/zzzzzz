<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { loginGM } from '../plugins/gmAuth'

const router = useRouter()
const playerStore = usePlayerStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = () => {
  loading.value = true
  errorMessage.value = ''
  
  if (!username.value || !password.value) {
    errorMessage.value = 'Vui lòng nhập tên đăng nhập và mật khẩu'
    loading.value = false
    return
  }
  
  // Đăng nhập GM
  const success = loginGM(username.value, password.value)
  
  if (success) {
    // Cập nhật trạng thái GM trong store
    playerStore.isGMMode = true
    // Chuyển hướng đến trang GM
    router.push('/gm')
  } else {
    errorMessage.value = 'Tên đăng nhập hoặc mật khẩu không đúng'
  }
  
  loading.value = false
}
</script>

<template>
  <n-card title="Đăng nhập quản trị" style="max-width: 500px; margin: 50px auto;">
    <n-form @submit.prevent="handleLogin">
      <n-form-item label="Tên đăng nhập">
        <n-input v-model:value="username" placeholder="Nhập tên đăng nhập" />
      </n-form-item>
      
      <n-form-item label="Mật khẩu">
        <n-input
          v-model:value="password"
          type="password"
          placeholder="Nhập mật khẩu"
          show-password-on="click"
        />
      </n-form-item>
      
      <n-alert v-if="errorMessage" type="error" style="margin-bottom: 16px">
        {{ errorMessage }}
      </n-alert>
      
      <n-space justify="end">
        <n-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
        >
          Đăng nhập
        </n-button>
        
        <n-button @click="router.push('/cultivation')">
          Quay lại
        </n-button>
      </n-space>
    </n-form>
  </n-card>
</template> 