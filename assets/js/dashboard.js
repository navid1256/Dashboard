// Dashboard Interactive Scripts - پنل مدیریت مالی

document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Toggle & Native Mobile Touch Swipe Gestures
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const openSidebar = document.getElementById("openSidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    function isMobile() {
        return window.innerWidth < 1024;
    }

    function showSidebar() {
        if (!sidebar || !overlay) return;
        sidebar.style.transition = "";
        sidebar.style.transform = "";
        overlay.style.opacity = "";
        sidebar.classList.remove("translate-x-full");
        overlay.classList.remove("hidden");
        document.body.style.overflow = isMobile() ? "hidden" : "";
    }

    function hideSidebar() {
        if (!sidebar || !overlay) return;
        sidebar.style.transition = "";
        sidebar.style.transform = "";
        overlay.style.opacity = "";
        sidebar.classList.add("translate-x-full");
        overlay.classList.add("hidden");
        document.body.style.overflow = "";
    }

    if (openSidebar) openSidebar.addEventListener("click", showSidebar);
    if (closeSidebar) closeSidebar.addEventListener("click", hideSidebar);
    if (overlay) overlay.addEventListener("click", hideSidebar);

    // Native Mobile Touch Swipe Drawer Implementation (RTL-aware)
    if (sidebar && overlay) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let isSwiping = false;
        let isEdgeSwipe = false;
        let touchStartTime = 0;

        const getSidebarWidth = () => sidebar.offsetWidth || 288;

        const onTouchStart = (e) => {
            if (!isMobile()) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchCurrentX = touchStartX;
            touchStartTime = Date.now();
            isSwiping = false;

            const isSidebarOpen = !sidebar.classList.contains("translate-x-full");

            if (isSidebarOpen) {
                // When open, touching anywhere lets user swipe right to dismiss
                isSwiping = true;
                isEdgeSwipe = false;
            } else if (touchStartX >= window.innerWidth - 35) {
                // Edge swipe from right border (< 35px from edge)
                isSwiping = true;
                isEdgeSwipe = true;
                overlay.classList.remove("hidden");
                overlay.style.opacity = "0";
            }
        };

        const onTouchMove = (e) => {
            if (!isSwiping || !isMobile()) return;
            const touch = e.touches[0];
            touchCurrentX = touch.clientX;
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            // If vertical scroll dominates at start, cancel swipe
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 10) {
                isSwiping = false;
                if (isEdgeSwipe) {
                    overlay.classList.add("hidden");
                    overlay.style.opacity = "";
                }
                return;
            }

            const sidebarWidth = getSidebarWidth();
            const isSidebarOpen = !sidebar.classList.contains("translate-x-full");

            // Disable CSS transition for 1:1 finger tracking without lag
            sidebar.style.transition = "none";
            overlay.style.transition = "none";

            if (isSidebarOpen) {
                // Dragging right to dismiss (deltaX > 0 in RTL)
                if (deltaX > 0) {
                    if (e.cancelable) e.preventDefault();
                    const translateX = Math.min(deltaX, sidebarWidth);
                    sidebar.style.transform = `translateX(${translateX}px)`;
                    const progress = 1 - (translateX / sidebarWidth);
                    overlay.style.opacity = `${Math.max(0, progress)}`;
                }
            } else if (isEdgeSwipe) {
                // Dragging left to open (deltaX < 0 in RTL)
                if (deltaX < 0) {
                    if (e.cancelable) e.preventDefault();
                    const translateX = Math.max(0, sidebarWidth + deltaX);
                    sidebar.style.transform = `translateX(${translateX}px)`;
                    const progress = (sidebarWidth - translateX) / sidebarWidth;
                    overlay.style.opacity = `${Math.min(1, Math.max(0, progress))}`;
                }
            }
        };

        const onTouchEnd = () => {
            if (!isSwiping || !isMobile()) {
                isSwiping = false;
                return;
            }
            isSwiping = false;

            const deltaX = touchCurrentX - touchStartX;
            const deltaTime = Math.max(1, Date.now() - touchStartTime);
            const velocity = deltaX / deltaTime; // px per ms
            const isSidebarOpen = !sidebar.classList.contains("translate-x-full");

            // Restore smooth spring cubic-bezier transition
            sidebar.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)";
            overlay.style.transition = "opacity 0.25s ease-out";

            if (isSidebarOpen) {
                // Threshold to close: dragged right by > 70px or swiped right quickly
                if (deltaX > 70 || velocity > 0.35) {
                    hideSidebar();
                } else {
                    // Snap back open
                    sidebar.style.transform = "translateX(0)";
                    overlay.style.opacity = "1";
                    setTimeout(() => {
                        sidebar.style.transform = "";
                        sidebar.style.transition = "";
                        overlay.style.opacity = "";
                        overlay.style.transition = "";
                    }, 320);
                }
            } else if (isEdgeSwipe) {
                // Threshold to open: dragged left by > 65px or swiped left quickly
                if (deltaX < -65 || velocity < -0.35) {
                    showSidebar();
                } else {
                    // Snap back closed
                    const sidebarWidth = getSidebarWidth();
                    sidebar.style.transform = `translateX(${sidebarWidth}px)`;
                    overlay.style.opacity = "0";
                    setTimeout(() => {
                        hideSidebar();
                        overlay.style.transition = "";
                    }, 320);
                }
            }
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        window.addEventListener("touchcancel", onTouchEnd, { passive: true });

        // Clean up inline styles on desktop resize
        window.addEventListener("resize", () => {
            if (!isMobile()) {
                sidebar.style.transform = "";
                sidebar.style.transition = "";
                overlay.style.opacity = "";
                overlay.style.transition = "";
                overlay.classList.add("hidden");
                document.body.style.overflow = "";
            }
        });
    }

    // 2. Modals (Open & Close with native <dialog> support)
    const closeModalElement = (modal) => {
        if (!modal) return;
        modal.classList.remove("open");
        if (modal.tagName === "DIALOG" && typeof modal.close === "function" && modal.open) {
            try { modal.close(); } catch (_) { modal.removeAttribute("open"); }
        }
        document.body.style.overflow = "";
    };

    window.closeModal = closeModalElement;

    document.querySelectorAll("[data-modal-open]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute("data-modal-open");
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add("open");
                if (modal.tagName === "DIALOG" && typeof modal.showModal === "function" && !modal.open) {
                    try { modal.showModal(); } catch (_) { modal.setAttribute("open", ""); }
                }
                document.body.style.overflow = "hidden";
            }
        });
    });

    document.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const modal = btn.closest(".modal-overlay") || btn.closest("dialog");
            closeModalElement(modal);
        });
    });

    // Close modal on backdrop click or ESC/cancel event
    document.querySelectorAll(".modal-overlay, dialog").forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModalElement(modal);
            }
        });
        modal.addEventListener("cancel", () => {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        });
    });

    // Close modal on form submit
    document.querySelectorAll("dialog.modal-overlay form, .modal-overlay form").forEach((form) => {
        form.addEventListener("submit", () => {
            const modal = form.closest("dialog") || form.closest(".modal-overlay");
            if (modal) {
                closeModalElement(modal);
            }
        });
    });

    // 3. Tab Switching
    document.querySelectorAll("[data-tab-target]").forEach((tabBtn) => {
        tabBtn.addEventListener("click", () => {
            const targetId = tabBtn.getAttribute("data-tab-target");
            const container = tabBtn.closest("[data-tab-container]") || document;

            // Remove active from sibling tabs
            const parentHeader = tabBtn.parentElement;
            if (parentHeader) {
                parentHeader.querySelectorAll("[data-tab-target]").forEach((b) => b.classList.remove("active"));
            }
            tabBtn.classList.add("active");

            // Hide sibling contents and show target
            container.querySelectorAll(".tab-content").forEach((content) => {
                content.classList.remove("active");
            });

            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });

    // 4. Toast notification helper
    window.showToast = function (message, type = "success") {
        let toastContainer = document.getElementById("toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toast-container";
            toastContainer.className = "fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        const bgColor = type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white";
        const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
        
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto ${bgColor}`;
        toast.innerHTML = `<i class="fa-solid ${icon}"></i><span class="text-xs font-bold">${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove("translate-y-4", "opacity-0");
        }, 10);

        setTimeout(() => {
            toast.classList.add("opacity-0", "translate-y-2");
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    };

    // 5. Monthly / Yearly Chart Toggle
    const btnMonthly = document.getElementById("btnChartMonthly");
    const btnYearly = document.getElementById("btnChartYearly");
    const chartMonthly = document.getElementById("chartMonthlyView");
    const chartYearly = document.getElementById("chartYearlyView");
    const chartTitle = document.getElementById("incomeChartTitle");
    const chartSubtitle = document.getElementById("incomeChartSubtitle");
    const kpiLabel1 = document.getElementById("chartKpiLabel1");
    const kpiVal1 = document.getElementById("chartKpiVal1");
    const kpiLabel2 = document.getElementById("chartKpiLabel2");
    const kpiVal2 = document.getElementById("chartKpiVal2");
    const kpiLabel3 = document.getElementById("chartKpiLabel3");
    const kpiVal3 = document.getElementById("chartKpiVal3");

    if (btnMonthly && btnYearly && chartMonthly && chartYearly) {
        btnMonthly.addEventListener("click", () => {
            btnMonthly.classList.add("active");
            btnMonthly.setAttribute("aria-pressed", "true");
            btnYearly.classList.remove("active");
            btnYearly.setAttribute("aria-pressed", "false");

            chartMonthly.classList.add("active");
            chartYearly.classList.remove("active");

            if (chartTitle) chartTitle.textContent = "نمودار درآمد ماهانه (۱۴۰۳)";
            if (chartSubtitle) chartSubtitle.textContent = "روند تفکیکی درآمد ۱۲ ماهه سال با بالاترین رکورد در اسفند";

            if (kpiLabel1) kpiLabel1.textContent = "میانگین درآمد ماهانه";
            if (kpiVal1) kpiVal1.textContent = "۵۲.۳ میلیون تومان";
            if (kpiLabel2) kpiLabel2.textContent = "بالاترین رکورد فروش";
            if (kpiVal2) kpiVal2.textContent = "اسفند (۷۴M تومان)";
            if (kpiLabel3) kpiLabel3.textContent = "نرخ تحقق هدف سال";
            if (kpiVal3) kpiVal3.textContent = "۱۰۸.۵٪ (موفق) ↗";
        });

        btnYearly.addEventListener("click", () => {
            btnYearly.classList.add("active");
            btnYearly.setAttribute("aria-pressed", "true");
            btnMonthly.classList.remove("active");
            btnMonthly.setAttribute("aria-pressed", "false");

            chartYearly.classList.add("active");
            chartMonthly.classList.remove("active");

            if (chartTitle) chartTitle.textContent = "نمودار درآمد سالانه (۱۳۹۹ - ۱۴۰۳)";
            if (chartSubtitle) chartSubtitle.textContent = "روند مقایسه‌ای رشد درآمد کل ۵ ساله با رشد تجمیعی ۴۶۸٪";

            if (kpiLabel1) kpiLabel1.textContent = "درآمد کل دوره ۵ ساله";
            if (kpiVal1) kpiVal1.textContent = "۱,۴۸۰ میلیارد تومان";
            if (kpiLabel2) kpiLabel2.textContent = "رشد سال جاری (YoY)";
            if (kpiVal2) kpiVal2.textContent = "+۳۶.۷٪ نسبت به ۱۴۰۲";
            if (kpiLabel3) kpiLabel3.textContent = "پیش‌بینی درآمد ۱۴۰۴";
            if (kpiVal3) kpiVal3.textContent = "۷۵۰M تومان (تخمینی) ↗";
        });
    }

    // 6. Live Refresh & Skeleton Loading Simulation (Zero-CLS)
    const btnRefresh = document.getElementById("btnRefreshDashboard");
    const refreshIcon = document.getElementById("refreshIcon");
    const chartSkeleton = document.getElementById("chartSkeleton");
    const tableSkeleton = document.getElementById("tableSkeleton");
    const tableRealContent = document.getElementById("tableRealContent");

    if (btnRefresh && chartSkeleton && tableSkeleton && tableRealContent) {
        btnRefresh.addEventListener("click", () => {
            // Start spinning animation
            if (refreshIcon) refreshIcon.classList.add("spin-anim");
            btnRefresh.disabled = true;

            // Show Chart Skeleton
            if (chartMonthly) chartMonthly.classList.remove("active");
            if (chartYearly) chartYearly.classList.remove("active");
            chartSkeleton.classList.remove("hidden");
            chartSkeleton.classList.add("flex");

            // Show Table Skeleton
            tableRealContent.classList.add("hidden");
            tableSkeleton.classList.remove("hidden");

            // Simulate server network fetch (1100ms)
            setTimeout(() => {
                // Restore Chart
                chartSkeleton.classList.add("hidden");
                chartSkeleton.classList.remove("flex");
                if (btnMonthly && btnMonthly.classList.contains("active")) {
                    if (chartMonthly) chartMonthly.classList.add("active");
                } else {
                    if (chartYearly) chartYearly.classList.add("active");
                }

                // Restore Table
                tableSkeleton.classList.add("hidden");
                tableRealContent.classList.remove("hidden");

                // Stop icon spin
                if (refreshIcon) refreshIcon.classList.remove("spin-anim");
                btnRefresh.disabled = false;

                // Show feedback toast
                if (window.showToast) {
                    window.showToast("داده‌های نمودار و تراکنش‌ها با موفقیت بروزرسانی شد", "success");
                }
            }, 1100);
        });
    }

    // 7. Dynamic Soft Edge Content Fade for Wide Financial Tables & Sidebar
    const updateTableScrollMask = (container) => {
        if (!container) return;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // If content fits completely without overflow, remove fade mask
        if (maxScroll <= 8) {
            container.classList.remove("scroll-fade-left", "scroll-fade-right", "scroll-fade-both-x");
            container.classList.add("scroll-fade-none");
            return;
        }

        container.classList.remove("scroll-fade-none");
        const scrollLeft = Math.abs(container.scrollLeft);

        // In RTL:
        // scrollLeft ~ 0 is right edge (start) -> content continues to the left
        // scrollLeft ~ maxScroll is left edge (end) -> content continues to the right
        const atStart = scrollLeft <= 8;
        const atEnd = scrollLeft >= maxScroll - 8;

        if (atStart) {
            container.classList.add("scroll-fade-left");
            container.classList.remove("scroll-fade-right", "scroll-fade-both-x");
        } else if (atEnd) {
            container.classList.add("scroll-fade-right");
            container.classList.remove("scroll-fade-left", "scroll-fade-both-x");
        } else {
            container.classList.add("scroll-fade-both-x");
            container.classList.remove("scroll-fade-left", "scroll-fade-right");
        }
    };

    // Attach scroll listeners to all table containers
    const tableContainers = document.querySelectorAll(".overflow-x-auto");
    tableContainers.forEach((el) => {
        let ticking = false;
        el.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTableScrollMask(el);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        updateTableScrollMask(el);
    });

    // Sidebar bottom fade check
    const updateSidebarFade = () => {
        if (!sidebar) return;
        const hasOverflow = sidebar.scrollHeight > sidebar.clientHeight + 10;
        const atBottom = sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight - 15;
        if (hasOverflow && !atBottom) {
            sidebar.classList.add("sidebar-scroll-fade");
        } else {
            sidebar.classList.remove("sidebar-scroll-fade");
        }
    };

    if (sidebar) {
        sidebar.addEventListener("scroll", updateSidebarFade, { passive: true });
        updateSidebarFade();
    }

    // ResizeObserver to update masks when window or container resizes
    if (window.ResizeObserver) {
        const maskResizeObserver = new ResizeObserver(() => {
            tableContainers.forEach(updateTableScrollMask);
            updateSidebarFade();
        });
        tableContainers.forEach((el) => maskResizeObserver.observe(el));
        if (sidebar) maskResizeObserver.observe(sidebar);
    }

    // 8. Scroll-Driven Animation Observer Fallback (for browsers without CSS view() timeline)
    const supportsCssViewTimeline = () => {
        return window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()");
    };

    if (!supportsCssViewTimeline() && "IntersectionObserver" in window) {
        const revealElements = document.querySelectorAll(
            ".stat-card, .panel, .chart-box, .dashboard-table tbody tr"
        );
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -30px 0px"
        });

        revealElements.forEach((el) => {
            el.classList.add("scroll-reveal");
            observer.observe(el);
        });
    }
});