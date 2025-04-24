<script setup>
import { usePlayerStore } from '../stores/player'
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { Help, HeartOutline, SettingsOutline } from '@vicons/ionicons5'
import SpineAnimation from '../components/SpineAnimation.vue'
import spineLoader from '../plugins/spineLoader'

const playerStore = usePlayerStore()
const message = useMessage()

// Loại rút thẻ
const gachaType = ref('all') // 'equipment'、'pet' hoặc 'all'
// Trạng thái hoạt ảnh rút thẻ
const isShaking = ref(false)
const isOpening = ref(false)
const showResult = ref(false)
const gachaResult = ref(null)
const showProbabilityInfo = ref(false)
const isDrawing = ref(false)

// Liên quan đến cửa sổ kết quả
const currentPage = ref(1)
const pageSize = ref(12)
const selectedQuality = ref('all') // Phẩm chất trang bị được chọn
const selectedRarity = ref('all') // Phẩm chất linh thú được chọn
const autoReleasedCount = ref(0) // Số lần tự động phóng sinh linh thú
const autoSoldIncome = ref(0) // Số đá cường hóa nhận được từ việc tự động bán trang bị
const autoSoldCount = ref(0) // Số lượng trang bị đã tự động bán
const showAutoSettings = ref(false) // Công tắc cài đặt tự động
const showWishlistSettings = ref(false) // Cửa sổ danh sách ước nguyện

// Cấu hình tăng tỷ lệ danh sách ước nguyện
const wishlistBonus = {
  equipment: (quality) => Math.min(1.0, 0.2 / getEquipProbabilities[quality]),
  pet: (rarity) => Math.min(1.0, 0.2 / petRarities[rarity].probability)
}

// Phẩm chất trang bị
const equipmentQualities = {
  common: { name: 'Phàm Phẩm', color: '#9e9e9e', statMod: 1.0, maxStatMod: 1.5 },
  uncommon: { name: 'Hạ Phẩm', color: '#4caf50', statMod: 1.2, maxStatMod: 2.0 },
  rare: { name: 'Trung Phẩm', color: '#2196f3', statMod: 1.5, maxStatMod: 2.5 },
  epic: { name: 'Thượng Phẩm', color: '#9c27b0', statMod: 2.0, maxStatMod: 3.0 },
  legendary: { name: 'Cực Phẩm', color: '#ff9800', statMod: 2.5, maxStatMod: 3.5 },
  mythic: { name: 'Tiên Phẩm', color: '#e91e63', statMod: 3.0, maxStatMod: 4.0 }
}

// Loại trang bị
const equipmentTypes = {
  weapon: { name: 'Vũ Khí', slot: 'weapon', prefixes: ['Cửu Thiên', 'Thái Hư', 'Hỗn Độn', 'Huyền Thiên', 'Tử Tiêu', 'Thanh Minh', 'Xích Diễm', 'U Minh'] },
  head: { name: 'Đầu', slot: 'head', prefixes: ['Thiên Linh', 'Huyền Minh', 'Tử Kim', 'Thanh Ngọc', 'Xích Hà', 'U Nguyệt', 'Tinh Thần', 'Vân Tiêu'] },
  body: { name: 'Áo', slot: 'body', prefixes: ['Cửu Tiêu', 'Thái Tố', 'Hỗn Nguyên', 'Huyền Dương', 'Tử Vi', 'Thanh Long', 'Xích Phượng', 'U Minh'] },
  legs: { name: 'Quần', slot: 'legs', prefixes: ['Thiên Cang', 'Huyền Vũ', 'Tử Điện', 'Thanh Vân', 'Xích Dương', 'U Linh', 'Tinh Quang', 'Vân Vụ'] },
  feet: { name: 'Giày', slot: 'feet', prefixes: ['Thiên Hành', 'Huyền Phong', 'Tử Hà', 'Thanh Liên', 'Xích Diễm', 'U Ảnh', 'Tinh Bộ', 'Vân Tung'] },
  shoulder: { name: 'Vai', slot: 'shoulder', prefixes: ['Thiên Hộ', 'Huyền Giáp', 'Tử Lôi', 'Thanh Phong', 'Xích Vũ', 'U Lam', 'Tinh Mang', 'Vân Giáp'] },
  hands: { name: 'Găng tay', slot: 'hands', prefixes: ['Thiên La', 'Huyền Ngọc', 'Tử Tinh', 'Thanh Cương', 'Xích Kim', 'U Ngân', 'Tinh Thiết', 'Vân Văn'] },
  wrist: { name: 'Hộ Cổ Tay', slot: 'wrist', prefixes: ['Thiên Tuyệt', 'Huyền Thiết', 'Tử Ngọc', 'Thanh Thạch', 'Xích Đồng', 'U Cương', 'Tinh Tinh', 'Vân Sa'] },
  necklace: { name: 'Dây Chuyền', slot: 'necklace', prefixes: ['Thiên Châu', 'Huyền Thánh', 'Tử Linh', 'Thanh Hồn', 'Xích Tâm', 'U Phách', 'Tinh Hồn', 'Vân Châu'] },
  ring1: { name: 'Nhẫn 1', slot: 'ring1', prefixes: ['Thiên Mệnh', 'Huyền Mệnh', 'Tử Mệnh', 'Thanh Mệnh', 'Xích Mệnh', 'U Mệnh', 'Tinh Mệnh', 'Vân Mệnh'] },
  ring2: { name: 'Nhẫn 2', slot: 'ring2', prefixes: ['Thiên Đạo', 'Huyền Đạo', 'Tử Đạo', 'Thanh Đạo', 'Xích Đạo', 'U Đạo', 'Tinh Đạo', 'Vân Đạo'] },
  belt: { name: 'Thắt Lưng', slot: 'belt', prefixes: ['Thiên Hệ', 'Huyền Hệ', 'Tử Hệ', 'Thanh Hệ', 'Xích Hệ', 'U Hệ', 'Tinh Hệ', 'Vân Hệ'] },
  artifact: { name: 'Pháp Bảo', slot: 'artifact', prefixes: ['Thiên Bảo', 'Huyền Bảo', 'Tử Bảo', 'Thanh Bảo', 'Xích Bảo', 'U Bảo', 'Tinh Bảo', 'Vân Bảo'] }
}

const equipmentTypes2 = [
  'weapon',
  'head',
  'body',
  'legs',
  'feet',
  'shoulder',
  'hands',
  'wrist',
  'necklace',
  'ring1',
  'ring2',
  'belt',
  'artifact'
]

