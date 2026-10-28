<template>
  <div class="p-4 sm:p-6 mx-auto space-y-6 font-sans w-full">
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
      class="fixed right-4 bottom-4 z-[60] min-w-[260px] max-w-[320px] rounded-xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-emerald-900/40 dark:bg-gray-900/95"
      :class="toast.type === 'error' ? 'border-rose-200 text-rose-700 dark:border-rose-900/40 dark:text-rose-300' : toast.type === 'info' ? 'border-sky-200 text-sky-700 dark:border-sky-900/40 dark:text-sky-300' : 'border-emerald-200 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-300'"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start gap-3">
        <span class="text-lg leading-none">{{ toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅' }}</span>
        <div class="text-sm font-medium leading-5">{{ toast.message }}</div>
      </div>
    </div>
    </Transition>

    <!-- KHỐI 1: HEADER & TÀI KHOẢN GOOGLE / GMAIL (FIXED STICKY TOP-0) -->
    <div class="sticky top-0 z-30 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/75 dark:bg-gray-800/75 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <!-- State 1: Đang nạp Auth -->
      <div v-if="authLoading" class="flex items-center gap-3 animate-pulse">
        <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="space-y-2">
          <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- State 2: Đã đăng nhập Google -->
      <div 
        ref="menuRef" 
        v-else-if="userInfo" 
        class="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 cursor-pointer w-full lg:w-auto"
        @click="toggleMenu = !toggleMenu"
      >
        <div class="flex items-center gap-3">
          <div class="relative">
            <img 
              v-if="userInfo.avatar" 
              :src="userInfo.avatar" 
              :alt="userInfo.name"
              class="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div 
              v-else 
              class="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm"
            >
              {{ userInfo.name.charAt(0).toUpperCase() }}
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
                {{ userInfo.name }}
              </h3>
              <span class="px-2 py-0.5 text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                Đã kết nối Gmail API
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ userInfo.email }}
            </p>
          </div>
        </div>

        <!-- Popup Menu Đăng xuất -->
        <div 
          v-if="toggleMenu" 
          class="lg:absolute top-0 lg:left-0 mt-6 lg:mt-16 w-full lg:-ml-4 lg:max-w-sm bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs z-50"
        >
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 text-gray-700 dark:text-gray-300 rounded-md transition-colors font-medium cursor-pointer mb-2"
            @click.stop="logout"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Đăng xuất Tài khoản Google
          </button>
          <!-- Nút 2: Đăng xuất hoàn toàn -->
        <button @click.stop="logoutCompletely" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 text-rose-600 rounded-md transition-colors font-medium cursor-pointer">
        Thoát hoàn toàn tài khoản Google
        </button>
        </div>
      </div>

      <!-- State 3: Chưa đăng nhập -->
      <div 
        v-else 
        class="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs max-w-md"
      >
        <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <div>
          <span class="font-bold block">Chưa đăng nhập Gmail</span>
          <span>Vui lòng kết nối tài khoản Google để thực hiện Mail Merge.</span>
        </div>
      </div>

      <!-- Nút Thực Hiện Mail Merge -->
      <div class="flex items-center gap-2 w-full sm:w-auto justify-center lg:justify-end">
        <button
          v-if="!userInfo"
          type="button"
          class="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          @click="login"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/></svg>
          Đăng nhập Google
        </button>

        <div v-else class="flex items-center gap-3">
          <button 
            v-if="failedRowIndices.length" 
            type="button"
            :disabled="loading"
            class="flex items-center gap-1.5 px-3 py-2 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            @click="resendFailedRows"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Gửi lại {{ failedRowIndices.length }} dòng lỗi
          </button>

          <button 
            type="button"
            :disabled="loading || !dataRows.length" 
            class="flex items-center gap-2 px-8 py-2.5 bg-rose-300 hover:bg-rose-400 dark:bg-rose-700/50 dark:hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md transition-all cursor-pointer"
            @click="submitExcel"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            {{ loading ? 'Đang gửi Gmail Mail Merge...' : 'Thực Hiện Mail Merge' }}
          </button>
        </div>
      </div>
    </div>
    
    <template v-if="userInfo">
        <!-- KHỐI 2: BẢNG DỮ LIỆU EXCEL TƯƠNG TÁC -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <h3 class="font-bold text-gray-900 dark:text-white text-base">
                Bảng Dữ Liệu Excel
              </h3>
              <span class="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {{ dataRows.length }} dòng
              </span>
            </div>
    
            <div class="flex items-center gap-2 flex-wrap">
              <button 
                type="button" 
                class="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                @click="downloadTemplate"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Tải Excel Mẫu
              </button>

              <input ref="fileInputRef" type="file" accept=".xlsx, .xls, .csv" class="hidden" @change="onFileChange" />
              <button 
                  type="button" 
                  class="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  @click="fileInputRef?.click()"
              >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  Tải Excel
              </button>

              <button 
                  type="button" 
                  class="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  @click="checkAllEmails"
              >
                  ✉️ Kiểm Tra Email
              </button>
      
              <button 
                  type="button" 
                  :disabled="isCheckingFiles"
                  class="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  @click="checkAllFilePaths"
              >
                  🔍 {{ isCheckingFiles ? 'Đang kiểm tra...' : 'Kiểm Tra File' }}
              </button>
      
              <button type="button" class="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer" @click="addRow">+ Thêm Dòng</button>
              <button type="button" class="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer" @click="addColumn">+ Thêm Cột</button>
            </div>
          </div>
    
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-900 p-2 rounded-lg text-xs">
              <div v-if="sheetNames.length > 1" class="flex items-center gap-2">
                <span class="font-semibold text-gray-500">Sheet:</span>
                <select v-model="selectedSheet" class="border rounded p-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" @change="loadSelectedSheet">
                  <option v-for="s in sheetNames" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div v-else class="text-gray-500">
                - Hỗ trợ nhập nhiều Email ở các cột <b>Email (To)</b>, <b>CC</b>, <b>BCC</b>, nhiều đường dẫn ở cột <b>File</b>, phân cách bằng dấu <code>;</code> hoặc <code>,</code>
                <br />- Sửa trực tiếp trong ô hoặc nháy đúp vào ô dữ liệu để mở Popup sửa nhanh, nhấn <code>Ctrl + S</code> để lưu thay đổi.
              </div>
    
              <div v-if="report" class="flex items-center gap-3">
                <span>Tổng: <b>{{ report.summary.total }}</b></span>
                <span class="text-emerald-600 font-bold">Thành công: {{ report.summary.success }}</span>
                <span v-if="report.summary.failed" class="text-rose-600 font-bold">Thất bại: {{ report.summary.failed }}</span>
              </div>
            </div>

            <!-- THANH CẢNH BÁO LỖI FILE -->
            <div v-if="missingFileCount > 0" class="flex items-center justify-between p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300">
              <span class="font-bold flex items-center gap-1">
                  ⚠️ Phát hiện {{ missingFileCount }} dòng có đường dẫn file đính kèm KHÔNG TỒN TẠI trên máy tính!
              </span>
              <span class="text-[11px] opacity-80">(Bấm vào biểu tượng lỗi ở bảng dưới để mở Popup sửa nhanh)</span>
            </div>

            <!-- THANH CẢNH BÁO LỖI EMAIL -->
            <div v-if="invalidEmailCount > 0" class="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-200">
              <span class="font-bold flex items-center gap-1">
                ⚠️ Phát hiện {{ invalidEmailCount }} dòng có địa chỉ Email (To, CC, BCC) bị sai định dạng hoặc trống!
              </span>
              <span class="text-[11px] opacity-80">(Bấm vào biểu tượng lỗi ở bảng dưới để mở Popup sửa nhanh)</span>
            </div>
    
            <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl max-h-[420px]">
              <table class="w-full text-xs text-left border-collapse">
                <thead class="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th class="p-2 w-10 text-center border-r border-b border-gray-200 dark:border-gray-700 font-mono text-gray-400">#</th>
                    <th v-for="(header, colIdx) in columnHeaders" :key="colIdx" class="p-1 border-r border-b border-gray-200 dark:border-gray-700 min-w-[140px]">
                      <div class="flex items-center justify-between group">
                        <input 
                          v-model="sheetRows[0]![colIdx]" 
                          type="text" 
                          :title="header || `Column ${colIdx + 1}`"
                          :aria-label="header || `Column ${colIdx + 1}`"
                          class="font-bold w-full bg-transparent p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" 
                        />
                        <button 
                          type="button" 
                          class="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer" 
                          @click="removeColumn(colIdx)"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                    <th class="p-2 border-b border-gray-200 dark:border-gray-700 w-28 text-center text-gray-700 dark:text-gray-200">Trạng Thái</th>
                    <th class="p-2 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  <tr v-for="(_, rowIdx) in dataRows" :key="rowIdx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="p-2 text-center border-r border-gray-200 dark:border-gray-700 font-mono text-gray-400 bg-gray-50 dark:bg-gray-900/50">{{ rowIdx + 1 }}</td>
                    <td 
                      v-for="colIdx in columnHeaders.length" 
                      :key="colIdx" 
                      class="p-0 border-r border-gray-200 dark:border-gray-700 relative"
                      :class="{
                          'bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-400': 
                          (fileCheckResults[rowIdx] && !fileCheckResults[rowIdx].valid && isFileColumn(colIdx - 1)) ||
                          (emailCheckResults[rowIdx] && emailCheckResults[rowIdx].invalidColIndices.includes(colIdx - 1))
                      }"
                    >
                      <div class="relative flex items-center">
                          <input
                            v-model="sheetRows[rowIdx + 1]![colIdx - 1]"
                            :data-cell="`${rowIdx},${colIdx - 1}`"
                            type="text"
                            class="w-full p-2 border-none bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                            @keydown="handleCellKeydown($event, rowIdx, colIdx - 1)"
                            @paste="handleCellPaste($event, rowIdx, colIdx - 1)"
                            @change="onCellDataChange"
                            @dblclick="openEditModal(rowIdx, colIdx - 1)"
                          />

                          <button 
                            v-if="fileCheckResults[rowIdx] && !fileCheckResults[rowIdx].valid && isFileColumn(colIdx - 1)"
                            type="button"
                            class="pr-1 text-rose-500 text-xs font-bold hover:scale-125 transition-transform cursor-pointer shrink-0"
                            :title="`File không tồn tại: ${fileCheckResults[rowIdx].missingFiles.join(', ')} (Bấm để sửa trong Popup)`"
                            @click.stop="openEditModal(rowIdx, colIdx - 1)"
                          >
                            ⚠️
                          </button>

                          <button 
                            v-if="emailCheckResults[rowIdx] && emailCheckResults[rowIdx].invalidColIndices.includes(colIdx - 1)"
                            type="button"
                            class="pr-1.5 text-amber-500 text-xs font-bold hover:scale-125 transition-transform cursor-pointer shrink-0"
                            :title="`${emailCheckResults[rowIdx].colErrors[colIdx - 1] || 'Email không hợp lệ'} (Bấm để sửa trong Popup)`"
                            @click.stop="openEditModal(rowIdx, colIdx - 1)"
                          >
                            ✉️!
                          </button>
                      </div>
                    </td>
                    <td class="p-2 text-center border-r border-gray-200 dark:border-gray-700 font-semibold">
                      <span 
                        v-if="rowStatuses[rowIdx]" 
                        :class="rowStatuses[rowIdx] === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'"
                        class="px-2 py-0.5 rounded text-[11px]"
                      >
                        {{ rowStatuses[rowIdx] }}
                      </span>
                      <span v-else class="text-gray-400 font-normal">Chờ gửi</span>
                    </td>
                    <td class="p-1 text-center">
                      <button type="button" class="text-gray-400 hover:text-rose-500 p-1 cursor-pointer" @click="removeRow(rowIdx)">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
    
        <!-- KHỐI 3: TRÌNH SOẠN THẢO EMAIL GMAIL (TINYMCE 7) -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden flex flex-col">
          <!-- 1. Thanh tiêu đề cửa sổ Compose -->
          <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-rose-950 text-gray-700 dark:text-white shadow-xs">
            <div class="flex items-center gap-2.5">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-bold text-sm shadow-2xs">
                ✉️
              </span>
              <div>
                <h3 class="font-bold text-sm tracking-wide flex items-center gap-2">
                  <span>Mẫu Email Gmail Mới</span>
                  <span class="text-[10px] font-normal px-2 py-0.5 rounded-full bg-gray-500/20 dark:bg-white/20 dark:text-rose-100 border border-white/10">Google Mail Standard</span>
                </h3>
              </div>
            </div>
    
            <div class="flex items-center bg-gray-400/20 dark:bg-black/20 backdrop-blur-md p-1 rounded-lg text-xs dark:border dark:border-white/10">
              <button
                type="button"
                class="px-3 py-1 rounded-md font-medium transition-all cursor-pointer"
                :class="editorMode === 'visual' ? 'bg-white text-rose-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700 dark:text-rose-100 dark:hover:text-white dark:hover:bg-white/10'"
                @click="editorMode = 'visual'"
              >
                ✏️ Soạn Trực Quan
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md font-medium transition-all cursor-pointer"
                :class="editorMode === 'code' ? 'bg-white text-rose-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700 dark:text-rose-100 dark:hover:text-white dark:hover:bg-white/10'"
                @click="editorMode = 'code'"
              >
                &lt;/&gt; Mã HTML
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md font-medium transition-all cursor-pointer"
                :class="editorMode === 'preview' ? 'bg-white text-rose-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700 dark:text-rose-100 dark:hover:text-white dark:hover:bg-white/10'"
                @click="editorMode = 'preview'"
              >
                👁️ Xem Trước
              </button>
            </div>
          </div>
    
          <!-- 2. Khung địa chỉ & Chủ đề Email -->
          <div v-show="editorMode === 'visual' || editorMode === 'code'" class="divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-xs">
            <div class="flex items-center gap-3 px-4 py-2 text-gray-500 dark:text-gray-400">
              <span class="font-semibold text-gray-400 dark:text-gray-500 w-20 shrink-0">Người nhận:</span>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60 font-medium text-[11px]">
                  <span>To:</span>
                  <span class="font-bold text-rose-900 dark:text-rose-200">Cột Email trong Excel</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px]">
                  <span>CC:</span>
                  <span>Cột CC (Tùy chọn)</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px]">
                  <span>BCC:</span>
                  <span>Cột BCC (Tùy chọn)</span>
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900">
              <label for="subject-input" class="font-semibold text-gray-600 dark:text-gray-300 w-16 shrink-0">Chủ đề:</label>
              <input
                id="subject-input"
                ref="subjectInputRef"
                v-model="subjectTemplate"
                type="text"
                placeholder="Nhập tiêu đề email ở đây (Ví dụ: Thông báo gửi tới {{Họ và Tên}})..."
                class="w-full text-sm font-medium bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                @focus="lastFocusedField = 'subject'"
              />
            </div>

            <!-- Thanh Chèn Biến Smart Chips -->
            <div v-show="editorMode === 'visual'" class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50 dark:bg-gray-800/80 border-t border-b border-gray-200/60 dark:border-gray-700/60">
              <div class="flex items-center gap-2 flex-wrap justify-start">
                <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1 shrink-0">
                  <span>⚡ Chèn biến Excel:</span>
                </span>
                
                <div v-if="columnHeaders.length" class="flex flex-wrap gap-1.5 items-center">
                  <button
                    v-for="(header, idx) in columnHeaders"
                    :key="idx"
                    type="button"
                    @mousedown.prevent
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-gray-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-gray-700 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-300 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 rounded-full text-xs font-mono transition-all shadow-2xs cursor-pointer select-none"
                    @click="insertPlaceholder(String(header || `Cột ${idx + 1}`))"
                  >
                    <span class="text-rose-600 font-bold">+</span> &#123;&#123;{{ header || `Cột ${idx + 1}` }}&#125;&#125;
                  </button>
                </div>
              </div>

              <div class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0 ml-auto">
                <span>Đang chèn vào:</span>
                <span 
                  class="font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                  :class="lastFocusedField === 'subject' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'"
                >
                  {{ lastFocusedField === 'subject' ? 'Tiêu đề Subject' : 'Nội dung Email' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 3. Canvas Trình Soạn Thảo TinyMCE 7 -->
          <div class="p-0 bg-white dark:bg-gray-900 flex-1">
            <div v-show="editorMode === 'visual'" class="relative w-full min-h-[450px] bg-white dark:bg-gray-900">
              <div v-if="tinymceError" class="p-2.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span class="font-medium">⚠️ Không thể nạp TinyMCE CDN. Hệ thống đã chuyển sang Trình soạn thảo dự phòng.</span>
                <button type="button" class="underline font-semibold cursor-pointer" @click="retryLoadTinyMCE">Thử nạp lại</button>
              </div>

              <div v-show="!tinymceError" class="w-full h-full min-h-[450px]">
                <textarea id="mail-editor" v-model="bodyTemplate"></textarea>
              </div>

              <div v-if="tinymceError" class="p-3 bg-white dark:bg-gray-900 space-y-2">
                <textarea
                  ref="fallbackTextareaRef"
                  v-model="bodyTemplate"
                  rows="14"
                  class="w-full p-3 font-mono text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none"
                  placeholder="Soạn thảo nội dung HTML..."
                  @focus="lastFocusedField = 'body'"
                ></textarea>
              </div>
            </div>
    
            <div v-show="editorMode === 'code'" class="p-3 bg-gray-900">
              <textarea
                v-model="bodyTemplate"
                rows="16"
                class="font-mono text-xs w-full p-3 border-none rounded-lg bg-gray-900 text-emerald-400 focus:outline-none leading-relaxed"
                placeholder="<html>...</html>"
                @focus="lastFocusedField = 'body'"
              ></textarea>
            </div>
    
            <!-- MÀN HÌNH XEM TRƯỚC (LIVE PREVIEW) -->
            <div v-show="editorMode === 'preview'" class="p-4 space-y-3 bg-gray-100 dark:bg-gray-950 min-h-[450px]">
              <div class="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs shadow-2xs">
                <span class="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Xem trước dữ liệu dòng:
                </span>
                <div class="flex items-center gap-2">
                  <button 
                    type="button"
                    :disabled="previewIndex === 0"
                    class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 transition-colors cursor-pointer" 
                    @click="previewIndex--"
                  >
                    ◀
                  </button>
                  <span class="font-mono font-bold text-rose-600 dark:text-rose-400 px-2">#{{ previewIndex + 1 }} / {{ dataRows.length || 1 }}</span>
                  <button 
                    type="button"
                    :disabled="previewIndex >= dataRows.length - 1 || !dataRows.length"
                    class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 transition-colors cursor-pointer" 
                    @click="previewIndex++"
                  >
                    ▶
                  </button>
                </div>
              </div>
    
              <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-md">
                <div class="bg-gray-50 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-800 text-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-sm text-gray-900 dark:text-white">{{ previewMerged.subject || '(Trống tiêu đề)' }}</h4>
                    <span class="text-[11px] text-gray-400 font-medium">Xem trước Gmail Live</span>
                  </div>
                  <div class="text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                    <span class="text-gray-400 w-20 inline-block">Gửi tới (To):</span>
                    <span class="font-semibold text-rose-600 dark:text-rose-400">{{ previewRecipientDetails.to }}</span>
                  </div>
                  <div v-if="previewRecipientDetails.cc" class="text-gray-600 dark:text-gray-300">
                    <span class="text-gray-400 w-20 inline-block">CC:</span>
                    <span class="font-medium">{{ previewRecipientDetails.cc }}</span>
                  </div>
                  <div v-if="previewRecipientDetails.bcc" class="text-gray-600 dark:text-gray-300">
                    <span class="text-gray-400 w-20 inline-block">BCC:</span>
                    <span class="font-medium">{{ previewRecipientDetails.bcc }}</span>
                  </div>

                  <!-- DANH SÁCH FILE ĐÍNH KÈM CHUNG & RIÊNG -->
                  <div class="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex flex-wrap items-start gap-2">
                    <span class="text-gray-400 w-20 inline-block shrink-0 pt-0.5">Đính kèm:</span>
                    <div v-if="previewAttachments.length" class="flex flex-wrap gap-1.5 flex-1">
                      <span 
                        v-for="(att, aIdx) in previewAttachments" 
                        :key="aIdx"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border shadow-2xs"
                        :class="att.isCommon 
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80' 
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80'"
                      >
                        <span class="font-bold">{{ att.isCommon ? '📎 [Chung]' : '📄 [Riêng]' }}</span>
                        <span class="truncate max-w-[220px]" :title="att.name">{{ att.name }}</span>
                        <span v-if="att.size" class="text-[10px] opacity-70">({{ (att.size / 1024).toFixed(1) }} KB)</span>
                      </span>
                    </div>
                    <span v-else class="text-gray-400 italic">Không có file đính kèm</span>
                  </div>
                </div>

                <div class="preview-canvas p-6 text-sm font-sans min-h-[260px] text-gray-900 dark:text-gray-100 leading-relaxed" v-html="previewMerged.renderedHtml"></div>
              </div>
            </div>
          </div>

          <!-- 4. Thanh Tệp Đính Kèm Chung & Footer -->
          <div v-show="editorMode === 'visual' || editorMode === 'code'" class="p-3 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3 flex-wrap">
              <input ref="attachmentInputRef" type="file" multiple class="hidden" @change="onAttachmentChange" />
              <button 
                type="button" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs transition-colors cursor-pointer"
                @click="attachmentInputRef?.click()"
              >
                📎 Thêm tệp đính kèm chung
              </button>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">
                (Gửi kèm chung cho tất cả danh sách email)
              </span>
            </div>

            <div v-if="commonAttachments.length" class="flex flex-wrap gap-1.5 items-center">
              <div
                v-for="(file, idx) in commonAttachments"
                :key="idx"
                class="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full text-xs shadow-2xs"
              >
                <span class="font-medium text-gray-700 dark:text-gray-200 max-w-[160px] truncate" :title="file.name">
                  📄 {{ file.name }}
                </span>
                <span class="text-[10px] text-gray-400">
                  ({{ (file.size / 1024).toFixed(1) }} KB)
                </span>
                <button
                  type="button"
                  class="text-gray-400 hover:text-rose-500 transition-colors ml-0.5 p-0.5 font-bold cursor-pointer"
                  title="Xóa tệp này"
                  @click="removeAttachment(idx)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
    </template>

    <!-- MODAL 1: SỬA Ô DỮ LIỆU -->
    <div 
      v-if="editModal.show" 
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="editModal.show = false"
    >
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">✏️</span>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-base">
                Chỉnh Sửa Ô Dữ Liệu
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Dòng <b>#{{ editModal.rowIdx + 1 }}</b> - Cột <b>{{ editModal.headerName }}</b>
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1 cursor-pointer"
            @click="editModal.show = false"
          >
            ✕
          </button>
        </div>

        <div v-if="editModal.errorMessage" class="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <span class="text-base shrink-0">⚠️</span>
          <div>
            <span class="font-bold block">Chi tiết lỗi:</span>
            <span>{{ editModal.errorMessage }}</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Nội dung ô dữ liệu (Nhấn <code>Ctrl + S</code> để lưu nhanh, <code>Esc</code> để hủy):
          </label>
          <textarea
            v-model="editModal.value"
            rows="7"
            class="w-full p-3 font-mono text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Nhập nội dung ô..."
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            @click="editModal.show = false"
          >
            Hủy Bỏ (Esc)
          </button>
          <button
            type="button"
            class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            @click="saveEditModal"
          >
            Lưu & Cập Nhật (Ctrl + S)
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: XÁC NHẬN CHẮC CHẮN GỬI MAIL MERGE QUA GMAIL -->
    <div 
      v-if="confirmSendModal.show" 
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="confirmSendModal.show = false"
    >
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-lg font-bold">
              🚀
            </span>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-base">
                Xác Nhận Thực Hiện Gmail Mail Merge
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Kiểm tra thông tin trước khi bắt đầu gửi qua Google Gmail API
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1 cursor-pointer"
            @click="confirmSendModal.show = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Thông tin tổng quan -->
          <div class="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl space-y-2 border border-gray-200/60 dark:border-gray-700/60">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Tài khoản gửi:</span>
              <span class="font-bold text-gray-800 dark:text-gray-200">{{ userInfo?.email }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Số lượng Email sẽ gửi:</span>
              <span class="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                {{ confirmSendModal.isResend ? failedRowIndices.length : dataRows.length }} dòng
              </span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
              <span class="text-gray-500 dark:text-gray-400">Mẫu tiêu đề:</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[220px]" :title="subjectTemplate">
                {{ subjectTemplate || '(Trống tiêu đề)' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">Tệp đính kèm chung:</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">
                {{ commonAttachments.length }} file
              </span>
            </div>
          </div>

          <!-- Các cảnh báo nếu có -->
          <div v-if="missingFileCount > 0" class="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <span class="text-base shrink-0">⚠️</span>
            <div>
              <span class="font-bold block">Có {{ missingFileCount }} dòng bị lỗi đường dẫn file!</span>
              <span class="text-[11px] opacity-90">Các file không tồn tại sẽ bị bỏ qua khi gửi.</span>
            </div>
          </div>

          <div v-if="invalidEmailCount > 0" class="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <span class="text-base shrink-0">✉️!</span>
            <div>
              <span class="font-bold block">Có {{ invalidEmailCount }} dòng chứa Email bị sai định dạng!</span>
              <span class="text-[11px] opacity-90">Các địa chỉ bị trống/lỗi sẽ khiến dòng đó gửi thất bại.</span>
            </div>
          </div>

          <p class="text-gray-500 dark:text-gray-400 italic pt-1">
            * Nhấn <b>"Xác Nhận Gửi"</b> để bắt đầu đóng gói RFC 822 MIME và gửi từng email qua Google Gmail REST API.
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            @click="confirmSendModal.show = false"
          >
            Hủy Bỏ (Esc)
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            @click="handleConfirmSend"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            Xác Nhận Gửi Mail
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
// import { listen } from '@tauri-apps/api/event'
// import { openUrl } from '@tauri-apps/plugin-opener'
// import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch, onDeactivated, onActivated } from 'vue'
import ExcelJS from 'exceljs'

// Lấy Client ID từ biến môi trường của Vite
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// State Đăng Nhập Google (OAuth 2.0)
const toast = ref<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({
  show: false,
  type: 'success',
  message: ''
})
let toastTimeout: number | null = null

function showToast(type: 'success' | 'error' | 'info', message: string) {
  toast.value = { show: true, type, message }
  if (toastTimeout !== null) {
    window.clearTimeout(toastTimeout)
  }
  toastTimeout = window.setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const toggleMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const authLoading = ref(true)
const googleAccessToken = ref<string | null>(null)
const userInfo = ref<{ name: string; email: string; avatar: string | null } | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    toggleMenu.value = false
  }
}

// KHỞI TẠO VA KHÔI PHỤC PHIÊN LÀM VIỆC
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleModalKeydown)

  // 1. Khôi phục phiên làm việc từ Storage
  const savedToken = localStorage.getItem('gmail_access_token') || sessionStorage.getItem('gmail_access_token')
  const savedUser = localStorage.getItem('gmail_user_info') || sessionStorage.getItem('gmail_user_info')

  if (savedToken) {
    googleAccessToken.value = savedToken
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
      } catch {
        await loadGoogleUserInfo(savedToken)
      }
    } else {
      await loadGoogleUserInfo(savedToken)
    }
  }

  // 2. Dọn dẹp URL hash nếu bị sót
  if (window.location.hash.includes('access_token=')) {
    window.history.replaceState(null, '', window.location.pathname)
  }

  authLoading.value = false
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleModalKeydown)
})

