const state = {
  answers: {},
  currentQuestionId: "customerName",
  estimates: [],
  wbs: [],
  mailText: "",
  reviewEditQuestionId: null,
};

const productConfigs = {
  PostgreSQL: ["Single", "HA(공유 스토리지)", "HA(Replication)", "HA + Auto Failover"],
  MongoDB: ["Single", "ReplicaSet", "Shard Cluster"],
  MySQL: ["Single", "HA(공유 스토리지)", "HA(Replication)", "HA + Auto Failover", "Cluster"],
  MariaDB: ["Single", "HA(공유 스토리지)", "HA(Replication)", "HA + Auto Failover", "Cluster"],
  Redis: ["Single", "Sentinel", "Cluster"],
};

const sourceProducts = ["Oracle", "PostgreSQL", "MySQL", "MariaDB", "MongoDB", "기타"];
const targetProducts = ["PostgreSQL", "EPAS", "MySQL", "MariaDB", "MongoDB", "기타"];
const envOptions = ["DEV", "STG", "PRD"];

const labels = {
  customerName: "고객사",
  workType: "작업구분",
  product: "제품",
  topology: "구성방법",
  environments: "대상 환경",
  envCounts: "환경별 대수",
  upgradeMode: "업그레이드 방식",
  currentVersion: "현재 버전",
  targetVersion: "목표 버전",
  includeAppSupport: "APP 테스트 지원",
  includeMonitoring: "모니터링",
  includeMigration: "데이터 이관",
  sourceDb: "Source DB",
  targetDb: "Target DB",
  dataSize: "데이터 규모",
  tableCount: "Table 수",
  indexCount: "Index 수",
  lobCount: "LOB 수",
  viewCount: "View 수",
  procedureCount: "Procedure 수",
  functionCount: "Function 수",
  packageCount: "Package 수",
  triggerCount: "Trigger 수",
  downtime: "다운타임",
  cdcRequired: "CDC 필요",
  migrationRounds: "테스트 이관",
  sqlChangeSupport: "SQL 변경 지원",
  openSupport: "오픈 지원",
};

const questions = {
  customerName: {
    text: "고객사명을 입력해주세요.",
    type: "text",
    next: "workType",
  },
  workType: {
    text: "작업 구분을 선택해주세요.",
    type: "choice",
    options: ["신규 구성", "메이저 업그레이드", "대개체", "이기종 마이그레이션"],
    next: (a) => a.workType === "이기종 마이그레이션" ? "sourceDb" : "product",
  },
  product: {
    text: "대상 제품을 선택해주세요.",
    type: "choice",
    options: Object.keys(productConfigs),
    next: (a) => a.workType === "메이저 업그레이드" ? "upgradeMode" : "topology",
  },
  upgradeMode: {
    text: "업그레이드 방식은 무엇인가요?",
    type: "choice",
    options: ["동일 서버 In-place", "신규 서버 구성 후 교체"],
    next: "topology",
  },
  topology: {
    text: "구성방법을 선택해주세요.",
    type: "choice",
    options: (a) => productConfigs[a.product] || ["Single"],
    next: (a) => a.workType === "메이저 업그레이드" ? "currentVersion" : "environments",
  },
  currentVersion: {
    text: (a) => `${a.product || "제품"}의 현재 버전을 입력해 주세요.\n예) 9.4`,
    type: "text",
    placeholder: "예: 9.4",
    inputMode: "decimal",
    validation: "version",
    next: "targetVersion",
  },
  targetVersion: {
    text: (a) => `${a.product || "제품"}의 목표 버전을 입력해 주세요.\n예) 11.4`,
    type: "text",
    placeholder: "예: 11.4",
    inputMode: "decimal",
    validation: "version",
    next: "environments",
  },
  environments: {
    text: "대상 환경과 대수를 선택해주세요. 선택한 환경만 산정에 반영됩니다.",
    type: "envCheckbox",
    options: envOptions,
    next: (a) => a.workType === "대개체" ? "includeMigration" : "includeAppSupport",
  },
  includeMigration: {
    text: "데이터 이관이 포함되나요?",
    type: "choice",
    options: ["예", "아니오"],
    next: "includeAppSupport",
  },
  includeAppSupport: {
    text: "Application 테스트 문의 응대가 필요한가요?",
    type: "choice",
    options: ["예", "아니오"],
    next: "includeMonitoring",
  },
  includeMonitoring: {
    text: "오픈 또는 작업 후 모니터링 지원이 필요한가요?",
    type: "choice",
    options: ["예", "아니오"],
    next: "finish",
  },
  sourceDb: {
    text: "Source DB를 선택해주세요.",
    type: "choice",
    options: sourceProducts,
    next: "targetDb",
  },
  targetDb: {
    text: "Target DB를 선택해주세요.",
    type: "choice",
    options: targetProducts,
    next: "environmentsMigration",
  },
  environmentsMigration: {
    text: "마이그레이션 대상 환경과 대수를 선택해주세요. 선택한 환경만 산정에 반영됩니다.",
    type: "envCheckbox",
    options: envOptions,
    saveAs: "environments",
    next: "dataSize",
  },
  dataSize: {
    text: "대상 데이터 규모를 테라 단위로 입력해주세요. 예: 0.03 (30G), 1.2 (1.2T)",
    type: "text",
    inputType: "number",
    placeholder: "예: 0.03",
    next: "objectCounts",
  },
  objectCounts: {
    text: "대상 Object 수를 입력해주세요. 모르면 0으로 두면 됩니다.",
    type: "objectCounts",
    next: "downtime",
  },
  downtime: {
    text: "다운타임 확보가 가능한가요?",
    type: "choice",
    options: ["가능", "불가능", "미정"],
    next: "cdcRequired",
  },
  cdcRequired: {
    text: "CDC 구성이 필요한가요?",
    type: "choice",
    options: ["예", "아니오", "미정"],
    next: "migrationRounds",
  },
  migrationRounds: {
    text: "테스트 마이그레이션은 몇 회 진행하나요?",
    type: "choice",
    options: ["1회", "2회", "3회 이상"],
    next: "includeAppSupportMigration",
  },
  includeAppSupportMigration: {
    text: "단위/통합 테스트 지원이 필요한가요?",
    type: "choice",
    options: ["예", "아니오"],
    saveAs: "includeAppSupport",
    next: "sqlChangeSupport",
  },
  sqlChangeSupport: {
    text: "Procedure, Function, Package, View 등의 SQL 변경 작업을 당사에서 지원하나요?",
    type: "choice",
    options: ["예", "아니오"],
    next: "openSupport",
  },
  openSupport: {
    text: "Cutover 및 오픈 후 모니터링 지원이 필요한가요?",
    type: "choice",
    options: ["예", "아니오"],
    next: "finish",
  },
};