// Tạo trang bị ngẫu nhiên
const generateEquipment = (level, type = null, quality = null) => {
  // Chọn ngẫu nhiên loại trang bị
  if (!type) {
    const types = Object.keys(equipmentTypes)
    type = types[Math.floor(Math.random() * types.length)]
  }
  // Chọn ngẫu nhiên phẩm chất, sử dụng xác suất cố định
  if (!quality) {
    const roll = Math.random()
    if (roll < 0.35) quality = 'common'
    else if (roll < 0.65) quality = 'uncommon'
    else if (roll < 0.82) quality = 'rare'
    else if (roll < 0.93) quality = 'epic'
    else if (roll < 0.98) quality = 'legendary'
    else quality = 'mythic'
  }
  // Tạo ngẫu nhiên cấp độ trang bị (từ 1 đến cấp độ hiện tại của người chơi)
  const randomLevel = Math.floor(Math.random() * level) + 1
  // Tính toán thuộc tính cơ bản
  const baseStats = {}
  const qualityMod = equipmentQualities[quality].statMod
  const levelMod = 1 + (randomLevel * 0.1)
  Object.entries(equipmentBaseStats[type]).forEach(([stat, config]) => {
    const base = config.min + Math.random() * (config.max - config.min)
    const value = base * qualityMod * levelMod
    // Xử lý đặc biệt cho thuộc tính phần trăm
    if (['critRate', 'critDamageBoost', 'dodgeRate', 'vampireRate', 'finalDamageBoost', 'finalDamageReduce'].includes(stat)) {
      baseStats[stat] = Math.round(value * 1) / 100 // Giữ hai chữ số thập phân
    } else {
      baseStats[stat] = Math.round(value)
    }
  })
  return {
    id: Date.now() + Math.random(),
    name: generateEquipmentName(type, quality),
    type,  // Đảm bảo thiết lập thuộc tính type chính xác
    slot: type,  // Thêm thuộc tính slot, dùng cho hệ thống trang bị
    quality,
    level: randomLevel,
    requiredRealm: randomLevel,
    stats: baseStats,
    equipType: type,
    qualityInfo: equipmentQualities[quality]
  }
}
// Tạo tên trang bị
const generateEquipmentName = (type, quality) => {
  const typeInfo = equipmentTypes[type]
  const prefix = typeInfo.prefixes[Math.floor(Math.random() * typeInfo.prefixes.length)]
  const suffixes = ['', '·Chân', '·Cực', '·Đạo', '·Thiên', '·Tiên', '·Thánh', '·Thần']
  const suffix = quality === 'mythic' ? suffixes[7] :
    quality === 'legendary' ? suffixes[6] :
      quality === 'epic' ? suffixes[5] :
        quality === 'rare' ? suffixes[4] :
          quality === 'uncommon' ? suffixes[3] :
            suffixes[0]
  return `${prefix}${typeInfo.name}${suffix}`
}

// Thuộc tính cơ bản của trang bị
const equipmentBaseStats = {
  weapon: {
    attack: { name: 'Công kích', min: 10, max: 20 },
    critRate: { name: 'Tỷ lệ bạo kích', min: 0.05, max: 0.1 },
    critDamageBoost: { name: 'Sát thương bạo kích', min: 0.1, max: 0.3 }
  },
  head: {
    defense: { name: 'Phòng ngự', min: 5, max: 10 },
    health: { name: 'Sinh lực', min: 50, max: 100 },
    stunResist: { name: 'Kháng choáng', min: 0.05, max: 0.1 }
  },
  body: {
    defense: { name: 'Phòng ngự', min: 8, max: 15 },
    health: { name: 'Sinh lực', min: 80, max: 150 },
    finalDamageReduce: { name: 'Giảm sát thương cuối cùng', min: 0.05, max: 0.1 }
  },
  legs: {
    defense: { name: 'Phòng ngự', min: 6, max: 12 },
    speed: { name: 'Tốc độ', min: 5, max: 10 },
    dodgeRate: { name: 'Tỷ lệ né tránh', min: 0.05, max: 0.1 }
  },
  feet: {
    defense: { name: 'Phòng ngự', min: 4, max: 8 },
    speed: { name: 'Tốc độ', min: 8, max: 15 },
    dodgeRate: { name: 'Tỷ lệ né tránh', min: 0.05, max: 0.1 }
  },
  shoulder: {
    defense: { name: 'Phòng ngự', min: 5, max: 10 },
    health: { name: 'Sinh lực', min: 40, max: 80 },
    counterRate: { name: 'Tỷ lệ phản kích', min: 0.05, max: 0.1 }
  },
  hands: {
    attack: { name: 'Công kích', min: 5, max: 10 },
    critRate: { name: 'Tỷ lệ bạo kích', min: 0.03, max: 0.08 },
    comboRate: { name: 'Tỷ lệ liên kích', min: 0.05, max: 0.1 }
  },
  wrist: {
    defense: { name: 'Phòng ngự', min: 3, max: 8 },
    counterRate: { name: 'Tỷ lệ phản kích', min: 0.05, max: 0.1 },
    vampireRate: { name: 'Tỷ lệ hút máu', min: 0.05, max: 0.1 }
  },
  necklace: {
    health: { name: 'Sinh lực', min: 60, max: 120 },
    healBoost: { name: 'Tăng cường hồi phục', min: 0.1, max: 0.2 },
    spiritRate: { name: 'Thu thập linh lực', min: 0.1, max: 0.2 }
  },
  ring1: {
    attack: { name: 'Công kích', min: 5, max: 10 },
    critDamageBoost: { name: 'Sát thương bạo kích', min: 0.1, max: 0.2 },
    finalDamageBoost: { name: 'Tăng sát thương cuối cùng', min: 0.05, max: 0.1 }
  },
  ring2: {
    defense: { name: 'Phòng ngự', min: 5, max: 10 },
    critDamageReduce: { name: 'Giảm sát thương bạo kích', min: 0.1, max: 0.2 },
    resistanceBoost: { name: 'Tăng kháng tính', min: 0.05, max: 0.1 }
  },
  belt: {
    health: { name: 'Sinh lực', min: 40, max: 80 },
    defense: { name: 'Phòng ngự', min: 4, max: 8 },
    combatBoost: { name: 'Thuộc tính chiến đấu', min: 0.05, max: 0.1 }
  },
  artifact: {
    attack: { name: 'Lực công kích', min: 0.1, max: 0.3 },
    critRate: { name: 'Tỷ lệ bạo kích', min: 0.1, max: 0.3 },
    comboRate: { name: 'Tỷ lệ liên kích', min: 0.1, max: 0.3 }
  }
}

