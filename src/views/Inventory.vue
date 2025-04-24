<script setup>
import { usePlayerStore } from '../stores/player'
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { getStatName, formatStatValue } from '../plugins/stats'
import { getRealmName } from '../plugins/realm'
import { pillRecipes, pillGrades, pillTypes, calculatePillEffect } from '../plugins/pills'
import { enhanceEquipment, reforgeEquipment } from '../plugins/equipment'

// Phân trang
const currentPage = ref(1)
const pageSize = ref(12)

// Danh sách Linh Thú sau khi lọc
const filteredPets = computed(() => {
  const pets = playerStore.items.filter(item => item.type === 'pet')
  if (selectedRarityToRelease.value === 'all') {
    return pets
  }
  return pets.filter(pet => pet.rarity === selectedRarityToRelease.value)
})

// Linh Thú hiển thị trên trang hiện tại
const displayPets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPets.value.slice(start, end)
})

// Xử lý khi thay đổi kích thước trang
const onPageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const playerStore = usePlayerStore()
const message = useMessage()

// Sử dụng Đan Dược
const usePill = (pill) => {
  const result = playerStore.usePill(pill)
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }
}

// Phẩm chất Linh Thú
const petRarities = {
  divine: {
    name: 'Thần Phẩm',
    color: '#FF0000',
    probability: 0.02,
    essenceBonus: 50
  },
  celestial: {
    name: 'Tiên Phẩm',
    color: '#FFD700',
    probability: 0.08,
    essenceBonus: 30
  },
  mystic: {
    name: 'Huyền Phẩm',
    color: '#9932CC',
    probability: 0.15,
    essenceBonus: 20
  },
  spiritual: {
    name: 'Linh Phẩm',
    color: '#1E90FF',
    probability: 0.25,
    essenceBonus: 10
  },
  mortal: {
    name: 'Phàm Phẩm',
    color: '#32CD32',
    probability: 0.5,
    essenceBonus: 5
  }
}

// Chi tiết Linh Thú
const showPetModal = ref(false)
const selectedPet = ref(null)
const selectedFoodPet = ref(null)

// Cửa sổ xác nhận phóng sinh
const showReleaseConfirm = ref(false)
const showBatchReleaseConfirm = ref(false)
const petToRelease = ref(null)

// Hiển thị cửa sổ xác nhận phóng sinh
const confirmReleasePet = (pet) => {
  petToRelease.value = pet
  showReleaseConfirm.value = true
}

// Hủy phóng sinh
const cancelReleasePet = () => {
  petToRelease.value = null
  showReleaseConfirm.value = false
}

// Thực hiện phóng sinh
const releasePet = () => {
  if (petToRelease.value) {
    // Nếu Linh Thú đang xuất chiến, hủy xuất chiến
    if (playerStore.activePet?.id === petToRelease.value.id) {
      playerStore.activePet = null
    }
    // Xóa Linh Thú khỏi túi đồ
    const index = playerStore.items.findIndex(item => item.id === petToRelease.value.id)
    if (index > -1) {
      playerStore.items.splice(index, 1)
      playerStore.saveData()
      message.success('Đã phóng sinh Linh Thú')
    }
    // Đóng tất cả cửa sổ liên quan
    showReleaseConfirm.value = false
    showPetModal.value = false
    petToRelease.value = null
  }
}

// Phẩm chất đã chọn để phóng sinh
const selectedRarityToRelease = ref('all')

// Phóng sinh hàng loạt
const batchReleasePets = () => {
  playerStore.items = playerStore.items.filter(item =>
    item.type !== 'pet' ||
    item.id === playerStore.activePet?.id ||
    (selectedRarityToRelease.value !== 'all' && item.rarity !== selectedRarityToRelease.value)
  )
  showBatchReleaseConfirm.value = false
  message.success(`Đã phóng sinh ${selectedRarityToRelease.value === 'all' ? 'tất cả' : petRarities[selectedRarityToRelease.value].name} Linh Thú chưa xuất chiến`)
}

// Hiển thị chi tiết Linh Thú
const showPetDetails = (pet) => {
  selectedPet.value = pet
  selectedFoodPet.value = null
  showPetModal.value = true
}