const el = {
  chatLog: document.getElementById("chatLog"),
  choiceArea: document.getElementById("choiceArea"),
  freeTextForm: document.getElementById("freeTextForm"),
  freeTextInput: document.getElementById("freeTextInput"),
  summaryList: document.getElementById("summaryList"),
  estimateRows: document.getElementById("estimateRows"),
  wbsRows: document.getElementById("wbsRows"),
  mailEditor: document.getElementById("mailEditor"),
  mailPreview: document.getElementById("mailPreview"),
  copyToast: document.getElementById("copyToast"),
  totalDays: document.getElementById("totalDays"),
  resultNote: document.getElementById("resultNote"),
  statusCard: document.querySelector(".status-card"),
  progressSteps: [...document.querySelectorAll("[data-progress-step]")],
  wbsStartDate: document.getElementById("wbsStartDate"),
  wbsPreviewTitle: document.getElementById("wbsPreviewTitle"),
  resetEstimateButton: document.getElementById("resetEstimateButton"),
  resetModal: document.getElementById("resetModal"),
  cancelResetButton: document.getElementById("cancelResetButton"),
  confirmResetButton: document.getElementById("confirmResetButton"),
  estimatingModal: document.getElementById("estimatingModal"),
};

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  const avatar = role === "bot" ? "RP" : "나";
  const sender = role === "bot" ? "Rockplace" : "사용자";
  node.innerHTML = `
    <div class="message-avatar" aria-hidden="true">${avatar}</div>
    <div class="message-body">
      <div class="message-meta">${sender}</div>
      <div class="message-bubble">
        <div class="message-text"></div>
        <div class="message-controls"></div>
      </div>
    </div>
  `;
  node.querySelector(".message-text").textContent = text;
  el.chatLog.appendChild(node);
  scrollChatToBottom();
  return node.querySelector(".message-controls");
}

function scrollChatToBottom() {
  requestAnimationFrame(() => {
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
    requestAnimationFrame(() => {
      el.chatLog.scrollTop = el.chatLog.scrollHeight;
    });
  });
}

function getQuestion(id) {
  return questions[id];
}

function ask(id) {
  state.currentQuestionId = id;
  const q = getQuestion(id);
  if (!q) return;
  const text = typeof q.text === "function" ? q.text(state.answers) : q.text;
  const bubble = addMessage("bot", text);
  renderInput(q, bubble, id);
  updateChrome();
  scrollChatToBottom();
}

function renderInput(q, target = el.choiceArea, questionId = state.currentQuestionId) {
  el.choiceArea.innerHTML = "";
  el.freeTextInput.value = "";
  el.freeTextInput.type = "text";
  el.freeTextInput.min = "";
  el.freeTextInput.step = "";
  el.freeTextInput.inputMode = "";
  const messageNode = target.closest?.(".message");
  messageNode?.classList.toggle("has-controls", q.type !== "text");

  if (q.type === "envCheckbox") {
    const options = typeof q.options === "function" ? q.options(state.answers) : q.options;
    const group = document.createElement("div");
    group.className = "env-check-grid";
    options.forEach((option) => {
      const label = document.createElement("label");
      label.className = "env-check";
      label.innerHTML = `
        <input type="checkbox" value="${escapeAttr(option)}">
        <span>${option}</span>
        <input class="env-inline-count" type="number" min="0" step="1" value="1" data-env-count="${escapeAttr(option)}" aria-label="${escapeAttr(option)} 대수">
      `;
      group.appendChild(label);
    });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-submit";
    button.textContent = "환경/대수 입력 완료";
    button.addEventListener("click", () => {
      const selected = [...group.querySelectorAll("input:checked")].map((input) => input.value);
      if (selected.length === 0) {
        addMessage("bot", "최소 하나의 환경을 선택해주세요.");
        return;
      }
      const counts = {};
      selected.forEach((env) => {
        const countInput = group.querySelector(`[data-env-count="${env}"]`);
        counts[env] = Math.max(1, Number(countInput?.value || 1));
      });
      handleAnswer({ environments: selected, envCounts: counts }, questionId);
    });
    target.appendChild(group);
    target.appendChild(button);
    el.freeTextInput.disabled = true;
    el.freeTextInput.placeholder = "환경 체크 후 대수를 입력하세요";
  } else if (q.type === "objectCounts") {
    const fields = [
      ["tableCount", "Table"],
      ["indexCount", "Index"],
      ["viewCount", "View"],
      ["procedureCount", "Procedure"],
      ["functionCount", "Function"],
      ["packageCount", "Package"],
      ["lobCount", "LOB/CLOB/BLOB"],
      ["triggerCount", "Trigger"],
    ];
    const group = document.createElement("div");
    group.className = "object-count-grid";
    fields.forEach(([key, label]) => {
      const field = document.createElement("label");
      field.className = "object-count";
      field.innerHTML = `<span>${label}</span><input type="number" min="0" step="1" value="0" data-object-count="${key}" aria-label="${label} 수">`;
      group.appendChild(field);
    });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-submit";
    button.textContent = "Object 수 입력 완료";
    button.addEventListener("click", () => {
      const counts = {};
      group.querySelectorAll("input").forEach((input) => {
        counts[input.dataset.objectCount] = Math.max(0, Number(input.value || 0));
      });
      handleAnswer({ objectCounts: counts }, questionId);
    });
    target.appendChild(group);
    target.appendChild(button);
    el.freeTextInput.disabled = true;
    el.freeTextInput.placeholder = "Object 수를 한 번에 입력하세요";
  } else if (q.type === "choice") {
    const options = typeof q.options === "function" ? q.options(state.answers) : q.options;
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => handleAnswer(option, questionId));
      target.appendChild(button);
    });
    el.freeTextInput.disabled = true;
    el.freeTextInput.placeholder = "아래 선택지를 고르세요";
  } else {
    const placeholder = typeof q.placeholder === "function" ? q.placeholder(state.answers) : q.placeholder;
    el.freeTextInput.disabled = false;
    el.freeTextInput.type = q.inputType || "text";
    el.freeTextInput.min = q.inputType === "number" ? "0" : "";
    el.freeTextInput.step = q.inputType === "number" ? "0.01" : "";
    el.freeTextInput.inputMode = q.inputMode || (q.inputType === "number" ? "decimal" : "");
    el.freeTextInput.placeholder = placeholder || "답변을 입력하세요";
    el.freeTextInput.focus();
  }
  scrollChatToBottom();
}

function handleAnswer(value, questionId = state.currentQuestionId) {
  if (questionId !== state.currentQuestionId) {
    addMessage("bot", "이전 질문의 선택지는 사용할 수 없습니다. 현재 질문에 답변해주세요.");
    scrollChatToBottom();
    return;
  }
  const q = getQuestion(questionId);
  const validation = validateAnswer(q, value);
  if (!validation.ok) {
    addMessage("bot", validation.message);
    scrollChatToBottom();
    return;
  }
  const key = q.saveAs || questionId;
  const cleanValue = normalizeAnswer(value);
  if (cleanValue && typeof cleanValue === "object" && cleanValue.environments && cleanValue.envCounts) {
    state.answers.environments = cleanValue.environments;
    state.answers.envCounts = cleanValue.envCounts;
  } else if (cleanValue && typeof cleanValue === "object" && cleanValue.objectCounts) {
    Object.assign(state.answers, cleanValue.objectCounts);
  } else {
    state.answers[key] = cleanValue;
  }
  addMessage("user", formatAnswerForKey(key, cleanValue));
  updateSummary();

  if (state.reviewEditQuestionId === questionId) {
    state.reviewEditQuestionId = null;
    showAnswerReview();
    scrollChatToBottom();
    return;
  }

  const next = typeof q.next === "function" ? q.next(state.answers) : q.next;
  if (next === "finish") {
    showAnswerReview();
  } else {
    ask(next);
  }
  scrollChatToBottom();
}

function normalizeAnswer(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value;
  return value.trim() || "미정";
}