// Cấu hình phẩm chất linh thú
const petRarities = {
  divine: {
    name: 'Thần phẩm',
    color: '#FF0000',
    probability: 0.002,
    essenceBonus: 50
  },
  celestial: {
    name: 'Tiên phẩm',
    color: '#FFD700',
    probability: 0.0581,
    essenceBonus: 30
  },
  mystic: {
    name: 'Huyền phẩm',
    color: '#9932CC',
    probability: 0.1601,
    essenceBonus: 20
  },
  spiritual: {
    name: 'Linh phẩm',
    color: '#1E90FF',
    probability: 0.2801,
    essenceBonus: 10
  },
  mortal: {
    name: 'Phàm phẩm',
    color: '#32CD32',
    probability: 0.4997,
    essenceBonus: 5
  }
}

// Cấu hình hồ linh thú
const petPool = {
  divine: [
    { name: 'Huyền Vũ', description: 'Thần thú bảo hộ phương Bắc' },
    { name: 'Bạch Hổ', description: 'Thần thú bảo hộ phương Tây' },
    { name: 'Chu Tước', description: 'Thần thú bảo hộ phương Nam' },
    { name: 'Thanh Long', description: 'Thần thú bảo hộ phương Đông' },
    { name: 'Ứng Long', description: 'Thần long thượng cổ, chưởng quản phong vũ' },
    { name: 'Kỳ Lân', description: 'Thụy thú cát tường, thông hiểu vạn vật' },
    { name: 'Đào Thải', description: 'Thú tham lam, thôn phệ vạn vật, tượng trưng cho dục vọng vô tận' },
    { name: 'Cùng Kỳ', description: 'Thú tà ác, bội tín phản nghĩa, tượng trưng cho hỗn loạn và phản bội' },
    { name: 'Đào Ngột', description: 'Thú hung bạo, ngoan cố bất hóa, tượng trưng cho dã tính không thể thuần phục' },
    { name: 'Hỗn Độn', description: 'Thú vô tự, vô hình vô tướng, tượng trưng cho hỗn độn nguyên thủy' }
  ],
  celestial: [
    { name: 'Tù Ngưu', description: 'Trưởng tử của Long, ưa thích âm nhạc, thường đứng trên đầu đàn' },
    { name: 'Nhai Tí', description: 'Thứ tử của Long, tính cách cương liệt, hiếu sát hiếu đấu, thường khắc trên đao kiếm' },
    { name: 'Trào Phong', description: 'Tam tử của Long, hình thú, thích mạo hiểm, thường đứng ở góc điện' },
    { name: 'Bồ Lao', description: 'Tứ tử của Long, hình như rồng nhưng nhỏ, tính thích kêu, thường đúc trên chuông' },
    { name: 'Toàn Cán', description: 'Ngũ tử của Long, hình như sư tử, thích tĩnh ưa ngồi, thường đứng trên lư hương' },
    { name: 'Bá Hạ', description: 'Lục tử của Long, hình như rùa, lực đại vô cùng, thường gánh bia đá' },
    { name: 'Tị Cán', description: 'Thất tử của Long, hình như hổ, minh biện thị phi, thường đứng ở cửa ngục' },
    { name: 'Phụ Nghê', description: 'Bát tử của Long, hình như rồng, nhã thích thi văn, thường quấn trên đỉnh bia' },
    { name: 'Si Vẫn', description: 'Cửu tử của Long, hình như cá, có thể nuốt lửa, thường đứng trên nóc nhà' }
  ],
  mystic: [
    { name: 'Phượng Hoàng Hỏa', description: 'Điểu bất tử vĩnh hằng tắm lửa tái sinh' },
    { name: 'Lôi Ưng', description: 'Mãnh cầm của sấm sét' },
    { name: 'Băng Lang', description: 'Bá chủ của băng nguyên' },
    { name: 'Nham Quy', description: 'Thủ hộ giả bất khả xâm phạm' }
  ],
  spiritual: [
    { name: 'Huyền Quy', description: 'Linh thú thủy hệ thiện phòng ngự' },
    { name: 'Phong Chuẩn', description: 'Linh thú phi hành tốc độ cực nhanh' },
    { name: 'Địa Giáp', description: 'Thủ hộ giả kiên cố của đại địa' },
    { name: 'Vân Báo', description: 'Thợ săn mẫn tiệp' }
  ],
  mortal: [
    { name: 'Linh Miêu', description: 'Linh thú nhỏ mẫn tiệp' },
    { name: 'Huyễn Điệp', description: 'Linh thú bướm xinh đẹp' },
    { name: 'Hỏa Thử', description: 'Linh thú gặm nhấm hoạt bát' },
    { name: 'Thảo Thố', description: 'Linh thú thỏ ôn thuận' }
  ]
}

const getRarityMultiplier = (rarity) => {
  const multipliers = {
    divine: { base: 5, percent: 2 },
    celestial: { base: 4, percent: 1.8 },
    mystic: { base: 3, percent: 1.6 },
    spiritual: { base: 2, percent: 1.4 },
    mortal: { base: 1, percent: 1 }
  }
  return multipliers[rarity] || multipliers.mortal
}

const generateRandomValue = (min, max, isPercentage = false) => {
  const value = min + Math.random() * (max - min)
  return isPercentage ? Math.min(1, Math.round(value * 100) / 100) : Math.round(value)
}

