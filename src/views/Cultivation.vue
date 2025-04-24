<script setup>
import { usePlayerStore } from '../stores/player'
import { ref, onUnmounted, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { BookOutline } from '@vicons/ionicons5'
import LogPanel from '../components/LogPanel.vue'

const playerStore = usePlayerStore()
const logRef = ref(null)

// Các giá trị liên quan đến tu luyện
const baseGainRate = 1  // Tỷ lệ thu hoạch linh lực cơ bản
const baseCultivationCost = 10  // Chi phí linh lực cơ bản cho tu luyện
const baseCultivationGain = 1  // Lượng tu vi cơ bản thu được
const autoGainInterval = 1000  // Khoảng thời gian tự động thu hoạch linh lực (mili giây)
const extraCultivationChance = 0.3  // Xác suất cơ bản nhận được tu vi bổ sung

// Tính toán chi phí tu luyện ở cảnh giới hiện tại
const getCurrentCultivationCost = () => {
  return Math.floor(baseCultivationCost * Math.pow(1.5, playerStore.level - 1))
}

// Tính toán lượng tu vi thu được ở cảnh giới hiện tại
const getCurrentCultivationGain = () => {
  return Math.floor(baseCultivationGain * Math.pow(1.2, playerStore.level - 1))
}

// Tính toán chi phí tu luyện hiện tại (dưới dạng thuộc tính tính toán)
const cultivationCost = computed(() => {
  return getCurrentCultivationCost()
})

// Tính toán lượng tu vi thu được hiện tại (dưới dạng thuộc tính tính toán)
const cultivationGain = computed(() => {
  return getCurrentCultivationGain()
})

// Tính toán tổng linh lực cần thiết để đột phá
const calculateBreakthroughCost = () => {
  const remainingCultivation = Math.max(0, playerStore.maxCultivation - playerStore.cultivation)
  const gain = cultivationGain?.value || 1
  if (gain <= 0) return 0
  const cultivationTimes = Math.ceil(remainingCultivation / gain)
  return Math.max(0, cultivationTimes * getCurrentCultivationCost())
}

// Trạng thái tự động tu luyện
const isAutoCultivating = ref(false)
const cultivationTimer = ref(null)

// Hiển thị thông báo và xử lý trùng lặp
const showMessage = (type, content) => {
  return logRef.value?.addLog(type, content);
}

// Tính toán lượng tu vi thực tế nhận được
const calculateCultivationGain = () => {
  let gain = cultivationGain.value
  // Tính toán xem có nhận được tu vi bổ sung dựa trên giá trị may mắn hay không
  if (Math.random() < extraCultivationChance * playerStore.luck) {
    gain *= 2
    showMessage('success', 'Phúc duyên không tệ, nhận được gấp đôi tu vi!')
  }
  return gain
}

// Kiểm tra xem có thể đột phá hay không
const canBreakthrough = () => {
  return playerStore.cultivation >= playerStore.maxCultivation
}

// Worker tu luyện
const cultivationWorker = new Worker(new URL('../workers/cultivation.js', import.meta.url), { type: 'module' })

// Xử lý tin nhắn từ Worker
cultivationWorker.onmessage = ({ data }) => {
  if (data.type === 'error') {
    showMessage('error', data.message)
    return
  }
  if (data.type === 'success') {
    const { spiritCost, cultivationGain, doubleGainTimes } = data.result
    // Trừ linh lực
    playerStore.spirit -= spiritCost
    // Tăng tu vi
    playerStore.cultivate(cultivationGain)
    if (doubleGainTimes > 0) {
      showMessage('success', `Phúc duyên không tệ, nhận được ${doubleGainTimes} lần tu vi gấp đôi!`)
    }
    // Thử đột phá
    if (canBreakthrough() && playerStore.tryBreakthrough()) {
      showMessage('success', `Đột phá thành công! Chúc mừng bước vào ${playerStore.realm}!`)
    } else if (canBreakthrough()) {
      showMessage('info', 'Đã đạt điều kiện đột phá, nhưng đột phá thất bại, hãy tiếp tục cố gắng!')
    } else {
      showMessage('success', 'Tu luyện thành công!')
    }
  }
}

// Tu luyện một lần đến khi đột phá
const cultivateUntilBreakthrough = () => {
  try {
    // Kiểm tra xem đã đạt điều kiện đột phá chưa
    if (!canBreakthrough()) {
      // Gửi dữ liệu đến Worker để tính toán
      cultivationWorker.postMessage({
        type: 'cultivateUntilBreakthrough',
        playerData: {
          level: playerStore.level,
          spirit: playerStore.spirit,
          cultivation: playerStore.cultivation,
          maxCultivation: playerStore.maxCultivation,
          luck: playerStore.luck
        }
      })
    } else {
      // Trực tiếp thử đột phá
      if (playerStore.tryBreakthrough()) {
        showMessage('success', `Đột phá thành công! Chúc mừng bước vào ${playerStore.realm}!`)
      } else {
        showMessage('info', 'Đã đạt điều kiện đột phá, nhưng đột phá thất bại, hãy tiếp tục cố gắng!')
      }
    }
  } catch (error) {
    console.error('Lỗi khi tu luyện một lần:', error)
    showMessage('error', 'Tu luyện thất bại!')
  }
}

// Tu luyện thủ công
const cultivate = () => {
  try {
    const currentCost = getCurrentCultivationCost()
    if (playerStore.spirit >= currentCost) {
      const oldRealm = playerStore.realm
      playerStore.spirit -= currentCost
      playerStore.cultivate(calculateCultivationGain())
      // Kiểm tra xem có xảy ra đột phá không
      if (playerStore.realm !== oldRealm) {
        showMessage('success', `Đột phá thành công! Chúc mừng bước vào ${playerStore.realm}!`)
      } else {
        showMessage('success', 'Tu luyện thành công!')
      }
    } else {
      showMessage('error', 'Linh lực không đủ!')
    }
  } catch (error) {
    console.error('Lỗi khi tu luyện:', error)
    showMessage('error', 'Tu luyện thất bại!')
  }
}

// Chuyển đổi tự động tu luyện
const toggleAutoCultivation = () => {
  try {
    isAutoCultivating.value = !isAutoCultivating.value
    if (isAutoCultivating.value) {
      if (cultivationTimer.value) return
      cultivationTimer.value = setInterval(() => {
        const currentCost = getCurrentCultivationCost()
        if (playerStore.spirit >= currentCost) {
          playerStore.spirit -= currentCost
          playerStore.cultivate(cultivationGain.value)
        }
      }, autoGainInterval)
    } else {
      if (cultivationTimer.value) {
        clearInterval(cultivationTimer.value)
        cultivationTimer.value = null
      }
    }
  } catch (error) {
    console.error('Lỗi khi chuyển đổi tự động tu luyện:', error)
    logRef.value?.addLog('error', 'Chuyển đổi thất bại!')
    isAutoCultivating.value = false
  }
}

// Dọn dẹp bộ hẹn giờ khi component bị hủy
onUnmounted(() => {
  try {
    if (cultivationTimer.value) {
      clearInterval(cultivationTimer.value)
      cultivationTimer.value = null
    }
    isAutoCultivating.value = false
  } catch (error) {
    console.error('Lỗi khi dọn dẹp bộ hẹn giờ:', error)
  }
})
</script>

<template>
  <n-card title="Tu Luyện">
    <n-space vertical>
      <n-alert type="info" show-icon>
        <template #icon>
          <n-icon>
            <book-outline />
          </n-icon>
        </template>
        Thông qua ngồi thiền tu luyện để nâng cao tu vi, tích lũy đủ tu vi có thể thử đột phá cảnh giới.
      </n-alert>
      <n-space vertical>
        <n-button type="primary" size="large" block @click="cultivate" :disabled="playerStore.spirit < cultivationCost">
          Ngồi thiền tu luyện (tiêu hao {{ cultivationCost }} linh lực)
        </n-button>
        <n-button :type="isAutoCultivating ? 'warning' : 'success'" size="large" block @click="toggleAutoCultivation">
          {{ isAutoCultivating ? 'Dừng tự động tu luyện' : 'Bắt đầu tự động tu luyện' }}
        </n-button>
        <n-button type="info" size="large" block @click="cultivateUntilBreakthrough"
          :disabled="playerStore.spirit < calculateBreakthroughCost()">
          Đột phá một lần
        </n-button>
      </n-space>
      <n-divider>Chi tiết tu luyện</n-divider>
      <n-descriptions bordered>
        <n-descriptions-item label="Tốc độ thu hoạch linh lực">
          {{ baseGainRate * playerStore.spiritRate }} / giây
        </n-descriptions-item>
        <n-descriptions-item label="Hiệu quả tu luyện">
          {{ cultivationGain }} tu vi / lần
        </n-descriptions-item>
        <n-descriptions-item label="Tu vi cần thiết để đột phá">
          {{ playerStore.maxCultivation }}
        </n-descriptions-item>
      </n-descriptions>
      <log-panel ref="logRef" title="Nhật ký tu luyện" />
    </n-space>
  </n-card>
</template>

<style scoped>
.n-space {
  width: 100%;
}

.n-button {
  margin-bottom: 12px;
}

.n-collapse {
  margin-top: 12px;
}
</style>