async function loadGoogleUserInfo(token: string) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      userInfo.value = {
        name: data.name || 'Google User',
        email: data.email || '',
        avatar: data.picture || null
      }
      // 💾 Lưu Token & Thống tin User đồng bộ
      localStorage.setItem('gmail_access_token', token)
      localStorage.setItem('gmail_user_info', JSON.stringify(userInfo.value))
      sessionStorage.setItem('gmail_access_token', token)
      sessionStorage.setItem('gmail_user_info', JSON.stringify(userInfo.value))
    } else {
      // Token hết hạn
      logout()
    }
  } catch (err) {
    console.error('Lỗi lấy thông tin Google User:', err)
  }
}


import { listen, type UnlistenFn } from '@tauri-apps/api/event'
// import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

// const googleAccessToken = ref<string>(localStorage.getItem('gmail_access_token') || '')
// const userInfo = ref<any>(null)

let unlistenOAuth: UnlistenFn | null = null

onMounted(async () => {
  unlistenOAuth = await listen<string>('oauth-token-received', async (event) => {
    const url = event.payload || ''
    if (url.includes('access_token=')) {
      const hash = url.substring(url.indexOf('#'))
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')

      if (token) {
        googleAccessToken.value = token
        localStorage.setItem('gmail_access_token', token)
        localStorage.removeItem('gmail_force_reauth') // 💥 Cờ riêng cho Gmail
        await loadGoogleUserInfo(token)
      }
    }
  })

  if (googleAccessToken.value) {
    await loadGoogleUserInfo(googleAccessToken.value)
  }
})