const combatAttributes = (rarity) => {
  const multiplier = getRarityMultiplier(rarity)
  // Cấu hình thuộc tính cơ bản
  const baseStats = {
    // Thuộc tính cơ bản
    attack: { min: 10, max: 15, useBase: true },
    health: { min: 100, max: 120, useBase: true },
    defense: { min: 5, max: 8, useBase: true },
    speed: { min: 10, max: 15, useBase: true, multiplier: 0.6 },
    // Thuộc tính chiến đấu
    critRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ bạo kích
    comboRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ liên kích
    counterRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ phản kích
    stunRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ choáng
    dodgeRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ né tránh
    vampireRate: { min: 0.05, max: 0.1, isPercentage: true }, // Tỷ lệ hút máu
    // Kháng tính chiến đấu
    critResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng bạo kích
    comboResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng liên kích
    counterResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng phản kích
    stunResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng choáng
    dodgeResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng né tránh
    vampireResist: { min: 0.05, max: 0.1, isPercentage: true }, // Kháng hút máu
    // Thuộc tính đặc biệt
    healBoost: { min: 0.05, max: 0.1, isPercentage: true }, // Tăng cường hồi phục
    critDamageBoost: { min: 0.05, max: 0.1, isPercentage: true }, // Tăng sát thương bạo kích
    critDamageReduce: { min: 0.05, max: 0.1, isPercentage: true }, // Giảm sát thương bạo kích
    finalDamageBoost: { min: 0.05, max: 0.1, isPercentage: true }, // Tăng sát thương cuối cùng
    finalDamageReduce: { min: 0.05, max: 0.1, isPercentage: true }, // Giảm sát thương cuối cùng
    combatBoost: { min: 0.05, max: 0.1, isPercentage: true }, // Tăng thuộc tính chiến đấu
    resistanceBoost: { min: 0.05, max: 0.1, isPercentage: true } // Tăng kháng tính chiến đấu
  }
  const attributes = {}
  // Tính toán giá trị cho mỗi thuộc tính
  Object.entries(baseStats).forEach(([key, config]) => {
    if (config.isPercentage) {
      // Thuộc tính phần trăm sử dụng hệ số percent
      attributes[key] = generateRandomValue(
        config.min * multiplier.percent,
        config.max * multiplier.percent,
        true
      )
    } else {
      // Thuộc tính cơ bản sử dụng hệ số base
      const baseMultiplier = config.useBase ? multiplier.base : multiplier.percent
      const finalMultiplier = config.multiplier ? baseMultiplier * config.multiplier : baseMultiplier
      attributes[key] = generateRandomValue(
        config.min * finalMultiplier,
        config.max * finalMultiplier
      )
    }
  })
  return attributes
}

// Điều chỉnh xác suất phẩm chất trang bị theo cảnh giới
const getEquipProbabilities = {
  common: 0.50, // Phàm Phẩm 50%
  uncommon: 0.30, // Hạ Phẩm 30%
  rare: 0.12, // Trung Phẩm 12%
  epic: 0.05, // Thượng Phẩm 5%
  legendary: 0.02, // Cực Phẩm 2%
  mythic: 0.01 // Tiên Phẩm 1%
}

// Điều chỉnh xác suất trang bị theo danh sách ước nguyện
const getAdjustedEquipProbabilities = () => {
  const baseProbs = { ...getEquipProbabilities }
  if (playerStore.wishlistEnabled && playerStore.selectedWishEquipQuality) {
    const quality = playerStore.selectedWishEquipQuality
    const bonus = wishlistBonus.equipment(quality)
    // Tăng xác suất cho phẩm chất được chọn
    baseProbs[quality] *= (1 + bonus)
    // Giảm tỷ lệ các phẩm chất khác theo tỷ lệ
    const totalOtherProb = Object.entries(baseProbs)
      .filter(([q]) => q !== quality)
      .reduce((sum, [, prob]) => sum + prob, 0)
    const reductionFactor = (1 - baseProbs[quality]) / totalOtherProb
    Object.keys(baseProbs).forEach(q => {
      if (q !== quality) {
        baseProbs[q] *= reductionFactor
      }
    })
  }
  return baseProbs
}

// Điều chỉnh xác suất linh thú theo danh sách ước nguyện
const getAdjustedPetProbabilities = () => {
  const baseProbs = {}
  Object.entries(petRarities).forEach(([rarity, config]) => {
    baseProbs[rarity] = config.probability
  })

  if (playerStore.wishlistEnabled && playerStore.selectedWishPetRarity) {
    const rarity = playerStore.selectedWishPetRarity
    const bonus = wishlistBonus.pet(rarity)
    // Tăng xác suất cho phẩm chất được chọn
    baseProbs[rarity] *= (1 + bonus)
    // Giảm tỷ lệ các phẩm chất khác theo tỷ lệ
    const totalOtherProb = Object.entries(baseProbs)
      .filter(([r]) => r !== rarity)
      .reduce((sum, [, prob]) => sum + prob, 0)
    const reductionFactor = (1 - baseProbs[rarity]) / totalOtherProb
    Object.keys(baseProbs).forEach(r => {
      if (r !== rarity) {
        baseProbs[r] *= reductionFactor
      }
    })
  }
  return baseProbs
}

// Hàm rút một trang bị đơn lẻ
const drawSingleEquip = () => {
  const random = Math.random()
  let accumulatedProb = 0
  const currentProbs = getAdjustedEquipProbabilities()
  for (const [quality, probability] of Object.entries(currentProbs)) {
    accumulatedProb += probability
    if (random <= accumulatedProb) {
      const types = Object.keys(equipmentTypes)
      const type = types[Math.floor(Math.random() * types.length)]
      return generateEquipment(playerStore.level || 1, type, quality)
    }
  }
  return generateEquipment(playerStore.level || 1, null, 'common')
}

// Hàm rút một linh thú đơn lẻ
const drawSinglePet = () => {
  const random = Math.random()
  let accumulatedProb = 0
  const currentProbs = getAdjustedPetProbabilities()
  for (const [rarity, probability] of Object.entries(currentProbs)) {
    accumulatedProb += probability
    if (random <= accumulatedProb) {
      const pool = petPool[rarity]
      const pet = pool[Math.floor(Math.random() * pool.length)]
      const upgradeItemCount = {
        divine: 5, // Thần Thú
        celestial: 4, // Thiên Thú
        mystic: 3, // Huyền Thú
        spiritual: 2, // Linh Thú
        mortal: 1 // Phàm Thú
      }
      return {
        ...pet,
        rarity,
        type: 'pet',
        quality: {
          strength: Math.floor(Math.random() * 10) + 1,
          agility: Math.floor(Math.random() * 10) + 1,
          intelligence: Math.floor(Math.random() * 10) + 1,
          constitution: Math.floor(Math.random() * 10) + 1
        },
        power: 0,
        experience: 0,
        maxExperience: 100,
        level: 1,
        star: 0,
        upgradeItems: upgradeItemCount[rarity] || 1,
        combatAttributes: combatAttributes(rarity),
      }
    }
  }
  return null
}

// Cấu hình xác suất cho hồn nguyên tổng hợp
const getAllPoolProbabilities = () => {
  const equipProbs = getEquipProbabilities
  const totalEquipProb = 0.5 // Trang bị chiếm 50% xác suất
  const totalPetProb = 0.5 // Linh thú chiếm 50% xác suất
  // Điều chỉnh xác suất trang bị
  const adjustedEquipProbs = {}
  Object.entries(equipProbs).forEach(([quality, prob]) => {
    adjustedEquipProbs[quality] = prob * totalEquipProb
  })
  // Điều chỉnh xác suất linh thú
  const adjustedPetProbs = {}
  Object.entries(petRarities).forEach(([rarity, config]) => {
    adjustedPetProbs[rarity] = config.probability * totalPetProb
  })
  return {
    equipment: adjustedEquipProbs,
    pet: adjustedPetProbs
  }
}

