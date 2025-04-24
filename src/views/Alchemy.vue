<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { pillRecipes, pillGrades, pillTypes, calculatePillEffect } from '../plugins/pills'
import { herbs } from '../plugins/herbs'
import LogPanel from '../components/LogPanel.vue'

const playerStore = usePlayerStore()
const logRef = ref(null)

// Đơn thuốc đan dược đang được chọn
const selectedRecipe = ref(null)

// Danh sách đơn thuốc đã mở khóa
const unlockedRecipes = computed(() => {
  return pillRecipes.filter(recipe => playerStore.pillRecipes.includes(recipe.id))
})

// Chọn đơn thuốc
const selectRecipe = (recipe) => {
  selectedRecipe.value = recipe
}

// Kiểm tra nguyên liệu có đủ không
const checkMaterials = (recipe) => {
  if (!recipe) return false
  return recipe.materials.every(material => {
    const count = playerStore.herbs.filter(h => h.id === material.herb).length
    return count >= material.count
  })
}

// Lấy trạng thái nguyên liệu
const getMaterialStatus = (material) => {
  const count = playerStore.herbs.filter(h => h.id === material.herb).length
  return `${count}/${material.count}`
}

// Lấy tên linh thảo
const getHerbName = (herbId) => {
  const herb = herbs.find(h => h.id === herbId)
  return herb ? herb.name : herbId
}

// Tính toán hiệu quả hiện tại
const currentEffect = computed(() => {
  if (!selectedRecipe.value) return null
  return calculatePillEffect(selectedRecipe.value, playerStore.level)
})

// Luyện chế đan dược
const craftPill = () => {
  if (!selectedRecipe.value) return
  const result = playerStore.craftPill(selectedRecipe.value.id)
  if (result.success) {
    logRef.value?.addLog('success', 'Luyện chế thành công!')
    // Hiệu ứng hoạt ảnh khi thành công
    const btn = document.querySelector('.craft-button')
    if (btn) {
      btn.classList.add('success-animation')
      setTimeout(() => {
        btn.classList.remove('success-animation')
      }, 1000)
    }
  } else {
    logRef.value?.addLog('error', `Luyện chế thất bại: ${result.message}`)
    // Hiệu ứng hoạt ảnh khi thất bại
    const btn = document.querySelector('.craft-button')
    if (btn) {
      btn.classList.add('fail-animation')
      setTimeout(() => {
        btn.classList.remove('fail-animation')
      }, 1000)
    }
  }
}
</script>

<template>
  <n-card title="Luyện Đan Thuật">
    <n-space vertical>
      <template v-if="unlockedRecipes.length > 0">
        <n-divider>Chọn Đan Phương</n-divider>
        <!-- Lựa chọn đan phương -->
        <n-grid :cols="2" :x-gap="12">
          <n-grid-item v-for="recipe in unlockedRecipes" :key="recipe.id">
            <n-card :title="recipe.name" size="small">
              <n-space vertical>
                <n-text depth="3">{{ recipe.description }}</n-text>
                <n-space>
                  <n-tag type="info">{{ pillGrades[recipe.grade].name }}</n-tag>
                  <n-tag type="warning">{{ pillTypes[recipe.type].name }}</n-tag>
                </n-space>
                <n-button @click="selectRecipe(recipe)" block
                  :type="selectedRecipe?.id === recipe.id ? 'primary' : 'default'">
                  {{ selectedRecipe?.id === recipe.id ? 'Đã chọn' : 'Chọn'}}
                </n-button>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </template>
      <n-space vertical v-else>
        <n-empty description="Chưa nắm được đan phương nào" />
      </n-space>
      <!-- Yêu cầu nguyên liệu -->
      <template v-if="selectedRecipe">
        <n-divider>Nguyên Liệu Cần Thiết</n-divider>
        <n-list>
          <n-list-item v-for="material in selectedRecipe.materials" :key="material.herb">
            <n-space justify="space-between">
              <n-space>
                <span>{{ getHerbName(material.herb) }}</span>
                <n-tag size="small">Số lượng cần: {{ material.count }}</n-tag>
              </n-space>
              <n-tag
                :type="getMaterialStatus(material) === `${material.count}/${material.count}` ? 'success' : 'warning'">
                Đang có: {{ getMaterialStatus(material) }}
              </n-tag>
            </n-space>
          </n-list-item>
        </n-list>
      </template>
      <!-- Xem trước hiệu quả -->
      <template v-if="selectedRecipe">
        <n-divider>Xem Trước Hiệu Quả</n-divider>
        <n-descriptions bordered :column="2">
          <n-descriptions-item label="Giới thiệu đan dược">
            {{ selectedRecipe.description }}
          </n-descriptions-item>
          <n-descriptions-item label="Giá trị hiệu quả">
            +{{ (currentEffect.value * 100).toFixed(1) }}%
          </n-descriptions-item>
          <n-descriptions-item label="Thời gian duy trì">
            {{ Math.floor(currentEffect.duration / 60) }} phút
          </n-descriptions-item>
          <n-descriptions-item label="Tỷ lệ thành công">
            {{ (currentEffect.successRate * 100).toFixed(1) }}%
          </n-descriptions-item>
        </n-descriptions>
      </template>
      <!-- Nút luyện chế -->
      <n-button class="craft-button" type="primary" block v-if="selectedRecipe" :disabled="!selectedRecipe || !checkMaterials(selectedRecipe)"
        @click="craftPill">
        {{ !checkMaterials(selectedRecipe) ? 'Thiếu nguyên liệu' : 'Bắt đầu luyện đan' }}
      </n-button>
    </n-space>
    <log-panel v-if="selectedRecipe" ref="logRef" title="Nhật ký luyện đan" />
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

.craft-button {
  position: relative;
  overflow: hidden;
}

@keyframes success-ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes fail-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.success-animation::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: success-ripple 1s ease-out;
}

.fail-animation {
  animation: fail-shake 0.5s ease-in-out;
}
</style>