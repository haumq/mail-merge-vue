<script setup lang="ts">
import { onMounted, ref, watch, computed, markRaw } from 'vue'
import Gmail from './components/Gmail.vue'
import MailMerge from './components/MailMerge.vue'
import QR from './components/Qr.vue'
import UpdateToast from './components/UpdateToast.vue'

const updaterRef = ref<InstanceType<typeof UpdateToast> | null>(null)

const menuExpanded = ref(true)
const darkMode = ref(false)
const selectedMail = ref('Gmail')
const selectedUtility = ref<string | null>(null)
const mailServices = [
  { name: 'Gmail', icon: 'gmail', iconClass: 'text-red-500' },
  { name: 'Outlook', icon: 'outlook', iconClass: 'text-blue-500' },
]
// Thêm tiện ích mới vào danh sách này để tự động dùng được ở menu và nội dung.
const utilities = [
  { id: 'qr', label: 'Tạo QR', component: markRaw(QR) },
]

const activeTabComponent = computed(() => {
  const utility = utilities.find(({ id }) => id === selectedUtility.value)
  if (utility) return markRaw(utility.component)
  return selectedMail.value === 'Gmail' ? markRaw(Gmail) : markRaw(MailMerge)
})

onMounted(() => {
  const savedMail = localStorage.getItem('selectedMail')
  const savedUtility = localStorage.getItem('selectedUtility')

  if (savedMail && mailServices.some((mail) => mail.name === savedMail)) {
    selectedMail.value = savedMail
  }
  if (savedUtility !== null) {
    // Tương thích với giá trị boolean đã lưu ở phiên bản trước.
    selectedUtility.value = savedUtility === 'true' ? 'qr' : savedUtility
  }

  const savedDarkMode = localStorage.getItem('darkMode')
  darkMode.value = savedDarkMode === null
    ? document.documentElement.classList.contains('dark')
    : savedDarkMode === 'true'
  applyDarkMode()
  // Tự động kiểm tra bản mới ở chế độ im lặng khi vừa mở app
  updaterRef.value?.checkForUpdates(true)
})
// Cho nút bấm kiểm tra cập nhật thủ công ở Sidebar/Setting
function manualCheckUpdate() {
  updaterRef.value?.checkForUpdates(false)
}

watch(selectedMail, (mail) => {
  localStorage.setItem('selectedMail', mail)
})

watch(selectedUtility, (utility) => {
  if (utility) localStorage.setItem('selectedUtility', utility)
  else localStorage.removeItem('selectedUtility')
})

function applyDarkMode() {
  document.documentElement.classList.toggle('dark', darkMode.value)
  document.body.classList.toggle('dark', darkMode.value)
  document.documentElement.style.colorScheme = darkMode.value ? 'dark' : 'light'
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  applyDarkMode()
  localStorage.setItem('darkMode', String(darkMode.value))
}
</script>

