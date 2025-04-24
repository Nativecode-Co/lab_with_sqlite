document.addEventListener("DOMContentLoaded", () => {
  let totalPages = 0;
  let currentPage = 1;
  let isSyncing = false;
  let syncStartTime;
  let totalRecordsSynced = 0;
  let syncTimer;
  let hasMoreData = true;
  let syncCompleted = false;
  let tablesSynced = 0;
  let totalTables = 0;
  let failedSyncAttempts = 0;
  // Track individual table progress
  let tableProgress = {};

  const API_ENDPOINTS = {
    ALL: "/sync/all",
    SEND: "/sync/send",
  };

  const syncButton = document.getElementById("syncButton");
  const overallProgress = document.getElementById("overallProgress");
  const overallPercentage = document.getElementById("overallPercentage");
  const syncStatusMessage = document.getElementById("syncStatusMessage");
  const totalRecordsEl = document.getElementById("totalRecords");
  const syncTimeEl = document.getElementById("syncTime");
  const syncContainer = document.getElementById("syncContainer");
  const updateAppButton = document.getElementById("updateAppButton");
  const tableCountEl = document.getElementById("tableCount");
  const syncProgressInfoEl = document.getElementById("syncProgressInfo");

  window.startSync = async () => {
    if (isSyncing) {
      console.log("المزامنة جارية");
      return;
    }

    isSyncing = true;
    syncStartTime = new Date();
    updateSyncTimer();
    syncTimer = setInterval(updateSyncTimer, 1000);

    if (syncButton) {
      syncButton.disabled = true;
      syncButton.innerHTML =
        '<i class="fas fa-sync-alt fa-spin me-2"></i> جاري المزامنة...';
    }

    if (syncStatusMessage) {
      syncStatusMessage.textContent = "جاري مزامنة البيانات...";
    }

    resetProgress();
    currentPage = 1;
    totalRecordsSynced = 0;
    tablesSynced = 0;
    hasMoreData = true;
    syncCompleted = false;
    failedSyncAttempts = 0;
    tableProgress = {}; // Reset table progress tracking

    if (updateAppButton) {
      updateAppButton.style.display = "none";
    }

    await syncAllData();
  };

  const syncAllData = async () => {
    if (!hasMoreData || !isSyncing) {
      completeSyncProcess();
      return;
    }

    const recordsPerPageEl = document.getElementById("recordsPerPage");
    const recordsPerPage = recordsPerPageEl ? recordsPerPageEl.value : 20;

    updateStatusMessage(`جاري المزامنة (الصفحة ${currentPage})...`);

    if (totalPages > 0) {
      const progressPercentage = Math.floor((currentPage / totalPages) * 100);
      if (overallProgress)
        overallProgress.style.width = `${progressPercentage}%`;
      if (overallPercentage)
        overallPercentage.textContent = `${progressPercentage}%`;
      if (
        (overallProgressText = document.getElementById("overallProgressText"))
      )
        overallProgressText.textContent = `${progressPercentage}%`;
    }

    try {
      const result = fetchApi(
        `${API_ENDPOINTS.ALL}?page=${currentPage}&per_page=${recordsPerPage}`,
        "GET"
      );

      if (result) {
        if (currentPage === 1) {
          totalTables = Object.keys(result).length;
          if (tableCountEl) tableCountEl.textContent = totalTables;

          // Initialize table progress tracking
          Object.keys(result).forEach((tableName) => {
            if (result[tableName] && result[tableName].total_pages) {
              tableProgress[tableName] = {
                currentPage: 1,
                totalPages: result[tableName].total_pages,
                totalRecords: result[tableName].total_records || 0,
                syncedRecords: 0,
              };

              // Update UI progress for this table
              updateTableProgress(tableName);
            }
          });
        }

        let recordCount = 0;
        const tablesInThisPage = [];
        let maxTotalPages = 0;

        const allTableData = {};
        let totalRecordsInAllTables = 0;
        let totalSyncedRecords = 0;

        Object.keys(result).forEach((tableName) => {
          const tableData = result[tableName];

          if (tableData && tableData.data && Array.isArray(tableData.data)) {
            // Add records from this table to our count
            recordCount += tableData.data.length;

            // Track the maximum total_pages from all tables
            if (
              tableData.total_pages &&
              tableData.total_pages > maxTotalPages
            ) {
              maxTotalPages = tableData.total_pages;
            }

            // Update UI with total records for first time
            if (currentPage === 1 && tableData.total_records) {
              totalRecordsInAllTables += tableData.total_records;

              // Update sync progress info with total records
              if (syncProgressInfoEl) {
                syncProgressInfoEl.textContent = `0 من ${totalRecordsInAllTables} سجل`;
              }
            }

            // Add table to our list of tables in this response
            tablesInThisPage.push({
              name: tableName,
              count: tableData.data.length,
              page: tableData.page || currentPage,
              totalPages: tableData.total_pages || 1,
              totalRecords: tableData.total_records || tableData.data.length,
            });

            // Add to visual queue for each table
            addToVisualQueue({
              table: tableName,
              page: currentPage,
              records: tableData.data,
              totalRecords: tableData.total_records || tableData.data.length,
            });

            // Add table data to our collection
            allTableData[tableName] = tableData.data;
          }
        });

        // Update total pages based on the table with the most pages
        if (currentPage === 1) {
          totalPages = maxTotalPages;
        }

        if (recordCount > 0) {
          // We update totalRecordsSynced only after successful sync
          // Display syncing in progress for these tables
          tablesInThisPage.forEach((table) => {
            updateQueueItemStatus(`${table.name}-${currentPage}`, "syncing");
          });

          // Send all table data to server at once
          const success = await sendAllTablesToServer(
            allTableData,
            tablesInThisPage,
            currentPage
          );

          // If sending data failed, stop syncing
          if (!success) {
            failedSyncAttempts++;
            // Show sync failed in status message
            updateStatusMessage(
              `فشلت مزامنة البيانات في الصفحة ${currentPage}. المحاولة رقم ${failedSyncAttempts}.`
            );

            // If we've tried 3 times and failed, stop syncing
            if (failedSyncAttempts >= 3) {
              hasMoreData = false;
              completeSyncProcess();
              return;
            }

            // Wait a moment and try again
            setTimeout(syncAllData, 2000);
            return;
          }

          // Reset failed attempts counter on success
          failedSyncAttempts = 0;

          // Update total records only after successful sync
          totalRecordsSynced += recordCount;
          if (totalRecordsEl) totalRecordsEl.textContent = totalRecordsSynced;

          // Update individual table progress
          tablesInThisPage.forEach((table) => {
            if (tableProgress[table.name]) {
              tableProgress[table.name].currentPage = currentPage;
              tableProgress[table.name].syncedRecords += table.count;
              updateTableProgress(table.name);
            }
          });

          // Update sync progress info
          if (syncProgressInfoEl) {
            let totalAllRecords = 0;
            Object.values(tableProgress).forEach((progress) => {
              totalAllRecords += progress.totalRecords;
            });
            syncProgressInfoEl.textContent = `${totalRecordsSynced} من ${totalAllRecords} سجل`;
          }

          // Check if we have more pages
          if (currentPage < totalPages) {
            currentPage++;
            // Show progress in status message
            updateStatusMessage(
              `تمت مزامنة ${totalRecordsSynced} سجل. جاري تحميل الصفحة التالية...`
            );
            setTimeout(syncAllData, 500); // Small delay before fetching next page
          } else {
            hasMoreData = false;
            completeSyncProcess();
          }
        } else {
          // No records in response, assume we're done
          hasMoreData = false;
          completeSyncProcess();
        }
      } else {
        showError("خطأ: صيغة استجابة غير صالحة");
        completeSyncProcess();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(`خطأ في جلب البيانات: ${error.message}`);
      isSyncing = false;
      hasMoreData = false;
      completeSyncProcess();
    }
  };

  // Update progress for a specific table
  const updateTableProgress = (tableName) => {
    if (!tableProgress[tableName]) return;

    const progress = tableProgress[tableName];

    // Only update progress if we have records in this table
    // This prevents progress bar updates for empty tables
    if (progress.syncedRecords > 0) {
      const progressPercent =
        progress.totalPages > 0
          ? Math.min(
              Math.floor((progress.currentPage / progress.totalPages) * 100),
              100
            )
          : 0;

      // Update the progress bar
      const progressBar = document.getElementById(`${tableName}Progress`);
      if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
        progressBar.setAttribute("aria-valuenow", progressPercent);
      }

      // Update the progress text
      const progressText = document.getElementById(`${tableName}ProgressText`);
      if (progressText) {
        progressText.textContent = `${progressPercent}%`;
      }

      // Update the record count if available
      const recordCountEl = document.getElementById(`${tableName}RecordCount`);
      if (recordCountEl) {
        recordCountEl.textContent = progress.syncedRecords;
      }
    }
  };

  // Send all tables data to server at once
  const sendAllTablesToServer = async (tablesData, tablesInfo, currentPage) => {
    console.log(tablesData);
    const requestData = {
      insertedRows: [],
      updatedRows: tablesData,
      deletedRows: [],
    };

    const url = "http://umc.native-code-iq.com:8777/api/data/old_system";
    // const url = "http://localhost:8777/api/data/old_system";

    try {
      // Update UI to show syncing status
      updateStatusMessage(
        `جاري إرسال البيانات إلى الخادم (الصفحة ${currentPage})...`
      );

      // Mark all tables in this page as "syncing"
      tablesInfo.forEach((table) => {
        updateQueueItemStatus(`${table.name}-${currentPage}`, "syncing");
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Check if response status is 200
      if (response.status !== 200) {
        console.error(`Error: Server responded with status ${response.status}`);
        showError(`خطأ: استجابة غير صالحة من الخادم (${response.status})`);

        // Mark all tables as error
        tablesInfo.forEach((table) => {
          updateQueueItemStatus(`${table.name}-${currentPage}`, "error");
        });

        // Show visual indicator that sync has failed in this page
        if (overallProgress) {
          overallProgress.classList.remove(
            "progress-bar-striped",
            "progress-bar-animated"
          );
          overallProgress.classList.add("bg-danger");
        }

        return false;
      }

      // Parse response to check for field-level errors
      const responseData = await response.json();
      let hasFieldErrors = false;

      // Process response for field-level errors
      if (responseData && responseData.results) {
        tablesInfo.forEach((table) => {
          if (
            responseData.results[table.name] &&
            responseData.results[table.name].error
          ) {
            // This table had an error during sync
            hasFieldErrors = true;
            updateQueueItemStatus(`${table.name}-${currentPage}`, "error");
            // Show field error in UI
            displayFieldError(
              table.name,
              responseData.results[table.name].error
            );
          } else {
            // This table was successful
            updateQueueItemStatus(`${table.name}-${currentPage}`, "completed");
            tablesSynced++;

            // Only count this table as synced if it had data
            if (table.count > 0 && tableProgress[table.name]) {
              tableProgress[table.name].syncedRecords += table.count;
              updateTableProgress(table.name);
            }
          }
        });
      } else {
        // If no detailed response, mark all as completed
        tablesInfo.forEach((table) => {
          updateQueueItemStatus(`${table.name}-${currentPage}`, "completed");
          tablesSynced++;

          // Only count this table as synced if it had data
          if (table.count > 0 && tableProgress[table.name]) {
            tableProgress[table.name].syncedRecords += table.count;
            updateTableProgress(table.name);
          }
        });
      }

      // If any field had errors, show overall warning
      if (hasFieldErrors) {
        showWarning(`تمت المزامنة مع وجود أخطاء في بعض الحقول`);
      }

      if (tableCountEl)
        tableCountEl.textContent = `${tablesSynced}/${totalTables}`;

      return !hasFieldErrors; // Return success only if no field errors
    } catch (error) {
      console.error("Error sending data to server:", error);
      showError(`خطأ في الاتصال بالخادم: ${error.message}`);

      // Mark all tables as error
      tablesInfo.forEach((table) => {
        updateQueueItemStatus(`${table.name}-${currentPage}`, "error");
      });

      // Show visual indicator that sync has failed
      if (overallProgress) {
        overallProgress.classList.remove(
          "progress-bar-striped",
          "progress-bar-animated"
        );
        overallProgress.classList.add("bg-danger");
      }

      return false;
    }
  };

  // Display a field-level error in the UI
  const displayFieldError = (fieldName, errorMessage) => {
    const queueContainer = document.getElementById("syncQueueContainer");
    if (!queueContainer) return;

    // Create error message element if it doesn't exist
    let fieldErrorEl = document.getElementById(`field-error-${fieldName}`);
    if (!fieldErrorEl) {
      fieldErrorEl = document.createElement("div");
      fieldErrorEl.id = `field-error-${fieldName}`;
      fieldErrorEl.className =
        "field-error-message alert alert-danger mt-2 mb-2";
      fieldErrorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>${fieldName}:</strong> ${errorMessage}`;

      // Find the queue item for this field
      const queueItem = document.getElementById(
        `queue-item-${fieldName}-${currentPage}`
      );
      if (queueItem) {
        queueItem.after(fieldErrorEl);
      } else {
        queueContainer.appendChild(fieldErrorEl);
      }
    }
  };

  // Show a warning message
  const showWarning = (message) => {
    if (!syncStatusMessage) return;

    syncStatusMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

    const alertEl = syncStatusMessage.parentElement;
    if (alertEl) {
      alertEl.classList.remove("alert-info", "alert-danger", "alert-success");
      alertEl.classList.add("alert-warning");
    }
  };

  // Add an item to the visual queue in the UI
  const addToVisualQueue = (data) => {
    const queueContainer = document.getElementById("syncQueueContainer");
    if (!queueContainer) return;

    const queueItem = document.createElement("div");
    queueItem.className = "queue-item p-3 mb-2 bg-light rounded";
    queueItem.id = `queue-item-${data.table}-${data.page}`;
    queueItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span class="status-icon status-waiting me-2">
            <i class="fas fa-clock"></i>
          </span>
          <strong>${data.table}</strong> <span class="text-muted">(صفحة ${data.page})</span>
        </div>
        <div>
          <span class="badge bg-secondary me-2">${data.records.length} سجل</span>
        </div>
      </div>
    `;

    queueContainer.appendChild(queueItem);
  };

  // Update the status of a queue item
  const updateQueueItemStatus = (id, status) => {
    const queueItem = document.getElementById(`queue-item-${id}`);
    if (!queueItem) return;

    const statusIcon = queueItem.querySelector(".status-icon");
    if (!statusIcon) return;

    // Remove all status classes
    statusIcon.classList.remove(
      "status-syncing",
      "status-complete",
      "status-error",
      "status-waiting"
    );

    // Add appropriate status class and update icon
    switch (status) {
      case "waiting":
        statusIcon.classList.add("status-waiting");
        statusIcon.innerHTML = '<i class="fas fa-clock"></i>';
        queueItem.classList.remove("completed", "error", "syncing");
        break;
      case "syncing":
        statusIcon.classList.add("status-syncing");
        statusIcon.innerHTML = '<div class="loading-spinner"></div>';
        queueItem.classList.remove("completed", "error");
        queueItem.classList.add("syncing");
        break;
      case "completed":
        statusIcon.classList.add("status-complete");
        statusIcon.innerHTML = '<i class="fas fa-check"></i>';
        queueItem.classList.remove("error", "syncing");
        queueItem.classList.add("completed");
        break;
      case "error":
        statusIcon.classList.add("status-error");
        statusIcon.innerHTML = '<i class="fas fa-times"></i>';
        queueItem.classList.remove("completed", "syncing");
        queueItem.classList.add("error");
        break;
    }
  };

  // Complete the sync process
  const completeSyncProcess = () => {
    isSyncing = false;
    syncCompleted = true;
    clearInterval(syncTimer);

    if (syncButton) {
      syncButton.disabled = false;
      syncButton.innerHTML =
        '<i class="fas fa-sync-alt me-2"></i> بدء المزامنة';
    }

    // Calculate and display sync completion stats
    const duration = Math.floor((new Date() - syncStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    // Check if there were any sync errors
    const errorItems = document.querySelectorAll(".queue-item.error");
    const hasErrors = errorItems.length > 0;

    if (hasErrors) {
      // If we had errors, set progress bar to error state
      if (overallProgress) {
        overallProgress.classList.remove(
          "progress-bar-striped",
          "progress-bar-animated"
        );
        overallProgress.classList.add("bg-danger");
        // Show partial progress
        const successPercentage = Math.floor(
          (tablesSynced / totalTables) * 100
        );
        overallProgress.style.width = `${successPercentage}%`;
        if (overallPercentage)
          overallPercentage.textContent = `${successPercentage}% (مع أخطاء)`;
        if (document.getElementById("overallProgressText"))
          document.getElementById(
            "overallProgressText"
          ).textContent = `${successPercentage}% (مع أخطاء)`;
      }
    } else {
      // If no errors, show 100% complete
      if (overallProgress) {
        overallProgress.classList.remove("bg-danger");
        overallProgress.style.width = "100%";
      }
      if (overallPercentage) overallPercentage.textContent = "100%";
      if (document.getElementById("overallProgressText"))
        document.getElementById("overallProgressText").textContent = "100%";

      // Set all table progress to 100%
      Object.keys(tableProgress).forEach((tableName) => {
        const progressBar = document.getElementById(`${tableName}Progress`);
        const progressText = document.getElementById(
          `${tableName}ProgressText`
        );
        if (progressBar) {
          progressBar.style.width = "100%";
          progressBar.setAttribute("aria-valuenow", 100);
        }
        if (progressText) {
          progressText.textContent = "100%";
        }
      });
    }

    if (syncStatusMessage) {
      if (hasErrors) {
        syncStatusMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> توقفت المزامنة بسبب خطأ! تمت مزامنة ${totalRecordsSynced} سجل من ${totalTables} جدول في ${minutes}د ${seconds}ث.`;

        // Change the alert status to warning
        const alertEl = syncStatusMessage.parentElement;
        if (alertEl) {
          alertEl.classList.remove("alert-info", "alert-danger");
          alertEl.classList.add("alert-warning");
        }
      } else {
        syncStatusMessage.innerHTML = `<i class="fas fa-check-circle"></i> اكتملت المزامنة! تمت مزامنة ${totalRecordsSynced} سجل من ${totalTables} جدول في ${minutes}د ${seconds}ث.`;

        // Change the alert status to success
        const alertEl = syncStatusMessage.parentElement;
        if (alertEl) {
          alertEl.classList.remove(
            "alert-info",
            "alert-danger",
            "alert-warning"
          );
          alertEl.classList.add("alert-success");
        }
      }
    }

    // Show update app button after successful sync only if no errors
    if (updateAppButton && totalRecordsSynced > 0 && !hasErrors) {
      updateAppButton.style.display = "block";
    }

    // Show notification if enabled
    const notifyEl = document.getElementById("notifyOnComplete");
    if (notifyEl && notifyEl.checked) {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(hasErrors ? "توقفت المزامنة" : "اكتملت المزامنة", {
            body: `تمت مزامنة ${totalRecordsSynced} سجل من ${totalTables} جدول${
              hasErrors ? " (مع أخطاء)" : ""
            }.`,
            icon: "/favicon.ico",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(
                hasErrors ? "توقفت المزامنة" : "اكتملت المزامنة",
                {
                  body: `تمت مزامنة ${totalRecordsSynced} سجل من ${totalTables} جدول${
                    hasErrors ? " (مع أخطاء)" : ""
                  }.`,
                  icon: "/favicon.ico",
                }
              );
            }
          });
        }
      }
    }
  };

  // Update the sync timer display
  const updateSyncTimer = () => {
    if (!syncStartTime || !syncTimeEl) return;

    const duration = Math.floor((new Date() - syncStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    syncTimeEl.textContent = `${minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  // Reset all progress indicators
  const resetProgress = () => {
    if (overallProgress) {
      overallProgress.style.width = "0%";
      overallProgress.classList.remove("bg-danger");
      overallProgress.classList.add(
        "progress-bar-striped",
        "progress-bar-animated"
      );
    }
    if (overallPercentage) overallPercentage.textContent = "0%";
    if (document.getElementById("overallProgressText"))
      document.getElementById("overallProgressText").textContent = "0%";

    // Reset all individual table progress bars
    const tableNames = [
      "lab_doctor",
      "lab_invoice",
      "lab_package",
      "lab_pakage_tests",
      "lab_patient",
      "lab_test",
      "lab_visits_package",
      "lab_visits",
      "lab_visits_tests",
      "system_users",
    ];

    tableNames.forEach((tableName) => {
      const progressBar = document.getElementById(`${tableName}Progress`);
      const progressText = document.getElementById(`${tableName}ProgressText`);

      if (progressBar) {
        progressBar.style.width = "0%";
        progressBar.setAttribute("aria-valuenow", 0);
      }

      if (progressText) {
        progressText.textContent = "0%";
      }
    });

    // Clear the queue container
    const queueContainer = document.getElementById("syncQueueContainer");
    if (queueContainer) {
      queueContainer.innerHTML = "";
    }

    // Reset alert status
    if (syncStatusMessage) {
      const alertEl = syncStatusMessage.parentElement;
      if (alertEl) {
        alertEl.classList.remove(
          "alert-warning",
          "alert-danger",
          "alert-success"
        );
        alertEl.classList.add("alert-info");
      }
    }
  };

  // Show an error message
  const showError = (message) => {
    if (!syncStatusMessage) return;

    syncStatusMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    const alertEl = syncStatusMessage.parentElement;
    if (alertEl) {
      alertEl.classList.remove("alert-info", "alert-warning", "alert-success");
      alertEl.classList.add("alert-danger");
    }
  };

  // Update the status message
  const updateStatusMessage = (message) => {
    if (!syncStatusMessage) return;

    syncStatusMessage.textContent = message;

    const alertEl = syncStatusMessage.parentElement;
    if (alertEl) {
      alertEl.classList.remove(
        "alert-danger",
        "alert-warning",
        "alert-success"
      );
      alertEl.classList.add("alert-info");
    }
  };

  // Initialize event handlers for sync page UI
  const initializeSyncEvents = () => {
    // Set up sync button click event
    if (syncButton) {
      syncButton.addEventListener("click", startSync);
    }

    // Setup update app button if it exists
    if (updateAppButton) {
      updateAppButton.addEventListener("click", () => {
        window.location.href = "https://unilab-iq.com/download";
      });
    }
  };

  // Check if we're on the sync page and initialize
  if (window.location.pathname.includes("syncData.html")) {
    // Initialize events
    initializeSyncEvents();

    // Hide update button initially
    if (updateAppButton) {
      updateAppButton.style.display = "none";
    }
  }
});

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