onBeforeUnmount(() => {
  if (unlistenOAuth) unlistenOAuth()
})

async function login() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return alert('Chưa cấu hình Client ID Google!')

  const isForceReauth = localStorage.getItem('gmail_force_reauth') === 'true'
  const redirectUri = 'http://localhost:1420'
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: scopes,
    prompt: isForceReauth ? 'consent select_account' : 'select_account'
  }).toString()

  await invoke('open_oauth_popup', {
    url: authUrl,
    title: 'Đăng nhập Google Mail',
    windowLabel: 'google-oauth-popup',
    provider: 'gmail', // 👈 Dùng để phân biệt với các OAuth khác trong Tauri
    incognito: isForceReauth // 👈 Ép mở ẩn danh nếu người dùng vừa chọn "Thoát hoàn toàn"
  })
}

// async function loadGoogleUserInfo(token: string) {
//   try {
//     const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     if (res.ok) {
//       userInfo.value = await res.json()
//     }
//   } catch (err) {
//     console.error('Lỗi tải thông tin user:', err)
//   }
// }

function logout() {
  googleAccessToken.value = null
  userInfo.value = null
  localStorage.removeItem('gmail_access_token')
  localStorage.removeItem('gmail_user_info')
  sessionStorage.removeItem('gmail_access_token')
  sessionStorage.removeItem('gmail_user_info')
  toggleMenu.value = false
}

