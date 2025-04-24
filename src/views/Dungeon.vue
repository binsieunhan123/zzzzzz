<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import { getRealmName } from '../plugins/realm'
import { CombatManager, CombatEntity, generateEnemy, CombatType } from '../plugins/combat'
import { getRandomOptions } from '../plugins/dungeon'
import dungeonBuffs from '../plugins/dungeonBuffs'
import { useMessage } from 'naive-ui'
import LogPanel from '../components/LogPanel.vue'

const playerStore = usePlayerStore()
const message = useMessage()
const logRef = ref(null)
const playerAttacking = ref(false)
const playerHurt = ref(false)
const enemyAttacking = ref(false)
const enemyHurt = ref(false)
const infoShow = ref(false)
const infoType = ref('')

const floorData = computed(() => {
  switch (playerStore.dungeonDifficulty) {
    case 1:
      return playerStore.dungeonHighestFloor
    case 2:
      return playerStore.dungeonHighestFloor_2
    case 5:
      return playerStore.dungeonHighestFloor_5
    case 10:
      return playerStore.dungeonHighestFloor_10
    case 100:
      return playerStore.dungeonHighestFloor_100
    default:
      return playerStore.dungeonHighestFloor
  }
})

// Trạng thái bí cảnh
const dungeonState = ref({
  floor: floorData.value,
  inCombat: false,
  showingOptions: false,
  currentOptions: [],
  combatManager: null
})


// Nhật ký chiến đấu hiện tại
const combatLog = ref([])

// Lấy màu sắc dựa trên loại tùy chọn
const getOptionColor = (type) => {
  const types = {
    epic: {
      name: 'Thần thoại',
      color: '#e91e63'
    },
    rare: {
      name: 'Hiếm có',
      color: '#2196f3'
    },
    common: {
      name: 'Phàm phẩm',
      color: '#4caf50'
    }
  }
  return types[type]
}

// Tạo thực thể chiến đấu cho người chơi
const createPlayerEntity = () => {
  // Thuộc tính cơ bản
  const baseStats = {
    health: playerStore.baseAttributes.health,
    damage: playerStore.baseAttributes.attack,
    defense: playerStore.baseAttributes.defense,
    speed: playerStore.baseAttributes.speed,
    // Thuộc tính chiến đấu
    critRate: playerStore.combatAttributes.critRate,
    comboRate: playerStore.combatAttributes.comboRate,
    counterRate: playerStore.combatAttributes.counterRate,
    stunRate: playerStore.combatAttributes.stunRate,
    dodgeRate: playerStore.combatAttributes.dodgeRate,
    vampireRate: playerStore.combatAttributes.vampireRate,
    // Kháng tính chiến đấu
    critResist: playerStore.combatResistance.critResist,
    comboResist: playerStore.combatResistance.comboResist,
    counterResist: playerStore.combatResistance.counterResist,
    stunResist: playerStore.combatResistance.stunResist,
    dodgeResist: playerStore.combatResistance.dodgeResist,
    vampireResist: playerStore.combatResistance.vampireResist,
    // Thuộc tính đặc biệt
    healBoost: playerStore.specialAttributes.healBoost,
    critDamageBoost: playerStore.specialAttributes.critDamageBoost,
    critDamageReduce: playerStore.specialAttributes.critDamageReduce,
    finalDamageBoost: playerStore.specialAttributes.finalDamageBoost,
    finalDamageReduce: playerStore.specialAttributes.finalDamageReduce,
    combatBoost: playerStore.specialAttributes.combatBoost,
    resistanceBoost: playerStore.specialAttributes.resistanceBoost,
    // Thuộc tính khác
    spiritDamage: playerStore.spirit * 0.1,
    maxHealth: playerStore.baseAttributes.health
  }
  const entity = new CombatEntity(playerStore.name, playerStore.level, baseStats, playerStore.realm)
  // Áp dụng tất cả hiệu ứng tăng cường đang hoạt động
  const activeBuffs = dungeonBuffs.getActiveBuffs()
  activeBuffs.forEach(buff => {
    if (typeof buff.effect === 'function') {
      buff.effect(entity)
    }
  })
  return entity
}