<template>
  <main
    class="h-screen overflow-hidden dark:bg-gray-900 dark:text-gray-100 bg-gray-50 text-gray-900">
    <div class="flex h-full min-h-0">
      <aside
        id="mail-menu"
        class="relative shrink-0 select-none overflow-hidden border-r border-gray-200 bg-white p-3 transition-[width] duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800"
        :class="[menuExpanded ? 'w-56' : 'w-16', { 'is-collapsing': !menuExpanded }]"
      >
        <button
          type="button"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-[left,transform] duration-300 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          :aria-expanded="menuExpanded"
          aria-controls="mail-menu"
          :aria-label="menuExpanded ? 'Thu gọn menu' : 'Mở rộng menu'"
          :title="menuExpanded ? 'Thu gọn menu' : 'Mở rộng menu'"
          @click="menuExpanded = !menuExpanded"
        >
          <svg v-if="menuExpanded" aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-4 w-4">
            <path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-4 w-4">
            <path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <nav aria-label="Menu" class="space-y-4 mt-6">
          <section aria-label="Gửi mail">
            <h2 class="mb-2 whitespace-nowrap px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ menuExpanded ? 'Gửi mail' : '\u00a0' }}</h2>
            <div class="space-y-1">
              <button
                v-for="mail in mailServices"
                :key="mail.name"
                type="button"
                class="flex w-full items-center gap-3 whitespace-nowrap rounded-lg border border-transparent py-2 text-sm transition-colors"

                :class="[menuExpanded ? 'px-2' : 'justify-left px-2',
                  !selectedUtility && selectedMail === mail.name
                    ? 'border-blue-200 bg-blue-100 font-medium text-blue-700 shadow-sm dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                ]"
                :aria-label="mail.name"
                :aria-current="!selectedUtility && selectedMail === mail.name ? 'page' : undefined"
                @click="selectedMail = mail.name; selectedUtility = null"
              >
                <svg v-if="mail.icon === 'gmail'" aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0" :class="mail.iconClass">
                  <path d="M3 18V6l9 7 9-7v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <svg v-else aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0" :class="mail.iconClass">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8 10v4m-2-2h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <Transition name="menu-label">
                  <span v-if="menuExpanded" class="whitespace-nowrap">{{ mail.name }}</span>
                </Transition>
              </button>
            </div>            
          </section>

          <section aria-label="Tiện ích khác">
            <h2 class="mb-2 whitespace-nowrap px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ menuExpanded ? 'Tiện ích khác' : '\u00a0' }}</h2>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-transparent py-2 text-sm transition-colors"
       
              :class="[menuExpanded ? 'px-3' : 'justify-left px-2',
                selectedUtility
                  ? 'border-blue-200 bg-blue-100 font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
              ]"
              aria-label="Tạo QR"
              :aria-current="selectedUtility ? 'page' : undefined"
              @click="selectedUtility = 'qr'"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M14 14h3v3h-3zM19 14v2m2 2h-3m-4 3h3m3-4v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <Transition name="menu-label">
                <span v-if="menuExpanded" class="whitespace-nowrap">Tạo QR</span>
              </Transition>
            </button>
                      
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-transparent py-2 text-sm transition-colors"
              :class="[menuExpanded ? 'px-3' : 'justify-left px-2']"
              @click="toggleDarkMode"
            >
              <Transition name="dark-mode-icon" mode="out-in">
                <svg v-if="darkMode" key="dark" aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0">
                  <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                </svg>
                <svg v-else key="light" aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </Transition>
              <Transition name="menu-label">
                <span v-if="menuExpanded" class="whitespace-nowrap">{{ darkMode ? 'Màn hình tối' : 'Màn hình sáng' }}</span>
              </Transition>
            </button>
             <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-transparent py-2 text-sm transition-colors"
              :class="[menuExpanded ? 'px-3' : 'justify-left px-2']"
              aria-label="Kiểm tra cập nhật"
              :title="'Kiểm tra cập nhật'"
              @click="manualCheckUpdate()"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0">
                <path d="M12 3a9 9 0 0 1 8.2 12.8M12 21a9 9 0 0 1-8.2-12.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M3 6.5h3.5L8 4.5m13 11h-3.5L16 19.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <Transition name="menu-label">
                <span v-if="menuExpanded" class="whitespace-nowrap">Kiểm tra cập nhật</span>
              </Transition>
            </button>
          </section>
        </nav>        
      </aside>

      <section class="flex min-h-0 min-w-0 flex-1 flex-col px-4">
        <main class="min-h-0 flex-1 overflow-y-auto">              
          <KeepAlive :max="2">
            <component :is="activeTabComponent" />
          </KeepAlive>
        </main>
      </section>
      <!-- Component Toast Cập Nhật -->
    <UpdateToast ref="updaterRef" />
    </div>
  </main>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  aside {
    transition-duration: 0.01ms;
  }

  .menu-label-enter-active,
  .menu-label-leave-active {
    transition-duration: 0.01ms;
  }

  .menu-label-enter-from,
  .menu-label-leave-to {
    opacity: 0;
    transform: translateX(-0.25rem);
  }

  .dark-mode-icon-enter-active,
  .dark-mode-icon-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
    transform-origin: center bottom;
  }

  .dark-mode-icon-enter-from,
  .dark-mode-icon-leave-to {
    opacity: 0;
    transform: translateY(0.45rem) rotate(-30deg) scale(0.75);
  }
}

@media (prefers-reduced-motion: no-preference) {
  aside.is-collapsing {
    transition-delay: 10ms;
  }

  .menu-label-enter-active,
  .menu-label-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .dark-mode-icon-enter-active,
  .dark-mode-icon-leave-active {
    transition: opacity 420ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: center bottom;
  }

  .dark-mode-icon-enter-from {
    opacity: 0;
    transform: translateY(0.45rem) rotate(-30deg) scale(0.75);
  }

  .dark-mode-icon-leave-to {
    opacity: 0;
    transform: translateY(0.45rem) rotate(30deg) scale(0.75);
  }
}
</style>