// The default trackers (only used the very first time the plugin runs)
const DEFAULT_TRACKERS = [
    {
        id: "emotions", label: "Emotions", icon: "😊", question: "How are you feeling today?", type: "select",
        options: ["😄 Happy", "🙂 Good", "😐 Neutral", "😔 Sad", "😠 Angry", "😰 Anxious"],
        rules: [
            { op: "includes", val: "Happy", color: "#10b981" },
            { op: "includes", val: "Good", color: "#10b981" },
            { op: "includes", val: "Sad", color: "#ef4444" },
            { op: "includes", val: "Angry", color: "#ef4444" },
            { op: "includes", val: "Anxious", color: "#ef4444" }
        ]
    },
{
    id: "sleep_score", label: "Hours of Sleep", icon: "🛌", question: "Hours of sleep?", type: "number", placeholder: "e.g. 8",
    rules: [
        { op: "<", val: "6", color: "#ef4444" }, // Red
        { op: ">=", val: "8", color: "#10b981" } // Green
    ]
},
{
    id: "energy", label: "Energy", icon: "⚡", question: "Energy level (1-10)?", type: "number", placeholder: "1-10",
    rules: [
        { op: "<=", val: "3", color: "#ef4444" },
        { op: ">=", val: "8", color: "#10b981" }
    ]
},
{
    id: "pain", label: "Pain", icon: "🤕", question: "Pain level (0-10)?", type: "number", placeholder: "0-10",
    rules: [
        { op: ">=", val: "5", color: "#ef4444" },
        { op: "<=", val: "2", color: "#10b981" }
    ]
},
{
    id: "meds", label: "Meds", icon: "💊", question: "Did you take your meds?", type: "select",
    options: ["Yes", "No"],
    rules: [
        { op: "==", val: "No", color: "#ef4444" },
        { op: "==", val: "Yes", color: "#10b981" }
    ]
}
];

// Helper to get the current trackers (custom or default)
function getActiveTrackers() {
    let trackers = selah.settings.get("trackers", DEFAULT_TRACKERS);
    let changed = false;

    // Auto-migrate old trackers to have an empty rules array if they don't have one
    trackers = trackers.map(t => {
        if (!t.rules) {
            changed = true;
            let defaultRules = [];
            // Try to find if this was a default tracker to give it its rules back
            const original = DEFAULT_TRACKERS.find(dt => dt.id === t.id);
            if (original && original.rules) {
                defaultRules = original.rules;
            }
            return { ...t, rules: defaultRules };
        }
        return t;
    });

    if (changed) selah.settings.set("trackers", trackers);
    return trackers;
}

// Function to evaluate rules and get the matching color
function getRuleColor(tracker, value) {
    if (!tracker || !tracker.rules || tracker.rules.length === 0) return null;
    const v = String(value).toLowerCase();
    const numVal = parseFloat(v);

    for (const rule of tracker.rules) {
        const ruleVal = String(rule.val).toLowerCase();
        const ruleNum = parseFloat(ruleVal);

        if (rule.op === "==" && v === ruleVal) return rule.color;
        if (rule.op === "!=" && v !== ruleVal) return rule.color;
        if (rule.op === "includes" && v.includes(ruleVal)) return rule.color;

        if (!isNaN(numVal) && !isNaN(ruleNum)) {
            if (rule.op === "<" && numVal < ruleNum) return rule.color;
            if (rule.op === "<=" && numVal <= ruleNum) return rule.color;
            if (rule.op === ">" && numVal > ruleNum) return rule.color;
            if (rule.op === ">=" && numVal >= ruleNum) return rule.color;
        }
    }
    return null;
}