// Rút từ hồn nguyên tổng hợp
const drawFromAllPool = () => {
  const random = Math.random()
  const probs = getAllPoolProbabilities(playerStore.level || 1)
  // Quyết định xem rút trang bị hay linh thú
  if (random < 0.5) {
    // Rút trang bị
    let accumulatedProb = 0
    for (const [quality, probability] of Object.entries(probs.equipment)) {
      accumulatedProb += probability
      if (random * 2 <= accumulatedProb) {
        const types = Object.keys(equipmentTypes)
        const type = types[Math.floor(Math.random() * types.length)]
        return {
          ...generateEquipment(playerStore.level || 1, type, quality),
          type,
          equipType: type
        }
      }
    }
    // Nếu không trúng xác suất nào, trả về trang bị phẩm chất thấp nhất
    const types = Object.keys(equipmentTypes)
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      ...generateEquipment(playerStore.level || 1, type, 'common'),
      type,
      equipType: type
    }
  } else {
    // Rút linh thú
    let accumulatedProb = 0
    for (const [rarity, config] of Object.entries(petRarities)) {
      accumulatedProb += config.probability
      if ((random - 0.5) * 2 <= accumulatedProb) {
        const pool = petPool[rarity]
        const pet = pool[Math.floor(Math.random() * pool.length)]
        const upgradeItemCount = {
          divine: 5,
          celestial: 4,
          mystic: 3,
          spiritual: 2,
          mortal: 1
        }
        return {
          ...pet,
          rarity,
          type: 'pet',
          quality: {
            strength: Math.floor(Math.random() * 10) + 1,
            agility: Math.floor(Math.random() * 10) + 1,
            intelligence: Math.floor(Math.random() * 10) + 1,
            constitution: Math.floor(Math.random() * 10) + 1
          },
          power: 0,
          experience: 0,
          maxExperience: 100,
          level: 1,
          star: 0,
          upgradeItems: upgradeItemCount[rarity] || 1,
          combatAttributes: combatAttributes(rarity),
        }
      }
    }
    // Nếu không trúng xác suất nào, trả về linh thú phẩm chất thấp nhất
    const pool = petPool.mortal
    const pet = pool[Math.floor(Math.random() * pool.length)]
    return {
      ...pet,
      rarity: 'mortal',
      type: 'pet',
      quality: {
        strength: Math.floor(Math.random() * 10) + 1,
        agility: Math.floor(Math.random() * 10) + 1,
        intelligence: Math.floor(Math.random() * 10) + 1,
        constitution: Math.floor(Math.random() * 10) + 1
      },
      power: 0,
      experience: 0,
      maxExperience: 100,
      level: 1,
      star: 0,
      upgradeItems: 1,
      combatAttributes: combatAttributes('mortal')
    }
  }
}

const gachaNumber = ref(1)

// Thực hiện triệu hồi
const performGacha = async (times) => {
  gachaNumber.value = times
  showResult.value = false
  const cost = playerStore.wishlistEnabled ? times * 200 : times * 100
  if (playerStore.spiritStones < cost) {
    message.error('Linh thạch không đủ!')
    return
  }
  if (gachaType.value != 'equipment' && playerStore.items.filter(item => item.type === 'pet').length >= 100) {
    message.error('Túi linh thú đã đầy, xin hãy xử lý một số linh thú trước')
    return
  }
  if (isDrawing.value) return
  isDrawing.value = true
  // Trừ linh thạch
  playerStore.spiritStones -= cost
  // Bắt đầu hiệu ứng triệu hồi
  isShaking.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isShaking.value = false
  isOpening.value = true
  
  // Phát animation mở gói
  playOpenAnimation()
  
  // Chờ animation hoàn thành
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Tạo kết quả triệu hồi
  const results = Array(times).fill().map(() => {
    if (gachaType.value === 'all') {
      return drawFromAllPool()
    } else {
      return gachaType.value === 'equipment' ? drawSingleEquip() : drawSinglePet()
    }
  })
  // Thêm vào túi đồ
  results.forEach(item => {
    if (item.type === 'pet') {
      // Nhận tinh hoa dựa theo phẩm chất
      const rarityConfig = playerStore.petConfig.rarityMap[item.rarity]
      if (rarityConfig) {
        playerStore.petEssence += rarityConfig.essenceBonus
      }
      // Kiểm tra xem có cần tự động phóng sinh không
      if (playerStore.autoReleaseRarities.length > 0
        && (playerStore.autoReleaseRarities.includes('all')
          || playerStore.autoReleaseRarities.includes(item.rarity))) {
        autoReleasedCount.value++
        return // Không thêm vào túi đồ
      }
    } else if (equipmentTypes2.includes(item.type)) {
      // Kiểm tra xem có cần tự động bán không
      if (playerStore.autoSellQualities.length > 0 &&
        (playerStore.autoSellQualities.includes('all') ||
          playerStore.autoSellQualities.includes(item.quality))) {
        // Tính giá bán
        const qualityPrices = {
          mythic: 6,
          legendary: 5,
          epic: 4,
          rare: 3,
          uncommon: 2,
          common: 1
        }
        const basePrice = qualityPrices[item.quality] || 1
        playerStore.reinforceStones += basePrice
        autoSoldCount.value++
        autoSoldIncome.value += basePrice
        return // Không thêm vào túi đồ
      }
    }
    playerStore.items.push({
      ...item,
      id: Date.now() + Math.random()
    })
  })
  // Hiển thị thông báo kết quả tự động xử lý
  if (autoSoldCount.value) {
    message.success(`Đã tự động bán ${autoSoldCount.value} món trang bị, nhận được ${autoSoldIncome.value} đá cường hóa`)
  }
  if (autoReleasedCount.value) {
    message.success(`Đã tự động phóng sinh ${autoReleasedCount.value} linh thú`)
  }
  // Lưu dữ liệu
  playerStore.saveData()
  // Hiển thị kết quả
  gachaResult.value = results
  currentPage.value = 1
  selectedRarity.value = null
  selectedQuality.value = null
  isOpening.value = false
  showResult.value = true
  isDrawing.value = false
  // Xóa bộ đếm tự động xử lý
  autoSoldCount.value = 0
  autoReleasedCount.value = 0
  autoSoldIncome.value = 0
}