function validateAnswer(q, value) {
  if (!q) return { ok: false, message: "현재 질문을 확인할 수 없습니다. 다시 입력해주세요." };
  if (q.type === "envCheckbox") {
    const valid = value && typeof value === "object" && Array.isArray(value.environments) && value.environments.length > 0 && value.envCounts;
    return valid
      ? { ok: true }
      : { ok: false, message: "대상 환경을 최소 하나 이상 체크한 뒤 대수를 입력해주세요." };
  }
  if (q.type === "objectCounts") {
    const valid = value && typeof value === "object" && value.objectCounts;
    return valid
      ? { ok: true }
      : { ok: false, message: "Object 수 입력 영역에서 값을 확인한 뒤 완료 버튼을 눌러주세요." };
  }
  if (q.type === "choice") {
    const options = typeof q.options === "function" ? q.options(state.answers) : q.options;
    return options.includes(value)
      ? { ok: true }
      : { ok: false, message: "현재 질문의 선택지 중 하나를 선택해주세요." };
  }
  if (q.inputType === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0
      ? { ok: true }
      : { ok: false, message: "숫자만 입력해주세요. 예: 0.03, 1.2, 5" };
  }
  if (q.validation === "version") {
    const version = String(value || "").trim();
    return /^\d+(?:\.\d+){0,3}$/.test(version)
      ? { ok: true }
      : { ok: false, message: "버전은 숫자와 점(.)만 입력해주세요. 예: 9.4, 11.4" };
  }
  return String(value || "").trim()
    ? { ok: true }
    : { ok: false, message: "값을 입력한 뒤 진행해주세요." };
}

function reviewFlowIds() {
  const a = state.answers;
  if (a.workType === "이기종 마이그레이션") {
    return [
      "customerName",
      "workType",
      "sourceDb",
      "targetDb",
      "environmentsMigration",
      "dataSize",
      "objectCounts",
      "downtime",
      "cdcRequired",
      "migrationRounds",
      "includeAppSupportMigration",
      "sqlChangeSupport",
      "openSupport",
    ];
  }
  const ids = ["customerName", "workType", "product"];
  if (a.workType === "메이저 업그레이드") ids.push("upgradeMode");
  ids.push("topology");
  if (a.workType === "메이저 업그레이드") ids.push("currentVersion", "targetVersion");
  ids.push("environments");
  if (a.workType === "대개체") ids.push("includeMigration");
  ids.push("includeAppSupport", "includeMonitoring");
  return ids;
}

function answerReviewItems() {
  return reviewFlowIds().map((questionId) => {
    const q = getQuestion(questionId);
    const key = q.saveAs || questionId;
    if (questionId === "objectCounts") {
      return { questionId, label: "Object 수", value: formatAnswer({ objectCounts: collectObjectCounts() }) };
    }
    if (key === "environments") {
      return { questionId, label: labels.environments, value: formatAnswer({ environments: state.answers.environments || [], envCounts: state.answers.envCounts || {} }) };
    }
    return { questionId, label: labels[key] || q.text, value: formatAnswerForKey(key, state.answers[key]) };
  }).filter((item) => item.value && item.value !== "undefined");
}

function collectObjectCounts() {
  return {
    tableCount: state.answers.tableCount || 0,
    indexCount: state.answers.indexCount || 0,
    viewCount: state.answers.viewCount || 0,
    procedureCount: state.answers.procedureCount || 0,
    functionCount: state.answers.functionCount || 0,
    packageCount: state.answers.packageCount || 0,
    lobCount: state.answers.lobCount || 0,
    triggerCount: state.answers.triggerCount || 0,
  };
}