// Tính toán gia tăng thuộc tính từ Linh Thú
const getPetBonus = (pet) => {
  if (!pet) return { attack: 0, defense: 0, health: 0 }
  const qualityBonusMap = {
    divine: 0.5,
    celestial: 0.3,
    mystic: 0.2,
    spiritual: 0.1,
    mortal: 0.05
  }
  const starBonusPerQuality = {
    divine: 0.1,
    celestial: 0.08,
    mystic: 0.06,
    spiritual: 0.04,
    mortal: 0.02
  }
  const baseBonus = qualityBonusMap[pet.rarity] || 0.05
  const starBonus = ((pet.star || 0) * (starBonusPerQuality[pet.rarity] || 0.02))
  const totalBonus = baseBonus + starBonus
  const phase = Math.floor((pet.star || 0) / 5)
  const phaseBonus = phase * (baseBonus * 0.5)
  const finalBonus = totalBonus + phaseBonus
  return {
    attack: finalBonus,
    defense: finalBonus,
    health: finalBonus
  }
}

// Lấy chi phí tinh hoa cần thiết để nâng cấp
const getUpgradeCost = (pet) => {
  return ((pet.level || 1) * 10)
}

// Kiểm tra xem có thể nâng cấp Linh Thú không
const canUpgrade = (pet) => {
  const cost = getUpgradeCost(pet)
  return playerStore.petEssence >= cost
}

// Lấy danh sách Linh Thú có thể dùng làm nguyên liệu tiến hóa
const getAvailableFoodPets = (pet) => {
  if (!pet) return []
  return playerStore.items
    .filter(item =>
      item.type === 'pet' &&
      item.id !== pet.id &&
      item.star === pet.star &&
      item.rarity === pet.rarity &&
      item.name === pet.name
    )
    .map(item => ({
      label: `${item.name} (Cảnh giới ${item.level || 1}, ${item.star || 0} Tinh)`,
      value: item.id
    }))
}

// Nâng cấp Linh Thú
const upgradePet = (pet) => {
  const result = playerStore.upgradePet(pet, getUpgradeCost(pet))
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }
}

// Tiến hóa Linh Thú
const evolvePet = (pet) => {
  if (!selectedFoodPet.value) {
    message.error('Vui lòng chọn Linh Thú làm nguyên liệu tiến hóa')
    return
  }
  // Tìm Linh Thú làm nguyên liệu theo ID
  const foodPet = playerStore.items.find(item => item.id === selectedFoodPet.value)
  if (!foodPet) {
    message.error('Linh Thú nguyên liệu không tồn tại')
    return
  }
  const result = playerStore.evolvePet(pet, foodPet)
  if (result.success) {
    message.success(result.message)
    selectedFoodPet.value = null
    showPetModal.value = false
  } else {
    message.error(result.message)
  }
}

// Cấu hình loại Pháp Bảo
const equipmentTypes = {
  weapon: 'Binh Khí',
  head: 'Mũ Giáp',
  body: 'Đạo Bào',
  legs: 'Hạ Y',
  feet: 'Hài Cổ',
  shoulder: 'Hộ Giáp',
  hands: 'Thủ Trạo',
  wrist: 'Hộ Uyển',
  necklace: 'Linh Phù',
  ring1: 'Nhẫn Trữ Vật 1',
  ring2: 'Nhẫn Trữ Vật 2',
  belt: 'Đai Lưng',
  artifact: 'Pháp Khí'
}

// Loại Pháp Bảo đang chọn
const selectedType = ref('')

// Hiển thị danh sách Pháp Bảo
const showEquipmentList = (type) => {
  selectedType.value = type
  selectedEquipmentType.value = type
  showEquipmentModal.value = true
}

// Tháo Pháp Bảo
const unequipItem = (slot) => {
  const result = playerStore.unequipArtifact(slot)
  if (result) {
    showEquipmentDetailModal.value = false
    message.success('Đã tháo Pháp Bảo thành công')
  } else {
    message.error('Tháo Pháp Bảo thất bại')
  }
}

// Liên quan đến danh sách Pháp Bảo
const showEquipmentModal = ref(false)
const selectedEquipmentType = ref('')
const selectedQuality = ref('all')
const currentEquipmentPage = ref(1)
const equipmentPageSize = ref(8)

// Tùy chọn phẩm chất Pháp Bảo
const qualityOptions = computed(() => {
  const equipmentsByQuality = {};
  playerStore.items
    .filter(item => !selectedEquipmentType.value || item.type === selectedEquipmentType.value)
    .forEach(item => {
      equipmentsByQuality[item.quality] = (equipmentsByQuality[item.quality] || 0) + 1;
    });
  return [
    { label: 'Tất Cả Phẩm Chất', value: 'all' },
    { label: 'Tiên Phẩm', value: 'mythic', disabled: !equipmentsByQuality['mythic'] },
    { label: 'Cực Phẩm', value: 'legendary', disabled: !equipmentsByQuality['legendary'] },
    { label: 'Thượng Phẩm', value: 'epic', disabled: !equipmentsByQuality['epic'] },
    { label: 'Trung Phẩm', value: 'rare', disabled: !equipmentsByQuality['rare'] },
    { label: 'Hạ Phẩm', value: 'uncommon', disabled: !equipmentsByQuality['uncommon'] },
    { label: 'Phàm Phẩm', value: 'common', disabled: !equipmentsByQuality['common'] }
  ];
});