// Lọc kết quả
const filteredResults = computed(() => {
  if (!gachaResult.value) return []
  return gachaResult.value.filter(item => {
    if (item.type === 'pet') {
      return !selectedRarity.value || item.rarity === selectedRarity.value
    }
    // Lọc trang bị
    return !selectedQuality.value || item.quality === selectedQuality.value
  })
})

// Khi điều kiện lọc thay đổi, đặt lại số trang
watch([selectedQuality, selectedRarity], () => {
  currentPage.value = 1
})

// Tính toán kết quả của trang hiện tại
const currentPageResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredResults.value.slice(start, end)
})

// Tính tổng số trang
const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / pageSize.value)
})

const spineAnimations = {
  equipment: {
    jsonPath: spineLoader.SPINE_PATHS.linhbao,
    animation: 'idle',
    scale: 0.5,
    width: 500,
    height: 500
  },
  pet: {
    jsonPath: spineLoader.SPINE_PATHS.linhThu,
    animation: 'idle',
    scale: 2.0,
    width: 500,
    height: 400
  },
  all: {
    jsonPath: spineLoader.SPINE_PATHS.hentai,
    animation: 'idle',
    scale: 0.3,
    width: 500,
    height: 500
  }
}

const equipmentQualityOptions = computed(() => {
  return Object.entries(equipmentQualities).map(([key, value]) => ({
    label: value.name,
    value: key,
    style: { color: value.color }
  }))
})

const petRarityOptions = computed(() => {
  return Object.entries(petRarities).map(([key, value]) => ({
    label: value.name,
    value: key,
    style: { color: value.color }
  }))
})

const handleAutoSellChange = (values) => {
  if (values.includes('all')) {
    playerStore.autoSellQualities = ['all']
  } else if (values.length > 0) {
    playerStore.autoSellQualities = values.filter(v => v !== 'all')
  }
}

const handleAutoReleaseChange = (values) => {
  if (values.includes('all')) {
    playerStore.autoReleaseRarities = ['all']
  } else if (values.length > 0) {
    playerStore.autoReleaseRarities = values.filter(v => v !== 'all')
  }
}

const spineLoaded = ref(false)

onMounted(async () => {
  try {
    spineLoaded.value = await spineLoader.preloadSpineAssets()
  } catch (error) {
    console.error('Lỗi khi tải tài nguyên Spine:', error)
  }
})

const spineRef = ref(null)

