<script setup lang="ts">
import { ref } from 'vue'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

interface ToastState {
  show: boolean
  type: 'info' | 'error' | 'success'
  message: string
  isUpdateAvailable?: boolean
  isDownloading?: boolean
}

const toast = ref<ToastState>({
  show: false,
  type: 'info',
  message: '',
  isUpdateAvailable: false,
  isDownloading: false
})

const pendingUpdate = ref<Update | null>(null)

// Hàm kiểm tra cập nhật (Tauri v2)
async function checkForUpdates(silent = true) {
  try {
    const update = await check()

    if (update) {
      pendingUpdate.value = update
      toast.value = {
        show: true,
        type: 'info',
        message: `Đã có bản cập nhật v${update.version}`,
        isUpdateAvailable: true,
        isDownloading: false
      }
    } else if (!silent) {
      toast.value = {
        show: true,
        type: 'success',
        message: 'Bạn đang ở phiên bản mới nhất!',
        isUpdateAvailable: false,
        isDownloading: false
      }
      setTimeout(() => { toast.value.show = false }, 3000)
    }
  } catch (error) {
    console.error('Lỗi kiểm tra cập nhật:', error)
    if (!silent) {
      toast.value = {
        show: true,
        type: 'error',
        message: 'Không thể kiểm tra cập nhật',
        isUpdateAvailable: false,
        isDownloading: false
      }
      setTimeout(() => { toast.value.show = false }, 3000)
    }
  }
}

// Hàm tải & cài đặt
async function handleUpdate() {
  if (!pendingUpdate.value) return
  
  try {
    toast.value.isDownloading = true
    toast.value.message = 'Đang tải bản cập nhật...'
    
    await pendingUpdate.value.downloadAndInstall()
    await relaunch()
  } catch (error) {
    console.error('Lỗi khi cài đặt cập nhật:', error)
    toast.value = {
      show: true,
      type: 'error',
      message: 'Nâng cấp thất bại, vui lòng thử lại!',
      isUpdateAvailable: false,
      isDownloading: false
    }
    setTimeout(() => { toast.value.show = false }, 4000)
  }
}

function closeToast() {
  toast.value.show = false
}

defineExpose({ checkForUpdates })
</script>

<template>
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
      class="fixed right-4 bottom-4 z-[60] min-w-[260px] max-w-[320px] rounded-xl border bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:bg-gray-900/95"
      :class="
        toast.type === 'error'
          ? 'border-rose-200 text-rose-700 dark:border-rose-900/40 dark:text-rose-300'
          : toast.type === 'info'
            ? 'border-sky-200 text-sky-700 dark:border-sky-900/40 dark:text-sky-300'
            : 'border-emerald-200 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-300'
      "
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start gap-3">
        <span class="text-lg leading-none select-none">
          {{ toast.isDownloading ? '⌛' : toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅' }}
        </span>

        <div class="flex-1 text-sm font-medium leading-5">
          <div>{{ toast.message }}</div>

          <!-- Nút hành động cập nhật -->
          <div v-if="toast.isUpdateAvailable && !toast.isDownloading" class="mt-2.5 flex items-center gap-2">
            <button
              @click="handleUpdate"
              class="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Cập nhật ngay
            </button>
            <button
              @click="closeToast"
              class="rounded-lg bg-gray-200/70 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>