// 1. Register Plugin Configuration
selah.registerConfiguration((container) => {
    let editingId = null;
    let selectedIcon = "📊";
    let outsideClickListener = null;
    let currentRules = []; // Holds the rules for the form currently being edited

    const renderConfig = () => {
        const trackers = getActiveTrackers();

        container.innerHTML = `
        <style>
        .cfg-input { width: 100%; background: var(--c-bg); border: 1px solid var(--c-border); color: var(--c-text); padding: 6px 10px; border-radius: 6px; outline: none; font-size: 13px; margin-bottom: 8px; }
        .cfg-input:focus { border-color: #3b82f6; }
        .cfg-btn { padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; background: #3b82f6; color: white; }
        .cfg-btn:hover { background: #2563eb; }
        .cfg-btn-cancel { background: var(--c-surface-alt); color: var(--c-text); border: 1px solid var(--c-border); }
        .cfg-btn-cancel:hover { background: var(--c-border); }

        .cfg-row {
            display: flex; justify-content: space-between; align-items: center;
            background: var(--c-surface); padding: 8px 12px; border-radius: 6px;
            border: 1px solid var(--c-border); margin-bottom: 6px;
            cursor: grab; transition: opacity 0.15s, border-color 0.15s, background 0.15s;
        }
        .cfg-row:active { cursor: grabbing; }
        .cfg-row.dragging { opacity: 0.4; border-style: dashed; }
        .cfg-row.drag-over { border-color: #3b82f6; background: var(--c-surface-alt); border-style: dashed; }

        .cfg-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .cfg-edit { color: #3b82f6; }
        .cfg-edit:hover { background: rgba(59, 130, 246, 0.1); }
        .cfg-del { color: #ef4444; }
        .cfg-del:hover { background: rgba(239, 68, 68, 0.1); }
        .cfg-section { margin-bottom: 20px; }
        .cfg-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-text-muted); margin-bottom: 8px; font-weight: 700; }

        /* Rules Builder Styles */
        .rule-row { display: flex; gap: 4px; margin-bottom: 6px; align-items: center; background: var(--c-surface); padding: 4px; border-radius: 6px; border: 1px solid var(--c-border); }
        .rule-row select, .rule-row input[type="text"] { padding: 4px 6px; font-size: 12px; background: var(--c-bg); border: 1px solid var(--c-border); color: var(--c-text); border-radius: 4px; outline: none; }
        .rule-row select { width: 80px; }
        .rule-row input[type="text"] { flex: 1; min-width: 40px; }
        .rule-row input[type="color"] { width: 24px; height: 24px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: none; }
        .rule-del { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .rule-del:hover { background: rgba(239, 68, 68, 0.1); }
        </style>

        <div class="cfg-section">
        <div class="cfg-title">Current Trackers (Drag to reorder)</div>
        <div id="tracker-list"></div>
        </div>

        <div class="cfg-section" style="border-top: 1px solid var(--c-border); padding-top: 16px;">
        <div class="cfg-title" id="form-title">Add New Tracker</div>
        <div style="display: grid; grid-template-columns: 1fr 50px; gap: 8px; margin-bottom: 8px;">
        <input type="text" id="new-label" class="cfg-input" placeholder="Name (e.g., Caffeine)" style="margin:0;" />

        <div>
        <button id="btn-emoji" class="cfg-input" style="margin:0; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Pick an emoji">📊</button>
        </div>
        </div>
        <input type="text" id="new-question" class="cfg-input" placeholder="Question to ask (e.g., How many cups?)" />
        <select id="new-type" class="cfg-input">
        <option value="number">Number Input</option>
        <option value="text">Text Input</option>
        <option value="select">Dropdown Menu</option>
        </select>
        <input type="text" id="new-options" class="cfg-input" placeholder="Dropdown options (comma separated, e.g., 1, 2, 3)" style="display: none;" />

        <div style="margin-top: 12px; margin-bottom: 12px;">
        <div class="cfg-title" style="margin-bottom: 4px;">Conditional Formatting (Color Rules)</div>
        <div id="rules-list"></div>
        <button id="btn-add-rule" style="background: none; border: 1px dashed var(--c-border); color: var(--c-text-muted); padding: 6px; border-radius: 6px; width: 100%; cursor: pointer; font-size: 12px; font-weight: 600;">+ Add Color Rule</button>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 4px;">
        <button id="btn-cancel" class="cfg-btn cfg-btn-cancel" style="display:none;">Cancel</button>
        <button id="btn-save" class="cfg-btn" style="flex: 1;">+ Add Tracker</button>
        </div>
        </div>
        `;

        const list = container.querySelector("#tracker-list");
        const typeSelect = container.querySelector("#new-type");
        const optionsInput = container.querySelector("#new-options");
        const btnSave = container.querySelector("#btn-save");
        const btnCancel = container.querySelector("#btn-cancel");
        const formTitle = container.querySelector("#form-title");
        const rulesList = container.querySelector("#rules-list");

        const btnEmoji = container.querySelector("#btn-emoji");
        btnEmoji.textContent = selectedIcon;

        // Function to re-render the rules builder UI
        const renderRules = () => {
            rulesList.innerHTML = "";
            currentRules.forEach((rule, index) => {
                const row = document.createElement("div");
                row.className = "rule-row";
                row.innerHTML = `
                <select data-idx="${index}" class="rule-op">
                <option value="==">==</option>
                <option value="!=">!=</option>
                <option value="includes">includes</option>
                <option value="<"><</option>
                <option value="<="><=</option>
                <option value=">">></option>
                <option value=">=">>=</option>
                </select>
                <input type="text" data-idx="${index}" class="rule-val" placeholder="Value" />
                <input type="color" data-idx="${index}" class="rule-color" />
                <button class="rule-del" data-idx="${index}">✕</button>
                `;

                const opSelect = row.querySelector(".rule-op");
                const valInput = row.querySelector(".rule-val");
                const colorInput = row.querySelector(".rule-color");
                const delBtn = row.querySelector(".rule-del");

                opSelect.value = rule.op;
                valInput.value = rule.val;
                colorInput.value = rule.color || "#3b82f6";

                opSelect.onchange = (e) => { currentRules[index].op = e.target.value; };
                valInput.oninput = (e) => { currentRules[index].val = e.target.value; };
                colorInput.oninput = (e) => { currentRules[index].color = e.target.value; };
                delBtn.onclick = () => { currentRules.splice(index, 1); renderRules(); };

                rulesList.appendChild(row);
            });
        };

        container.querySelector("#btn-add-rule").onclick = () => {
            currentRules.push({ op: "<", val: "", color: "#10b981" });
            renderRules();
        };

        let currentBtnEmoji = null;

        // Floating Emoji Picker Logic
        const togglePicker = (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentBtnEmoji = e.currentTarget;

            let popover = document.getElementById("selah-global-emoji-picker");
            if (!popover) {
                popover = document.createElement("div");
                popover.id = "selah-global-emoji-picker";
                popover.style.cssText = `
                position: fixed; z-index: 9999999; display: none;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
                border-radius: 8px; width: 320px; height: 380px; overflow: hidden;
                `;
                document.body.appendChild(popover);

                const root = ReactDOM.createRoot(popover);
                root.render(
                    React.createElement(selah.EmojiPicker, {
                        theme: selah.currentEmojiTheme(),
                                        onEmojiClick: (emojiData) => {
                                            selectedIcon = emojiData.emoji;
                                            if (currentBtnEmoji) currentBtnEmoji.textContent = selectedIcon;
                                            popover.style.display = "none";
                                        }
                    })
                );
            }

            if (popover.style.display === "none" || !popover.style.display) {
                const rect = currentBtnEmoji.getBoundingClientRect();
                popover.style.top = `${rect.bottom + 4}px`;
                popover.style.left = `${Math.max(10, rect.right - 320)}px`;
                popover.style.display = "block";

                setTimeout(() => window.dispatchEvent(new Event("resize")), 10);
            } else {
                popover.style.display = "none";
            }
        };

        btnEmoji.onclick = togglePicker;

        if (outsideClickListener) document.removeEventListener("mousedown", outsideClickListener);
        outsideClickListener = (e) => {
            const popover = document.getElementById("selah-global-emoji-picker");
            if (popover && popover.style.display === "block") {
                if (!btnEmoji.contains(e.target) && !popover.contains(e.target)) {
                    popover.style.display = "none";
                }
            }
        };
        document.addEventListener("mousedown", outsideClickListener);

        typeSelect.onchange = (e) => {
            optionsInput.style.display = e.target.value === "select" ? "block" : "none";
        };

        trackers.forEach((t, index) => {
            const row = document.createElement("div");
            row.className = "cfg-row";
            row.draggable = true;
            row.dataset.index = index;

            row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; font-size: 14px; pointer-events: none;">
            <span style="color: var(--c-text-muted); cursor: grab;">⠿</span>
            <span>${t.icon}</span> <span>${t.label}</span>
            </div>
            <div style="display:flex; gap: 4px;">
            <button class="cfg-icon-btn cfg-edit" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="cfg-icon-btn cfg-del" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            </div>
            `;

            row.addEventListener("dragstart", (e) => {
                row.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index);
            });
            row.addEventListener("dragend", () => {
                row.classList.remove("dragging");
                container.querySelectorAll(".cfg-row").forEach(r => r.classList.remove("drag-over"));
            });
            row.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                const draggedRow = container.querySelector(".dragging");
                if (draggedRow !== row) row.classList.add("drag-over");
            });
                row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
                row.addEventListener("drop", (e) => {
                    e.preventDefault();
                    row.classList.remove("drag-over");
                    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (fromIndex !== index) {
                        const next = [...trackers];
                        const [movedItem] = next.splice(fromIndex, 1);
                        next.splice(index, 0, movedItem);
                        selah.settings.set("trackers", next);
                        renderConfig();
                    }
                });

                row.querySelector(".cfg-del").onclick = () => {
                    const next = trackers.filter((_, i) => i !== index);
                    selah.settings.set("trackers", next);
                    if (editingId === t.id) editingId = null;
                    renderConfig();
                };

                row.querySelector(".cfg-edit").onclick = () => {
                    editingId = t.id;
                    renderConfig();
                };

                list.appendChild(row);
        });

        if (editingId) {
            const t = trackers.find(x => x.id === editingId);
            if (t) {
                formTitle.textContent = "Edit Tracker";
                container.querySelector("#new-label").value = t.label;
                container.querySelector("#new-question").value = t.question;
                typeSelect.value = t.type;

                selectedIcon = t.icon;
                btnEmoji.textContent = selectedIcon;

                if (t.type === "select" && t.options) {
                    optionsInput.value = t.options.join(", ");
                    optionsInput.style.display = "block";
                }

                currentRules = JSON.parse(JSON.stringify(t.rules || []));
                renderRules();

                btnSave.textContent = "Save Changes";
                btnCancel.style.display = "block";
                btnCancel.onclick = () => {
                    editingId = null;
                    renderConfig();
                };
            } else {
                editingId = null;
            }
        } else {
            currentRules = [];
            renderRules();
        }

        btnSave.onclick = () => {
            const label = container.querySelector("#new-label").value.trim();
            const question = container.querySelector("#new-question").value.trim();
            const type = typeSelect.value;
            const optionsRaw = optionsInput.value.trim();

            if (!label || !question) return alert("Please fill in at least the Name and Question.");

            let nextTrackers;

            if (editingId) {
                nextTrackers = trackers.map(x => {
                    if (x.id === editingId) {
                        const updated = { ...x, label, icon: selectedIcon, question, type, rules: currentRules };
                        if (type === "select") {
                            updated.options = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
                            if (updated.options.length === 0) updated.options = ["Yes", "No"];
                        } else {
                            delete updated.options;
                        }
                        return updated;
                    }
                    return x;
                });
                editingId = null;
            } else {
                const newTracker = { id: `custom_${Date.now()}`, label, icon: selectedIcon, question, type, rules: currentRules };
                if (type === "select") {
                    newTracker.options = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
                    if (newTracker.options.length === 0) newTracker.options = ["Yes", "No"];
                }
                nextTrackers = [...trackers, newTracker];
            }

            selectedIcon = "📊";
            selah.settings.set("trackers", nextTrackers);
            renderConfig();
        };
    };

    renderConfig();

    return () => {
        if (outsideClickListener) document.removeEventListener("mousedown", outsideClickListener);
        const popover = document.getElementById("selah-global-emoji-picker");
        if (popover) popover.remove();
    };
});

// 2. Register the Custom Block
selah.registerBlockSpec({
    type: "daily-stats",
    propSchema: { data: { default: "{}" } },
    toExternalHTML: (props) => {
        const div = document.createElement("div");
        div.setAttribute("data-daily-stats", props.block.props.data);
        return div;
    },
    parse: (element) => {
        if (element.hasAttribute("data-daily-stats")) {
            return { data: element.getAttribute("data-daily-stats") };
        }
        return undefined;
    },
    render: (props, React, createPortal) => {
        const { block, editor } = props;
        const data = JSON.parse(block.props.data || "{}");
        const [isEditing, setIsEditing] = React.useState(false);

        const [isEditable, setIsEditable] = React.useState(editor.isEditable);
        React.useEffect(() => {
            const interval = setInterval(() => {
                if (editor.isEditable !== isEditable) setIsEditable(editor.isEditable);
            }, 200);
                return () => clearInterval(interval);
        }, [editor, isEditable]);

        const trackers = getActiveTrackers();
        const entries = Object.entries(data).filter(([_, v]) => v);

        const blockContent = React.createElement("div", {
            className: "w-full my-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl shadow-sm overflow-hidden",
        }, [
            React.createElement("div", {
                key: "header",
                className: "relative flex items-center justify-center px-4 py-2 border-b border-[var(--c-border)] bg-[var(--c-surface-alt)]"
            }, [
                React.createElement("span", { key: "title", className: "font-bold text-sm text-[var(--c-text)]" }, "📊 Daily Stats"),
                isEditable && React.createElement("div", { key: "actions", className: "absolute right-4 flex items-center gap-3" }, [
                    React.createElement("button", {
                        key: "quick-log",
                        onClick: () => setIsEditing(true),
                        className: "text-xs font-bold px-2 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white transition-colors shadow-sm cursor-pointer",
                        title: "Quick Log"
                    }, "+ Log"),
                    React.createElement("button", {
                        key: "edit",
                        onClick: () => setIsEditing(true),
                        className: "text-xs flex items-center gap-1 text-[var(--c-text-muted)] hover:text-blue-400 transition-colors cursor-pointer"
                    }, "✏️ Edit")
                ])
            ]),
            React.createElement("div", { key: "grid", className: "p-4 grid grid-cols-2 md:grid-cols-3 gap-3" },
                                entries.length === 0
                                ? React.createElement("button", {
                                    key: "empty-state",
                                    onClick: () => { if (isEditable) setIsEditing(true); },
                                    className: "col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--c-border)] rounded-lg hover:border-blue-500/50 hover:bg-[var(--c-surface-alt)] transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-default",
                                    disabled: !isEditable
                                }, [
                                    React.createElement("span", { key: "icon", className: "text-3xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity" }, "📊"),
                                    React.createElement("span", { key: "text", className: "text-sm font-medium text-[var(--c-text-muted)] group-hover:text-blue-400 transition-colors" }, "Click to log today's stats")
                                ])
                                : entries.map(([key, value]) => {
                                    const trackerDef = trackers.find(t => t.id === key);

                                    // Fallback for deleted trackers
                                    const isDeleted = !trackerDef;
                                    const displayLabel = isDeleted ? "Deleted Tracker" : trackerDef.label;
                                    const displayIcon = isDeleted ? "❓" : trackerDef.icon;

                                    const customColor = trackerDef ? getRuleColor(trackerDef, value) : null;
                                    let defaultColor = isDeleted ? "var(--c-text-muted)" : "var(--c-text)";
                                    if (!customColor && trackerDef && trackerDef.icon === "⚡") defaultColor = "#f59e0b"; // Fallback energy color

                                    const finalColor = customColor || defaultColor;

                                    return React.createElement("div", {
                                        key: key,
                                        className: "flex flex-col bg-[var(--c-bg)] p-2 rounded-lg border border-[var(--c-border)]",
                                        title: isDeleted ? `Original ID: ${key}` : undefined
                                    }, [
                                        React.createElement("span", { key: "label", className: "text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] font-semibold" }, displayLabel),
                                                               React.createElement("span", { key: "val", className: "text-sm font-bold flex items-center gap-1.5", style: { color: finalColor } }, [
                                                                   React.createElement("span", { key: "icon" }, displayIcon),
                                                                                   String(value)
                                                               ])
                                    ]);
                                })
            )
        ]);

        // --- React Edit Modal ---
        const EditModal = () => {
            const trackers = getActiveTrackers();
            const [activeTrackerId, setActiveTrackerId] = React.useState(null);
            const [dropdownOpen, setDropdownOpen] = React.useState(false);
            const [localInput, setLocalInput] = React.useState("");

            React.useEffect(() => {
                if (activeTrackerId) {
                    setLocalInput(data[activeTrackerId] || "");
                }
            }, [activeTrackerId]);

            const handleSave = (id, val) => {
                if (data[id] === val) return;
                const newData = { ...data, [id]: val };
                editor.updateBlock(block, { props: { data: JSON.stringify(newData) } });
            };

            return React.createElement("div", { className: "fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" },
                                       React.createElement("div", { className: "bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" }, [
                                           React.createElement("div", { key: "header", className: "relative flex items-center justify-center px-4 py-3 border-b border-[var(--c-border)] bg-[var(--c-surface-alt)] flex-shrink-0" }, [
                                               React.createElement("h3", { key: "h", className: "font-bold text-[var(--c-text)] m-0" }, "📊 Daily Stats"),
                                                               React.createElement("button", { key: "x", onClick: () => setIsEditing(false), className: "absolute right-4 text-[var(--c-text-muted)] hover:text-[var(--c-text)] text-lg" }, "✕")
                                           ]),
                                           React.createElement("div", { key: "pills", className: "p-4 flex flex-wrap gap-2 overflow-y-auto border-b border-[var(--c-border)] flex-shrink-0" },
                                                               trackers.map(t => {
                                                                   const isFilled = !!data[t.id];
                                                                   const isActive = activeTrackerId === t.id;

                                                                   let stateClass = "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ";
                                                                   let stateStyle = {};

                                                                   if (isFilled) {
                                                                       stateStyle = { backgroundColor: "#10b981", color: "white", borderColor: "#059669" };
                                                                       stateClass += "hover:brightness-110 ";
                                                                   } else {
                                                                       stateClass += "border-dashed border-[var(--c-border)] text-[var(--c-text)] hover:border-solid hover:border-[var(--c-text-muted)] hover:bg-[var(--c-surface-alt)] ";
                                                                   }

                                                                   if (isActive) {
                                                                       stateClass += "ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--c-surface)] ";
                                                                       if (!isFilled) stateStyle = { borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
                                                                   }

                                                                   return React.createElement("button", {
                                                                       key: t.id,
                                                                       onClick: () => { setActiveTrackerId(t.id); setDropdownOpen(false); },
                                                                                              className: stateClass,
                                                                                              style: stateStyle,
                                                                                              title: isFilled ? `Value: ${data[t.id]}` : "Not logged yet"
                                                                   }, [
                                                                       React.createElement("span", { key: "icon", className: "text-sm" }, t.icon),
                                                                                              React.createElement("span", { key: "label" }, t.label)
                                                                   ]);
                                                               })
                                           ),
                                           React.createElement("div", { key: "detail", className: `p-4 flex-1 ${activeTrackerId ? "block" : "hidden"}` },
                                                               activeTrackerId && (() => {
                                                                   const t = trackers.find(x => x.id === activeTrackerId);
                                                                   if (!t) return null;
                                                                   const val = data[t.id] || "";

                                                                   return React.createElement("div", { className: "flex flex-col gap-2" }, [
                                                                       React.createElement("h4", { key: "q", className: "font-bold text-sm text-[var(--c-text)] m-0" }, `${t.icon} ${t.question}`),
                                                                                              React.createElement("p", { key: "sub", className: "text-xs text-[var(--c-text-muted)] m-0 mb-2" }, t.label),

                                                                                              t.type === "select" ? React.createElement("div", { key: "select", className: "relative" }, [
                                                                                                  React.createElement("div", {
                                                                                                      key: "btn",
                                                                                                      className: "w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md px-3 py-2 text-sm text-[var(--c-text)] flex justify-between items-center cursor-pointer hover:border-[var(--c-text-muted)] transition-colors",
                                                                                                                      onClick: () => setDropdownOpen(!dropdownOpen)
                                                                                                  }, [
                                                                                                      React.createElement("span", { key: "v" }, val || "Select..."),
                                                                                                                      React.createElement("svg", { key: "i", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { d: "M6 9l6 6 6-6" }))
                                                                                                  ]),
                                                                                                  dropdownOpen && React.createElement("div", {
                                                                                                      key: "menu",
                                                                                                      className: "absolute z-50 w-full mt-1 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-md shadow-lg max-h-40 overflow-y-auto"
                                                                                                  }, t.options.map(opt => React.createElement("div", {
                                                                                                      key: opt,
                                                                                                      className: "px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-surface-alt)] cursor-pointer",
                                                                                                                                              onClick: () => { handleSave(t.id, opt); setDropdownOpen(false); }
                                                                                                  }, opt)))
                                                                                              ]) : React.createElement("input", {
                                                                                                  key: "input",
                                                                                                  type: t.type || "text",
                                                                                                  placeholder: t.placeholder,
                                                                                                  value: localInput,
                                                                                                  onChange: (e) => setLocalInput(e.target.value),
                                                                                                                       onBlur: () => handleSave(t.id, localInput),
                                                                                                                       onKeyDown: (e) => { if (e.key === "Enter") handleSave(t.id, localInput); },
                                                                                                                       className: "w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md px-3 py-2 text-sm text-[var(--c-text)] outline-none focus:border-blue-500 transition-colors"
                                                                                              })
                                                                   ]);
                                                               })()
                                           ),
                                           React.createElement("div", { key: "footer", className: "p-3 border-t border-[var(--c-border)] bg-[var(--c-surface-alt)] flex justify-end flex-shrink-0" },
                                                               React.createElement("button", {
                                                                   onClick: () => {
                                                                       if (activeTrackerId) handleSave(activeTrackerId, localInput);
                                                                       setIsEditing(false);
                                                                   },
                                                                   className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-semibold transition-colors"
                                                               }, "Done")
                                           )
                                       ])
            );
        };

        const modal = isEditable && isEditing && createPortal(React.createElement(EditModal), document.body);
        return React.createElement(React.Fragment, null, blockContent, modal);
    }
});

// 3. Register the Slash Menu Item
selah.registerSlashItem({
    title: "Daily Stats Tracker",
    icon: "📊",
    aliases: ["stats", "log", "tracker"],
    run: async (editor) => {
        let targetBlockId = null;
        try { targetBlockId = editor.getTextCursorPosition()?.block?.id; } catch (e) {}

        const overlay = document.createElement("div");
        overlay.className = "selah-stats-overlay";
        overlay.innerHTML = `
        <style>
        .selah-stats-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; font-family: 'Inter', sans-serif; }
        .selah-stats-modal { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px; width: 100%; max-width: 600px; padding: 2rem; color: var(--c-text); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; }

        .selah-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }

        .selah-input { flex: 1; background: var(--c-bg); border: 1px solid var(--c-border); color: var(--c-text); padding: 0.6rem 1rem; border-radius: 8px; outline: none; font-size: 0.9rem; width: 100%; transition: border-color 0.15s; }
        .selah-input:focus { border-color: #3b82f6; }

        .custom-select-btn { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
        .custom-select-btn:hover { border-color: var(--c-text-muted); }
        .custom-select-menu { position: absolute; top: 100%; left: 0; width: 100%; margin-top: 4px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 100; max-height: 200px; overflow-y: auto; }
        .custom-select-option { padding: 0.5rem 1rem; font-size: 0.9rem; color: var(--c-text); cursor: pointer; }
        .custom-select-option:hover { background: var(--c-surface-alt); }

        .selah-actions { display: flex; justify-content: space-between; margin-top: 1rem; }
        .selah-btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: background 0.15s; }
        .selah-btn-save { background: #10b981; color: white; }
        .selah-btn-save:hover { background: #059669; }
        </style>
        <div class="selah-stats-modal">
        <div style="position:relative; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:800; font-size:1.2rem; margin:0;">📊 Daily Stats</h2>
        <button id="close" style="position:absolute; right:0; background:none;border:none;color:var(--c-text-muted);font-size:1.5rem;cursor:pointer;transition:color 0.15s;" onmouseover="this.style.color='var(--c-text)'" onmouseout="this.style.color='var(--c-text-muted)'">×</button>
        </div>
        <div class="selah-pills" id="pills"></div>
        <div id="detail" style="display:none; border-top: 1px solid var(--c-border); padding-top: 1.2rem;">
        <h3 id="q-title" style="font-weight:700; font-size:1rem; margin-bottom:0.2rem;"></h3>
        <p id="q-sub" style="font-size:0.8rem; color:var(--c-text-muted); margin-bottom:1rem;"></p>
        <div id="input-container" style="position:relative; display:flex; gap:0.5rem; margin-bottom:1rem;"></div>
        </div>
        <div class="selah-actions">
        <button class="selah-btn selah-btn-save" id="save">Insert into Note</button>
        </div>
        </div>`;
        document.body.appendChild(overlay);

        const TRACKERS = getActiveTrackers();
        let activeTrackerId = null;
        let trackerData = {};

        const pillsContainer = overlay.querySelector("#pills");
        const detailPanel = overlay.querySelector("#detail");
        const qTitle = overlay.querySelector("#q-title");
        const qSub = overlay.querySelector("#q-sub");
        const inputContainer = overlay.querySelector("#input-container");

        function renderPills() {
            pillsContainer.innerHTML = "";
            TRACKERS.forEach(t => {
                const data = trackerData[t.id];
                const isActive = activeTrackerId === t.id;
                const isFilled = data && data.filled;
                const pill = document.createElement("button");

                let css = "display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; font-family: inherit; ";

                if (isFilled) {
                    css += "background-color: #10b981; color: white; border: 1px solid #059669; ";
                } else {
                    css += "background: transparent; border: 1px dashed var(--c-border-light); color: var(--c-text); ";
                }

                if (isActive) {
                    css += "box-shadow: 0 0 0 2px var(--c-surface), 0 0 0 4px #3b82f6; ";
                    if (!isFilled) {
                        css += "border-style: solid; border-color: #3b82f6; background-color: rgba(59,130,246,0.1); color: #3b82f6; ";
                    }
                } else if (!isFilled) {
                    css += "border-color: var(--c-border-light); ";
                }

                pill.style.cssText = css;
                pill.title = isFilled ? `Value: ${data.value}` : "Not logged yet";
                pill.innerHTML = `<span>${t.icon}</span> <span>${t.label}</span>`;
                pill.onclick = () => { activeTrackerId = t.id; renderPills(); updateDetailPanel(); };
                pillsContainer.appendChild(pill);
            });
        }

        function updateDetailPanel() {
            if (!activeTrackerId) { detailPanel.style.display = "none"; return; }
            detailPanel.style.display = "block";
            const tracker = TRACKERS.find(t => t.id === activeTrackerId);
            if (!tracker) return;

            qTitle.innerText = `${tracker.icon} ${tracker.question}`;
            qSub.innerText = tracker.label;

            inputContainer.innerHTML = "";

            if (tracker.type === "select") {
                const wrapper = document.createElement("div");
                wrapper.className = "w-full relative";

                const btn = document.createElement("div");
                btn.className = "selah-input custom-select-btn";
                btn.innerHTML = `<span>${trackerData[activeTrackerId]?.value || "Select an option..."}</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;

                const menu = document.createElement("div");
                menu.className = "custom-select-menu hidden";

                tracker.options.forEach(opt => {
                    const item = document.createElement("div");
                    item.className = "custom-select-option";
                    item.textContent = opt;
                    item.onclick = () => {
                        trackerData[activeTrackerId] = { filled: true, value: opt };
                        btn.querySelector('span').textContent = opt;
                        menu.classList.add("hidden");
                        renderPills();
                    };
                    menu.appendChild(item);
                });

                btn.onclick = (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
                    menu.classList.toggle("hidden");
                };
                document.addEventListener("click", () => menu.classList.add("hidden"), { once: true });

                wrapper.appendChild(btn);
                wrapper.appendChild(menu);
                inputContainer.appendChild(wrapper);
            } else {
                const newInput = document.createElement("input");
                newInput.type = tracker.type || "text";
                newInput.className = "selah-input";
                newInput.placeholder = tracker.placeholder || "Type answer...";
                newInput.value = trackerData[activeTrackerId]?.value || "";
                newInput.id = "stat-input";

                if (tracker.type === "number") {
                    if (tracker.id === "pain") { newInput.min = "0"; newInput.max = "10"; } else { newInput.min = "1"; newInput.max = "10"; }
                }

                newInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        saveCurrentAndAdvance();
                    }
                });

                newInput.addEventListener("blur", () => {
                    const val = newInput.value.trim();
                    if (val && trackerData[activeTrackerId]?.value !== val) {
                        trackerData[activeTrackerId] = { filled: true, value: val };
                        renderPills();
                    }
                });

                inputContainer.appendChild(newInput);
                setTimeout(() => newInput.focus(), 50);
            }
        }

        function saveCurrentAndAdvance() {
            if (!activeTrackerId) return;
            const inputEl = overlay.querySelector("#stat-input");
            if (inputEl) {
                const val = inputEl.value.trim();
                if (val) trackerData[activeTrackerId] = { filled: true, value: val };
            }

            const currentIndex = TRACKERS.findIndex(t => t.id === activeTrackerId);
            let nextTracker = null;
            for (let i = 1; i <= TRACKERS.length; i++) {
                const t = TRACKERS[(currentIndex + i) % TRACKERS.length];
                if (!trackerData[t.id]?.filled) { nextTracker = t; break; }
            }
            activeTrackerId = nextTracker ? nextTracker.id : null;
            renderPills();
            updateDetailPanel();
        }

        overlay.querySelector("#save").onclick = async () => {
            const finalData = {};
            TRACKERS.forEach(t => {
                if (trackerData[t.id] && trackerData[t.id].filled) {
                    finalData[t.id] = trackerData[t.id].value;
                }
            });

            if (Object.keys(finalData).length > 0) {
                const statsBlock = {
                    type: "daily-stats",
                    props: { data: JSON.stringify(finalData) }
                };

                try {
                    if (targetBlockId) {
                        const targetBlock = editor.getBlock(targetBlockId);
                        if (targetBlock) editor.insertBlocks([statsBlock], targetBlock, "after");
                    } else {
                        const lastBlock = editor.document[editor.document.length - 1];
                        editor.insertBlocks([statsBlock], lastBlock, "after");
                    }
                } catch (err) { console.error("Failed to insert stats:", err); }
            }
            overlay.remove();
        };

        overlay.querySelector("#close").onclick = () => overlay.remove();
        renderPills();
    }
});

