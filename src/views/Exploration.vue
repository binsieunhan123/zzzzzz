<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import { CompassOutline } from '@vicons/ionicons5'
import { getRealmName } from '../plugins/realm'
import { locations } from '../plugins/locations'
import { triggerRandomEvent, getRandomReward, handleReward } from '../plugins/events'
import LogPanel from '../components/LogPanel.vue'

const logRef = ref(null)
const playerStore = usePlayerStore()
// Các giá trị liên quan đến khám phá
const explorationInterval = 3000  // Khoảng thời gian khám phá (mili giây)
const exploringLocations = ref({})  // Ghi lại trạng thái khám phá của từng địa điểm
const explorationTimers = ref({})  // Ghi lại bộ hẹn giờ cho từng địa điểm
const isAutoExploring = ref(false)  // Có đang tự động khám phá không
const autoExploringLocationId = ref(null)  // ID của địa điểm đang tự động khám phá
const explorationWorker = ref(null)

// Khởi tạo Web Worker
const initWorker = () => {
  explorationWorker.value = new Worker(new URL('../workers/exploration.js', import.meta.url), { type: 'module' })
  explorationWorker.value.onmessage = ({ data }) => {
    if (data.type === 'exploration_result') {
      handleExplorationResult(data)
    } else if (data.type === 'error') {
      showMessage('error', data.message)
    }
  }
}

// Xử lý kết quả khám phá
const handleExplorationResult = (result) => {
  playerStore.spirit -= result.spiritCost
  playerStore.explorationCount++

  if (result.eventTriggered) {
    if (triggerRandomEvent(playerStore, showMessage)) {
      showMessage('info', 'Phúc duyên của ngươi không tệ, đã kích hoạt một sự kiện đặc biệt!')
    }
  } else {
    const location = availableLocations.value.find(loc => loc.spiritCost === result.spiritCost)
    if (location && Array.isArray(location.rewards)) {
      const reward = getRandomReward(location.rewards)
      if (reward) {
        if (result.rewardMultiplier > 1) {
          reward.amount = Math.floor(reward.amount * result.rewardMultiplier)
          showMessage('success', 'Phúc duyên gia trì, nhận được nhiều phần thưởng hơn!')
        }
        handleReward(reward, playerStore, showMessage)
      }
    } else {
      showMessage('error', 'Không thể nhận phần thưởng khám phá, vui lòng kiểm tra cấu hình địa điểm')
    }
  }
  playerStore.saveData()
}

// Khám phá địa điểm chỉ định
const exploreLocation = (location) => {
  if (playerStore.spirit < location.spiritCost) {
    showMessage('error', 'Linh lực không đủ!')
    return
  }
  explorationWorker.value.postMessage({
    type: 'explore',
    playerData: { luck: playerStore.luck },
    location
  })
}

// Khởi tạo Worker khi component được gắn kết
onMounted(() => {
  initWorker()
})

// Dọn dẹp Worker và bộ hẹn giờ khi component bị hủy
onUnmounted(() => {
  if (explorationWorker.value) {
    explorationWorker.value.terminate()
  }
  Object.values(explorationTimers.value).forEach(timer => clearInterval(timer))
  explorationTimers.value = {}
  exploringLocations.value = {}
})

// Lấy danh sách địa điểm khả dụng
const availableLocations = computed(() => {
  return locations.filter(loc => playerStore.level >= loc.minLevel)
})

// Hiển thị thông báo và xử lý trùng lặp
const showMessage = (type, content) => {
  return logRef.value?.addLog(type, content);
}

// Bắt đầu tự động khám phá
const startAutoExploration = (location) => {
  if (exploringLocations.value[location.id] || isAutoExploring.value) return
  isAutoExploring.value = true
  autoExploringLocationId.value = location.id
  exploringLocations.value[location.id] = true
  explorationTimers.value[location.id] = setInterval(() => {
    if (playerStore.spirit >= location.spiritCost) {
      exploreLocation(location)
    } else {
      stopAutoExploration(location)
      showMessage('warning', 'Linh lực không đủ, tự động khám phá đã dừng lại!')
    }
  }, explorationInterval)
}

// Dừng tự động khám phá
const stopAutoExploration = (location) => {
  if (explorationTimers.value[location.id]) {
    clearInterval(explorationTimers.value[location.id])
    delete explorationTimers.value[location.id]
  }
  exploringLocations.value[location.id] = false
  isAutoExploring.value = false
  autoExploringLocationId.value = null
}

// Dọn dẹp tất cả bộ hẹn giờ khi component bị hủy
onUnmounted(() => {
  Object.values(explorationTimers.value).forEach(timer => clearInterval(timer))
  explorationTimers.value = {}
  exploringLocations.value = {}
})
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>
          Khám Phá
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <n-card :bordered="false">
        <n-space vertical>
          <n-alert type="info" show-icon>
            <template #icon>
              <n-icon>
                <compass-outline />
              </n-icon>
            </template>
            Khám phá các bí cảnh, tìm kiếm cơ duyên tạo hóa. Hãy cẩn trọng, nguy hiểm và cơ hội luôn song hành.
          </n-alert>
          <n-grid :cols="2" :x-gap="12">
            <n-grid-item v-for="location in availableLocations" :key="location.id">
              <n-card :title="location.name" size="small">
                <n-space vertical>
                  <n-text depth="3">{{ location.description }}</n-text>
                  <n-space justify="space-between">
                    <n-text>Tiêu hao linh lực: {{ location.spiritCost }}</n-text>
                    <n-text>Cảnh giới tối thiểu: {{ getRealmName(location.minLevel).name }}</n-text>
                  </n-space>
                  <n-space>
                    <n-button type="primary" @click="exploreLocation(location)"
                      :disabled="playerStore.spirit < location.spiritCost || isAutoExploring">
                      Khám Phá
                    </n-button>
                    <n-button :type="exploringLocations[location.id] ? 'warning' : 'success'"
                      @click="exploringLocations[location.id] ? stopAutoExploration(location) : startAutoExploration(location)"
                      :disabled="playerStore.spirit < location.spiritCost || (isAutoExploring && !exploringLocations[location.id])">
                      {{ exploringLocations[location.id] ? 'Dừng' : 'Tự Động' }}
                    </n-button>
                  </n-space>
                </n-space>
              </n-card>
            </n-grid-item>
          </n-grid>
          <n-divider>Thống Kê Khám Phá</n-divider>
          <n-descriptions :column="2" bordered>
            <n-descriptions-item label="Số lần khám phá">
              {{ playerStore.explorationCount }}
            </n-descriptions-item>
            <n-descriptions-item label="Số lượng linh thạch">
              {{ playerStore.spiritStones }}
            </n-descriptions-item>
            <n-descriptions-item label="Số lượng linh thảo">
              {{ playerStore.herbs.length }}
            </n-descriptions-item>
            <n-descriptions-item label="Mảnh đan phương">
              {{ Object.values(playerStore.pillFragments || {}).reduce((a, b) => a + b, 0) }}
            </n-descriptions-item>
          </n-descriptions>
        </n-space>
      </n-card>
      <log-panel ref="logRef" title="Nhật Ký Khám Phá" />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.n-space {
  width: 100%;
}

.n-card {
  margin-bottom: 12px;
}

.n-collapse {
  margin-top: 12px;
}
</style>