<script setup>
import { usePlayerStore } from '../stores/player'
import { ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import { saveAs } from 'file-saver'

const clickCount = ref(0);
const newName = ref('')
const message = useMessage()
const maxLength = 6  // Định nghĩa độ dài tối đa của đạo hiệu
const playerStore = usePlayerStore()
const dialog = useDialog()
const version = __APP_VERSION__

// Xuất bản lưu
const handleExportSave = async () => {
  try {
    const saveData = await playerStore.exportData()
    if (!saveData) {
      message.error('Không có dữ liệu lưu để xuất!')
      return
    }
    // Xuất dữ liệu lưu đã mã hóa
    saveAs(
      new Blob([saveData], { type: 'application/json;charset=utf-8' }),
      `Dữ liệu Tu Tiên Nhàn Rỗi phiên bản ${version}-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
    );
    message.success('Xuất bản lưu thành công!')
  } catch (error) {
    message.error('Xuất thất bại: ' + error.message)
  }
}

// Nhập bản lưu
const handleImportSave = (data) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const encryptedData = e.target.result
      await playerStore.importData(encryptedData)
      message.success('Nhập bản lưu thành công!')
    } catch (error) {
      message.error('Nhập thất bại: ' + error.message)
    }
  }
  reader.readAsText(data.file.file)
}

// Xác nhận Chuyển Kiếp Tu Luyện
const handleReincarnation = () => {
  clickCount.value++
  if (clickCount.value >= 10) {
    dialog.warning({
      title: 'Thông báo',
      content: 'Chế độ Thiên Đạo đã được kích hoạt!',
      positiveText: 'Xác nhận',
      negativeText: 'Hủy bỏ',
      onPositiveClick: () => {
        playerStore.isGMMode = true
        playerStore.saveData()
      }
    })
    return;
  }
  dialog.warning({
    title: 'Xác nhận Chuyển Kiếp',
    content: 'Ngươi có chắc muốn chuyển kiếp không? Mọi dữ liệu sẽ bị xóa và bắt đầu lại từ đầu!',
    positiveText: 'Xác nhận',
    negativeText: 'Hủy bỏ',
    onPositiveClick: async () => {
      // Xác nhận lần hai
      dialog.warning({
        title: 'Xác nhận cuối cùng',
        content: 'Đây là xác nhận cuối cùng, sau khi chuyển kiếp sẽ không thể khôi phục! Ngươi có chắc muốn tiếp tục?',
        positiveText: 'Chuyển kiếp',
        negativeText: 'Suy nghĩ lại',
        onPositiveClick: async () => {
          await playerStore.clearData()
          location.href = location.origin
        }
      })
    }
  })
}

const qq = ref(false)

// Thay đổi đạo hiệu
const handleChangeName = () => {
  if (!newName.value.trim()) {
    message.warning('Đạo hiệu không thể để trống!')
    return
  }
  if (newName.value.trim().length > maxLength) {
    message.warning(`Đạo hiệu không thể vượt quá ${maxLength} ký tự!`)
    return
  }
  // Tính toán linh thạch cần thiết để thay đổi đạo hiệu
  const spiritStoneCost = playerStore.nameChangeCount === 0 ? 0 : Math.pow(2, playerStore.nameChangeCount) * 100
  // Miễn phí lần đầu, sau đó cần tiêu hao linh thạch
  if (playerStore.nameChangeCount > 0) {
    if (playerStore.spiritStones < spiritStoneCost) {
      message.error(`Linh thạch không đủ! Cần ${spiritStoneCost} viên linh thạch để thay đổi đạo hiệu`)
      return
    }
    playerStore.spiritStones -= spiritStoneCost
  }
  playerStore.name = newName.value.trim()
  playerStore.nameChangeCount++
  playerStore.saveData()
  message.success(playerStore.nameChangeCount === 1 ?
    'Thay đổi đạo hiệu thành công! Miễn phí lần đầu' :
    `Thay đổi đạo hiệu thành công! Tiêu hao ${spiritStoneCost} viên linh thạch`)
  newName.value = ''
}
</script>

<template>
  <div class="settings-container">
    <n-card title="Thiết Lập Tu Tiên">
      <template #header-extra>
        Phiên bản {{ version }}
      </template>
      <n-space vertical>
        <n-input-group>
          <n-input v-model:value="newName" placeholder="Nhập đạo hiệu mới" clearable :maxlength="maxLength" show-count />
          <n-button type="primary" @click="handleChangeName" :disabled="!newName">
            Đổi Đạo Hiệu
          </n-button>
        </n-input-group>
        <n-alert title="Lưu ý quan trọng" type="warning">
          Trò chơi này là dự án mã nguồn mở, nếu ngươi đã mua trò chơi này từ bất kỳ nơi nào, hãy yêu cầu hoàn tiền và báo cáo ngay lập tức.
        </n-alert>
        <n-space>
          <n-button type="warning" @click="handleReincarnation">
            Chuyển Kiếp
          </n-button>
          <n-button @click="handleExportSave" type="info">
            Xuất Bản Lưu
          </n-button>
          <n-upload :show-file-list="false" @change="handleImportSave">
            <n-button>Nhập Bản Lưu</n-button>
          </n-upload>
          <n-button target="_blank" href="https://github.com/setube/vue-idle-xiuxian" tag="a" type="primary">
            Mã Nguồn
          </n-button>
          <n-button type="error" @click="qq = true">
            Hội Tu Tiên
          </n-button>
        </n-space>
      </n-space>
    </n-card>
    <n-modal preset="dialog" title="Hội Tu Tiên Chính Thức" v-model:show="qq">
      <n-card :bordered="false" size="huge" role="dialog" aria-modal="true">
        <n-space vertical>
          <n-input value="920930589" readonly type="text" />
        </n-space>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>
</style>