function showAnswerReview() {
  state.currentQuestionId = "answerReview";
  const items = answerReviewItems();
  const summary = items.map((item, index) => `${index + 1}. ${item.label}: ${item.value}`).join("\n");
  const controls = addMessage("bot", `입력 내용을 확인해주세요.\n\n${summary}\n\n수정할 항목 번호를 선택하거나, 문제가 없으면 공수 산정을 시작해주세요.`);
  const numberWrap = document.createElement("div");
  numberWrap.className = "review-number-grid";
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${index + 1}`;
    button.title = `${item.label} 수정`;
    button.addEventListener("click", () => editAnswerFrom(item.questionId));
    numberWrap.appendChild(button);
  });
  controls.appendChild(numberWrap);

  const restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.textContent = "전체 다시 입력";
  restartButton.addEventListener("click", resetEstimate);

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.className = "control-submit";
  startButton.textContent = "공수 산정 시작";
  startButton.addEventListener("click", startEstimateWithAnimation);

  controls.appendChild(restartButton);
  controls.appendChild(startButton);
  el.freeTextInput.disabled = true;
  el.freeTextInput.placeholder = "입력 내용을 확인해주세요";
  updateChrome();
  scrollChatToBottom();
}

function editAnswerFrom(questionId) {
  state.reviewEditQuestionId = questionId;
  hideEstimateTabs();
  state.estimates = [];
  state.wbs = [];
  state.mailText = "";
  el.mailEditor.value = "";
  updateSummary();
  addMessage("bot", "선택한 항목만 다시 입력하겠습니다. 수정 후 요약 화면으로 돌아갑니다.");
  ask(questionId);
}

function clearAnswersFrom(questionId) {
  const ids = reviewFlowIds();
  const index = ids.indexOf(questionId);
  const targets = index >= 0 ? ids.slice(index) : [questionId];
  targets.forEach((id) => {
    const q = getQuestion(id);
    const key = q?.saveAs || id;
    if (key === "environments") {
      delete state.answers.environments;
      delete state.answers.envCounts;
      return;
    }
    if (id === "objectCounts") {
      ["tableCount", "indexCount", "viewCount", "procedureCount", "functionCount", "packageCount", "lobCount", "triggerCount"].forEach((countKey) => delete state.answers[countKey]);
      return;
    }
    delete state.answers[key];
  });
}

function formatAnswer(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") {
    if (value.environments && value.envCounts) {
      return value.environments.map((env) => `${env} ${value.envCounts[env] || 1}`).join(", ");
    }
    if (value.objectCounts) {
      const names = {
        tableCount: "Table",
        indexCount: "Index",
        viewCount: "View",
        procedureCount: "Procedure",
        functionCount: "Function",
        packageCount: "Package",
        lobCount: "LOB",
        triggerCount: "Trigger",
      };
      return Object.entries(value.objectCounts).map(([key, count]) => `${names[key] || key} ${count}`).join(", ");
    }
    return Object.entries(value).map(([key, count]) => `${key} ${count}`).join(", ");
  }
  return value;
}

function formatAnswerForKey(key, value) {
  if (key === "dataSize") return dataSizeLabel(value);
  return formatAnswer(value);
}

function finishEstimate() {
  calculateEstimate();
  state.mailText = buildMailText();
  el.mailEditor.value = state.mailText;
  if (el.wbsStartDate && !el.wbsStartDate.value) el.wbsStartDate.value = formatDate(new Date());
  renderEstimateRows();
  renderWbsRows();
  updateOutput();
  revealEstimateTabs();
  addMessage("bot", "산정 초안을 만들었습니다. 공수 산정 탭에서 상세 항목을 검토해주세요.");
  switchView("reviewView");
}

function startEstimateWithAnimation() {
  openEstimatingModal();
  window.setTimeout(() => {
    finishEstimate();
    closeEstimatingModal();
  }, 2000);
}

function syncDerivedFromEstimates() {
  state.wbs = state.answers.workType === "이기종 마이그레이션" ? migrationWbs() : generalWbs();
  state.mailText = buildMailText();
  el.mailEditor.value = state.mailText;
  renderWbsRows();
  updateOutput();
}

function selectedEnvironments() {
  const env = state.answers.environments;
  if (Array.isArray(env)) return env;
  if (typeof env === "string" && env) return env.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function environmentCounts() {
  const counts = state.answers.envCounts || {};
  return selectedEnvironments().map((env) => ({
    env,
    count: Math.max(0, Number(counts[env] || 1)),
  }));
}

function envCount() {
  return environmentCounts().reduce((sum, item) => sum + item.count, 0) || 1;
}

function envSummary() {
  return environmentCounts().map((item) => `${item.env} ${item.count}`).join(", ");
}

function parseNumber(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function dataSizeMultiplier() {
  const sizeTb = parseNumber(state.answers.dataSize);
  if (sizeTb >= 5) return 2;
  if (sizeTb >= 1) return 1.5;
  return 1;
}

function dataSizeWeightNote(weight) {
  if (weight === 2) return "데이터 규모 5T 이상 가중치 2배";
  if (weight === 1.5) return "데이터 규모 1T 이상 5T 미만 가중치 1.5배";
  return "";
}

function dataSizeLabel(value = state.answers.dataSize) {
  const sizeTb = parseNumber(value);
  return `${sizeTb}T`;
}

function calculateEstimate() {
  const a = state.answers;
  if (a.workType === "이기종 마이그레이션") {
    state.estimates = migrationEstimate();
    state.wbs = migrationWbs();
    return;
  }

  if (a.workType === "신규 구성") {
    state.estimates = newBuildEstimate();
  } else if (a.workType === "메이저 업그레이드") {
    state.estimates = majorUpgradeEstimate();
  } else {
    state.estimates = replacementEstimate();
  }
  state.wbs = generalWbs();
}

function newBuildTasks(product, topology) {
  const shared = {
    Single: [["엔진 설치 및 파라미터 세팅", 1, "PDF 신규 구성 기준"]],
    "HA(공유 스토리지)": [["엔진 설치 및 파라미터 세팅", 1, "공유 스토리지 방식"], ["Failover 테스트 지원", 2, "공유 스토리지 HA"]],
    "HA(Replication)": [["엔진 설치 및 파라미터 세팅", 1, "Replication HA"], ["Replication 구성 및 연동 확인", 1, "Replication HA"]],
    "HA + Auto Failover": [["엔진 설치 및 파라미터 세팅", 1, "Auto Failover HA"], ["Replication 구성 및 연동 확인", 1, "Auto Failover HA"], ["AutoFailover 세팅", 1, "Auto Failover HA"], ["AutoFailover 테스트 지원", 2, "Auto Failover HA"]],
    Cluster: [["엔진 설치 및 파라미터 세팅", 1, "Cluster HA"], ["Cluster 구성 및 연동 확인", 1, "Cluster HA"], ["AutoFailover 세팅", 1, "Cluster HA"], ["AutoFailover 테스트 지원", 2, "Cluster HA"]],
  };

  if (product === "MongoDB") {
    return {
      Single: [["MongoDB 엔진 설치 및 파라미터 세팅", 1, "MongoDB 신규 구성"], ["Application 연동 테스트 지원", 1, "MongoDB 신규 구성"]],
      ReplicaSet: [["MongoDB 엔진 설치 및 ReplicaSet 구성", 1, "MongoDB ReplicaSet"], ["Application 연동 테스트 지원", 1, "MongoDB ReplicaSet"]],
      "Shard Cluster": [["MongoDB 엔진 설치 및 Shard ReplicaSet 구성", 1, "MongoDB Shard Cluster"], ["Config Database 및 mongos 구성", 1, "MongoDB Shard Cluster"], ["Application 연동 테스트 지원", 2, "MongoDB Shard Cluster"]],
    }[topology] || shared.Single;
  }

  if (product === "Redis") {
    return {
      Single: [["Redis 엔진 설치 및 파라미터 세팅", 1, "Redis 신규 구성"], ["Application 연동 테스트 지원", 1, "Redis 신규 구성"]],
      Sentinel: [["Redis 엔진 설치 및 ReplicaSet + Sentinel 구성", 2, "Redis Sentinel"], ["AutoFailover 세팅 및 Failover 테스트 지원", 1, "Redis Sentinel"], ["Application 연동 테스트 지원", 1, "Redis Sentinel"]],
      Cluster: [["Redis 엔진 설치 및 Cluster 구성", 2, "Redis Cluster"], ["AutoFailover 세팅 및 Failover 테스트 지원", 1, "Redis Cluster"], ["Application 연동 테스트 지원", 2, "Redis Cluster"]],
    }[topology] || shared.Single;
  }

  return shared[topology] || shared.Single;
}

function replacementTasks(product, topology, env, includeMigration) {
  const tasks = newBuildTasks(product, topology).map(([task, days, note]) => [
    task.replace("엔진 설치", "신규 서버에 엔진 설치"),
    days,
    note,
  ]);

  if (includeMigration === "예") {
    if (topology === "HA(Replication)") {
      tasks.push(["데이터 마이그레이션 및 Replication 재구성", product === "PostgreSQL" ? 1 : 2, "대개체 데이터 이관"]);
    } else {
      tasks.push(["데이터 마이그레이션", 1, "대개체 데이터 이관"]);
    }
  }

  if (env === "DEV") {
    tasks.push(["고객 Application 테스트 문의 응대", 3, "DEV 기준"]);
  } else {
    tasks.push(["이관 후 모니터링", 1, `${env} 기준`]);
  }
  return tasks;
}

function versionLabel() {
  const current = state.answers.currentVersion || "현재 버전";
  const target = state.answers.targetVersion || "목표 버전";
  return `${current} → ${target}`;
}

function upgradeTasks(product, topology, env, upgradeMode) {
  const version = versionLabel();
  if (upgradeMode === "동일 서버 In-place") {
    const base = product === "Redis" || product === "MongoDB"
      ? [[`신규 엔진 설치 및 엔진 교체 후 재기동 (${version})`, 1, `동일 서버 업그레이드 ${version}`], ["모니터링 및 Application 연동 테스트 지원", product === "MongoDB" && topology === "Shard Cluster" ? 3 : 2, `Major upgrade ${version}`]]
      : [["AS-IS 구성 상태 확인", 0.5, `동일 서버 업그레이드 ${version}`], [`설치 파일 업로드 및 신규 엔진 설치 (${version})`, 0.5, `동일 서버 업그레이드 ${version}`], ["Application / DB 종료", 0.5, `동일 서버 업그레이드 ${version}`], ["Data Directory 복사", 0.5, `동일 서버 업그레이드 ${version}`], [`Major 업그레이드 수행 (${version})`, 0.5, `동일 서버 업그레이드 ${version}`], ["DB / Application 기동 및 서비스 체크", 0.5, `동일 서버 업그레이드 ${version}`], ["모니터링", 0.5, `동일 서버 업그레이드 ${version}`]];
    if (product === "MongoDB" && topology !== "Single") base[0][0] = topology === "Shard Cluster" ? `발란서 중지 후 롤링 업그레이드 (${version})` : `ReplicaSet 롤링 업그레이드 (${version})`;
    if (product === "Redis" && topology !== "Single") base[0][0] = `롤링 업그레이드 (${version})`;
    return base;
  }

  return replacementTasks(product, topology, env, "예")
    .filter((task) => !(task[0].includes("이관 후 모니터링") || task[0].includes("고객 Application 테스트 문의 응대")))
    .map((task) => [
      task[0].includes("엔진 설치") ? `${task[0]} (${version})` : task[0].replace("대개체", "Major Upgrade"),
      task[1],
      `신규 서버 교체형 Major Upgrade ${version}`,
    ]);
}

function pushEnvTasks(estimates, env, count, phase, product, topology, tasks) {
  tasks.forEach(([task, days, note]) => {
    estimates.push({
      phase: `${env} ${phase}`,
      task,
      days: days * count,
      note: "",
    });
  });
}

function newBuildEstimate() {
  const a = state.answers;
  const estimates = [];
  environmentCounts().forEach(({ env, count }) => {
    pushEnvTasks(estimates, env, count, "신규 구성", a.product, a.topology, newBuildTasks(a.product, a.topology));
    if (a.includeAppSupport === "예") {
      estimates.push({ phase: `${env} 고객 응대`, task: "Application 테스트 중 추가 문의 응대", days: count, note: "" });
    }
    if (a.includeMonitoring === "예") {
      estimates.push({ phase: `${env} 모니터링`, task: "구성 후 상태 점검 및 모니터링", days: count, note: "" });
    }
  });
  return estimates;
}

function majorUpgradeEstimate() {
  const a = state.answers;
  const estimates = [];
  environmentCounts().forEach(({ env, count }) => {
    pushEnvTasks(estimates, env, count, "메이저 업그레이드", a.product, a.topology, upgradeTasks(a.product, a.topology, env, a.upgradeMode));
    if (a.includeAppSupport === "예" && env === "DEV") {
      estimates.push({ phase: `${env} 테스트 지원`, task: "Application 테스트 중 문의 응대", days: 3, note: "" });
    }
    if (a.includeMonitoring === "예" && env !== "DEV") {
      estimates.push({ phase: `${env} 모니터링`, task: "업그레이드 후 모니터링", days: count, note: "" });
    }
  });
  return estimates;
}

function replacementEstimate() {
  const a = state.answers;
  let estimates = [];
  environmentCounts().forEach(({ env, count }) => {
    pushEnvTasks(estimates, env, count, "대개체", a.product, a.topology, replacementTasks(a.product, a.topology, env, a.includeMigration));
    if (a.includeAppSupport === "아니오") {
      estimates = estimates.filter((item) => !(item.phase === `${env} 대개체` && item.task.includes("고객 Application 테스트 문의 응대")));
    }
    if (a.includeMonitoring === "아니오") {
      estimates = estimates.filter((item) => !(item.phase === `${env} 대개체` && item.task.includes("이관 후 모니터링")));
    }
  });
  return estimates;
}

function migrationEstimate() {
  const a = state.answers;
  const sqlObjects = ["viewCount", "procedureCount", "functionCount", "packageCount", "triggerCount"]
    .reduce((sum, key) => sum + parseNumber(a[key]), 0);
  const envs = environmentCounts();
  const hasPrd = envs.some(({ env }) => env === "PRD");
  const refreshTargets = envs.filter(({ env }) => env === "DEV" || env === "STG");
  const useCdc = a.cdcRequired === "예" || a.downtime === "불가능";
  const sizeWeight = dataSizeMultiplier();
  const estimates = [
    { phase: "1. AS-IS 분석 및 환경 설정", task: "AS-IS 시스템 분석 및 마이그레이션 환경 설정", days: 5, note: "" },
  ];

  envs.forEach(({ env, count }) => {
    estimates.push({ phase: "2. TO-BE 시스템 구축", task: `[${env}] ${a.targetDb} 제품 설치`, days: 1 * count, note: "" });
    estimates.push({ phase: "2. TO-BE 시스템 구축", task: `[${env}] 파라미터 세팅 및 구성`, days: 1 * count, note: "" });
    estimates.push({ phase: "3. 마이그레이션 준비", task: `[${env}] 마이그레이션 도구 설치 및 환경 설정`, days: 3 * count, note: "" });
    estimates.push({ phase: "4. Object 전환 및 검증 준비", task: `[${env}] DDL 추출 및 TO-BE 시스템에 맞게 Object 변환`, days: 3 * count, note: "" });
    estimates.push({ phase: "4. Object 전환 및 검증 준비", task: `[${env}] TO-BE Object 구성`, days: 2 * count, note: "" });
  });

  if (a.sqlChangeSupport === "예") {
    const sqlDays = Math.max(sqlObjects, 1);
    const sqlNote = sqlObjects > 0 ? "객체 1개당 1 M/D" : "SQL 변경 지원 기본 공수";
    estimates.push({ phase: "5. SQL 변경 지원", task: "View, Procedure, Function, Package, Trigger 변경 지원", days: sqlDays, note: sqlNote });
  }

  if (useCdc) {
    estimates.push({ phase: "6. CDC 구성", task: "초기 적재 및 데이터 동기화 진행", days: 5 * sizeWeight, note: dataSizeWeightNote(sizeWeight) });
  } else {
    estimates.push({ phase: "6. 테스트 데이터 마이그레이션", task: "1차 테스트 데이터 마이그레이션", days: 2 * sizeWeight, note: dataSizeWeightNote(sizeWeight) });
    estimates.push({ phase: "6. 테스트 데이터 마이그레이션", task: "1차 이관 스크립트 검증 및 데이터 검증", days: 2, note: "" });
    estimates.push({ phase: "6. 테스트 데이터 마이그레이션", task: "2차 테스트 데이터 마이그레이션", days: 2 * sizeWeight, note: dataSizeWeightNote(sizeWeight) });
    estimates.push({ phase: "6. 테스트 데이터 마이그레이션", task: "2차 이관 스크립트 검증 및 데이터 검증", days: 2, note: "" });
  }

  if (a.includeAppSupport === "예" && hasPrd) {
    estimates.push({ phase: "7. 단위/통합 테스트 지원", task: "[PRD] 단위/통합 테스트 지원 및 문의 응대, 모니터링", days: 20, note: "PRD만 해당" });
  }

  if (a.openSupport === "예" && hasPrd) {
    const openTask = useCdc
      ? "[PRD] CDC 동기화 종료, CutOver, 데이터 검증, 오픈 모니터링"
      : "[PRD] Cutover, 데이터 마이그레이션, 데이터 검증, 오픈 모니터링";
    estimates.push({ phase: "8. 오픈 지원", task: openTask, days: 5, note: "PRD만 해당" });
  }

  if (refreshTargets.length > 0) {
    refreshTargets.forEach(({ env }) => {
      estimates.push({ phase: "9. 데이터 현행화", task: `[${env}] Object 및 데이터 현행화`, days: 2, note: `${env}만 해당` });
    });
  }

  return normalizeMigrationPhases(estimates);
}

function normalizeMigrationPhases(estimates) {
  const phaseNumbers = new Map();
  let nextNumber = 1;
  return estimates.map((item) => {
    const title = String(item.phase || "").replace(/^\s*\d+\.\s*/, "").trim();
    if (!phaseNumbers.has(title)) {
      phaseNumbers.set(title, nextNumber);
      nextNumber += 1;
    }
    return { ...item, phase: `${phaseNumbers.get(title)}. ${title}` };
  });
}

function generalWbs() {
  let cursor = baseScheduleStartDate();
  return state.estimates.map((item, index) => {
    const duration = Math.max(0, Math.ceil(Number(item.days || 0)));
    const start = new Date(cursor);
    const end = duration > 0 ? addDays(start, duration - 1) : new Date(start);
    cursor = addDays(end, 1);
    const phase = /^\d+\./.test(item.phase) ? item.phase : `${index + 1}. ${item.phase}`;
    return {
      phase,
      activity: item.task,
      start: formatDate(start),
      end: formatDate(end),
      duration: item.days,
      owner: "락플레이스",
      output: "",
      note: state.answers.workType === "이기종 마이그레이션" ? item.note : "",
    };
  });
}

function migrationWbs() {
  return generalWbs().map((row) => ({
    ...row,
    owner: "락플레이스",
    note: `${state.answers.sourceDb} → ${state.answers.targetDb}, ${row.note}`,
  }));
}

function buildMailText() {
  const a = state.answers;
  const total = sumDays();
  const lines = buildGroupedEstimateText();
  const migrationInfo = a.workType === "이기종 마이그레이션"
    ? `\n[마이그레이션 대상]\n· Source/Target: ${a.sourceDb} → ${a.targetDb}\n· 대상 환경/대수: ${envSummary()}\n· 데이터 규모: ${dataSizeLabel()}\n· Table/Index/LOB: ${a.tableCount || 0}/${a.indexCount || 0}/${a.lobCount || 0}\n· SQL 변경 대상: View ${a.viewCount || 0}, Procedure ${a.procedureCount || 0}, Function ${a.functionCount || 0}, Package ${a.packageCount || 0}, Trigger ${a.triggerCount || 0}\n· 다운타임/CDC: ${a.downtime} / ${a.cdcRequired}\n`
    : `\n[대상 구성]\n· 제품/구성: ${a.product} / ${a.topology}${a.workType === "메이저 업그레이드" ? `\n· 업그레이드 버전: ${versionLabel()}` : ""}\n· 대상 환경/대수: ${envSummary()}\n`;

  return `안녕하세요.\n\n${a.customerName} 관련 공수 산정 초안 전달드립니다.\n\n[산정 요약]\n· 작업 구분: ${a.workType}\n· 총 예상 공수: ${total} M/D\n${migrationInfo}\n[상세 공수]\n${lines}\n\n상기 공수는 현재 제공된 정보를 기준으로 산정한 초안이며, 실제 일정, 접속 환경, 데이터 이관 속도, 테스트 범위, 고객 문의 대응 범위에 따라 조정될 수 있습니다.\n\n감사합니다.`;
}

function sumDays() {
  return state.estimates.reduce((sum, item) => sum + Number(item.days || 0), 0);
}

function groupedEstimates() {
  const groups = [];
  state.estimates.forEach((item, index) => {
    let group = groups.find((entry) => entry.phase === item.phase);
    if (!group) {
      group = { phase: item.phase, items: [] };
      groups.push(group);
    }
    group.items.push({ ...item, index });
  });
  return groups;
}

function groupSubtotal(group) {
  return group.items.reduce((sum, item) => sum + Number(item.days || 0), 0);
}

function groupTitle(group) {
  const env = selectedEnvironments().find((item) => group.phase.startsWith(`${item} `));
  if (!env) return group.phase;
  const count = state.answers.envCounts?.[env];
  return count ? `${group.phase} (${count}대)` : group.phase;
}

function shouldShowEstimateNote(item) {
  if (state.answers.workType === "이기종 마이그레이션") return true;
  return false;
}

function buildGroupedEstimateText() {
  return groupedEstimates().map((group) => {
    const items = group.items.map((item) => {
      const note = shouldShowEstimateNote(item) && item.note ? ` (${item.note})` : "";
      return `  · ${item.task}: ${item.days} M/D${note}`;
    }).join("\n");
    return `${groupTitle(group)} - 소계 ${groupSubtotal(group)} M/D\n${items}`;
  }).join("\n\n");
}

function renderEstimateRows() {
  el.estimateRows.innerHTML = "";
  groupedEstimates().forEach((group, groupIndex) => {
    const groupRow = document.createElement("tr");
    groupRow.className = "estimate-group-row";
    groupRow.dataset.groupIndex = groupIndex;
    groupRow.innerHTML = `
      <td colspan="2">${escapeHtml(groupTitle(group))}</td>
      <td><span class="group-subtotal">${groupSubtotal(group)} M/D</span></td>
      <td><button class="row-action-button" type="button" data-insert-after="${group.items[group.items.length - 1].index}">+</button></td>
    `;
    el.estimateRows.appendChild(groupRow);

    group.items.forEach((item, itemIndex) => {
      const tr = document.createElement("tr");
      tr.className = "estimate-detail-row";
      tr.innerHTML = `
        <td class="estimate-sequence">${itemIndex + 1}</td>
        <td><textarea rows="1" placeholder="작업 내용을 입력하세요" data-estimate="${item.index}" data-field="task">${escapeHtml(item.task)}</textarea></td>
        <td><input type="number" step="0.5" min="0" value="${item.days}" data-estimate="${item.index}" data-field="days"></td>
        <td class="row-actions">
          <button class="row-action-button" type="button" data-insert-after="${item.index}">+</button>
          <button class="delete-button" type="button" data-delete-estimate="${item.index}">×</button>
        </td>
      `;
      el.estimateRows.appendChild(tr);
    });
  });
}

function updateEstimateGroupSubtotals() {
  groupedEstimates().forEach((group, index) => {
    const target = el.estimateRows.querySelector(`[data-group-index="${index}"] .group-subtotal`);
    if (target) target.textContent = `${groupSubtotal(group)} M/D`;
  });
}

function outputPlaceholder(item) {
  const text = `${item.phase || ""} ${item.activity || ""}`;
  if (text.includes("모니터링")) return "예: 모니터링 결과";
  if (text.includes("테스트")) return "예: 테스트 지원 내역";
  if (text.includes("SQL")) return "예: SQL 변경 내역";
  if (text.includes("마이그레이션")) return "예: 마이그레이션 결과";
  return "예: 작업 결과";
}

function renderWbsRows() {
  el.wbsRows.innerHTML = "";
  if (el.wbsPreviewTitle) el.wbsPreviewTitle.textContent = excelTitle();
  groupedWbsForExcel().forEach((group) => {
    const groupRow = document.createElement("tr");
    groupRow.className = "wbs-group-row";
    groupRow.innerHTML = `<td colspan="8">${escapeHtml(group.groupTitle)}</td>`;
    el.wbsRows.appendChild(groupRow);

    group.rows.forEach((item, groupIndex) => {
    const tr = document.createElement("tr");
    tr.className = "wbs-detail-row";
    tr.innerHTML = `
      <td class="wbs-sequence">${groupIndex + 1}</td>
      <td><textarea rows="1" placeholder="작업 내용을 입력하세요" data-wbs="${item.index}" data-field="activity">${escapeHtml(item.activity)}</textarea></td>
      <td><input type="date" value="${item.start}" data-wbs="${item.index}" data-field="start"></td>
      <td><input type="date" value="${item.end}" data-wbs="${item.index}" data-field="end"></td>
      <td><input type="number" step="0.5" min="0" value="${item.duration}" data-wbs="${item.index}" data-field="duration"></td>
      <td><input value="${escapeAttr(item.owner)}" data-wbs="${item.index}" data-field="owner"></td>
      <td><input value="${escapeAttr(item.output)}" placeholder="${escapeAttr(outputPlaceholder(item))}" data-wbs="${item.index}" data-field="output"></td>
      <td><button class="delete-button" type="button" data-delete-wbs="${item.index}">×</button></td>
    `;
    el.wbsRows.appendChild(tr);
    });
  });
}

function updateSummary() {
  el.summaryList.innerHTML = "";
  Object.entries(labels).forEach(([key, label]) => {
    if (!state.answers[key]) return;
    const row = document.createElement("div");
    row.innerHTML = `<dt>${label}</dt><dd>${escapeHtml(formatAnswerForKey(key, state.answers[key]))}</dd>`;
    el.summaryList.appendChild(row);
  });
}

function updateOutput() {
  const total = sumDays();
  el.totalDays.textContent = `${total} M/D`;
  el.resultNote.textContent = `${state.answers.customerName || ""} ${state.answers.workType || ""} 산정 결과`;
  el.mailPreview.textContent = el.mailEditor.value || state.mailText;
  updateChrome();
}

function updateChrome() {
  const activeView = document.querySelector(".view.is-active")?.id;
  const stage = activeView === "outputView" ? "output" : state.estimates.length > 0 ? "review" : "input";
  const order = ["input", "review", "output"];
  const activeIndex = order.indexOf(stage);
  el.statusCard?.setAttribute("data-stage", stage);
  el.progressSteps.forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.progressStep);
    step.classList.toggle("is-active", stepIndex === activeIndex);
    step.classList.toggle("is-complete", stepIndex < activeIndex);
  });
}

function switchView(viewId) {
  if ((viewId === "reviewView" || viewId === "outputView") && state.estimates.length === 0) return;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("is-active", view.id === viewId));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === viewId));
  if (viewId === "outputView") {
    updateOutput();
  }
  updateChrome();
}

function revealEstimateTabs() {
  document.querySelectorAll('[data-view="reviewView"], [data-view="outputView"]').forEach((tab) => tab.classList.remove("is-hidden"));
}

function hideEstimateTabs() {
  document.querySelectorAll('[data-view="reviewView"], [data-view="outputView"]').forEach((tab) => tab.classList.add("is-hidden"));
}

function resetEstimate() {
  state.answers = {};
  state.currentQuestionId = "customerName";
  state.estimates = [];
  state.wbs = [];
  state.mailText = "";
  state.reviewEditQuestionId = null;
  el.chatLog.innerHTML = "";
  el.choiceArea.innerHTML = "";
  el.freeTextInput.value = "";
  el.freeTextInput.disabled = false;
  el.freeTextInput.type = "text";
  el.freeTextInput.min = "";
  el.freeTextInput.step = "";
  el.freeTextInput.inputMode = "";
  el.freeTextInput.placeholder = "답변을 입력하세요";
  el.summaryList.innerHTML = "";
  el.estimateRows.innerHTML = "";
  el.wbsRows.innerHTML = "";
  if (el.wbsPreviewTitle) el.wbsPreviewTitle.textContent = "";
  if (el.wbsStartDate) el.wbsStartDate.value = "";
  el.mailEditor.value = "";
  el.mailPreview.textContent = "";
  el.totalDays.textContent = "0 M/D";
  el.resultNote.textContent = "공수 산정 화면에서 항목을 조정한 뒤 최종 산출물을 생성하세요.";
  hideEstimateTabs();
  updateChrome();
  switchView("chatView");
  ask("customerName");
}

function openResetModal() {
  if (!el.resetModal) return;
  el.resetModal.classList.add("is-open");
  el.resetModal.setAttribute("aria-hidden", "false");
  el.confirmResetButton?.focus();
}

function closeResetModal() {
  if (!el.resetModal) return;
  el.resetModal.classList.remove("is-open");
  el.resetModal.setAttribute("aria-hidden", "true");
  el.resetEstimateButton?.focus();
}

function openEstimatingModal() {
  if (!el.estimatingModal) return;
  el.estimatingModal.classList.add("is-open");
  el.estimatingModal.setAttribute("aria-hidden", "false");
}

function closeEstimatingModal() {
  if (!el.estimatingModal) return;
  el.estimatingModal.classList.remove("is-open");
  el.estimatingModal.setAttribute("aria-hidden", "true");
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function parseDateOnly(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function baseScheduleStartDate() {
  return parseDateOnly(el.wbsStartDate?.value || formatDate(new Date()));
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function recalculateWbsScheduleFromStart() {
  let cursor = baseScheduleStartDate();
  state.wbs.forEach((row) => {
    const duration = Math.max(0, Math.ceil(Number(row.duration || 0)));
    const start = new Date(cursor);
    const end = duration > 0 ? addDays(start, duration - 1) : new Date(start);
    row.start = formatDate(start);
    row.end = formatDate(end);
    cursor = addDays(end, 1);
  });
  renderWbsRows();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

function showCopyToast(message = "클립보드에 복사되었습니다") {
  if (!el.copyToast) return;
  el.copyToast.textContent = message;
  el.copyToast.classList.add("is-visible");
  window.setTimeout(() => el.copyToast?.classList.remove("is-visible"), 1800);
}

function excelTitle() {
  const a = state.answers;
  if (a.workType === "이기종 마이그레이션") {
    return `WBS - ${a.customerName || ""} (${a.sourceDb || ""} → ${a.targetDb || ""} 이기종 마이그레이션)`;
  }
  const detail = [a.product, a.topology, a.workType].filter(Boolean).join(" / ");
  return `WBS - ${a.customerName || ""}${detail ? ` (${detail})` : ""}`;
}

function safeFilePart(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_") || "WBS";
}

function wbsFileName() {
  const a = state.answers;
  const date = formatDate(new Date()).replaceAll("-", "");
  const product = a.workType === "이기종 마이그레이션" ? a.targetDb || a.sourceDb : a.product;
  const topology = a.workType === "이기종 마이그레이션" ? "이기종마이그레이션" : a.topology;
  const parts = [a.customerName, product, topology, date].map(safeFilePart).filter(Boolean);
  return `${parts.join("_")}.xlsx`;
}

function wbsPhaseParts(phase) {
  const text = String(phase || "").replace(/^\s*\d+\.\s*/, "").trim();
  if (state.answers.workType === "이기종 마이그레이션") {
    return { groupTitle: text || "마이그레이션", label: text || "작업" };
  }
  const envMatch = text.match(/^(DEV|STG|PRD)\s+(.+)$/);
  if (envMatch) return { groupTitle: envMatch[1], label: envMatch[2] };
  const bracketMatch = text.match(/\[(DEV|STG|PRD)\]/);
  return { groupTitle: bracketMatch?.[1] || "공통", label: text.replace(/\[(DEV|STG|PRD)\]\s*/g, "") || "작업" };
}

function groupedWbsForExcel() {
  const groups = [];
  state.wbs.forEach((row, index) => {
    const parts = wbsPhaseParts(row.phase);
    let group = groups.find((item) => item.groupTitle === parts.groupTitle);
    if (!group) {
      group = { groupTitle: parts.groupTitle, rows: [] };
      groups.push(group);
    }
    group.rows.push({ ...row, phaseLabel: parts.label, index });
  });
  return groups;
}

function xmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[char]));
}

function excelColumn(index) {
  let name = "";
  let value = index;
  while (value > 0) {
    const mod = (value - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    value = Math.floor((value - mod) / 26);
  }
  return name;
}

function excelCell(row, column, value, style = 0) {
  const ref = `${excelColumn(column)}${row}`;
  const styleAttr = style ? ` s="${style}"` : "";
  return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t>${xmlEscape(value)}</t></is></c>`;
}