// 4. Register the Stats Dashboard Category
selah.registerCategoryType({
    id: "stats-dashboard",
    label: "Stats Dashboard",
    icon: "📈",
    description: "Visualize your daily stats over time.",
    layout: "full",
    render: async (container, ctx) => {
        container.innerHTML = `
        <style>
        .dash-wrap { display: flex; flex-direction: column; height: 100%; width: 100%; background: var(--c-bg); color: var(--c-text); padding: 2rem; box-sizing: border-box; font-family: 'Inter', sans-serif; overflow-y: auto; }
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .dash-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
        .dash-select { background: var(--c-surface); border: 1px solid var(--c-border); color: var(--c-text); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; outline: none; cursor: pointer; }

        .chart-container { display: flex; align-items: flex-end; gap: 8px; height: 300px; padding-bottom: 2rem; border-bottom: 1px solid var(--c-border); overflow-x: auto; }
        .bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 40px; height: 100%; position: relative; }
        .bar-fill { width: 100%; background: #3b82f6; border-radius: 4px 4px 0 0; transition: height 0.3s ease, background 0.2s; min-height: 4px; position: relative; }
        .bar-fill:hover { background: #60a5fa; }
        .bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: bold; color: var(--c-text); opacity: 0; transition: opacity 0.2s; }
        .bar-col:hover .bar-val { opacity: 1; }
        .bar-label { position: absolute; bottom: -24px; font-size: 10px; color: var(--c-text-muted); white-space: nowrap; transform: rotate(-45deg); transform-origin: top left; }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--c-text-muted); }
        .loader { border: 3px solid var(--c-border); border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>

        <div class="dash-wrap">
        <div class="dash-header">
        <h1 class="dash-title">📈 Vault Trends</h1>
        <select id="stat-selector" class="dash-select" style="display: none;"></select>
        </div>
        <div id="chart-area" style="width: 100%; display: flex; flex-direction: column; margin-top: 2rem;">
        <div class="loader"></div>
        <div style="color: var(--c-text-muted);">Scanning your vault for stats...</div>
        </div>
        </div>
        `;

        const chartArea = container.querySelector("#chart-area");
        const selector = container.querySelector("#stat-selector");
        let currentObserver = null;

        // Recursive function to find all .selah files
        async function getAllSelahFiles(dir) {
            let files = [];
            const entries = await selah.listVaultDir(dir);
            for (const e of entries) {
                if (e.name.startsWith(".")) continue;
                const fullPath = dir + (dir.endsWith("/") || dir.endsWith("\\") ? "" : "/") + e.name;
                if (e.isDirectory) {
                    files = files.concat(await getAllSelahFiles(fullPath));
                } else if (e.name.endsWith(".selah")) {
                    files.push(fullPath);
                }
            }
            return files;
        }

        try {
            // 1. Get all notes
            const allFiles = await getAllSelahFiles(ctx.vaultPath);
            const allData = {}; // { trackerId: [ { date, value } ] }

            // 2. Parse each note for stats
            for (const file of allFiles) {
                const raw = await selah.readVaultText(file);
                if (!raw) continue;

                const match = raw.match(/<!--\s*selah-plugin:\s*(\{.*?\})\s*-->/s);
                if (match) {
                    try {
                        const blockData = JSON.parse(match[1]);
                        if (blockData.type !== "daily-stats") continue;

                        const stats = JSON.parse(blockData.props.data || "{}");

                        // Try to get date from filename (e.g., "November 5, 2026.selah")
                        const fileName = file.split(/[/\\]/).pop().replace(".selah", "");
                        let dateObj = new Date(fileName);
                        if (isNaN(dateObj.getTime())) {
                            // Fallback to frontmatter created date
                            const fmMatch = raw.match(/created:\s*([^\n]+)/);
                            if (fmMatch) dateObj = new Date(fmMatch[1].trim());
                        }

                        const displayDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : "Unknown";

                        const timeValue = isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();

                        // Add to data map
                        for (const [trackerId, value] of Object.entries(stats)) {
                            if (!allData[trackerId]) allData[trackerId] = [];
                            allData[trackerId].push({ date: displayDate, time: timeValue, value });
                        }
                    } catch (e) {
                        console.error("Failed to parse stat block", e);
                    }
                }
            }

            const trackerIds = Object.keys(allData);
            if (trackerIds.length === 0) {
                chartArea.innerHTML = `<div class="empty-state"><h2>No stats found</h2><p>Log some stats in your daily notes first!</p></div>`;
                return;
            }

            // 3. Setup Selector
            const trackers = getActiveTrackers();
            selector.style.display = "block";

            // Only show trackers that actually have data
            const availableTrackers = trackers.filter(t => trackerIds.includes(t.id));

            // If there are custom trackers not in current settings, add them
            trackerIds.forEach(id => {
                if (!availableTrackers.find(t => t.id === id)) {
                    availableTrackers.push({ id, label: id, icon: "📊" });
                }
            });

            selector.innerHTML = availableTrackers.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join("");

            // 4. Render Chart Function
            const renderChart = (trackerId) => {
                const tracker = availableTrackers.find(t => t.id === trackerId);
                let data = allData[trackerId] || [];

                // Sort by date
                data.sort((a, b) => a.time - b.time);
                // Take last 30 entries
                data = data.slice(-30);

                if (data.length === 0) {
                    chartArea.innerHTML = `<div class="empty-state">No data for this tracker.</div>`;
                    return;
                }

                const draw = () => {
                const rect = chartArea.getBoundingClientRect();
                const width = Math.max(rect.width, 500);
                const height = 500; // Fixed height to prevent vertical stretching on large screens

                const paddingX = 100;
                const paddingY = 60; // More padding for breathing room
                const graphWidth = width - paddingX - 40;
                const graphHeight = height - paddingY * 2;

                // 2. Figure out if we are graphing numbers or text (like Emotions)
                const numericValues = data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
                const isNumeric = numericValues.length > 0;

                let maxVal = 10;
                let minVal = 0;

                if (isNumeric) {
                    maxVal = Math.max(...numericValues, 1);
                    minVal = Math.min(...numericValues, 0);
                } else if (tracker && tracker.options) {
                    // If it's text (like Emotions), map them to the list of options
                    maxVal = tracker.options.length - 1;
                    minVal = 0;
                } else {
                    // Fallback for random text
                    maxVal = data.length > 1 ? data.length - 1 : 1;
                }

                const range = maxVal - minVal || 1;

                // 3. Calculate X/Y coordinates for each point
                const points = data.map((d, i) => {
                    const x = paddingX + (i / Math.max(1, data.length - 1)) * graphWidth;
                    let y = height - paddingY;

                    if (isNumeric) {
                        const num = parseFloat(d.value);
                        if (!isNaN(num)) {
                            y = height - paddingY - ((num - minVal) / range) * graphHeight;
                        }
                    } else if (tracker && tracker.options) {
                        // Find index of text (e.g., "😄 Happy" is index 0)
                        const idx = tracker.options.findIndex(opt => d.value.includes(opt) || opt.includes(d.value));
                        if (idx !== -1) {
                            // Invert the index so the first option (Happy) is at the top
                            const invertedIdx = tracker.options.length - 1 - idx;
                            y = height - paddingY - ((invertedIdx - minVal) / range) * graphHeight;
                        }
                    }

                    // Apply color rules to the dot
                    const dotColor = getRuleColor(tracker, d.value) || "#3b82f6";

                    return { x, y, raw: d, color: dotColor };
                });

                // 4. Build the SVG Path strings
                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

                // 5. Render the SVG Chart
                chartArea.innerHTML = `
                    <div style="width: 100%; height: 500px; display: flex; flex-direction: column; padding: 0;">
                        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
                            <!-- Grid Lines -->
                            <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="var(--c-border)" stroke-width="2" />
                            <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX}" y2="${height - paddingY}" stroke="var(--c-border)" stroke-width="2" />

                            <!-- Area Fill -->
                            <path d="${areaPath}" fill="rgba(59, 130, 246, 0.15)" />

                            <!-- The Line -->
                            <path d="${linePath}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                            <!-- Data Points (Circles) -->
                            ${points.map(p => `
                                <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--c-bg)" stroke="${p.color}" stroke-width="3" style="cursor: pointer;">
                                    <title>${p.raw.date}: ${p.raw.value}</title>
                                </circle>
                            `).join('')}

                            <!-- X-Axis Dates -->
                            ${points.filter((_, i) => data.length <= 10 || i % Math.ceil(data.length / 8) === 0).map(p => `
                                <text x="${p.x}" y="${height - paddingY + 20}" text-anchor="middle" font-size="11" fill="var(--c-text-muted)">${p.raw.date}</text>
                            `).join('')}

                            <!-- Y-Axis Grid and Labels -->
                            ${(() => {
                                let labels = [];
                                if (isNumeric) {
                                    const steps = 5;
                                    for (let i = 0; i < steps; i++) {
                                        const val = minVal + (range / (steps - 1)) * i;
                                        const y = height - paddingY - ((val - minVal) / range) * graphHeight;
                                        labels.push(`
                                            <line x1="${paddingX}" y1="${y}" x2="${width - 40}" y2="${y}" stroke="var(--c-border)" stroke-width="1" stroke-dasharray="4 4" opacity="0.5" />
                                            <text x="${paddingX - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--c-text-muted)">${Math.round(val * 10) / 10}</text>
                                        `);
                                    }
                                } else if (tracker && tracker.options) {
                                    tracker.options.forEach((opt, idx) => {
                                        // Invert the index for labels
                                        const invertedIdx = tracker.options.length - 1 - idx;
                                        const y = height - paddingY - ((invertedIdx - minVal) / range) * graphHeight;
                                        labels.push(`
                                            <line x1="${paddingX}" y1="${y}" x2="${width - 40}" y2="${y}" stroke="var(--c-border)" stroke-width="1" stroke-dasharray="4 4" opacity="0.5" />
                                            <text x="${paddingX - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--c-text-muted)">${opt}</text>
                                        `);
                                    });
                                }
                                return labels.join('');
                            })()}
                        </svg>
                    </div>
                `;
                };

                if (currentObserver) currentObserver.disconnect();
                currentObserver = new ResizeObserver(() => draw());
                currentObserver.observe(chartArea);
                draw();
            };

            selector.onchange = (e) => renderChart(e.target.value);
            renderChart(availableTrackers[0].id);

        } catch (err) {
            console.error(err);
            chartArea.innerHTML = `<div class="empty-state" style="color: red;">Error loading dashboard: ${err.message}</div>`;
        }

        return () => {
            // Do nothing. PluginView handles clearing the container.
        };
    }
});
