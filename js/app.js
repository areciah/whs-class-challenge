(function () {
  const sessionKey = "whsSession";
  const savedIdKey = "whsSavedId";
  const savedPwKey = "whsSavedPw";
  const root = document.documentElement;
  let appConfig = null;

  async function loadConfig() {
    if (appConfig) return appConfig;
    const response = await fetch("config/local.settings.json", { cache: "no-store" });
    if (!response.ok) throw new Error("local settings not found");
    appConfig = await response.json();
    return appConfig;
  }

  function currentSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || "null");
    } catch {
      return null;
    }
  }

  function setAuthVisibility() {
    const session = currentSession();
    document.querySelectorAll("[data-guest-only]").forEach((item) => {
      item.hidden = Boolean(session);
    });
    document.querySelectorAll("[data-auth-only]").forEach((item) => {
      item.hidden = !session;
    });
    document.querySelectorAll("[data-user-name]").forEach((item) => {
      item.textContent = session?.name || "교육생";
    });

    const classroomMessage = document.querySelector("[data-classroom-message]");
    if (classroomMessage) {
      classroomMessage.textContent = session
        ? `${session.name}님, 초기 버전에서는 강의실 상세 기능이 비활성화되어 있습니다.`
        : "로그인 후 초기 강의실 상태를 확인할 수 있습니다.";
    }
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");
    const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
  }

  function initMobileMenu() {
    const menu = document.querySelector("[data-menu]");
    const dim = document.querySelector("[data-dim]");
    const open = () => {
      menu?.classList.add("is-open");
      dim?.classList.add("is-open");
      menu?.setAttribute("aria-hidden", "false");
    };
    const close = () => {
      menu?.classList.remove("is-open");
      dim?.classList.remove("is-open");
      menu?.setAttribute("aria-hidden", "true");
    };

    document.querySelector("[data-menu-open]")?.addEventListener("click", open);
    document.querySelector("[data-menu-close]")?.addEventListener("click", close);
    dim?.addEventListener("click", close);
    menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  }

  function initSearch() {
    const panel = document.querySelector("[data-search-panel]");
    document.querySelector("[data-search-open]")?.addEventListener("click", () => {
      panel.hidden = false;
      panel.querySelector("input")?.focus();
    });
    document.querySelector("[data-search-close]")?.addEventListener("click", () => {
      panel.hidden = true;
    });
    document.querySelector("[data-search-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get("q")?.trim();
      window.alert(query ? `"${query}" 검색은 초기 버전에서 비활성화되어 있습니다.` : "검색어를 입력해주세요.");
    });
  }

  function initRelatedSites() {
    const related = document.querySelector("[data-related]");
    const button = related?.querySelector("[data-related-button]");
    const list = related?.querySelector("ul");
    button?.addEventListener("click", () => {
      list.hidden = !list.hidden;
    });
    document.addEventListener("click", (event) => {
      if (related && !related.contains(event.target)) list.hidden = true;
    });
  }

  function initFontControls() {
    let scale = Number(localStorage.getItem("whsFontScale") || "1");
    const apply = () => {
      scale = Math.min(1.16, Math.max(0.92, scale));
      root.style.setProperty("--font-scale", String(scale));
      localStorage.setItem("whsFontScale", String(scale));
    };
    document.querySelector("[data-font='up']")?.addEventListener("click", () => {
      scale += 0.04;
      apply();
    });
    document.querySelector("[data-font='down']")?.addEventListener("click", () => {
      scale -= 0.04;
      apply();
    });
    apply();
  }

  function initLogout() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.removeItem(sessionKey);
        setAuthVisibility();
        if (document.body.classList.contains("login-page")) window.location.href = "index.html";
      });
    });
  }

  async function findAccount(email, password) {
    const config = await loadConfig();
    return (config.qaAccounts || []).find((account) => (
      account.email.toLowerCase() === email.toLowerCase() && account.password === password
    ));
  }

  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;

    const emailInput = form.elements.user_id;
    const passwordInput = form.elements.user_pw;
    const message = document.querySelector("[data-login-message]");
    const saveId = form.elements.save_id;
    const savePw = form.elements.save_pw;

    emailInput.value = localStorage.getItem(savedIdKey) || "";
    passwordInput.value = localStorage.getItem(savedPwKey) || "";
    saveId.checked = Boolean(emailInput.value);
    savePw.checked = Boolean(passwordInput.value);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.hidden = true;
      message.textContent = "";

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email) {
        window.alert("아이디를 입력해주세요.");
        emailInput.focus();
        return;
      }
      if (!password) {
        window.alert("비밀번호를 입력해주세요.");
        passwordInput.focus();
        return;
      }

      let account;
      try {
        account = await findAccount(email, password);
      } catch {
        message.textContent = "로컬 설정 파일을 불러오지 못했습니다. npm start로 실행해주세요.";
        message.hidden = false;
        return;
      }

      if (!account) {
        message.textContent = "입력하신 회원 정보가 일치하지 않습니다.";
        message.hidden = false;
        return;
      }

      if (saveId.checked) localStorage.setItem(savedIdKey, email);
      else localStorage.removeItem(savedIdKey);
      if (savePw.checked) localStorage.setItem(savedPwKey, password);
      else localStorage.removeItem(savedPwKey);

      localStorage.setItem(sessionKey, JSON.stringify({
        email: account.email,
        name: account.name,
        role: account.role,
        permissions: account.permissions,
        loginAt: new Date().toISOString()
      }));
      window.location.href = "index.html";
    });
  }

  function initClassroomPlaceholder() {
    document.querySelector("[data-classroom-open]")?.addEventListener("click", () => {
      window.alert("초기 정적 버전에서는 강의실 상세 API가 연결되지 않았습니다.");
    });
  }

  window.fn_member_login = function fnMemberLogin() {
    document.querySelector("[data-login-form]")?.requestSubmit();
    return false;
  };

  initHeader();
  initMobileMenu();
  initSearch();
  initRelatedSites();
  initFontControls();
  initLogout();
  initLogin();
  initClassroomPlaceholder();
  setAuthVisibility();
})();