// 3. HÀM ĐĂNG XUẤT HOÀN TOÀN (Xóa sạch tài khoản khỏi WebView2)
async function logoutCompletely() {
  // Xóa Token local
  logout()

  // Gọi Rust xóa Session Cookie ngầm
  localStorage.setItem('gmail_force_reauth', 'true')
  showToast('info', 'Đã thoát hoàn toàn tài khoản Google!')
}

// 📥 TẢI FILE EXCEL MẪU
async function downloadTemplate() {
  try {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('MailMergeTemplate')

    ws.columns = [
      { header: 'Email', key: 'email', width: 35 },
      { header: 'CC', key: 'cc', width: 25 },
      { header: 'BCC', key: 'bcc', width: 25 },
      { header: 'File', key: 'file', width: 40 },
      { header: 'Họ và Tên', key: 'fullname', width: 22 },
      { header: 'Tiêu đề', key: 'subject', width: 15 }
    ]

    const headerRow = ws.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    headerRow.height = 24
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' }
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colNumber <= 4 ? 'FFF59E0B' : 'FF059669' }
      }
    })

    ws.addRow({
      email: 'khachhang1@gmail.com; khachhang1_sub@gmail.com',
      cc: 'quanly@company.com',
      bcc: 'giamsat@company.com',
      file: 'C:/Documents/BaoCao_VIP01.pdf',
      fullname: 'Nguyễn Văn A',
      subject: 'Báo cáo tiến độ dự án '
    })

    ws.addRow({
      email: 'tranthib@gmail.com',
      cc: 'troly@company.com',
      bcc: '',
      file: 'D:/Files/ThongBao_VIP02.pdf; D:/Files/ChiTiet_TB001.pdf',
      fullname: 'Trần Thị B',
      subject: 'Thông báo quan trọng gửi tới'
    })

    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        }
      })
    })

    const buffer = await wb.xlsx.writeBuffer()
    const uint8Array = new Uint8Array(buffer)

    const showSaveFilePicker = (window as any).showSaveFilePicker
    if (typeof showSaveFilePicker === 'function') {
      try {
        const fileHandle = await showSaveFilePicker({
          suggestedName: 'Mau_Import_MailMerge.xlsx',
          types: [{
            description: 'Excel Workbook',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
          }]
        })
        const writable = await fileHandle.createWritable()
        await writable.write(uint8Array)
        await writable.close()
        alert('✅ Đã tải và lưu file Excel mẫu thành công!')
        return
      } catch (saveErr: any) {
        if (saveErr?.name === 'AbortError') return
      }
    }

    const blob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'Mau_Import_MailMerge.xlsx'
    document.body.appendChild(downloadLink)
    downloadLink.click()

    setTimeout(() => {
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)
    }, 200)

  } catch (err: any) {
    alert('Không thể tải file Excel mẫu: ' + (err?.message || err))
  }
}

