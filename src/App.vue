<script setup>
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from './stores/player'
import { h, ref } from 'vue'
import { NIcon, darkTheme } from 'naive-ui'
import { BookOutlined, ExperimentOutlined, CompassOutlined, TrophyOutlined, SettingOutlined, MedicineBoxOutlined, GiftOutlined, HomeOutlined, SmileOutlined, AppstoreOutlined, BugOutlined } from '@ant-design/icons-vue'
import { Moon, Sunny, Flash } from '@vicons/ionicons5'
import { getRealmName } from './plugins/realm'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()
const spiritWorker = ref(null)
const menuOptions = ref([])
const isNewPlayer = ref(false)
const isLoading = ref(true) // Thêm trạng thái đang tải

// Khởi tạo dữ liệu
playerStore.initializePlayer().then(() => {
  isLoading.value = false
  getMenuOptions()
})

// Theo dõi trạng thái người chơi
watch(() => playerStore.isNewPlayer, (bool) => {
  isNewPlayer.value = bool
  if (!bool && route.path === '/') {
    router.push('/cultivation')
  }
})

// Cấu hình thu thập linh lực
const baseGainRate = 1  // Tốc độ thu thập linh lực cơ bản

const getMenuOptions = () => {
  menuOptions.value = [,
    ...(isNewPlayer.value ? [{
      label: 'Chào mừng',
      key: '',
      icon: renderIcon(HomeOutlined)
    }] : []),
    {
      label: 'Tu luyện',
      key: 'cultivation',
      icon: renderIcon(BookOutlined)
    },
    {
      label: 'Túi đồ',
      key: 'inventory',
      icon: renderIcon(ExperimentOutlined)
    },
    {
      label: 'Rút thưởng',
      key: 'gacha',
      icon: renderIcon(GiftOutlined)
    },
    {
      label: 'Luyện đan',
      key: 'alchemy',
      icon: renderIcon(MedicineBoxOutlined)
    },
    {
      label: 'Thám hiểm',
      key: 'exploration',
      icon: renderIcon(CompassOutlined)
    },
    {
      label: 'Bí cảnh',
      key: 'dungeon',
      icon: renderIcon(Flash)
    },
    {
      label: 'Thành tựu',
      key: 'achievements',
      icon: renderIcon(TrophyOutlined)
    },
    {
      label: 'Cài đặt',
      key: 'settings',
      icon: renderIcon(SettingOutlined)
    },
    ...(playerStore.isGMMode ? [{
      label: 'GM',
      key: 'gm',
      icon: renderIcon(SmileOutlined)
    }] : []),
  ]
}
// Tự động thu thập linh lực
const startAutoGain = () => {
  if (spiritWorker.value) return
  spiritWorker.value = new Worker(new URL('./workers/spirit.js', import.meta.url))
  spiritWorker.value.onmessage = (e) => {
    if (e.data.type === 'gain') {
      playerStore.totalCultivationTime += 1
      playerStore.gainSpirit(baseGainRate)
    }
  }
  spiritWorker.value.postMessage({ type: 'start' })
}

onMounted(() => {
  startAutoGain()  // Khởi động tự động thu thập linh lực
  // Thêm sự kiện lắng nghe phím
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // Xóa sự kiện lắng nghe phím khi component bị hủy
  window.removeEventListener('keydown', handleKeyDown)
})

// Biểu tượng
const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// Lấy khóa menu tương ứng với đường dẫn hiện tại
const getCurrentMenuKey = () => {
  const path = route.path.slice(1) // Xóa dấu gạch chéo ở đầu
  return path // Nếu là đường dẫn gốc, mặc định trả về cultivation
}

// Sự kiện khi nhấp vào menu
const handleMenuClick = (key) => {
  router.push(`/${key}`)
}

// Sự kiện khi nhấn tổ hợp phím Shift+Alt+G để mở trang đăng nhập GM
const handleKeyDown = (event) => {
  if (event.shiftKey && event.altKey && event.key === 'G') {
    router.push('/gm-login')
  }
}

</script>