// Bắt đầu bí cảnh mới
const startDungeon = () => {
  const startingFloor = floorData.value
  dungeonState.value = {
    floor: startingFloor,
    inCombat: false,
    showingOptions: false,
    currentOptions: [],
    combatManager: null
  }
  playerStore.dungeonTotalRuns++  // Tăng tổng số lần thám hiểm
  nextFloor()
}

// Tiến vào tầng tiếp theo
const nextFloor = () => {
  dungeonState.value = {
    ...dungeonState.value,
    floor: dungeonState.value.floor + 1
  }
  const floor = dungeonState.value.floor
  // Kiểm tra xem có cần hiển thị tùy chọn không
  if (floor === 1 || floor % 5 === 0) {
    const randRefres = Math.floor(Math.random() * 3) + 1 
    message.success(`Nhận được ${randRefres} lần làm mới`)
    refreshNumber.value = randRefres
    showOptions()
    return
  }
  startCombat()
}

// Hiển thị tùy chọn ngẫu nhiên
const showOptions = () => {
  dungeonState.value.showingOptions = true
  dungeonState.value.currentOptions = getRandomOptions(dungeonState.value.floor)
}

// Chọn tùy chọn
const selectOption = (option) => {
  dungeonBuffs.apply(playerStore, option)
  message.success(`Đã chọn: ${option.name}`)
  dungeonState.value.showingOptions = false
  dungeonState.value.currentOptions = []
  startCombat()
}

// Xử lý thất bại
const handleDefeat = () => {
  dungeonState.value.inCombat = false
  infoShow.value = false
  infoType.value = ''
  message.error(`Đã bị đánh bại ở tầng ${dungeonState.value.floor}...`)
  playerStore.dungeonDeathCount++
  // Xóa tất cả hiệu ứng tăng cường tạm thời
  dungeonBuffs.clear(playerStore)
  // Ghi lại tầng thất bại
  playerStore.dungeonLastFailedFloor = dungeonState.value.floor
  // Ngẫu nhiên rơi cảnh giới hoặc tu vi
  if (playerStore.dungeonDifficulty !== 100) {
    // Mất một lượng tu vi nhất định như một hình phạt
    const cultivationLossRate = Math.random() * 0.4 + 0.1 // Ngẫu nhiên từ 10% đến 50%
    const cultivationLoss = Math.floor(playerStore.cultivation * cultivationLossRate)
    playerStore.cultivation = Math.max(0, playerStore.cultivation - cultivationLoss)
    message.error(`Thất bại trong chiến đấu! Mất ${cultivationLoss} điểm tu vi.`)
  } else {
    // Rơi cảnh giới như một hình phạt
    const randomGradeLoss = Math.floor(Math.random() * 3) + 1 // Ngẫu nhiên mất 1-3 cảnh giới
    const playerLevel = Math.max(1, playerStore.level - randomGradeLoss) // Giảm cảnh giới
    playerStore.level = playerLevel
    playerStore.cultivation = 0; // Xóa toàn bộ linh lực
    playerStore.maxCultivation = getRealmName(playerLevel).maxCultivation // Giảm giá trị linh lực tối đa cần thiết
    message.error(`Thất bại trong chiến đấu! Rơi ${randomGradeLoss} cảnh giới.`)
  }
}

// Bắt đầu chiến đấu
const startCombat = () => {
  const floor = dungeonState.value.floor
  const isBossFloor = floor % 10 === 0
  const isEliteFloor = floor % 5 === 0
  const enemyType = isBossFloor ? CombatType.BOSS : isEliteFloor ? CombatType.ELITE : CombatType.NORMAL
  // Tạo thực thể chiến đấu cho người chơi và áp dụng tất cả hiệu ứng tăng cường
  const playerEntity = createPlayerEntity()
  // Tạo kẻ địch
  const enemy = generateEnemy(floor, enemyType, playerStore.dungeonDifficulty)
  // Tạo quản lý chiến đấu
  dungeonState.value.combatManager = new CombatManager(
    playerEntity,
    enemy,
    (log) => {
      if (logRef.value) {
        logRef.value.addLog(log)
      }
    }
  )
  dungeonState.value.inCombat = true
  dungeonState.value.combatManager.start() // Khởi tạo trạng thái chiến đấu
  autoCombat() // Bắt đầu tự động chiến đấu
}

