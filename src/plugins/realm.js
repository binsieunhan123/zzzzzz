// Cảnh giới tên phối trí
const realms = [
  // Luyện Khí kỳ
  { name: 'Luyện Khí nhất trọng', maxCultivation: 100 }, { name: 'Luyện khí nhị trọng', maxCultivation: 200 },
  { name: 'Luyện khí tam trọng', maxCultivation: 300 }, { name: 'Luyện khí tứ trọng', maxCultivation: 400 },
  { name: 'Luyện khí ngũ trọng', maxCultivation: 500 }, { name: 'Luyện khí lục trọng', maxCultivation: 600 },
  { name: 'Luyện khí thất trọng', maxCultivation: 700 }, { name: 'Luyện khí bát trọng', maxCultivation: 800 },
  { name: 'Luyện Khí cửu trọng', maxCultivation: 900 },
  // Trúc Cơ kỳ
  { name: 'Trúc cơ nhất trọng', maxCultivation: 1000 }, { name: 'Trúc cơ nhị trọng', maxCultivation: 1200 },
  { name: 'Trúc cơ tam trọng', maxCultivation: 1400 }, { name: 'Trúc cơ tứ trọng', maxCultivation: 1600 },
  { name: 'Trúc cơ ngũ trọng', maxCultivation: 1800 }, { name: 'Trúc cơ lục trọng', maxCultivation: 2000 },
  { name: 'Trúc cơ thất trọng', maxCultivation: 2200 }, { name: 'Trúc cơ bát trọng', maxCultivation: 2400 },
  { name: 'Trúc cơ cửu trọng', maxCultivation: 2600 },
  // Kim Đan kỳ
  { name: 'Kim Đan nhất trọng', maxCultivation: 3000 }, { name: 'Kim Đan nhị trọng', maxCultivation: 3500 },
  { name: 'Kim Đan tam trọng', maxCultivation: 4000 }, { name: 'Kim Đan tứ trọng', maxCultivation: 4500 },
  { name: 'Kim Đan ngũ trọng', maxCultivation: 5000 }, { name: 'Kim Đan lục trọng', maxCultivation: 5500 },
  { name: 'Kim Đan thất trọng', maxCultivation: 6000 }, { name: 'Kim Đan bát trọng', maxCultivation: 6500 },
  { name: 'Kim Đan cửu trọng', maxCultivation: 7000 },
  // Nguyên Anh kỳ
  { name: 'Nguyên Anh nhất trọng', maxCultivation: 8000 }, { name: 'Nguyên Anh nhị trọng', maxCultivation: 9000 },
  { name: 'Nguyên Anh tam trọng', maxCultivation: 10000 }, { name: 'Nguyên Anh tứ trọng', maxCultivation: 11000 },
  { name: 'Nguyên Anh ngũ trọng', maxCultivation: 12000 }, { name: 'Nguyên Anh lục trọng', maxCultivation: 13000 },
  { name: 'Nguyên Anh thất trọng', maxCultivation: 14000 }, { name: 'Nguyên Anh bát trọng', maxCultivation: 15000 },
  { name: 'Nguyên Anh cửu trọng', maxCultivation: 16000 },
  // Hóa Thần kỳ
  { name: 'Hóa Thần nhất trọng', maxCultivation: 18000 }, { name: 'Hóa Thần nhị trọng', maxCultivation: 20000 },
  { name: 'Hóa Thần tam trọng', maxCultivation: 22000 }, { name: 'Hóa Thần tứ trọng', maxCultivation: 24000 },
  { name: 'Hóa Thần ngũ trọng', maxCultivation: 26000 }, { name: 'Hóa Thần lục trọng', maxCultivation: 28000 },
  { name: 'Hóa Thần thất trọng', maxCultivation: 30000 }, { name: 'Hóa Thần bát trọng', maxCultivation: 32000 },
  { name: 'Hóa Thần cửu trọng', maxCultivation: 35000 },
  // Phản Hư kỳ
  { name: 'Phản Hư nhất trọng', maxCultivation: 40000 }, { name: 'Phản Hư nhị trọng', maxCultivation: 45000 },
  { name: 'Phản Hư tam trọng', maxCultivation: 50000 }, { name: 'Phản Hư tứ trọng', maxCultivation: 55000 },
  { name: 'Phản Hư ngũ trọng', maxCultivation: 60000 }, { name: 'Phản Hư lục trọng', maxCultivation: 65000 },
  { name: 'Phản Hư thất trọng', maxCultivation: 70000 }, { name: 'Phản Hư bát trọng', maxCultivation: 75000 },
  { name: 'Phản Hư cửu trọng', maxCultivation: 80000 },
  // Hợp Thể kỳ
  { name: 'Hợp thể nhất trọng', maxCultivation: 90000 }, { name: 'Hợp thể nhị trọng', maxCultivation: 100000 },
  { name: 'Hợp thể tam trọng', maxCultivation: 110000 }, { name: 'Hợp thể tứ trọng', maxCultivation: 120000 },
  { name: 'Hợp thể ngũ trọng', maxCultivation: 130000 }, { name: 'Hợp thể lục trọng', maxCultivation: 140000 },
  { name: 'Hợp thể thất trọng', maxCultivation: 150000 }, { name: 'Hợp thể bát trọng', maxCultivation: 160000 },
  { name: 'Hợp thể cửu trọng', maxCultivation: 170000 },
  // Đại Thừa kỳ
  { name: 'Đại Thừa nhất trọng', maxCultivation: 200000 }, { name: 'Đại Thừa nhị trọng', maxCultivation: 230000 },
  { name: 'Đại Thừa tam trọng', maxCultivation: 260000 }, { name: 'Đại Thừa tứ trọng', maxCultivation: 290000 },
  { name: 'Đại Thừa ngũ trọng', maxCultivation: 320000 }, { name: 'Đại Thừa lục trọng', maxCultivation: 350000 },
  { name: 'Đại Thừa thất trọng', maxCultivation: 380000 }, { name: 'Đại Thừa bát trọng', maxCultivation: 410000 },
  { name: 'Đại Thừa cửu trọng', maxCultivation: 450000 },
  // Độ Kiếp kỳ
  { name: 'Độ kiếp nhất trọng', maxCultivation: 500000 }, { name: 'Độ kiếp nhị trọng', maxCultivation: 550000 },
  { name: 'Độ kiếp tam trọng', maxCultivation: 600000 }, { name: 'Độ kiếp tứ trọng', maxCultivation: 650000 },
  { name: 'Độ kiếp ngũ trọng', maxCultivation: 700000 }, { name: 'Độ kiếp lục trọng', maxCultivation: 750000 },
  { name: 'Độ kiếp thất trọng', maxCultivation: 800000 }, { name: 'Độ kiếp bát trọng', maxCultivation: 850000 },
  { name: 'Độ kiếp cửu trọng', maxCultivation: 900000 },
  // Tiên Nhân Cảnh
  { name: 'Tiên nhân nhất trọng', maxCultivation: 1000000 }, { name: 'Tiên nhân nhị trọng', maxCultivation: 1200000 },
  { name: 'Tiên nhân tam trọng', maxCultivation: 1400000 }, { name: 'Tiên nhân tứ trọng', maxCultivation: 1600000 },
  { name: 'Tiên nhân ngũ trọng', maxCultivation: 1800000 }, { name: 'Tiên nhân lục trọng', maxCultivation: 2000000 },
  { name: 'Tiên nhân thất trọng', maxCultivation: 2200000 }, { name: 'Tiên nhân bát trọng', maxCultivation: 2400000 },
  { name: 'Tiên nhân cửu trọng', maxCultivation: 2600000 },
  // Chân Tiên cảnh
  { name: 'Chân Tiên nhất trọng', maxCultivation: 3000000 }, { name: 'Chân Tiên nhị trọng', maxCultivation: 3500000 },
  { name: 'Chân Tiên tam trọng', maxCultivation: 4000000 }, { name: 'Chân Tiên tứ trọng', maxCultivation: 4500000 },
  { name: 'Chân Tiên ngũ trọng', maxCultivation: 5000000 }, { name: 'Chân Tiên lục trọng', maxCultivation: 5500000 },
  { name: 'Chân Tiên thất trọng', maxCultivation: 6000000 }, { name: 'Chân Tiên bát trọng', maxCultivation: 6500000 },
  { name: 'Chân Tiên cửu trọng', maxCultivation: 7000000 },
  // Kim Tiên cảnh
  { name: 'Kim Tiên nhất trọng', maxCultivation: 8000000 }, { name: 'Kim Tiên nhị trọng', maxCultivation: 9000000 },
  { name: 'Kim Tiên tam trọng', maxCultivation: 10000000 }, { name: 'Kim Tiên tứ trọng', maxCultivation: 11000000 },
  { name: 'Kim Tiên ngũ trọng', maxCultivation: 12000000 }, { name: 'Kim Tiên lục trọng', maxCultivation: 13000000 },
  { name: 'Kim Tiên thất trọng', maxCultivation: 14000000 }, { name: 'Kim Tiên bát trọng', maxCultivation: 15000000 },
  { name: 'Kim Tiên cửu trọng', maxCultivation: 16000000 },
  // Thái Ất cảnh
  { name: 'Thái Ất nhất trọng', maxCultivation: 20000000 }, { name: 'Thái Ất nhị trọng', maxCultivation: 24000000 },
  { name: 'Thái Ất tam trọng', maxCultivation: 28000000 }, { name: 'Thái Ất tứ trọng', maxCultivation: 32000000 },
  { name: 'Thái Ất ngũ trọng', maxCultivation: 36000000 }, { name: 'Thái Ất lục trọng', maxCultivation: 40000000 },
  { name: 'Thái Ất thất trọng', maxCultivation: 44000000 }, { name: 'Thái Ất bát trọng', maxCultivation: 48000000 },
  { name: 'Thái Ất cửu trọng', maxCultivation: 52000000 },
  // Đại La cảnh
  { name: 'Đại La nhất trọng', maxCultivation: 60000000 }, { name: 'Đại La nhị trọng', maxCultivation: 70000000 },
  { name: 'Đại La tam trọng', maxCultivation: 80000000 }, { name: 'Đại La tứ trọng', maxCultivation: 90000000 },
  { name: 'Đại La ngũ trọng', maxCultivation: 100000000 }, { name: 'Đại La lục trọng', maxCultivation: 110000000 },
  { name: 'Lớn La Thất nặng', maxCultivation: 120000000 }, { name: 'Đại La bát trọng', maxCultivation: 130000000 },
  { name: 'Đại La cửu trọng', maxCultivation: 140000000 }
]


// Thu hoạch cảnh giới tên
export const getRealmName = (level) => {
  return realms[level - 1]
}

export const getRealmLength = () => {
  return realms.length
}