<template>
  <n-config-provider :theme="playerStore.isDarkMode ? darkTheme : null">
    <n-message-provider>
      <n-dialog-provider>
        <n-spin :show="isLoading" description="Đang tải dữ liệu trò chơi...">
          <n-layout>
            <n-layout-header bordered>
              <div class="header-content">
                <n-page-header>
                  <template #title>
                    Con Đường Tu Tiên Nhàn Nhã
                  </template>
                  <template #extra>
                    <n-button quaternary circle @click="playerStore.toggle">
                      <template #icon>
                        <n-icon>
                          <Sunny v-if="playerStore.isDarkMode" />
                          <Moon v-else />
                        </n-icon>
                      </template>
                    </n-button>
                  </template>
                </n-page-header>
                <n-scrollbar x-scrollable trigger="none">
                  <n-menu mode="horizontal" :options="menuOptions" :value="getCurrentMenuKey()"
                    @update:value="handleMenuClick" />
                </n-scrollbar>
              </div>
            </n-layout-header>
            <n-layout-content>
              <div class="content-wrapper">
                <n-card>
                  <n-space vertical>
                    <n-descriptions bordered>
                      <n-descriptions-item label="Đạo hiệu">
                        {{ playerStore.name }}
                      </n-descriptions-item>
                      <n-descriptions-item label="Cảnh giới">
                        {{ getRealmName(playerStore.level).name }}
                      </n-descriptions-item>
                      <n-descriptions-item label="Tu vi">
                        {{ playerStore.cultivation }} / {{ playerStore.maxCultivation }}
                      </n-descriptions-item>
                      <n-descriptions-item label="Linh lực">
                        {{ playerStore.spirit.toFixed(2) }}
                      </n-descriptions-item>
                      <n-descriptions-item label="Linh thạch">
                        {{ playerStore.spiritStones }}
                      </n-descriptions-item>
                      <n-descriptions-item label="Cường hóa thạch">
                        {{ playerStore.reinforceStones }}
                      </n-descriptions-item>
                    </n-descriptions>
                    <n-collapse>
                      <n-collapse-item title="Thông tin chi tiết" name="1">
                        <n-divider>Thuộc tính cơ bản</n-divider>
                        <n-descriptions bordered :column="2">
                          <n-descriptions-item label="Sinh lực">
                            {{ (playerStore.baseAttributes.health|| 0).toFixed(0) }}
                          </n-descriptions-item>
                          <n-descriptions-item label="Công kích">
                            {{ (playerStore.baseAttributes.attack|| 0).toFixed(0) }}
                          </n-descriptions-item>
                          <n-descriptions-item label="Phòng ngự">
                            {{ (playerStore.baseAttributes.defense|| 0).toFixed(0) }}
                          </n-descriptions-item>
                          <n-descriptions-item label="Tốc độ">
                            {{ (playerStore.baseAttributes.speed || 0).toFixed(0) }}
                          </n-descriptions-item>
                        </n-descriptions>
                        <n-divider>Thuộc tính chiến đấu</n-divider>
                        <n-descriptions bordered :column="3">
                          <n-descriptions-item label="Tỷ lệ bạo kích">
                            {{ (playerStore.combatAttributes.critRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tỷ lệ liên kích">
                            {{ (playerStore.combatAttributes.comboRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tỷ lệ phản kích">
                            {{ (playerStore.combatAttributes.counterRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tỷ lệ choáng">
                            {{ (playerStore.combatAttributes.stunRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tỷ lệ né tránh">
                            {{ (playerStore.combatAttributes.dodgeRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tỷ lệ hút máu">
                            {{ (playerStore.combatAttributes.vampireRate * 100).toFixed(1) }}%
                          </n-descriptions-item>
                        </n-descriptions>
                        <n-divider>Kháng tính chiến đấu</n-divider>
                        <n-descriptions bordered :column="3">
                          <n-descriptions-item label="Kháng bạo kích">
                            {{ (playerStore.combatResistance.critResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Kháng liên kích">
                            {{ (playerStore.combatResistance.comboResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Kháng phản kích">
                            {{ (playerStore.combatResistance.counterResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Kháng choáng">
                            {{ (playerStore.combatResistance.stunResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Kháng né tránh">
                            {{ (playerStore.combatResistance.dodgeResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Kháng hút máu">
                            {{ (playerStore.combatResistance.vampireResist * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                        </n-descriptions>
                        <n-divider>Thuộc tính đặc biệt</n-divider>
                        <n-descriptions bordered :column="4">
                          <n-descriptions-item label="Tăng hồi phục">
                            {{ (playerStore.specialAttributes.healBoost * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tăng sát thương bạo kích">
                            {{ (playerStore.specialAttributes.critDamageBoost * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Giảm sát thương bạo kích">
                            {{ (playerStore.specialAttributes.critDamageReduce * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tăng sát thương cuối cùng">
                            {{ (playerStore.specialAttributes.finalDamageBoost * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Giảm sát thương cuối cùng">
                            {{ (playerStore.specialAttributes.finalDamageReduce * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tăng thuộc tính chiến đấu">
                            {{ (playerStore.specialAttributes.combatBoost * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                          <n-descriptions-item label="Tăng kháng tính chiến đấu">
                            {{ (playerStore.specialAttributes.resistanceBoost * 100 || 0).toFixed(1) }}%
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-collapse-item>
                    </n-collapse>
                    <n-progress type="line"
                      :percentage="Number(((playerStore.cultivation / playerStore.maxCultivation) * 100).toFixed(2))"
                      indicator-text-color="rgba(255, 255, 255, 0.82)" rail-color="rgba(32, 128, 240, 0.2)"
                      color="#2080f0" :show-indicator="true" indicator-placement="inside" processing />
                  </n-space>
                </n-card>
                <router-view />
              </div>
            </n-layout-content>
          </n-layout>
        </n-spin>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:root {
  --n-color: rgb(16, 16, 20);
  --n-text-color: rgba(255, 255, 255, 0.82);
}

html.dark {
  background-color: var(--n-color);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.n-config-provider,
.n-layout {
  height: 100%;
  min-height: 100vh;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.n-card {
  margin-bottom: 16px;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}

.n-page-header__title {
  padding: 16px 0;
  margin: 0 16px;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.03);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 3px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

html.dark ::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.03);
}

html.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