// Danh sách Pháp Bảo sau khi lọc
const filteredEquipmentList = computed(() => {
  let list = playerStore.items.filter(item => {
    if (!selectedEquipmentType.value) return false
    if (item.type !== selectedEquipmentType.value) return false
    if (selectedQuality.value !== 'all' && item.quality !== selectedQuality.value) return false
    return true
  })
  return list
})

// Pháp Bảo hiển thị trên trang hiện tại
const equipmentList = computed(() => {
  const start = (currentEquipmentPage.value - 1) * equipmentPageSize.value
  const end = start + equipmentPageSize.value
  return filteredEquipmentList.value.slice(start, end)
})

// Xử lý khi thay đổi kích thước trang Pháp Bảo
const onEquipmentPageSizeChange = (size) => {
  equipmentPageSize.value = size
  currentEquipmentPage.value = 1
}

// Bán hàng loạt Pháp Bảo
const batchSellEquipments = async () => {
  const result = await playerStore.batchSellEquipments(
    selectedQuality.value === 'all' ? null : selectedQuality.value,
    selectedEquipmentType.value
  )
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message || 'Bán hàng loạt thất bại')
  }
}

// Bán một Pháp Bảo
const sellEquipment = async (equipment) => {
  const result = await playerStore.sellEquipment(equipment)
  if (result.success) {
    message.success(result.message)
    showEquipmentDetailModal.value = false
  } else {
    message.error(result.message || 'Bán Pháp Bảo thất bại')
  }
}

// Hiển thị chi tiết Pháp Bảo
const showEquipmentDetails = (equipment) => {
  selectedEquipment.value = equipment
  showEquipmentDetailModal.value = true
}

// Liên quan đến chi tiết Pháp Bảo
const showEquipmentDetailModal = ref(false)
const selectedEquipment = ref(null)

// Xác nhận cường hóa
const showEnhanceConfirm = ref(false)

// Cường hóa Pháp Bảo
const handleEnhanceEquipment = () => {
  if (!selectedEquipment.value) return
  const result = enhanceEquipment(selectedEquipment.value, playerStore.reinforceStones)
  if (result.success) {
    playerStore.reinforceStones -= result.cost
    selectedEquipment.value.stats = { ...result.newStats }
    selectedEquipment.value.enhanceLevel = result.newLevel
    message.success('Cường hóa thành công')
    playerStore.saveData()
  } else {
    message.error(result.message || 'Cường hóa thất bại')
  }
}

// Xác nhận luyện hóa
const showReforgeConfirm = ref(false)
const reforgeResult = ref(null)

// Luyện hóa Pháp Bảo
const handleReforgeEquipment = () => {
  if (!selectedEquipment.value) return
  const result = reforgeEquipment(selectedEquipment.value, playerStore.refinementStones, false)
  if (result.success) {
    playerStore.refinementStones -= result.cost
    reforgeResult.value = result
    showReforgeConfirm.value = true
  } else {
    message.error(result.message || 'Luyện hóa thất bại')
  }
}

// Xác nhận kết quả luyện hóa
const confirmReforgeResult = (confirm) => {
  if (!reforgeResult.value) return
  if (confirm) {
    // Đạo hữu xác nhận, áp dụng thuộc tính mới
    selectedEquipment.value.stats = reforgeResult.value.newStats
    message.success('Đã xác nhận thuộc tính mới')
  } else {
    // Đạo hữu từ chối, giữ nguyên thuộc tính cũ
    message.info('Đã giữ nguyên thuộc tính cũ')
  }
  showReforgeConfirm.value = false
  reforgeResult.value = null
  playerStore.saveData()
}

// Trang bị Pháp Bảo
const equipItem = (equipment) => {
  const result = playerStore.equipArtifact(equipment, equipment.type)
  if (result.success) {
    message.success(result.message)
    showEquipmentModal.value = false
    showEquipmentDetailModal.value = false
  } else {
    message.error(result.message || 'Trang bị thất bại')
  }
}

// Phân nhóm Linh Thảo
const groupedHerbs = computed(() => {
  const groups = {}
  playerStore.herbs.forEach(herb => {
    if (!groups[herb.name]) {
      groups[herb.name] = {
        ...herb,
        count: 1
      }
    } else {
      groups[herb.name].count++
    }
  })
  return Object.values(groups)
})

