<script setup>
import { usePlayerStore } from '../stores/player'
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { logoutGM } from '../plugins/gmAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const playerStore = usePlayerStore()
const message = useMessage()

// Chỉnh sửa thuộc tính cơ bản
const baseAttributes = ref({
  name: playerStore.name,
  level: playerStore.level,
  realm: playerStore.realm,
  cultivation: playerStore.cultivation,
  maxCultivation: playerStore.maxCultivation,
  spirit: playerStore.spirit,
  spiritRate: playerStore.spiritRate,
  luck: playerStore.luck,
  cultivationRate: playerStore.cultivationRate,
  herbRate: playerStore.herbRate,
  alchemyRate: playerStore.alchemyRate,
  spiritStones: playerStore.spiritStones,
  petEssence: playerStore.petEssence
})

// Cập nhật thuộc tính tu luyện giả
const updateAttributes = () => {
  try {
    // Cập nhật thuộc tính cơ bản
    Object.entries(baseAttributes.value).forEach(([key, value]) => {
      if (typeof value === 'number') {
        playerStore[key] = Number(value)
      } else {
        playerStore[key] = value
      }
    })
    // Lưu dữ liệu
    playerStore.saveData()
    message.success('Cập nhật thuộc tính thành công')
  } catch (error) {
    message.error('Cập nhật thất bại: ' + error.message)
  }
}

// Khôi phục dữ liệu tu luyện giả
const resetPlayerData = async () => {
  try {
    playerStore.$reset()
    await playerStore.initializePlayer()
    message.success('Khôi phục dữ liệu thành công')
    // Làm mới dữ liệu hiển thị
    Object.entries(playerStore).forEach(([key, value]) => {
      if (key in baseAttributes.value) {
        baseAttributes.value[key] = value
      }
    })
  } catch (error) {
    message.error('Khôi phục thất bại: ' + error.message)
  }
}

// Đăng xuất GM
const handleLogout = () => {
  logoutGM()
  playerStore.isGMMode = false
  message.success('Đã đăng xuất khỏi chế độ quản trị')
  router.push('/cultivation')
}
</script>
<template>
  <n-layout>
    <n-layout-header bordered>
      <n-space justify="end" style="padding: 10px">
        <n-button type="error" @click="handleLogout">Đăng xuất GM</n-button>
      </n-space>
    </n-layout-header>
    <n-layout-content class="gm-content">
      <n-card title="Chỉnh Sửa Thuộc Tính Căn Bản">
        <n-form>
          <n-form-item label="Đạo Hiệu">
            <n-input v-model:value="baseAttributes.name" />
          </n-form-item>
          <n-form-item label="Cấp Độ Cảnh Giới">
            <n-input-number v-model:value="baseAttributes.level" />
          </n-form-item>
          <n-form-item label="Tên Cảnh Giới">
            <n-input v-model:value="baseAttributes.realm" />
          </n-form-item>
          <n-form-item label="Tu Vi Hiện Tại">
            <n-input-number v-model:value="baseAttributes.cultivation" />
          </n-form-item>
          <n-form-item label="Tu Vi Tối Đa">
            <n-input-number v-model:value="baseAttributes.maxCultivation" />
          </n-form-item>
          <n-form-item label="Linh Lực">
            <n-input-number v-model:value="baseAttributes.spirit" />
          </n-form-item>
          <n-form-item label="Tỷ Lệ Thu Hoạch Linh Lực">
            <n-input-number v-model:value="baseAttributes.spiritRate" />
          </n-form-item>
          <n-form-item label="Vận May">
            <n-input-number v-model:value="baseAttributes.luck" />
          </n-form-item>
          <n-form-item label="Tốc Độ Tu Luyện">
            <n-input-number v-model:value="baseAttributes.cultivationRate" />
          </n-form-item>
          <n-form-item label="Tỷ Lệ Thu Hoạch Linh Thảo">
            <n-input-number v-model:value="baseAttributes.herbRate" />
          </n-form-item>
          <n-form-item label="Tăng Tỷ Lệ Thành Công Luyện Đan">
            <n-input-number v-model:value="baseAttributes.alchemyRate" />
          </n-form-item>
          <n-form-item label="Linh Thạch">
            <n-input-number v-model:value="baseAttributes.spiritStones" />
          </n-form-item>
          <n-form-item label="Tinh Hoa Linh Thú">
            <n-input-number v-model:value="baseAttributes.petEssence" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button type="info" @click="resetPlayerData">Khôi Phục Dữ Liệu</n-button>
            <n-button type="primary" @click="updateAttributes">Lưu Thay Đổi</n-button>
          </n-space>
        </template>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.gm-content {
  padding: 20px;
}
</style>