const playOpenAnimation = () => {
  try {
    const spineAnimation = spineRef.value
    if (spineAnimation) {
      spineAnimation.createAnimation('attack', false)
      spineAnimation.addAnimation('idle', true, 0.5)
    } else {
      console.warn('Không tìm thấy spine animation để phát:', gachaType.value)
    }
  } catch (error) {
    console.error('Lỗi khi phát animation:', error)
  }
}
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>
          Hệ Thống Cầu Bảo
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content class="gacha-content">
      <n-card :bordered="false">
        <div class="gacha-container">
          <div class="gacha-type-selector">
            <n-radio-group v-model:value="gachaType" name="gachaType">
              <n-radio-button value="all">Linh Bảo Tổng Hợp</n-radio-button>
              <n-radio-button value="equipment">Pháp Bảo</n-radio-button>
              <n-radio-button value="pet">Linh Thú</n-radio-button>
            </n-radio-group>
          </div>
          <div class="spirit-stones">
            <n-statistic label="Linh Thạch" :value="playerStore.spiritStones" />
          </div>
          <div class="gacha-item-container">
            <div class="gacha-item" :class="{
              'shake': isShaking,
              'open': isOpening
            }">
              <n-spin v-if="!spineLoaded" />
              <SpineAnimation 
                v-else
                :ref="el => { spineRef = el }"
                :jsonPath="spineAnimations[gachaType].jsonPath" 
                :animation="spineAnimations[gachaType].animation" 
                :scale="spineAnimations[gachaType].scale"
                :width="550"
                :height="400"
                :key="gachaType"
              />
            </div>
          </div>
          <div class="gacha-buttons">
            <n-space vertical>
              <n-space justify="center">
                <n-space justify="center">
                  <n-space justify="center">
                    <n-space justify="center">
                      <n-space justify="center">
                        <n-space justify="center">
                          <n-space justify="center">
                            <n-space justify="center">
                              <n-space justify="center">
                                <n-space justify="center">
                                  <n-button type="primary" v-for="(item, index) in [1, 10, 50, 100]" :key="index"
                                    @click="performGacha(item)"
                                    :disabled="playerStore.spiritStones < (playerStore.wishlistEnabled ? item * 200 : item * 100) || isDrawing">
                                    Cầu {{ item }} lần ({{ playerStore.wishlistEnabled ? item * 200 : item * 100 }} Linh Thạch)
                                  </n-button>
                                </n-space>
                                  <n-space justify="center">
                                  <n-button quaternary circle size="small" @click="showProbabilityInfo = true">
                                    <template #icon>
                                      <n-icon>
                                        <Help />
                                      </n-icon>
                                    </template>
                                  </n-button>
                                  <n-button quaternary circle size="small" @click="showWishlistSettings = true">
                                    <template #icon>
                                      <n-icon>
                                        <HeartOutline />
                                      </n-icon>
                                    </template>
                                  </n-button>
                                  <n-button quaternary circle size="small" @click="showAutoSettings = true">
                                    <template #icon>
                                      <n-icon>
                                        <SettingsOutline />
                                      </n-icon>
                                    </template>
                                  </n-button>
                                </n-space>
                              </n-space>
                            </n-space>
                          </n-space>
                        </n-space>
                      </n-space>
                    </n-space>
                  </n-space>
                </n-space>
              </n-space>
            </n-space>
          </div>
          <!-- Cửa sổ kết quả cầu bảo -->
          <n-modal v-model:show="showResult" preset="dialog" title="Kết Quả Cầu Bảo" :style="{ maxWidth: '90vw', width: '800px' }">
            <n-card :bordered="false">
              <!-- Khu vực lọc -->
              <div class="filter-section" v-if="gachaType !== 'all'">
                <n-space align="center" justify="center" :wrap="true" :size="16">
                  <n-select v-model:value="selectedQuality" placeholder="Lọc phẩm chất Pháp Bảo" clearable
                    :options="equipmentQualityOptions" :style="{ width: '180px' }" @update:value="currentPage = 1"
                    v-if="gachaType === 'equipment'">
                  </n-select>
                  <n-select v-model:value="selectedRarity" placeholder="Lọc phẩm chất Linh Thú" clearable :options="petRarityOptions"
                    :style="{ width: '180px' }" @update:value="currentPage = 1" v-if="gachaType === 'pet'">
                  </n-select>
                </n-space>
              </div>
                                    <n-space justify="center">
                <n-button type="primary" @click="performGacha(gachaNumber)"
                  :disabled="playerStore.spiritStones < (playerStore.wishlistEnabled ? gachaNumber * 200 : gachaNumber * 100) || isDrawing">
                  Cầu thêm {{ gachaNumber }} lần
                  ({{ playerStore.wishlistEnabled ? gachaNumber * 200 : gachaNumber * 100 }} Linh Thạch)
                </n-button>
              </n-space>
              <div class="result-grid">
                <div v-for="item in currentPageResults" :key="item.id"
                  :class="['result-item', { 'wish-bonus': playerStore.wishlistEnabled && ((item.qualityInfo && playerStore.selectedWishEquipQuality === item.quality) || (item.type === 'pet' && playerStore.selectedWishPetRarity === item.rarity)) }]"
                  :style="{
                borderColor: item.qualityInfo ? item.qualityInfo.color : petRarities[item.rarity]?.color || '#CCCCCC'
              }">
                  <h4>{{ item.name }}</h4>
                  <p>Phẩm chất: {{ item.qualityInfo ? item.qualityInfo.name : (petRarities[item.rarity]?.name || 'Chưa xác định') }}</p>
                  <p v-if="equipmentTypes2.includes(item.type)">Loại: {{ equipmentTypes[item.equipType]?.name }}</p>
                  <p v-else-if="item.type === 'pet'">{{ item.description || 'Chưa có mô tả' }}</p>
                </div>
              </div>
              <template #footer>
                                      <n-space justify="center">
                  <n-pagination v-model:page="currentPage" :page-slot="6" :page-count="totalPages"
                    :page-size="pageSize" />
                </n-space>
              </template>
            </n-card>
          </n-modal>
          <!-- Cửa sổ thông tin tỉ lệ -->
          <n-modal v-model:show="showProbabilityInfo" preset="dialog" title="Thông Tin Tỉ Lệ Cầu Bảo">
            <n-tabs type="segment" animated>
              <!-- Tỉ lệ hồ tổng hợp -->
              <n-tab-pane name="all" tab="Hồ Tổng Hợp">
                <n-card>
                  <n-space vertical>
                    <n-divider>Tỉ lệ tổng quan</n-divider>
                    <div class="probability-bars">
                      <div class="prob-item">
                        <div class="prob-label">
                          <span>Pháp Bảo</span>
                        </div>
                        <!-- Phân bố tổng thể -->
                        <n-progress type="line" :percentage="50" indicator-placement="inside" color="#2080f0"
                          :height="20" :border-radius="4" />
                        <div class="prob-label">
                          <span>Linh Thú</span>
                        </div>
                        <n-progress type="line" :percentage="50" indicator-placement="inside" color="#f0a020"
                          :height="20" :border-radius="4" />
                      </div>
                    </div>
                    <!-- Chi tiết tỉ lệ Pháp Bảo -->
                    <n-divider>Tỉ lệ phẩm chất Pháp Bảo</n-divider>
                    <div class="probability-bars">
                      <div v-for="(probability, quality) in getAllPoolProbabilities(playerStore.level || 1).equipment"
                        :key="quality" class="prob-item">
                        <div class="prob-label">
                          <span :style="{ color: equipmentQualities[quality].color }">
                            {{ equipmentQualities[quality].name }}
                          </span>
                        </div>
                        <n-progress type="line" :percentage="probability * 100" indicator-placement="inside"
                          :color="equipmentQualities[quality].color" :height="20" :border-radius="4"
                          :show-indicator="true">
                          <template #indicator>
                            {{ (probability * 100).toFixed(1) }}%
                          </template>
                        </n-progress>
                      </div>
                    </div>
                    <!-- Chi tiết tỉ lệ Linh Thú -->
                    <n-divider>Tỉ lệ phẩm chất Linh Thú</n-divider>
                    <div class="probability-bars">
                      <div v-for="(probability, rarity) in getAllPoolProbabilities(playerStore.level || 1).pet"
                        :key="rarity" class="prob-item">
                        <div class="prob-label">
                          <span :style="{ color: petRarities[rarity].color }">
                            {{ petRarities[rarity].name }}
                          </span>
                        </div>
                        <n-progress type="line" :percentage="probability * 100" :indicator-placement="'inside'"
                          :color="petRarities[rarity].color" :height="20" :border-radius="4" :show-indicator="true">
                          <template #indicator>
                            {{ (probability * 100).toFixed(1) }}%
                          </template>
                        </n-progress>
                      </div>
                    </div>
                  </n-space>
                </n-card>
              </n-tab-pane>
              <!-- Tỉ lệ hồ Pháp Bảo -->
              <n-tab-pane name="equipment" tab="Hồ Pháp Bảo">
                <n-card>
                  <div class="probability-bars">
                    <div v-for="(probability, quality) in getAdjustedEquipProbabilities()" :key="quality"
                      class="prob-item">
                      <div class="prob-label">
                        <span :style="{ color: equipmentQualities[quality].color }">
                          {{ equipmentQualities[quality].name }}
                        </span>
                      </div>
                      <n-progress type="line" :percentage="probability * 100" :indicator-placement="'inside'"
                        :color="equipmentQualities[quality].color" :height="20" :border-radius="4"
                        :class="{ 'wish-bonus': playerStore.wishlistEnabled && playerStore.selectedWishEquipQuality === quality }"
                        :show-indicator="true">
                        <template #indicator>
                          {{ (probability * 100).toFixed(1) }}%
                        </template>
                      </n-progress>
                    </div>
                  </div>
                </n-card>
              </n-tab-pane>
              <!-- Tỉ lệ hồ Linh Thú -->
              <n-tab-pane name="pet" tab="Hồ Linh Thú">
                <n-card>
                  <div class="probability-bars">
                    <div v-for="(probability, rarity) in getAdjustedPetProbabilities()" :key="rarity" class="prob-item">
                      <div class="prob-label">
                        <span :style="{ color: petRarities[rarity].color }">
                          {{ petRarities[rarity].name }}
                        </span>
                      </div>
                      <n-progress type="line" :percentage="probability * 100" :indicator-placement="'inside'"
                        :class="{ 'wish-bonus': playerStore.wishlistEnabled && playerStore.selectedWishPetRarity === rarity }"
                        :color="petRarities[rarity].color" :height="20" :border-radius="4" :show-indicator="true">
                        <template #indicator>
                          {{ (probability * 100).toFixed(1) }}%
                        </template>
                      </n-progress>
                    </div>
                  </div>
                </n-card>
              </n-tab-pane>
            </n-tabs>
          </n-modal>
          <!-- Cửa sổ thiết lập Tâm Nguyện -->
          <n-modal v-model:show="showWishlistSettings" preset="dialog" title="Thiết Lập Tâm Nguyện" style="width: 800px">
            <n-card :bordered="false">
              <n-space vertical>
                <n-switch v-model:value="playerStore.wishlistEnabled">
                  <template #checked>Tâm Nguyện đã kích hoạt</template>
                  <template #unchecked>Tâm Nguyện đã vô hiệu</template>
                </n-switch>
                <n-divider>Tâm Nguyện Phẩm Chất Pháp Bảo</n-divider>
                <n-select v-model:value="playerStore.selectedWishEquipQuality" :options="equipmentQualityOptions"
                  clearable placeholder="Chọn phẩm chất Pháp Bảo" :disabled="!playerStore.wishlistEnabled">
                  <template #option="{ option }">
                    <span :style="{ color: equipmentQualities[option.value].color }">
                      {{ equipmentQualities[option.value].name }}
                      <n-tag v-if="option.value === playerStore.selectedWishEquipQuality" type="success"
                        size="small">Đã chọn</n-tag>
                    </span>
                  </template>
                </n-select>
                <n-divider>Tâm Nguyện Phẩm Chất Linh Thú</n-divider>
                <n-select v-model:value="playerStore.selectedWishPetRarity" :options="petRarityOptions" clearable
                  placeholder="Chọn phẩm chất Linh Thú" :disabled="!playerStore.wishlistEnabled">
                  <template #option="{ option }">
                    <span :style="{ color: petRarities[option.value].color }">
                      {{ petRarities[option.value].name }}
                      <n-tag v-if="option.value === playerStore.selectedWishPetRarity" type="success"
                        size="small">Đã chọn</n-tag>
                    </span>
                  </template>
                </n-select>
                <n-alert type="info" title="Hướng dẫn Tâm Nguyện">
                  Khi kích hoạt Tâm Nguyện, linh thạch cần dùng sẽ tăng gấp đôi, phẩm chất được chọn sẽ nhận được tỉ lệ gia tăng tùy theo xác suất cơ bản (xác suất cơ bản càng thấp, mức tăng càng cao). Mỗi lần chỉ có thể chọn một phẩm chất Pháp Bảo và một phẩm chất Linh Thú làm Tâm Nguyện.
                </n-alert>
              </n-space>
            </n-card>
          </n-modal>
          <n-modal v-model:show="showAutoSettings" preset="dialog" title="Thiết Lập Xử Lý Tự Động" style="width: 800px">
            <n-card :bordered="false">
              <n-space vertical>
                <n-divider>Tự Động Bán Pháp Bảo</n-divider>
                <n-checkbox-group v-model:value="playerStore.autoSellQualities" @update:value="handleAutoSellChange">
                  <n-space wrap>
                    <n-checkbox value="all"
                      :disabled="!!playerStore.autoSellQualities?.length && !playerStore.autoSellQualities.includes('all')">
                      Tất Cả Phẩm Chất
                    </n-checkbox>
                    <n-checkbox v-for="(quality, key) in equipmentQualities" :key="key" :value="key"
                      :disabled="playerStore.autoSellQualities?.includes('all')">
                      <span :style="{ color: quality.color }">{{ quality.name }}</span>
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
                <n-divider>Tự Động Phóng Sinh Linh Thú</n-divider>
                <n-checkbox-group v-model:value="playerStore.autoReleaseRarities"
                  @update:value="handleAutoReleaseChange">
                  <n-space wrap>
                    <n-checkbox value="all"
                      :disabled="!!playerStore.autoReleaseRarities?.length && !playerStore.autoReleaseRarities.includes('all')">
                      Tất Cả Phẩm Chất
                    </n-checkbox>
                    <n-checkbox v-for="(rarity, key) in petRarities" :key="key" :value="key"
                      :disabled="playerStore.autoReleaseRarities?.includes('all')">
                      <span :style="{ color: rarity.color }">{{ rarity.name }}</span>
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
              </n-space>
            </n-card>
            <template #footer>
              <n-space justify="end">
                <n-button @click="showAutoSettings = false">Đóng</n-button>
              </n-space>
            </template>
          </n-modal>
        </div>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.gacha-content {
  /* Đảm bảo không giới hạn hiển thị */
  overflow: visible;
}