function wbsSheetXml() {
  const headers = ["단계", "Activities", "시작일", "완료일", "기간(일)", "담당자", "산출물", "비고"];
  const rows = [];
  const merges = [];
  let rowIndex = 1;

  rows.push(`<row r="${rowIndex}" ht="22" customHeight="1">${excelCell(rowIndex, 1, excelTitle(), 1)}</row>`);
  merges.push(`A${rowIndex}:H${rowIndex}`);
  rowIndex += 1;

  rows.push(`<row r="${rowIndex}">${headers.map((header, index) => excelCell(rowIndex, index + 1, header, 2)).join("")}</row>`);
  rowIndex += 1;

  groupedWbsForExcel().forEach((group) => {
    rows.push(`<row r="${rowIndex}">${excelCell(rowIndex, 1, group.groupTitle, 3)}</row>`);
    merges.push(`A${rowIndex}:H${rowIndex}`);
    rowIndex += 1;

    group.rows.forEach((item, index) => {
      rows.push(`<row r="${rowIndex}">
        ${excelCell(rowIndex, 1, index + 1, 4)}
        ${excelCell(rowIndex, 2, item.activity, 5)}
        ${excelCell(rowIndex, 3, item.start, 4)}
        ${excelCell(rowIndex, 4, item.end, 4)}
        ${excelCell(rowIndex, 5, item.duration, 4)}
        ${excelCell(rowIndex, 6, item.owner, 4)}
        ${excelCell(rowIndex, 7, item.output || "", 4)}
        ${excelCell(rowIndex, 8, "", 4)}
      </row>`);
      rowIndex += 1;
    });
  });

  const mergeXml = merges.length
    ? `<mergeCells count="${merges.length}">${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:H${Math.max(1, rowIndex - 1)}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="16" customWidth="1"/>
    <col min="2" max="2" width="38" customWidth="1"/>
    <col min="3" max="4" width="14" customWidth="1"/>
    <col min="5" max="5" width="10" customWidth="1"/>
    <col min="6" max="7" width="16" customWidth="1"/>
    <col min="8" max="8" width="14" customWidth="1"/>
  </cols>
  <sheetData>${rows.join("")}</sheetData>
  ${mergeXml}
</worksheet>`;
}

function xlsxStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><name val="Malgun Gothic"/></font>
    <font><b/><sz val="14"/><name val="Malgun Gothic"/></font>
    <font><b/><sz val="10"/><name val="Malgun Gothic"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEDEDED"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF666666"/></left>
      <right style="thin"><color rgb="FF666666"/></right>
      <top style="thin"><color rgb="FF666666"/></top>
      <bottom style="thin"><color rgb="FF666666"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function crc32(bytes) {
  if (!crc32.table) {
    crc32.table = Array.from({ length: 256 }, (_, index) => {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      return value >>> 0;
    });
  }
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crc32.table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function uint16(value) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function uint32(value) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const now = dosDateTime();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50), ...uint16(20), ...uint16(0), ...uint16(0), ...uint16(now.time), ...uint16(now.day),
      ...uint32(crc), ...uint32(dataBytes.length), ...uint32(dataBytes.length), ...uint16(nameBytes.length), ...uint16(0),
    ]);
    localParts.push(localHeader, nameBytes, dataBytes);

    const centralHeader = new Uint8Array([
      ...uint32(0x02014b50), ...uint16(20), ...uint16(20), ...uint16(0), ...uint16(0), ...uint16(now.time), ...uint16(now.day),
      ...uint32(crc), ...uint32(dataBytes.length), ...uint32(dataBytes.length), ...uint16(nameBytes.length), ...uint16(0),
      ...uint16(0), ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(offset),
    ]);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array([
    ...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(files.length), ...uint16(files.length),
    ...uint32(centralSize), ...uint32(offset), ...uint16(0),
  ]);
  const parts = [...localParts, ...centralParts, end];
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const zip = new Uint8Array(total);
  let cursor = 0;
  parts.forEach((part) => {
    zip.set(part, cursor);
    cursor += part.length;
  });
  return zip;
}