// Editor State & Handlers
const editorMode = ref<'visual' | 'code' | 'preview'>('visual')
const subjectTemplate = ref('Thông báo quan trọng gửi tới {{Họ và Tên}}')
const bodyTemplate = ref('<p>Kính gửi <b>{{Họ và Tên}}</b>,</p><p>Mã xác nhận ưu đãi của bạn là: <b>{{Mã}}</b>.</p><p>Trân trọng!</p>')
const lastFocusedField = ref<'subject' | 'body'>('body')

const tinymceError = ref(false)
const fallbackTextareaRef = ref<HTMLTextAreaElement | null>(null)
const subjectInputRef = ref<HTMLInputElement | null>(null)

function insertPlaceholder(headerName: string) {
  const tag = `{{${headerName}}}`
  
  if (lastFocusedField.value === 'subject') {
    if (subjectInputRef.value) {
      const el = subjectInputRef.value
      const start = el.selectionStart ?? subjectTemplate.value.length
      const end = el.selectionEnd ?? subjectTemplate.value.length

      subjectTemplate.value = 
        subjectTemplate.value.substring(0, start) + 
        tag + 
        subjectTemplate.value.substring(end)

      nextTick(() => {
        el.focus()
        const newPos = start + tag.length
        el.setSelectionRange(newPos, newPos)
      })
    } else {
      subjectTemplate.value += tag
    }
  } else {
    if (!tinymceError.value && (window as any).tinymce && (window as any).tinymce.get('mail-editor')) {
      (window as any).tinymce.get('mail-editor').insertContent(tag)
    } else if (fallbackTextareaRef.value) {
      const el = fallbackTextareaRef.value
      const start = el.selectionStart ?? bodyTemplate.value.length
      const end = el.selectionEnd ?? bodyTemplate.value.length
      
      bodyTemplate.value = bodyTemplate.value.substring(0, start) + tag + bodyTemplate.value.substring(end)
      
      nextTick(() => {
        el.focus()
        const newPos = start + tag.length
        el.setSelectionRange(newPos, newPos)
      })
    } else {
      bodyTemplate.value += tag
    }
  }
}

// Attachments State
const attachmentInputRef = ref<HTMLInputElement | null>(null)
const commonAttachments = ref<File[]>([])

function onAttachmentChange(e: Event) {
  const files = (e.target as HTMLInputElement)?.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      if (files[i]) commonAttachments.value.push(files[i]!)
    }
  }
  if (e.target) (e.target as HTMLInputElement).value = ''
}

function removeAttachment(index: number) {
  commonAttachments.value.splice(index, 1)
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    txt: 'text/plain'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') {
    if (val.text !== undefined) return formatCellValue(val.text)
    if (val.hyperlink) return String(val.hyperlink).replace(/^mailto:/i, '').trim()
    if (Array.isArray(val.richText)) return val.richText.map((t: any) => t.text || '').join('').trim()
    if (val.result !== undefined) return formatCellValue(val.result)
    if (val instanceof Date) return val.toLocaleDateString()
  }
  return String(val).trim()
}

// Excel Grid State
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const sheetNames = ref<string[]>([])
const selectedSheet = ref('')
const workbook = ref<any>(null)
const sheetRows = ref<Array<Array<string>>>([
  ['Email', 'CC', 'BCC', 'Họ và Tên', 'Mã', 'File'],
  ['khachhang1@gmail.com; cty1@gmail.com', 'sep@company.com', 'giamsat@company.com', 'Nguyễn Văn A', 'VIP01', ''],
  ['khachhang2@gmail.com', 'troly@company.com', '', 'Trần Thị B', 'VIP02', '']
])
const rowStatuses = ref<Record<number, 'SUCCESS' | 'FAILED'>>({})
const columnHeaders = computed(() => sheetRows.value[0] || [])
const dataRows = computed(() => sheetRows.value.slice(1))
const failedRowIndices = computed(() => Object.keys(rowStatuses.value).map(Number).filter(index => rowStatuses.value[index] === 'FAILED'))
const previewIndex = ref(0)

function isEmailColumn(colIdx: number): boolean {
  const header = String(columnHeaders.value[colIdx] || '')
  return /email|mail|to|cc|bcc/i.test(header)
}

function isFileColumn(colIdx: number): boolean {
  const header = String(columnHeaders.value[colIdx] || '')
  return /filepath|file|dinhkem|đính kèm/i.test(header)
}

// MODAL SỬA Ô DỮ LIỆU
const editModal = ref<{
  show: boolean
  rowIdx: number
  colIdx: number
  headerName: string
  value: string
  errorMessage: string
}>({
  show: false,
  rowIdx: -1,
  colIdx: -1,
  headerName: '',
  value: '',
  errorMessage: ''
})

// MODAL XÁC NHẬN GỬI MAIL MERGE GMAIL
const confirmSendModal = ref<{
  show: boolean
  targetIndices?: number[]
  isResend: boolean
}>({
  show: false,
  targetIndices: undefined,
  isResend: false
})

function openEditModal(rowIdx: number, colIdx: number) {
  const header = String(columnHeaders.value[colIdx] || `Cột ${colIdx + 1}`)
  const val = sheetRows.value[rowIdx + 1]?.[colIdx] || ''
  
  let errorMsg = ''
  if (fileCheckResults.value[rowIdx] && !fileCheckResults.value[rowIdx].valid && isFileColumn(colIdx)) {
    errorMsg = `File không tồn tại: ${fileCheckResults.value[rowIdx].missingFiles.join(', ')}`
  } else if (emailCheckResults.value[rowIdx] && emailCheckResults.value[rowIdx].colErrors[colIdx]) {
    errorMsg = emailCheckResults.value[rowIdx].colErrors[colIdx] || 'Email không hợp lệ'
  }

  editModal.value = {
    show: true,
    rowIdx,
    colIdx,
    headerName: header,
    value: val,
    errorMessage: errorMsg
  }
}

