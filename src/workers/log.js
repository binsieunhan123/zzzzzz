// Worker xử lý nhật ký tu luyện

let logs = [];
const MAX_LOGS = 100;

// Xử lý tin nhắn từ luồng chính
self.onmessage = (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'ADD_LOG':
      addLog(data);
      break;
    case 'CLEAR_LOGS':
      clearLogs();
      break;
    case 'GET_LOGS':
      sendLogs();
      break;
  }
};

// Thêm nhật ký
function addLog(logData) {
  if (!logData.content || logData.content.trim() === '') {
    return;
  }

  logs.push({
    ...logData,
    time: new Date().toLocaleTimeString()
  });

  // Giới hạn số lượng nhật ký
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(-MAX_LOGS);
  }

  // Gửi nhật ký đã cập nhật cho luồng chính
  sendLogs();
}

// Xóa sạch nhật ký
function clearLogs() {
  logs = [];
  sendLogs();
}

// Gửi nhật ký cho luồng chính
function sendLogs() {
  self.postMessage({
    type: 'LOGS_UPDATED',
    logs: logs
  });
}