function buildWbsXlsxBlob() {
  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="WBS" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: "xl/styles.xml", content: xlsxStylesXml() },
    { name: "xl/worksheets/sheet1.xml", content: wbsSheetXml() },
  ];

  return new Blob([makeZip(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

el.freeTextForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const q = getQuestion(state.currentQuestionId);
  if (!q || q.type !== "text") return;
  handleAnswer(el.freeTextInput.value, state.currentQuestionId);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

document.querySelectorAll(".review-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".review-tab").forEach((item) => item.classList.toggle("is-active", item === tab));
    document.querySelectorAll(".review-pane").forEach((pane) => pane.classList.toggle("is-active", pane.id === tab.dataset.reviewView));
  });
});

function insertEstimateAfter(index) {
  const source = state.estimates[index] || state.estimates[state.estimates.length - 1];
  const insertAt = Number.isInteger(index) ? index + 1 : state.estimates.length;
  state.estimates.splice(insertAt, 0, {
    phase: source?.phase || "추가 항목",
    task: "",
    days: 0,
    note: state.answers.workType === "이기종 마이그레이션" ? source?.note || "" : "",
  });
  renderEstimateRows();
  syncDerivedFromEstimates();
}

document.getElementById("addLineButton").addEventListener("click", () => {
  insertEstimateAfter(state.estimates.length - 1);
});