// Tự động chiến đấu
const autoCombat = async () => {
  while (dungeonState.value.inCombat) {
    const result = dungeonState.value.combatManager.executeTurn()
    const getCombatLog = dungeonState.value.combatManager.getCombatLog()
    // Thêm hiệu ứng động
    if (result.attacker === dungeonState.value.combatManager.player) {
      playerAttacking.value = true
      enemyHurt.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      playerAttacking.value = false
      enemyHurt.value = false
    } else {
      enemyAttacking.value = true
      playerHurt.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      enemyAttacking.value = false
      playerHurt.value = false
    }
    if (!result) break
    // Cập nhật nhật ký chiến đấu
    getCombatLog.forEach(item => {
      logRef.value?.addLog('info', item)
    })
    // Kiểm tra xem chiến đấu đã kết thúc chưa
    if (result.state === 'victory') {
      handleVictory()
      break
    } else if (result.state === 'defeat') {
      handleDefeat()
      break
    }
    // Thêm độ trễ để hoạt ảnh chiến đấu mượt mà hơn
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Xử lý chiến thắng
const handleVictory = () => {
  dungeonState.value.inCombat = false
  message.success(`Đã đánh bại kẻ địch ở tầng ${dungeonState.value.floor}!`)
  // Cập nhật số liệu thống kê
  playerStore.dungeonTotalKills++
  if (dungeonState.value.floor % 10 === 0) {
    playerStore.dungeonBossKills++
  } else if (dungeonState.value.floor % 5 === 0) {
    // Tăng đá luyện hóa
    playerStore.refinementStones += playerStore.dungeonDifficulty
    playerStore.dungeonEliteKills++
    message.success(`Nhận được ${playerStore.dungeonDifficulty} viên đá luyện hóa`)
  }
  // Cập nhật kỷ lục tầng cao nhất
  if (dungeonState.value.floor > playerStore.dungeonHighestFloor) {
    playerStore.dungeonHighestFloor = dungeonState.value.floor
  }
  // Nhận phần thưởng
  const rewards = generateRewards()
  rewards.forEach(reward => {
    playerStore.spiritStones += reward.amount
    message.success(`Nhận được ${reward.amount} linh thạch!`)
    playerStore.dungeonTotalRewards++
  })
  // Tiến vào tầng tiếp theo
  nextFloor()
}

// Tạo phần thưởng
const generateRewards = () => {
  const rewards = []
  // Phần thưởng linh thạch
  const baseStones = 10 * dungeonState.value.floor * playerStore.dungeonDifficulty
  rewards.push({
    type: 'spirit_stones',
    amount: baseStones
  })
  return rewards
}

const infoCliclk = (type) => {
  infoShow.value = true
  infoType.value = type
}

const dungeonOptions = [
  {
    label: 'Dễ',
    value: 1
  },
  {
    label: 'Thường',
    value: 2
  },
  {
    label: 'Khó',
    value: 5
  },
  {
    label: 'Địa ngục',
    value: 10
  },
  {
    label: 'Thông thiên',
    value: 100
  }
]

const handleUpdateValue = (value, option) => {
  if (value === 100) {
    message.warning('Cảnh báo! Thất bại ở độ khó Thông thiên sẽ khiến bạn rơi cảnh giới')
  }
}
const refreshNumber = ref(3)
// Làm mới lựa chọn
const handleRefreshOptions = () => {
  showOptions()
  refreshNumber.value--
}

</script>

<template>
  <div class="dungeon-container">
    <n-card title="Khám Phá Bí Cảnh">
      <template #header-extra>
        <n-space>
          <n-select v-model:value="playerStore.dungeonDifficulty" @update:value="handleUpdateValue" placeholder="Chọn độ khó"
            :options="dungeonOptions" style="width: 120px"
            :disabled="dungeonState.inCombat || dungeonState.showingOptions" />
          <n-button type="primary" @click="startDungeon"
            :disabled="dungeonState.inCombat || dungeonState.showingOptions">
            Bắt Đầu Khám Phá
          </n-button>
        </n-space>
      </template>
      <n-space vertical>
        <!-- Hiển thị tầng -->
        <n-statistic label="Tầng hiện tại" :value="dungeonState.floor" />
        <!-- Giao diện lựa chọn -->
        <n-card v-if="dungeonState.showingOptions" title="Chọn Tăng Ích">
          <template #header-extra>
            <n-space>
              <n-button type="primary" @click="handleRefreshOptions" :disabled="refreshNumber === 0">
                Làm Mới Tăng Ích({{refreshNumber}})
              </n-button>
            </n-space>
          </template>
          <div class="option-cards">
            <div v-for="option in dungeonState.currentOptions" :key="option.id" class="option-card"
              :style="{ borderColor: getOptionColor(option.type).color }" @click="selectOption(option)">
              <div class="option-name">{{ option.name }}</div>
              <div class="option-description">{{ option.description }}</div>
              <div class="option-quality" :style="{ color: getOptionColor(option.type).color }">
                {{ getOptionColor(option.type).name }}
              </div>
            </div>
          </div>
        </n-card>
        <!-- Giao diện chiến đấu -->
        <template v-if="dungeonState.inCombat && dungeonState.combatManager">
          <n-card :bordered="false">
            <n-divider>{{ dungeonState.combatManager.round }} / {{ dungeonState.combatManager.maxRounds }} Hiệp</n-divider>
            <!-- Thêm cảnh chiến đấu -->
            <div class="combat-scene">
              <div class="character player" :class="{ 'attack': playerAttacking, 'hurt': playerHurt }">
                <div v-if="playerAttacking" class="attack-effect player-effect"></div>
                <n-button class="character-name" type="info" dashed @click="infoCliclk('player')">
                  {{ dungeonState.combatManager.player.name }}
                </n-button>
                <div class="character-avatar player-avatar">
                  {{ dungeonState.combatManager.player.name[0] }}
                </div>
                <div class="health-bar">
                  <div class="health-fill"
                    :style="{ width: `${(dungeonState.combatManager.player.currentHealth / dungeonState.combatManager.player.stats.maxHealth) * 100}%` }">
                  </div>
                </div>
              </div>
              <div class="character enemy" :class="{ 'attack': enemyAttacking, 'hurt': enemyHurt }">
                <div v-if="enemyAttacking" class="attack-effect enemy-effect"></div>
                <n-button class="character-name" type="error" dashed @click="infoCliclk('enemy')">
                  {{ dungeonState.combatManager.enemy.name }}
                </n-button>
                <div class="character-avatar enemy-avatar">
                  {{ dungeonState.combatManager.enemy.name[0] }}
                </div>
                <div class="health-bar">
                  <div class="health-fill"
                    :style="{ width: `${(dungeonState.combatManager.enemy.currentHealth / dungeonState.combatManager.enemy.stats.maxHealth) * 100}%` }">
                  </div>
                </div>
              </div>
            </div>
            <n-modal v-model:show="infoShow" preset="dialog"
              :title="`Thuộc tính của ${infoType == 'player' ? dungeonState.combatManager.player.name : dungeonState.combatManager.enemy.name }`">
              <n-card :bordered="false">
                <!-- Thuộc tính người chơi -->
                <template v-if="infoType == 'player'">
                  <n-divider>Thuộc Tính Cơ Bản</n-divider>
                  <n-descriptions bordered :column="2">
                    <n-descriptions-item label="Sinh Lực">
                      {{ dungeonState.combatManager.player.currentHealth.toFixed(1) }} /
                      {{ dungeonState.combatManager.player.stats.maxHealth.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Công Kích">
                      {{ dungeonState.combatManager.player.stats.damage.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Phòng Ngự">
                      {{ dungeonState.combatManager.player.stats.defense.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Tốc Độ">
                      {{ dungeonState.combatManager.player.stats.speed.toFixed(1) }}
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Thuộc Tính Chiến Đấu</n-divider>
                  <n-descriptions bordered :column="3">
                    <n-descriptions-item label="Tỷ Lệ Bạo Kích">
                      {{ (dungeonState.combatManager.player.stats.critRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Liên Kích">
                      {{ (dungeonState.combatManager.player.stats.comboRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Phản Kích">
                      {{ (dungeonState.combatManager.player.stats.counterRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Choáng">
                      {{ (dungeonState.combatManager.player.stats.stunRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Né Tránh">
                      {{ (dungeonState.combatManager.player.stats.dodgeRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Hút Máu">
                      {{ (dungeonState.combatManager.player.stats.vampireRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Kháng Tính Chiến Đấu</n-divider>
                  <n-descriptions bordered :column="3">
                    <n-descriptions-item label="Kháng Bạo Kích">
                      {{ (dungeonState.combatManager.player.stats.critResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Liên Kích">
                      {{ (dungeonState.combatManager.player.stats.comboResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Phản Kích">
                      {{ (dungeonState.combatManager.player.stats.counterResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Choáng">
                      {{ (dungeonState.combatManager.player.stats.stunResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Né Tránh">
                      {{ (dungeonState.combatManager.player.stats.dodgeResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Hút Máu">
                      {{ (dungeonState.combatManager.player.stats.vampireResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Thuộc Tính Đặc Biệt</n-divider>
                  <n-descriptions bordered :column="4">
                    <n-descriptions-item label="Tăng Cường Hồi Phục">
                      {{ (dungeonState.combatManager.player.stats.healBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Sát Thương Bạo Kích">
                      {{ (dungeonState.combatManager.player.stats.critDamageBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Giảm Sát Thương Bạo Kích">
                      {{ (dungeonState.combatManager.player.stats.critDamageReduce * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Sát Thương Cuối Cùng">
                      {{ (dungeonState.combatManager.player.stats.finalDamageBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Giảm Sát Thương Cuối Cùng">
                      {{ (dungeonState.combatManager.player.stats.finalDamageReduce * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Thuộc Tính Chiến Đấu">
                      {{ (dungeonState.combatManager.player.stats.combatBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Kháng Tính Chiến Đấu">
                      {{ (dungeonState.combatManager.player.stats.resistanceBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                </template>
                <!-- Thuộc tính Địch Thủ -->
                <template v-else>
                  <n-divider>Thuộc Tính Cơ Bản</n-divider>
                  <n-descriptions bordered :column="2">
                    <n-descriptions-item label="Sinh Lực">
                      {{ dungeonState.combatManager.enemy.currentHealth.toFixed(1) }} /
                      {{ dungeonState.combatManager.enemy.stats.maxHealth.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Công Kích">
                      {{ dungeonState.combatManager.enemy.stats.damage.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Phòng Ngự">
                      {{ dungeonState.combatManager.enemy.stats.defense.toFixed(1) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Tốc Độ">
                      {{ dungeonState.combatManager.enemy.stats.speed.toFixed(1) }}
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Thuộc Tính Chiến Đấu</n-divider>
                  <n-descriptions bordered :column="3">
                    <n-descriptions-item label="Tỷ Lệ Bạo Kích">
                      {{ (dungeonState.combatManager.enemy.stats.critRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Liên Kích">
                      {{ (dungeonState.combatManager.enemy.stats.comboRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Phản Kích">
                      {{ (dungeonState.combatManager.enemy.stats.counterRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Choáng">
                      {{ (dungeonState.combatManager.enemy.stats.stunRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Né Tránh">
                      {{ (dungeonState.combatManager.enemy.stats.dodgeRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tỷ Lệ Hút Máu">
                      {{ (dungeonState.combatManager.enemy.stats.vampireRate * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Kháng Tính Chiến Đấu</n-divider>
                  <n-descriptions bordered :column="3">
                    <n-descriptions-item label="Kháng Bạo Kích">
                      {{ (dungeonState.combatManager.enemy.stats.critResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Liên Kích">
                      {{ (dungeonState.combatManager.enemy.stats.comboResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Phản Kích">
                      {{ (dungeonState.combatManager.enemy.stats.counterResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Choáng">
                      {{ (dungeonState.combatManager.enemy.stats.stunResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Né Tránh">
                      {{ (dungeonState.combatManager.enemy.stats.dodgeResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Kháng Hút Máu">
                      {{ (dungeonState.combatManager.enemy.stats.vampireResist * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-divider>Thuộc Tính Đặc Biệt</n-divider>
                  <n-descriptions bordered :column="3">
                    <n-descriptions-item label="Tăng Cường Hồi Phục">
                      {{ (dungeonState.combatManager.enemy.stats.healBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Sát Thương Bạo Kích">
                      {{ (dungeonState.combatManager.enemy.stats.critDamageBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Giảm Sát Thương Bạo Kích">
                      {{ (dungeonState.combatManager.enemy.stats.critDamageReduce * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Sát Thương Cuối Cùng">
                      {{ (dungeonState.combatManager.enemy.stats.finalDamageBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Giảm Sát Thương Cuối Cùng">
                      {{ (dungeonState.combatManager.enemy.stats.finalDamageReduce * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Thuộc Tính Chiến Đấu">
                      {{ (dungeonState.combatManager.enemy.stats.combatBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="Tăng Kháng Tính Chiến Đấu">
                      {{ (dungeonState.combatManager.enemy.stats.resistanceBoost * 100).toFixed(1) }}%
                    </n-descriptions-item>
                  </n-descriptions>
                </template>
              </n-card>
            </n-modal>
            <!-- Nhật Ký Chiến Đấu -->
            <log-panel ref="logRef" :messages="combatLog" style="margin-top: 16px" />
          </n-card>
        </template>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.dungeon-container {
  margin: 0 auto;
}

.option-cards {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin: 0 auto;
}

.option-card {
  position: relative;
  padding: 20px;
  border: 2px solid;
  border-radius: 12px;
  background: var(--n-color);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  width: 33%;
}

.option-card:hover {
  transform: translateX(5px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1);
}

.option-name {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 12px;
  padding-right: 80px;
}

.option-description {
  flex-grow: 1;
  font-size: 1em;
  color: var(--n-text-color);
  line-height: 1.6;
  margin-bottom: 8px;
}

.option-quality {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 0.9em;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--n-color);
}

.combat-scene {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 200px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.character {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.character-avatar {
  font-size: 48px;
  margin: 10px 0;
}

.character-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.health-bar {
  width: 100px;
  height: 10px;
  background: #ff000033;
  border-radius: 5px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: #ff0000;
  transition: width 0.3s ease;
}

.character.attack {
  animation: attack 0.5s ease;
}

.character.hurt {
  animation: hurt 0.5s ease;
}

.character-avatar {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
  color: #fff;
}

.player-avatar {
  background: linear-gradient(135deg, #4caf50, #2196f3);
  border-radius: 12px;
}

.enemy-avatar {
  background: linear-gradient(135deg, #ff5722, #e91e63);
  clip-path: polygon(50% 0%, 100% 38%, 100% 100%, 0 100%, 0% 38%);
}

.attack-effect {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  pointer-events: none;
}

.player-effect {
  background: radial-gradient(circle, #4caf50, #2196f3);
  animation: player-attack-effect 0.5s ease-out;
  right: -10px;
}

.enemy-effect {
  background: radial-gradient(circle, #ff5722, #e91e63);
  animation: enemy-attack-effect 0.5s ease-out;
  left: -10px;
}

.enemy.attack {
  animation: enemy-attack 0.5s ease;
}

@keyframes player-attack-effect {
  0% {
    transform: scale(0.5) translateX(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5) translateX(200px);
    opacity: 0;
  }
}

@keyframes enemy-attack-effect {
  0% {
    transform: scale(0.5) translateX(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5) translateX(-200px);
    opacity: 0;
  }
}

@keyframes attack {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(20px) rotate(5deg);
  }
  50% {
    transform: translateX(40px) rotate(0deg);
  }
  75% {
    transform: translateX(20px) rotate(-5deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}

@keyframes hurt {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes enemy-attack {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-20px) rotate(-5deg);
  }
  50% {
    transform: translateX(-40px) rotate(0deg);
  }
  75% {
    transform: translateX(-20px) rotate(5deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
</style>