// Phân nhóm Đan Phương
const groupedFormulas = computed(() => {
  // Lấy danh sách Đan Phương hoàn chỉnh từ pillRecipes
  const complete = playerStore.pillRecipes.map(recipeId => {
    const recipe = pillRecipes.find(r => r.id === recipeId)
    return recipe ? {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      grade: recipe.grade,
      type: recipe.type,
      isComplete: true
    } : null
  }).filter(Boolean)

  // Lấy danh sách Đan Phương khiếm khuyết từ pillFragments
  const incomplete = Object.entries(playerStore.pillFragments).map(([recipeId, fragments]) => {
    const recipe = pillRecipes.find(r => r.id === recipeId)
    return recipe ? {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      grade: recipe.grade,
      type: recipe.type,
      isComplete: false,
      fragments,
      fragmentsNeeded: recipe.fragmentsNeeded
    } : null
  }).filter(Boolean)

  return { complete, incomplete }
})

// Phân nhóm Đan Dược
const groupedPills = computed(() => {
  const groups = {}
  playerStore.items
    .filter(item => item.type === 'pill')
    .forEach(pill => {
      if (!groups[pill.name]) {
        groups[pill.name] = {
          ...pill,
          count: 1
        }
      } else {
        groups[pill.name].count++
      }
    })
  return Object.values(groups)
})

// Sử dụng vật phẩm
const useItem = (item) => {
  if (item.type === 'pet') {
    const result = playerStore.usePet(item)
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message || 'Thao tác thất bại')
    }
  }
}

// Tính toán so sánh thuộc tính Pháp Bảo
const equipmentComparison = computed(() => {
  if (!selectedEquipment.value || !selectedEquipmentType.value) return null
  const currentEquipment = playerStore.equippedArtifacts[selectedEquipmentType.value]
  if (!currentEquipment) return null
  const comparison = {}
  const allStats = new Set([...Object.keys(selectedEquipment.value.stats), ...Object.keys(currentEquipment.stats)])
  allStats.forEach(stat => {
    const selectedValue = selectedEquipment.value.stats[stat] || 0
    const currentValue = currentEquipment.stats[stat] || 0
    const diff = selectedValue - currentValue
    comparison[stat] = {
      current: currentValue,
      selected: selectedValue,
      diff: diff,
      isPositive: diff > 0
    }
  })
  return comparison
})