.gacha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  /* Đảm bảo không giới hạn hiển thị */
  overflow: visible;
}

.gacha-item-container {
  position: relative;
  width: 350px;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.gacha-item {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
  overflow: visible;
}

.gacha-item.shake {
  animation: shake 0.5s ease-in-out infinite;
}

.gacha-item.open {
  animation: open 1s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-5deg);
  }

  75% {
    transform: rotate(5deg);
  }
}

@keyframes open {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }

  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.filter-section {
  padding: 16px;
  margin-bottom: 16px;
  background-color: var(--n-card-color);
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.result-item {
  background: var(--n-color);
  border: 2px solid;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.result-item h4 {
  margin: 0 0 8px 0;
}

.result-item p {
  margin: 4px 0;
  font-size: 0.9em;
}

.gacha-buttons {
  margin-top: 20px;
}

.probability-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prob-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prob-label {
  min-width: 60px;
  text-align: right;
}

@media screen and (max-width: 768px) {
  .result-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.wishlist-button {
  position: absolute;
  top: 20px;
  right: 20px;
}

.wishlist-info {
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.wishlist-info ul {
  margin: 8px 0 0 20px;
  padding: 0;
}

.wishlist-info li {
  margin: 4px 0;
  color: #666;
}

@keyframes rotate-stars {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.wish-bonus {
  position: relative;
  z-index: 1;
}

.wish-bonus::before {
  content: "★";
  position: absolute;
  top: -10px;
  right: -10px;
  color: white;
  font-size: 20px;
  text-shadow: 0 0 5px;
  animation: rotate-stars 3s linear infinite;
  transform-origin: center;
}

:deep(.spine-container) {
  overflow: visible !important;
  position: absolute !important;
  width: 550px !important;
  height: 550px !important;
  z-index: 100 !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}
</style>