<script setup>
import { usePlayerStore } from '../stores/player'
import { achievements, getAchievementProgress } from '../plugins/achievements'
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { checkAchievements } from '../plugins/achievements'

const playerStore = usePlayerStore()
const message = useMessage()

// Kiểm tra tình trạng hoàn thành thành tựu
onMounted(() => {
  const newlyCompletedAchievements = checkAchievements(playerStore)
  // Hiển thị thành tựu mới hoàn thành
  newlyCompletedAchievements.forEach(achievement => {
    message.success(
      `Chúc mừng đã mở khóa thành tựu mới: ${achievement.name}！\n\n${achievement.description}`,
      { duration: 3000 }
    )
  })
})

// Lấy tất cả danh mục thành tựu
const achievementCategories = Object.entries(achievements).map(([key, value]) => ({
  key,
  name: getCategoryName(key),
  achievements: value
}))

// Lấy tên danh mục thành tựu
function getCategoryName (category) {
  const categoryNames = {
    equipment: 'Thành tựu trang bị',
    dungeon_explore: 'Khám phá mật cảnh',
    dungeon_combat: 'Chiến đấu mật cảnh',
    cultivation: 'Thành tựu tu luyện',
    breakthrough: 'Thành tựu đột phá',
    exploration: 'Thành tựu thám hiểm',
    collection: 'Thành tựu sưu tập',
    resources: 'Thành tựu tài nguyên',
    alchemy: 'Thành tựu luyện đan'
  }
  return categoryNames[category] || 'Thành tựu khác'
}

// Kiểm tra thành tựu đã hoàn thành chưa
function isAchievementCompleted (achievementId) {
  return playerStore.completedAchievements.includes(achievementId)
}

// Hiển thị chi tiết thành tựu
const showAchievementDetails = (achievement) => {
  let rewardText = 'Phần thưởng：'
  if (achievement.reward) {
    if (achievement.reward.spirit) rewardText += `\n${achievement.reward.spirit} Linh lực`
    if (achievement.reward.spiritRate) rewardText += `\n${(achievement.reward.spiritRate * 100 - 100).toFixed(0)}% Tăng thu hoạch linh lực`
    if (achievement.reward.herbRate) rewardText += `\n${(achievement.reward.herbRate * 100 - 100).toFixed(0)}% Tăng thu hoạch linh thảo`
    if (achievement.reward.alchemyRate) rewardText += `\n${(achievement.reward.alchemyRate * 100 - 100).toFixed(0)}% Tăng tỷ lệ thành công luyện đan`
    if (achievement.reward.luck) rewardText += `\n${(achievement.reward.luck * 100 - 100).toFixed(0)}% Tăng may mắn`
  }
  message.info(
    `${achievement.name}\n\n${achievement.description}\n\n${rewardText}`,
    { duration: 5000 }
  )
}

// Lấy tiến độ thành tựu
function getProgress (achievement) {
  try {
    const progress = getAchievementProgress(playerStore, achievement)
    return Number.isFinite(progress) ? Math.min(100, Math.max(0, Math.round(progress))) : 0
  } catch (error) {
    console.error('Lỗi tiến độ thành tựu:', error)
    return 0
  }
}
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>
          Hệ thống thành tựu
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <n-card :bordered="false">
        <n-tabs type="line">
          <n-tab-pane v-for="category in achievementCategories" :key="category.key" :name="category.key"
            :tab="category.name">
            <n-space vertical>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-grid-item v-for="achievement in category.achievements" :key="achievement.id">
                  <n-card :class="{ completed: isAchievementCompleted(achievement.id) }" size="small" hoverable
                    @click="showAchievementDetails(achievement)">
                    <template #header>
                      <n-space justify="space-between" align="center">
                        <span>{{ achievement.name }}</span>
                        <n-tag :type="isAchievementCompleted(achievement.id) ? 'success' : 'default'">
                          {{ isAchievementCompleted(achievement.id) ? 'Đã hoàn thành' : 'Chưa hoàn thành' }}
                        </n-tag>
                      </n-space>
                    </template>
                    <p>{{ achievement.description }}</p>
                    <n-progress type="line" :percentage="getProgress(achievement)"
                      :color="isAchievementCompleted(achievement.id) ? '#18a058' : '#2080f0'" :height="8"
                      :border-radius="4" :show-indicator="true" />
                  </n-card>
                </n-grid-item>
              </n-grid>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.completed {
  background-color: rgba(24, 160, 88, 0.1);
}
</style>