function saveEditModal() {
  const { rowIdx, colIdx, value } = editModal.value
  if (rowIdx >= 0 && colIdx >= 0 && sheetRows.value[rowIdx + 1]) {
    const updatedRow = [...sheetRows.value[rowIdx + 1]!]
    updatedRow[colIdx] = value
    sheetRows.value[rowIdx + 1] = updatedRow
    sheetRows.value = [...sheetRows.value]

    onCellDataChange()
  }
  editModal.value.show = false
}

function handleModalKeydown(e: KeyboardEvent) {
  if (confirmSendModal.value.show && e.key === 'Escape') {
    e.preventDefault()
    confirmSendModal.value.show = false
    return
  }

  if (!editModal.value.show) return

  if (e.key === 'Escape') {
    e.preventDefault()
    editModal.value.show = false
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === 's') {
    e.preventDefault()
    saveEditModal()
  }
}

const previewRecipientDetails = computed(() => {
  if (!dataRows.value.length) return { to: 'nguoinhan@gmail.com', cc: '', bcc: '' }
  const row = dataRows.value[previewIndex.value] || []

  const findCol = (exactRegex: RegExp, fuzzyRegex: RegExp) => {
    const exact = columnHeaders.value.findIndex(h => exactRegex.test(String(h || '')))
    if (exact !== -1) return exact
    return columnHeaders.value.findIndex(h => fuzzyRegex.test(String(h || '')))
  }

  const toColIdx = findCol(/^email$|^mail$|^to$/i, /email|mail/i) !== -1 ? findCol(/^email$|^mail$|^to$/i, /email|mail/i) : 0
  const ccColIdx = findCol(/^cc$/i, /cc/i)
  const bccColIdx = findCol(/^bcc$/i, /bcc/i)

  const parseEmails = (idx: number) => {
    if (idx === -1) return ''
    const raw = String(row[idx] || '')
    return raw.split(/[;,]/).map(e => e.trim()).filter(Boolean).join('; ')
  }

  return {
    to: parseEmails(toColIdx) || 'nguoinhan@gmail.com',
    cc: parseEmails(ccColIdx),
    bcc: parseEmails(bccColIdx)
  }
})

const previewAttachments = computed(() => {
  const list: Array<{ name: string; size?: number; isCommon: boolean }> = []

  commonAttachments.value.forEach(file => {
    list.push({
      name: file.name,
      size: file.size,
      isCommon: true
    })
  })

  if (dataRows.value.length > 0) {
    const row = dataRows.value[previewIndex.value] || []
    const fileColIdx = columnHeaders.value.findIndex(h => /filepath|file|dinhkem|đính kèm/i.test(String(h || '')))
    
    if (fileColIdx !== -1 && row[fileColIdx]) {
      const rawPaths = String(row[fileColIdx]).trim()
      if (rawPaths) {
        const pathList = rawPaths.split(/[;,\r\n]+/).map(p => p.trim().replace(/^["']|["']$/g, '')).filter(Boolean).map(p => p.trim()).filter(Boolean)
        pathList.forEach(singlePath => {
          const fileName = singlePath.split(/[/\\]/).pop() || singlePath
          list.push({
            name: fileName,
            isCommon: false
          })
        })
      }
    }
  }

  return list
})

const previewMerged = computed(() => {
  if (!dataRows.value.length) return { subject: subjectTemplate.value, renderedHtml: bodyTemplate.value }
  const row = dataRows.value[previewIndex.value] || []
  let subject = subjectTemplate.value
  let body = bodyTemplate.value

  columnHeaders.value.forEach((header, idx) => {
    const val = String(row[idx] ?? '')
    const key = String(header ?? '')
    if (key) {
      subject = subject.split(`{{${key}}}`).join(val)
      body = body.split(`{{${key}}}`).join(val)
    }
  })

  return { subject, renderedHtml: body }
})

interface MailMergeReport {
  summary: { total: number; success: number; failed: number }
}
const report = ref<MailMergeReport | null>(null)

function addRow() { 
  sheetRows.value.push(Array(columnHeaders.value.length || 1).fill(''))
  onCellDataChange()
}
function removeRow(idx: number) { 
  sheetRows.value.splice(idx + 1, 1)
  onCellDataChange()
}
function addColumn() {
  const name = `Cột ${columnHeaders.value.length + 1}`
  sheetRows.value[0]!.push(name)
  for (let i = 1; i < sheetRows.value.length; i++) sheetRows.value[i]!.push('')
  onCellDataChange()
}
function removeColumn(idx: number) { 
  sheetRows.value.forEach(row => Array.isArray(row) && row.splice(idx, 1))
  onCellDataChange()
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.item(0)
  if (!file) return

  selectedFile.value = file
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())

  workbook.value = wb
  sheetNames.value = wb.worksheets.map((ws: any) => ws.name)
  selectedSheet.value = sheetNames.value[0] || ''
  loadSelectedSheet()
}

function loadSelectedSheet() {
  if (!workbook.value || !selectedSheet.value) return
  const ws = workbook.value.getWorksheet(selectedSheet.value)
  if (!ws) return

  const rows: Array<Array<string>> = []
  ws.eachRow({ includeEmpty: true }, (row: any) => {
    const values = (row.values as any[])
      .slice(1)
      .map((value: any) => formatCellValue(value))
    rows.push(values)
  })

  sheetRows.value = rows
  checkAllFilePaths()
  checkAllEmails()
}

function focusCell(r: number, c: number) {
  document.querySelector<HTMLInputElement>(`[data-cell="${r},${c}"]`)?.focus()
}

function handleCellKeydown(e: KeyboardEvent, r: number, c: number) {
  const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], Enter: [1, 0], Tab: [0, 1] }
  const move = moves[e.key]
  if (move && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    focusCell(Math.max(0, Math.min(dataRows.value.length - 1, r + move[0])), Math.max(0, Math.min(columnHeaders.value.length - 1, c + move[1])))
  }
}

function handleCellPaste(e: ClipboardEvent, startRow: number, startCol: number) {
  const text = e.clipboardData?.getData('text/plain')
  if (!text || !/[\t\r\n]/.test(text)) return
  e.preventDefault()
  const rows = text.replace(/\r\n/g, '\n').split('\n').map(r => r.split('\t'))
  rows.forEach((vals, rOffset) => {
    const targetR = startRow + rOffset + 1
    while (sheetRows.value.length <= targetR) sheetRows.value.push(Array(columnHeaders.value.length).fill(''))
    vals.forEach((v, cOffset) => { sheetRows.value[targetR]![startCol + cOffset] = v })
  })
  onCellDataChange()
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '')
    reader.onerror = reject
  })
}

// KIỂM TRA ĐƯỜNG DẪN FILE ĐÍNH KÈM CỤC BỘ
const fileCheckResults = ref<Record<number, { valid: boolean; missingFiles: string[] }>>({})
const isCheckingFiles = ref(false)

function cleanFilePath(pathStr: string): string {
  return pathStr
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '')
}

async function checkAllFilePaths() {
  const fileColIdx = columnHeaders.value.findIndex(h => /filepath|file|dinhkem|đính kèm/i.test(String(h || '')))
  if (fileColIdx === -1) {
    fileCheckResults.value = {}
    return
  }

  isCheckingFiles.value = true
  const results: Record<number, { valid: boolean; missingFiles: string[] }> = {}

  for (let rIdx = 0; rIdx < dataRows.value.length; rIdx++) {
    const row = dataRows.value[rIdx]!
    const rawPaths = String(row[fileColIdx] || '').trim()

    if (!rawPaths) continue

    const pathList = rawPaths
      .split(/[;,\r\n]+/)
      .map(p => cleanFilePath(p))
      .filter(Boolean)

    const missingFiles: string[] = []

    for (const singlePath of pathList) {
      try {
        const exists = await invoke<boolean>('check_file_exists', { path: singlePath })
        if (!exists) {
          missingFiles.push(singlePath)
        }
      } catch (err) {
        console.error('Lỗi IPC Tauri khi gọi check_file_exists:', err, 'Path:', singlePath)
        missingFiles.push(singlePath)
      }
    }

    if (pathList.length > 0) {
      results[rIdx] = {
        valid: missingFiles.length === 0,
        missingFiles
      }
    }
  }

  fileCheckResults.value = results
  isCheckingFiles.value = false
}