const options = [
  { label: 'Tất cả phẩm giai', value: 'all' },
  { label: 'Thần Phẩm', value: 'divine' },
  { label: 'Tiên Phẩm', value: 'celestial' },
  { label: 'Huyền Phẩm', value: 'mystic' },
  { label: 'Linh Phẩm', value: 'spiritual' },
  { label: 'Phàm Phẩm', value: 'mortal' }
]
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>
          Túi Không Gian
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <n-card :bordered="false">
        <n-tabs type="line">
          <n-tab-pane name="equipment" tab="Pháp Bảo">
            <n-grid :cols="2" :x-gap="12" :y-gap="8">
              <n-grid-item v-for="(name, type) in equipmentTypes" :key="type">
                <n-card hoverable @click="showEquipmentList(type)">
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ name }}</span>
                      <n-button size="small" type="error" @click.stop="unequipItem(type)"
                        v-if="playerStore.equippedArtifacts[type]">
                        Tháo Xuống
                      </n-button>
                    </n-space>
                  </template>
                  <p v-if="playerStore.equippedArtifacts[type]">
                    {{ playerStore.equippedArtifacts[type].name }}
                  </p>
                  <p v-else>Chưa trang bị</p>
                  <template #footer>
                    <n-space justify="space-between">
                      <span>{{ name }}</span>
                      <n-button size="small" type="info"
                        @click.stop="showEquipmentDetails(playerStore.equippedArtifacts[type])"
                        v-if="playerStore.equippedArtifacts[type]">
                        Chi Tiết
                      </n-button>
                    </n-space>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>
          <n-tab-pane name="herbs" tab="Linh Thảo">
            <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedHerbs.length">
              <n-grid-item v-for="herb in groupedHerbs" :key="herb.id">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ herb.name }}({{ herb.count }})</span>
                    </n-space>
                  </template>
                  <p>{{ herb.description }}</p>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
          <n-tab-pane name="pills" tab="Đan Dược">
            <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedPills.length">
              <n-grid-item v-for="pill in groupedPills" :key="pill.id">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ pill.name }}({{ pill.count }})</span>
                      <n-button size="small" type="primary" @click="usePill(pill)">
                        Phục Dụng
                      </n-button>
                    </n-space>
                  </template>
                  <p>{{ pill.description }}</p>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
          <n-tab-pane name="formulas" tab="Đan Phương">
            <n-tabs type="segment">
              <n-tab-pane name="complete" tab="Đan Phương Hoàn Chỉnh">
                <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedFormulas.complete.length">
                  <n-grid-item v-for="formula in groupedFormulas.complete" :key="formula.id">
                    <n-card hoverable>
                      <template #header>
                        <n-space justify="space-between">
                          <span>{{ formula.name }}</span>
                          <n-space>
                            <n-tag type="success" size="small">Hoàn Chỉnh</n-tag>
                            <n-tag type="info" size="small">{{ pillGrades[formula.grade].name }}</n-tag>
                            <n-tag type="warning" size="small">{{ pillTypes[formula.type].name }}</n-tag>
                          </n-space>
                        </n-space>
                      </template>
                      <p>{{ formula.description }}</p>
                    </n-card>
                  </n-grid-item>
                </n-grid>
                <n-empty v-else />
              </n-tab-pane>
              <n-tab-pane name="incomplete" tab="Đan Phương Khiếm Khuyết">
                <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedFormulas.incomplete.length">
                  <n-grid-item v-for="formula in groupedFormulas.incomplete" :key="formula.id">
                    <n-card hoverable>
                      <template #header>
                        <n-space justify="space-between">
                          <span>{{ formula.name }}</span>
                          <n-space>
                            <n-tag type="warning" size="small">Khiếm Khuyết</n-tag>
                            <n-tag type="info" size="small">{{ pillGrades[formula.grade].name }}</n-tag>
                            <n-tag type="warning" size="small">{{ pillTypes[formula.type].name }}</n-tag>
                          </n-space>
                        </n-space>
                      </template>
                      <p>{{ formula.description }}</p>
                      <n-progress type="line"
                        :percentage="Number(((formula.fragments / formula.fragmentsNeeded) * 100).toFixed(2))"
                        :show-indicator="true" indicator-placement="inside">
                        Tiến độ thu thập: {{ formula.fragments }}/{{ formula.fragmentsNeeded }}
                      </n-progress>
                    </n-card>
                  </n-grid-item>
                </n-grid>
                <n-empty v-else />
              </n-tab-pane>
            </n-tabs>
          </n-tab-pane>
          <n-tab-pane name="pets" tab="Linh Thú">
            <n-space style="margin-bottom: 16px">
              <n-select v-model:value="selectedRarityToRelease" :options="options" placeholder="Chọn phẩm chất phóng sinh"
                style="width: 150px" />
              <n-button @click="showBatchReleaseConfirm = true"
                :disabled="!playerStore.items.filter(item => item.type === 'pet').length">Phóng Sinh Hàng Loạt</n-button>
            </n-space>
            <n-modal v-model:show="showBatchReleaseConfirm" preset="dialog" title="Xác Nhận Phóng Sinh Hàng Loạt" style="width: 600px">
              <p>
                Đạo hữu có chắc muốn phóng sinh tất cả Linh Thú phẩm chất {{ selectedRarityToRelease === 'all' ? 'tất cả' : petRarities[selectedRarityToRelease].name }} chưa xuất chiến không? Hành động này không thể hoàn tác.
              </p>
              <n-space justify="end" style="margin-top: 16px;">
                <n-button size="small" @click="showBatchReleaseConfirm = false">Hủy Bỏ</n-button>
                <n-button size="small" type="error" @click="batchReleasePets">Xác Nhận Phóng Sinh</n-button>
              </n-space>
            </n-modal>
            <n-pagination v-if="filteredPets.length > 12" v-model:page="currentPage" :page-size="pageSize"
              :item-count="filteredPets.length" @update:page-size="onPageSizeChange" :page-slot="7" />
            <n-grid v-if="displayPets.length" :cols="2" :x-gap="12" :y-gap="8" style="margin-top: 16px">
              <n-grid-item v-for="pet in displayPets" :key="pet.id">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ pet.name }}</span>
                      <n-button size="small" type="primary" @click="useItem(pet)">
                        {{ playerStore.activePet?.id === pet.id ? 'Thu Hồi' : 'Xuất Chiến' }}
                      </n-button>
                    </n-space>
                  </template>
                  <p>{{ pet.description }}</p>
                  <n-space vertical>
                    <n-tag :style="{ color: petRarities[pet.rarity].color }">
                      {{ petRarities[pet.rarity].name }}
                    </n-tag>
                    <n-space justify="space-between">
                      <n-text>Cảnh Giới: {{ pet.level || 1 }}</n-text>
                      <n-text>Tinh: {{ pet.star || 0 }}</n-text>
                      <n-button size="small" @click="showPetDetails(pet)">Chi Tiết</n-button>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-layout-content>
  </n-layout>
  <!-- Modal Chi Tiết Linh Thú -->
  <n-modal v-model:show="showPetModal" preset="dialog" title="Chi Tiết Linh Thú" style="width: 600px;">
    <template v-if="selectedPet">
      <n-descriptions bordered>
        <n-descriptions-item label="Tên">{{ selectedPet.name }}</n-descriptions-item>
        <n-descriptions-item label="Phẩm Chất">
          <n-tag
            :style="{ color: petRarities[selectedPet.rarity].color }">{{ petRarities[selectedPet.rarity].name }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Cảnh Giới">{{ selectedPet.level || 1 }}</n-descriptions-item>
        <n-descriptions-item label="Tinh">{{ selectedPet.star || 0 }}</n-descriptions-item>
        <n-descriptions-item label="Giai Đoạn">{{ Math.floor((selectedPet.star || 0) / 5) }} Giai</n-descriptions-item>
      </n-descriptions>
      <n-divider>Gia Tăng Thuộc Tính</n-divider>
      <n-descriptions bordered>
        <n-descriptions-item
          label="Gia Tăng Công Kích">+{{ (getPetBonus(selectedPet).attack * 100).toFixed(1) }}%</n-descriptions-item>
        <n-descriptions-item
          label="Gia Tăng Phòng Ngự">+{{ (getPetBonus(selectedPet).defense * 100).toFixed(1) }}%</n-descriptions-item>
        <n-descriptions-item
          label="Gia Tăng Sinh Lực">+{{ (getPetBonus(selectedPet).health * 100).toFixed(1) }}%</n-descriptions-item>
      </n-descriptions>
      <n-divider>Thuộc Tính Linh Thú</n-divider>
      <n-collapse>
        <n-collapse-item title="Mở Rộng" name="1">
          <n-divider>Thuộc Tính Cơ Bản</n-divider>
          <n-descriptions bordered :column="2">
            <n-descriptions-item label="Công Kích">{{ selectedPet.combatAttributes?.attack || 0 }}</n-descriptions-item>
            <n-descriptions-item label="Sinh Lực">{{ selectedPet.combatAttributes?.health || 0 }}</n-descriptions-item>
            <n-descriptions-item label="Phòng Ngự">{{ selectedPet.combatAttributes?.defense || 0 }}</n-descriptions-item>
            <n-descriptions-item label="Tốc Độ">{{ selectedPet.combatAttributes?.speed || 0 }}</n-descriptions-item>
          </n-descriptions>
          <n-divider>Thuộc Tính Chiến Đấu</n-divider>
          <n-descriptions bordered :column="3">
            <n-descriptions-item
              label="Tỷ Lệ Bạo Kích">{{ ((selectedPet.combatAttributes?.critRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item
              label="Tỷ Lệ Liên Kích">{{ ((selectedPet.combatAttributes?.comboRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item
              label="Tỷ Lệ Phản Kích">{{ ((selectedPet.combatAttributes?.counterRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item
              label="Tỷ Lệ Choáng">{{ ((selectedPet.combatAttributes?.stunRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item
              label="Tỷ Lệ Né Tránh">{{ ((selectedPet.combatAttributes?.dodgeRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item
              label="Tỷ Lệ Hút Máu">{{ ((selectedPet.combatAttributes?.vampireRate || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          </n-descriptions>
        <n-divider>Kháng Tính Chiến Đấu</n-divider>
        <n-descriptions bordered :column="3">
          <n-descriptions-item
            label="Kháng Bạo Kích">{{ ((selectedPet.combatAttributes?.critResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Kháng Liên Kích">{{ ((selectedPet.combatAttributes?.comboResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Kháng Phản Kích">{{ ((selectedPet.combatAttributes?.counterResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Kháng Choáng">{{ ((selectedPet.combatAttributes?.stunResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Kháng Né Tránh">{{ ((selectedPet.combatAttributes?.dodgeResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Kháng Hút Máu">{{ ((selectedPet.combatAttributes?.vampireResist || 0) * 100).toFixed(1) }}%</n-descriptions-item>
        </n-descriptions>
        <n-divider>Thuộc Tính Đặc Biệt</n-divider>
        <n-descriptions bordered :column="3">
          <n-descriptions-item
            label="Tăng Cường Hồi Phục">{{ ((selectedPet.combatAttributes?.healBoost || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Tăng Sát Thương Bạo Kích">{{ ((selectedPet.combatAttributes?.critDamageBoost || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Giảm Sát Thương Bạo Kích">{{ ((selectedPet.combatAttributes?.critDamageReduce || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Tăng Sát Thương Cuối Cùng">{{ ((selectedPet.combatAttributes?.finalDamageBoost || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Giảm Sát Thương Cuối Cùng">{{ ((selectedPet.combatAttributes?.finalDamageReduce || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Tăng Thuộc Tính Chiến Đấu">{{ ((selectedPet.combatAttributes?.combatBoost || 0) * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item
            label="Tăng Kháng Tính Chiến Đấu">{{ ((selectedPet.combatAttributes?.resistanceBoost || 0) * 100).toFixed(1) }}%</n-descriptions-item>
        </n-descriptions>
        </n-collapse-item>
      </n-collapse>
      <n-divider>Thao Tác</n-divider>
      <n-space vertical>
        <n-space justify="space-between">
          <span>Nâng Cấp (Tiêu hao {{ getUpgradeCost(selectedPet) }} / {{ playerStore.petEssence}} Tinh Hoa Linh Thú)</span>
          <n-button size="small" type="primary" @click="upgradePet(selectedPet)" :disabled="!canUpgrade(selectedPet)">
            Nâng Cấp
          </n-button>
        </n-space>
        <n-space justify="space-between">
          <span>Tiến Hóa (Cần Linh Thú cùng phẩm chất và tên)</span>
          <n-select v-model:value="selectedFoodPet" :options="getAvailableFoodPets(selectedPet)" placeholder="Chọn nguyên liệu tiến hóa"
            style="width: 200px" />
          <n-button size="small" type="warning" @click="evolvePet(selectedPet)" :disabled="!selectedFoodPet">
            Tiến Hóa
          </n-button>
        </n-space>
        <n-space justify="space-between">
          <span>Phóng Sinh (Không hoàn trả đạo cụ đã tiêu hao)</span>
          <n-button size="small" type="error" @click="confirmReleasePet(selectedPet)">
            Phóng Sinh
          </n-button>
          <n-modal v-model:show="showReleaseConfirm" preset="dialog" title="Phóng Sinh Linh Thú" style="width: 600px">
            <template v-if="petToRelease">
              <p>Đạo hữu có chắc muốn phóng sinh {{ petToRelease.name }} không? Hành động này không thể hoàn tác và không hoàn trả đạo cụ đã tiêu hao.</p>
              <n-space justify="end" style="margin-top: 16px;">
                <n-button size="small" @click="cancelReleasePet">Hủy Bỏ</n-button>
                <n-button size="small" type="error" @click="releasePet">Xác Nhận Phóng Sinh</n-button>
              </n-space>
            </template>
          </n-modal>
        </n-space>
      </n-space>
    </template>
  </n-modal>
  <!-- Modal danh sách Pháp Bảo -->
  <n-modal v-model:show="showEquipmentModal" preset="dialog" :title="`Danh sách ${equipmentTypes[selectedEquipmentType]}`"
    style="width: 800px;">
    <n-space vertical>
      <n-space justify="space-between">
        <n-select v-model:value="selectedQuality" :options="qualityOptions"
          style="width: 150px" />
        <n-button type="warning" :disabled="equipmentList.length === 0" @click="batchSellEquipments">Bán Hàng Loạt</n-button>
      </n-space>
      <n-pagination v-model:page="currentEquipmentPage" :page-size="equipmentPageSize"
        :item-count="filteredEquipmentList.length" v-if="equipmentList.length > 8"
        @update:page-size="onEquipmentPageSizeChange" :page-slot="7" />
      <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="equipmentList.length">
        <n-grid-item v-for="equipment in equipmentList" :key="equipment.id" @click="showEquipmentDetails(equipment)">
          <n-card hoverable>
            <template #header>
              <n-space justify="space-between">
                <span>{{ equipment.name }}</span>
                <n-button size="small" type="warning" @click.stop="sellEquipment(equipment)">Bán</n-button>
              </n-space>
            </template>
            <n-space vertical>
              <n-tag :style="{ color: equipment.qualityInfo.color }">
                {{ equipment.qualityInfo.name }}
              </n-tag>
              <n-text>Yêu cầu cảnh giới: {{ getRealmName(equipment.requiredRealm).name }}</n-text>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
      <n-empty description="Không có Pháp Bảo nào" v-else></n-empty>
    </n-space>
  </n-modal>
  <!-- Modal chi tiết Pháp Bảo -->
  <n-modal v-model:show="showEquipmentDetailModal" preset="dialog" :title="selectedEquipment?.name || 'Chi tiết Pháp Bảo'">
    <n-descriptions bordered>
      <n-descriptions-item label="Phẩm chất">
        <span :style="{ color: selectedEquipment?.qualityInfo.color }">
          {{ selectedEquipment?.qualityInfo.name }}
        </span>
      </n-descriptions-item>
      <n-descriptions-item label="Loại">
        {{ equipmentTypes[selectedEquipment?.type] }}
      </n-descriptions-item>
      <n-descriptions-item label="Cấp độ cường hóa">
        +{{ selectedEquipment?.enhanceLevel || 0 }}
      </n-descriptions-item>
      <template v-if="selectedEquipment?.stats">
        <n-descriptions-item v-for="(value, stat) in selectedEquipment.stats" :key="stat" :label="getStatName(stat)">
          {{ formatStatValue(stat, value) }}
        </n-descriptions-item>
      </template>
    </n-descriptions>
    <div class="stats-comparison"
      v-if="equipmentComparison && selectedEquipment?.id != playerStore.equippedArtifacts[selectedEquipment?.slot]?.id">
      <n-divider>So Sánh Thuộc Tính</n-divider>
      <n-table :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th>Thuộc tính</th>
            <th>Pháp Bảo hiện tại</th>
            <th>Pháp Bảo đã chọn</th>
            <th>Thay đổi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(comparison, stat) in equipmentComparison" :key="stat">
            <td>{{ getStatName(stat) }}</td>
            <td>{{ formatStatValue(stat, comparison.current) }}</td>
            <td>{{ formatStatValue(stat, comparison.selected) }}</td>
            <td>
              <n-gradient-text :type="comparison.isPositive ? 'success' : 'error'">
                {{ comparison.isPositive ? '+' : '' }}{{ formatStatValue(stat, comparison.diff) }}
              </n-gradient-text>
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <template #action>
      <n-space justify="space-between">
        <n-space>
          <n-button type="primary" @click="showEnhanceConfirm = true"
            :disabled="(selectedEquipment?.enhanceLevel || 0) >= 100">
            Cường Hóa
          </n-button>
          <n-button type="info" :disabled="playerStore.refinementStones === 0" @click="handleReforgeEquipment">
            Luyện Hóa
          </n-button>
        </n-space>
        <n-space>
          <n-button @click="equipItem(selectedEquipment)"
            :disabled="playerStore.level < selectedEquipment?.requiredRealm"
            v-if="selectedEquipment?.id != playerStore.equippedArtifacts[selectedEquipment?.slot]?.id">
            Trang Bị
          </n-button>
          <n-button @click="unequipItem(selectedEquipment?.slot)"
            :disabled="playerStore.level < selectedEquipment?.requiredRealm" v-else>
            Tháo Xuống
          </n-button>
          <n-button type="error" @click="sellEquipment(selectedEquipment)"
            v-if="selectedEquipment?.id != playerStore.equippedArtifacts[selectedEquipment?.slot]?.id">
            Bán
          </n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>
  <!-- Modal xác nhận cường hóa -->
  <n-modal v-model:show="showEnhanceConfirm" preset="dialog" title="Cường Hóa Pháp Bảo">
    <n-space vertical>
      <p>Đạo hữu có muốn tiêu hao {{ ((selectedEquipment?.enhanceLevel || 0) + 1) * 10 }} Cường Hóa Thạch để cường hóa Pháp Bảo?</p>
      <p>Số lượng Cường Hóa Thạch hiện có: {{ playerStore.reinforceStones }}</p>
    </n-space>
    <template #action>
      <n-space justify="end">
        <n-button @click="showEnhanceConfirm = false">Hủy Bỏ</n-button>
        <n-button type="primary" @click="handleEnhanceEquipment"
          :disabled="playerStore.reinforceStones < ((selectedEquipment?.enhanceLevel || 0) + 1) * 10">
          Xác Nhận Cường Hóa
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <!-- Modal xác nhận luyện hóa -->
  <n-modal v-model:show="showReforgeConfirm" preset="dialog" title="Xác Nhận Kết Quả Luyện Hóa">
    <template v-if="reforgeResult">
      <div class="reforge-compare">
        <div class="old-stats">
          <h3>Thuộc Tính Cũ</h3>
          <div v-for="(value, key) in reforgeResult.oldStats" :key="key">
            {{ getStatName(key) }}: {{ formatStatValue(key, value) }}
          </div>
        </div>
        <div class="new-stats">
          <h3>Thuộc Tính Mới</h3>
          <div v-for="(value, key) in reforgeResult.newStats" :key="key">
            {{ getStatName(key) }}: {{ formatStatValue(key, value) }}
          </div>
        </div>
      </div>
    </template>
    <template #action>
      <n-button type="primary" @click="confirmReforgeResult(true)">Xác Nhận Thuộc Tính Mới</n-button>
      <n-button @click="confirmReforgeResult(false)">Giữ Thuộc Tính Cũ</n-button>
    </template>
  </n-modal>
</template>
<style scoped>
.n-card {
  cursor: pointer;
}

.reforge-compare {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 16px 0;
}

.old-stats,
.new-stats {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
}

.old-stats h3,
.new-stats h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #666;
}
</style>