document.getElementById("addWbsButton").addEventListener("click", () => {
  state.wbs.push({ phase: "추가 단계", activity: "", start: formatDate(new Date()), end: formatDate(new Date()), duration: 0, owner: "락플레이스", output: "", note: "" });
  renderWbsRows();
});

document.getElementById("applyWbsStartButton").addEventListener("click", recalculateWbsScheduleFromStart);

el.wbsStartDate?.addEventListener("change", recalculateWbsScheduleFromStart);

document.getElementById("refreshMailButton").addEventListener("click", () => {
  state.mailText = buildMailText();
  el.mailEditor.value = state.mailText;
  updateOutput();
});

el.resetEstimateButton?.addEventListener("click", () => {
  openResetModal();
});

el.cancelResetButton?.addEventListener("click", closeResetModal);

el.confirmResetButton?.addEventListener("click", () => {
  closeResetModal();
  resetEstimate();
});

el.resetModal?.addEventListener("click", (event) => {
  if (event.target === el.resetModal) closeResetModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && el.resetModal?.classList.contains("is-open")) {
    closeResetModal();
  }
});

el.estimateRows.addEventListener("input", (event) => {
  const index = event.target.dataset.estimate;
  const field = event.target.dataset.field;
  if (index === undefined || !field) return;
  state.estimates[Number(index)][field] = field === "days" ? Number(event.target.value || 0) : event.target.value;
  if (field === "days") updateEstimateGroupSubtotals();
  syncDerivedFromEstimates();
});

el.estimateRows.addEventListener("change", (event) => {
  if (event.target.dataset.field !== "phase") return;
  renderEstimateRows();
});

el.estimateRows.addEventListener("click", (event) => {
  const insertIndex = event.target.dataset.insertAfter;
  if (insertIndex !== undefined) {
    insertEstimateAfter(Number(insertIndex));
    return;
  }
  const index = event.target.dataset.deleteEstimate;
  if (index === undefined) return;
  state.estimates.splice(Number(index), 1);
  renderEstimateRows();
  syncDerivedFromEstimates();
});

el.wbsRows.addEventListener("input", (event) => {
  const index = event.target.dataset.wbs;
  const field = event.target.dataset.field;
  if (index === undefined || !field) return;
  state.wbs[Number(index)][field] = field === "duration" ? Number(event.target.value || 0) : event.target.value;
});

el.wbsRows.addEventListener("click", (event) => {
  const index = event.target.dataset.deleteWbs;
  if (index === undefined) return;
  state.wbs.splice(Number(index), 1);
  renderWbsRows();
});

el.mailEditor.addEventListener("input", updateOutput);

document.getElementById("copyMailButton").addEventListener("click", async () => {
  updateOutput();
  await copyTextToClipboard(el.mailPreview.textContent);
  showCopyToast("클립보드에 복사되었습니다");
});

document.getElementById("downloadWbsButton").addEventListener("click", () => {
  downloadBlob(wbsFileName(), buildWbsXlsxBlob());
});

ask("customerName");
