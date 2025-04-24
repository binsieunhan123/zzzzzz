// Sử dụng CryptoJS Tiến hành số liệu mã hóa và tiết lộ
import CryptoJS from 'crypto-js'

// Số liệu mã hóa
export function encryptData (data) {
  try {
    const jsonStr = JSON.stringify(data)
    return CryptoJS.AES.encrypt(jsonStr, 'vue-idle-xiuxian').toString()
  } catch (error) {
    console.error('Số liệu mã hóa thất bại:', error)
    return null
  }
}

// Số liệu giải mã
export function decryptData (encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'vue-idle-xiuxian')
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
  } catch (error) {
    console.error('Số liệu giải mã thất bại:', error)
    return null
  }
}

// Số liệu kiểm tra
export function validateData (data) {
  // Kiểm tra tất yếu số liệu chữ đoạn
  const requiredFields = [
    'name',
    'level',
    'realm',
    'cultivation',
    'maxCultivation',
    'spirit',
    'baseAttributes'
  ]

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Số liệu nghiệm chứng thất bại: Thiếu khuyết tất yếu chữ đoạn ${field}`)
      return false
    }
  }

  // Kiểm tra trị số hợp lý tính
  if (data.level < 1 || data.cultivation < 0 || data.spirit < 0) {
    console.error('Số liệu nghiệm chứng thất bại: Trị số dị thường')
    return false
  }

  return true
}
