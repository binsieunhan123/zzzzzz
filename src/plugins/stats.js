// Thuộc tính chiếu rọi phối trí
export const statNameMapping = {
  // Thuộc tính cơ sở
  health: 'HP',
  maxHealth: 'Sinh mệnh hạn mức cao nhất',
  attack: 'Lực công kích',
  defense: 'Lực phòng ngự',
  speed: 'Tốc độ',
  // Chiến đấu thuộc tính
  critRate: 'Tỉ lệ bạo kích',
  comboRate: 'Liên kích suất',
  counterRate: 'Phản kích suất',
  stunRate: 'Mê muội suất',
  dodgeRate: 'Tỉ lệ né tránh',
  vampireRate: 'Hút máu suất',
  // Chiến đấu kháng tính
  critResist: 'Kháng bạo kích',
  comboResist: 'Kháng liên kích',
  counterResist: 'Kháng phản kích',
  stunResist: 'Kháng mê muội',
  dodgeResist: 'Kháng né tránh',
  vampireResist: 'Kháng hút máu',
  // Thuộc tính đặc biệt
  healBoost: 'Cường hóa trị liệu',
  critDamageBoost: 'Cường hóa bạo tổn thương',
  critDamageReduce: 'Yếu hóa bạo tổn thương',
  finalDamageBoost: 'Cuối cùng tăng tổn thương',
  finalDamageReduce: 'Cuối cùng giảm tổn thương',
  combatBoost: 'Chiến đấu thuộc tính tăng lên',
  resistanceBoost: 'Chiến đấu kháng tính tăng lên',
  // Cái khác thuộc tính
  cultivationRate: 'Tu luyện tốc độ',
  spiritRate: 'Linh lực thu hoạch',
  luck: 'Phúc duyên'
}
// Thu hoạch thuộc tính tiếng Trung tên
export function getStatName (stat) {
  return statNameMapping[stat] || stat
}
// Format thuộc tính giá trị（Xử lý tỉ lệ phần trăm và trị số）
export function formatStatValue (stat, value) {
  // Xử lýnullHoặcundefinedGiá trị
  if (value === null || value === undefined) {
    return '0'
  }
  // Những này thuộc tính cần biểu hiện là tỉ lệ phần trăm
  const percentageStats = [
    'critRate', 'comboRate', 'counterRate', 'stunRate', 'dodgeRate', 'vampireRate',
    'critResist', 'comboResist', 'counterResist', 'stunResist', 'dodgeResist', 'vampireResist',
    'healBoost', 'critDamageBoost', 'critDamageReduce', 'finalDamageBoost', 'finalDamageReduce',
    'combatBoost', 'resistanceBoost', 'cultivationRate', 'spiritRate', 'luck'
  ]
  if (percentageStats.includes(stat)) {
    return `${(value * 100).toFixed(1)}%`
  }
  return value.toFixed(1)
}
