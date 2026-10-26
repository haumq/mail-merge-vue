<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'

// State
const inputUrl = ref('https://')
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrSize = ref(250)
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const isCopied = ref(false)
const isDarkMode = ref(false)

// Khởi tạo kiểm tra theme mặc định của hệ thống
onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  }
  generateQR()
})

// Hàm tạo QR Code
async function generateQR() {
  await nextTick()
  if (!qrCanvas.value) return

  const text = inputUrl.value.trim()
  
  if (!text) {
    const ctx = qrCanvas.value.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height)
    return
  }

  try {
    await QRCode.toCanvas(qrCanvas.value, text, {
      width: qrSize.value,
      margin: 2,
      color: {
        dark: fgColor.value,
        light: bgColor.value
      },
      errorCorrectionLevel: 'H'
    })
  } catch (err) {
    console.error('Lỗi tạo QR:', err)
  }
}

// Theo dõi thay đổi của URL và các tùy chọn
watch([inputUrl, qrSize, fgColor, bgColor], () => {
  generateQR()
})

const toast = ref({ show: false, message: '' })

// Thông báo Toast
function showToast(message: string) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Tải ảnh QR (.png)
async function downloadQR() {
  if (!qrCanvas.value || !inputUrl.value.trim()) return

  qrCanvas.value.toBlob(async (blob) => {
    if (!blob) return

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `qrcode_${Date.now()}.png`,
          types: [
            {
              description: 'Hình ảnh PNG (*.png)',
              accept: { 'image/png': ['.png'] }
            }
          ]
        })

        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()

        showToast('✅ Đã lưu ảnh QR thành công!')
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Lỗi khi lưu ảnh QR:', err)
        }
      }
    } else {
      const link = document.createElement('a')
      link.download = `qrcode_${Date.now()}.png`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)

      showToast('✅ Đã tải ảnh QR về thư mục Downloads!')
    }
  }, 'image/png')
}

// Sao chép link
function copyLink() {
  if (!inputUrl.value) return
  navigator.clipboard.writeText(inputUrl.value)
  showToast('📋 Link đã được sao chép!')
  isCopied.value = true
  setTimeout(() => (isCopied.value = false), 2000)
}

// Xóa ô nhập
function clearInput() {
  inputUrl.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900 transition-colors duration-300 font-sans">
    <div class="relative w-full max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors duration-300">
      
      <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
        ⚡ Tạo Mã QR Tự Động
      </h2>

      <!-- Ô nhập đường dẫn -->
      <div class="mb-5">
        <label for="url-input" class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
          Nhập hoặc dán đường dẫn (URL):
        </label>
        <div class="relative flex items-center">
          <input
            id="url-input"
            v-model="inputUrl"
            type="text"
            placeholder="https://example.com"
            class="w-full py-3 pl-3.5 pr-10 text-sm border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <button 
            v-if="inputUrl" 
            class="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1 rounded-full"
            title="Xóa" 
            @click="clearInput"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Khung hiển thị Mã QR -->
      <div class="flex justify-center items-center min-h-[270px] bg-slate-50 dark:bg-slate-900/60 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 mb-5 p-4 transition-colors">
        <div v-show="inputUrl.trim()" class="rounded-lg shadow-sm overflow-hidden">
          <canvas ref="qrCanvas" class="block"></canvas>
        </div>
        <div v-show="!inputUrl.trim()" class="text-center text-slate-400 dark:text-slate-500">
          <span class="text-4xl block mb-2">📱</span>
          <p class="text-sm">Nhập đường dẫn để hiển thị mã QR</p>
        </div>
      </div>

      <!-- Tùy chỉnh (Kích thước & Màu sắc) -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kích thước:</label>
          <select 
            v-model.number="qrSize" 
            class="w-full p-2 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          >
            <option :value="180">Nhỏ (180px)</option>
            <option :value="250">Vừa (250px)</option>
            <option :value="350">Lớn (350px)</option>
            <option :value="500">Rất lớn (500px)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Màu QR:</label>
          <input 
            v-model="fgColor" 
            type="color" 
            class="w-full h-9 p-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer transition-colors" 
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Màu nền:</label>
          <input 
            v-model="bgColor" 
            type="color" 
            class="w-full h-9 p-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer transition-colors" 
          />
        </div>
      </div>

      <!-- Nút thao tác -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!inputUrl.trim()"
          @click="copyLink"
        >
          {{ isCopied ? '✓ Đã chép' : '📋 Sao chép' }}
        </button>

        <button
          class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          :disabled="!inputUrl.trim()"
          @click="downloadQR"
        >
          📥 Tải Ảnh PNG
        </button>
      </div>
    </div>

    <!-- Toast Notification (Hiệu ứng trượt bằng Tailwind CSS) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-5 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-5 opacity-0 scale-95"
    >
      <div 
        v-if="toast.show" 
        class="fixed bottom-7 right-7 bg-emerald-500 dark:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/20 z-50 flex items-center gap-2"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>