const missingFileCount = computed(() => {
  return Object.values(fileCheckResults.value).filter(item => !item.valid).length
})

// KIỂM TRA ĐỊNH DẠNG EMAIL
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface EmailCheckRowResult {
  valid: boolean
  invalidColIndices: number[]
  colErrors: Record<number, string>
}

const emailCheckResults = ref<Record<number, EmailCheckRowResult>>({})

function checkAllEmails() {
  const results: Record<number, EmailCheckRowResult> = {}

  const findCol = (regex: RegExp) => columnHeaders.value.findIndex(h => regex.test(String(h || '')))
  const toColIdx = findCol(/^email$|^mail$|^to$/i) !== -1 ? findCol(/^email$|^mail$|^to$/i) : 0

  for (let rIdx = 0; rIdx < dataRows.value.length; rIdx++) {
    const row = dataRows.value[rIdx]!
    const invalidColIndices: number[] = []
    const colErrors: Record<number, string> = {}

    columnHeaders.value.forEach((_, cIdx) => {
      if (!isEmailColumn(cIdx)) return

      const rawVal = String(row[cIdx] || '').trim()
      const headerName = String(columnHeaders.value[cIdx] || `Cột ${cIdx + 1}`)

      if (cIdx === toColIdx && !rawVal) {
        invalidColIndices.push(cIdx)
        colErrors[cIdx] = `Cột ${headerName} (To) không được để trống`
        return
      }

      if (rawVal) {
        const emails = rawVal.split(/[;,]/).map(e => e.trim()).filter(Boolean)
        const badEmails = emails.filter(e => !EMAIL_REGEX.test(e))
        if (badEmails.length > 0) {
          invalidColIndices.push(cIdx)
          colErrors[cIdx] = `Email tại ${headerName} sai định dạng: ${badEmails.join(', ')}`
        }
      }
    })

    if (invalidColIndices.length > 0) {
      results[rIdx] = {
        valid: false,
        invalidColIndices,
        colErrors
      }
    }
  }

  emailCheckResults.value = results
}

const invalidEmailCount = computed(() => {
  return Object.keys(emailCheckResults.value).length
})

function onCellDataChange() {
  checkAllFilePaths()
  checkAllEmails()
}

