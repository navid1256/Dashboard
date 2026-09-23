const themeToggleButton = document.getElementById("theme-toggle-btn");
const docElement = document.documentElement;
const themeContainer = themeToggleButton?.querySelector(".theme-toggle__container");

function updateTheme(isDarkMode, persist = true) {
  docElement.classList.toggle("dark", isDarkMode);
  themeToggleButton.setAttribute("aria-checked", String(isDarkMode));
  themeToggleButton.setAttribute(
    "aria-label",
    isDarkMode ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"
  );

  if (persist) {
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch (error) {
      console.warn("ذخیره تنظیمات پوسته ممکن نشد.", error);
    }
  }
}

function handleThemeToggleClick() {
  docElement.classList.add("is-animating");
  updateTheme(!docElement.classList.contains("dark"));
}

function handleTransitionEnd(event) {
  if (event.target === themeContainer && event.propertyName === "background-color") {
    docElement.classList.remove("is-animating");
  }
}

if (themeToggleButton && themeContainer) {
  themeToggleButton.addEventListener("click", handleThemeToggleClick);
  themeContainer.addEventListener("transitionend", handleTransitionEnd);
  updateTheme(docElement.classList.contains("dark"), false);
}