// BỘ ĐÓNG GÓI RFC 822 MIME MESSAGE VÀ MÃ HÓA BASE64URL CHO GMAIL API
function buildGMailMimeMessage(options: {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  htmlBody: string
  attachments: Array<{ name: string; type: string; base64Data: string }>
}): string {
  const boundary = '----=_Part_' + Date.now().toString(16)
  const nl = '\r\n'
  const mimeParts: string[] = []

  const encodeUtf8Header = (str: string) => {
    return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(str)))}?=`
  }

  mimeParts.push(`To: ${options.to.join(', ')}`)
  if (options.cc.length) mimeParts.push(`Cc: ${options.cc.join(', ')}`)
  if (options.bcc.length) mimeParts.push(`Bcc: ${options.bcc.join(', ')}`)
  mimeParts.push(`Subject: ${encodeUtf8Header(options.subject)}`)
  mimeParts.push('MIME-Version: 1.0')
  mimeParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
  mimeParts.push('')

  mimeParts.push(`--${boundary}`)
  mimeParts.push('Content-Type: text/html; charset=UTF-8')
  mimeParts.push('Content-Transfer-Encoding: base64')
  mimeParts.push('')
  mimeParts.push(btoa(unescape(encodeURIComponent(options.htmlBody))))

  for (const att of options.attachments) {
    mimeParts.push(`--${boundary}`)
    mimeParts.push(`Content-Type: ${att.type}; name="${encodeUtf8Header(att.name)}"`)
    mimeParts.push(`Content-Disposition: attachment; filename="${encodeUtf8Header(att.name)}"`)
    mimeParts.push('Content-Transfer-Encoding: base64')
    mimeParts.push('')
    mimeParts.push(att.base64Data)
  }

  mimeParts.push(`--${boundary}--`)

  const rawMimeString = mimeParts.join(nl)

  return btoa(unescape(encodeURIComponent(rawMimeString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// THỰC HIỆN MAIL MERGE QUA GMAIL API
async function sendRows(targetIndices?: number[]) {
  if (!dataRows.value.length) return
  if (!googleAccessToken.value) {
    alert('Vui lòng đăng nhập tài khoản Google trước khi gửi mail!')
    return
  }

  loading.value = true

  try {
    const preparedCommonAttachments = await Promise.all(
      commonAttachments.value.map(async (f) => ({
        name: f.name,
        type: f.type || 'application/octet-stream',
        base64Data: await fileToBase64(f)
      }))
    )

    const findCol = (regex: RegExp) => columnHeaders.value.findIndex(h => regex.test(String(h || '')))
    const toColIdx = findCol(/^email$|^mail$|^to$/i) !== -1 ? findCol(/^email$|^mail$|^to$/i) : 0
    const ccColIdx = findCol(/^cc$/i)
    const bccColIdx = findCol(/^bcc$/i)
    const fileColIdx = findCol(/^filepath$|^file$|^dinhkem$|^đính kèm$/i)

    const parseEmails = (raw?: string) => {
      if (!raw) return []
      return raw.split(/[;,]/).map(e => e.trim()).filter(Boolean)
    }

    const indicesToProcess = targetIndices ?? dataRows.value.map((_, idx) => idx)
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (const [loopIndex, i] of indicesToProcess.entries()) {
      const row = dataRows.value[i]!
      const toRecipients = parseEmails(row[toColIdx])
      const ccRecipients = ccColIdx !== -1 ? parseEmails(row[ccColIdx]) : []
      const bccRecipients = bccColIdx !== -1 ? parseEmails(row[bccColIdx]) : []

      if (!toRecipients.length) {
        rowStatuses.value[i] = 'FAILED'
        continue
      }

      let subject = subjectTemplate.value
      let body = bodyTemplate.value

      columnHeaders.value.forEach((header, colIdx) => {
        const val = String(row[colIdx] ?? '')
        const key = String(header ?? '').trim()
        if (key) {
          subject = subject.split(`{{${key}}}`).join(val)
          body = body.split(`{{${key}}}`).join(val)
        }
      })

      const rowAttachments = [...preparedCommonAttachments]

      if (fileColIdx !== -1 && row[fileColIdx]) {
        const rawPaths = String(row[fileColIdx]).trim()
        if (rawPaths) {
          const pathList = rawPaths.split(/[;,\r\n]+/).map(p => p.trim().replace(/^["']|["']$/g, '')).filter(Boolean)

          for (const singlePath of pathList) {
            try {
              const base64Content = await invoke<string>('read_file_base64', { path: singlePath })
              const fileName = singlePath.split(/[/\\]/).pop() || 'attachment'

              rowAttachments.push({
                name: fileName,
                type: getMimeType(fileName),
                base64Data: base64Content
              })
            } catch (err) {
              console.error(`Lỗi đọc tệp tại '${singlePath}':`, err)
            }
          }
        }
      }

      const rawMime = buildGMailMimeMessage({
        to: toRecipients,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject,
        htmlBody: body,
        attachments: rowAttachments
      })

      try {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken.value}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: rawMime })
        })

        if (res.ok) {
          rowStatuses.value[i] = 'SUCCESS'
        } else {
          rowStatuses.value[i] = 'FAILED'
        }
      } catch {
        rowStatuses.value[i] = 'FAILED'
      }

      if (loopIndex < indicesToProcess.length - 1) {
        await sleep(2500)
      }
    }

    const successCount = Object.values(rowStatuses.value).filter(s => s === 'SUCCESS').length
    const failedCount = Object.values(rowStatuses.value).filter(s => s === 'FAILED').length
    report.value = { summary: { total: dataRows.value.length, success: successCount, failed: failedCount } }
  } catch (err: any) {
    alert('Lỗi thực thi Gmail Mail Merge: ' + err.message)
  } finally {
    loading.value = false
  }
}

function submitExcel() { 
  confirmSendModal.value = {
    show: true,
    targetIndices: undefined,
    isResend: false
  }
}

function resendFailedRows() { 
  confirmSendModal.value = {
    show: true,
    targetIndices: failedRowIndices.value,
    isResend: true
  }
}

function handleConfirmSend() {
  const targetIndices = confirmSendModal.value.targetIndices
  confirmSendModal.value.show = false
  sendRows(targetIndices)
}

// DARK MODE & CẤU HÌNH TINYMCE 7
const isDark = ref(false)

function loadTinyMCEScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).tinymce) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.3.0/tinymce.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Lỗi nạp TinyMCE CDN'))
    document.head.appendChild(script)
  })
}

watch(userInfo, async (newVal) => {
  if (newVal) {
    await nextTick()
    initTinyMCE()
  }
})

watch(editorMode, async (newMode) => {
  if (newMode === 'visual' && userInfo.value) {
    await nextTick()
    initTinyMCE()
  }
})

async function initTinyMCE() {
  try {
    await loadTinyMCEScript()
    tinymceError.value = false

    await nextTick()

    const editorEl = document.querySelector('#mail-editor')
    if (!editorEl) return

    if ((window as any).tinymce) {
      (window as any).tinymce.remove('#mail-editor')

      const dark = isDark.value
      await (window as any).tinymce.init({
        selector: '#mail-editor',
        height: 500,
        width: '100%',
        resize: false,
        menubar: 'file edit view insert format table tools',
        promotion: false,
        branding: false,
        visualaid: false,
        skin: dark ? 'oxide-dark' : 'oxide',
        content_css: dark ? 'dark' : 'default',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify',
          'bullist numlist outdent indent | table link image media | removeformat code preview'
        ].join(' | '),

        font_family_formats: 'Segoe UI=Segoe UI,sans-serif; Aptos=Aptos,sans-serif; Calibri=Calibri,sans-serif; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times; Tahoma=tahoma,sans-serif;',
        font_size_formats: '8pt 10pt 11pt 12pt 14pt 16pt 18pt 24pt 36pt',

        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        paste_retain_style_properties: 'all',
        paste_word_valid_elements: '*[*]',
        paste_data_images: true,

        content_style: `
          html, body {
            font-family: 'Segoe UI', Calibri, Aptos, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            padding: 16px;
            margin: 0;
            color: ${dark ? '#f3f4f6' : '#1f2937'} !important;
            background-color: ${dark ? '#111827' : '#ffffff'} !important;
          }
          p { margin: 0 0 8px 0; }
          table { border-collapse: collapse; margin: 8px 0; max-width: 100%; }
          td, th { padding: 5px 8px; min-width: 20px; }
          img { max-width: 100% !important; height: auto !important; }
        `,

        setup: (editor: any) => {
          editor.on('change keyup undo redo', () => {
            bodyTemplate.value = editor.getContent()
          })
          editor.on('focus', () => {
            lastFocusedField.value = 'body'
          })

          editor.on('paste', (e: ClipboardEvent) => {
            const clipboardHtml = e.clipboardData?.getData('text/html')
            if (!clipboardHtml || !/<table/i.test(clipboardHtml)) {
              return
            }

            e.preventDefault()

            const parser = new DOMParser()
            const doc = parser.parseFromString(clipboardHtml, 'text/html')

            const cssRulesMap: Record<string, string> = {}
            doc.querySelectorAll('style').forEach(styleEl => {
              const cssContent = (styleEl.textContent || styleEl.innerHTML || '').replace(/\/\*[\s\S]*?\*\//g, '')
              const ruleRegex = /([^{]+)\{([^}]+)\}/g
              let match: RegExpExecArray | null

              while ((match = ruleRegex.exec(cssContent)) !== null) {
                const selectors = match[1]!.split(',')
                const decls = match[2]!.trim()

                selectors.forEach(sel => {
                  const cleaned = sel.trim()
                  if (cleaned.startsWith('.')) {
                    const className = cleaned.substring(1).split(':')[0]!.trim()
                    if (className) {
                      cssRulesMap[className] = (cssRulesMap[className] || '') + ';' + decls
                    }
                  }
                })
              }
            })

            Object.keys(cssRulesMap).forEach(className => {
              doc.querySelectorAll(`.${className}`).forEach(el => {
                const htmlEl = el as HTMLElement
                const existing = htmlEl.getAttribute('style') || ''
                htmlEl.setAttribute('style', cssRulesMap[className] + ';' + existing)
              })
            })

            doc.querySelectorAll('table, tr, td, th, span, font, p').forEach(node => {
              const el = node as HTMLElement
              let style = el.getAttribute('style') || ''

              if (!style) return

              style = style.replace(/windowtext/g, '#000000')
              style = style.replace(/(border(?:-top|-bottom|-left|-right)?\s*:\s*)(?:0?\.[0-9]+|1)pt/gi, '$11px')

              const bgMatch = style.match(/mso-pattern:[^;]*;\s*background:\s*([^;]+)/i)
              if (bgMatch && bgMatch[1]) {
                style += `; background-color: ${bgMatch[1].trim()};`
              }

              const bgAttr = el.getAttribute('bgcolor')
              if (bgAttr && !style.includes('background-color')) {
                style += `; background-color: ${bgAttr};`
              }

              el.setAttribute('style', style)
            })

            doc.querySelectorAll('table').forEach(tbl => {
              tbl.removeAttribute('border')
              const el = tbl as HTMLElement
              el.style.borderCollapse = 'collapse'
              el.style.maxWidth = '100%'
            })

            doc.querySelectorAll('style').forEach(s => s.remove())
            doc.querySelectorAll('img').forEach(img => {
              if (img.src.startsWith('file://') || img.src.includes('msohtmlclip')) {
                img.remove()
              }
            })

            editor.insertContent(doc.body.innerHTML)
          })
        }
      })
    }
  } catch (err) {
    console.error('Lỗi nạp TinyMCE:', err)
    tinymceError.value = true
  }
}

function retryLoadTinyMCE() {
  initTinyMCE()
}

onMounted(() => {
  const checkDarkMode = () => {
    const darkState = document.documentElement.classList.contains('dark')
    if (isDark.value !== darkState) {
      isDark.value = darkState
      initTinyMCE()
    }
  }

  checkDarkMode()
  initTinyMCE()
  checkAllEmails()

  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  if ((window as any).tinymce) {
    (window as any).tinymce.remove('#mail-editor')
  }
})

onDeactivated(() => {
  if ((window as any).tinymce) {
    const editor = (window as any).tinymce.get('mail-editor')
    if (editor) {
      bodyTemplate.value = editor.getContent()
    }
    (window as any).tinymce.remove('#mail-editor')
  }
})

onActivated(async () => {
  await nextTick()
  initTinyMCE()
})
</script>

<style scoped>
.editor-container :deep(.tox-tinymce) {
  border: none !important;
  width: 100% !important;
  height: 480px !important;
  box-sizing: border-box !important;
}

.preview-canvas :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
  max-width: 100%;
}
.preview-canvas :deep(td),
.preview-canvas :deep(th) {
  padding: 5px 8px;
  min-width: 20px;
}
.preview-canvas :deep(img) {
  max-width: 100% !important;
  height: auto !important;
}
</style>